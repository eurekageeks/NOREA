import { Router } from 'express';
import validate from '../middleware/validate.js';
import { authenticate, optionalAuth, requireAdmin, requirePermission, authorizeRoles } from '../middleware/auth.js';
import { authLimiter, formLimiter } from '../middleware/rateLimiters.js';
import { imageUpload, verifyImageSignature } from '../middleware/upload.js';
import * as V from '../validators/index.js';
import * as auth from '../controllers/authController.js';
import * as programs from '../controllers/programController.js';
import * as enquiries from '../controllers/enquiryController.js';
import * as students from '../controllers/studentController.js';
import * as admissions from '../controllers/admissionController.js';
import * as misc from '../controllers/miscController.js';

const router = Router();
const perm = requirePermission;

router.get('/health', (_req, res) => res.json({ success: true, status: 'ok', time: new Date().toISOString() }));

// ---------- Auth ----------
router.post('/auth/register', authLimiter, V.registerRules, validate, auth.register);
router.post('/auth/login', authLimiter, V.loginRules, validate, auth.login);
router.post('/auth/logout', auth.logout);
router.get('/auth/me', authenticate, auth.me);
router.put('/auth/password', authenticate, authLimiter, V.changePasswordRules, validate, auth.changePassword);

// ---------- Programs ----------
router.get('/programs', optionalAuth, programs.listPrograms);
router.get('/programs/:slug', optionalAuth, programs.getProgram);
router.post('/programs', authenticate, perm('programs:manage'), V.programRules(false), validate, programs.createProgram);
router.put('/programs/:id', authenticate, perm('programs:manage'), V.idParam, V.programRules(true), validate, programs.updateProgram);
router.delete('/programs/:id', authenticate, perm('programs:manage'), V.idParam, validate, programs.deleteProgram);

// ---------- Enquiries ----------
router.post('/enquiries', formLimiter, V.enquiryCreateRules, validate, enquiries.createEnquiry);
router.get('/enquiries', authenticate, perm('enquiries:view'), V.enquiryListRules, validate, enquiries.listEnquiries);
router.get('/enquiries/export', authenticate, perm('enquiries:view'), V.enquiryListRules, validate, enquiries.exportEnquiries);
router.get('/enquiries/:id', authenticate, perm('enquiries:view'), V.idParam, validate, enquiries.getEnquiry);
router.put('/enquiries/:id', authenticate, perm('enquiries:update'), V.enquiryUpdateRules, validate, enquiries.updateEnquiry);
router.delete('/enquiries/:id', authenticate, perm('enquiries:delete'), V.idParam, validate, enquiries.deleteEnquiry);

// ---------- Students (admin) ----------
router.get('/students', authenticate, perm('students:view'), V.paginationQuery, validate, students.listStudents);
router.post('/students', authenticate, perm('students:manage'), V.studentCreateRules, validate, students.createStudentByAdmin);
router.get('/students/:id', authenticate, perm('students:view'), V.idParam, validate, students.getStudent);
router.put('/students/:id', authenticate, perm('students:manage'), V.studentUpdateRules, validate, students.updateStudent);
router.delete('/students/:id', authenticate, perm('students:manage'), V.idParam, validate, students.deleteStudent);

// ---------- Admissions ----------
router.post('/admissions', authenticate, V.admissionCreateRules, validate, admissions.createAdmission);
router.get('/admissions', authenticate, V.paginationQuery, validate, admissions.listAdmissions);
router.put('/admissions/:id', authenticate, perm('admissions:create'), V.admissionUpdateRules, validate, admissions.updateAdmission);
router.delete('/admissions/:id', authenticate, perm('admissions:decide'), V.idParam, validate, admissions.deleteAdmission);

// ---------- Dashboard & reports ----------
router.get('/dashboard/stats', authenticate, perm('dashboard:view'), misc.stats);
router.get('/dashboard/enquiry-analytics', authenticate, perm('reports:view'), misc.enquiryAnalytics);
router.get('/dashboard/activity', authenticate, perm('logs:view'), misc.activityLogs);

// ---------- Settings ----------
router.get('/settings', misc.getSettings);
router.put('/settings', authenticate, perm('settings:manage'), V.settingsRules, validate, misc.updateSettings);

// ---------- Uploads (admins: program/brand images · students: profile photo) ----------
router.post('/uploads/image', authenticate, imageUpload.single('image'), verifyImageSignature, misc.uploadImage);

// ---------- Student portal ----------
router.get('/portal/overview', authenticate, authorizeRoles('student'), misc.portalOverview);
router.put('/portal/profile', authenticate, V.updateProfileRules, validate, misc.updateMyProfile);

// ---------- Admin users (super admin only) ----------
router.get('/users', authenticate, requireAdmin, perm('users:manage'), misc.listAdminUsers);
router.post('/users', authenticate, perm('users:manage'), V.adminUserCreateRules, validate, misc.createAdminUser);
router.put('/users/:id', authenticate, perm('users:manage'), V.adminUserUpdateRules, validate, misc.updateAdminUser);
router.delete('/users/:id', authenticate, perm('users:manage'), V.idParam, validate, misc.deleteAdminUser);

export default router;
