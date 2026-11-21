/**
 * Create (or reset the password of) a super admin account.
 *   ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME from .env, or CLI flags:
 *   npm run db:admin -- --email you@domain.com --password "S3cure-Pass" --name "Your Name"
 */
import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ quiet: true });

const arg = (flag) => {
  const i = process.argv.indexOf(flag);
  return i > -1 ? process.argv[i + 1] : undefined;
};

const email = (arg('--email') || process.env.ADMIN_EMAIL || '').trim().toLowerCase();
const password = arg('--password') || process.env.ADMIN_PASSWORD || '';
const name = arg('--name') || process.env.ADMIN_NAME || 'NŌRÉA Administrator';

if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
  console.error('✗ Provide a valid admin email (ADMIN_EMAIL or --email).');
  process.exit(1);
}
if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
  console.error('✗ Admin password must be 8+ characters with letters and numbers (ADMIN_PASSWORD or --password).');
  process.exit(1);
}

const run = async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME,
  });
  try {
    const hash = await bcrypt.hash(password, Number(process.env.BCRYPT_ROUNDS) || 12);
    const [rows] = await conn.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (rows.length) {
      await conn.execute(
        "UPDATE users SET password_hash = ?, role = 'super_admin', status = 'active', token_version = token_version + 1 WHERE id = ?",
        [hash, rows[0].id]
      );
      console.log(`✓ Existing account ${email} promoted to super_admin and password reset.`);
    } else {
      await conn.execute(
        "INSERT INTO users (full_name, email, password_hash, role, status) VALUES (?, ?, ?, 'super_admin', 'active')",
        [name, email, hash]
      );
      console.log(`✓ Super admin ${email} created. Sign in at /admin/login`);
    }
  } finally {
    await conn.end();
  }
};

run().catch((err) => {
  console.error('✗ Failed:', err.code || '', err.message);
  process.exit(1);
});
