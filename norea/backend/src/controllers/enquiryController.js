import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { EnquiryModel } from '../models/enquiryModel.js';
import { ProgramModel } from '../models/programModel.js';
import { ActivityLogModel } from '../models/settingModel.js';
import { getPagination, paginated } from '../utils/helpers.js';

const STATUS_LABEL = { new: 'New', contacted: 'Contacted', follow_up: 'Follow-up', converted: 'Converted', closed: 'Closed' };

// POST /api/enquiries  (public)
export const createEnquiry = asyncHandler(async (req, res) => {
  const source = req.body.source === 'contact' ? 'contact' : 'admission';
  const program_id = req.body.program_id ? Number(req.body.program_id) : null;

  if (program_id) {
    const program = await ProgramModel.findById(program_id);
    if (!program || program.status !== 'active') {
      throw new ApiError(422, 'Please select a valid program.', { program_id: 'Please select a valid program.' });
    }
  }

  const duplicate = await EnquiryModel.findRecentDuplicate({
    email: req.body.email,
    program_id,
    source,
    message: req.body.message,
  });
  if (duplicate) {
    throw ApiError.conflict(
      source === 'contact'
        ? 'We have already received this message. Our team will be in touch shortly.'
        : 'You have already enquired about this program in the last 24 hours. Our admissions team will contact you soon.'
    );
  }

  const id = await EnquiryModel.create({
    ...req.body,
    program_id,
    source,
    learning_mode: source === 'contact' ? req.body.learning_mode || null : req.body.learning_mode,
    ip_address: req.ip,
  });

  res.status(201).json({
    success: true,
    message:
      source === 'contact'
        ? 'Thank you for reaching out. We will get back to you shortly.'
        : 'Thank you! Your enquiry has been received. Our admissions team will contact you shortly.',
    data: { id, reference: `NOR-${String(id).padStart(5, '0')}` },
  });
});

// GET /api/enquiries
export const listEnquiries = asyncHandler(async (req, res) => {
  const pg = getPagination(req.query);
  const { rows, total } = await EnquiryModel.list(req.query, pg);
  res.json({ success: true, ...paginated(rows, total, pg) });
});

// GET /api/enquiries/export  (CSV of current filters)
export const exportEnquiries = asyncHandler(async (req, res) => {
  const { rows } = await EnquiryModel.list(req.query, { limit: 10000, offset: 0 });
  const esc = (v) => {
    let s = v == null ? '' : String(v);
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; // CSV/formula-injection guard
    return `"${s.replace(/"/g, '""')}"`;
  };
  const header = ['Reference', 'Date', 'Name', 'Email', 'Phone', 'Program', 'Mode', 'Source', 'Status', 'Message'];
  const lines = rows.map((r) =>
    [
      `NOR-${String(r.id).padStart(5, '0')}`,
      new Date(r.created_at).toISOString(),
      r.full_name,
      r.email,
      r.phone,
      r.program_title,
      r.learning_mode,
      r.source,
      STATUS_LABEL[r.status],
      r.message,
    ]
      .map(esc)
      .join(',')
  );
  ActivityLogModel.log(req.user.id, 'enquiry.export', `Exported ${rows.length} enquiries`);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="norea-enquiries-${Date.now()}.csv"`);
  res.send(`\uFEFF${[header.join(','), ...lines].join('\r\n')}`);
});

// GET /api/enquiries/:id
export const getEnquiry = asyncHandler(async (req, res) => {
  const enquiry = await EnquiryModel.findById(req.params.id);
  if (!enquiry) throw ApiError.notFound('Enquiry not found.');
  res.json({ success: true, data: enquiry });
});

// PUT /api/enquiries/:id
export const updateEnquiry = asyncHandler(async (req, res) => {
  const enquiry = await EnquiryModel.findById(req.params.id);
  if (!enquiry) throw ApiError.notFound('Enquiry not found.');
  const { status, admin_notes } = req.body;
  await EnquiryModel.update(enquiry.id, { status, admin_notes });
  const changes = [];
  if (status && status !== enquiry.status) changes.push(`status → ${STATUS_LABEL[status]}`);
  if (admin_notes !== undefined && admin_notes !== enquiry.admin_notes) changes.push('notes updated');
  if (changes.length) {
    ActivityLogModel.log(req.user.id, 'enquiry.update', `Enquiry #${enquiry.id} (${enquiry.full_name}): ${changes.join(', ')}`);
  }
  res.json({ success: true, message: 'Enquiry updated.', data: await EnquiryModel.findById(enquiry.id) });
});

// DELETE /api/enquiries/:id
export const deleteEnquiry = asyncHandler(async (req, res) => {
  const enquiry = await EnquiryModel.findById(req.params.id);
  if (!enquiry) throw ApiError.notFound('Enquiry not found.');
  await EnquiryModel.remove(enquiry.id);
  ActivityLogModel.log(req.user.id, 'enquiry.delete', `Deleted enquiry #${enquiry.id} from ${enquiry.full_name}`);
  res.json({ success: true, message: 'Enquiry deleted.' });
});
