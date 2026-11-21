import dotenv from 'dotenv';

dotenv.config({ quiet: true });

const required = ['JWT_SECRET', 'DB_HOST', 'DB_USER', 'DB_NAME'];
const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`[config] Missing required environment variables: ${missing.join(', ')}`);
  console.error('[config] Copy backend/.env.example to backend/.env and fill in the values.');
  process.exit(1);
}
if (process.env.NODE_ENV === 'production' && process.env.JWT_SECRET.length < 32) {
  console.error('[config] JWT_SECRET must be at least 32 characters in production.');
  process.exit(1);
}

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProd: process.env.NODE_ENV === 'production',
  port: Number(process.env.PORT) || 5050,
  clientOrigins: (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  siteUrl: (process.env.SITE_URL || 'http://localhost:5173').replace(/\/$/, ''),
  db: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME,
    connectionLimit: Number(process.env.DB_POOL_SIZE) || 10,
    ...(process.env.DB_SSL === 'true' ? { ssl: { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false' } } : {}),
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    cookieName: 'norea_token',
    cookieMaxAgeMs: (Number(process.env.JWT_COOKIE_DAYS) || 7) * 24 * 60 * 60 * 1000,
  },
  cookieSecure: process.env.COOKIE_SECURE
    ? process.env.COOKIE_SECURE === 'true'
    : process.env.NODE_ENV === 'production',
  cookieSameSite: process.env.COOKIE_SAME_SITE || 'lax',
  bcryptRounds: Number(process.env.BCRYPT_ROUNDS) || 12,
  uploadMaxMb: Number(process.env.UPLOAD_MAX_MB) || 3,
  serveFrontend: process.env.SERVE_FRONTEND === 'true',
  trustProxy: process.env.TRUST_PROXY || (process.env.NODE_ENV === 'production' ? '1' : 'false'),
};

export default env;
