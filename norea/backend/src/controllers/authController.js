import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { UserModel, ProfileModel } from '../models/userModel.js';
import { ActivityLogModel } from '../models/settingModel.js';
import { ADMIN_ROLES, permissionsForRole } from '../config/permissions.js';
import { authenticateCredentials, createStudent, sanitizeUser, hashPassword, verifyPassword } from '../services/authService.js';
import { signToken, setAuthCookie, clearAuthCookie } from '../utils/token.js';

const buildSession = async (user) => {
  const base = sanitizeUser(await UserModel.findById(user.id));
  const profile = base.role === 'student' ? await ProfileModel.findByUser(base.id) : null;
  return { ...base, profile, isAdmin: ADMIN_ROLES.includes(base.role), permissions: permissionsForRole(base.role) };
};

// POST /api/auth/register  (students only)
export const register = asyncHandler(async (req, res) => {
  const { full_name, email, phone, password } = req.body;
  const id = await createStudent({ full_name, email, phone, password });
  const user = await UserModel.findAuthById(id);
  setAuthCookie(res, signToken(user));
  res.status(201).json({ success: true, message: 'Welcome to NŌRÉA! Your account has been created.', user: await buildSession(user) });
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password, portal } = req.body;
  const user = await authenticateCredentials(email, password);
  const isAdmin = ADMIN_ROLES.includes(user.role);
  if (portal === 'admin' && !isAdmin) throw ApiError.forbidden('This sign-in is for NŌRÉA staff only. Please use the student login.');
  if (portal === 'student' && isAdmin) throw ApiError.forbidden('Staff accounts must sign in through the admin portal.');
  await UserModel.touchLogin(user.id);
  if (isAdmin) ActivityLogModel.log(user.id, 'auth.login', `${user.full_name} signed in`);
  setAuthCookie(res, signToken(user));
  res.json({ success: true, message: `Welcome back, ${user.full_name.split(' ')[0]}.`, user: await buildSession(user) });
});

// POST /api/auth/logout
export const logout = asyncHandler(async (_req, res) => {
  clearAuthCookie(res);
  res.json({ success: true, message: 'You have been signed out.' });
});

// GET /api/auth/me
export const me = asyncHandler(async (req, res) => {
  res.json({ success: true, user: await buildSession(req.user) });
});

// PUT /api/auth/password
export const changePassword = asyncHandler(async (req, res) => {
  const { current_password, new_password } = req.body;
  const user = await UserModel.findAuthById(req.user.id);
  if (!(await verifyPassword(current_password, user.password_hash))) {
    throw new ApiError(422, 'Current password is incorrect.', { current_password: 'Current password is incorrect.' });
  }
  if (current_password === new_password) {
    throw new ApiError(422, 'Choose a password different from your current one.', { new_password: 'Choose a different password.' });
  }
  await UserModel.update(user.id, { password_hash: await hashPassword(new_password) });
  // Invalidate every other session, then re-issue a fresh token for this one.
  await UserModel.bumpTokenVersion(user.id);
  const fresh = await UserModel.findAuthById(user.id);
  setAuthCookie(res, signToken(fresh));
  if (ADMIN_ROLES.includes(user.role)) ActivityLogModel.log(user.id, 'auth.password', 'Changed own password');
  res.json({ success: true, message: 'Your password has been updated.' });
});
