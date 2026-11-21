import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { ProgramModel } from '../models/programModel.js';
import { ActivityLogModel } from '../models/settingModel.js';
import { hasPermission } from '../middleware/auth.js';
import { slugify } from '../utils/helpers.js';
import { removeUpload } from '../middleware/upload.js';

const uniqueSlug = async (base, excludeId = 0) => {
  let slug = slugify(base) || 'program';
  let n = 2;
  const root = slug;
  while (await ProgramModel.slugExists(slug, excludeId)) slug = `${root}-${n++}`;
  return slug;
};

// GET /api/programs   (?all=1 for admins → include inactive/draft)
export const listPrograms = asyncHandler(async (req, res) => {
  const includeInactive = req.query.all === '1' && hasPermission(req.user, 'programs:manage');
  const programs = await ProgramModel.list({ includeInactive });
  res.json({ success: true, data: programs });
});

// GET /api/programs/:slug
export const getProgram = asyncHandler(async (req, res) => {
  const includeInactive = hasPermission(req.user, 'programs:manage');
  const program = /^\d+$/.test(req.params.slug) && includeInactive
    ? await ProgramModel.findById(Number(req.params.slug))
    : await ProgramModel.findBySlug(req.params.slug, { includeInactive });
  if (!program) throw ApiError.notFound('Program not found.');
  res.json({ success: true, data: program });
});

// POST /api/programs
export const createProgram = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  data.slug = await uniqueSlug(data.slug || data.title);
  const id = await ProgramModel.create(data);
  ActivityLogModel.log(req.user.id, 'program.create', `Created program "${data.title}"`);
  res.status(201).json({ success: true, message: 'Program created.', data: await ProgramModel.findById(id) });
});

// PUT /api/programs/:id
export const updateProgram = asyncHandler(async (req, res) => {
  const existing = await ProgramModel.findById(req.params.id);
  if (!existing) throw ApiError.notFound('Program not found.');
  const data = { ...req.body };
  if (data.slug && data.slug !== existing.slug) data.slug = await uniqueSlug(data.slug, existing.id);
  else delete data.slug;
  await ProgramModel.update(existing.id, data);
  if (data.image !== undefined && data.image !== existing.image) removeUpload(existing.image);
  ActivityLogModel.log(req.user.id, 'program.update', `Updated program "${data.title || existing.title}"`);
  res.json({ success: true, message: 'Program updated.', data: await ProgramModel.findById(existing.id) });
});

// DELETE /api/programs/:id
export const deleteProgram = asyncHandler(async (req, res) => {
  const existing = await ProgramModel.findById(req.params.id);
  if (!existing) throw ApiError.notFound('Program not found.');
  if ((await ProgramModel.admissionCount(existing.id)) > 0) {
    throw ApiError.conflict(
      'This program has admissions linked to it. Set its status to "Inactive" instead of deleting it.'
    );
  }
  await ProgramModel.remove(existing.id);
  removeUpload(existing.image);
  ActivityLogModel.log(req.user.id, 'program.delete', `Deleted program "${existing.title}"`);
  res.json({ success: true, message: 'Program deleted.' });
});
