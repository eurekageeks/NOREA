import env from '../config/env.js';
import { query } from '../config/db.js';
import { ADMIN_ROLES, PERMISSIONS } from '../config/permissions.js';
import ApiError from '../utils/ApiError.js';
import { verifyToken, clearAuthCookie } from '../utils/token.js';

const extractToken = (req) => {
  const cookieToken = req.cookies?.[env.jwt.cookieName];
  if (cookieToken) return cookieToken;
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.slice(7).trim();
  return null;
};

const loadUser = async (token) => {
  const payload = verifyToken(token);
  const rows = await query(
    'SELECT id, full_name, email, phone, role, status, token_version FROM users WHERE id = ? LIMIT 1',
    [payload.sub]
  );
  const user = rows[0];
  if (!user) throw ApiError.unauthorized('Your session is no longer valid. Please sign in again.');
  if (user.status !== 'active') throw ApiError.forbidden('Your account has been deactivated.');
  if (user.token_version !== payload.tv) {
    throw ApiError.unauthorized('Your session has expired. Please sign in again.');
  }
  return user;
};

/** Requires a valid JWT (httpOnly cookie or Bearer header). */
export const authenticate = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) throw ApiError.unauthorized();
    req.user = await loadUser(token);
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError' || err.statusCode === 401) {
      clearAuthCookie(res);
      return next(
        err.statusCode ? err : ApiError.unauthorized('Your session has expired. Please sign in again.')
      );
    }
    next(err);
  }
};

/** Attaches req.user when a valid token exists, otherwise continues anonymously. */
export const optionalAuth = async (req, _res, next) => {
  try {
    const token = extractToken(req);
    if (token) req.user = await loadUser(token);
  } catch {
    req.user = undefined;
  }
  next();
};

export const authorizeRoles =
  (...roles) =>
  (req, _res, next) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role)) return next(ApiError.forbidden());
    next();
  };

export const requireAdmin = authorizeRoles(...ADMIN_ROLES);

export const requirePermission = (permission) => (req, _res, next) => {
  if (!req.user) return next(ApiError.unauthorized());
  const allowed = PERMISSIONS[permission] || [];
  if (!allowed.includes(req.user.role)) return next(ApiError.forbidden());
  next();
};

export const hasPermission = (user, permission) =>
  !!user && (PERMISSIONS[permission] || []).includes(user.role);
