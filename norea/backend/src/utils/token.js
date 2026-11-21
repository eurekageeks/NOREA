import jwt from 'jsonwebtoken';
import env from '../config/env.js';

export const signToken = (user) =>
  jwt.sign({ sub: user.id, role: user.role, tv: user.token_version ?? 0 }, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn,
    issuer: 'norea-api',
    audience: 'norea-web',
  });

export const verifyToken = (token) =>
  jwt.verify(token, env.jwt.secret, { issuer: 'norea-api', audience: 'norea-web' });

export const cookieOptions = () => ({
  httpOnly: true,
  secure: env.cookieSecure,
  sameSite: 'lax',
  path: '/',
  maxAge: env.jwt.cookieMaxAgeMs,
});

export const setAuthCookie = (res, token) => res.cookie(env.jwt.cookieName, token, cookieOptions());

export const clearAuthCookie = (res) => {
  const { maxAge, ...opts } = cookieOptions();
  res.clearCookie(env.jwt.cookieName, opts);
};
