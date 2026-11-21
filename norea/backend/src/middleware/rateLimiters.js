import rateLimit from 'express-rate-limit';

const handler = (message) => (_req, res) =>
  res.status(429).json({ success: false, message });

/** General API limiter. */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 600,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: handler('Too many requests. Please slow down and try again shortly.'),
});

/** Brute-force protection for login / register / password change. */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: handler('Too many attempts. Please wait 15 minutes before trying again.'),
});

/** Public form submissions (enquiries / contact). */
export const formLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: handler('You have submitted several enquiries recently. Please try again later.'),
});
