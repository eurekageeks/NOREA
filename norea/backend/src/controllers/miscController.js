import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import env from '../config/env.js';
import { DashboardModel } from '../models/dashboardModel.js';
import { SettingModel, ActivityLogModel, SETTING_KEYS } from '../models/settingModel.js';
import { ProgramModel } from '../models/programModel.js';
import { UserModel, ProfileModel } from '../models/userModel.js';
import { AdmissionModel } from '../models/admissionModel.js';
import { EnquiryModel } from '../models/enquiryModel.js';
import { hashPassword } from '../services/authService.js';
import { getPagination, paginated } from '../utils/helpers.js';

// ========== Dashboard ==========
export const stats = asyncHandler(async (_req, res) => {
  res.json({ success: true, data: await DashboardModel.stats() });
});

export const enquiryAnalytics = asyncHandler(async (req, res) => {
  const months = Math.min(24, Math.max(3, parseInt(req.query.months, 10) || 12));
  res.json({ success: true, data: await DashboardModel.analytics({ months, date_from: req.query.date_from, date_to: req.query.date_to }) });
});

export const activityLogs = asyncHandler(async (req, res) => {
  const pg = getPagination(req.query, { defaultLimit: 20 });
  const { rows, total } = await ActivityLogModel.recent(pg);
  res.json({ success: true, ...paginated(rows, total, pg) });
});

// ========== Settings ==========
export const getSettings = asyncHandler(async (_req, res) => {
  res.json({ success: true, data: await SettingModel.all() });
});

export const updateSettings = asyncHandler(async (req, res) => {
  const incoming = req.body.settings || {};
  const entries = Object.entries(incoming)
    .filter(([k]) => SETTING_KEYS.includes(k))
    .map(([k, v]) => [k, v == null ? '' : String(v).trim()]);
  if (!entries.length) throw ApiError.badRequest('No valid settings supplied.');
  await SettingModel.upsertMany(entries);
  ActivityLogModel.log(req.user.id, 'settings.update', `Updated settings: ${entries.map(([k]) => k).join(', ')}`.slice(0, 500));
  res.json({ success: true, message: 'Settings saved.', data: await SettingModel.all() });
});

// ========== Uploads ==========
export const uploadImage = asyncHandler(async (req, res) => {
  const url = `/uploads/${req.file.filename}`;
  if (req.user.role !== 'student') ActivityLogModel.log(req.user.id, 'upload.image', `Uploaded ${url}`);
  res.status(201).json({ success: true, message: 'Image uploaded.', data: { url } });
});

// ========== Student portal (self-service) ==========
export const portalOverview = asyncHandler(async (req, res) => {
  const [profile, admissions, enquiries] = await Promise.all([
    ProfileModel.findByUser(req.user.id),
    AdmissionModel.byUser(req.user.id),
    EnquiryModel.byEmail(req.user.email),
  ]);
  // Never leak internal admin notes / IPs to students.
  const safeEnquiries = enquiries.map(({ admin_notes, ip_address, ...e }) => e); // eslint-disable-line no-unused-vars
  const safeAdmissions = admissions.map(({ notes, reviewed_by, reviewed_by_name, ...a }) => a); // eslint-disable-line no-unused-vars
  res.json({ success: true, data: { profile, admissions: safeAdmissions, enquiries: safeEnquiries } });
});

export const updateMyProfile = asyncHandler(async (req, res) => {
  const { full_name, phone, date_of_birth, address, profile_image } = req.body;
  await UserModel.update(req.user.id, { full_name, phone: phone === '' ? null : phone });
  if (req.user.role === 'student') {
    await ProfileModel.upsert(req.user.id, {
      date_of_birth: date_of_birth === '' ? null : date_of_birth,
      address,
      profile_image,
    });
  }
  const user = await UserModel.findById(req.user.id);
  const profile = await ProfileModel.findByUser(req.user.id);
  res.json({ success: true, message: 'Profile updated.', data: { ...user, profile } });
});

// ========== Admin users (super_admin) ==========
export const listAdminUsers = asyncHandler(async (_req, res) => {
  res.json({ success: true, data: await UserModel.listAdmins() });
});

export const createAdminUser = asyncHandler(async (req, res) => {
  const { full_name, email, phone, password, role, status = 'active' } = req.body;
  if (await UserModel.findByEmail(email)) throw ApiError.conflict('An account with this email already exists.', { email: 'Email already in use.' });
  const id = await UserModel.create({ full_name, email, phone: phone || null, password_hash: await hashPassword(password), role, status });
  ActivityLogModel.log(req.user.id, 'user.create', `Created ${role} account for ${full_name}`);
  res.status(201).json({ success: true, message: 'Team member added.', data: await UserModel.findById(id) });
});

export const updateAdminUser = asyncHandler(async (req, res) => {
  const target = await UserModel.findById(req.params.id);
  if (!target || target.role === 'student') throw ApiError.notFound('Team member not found.');
  const { full_name, email, phone, password, role, status } = req.body;
  const isSelf = target.id === req.user.id;
  if (isSelf && ((role && role !== target.role) || status === 'inactive')) {
    throw ApiError.badRequest('You cannot change your own role or deactivate yourself.');
  }
  if (target.role === 'super_admin' && ((role && role !== 'super_admin') || status === 'inactive')) {
    const supers = (await UserModel.listAdmins()).filter((u) => u.role === 'super_admin' && u.status === 'active');
    if (supers.length <= 1) throw ApiError.badRequest('At least one active super admin is required.');
  }
  if (email && email !== target.email && (await UserModel.findByEmail(email))) {
    throw ApiError.conflict('Email already in use.', { email: 'Email already in use.' });
  }
  const data = { full_name, email, phone: phone === '' ? null : phone, role, status };
  if (password) data.password_hash = await hashPassword(password);
  await UserModel.update(target.id, data);
  if (password || (status && status !== target.status) || (role && role !== target.role)) await UserModel.bumpTokenVersion(target.id);
  ActivityLogModel.log(req.user.id, 'user.update', `Updated team member ${full_name || target.full_name}`);
  res.json({ success: true, message: 'Team member updated.', data: await UserModel.findById(target.id) });
});

export const deleteAdminUser = asyncHandler(async (req, res) => {
  const target = await UserModel.findById(req.params.id);
  if (!target || target.role === 'student') throw ApiError.notFound('Team member not found.');
  if (target.id === req.user.id) throw ApiError.badRequest('You cannot delete your own account.');
  if (target.role === 'super_admin') {
    const supers = (await UserModel.listAdmins()).filter((u) => u.role === 'super_admin');
    if (supers.length <= 1) throw ApiError.badRequest('At least one super admin is required.');
  }
  await UserModel.remove(target.id);
  ActivityLogModel.log(req.user.id, 'user.delete', `Removed team member ${target.full_name}`);
  res.json({ success: true, message: 'Team member removed.' });
});

// ========== SEO ==========
export const sitemap = asyncHandler(async (_req, res) => {
  const base = env.siteUrl;
  const staticPages = [
    ['/', '1.0', 'weekly'],
    ['/about', '0.8', 'monthly'],
    ['/programs', '0.9', 'weekly'],
    ['/why-norea', '0.7', 'monthly'],
    ['/admissions', '0.9', 'monthly'],
    ['/contact', '0.7', 'monthly'],
  ];
  const programs = await ProgramModel.sitemapEntries();
  const urls = [
    ...staticPages.map(([p, pr, cf]) => `<url><loc>${base}${p}</loc><changefreq>${cf}</changefreq><priority>${pr}</priority></url>`),
    ...programs.map(
      (p) =>
        `<url><loc>${base}/programs/${p.slug}</loc><lastmod>${new Date(p.updated_at).toISOString().slice(0, 10)}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>`
    ),
  ];
  res.type('application/xml').send(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`
  );
});

export const robots = (_req, res) => {
  res.type('text/plain').send(
    ['User-agent: *', 'Allow: /', 'Disallow: /admin', 'Disallow: /portal', 'Disallow: /api/', '', `Sitemap: ${env.siteUrl}/sitemap.xml`].join('\n')
  );
};
