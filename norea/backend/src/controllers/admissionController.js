import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { withTransaction } from '../config/db.js';
import { AdmissionModel } from '../models/admissionModel.js';
import { ProgramModel } from '../models/programModel.js';
import { UserModel } from '../models/userModel.js';
import { EnquiryModel } from '../models/enquiryModel.js';
import { ActivityLogModel } from '../models/settingModel.js';
import { hasPermission } from '../middleware/auth.js';
import { createStudent } from '../services/authService.js';
import { getPagination, paginated } from '../utils/helpers.js';

const today = () => new Date().toISOString().slice(0, 10);

/**
 * POST /api/admissions
 *  • Student: applies for a program for themselves → status "pending".
 *  • Staff/Admin: creates an admission for an existing student (user_id),
 *    from an enquiry (enquiry_id), optionally creating the student account (new_student).
 */
export const createAdmission = asyncHandler(async (req, res) => {
  const { program_id, enquiry_id, notes } = req.body;
  const program = await ProgramModel.findById(program_id);
  if (!program) throw new ApiError(422, 'Please select a valid program.', { program_id: 'Invalid program.' });

  // ---- Student self-application ----
  if (req.user.role === 'student') {
    if (program.status !== 'active') throw ApiError.badRequest('This program is not currently accepting applications.');
    if (await AdmissionModel.findByUserProgram(req.user.id, program.id)) {
      throw ApiError.conflict('You have already applied for this program.');
    }
    // Link to the student's latest open enquiry for the same program, if any.
    const enquiries = await EnquiryModel.byEmail(req.user.email);
    const linked = enquiries.find((e) => e.program_id === program.id && e.status !== 'closed');
    const id = await AdmissionModel.create({ user_id: req.user.id, program_id: program.id, enquiry_id: linked?.id || null });
    return res.status(201).json({
      success: true,
      message: 'Your application has been submitted. You will be notified once it is reviewed.',
      data: await AdmissionModel.findById(id),
    });
  }

  // ---- Admin / staff ----
  if (!hasPermission(req.user, 'admissions:create')) throw ApiError.forbidden();
  let status = req.body.status || 'pending';
  if (status !== 'pending' && !hasPermission(req.user, 'admissions:decide')) status = 'pending';

  const id = await withTransaction(async (conn) => {
    let userId = req.body.user_id;
    if (!userId && req.body.new_student) {
      if (!hasPermission(req.user, 'students:manage')) throw ApiError.forbidden('You cannot create student accounts.');
      userId = await createStudent(req.body.new_student, conn);
    }
    if (!userId) throw new ApiError(422, 'Please choose a student.', { user_id: 'Please choose a student.' });

    const student = await UserModel.findById(userId);
    if (!student || student.role !== 'student') throw new ApiError(422, 'Selected user is not a student.');
    if (await AdmissionModel.findByUserProgram(userId, program.id)) {
      throw ApiError.conflict(`${student.full_name} already has an admission for ${program.title}.`);
    }

    const newId = await AdmissionModel.create(
      {
        user_id: userId,
        program_id: program.id,
        enquiry_id: enquiry_id || null,
        status,
        notes: notes || null,
        admission_date: status === 'approved' ? today() : null,
        reviewed_by: status !== 'pending' ? req.user.id : null,
      },
      conn
    );
    if (enquiry_id) await EnquiryModel.update(enquiry_id, { status: 'converted' }, conn);
    return newId;
  });

  const admission = await AdmissionModel.findById(id);
  ActivityLogModel.log(req.user.id, 'admission.create', `Created ${status} admission for ${admission.student_name} → ${admission.program_title}`);
  res.status(201).json({ success: true, message: 'Admission created.', data: admission });
});

// GET /api/admissions   (students see only their own)
export const listAdmissions = asyncHandler(async (req, res) => {
  const pg = getPagination(req.query);
  const filters = { ...req.query };
  if (req.user.role === 'student') filters.user_id = req.user.id;
  else if (!hasPermission(req.user, 'admissions:view')) throw ApiError.forbidden();
  const { rows, total } = await AdmissionModel.list(filters, pg);
  res.json({ success: true, ...paginated(rows, total, pg) });
});

// PUT /api/admissions/:id
export const updateAdmission = asyncHandler(async (req, res) => {
  const admission = await AdmissionModel.findById(req.params.id);
  if (!admission) throw ApiError.notFound('Admission not found.');
  const { status, admission_date, notes } = req.body;

  if (status && status !== admission.status && !hasPermission(req.user, 'admissions:decide')) {
    throw ApiError.forbidden('Only administrators can approve or reject admissions.');
  }

  const patch = { notes };
  if (admission_date !== undefined) patch.admission_date = admission_date;
  if (status && status !== admission.status) {
    patch.status = status;
    patch.reviewed_by = req.user.id;
    if (status === 'approved' && !admission.admission_date && !admission_date) patch.admission_date = today();
  }
  await AdmissionModel.update(admission.id, patch);

  if (status === 'approved' && admission.enquiry_id) {
    await EnquiryModel.update(admission.enquiry_id, { status: 'converted' });
  }
  if (patch.status) {
    ActivityLogModel.log(req.user.id, `admission.${status}`, `Admission #${admission.id}: ${admission.student_name} → ${admission.program_title} marked ${status}`);
  }
  res.json({ success: true, message: patch.status ? `Admission ${status}.` : 'Admission updated.', data: await AdmissionModel.findById(admission.id) });
});

// DELETE /api/admissions/:id
export const deleteAdmission = asyncHandler(async (req, res) => {
  const admission = await AdmissionModel.findById(req.params.id);
  if (!admission) throw ApiError.notFound('Admission not found.');
  await AdmissionModel.remove(admission.id);
  ActivityLogModel.log(req.user.id, 'admission.delete', `Deleted admission #${admission.id} (${admission.student_name})`);
  res.json({ success: true, message: 'Admission removed.' });
});
