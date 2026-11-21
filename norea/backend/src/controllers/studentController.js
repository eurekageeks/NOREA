import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { withTransaction } from '../config/db.js';
import { UserModel, ProfileModel } from '../models/userModel.js';
import { AdmissionModel } from '../models/admissionModel.js';
import { EnquiryModel } from '../models/enquiryModel.js';
import { ActivityLogModel } from '../models/settingModel.js';
import { createStudent, hashPassword } from '../services/authService.js';
import { getPagination, paginated } from '../utils/helpers.js';

const loadStudent = async (id) => {
  const user = await UserModel.findById(id);
  if (!user || user.role !== 'student') throw ApiError.notFound('Student not found.');
  return user;
};

// GET /api/students
export const listStudents = asyncHandler(async (req, res) => {
  const pg = getPagination(req.query);
  const { rows, total } = await UserModel.listStudents({ ...req.query, ...pg });
  res.json({ success: true, ...paginated(rows, total, pg) });
});

// POST /api/students
export const createStudentByAdmin = asyncHandler(async (req, res) => {
  const { full_name, email, phone, password, status, date_of_birth, address } = req.body;
  const id = await createStudent({ full_name, email, phone, password, status, profile: { date_of_birth, address } });
  ActivityLogModel.log(req.user.id, 'student.create', `Added student ${full_name} (${email})`);
  res.status(201).json({ success: true, message: 'Student account created.', data: await UserModel.findById(id) });
});

// GET /api/students/:id
export const getStudent = asyncHandler(async (req, res) => {
  const user = await loadStudent(req.params.id);
  const [profile, admissions, enquiries] = await Promise.all([
    ProfileModel.findByUser(user.id),
    AdmissionModel.byUser(user.id),
    EnquiryModel.byEmail(user.email),
  ]);
  res.json({ success: true, data: { ...user, profile, admissions, enquiries } });
});

// PUT /api/students/:id
export const updateStudent = asyncHandler(async (req, res) => {
  const user = await loadStudent(req.params.id);
  const { full_name, email, phone, status, password, date_of_birth, address } = req.body;

  if (email && email !== user.email) {
    const taken = await UserModel.findByEmail(email);
    if (taken) throw ApiError.conflict('Another account already uses this email.', { email: 'Email already in use.' });
  }

  await withTransaction(async (conn) => {
    const data = { full_name, email, phone: phone === '' ? null : phone, status };
    if (password) data.password_hash = await hashPassword(password);
    await UserModel.update(user.id, data, conn);
    await ProfileModel.upsert(user.id, { date_of_birth: date_of_birth === '' ? null : date_of_birth, address }, conn);
  });
  // Deactivation or password reset should end existing sessions.
  if ((status && status !== user.status) || password) await UserModel.bumpTokenVersion(user.id);

  ActivityLogModel.log(req.user.id, 'student.update', `Updated student ${full_name || user.full_name}${status && status !== user.status ? ` (status → ${status})` : ''}`);
  res.json({ success: true, message: 'Student updated.', data: await UserModel.findById(user.id) });
});

// DELETE /api/students/:id  (?mode=deactivate | delete)
export const deleteStudent = asyncHandler(async (req, res) => {
  const user = await loadStudent(req.params.id);
  if (req.query.mode === 'deactivate') {
    await UserModel.update(user.id, { status: 'inactive' });
    await UserModel.bumpTokenVersion(user.id);
    ActivityLogModel.log(req.user.id, 'student.deactivate', `Deactivated student ${user.full_name}`);
    return res.json({ success: true, message: 'Student deactivated.' });
  }
  await UserModel.remove(user.id);
  ActivityLogModel.log(req.user.id, 'student.delete', `Deleted student ${user.full_name} (${user.email})`);
  res.json({ success: true, message: 'Student permanently deleted.' });
});
