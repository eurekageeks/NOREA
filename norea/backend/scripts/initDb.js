/**
 * Initialise the database from /database/schema.sql + seed.sql.
 *   npm run db:init            → create schema + seed (DROPS existing tables!)
 *   npm run db:init -- --seed-only
 * Uses DB_* from backend/.env. The DB user needs CREATE privileges
 * (or create the database manually first – see README).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ quiet: true });
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbDir = path.resolve(__dirname, '../../database');
const seedOnly = process.argv.includes('--seed-only');

const run = async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
    charset: 'utf8mb4',
  });
  try {
    await conn.query("SET time_zone = '+00:00'");
    const dbName = process.env.DB_NAME || 'norea_learning';
    const swapDb = (sql) => sql.replace(/norea_learning/g, dbName);
    if (!seedOnly) {
      console.log('→ Applying schema.sql');
      await conn.query(swapDb(fs.readFileSync(path.join(dbDir, 'schema.sql'), 'utf8')));
    }
    console.log('→ Applying seed.sql');
    await conn.query(swapDb(fs.readFileSync(path.join(dbDir, 'seed.sql'), 'utf8')));
    const [[{ c }]] = await conn.query(`SELECT COUNT(*) AS c FROM \`${dbName}\`.programs`);
    console.log(`✓ Database "${dbName}" ready (${c} programs). Next: npm run db:admin`);
  } finally {
    await conn.end();
  }
};

run().catch((err) => {
  console.error('✗ Database initialisation failed:', err.code || '', err.message);
  process.exit(1);
});
