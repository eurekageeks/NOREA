import bcrypt from 'bcryptjs';
import env from '../config/env.js';
import { withTransaction } from '../config/db.js';
import { UserModel, ProfileModel } from '../models/userModel.js';
import ApiError from '../utils/ApiError.js';

// Pre-computed hash used to equalise timing when the email doesn't exist.
const DUMMY_HASH = bcrypt.hashSync('norea-timing-equaliser', 10);

export const hashPassword = (plain) => bcrypt.hash(plain, env.bcryptRounds);
export const verifyPassword = (plain, hash) => bcrypt.compare(plain, hash);

export const authenticateCredentials = async (email, password) => {
  const user = await UserModel.findByEmail(email);
  const ok = await verifyPassword(password, user?.password_hash || DUMMY_HASH);
  if (!user || !ok) throw ApiError.unauthorized('Invalid email or password.');
  if (user.status !== 'active') throw ApiError.forbidden('Your account has been deactivated. Please contact the institute.');
  return user;
};

/** Create a student account + empty profile atomically. */
export const createStudent = async ({ full_name, email, phone, password, status = 'active', profile = {} }, existingConn) => {
  if (await UserModel.findByEmail(email)) throw ApiError.conflict('An account with this email already exists.', { email: 'An account with this email already exists.' });
  const password_hash = await hashPassword(password);
  const run = async (conn) => {
    const id = await UserModel.create({ full_name, email, phone, password_hash, role: 'student', status }, conn);
    await ProfileModel.upsert(id, profile, conn);
    return id;
  };
  return existingConn ? run(existingConn) : withTransaction(run);
};

export const sanitizeUser = (u) => {
  if (!u) return u;
  // eslint-disable-next-line no-unused-vars
  const { password_hash, token_version, ...rest } = u;
  return rest;
};
