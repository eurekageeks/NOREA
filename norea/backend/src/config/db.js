import mysql from 'mysql2/promise';
import env from './env.js';

/** Shared MySQL connection pool (parameterized queries only). */
const pool = mysql.createPool({
  ...env.db,
  waitForConnections: true,
  queueLimit: 0,
  charset: 'utf8mb4',
  timezone: 'Z',
  dateStrings: false,
  decimalNumbers: true,
  enableKeepAlive: true,
});

// Store & compare all DATETIMEs in UTC, regardless of the MySQL server's zone.
pool.pool.on('connection', (conn) => {
  conn.query("SET time_zone = '+00:00'");
});

export const query = async (sql, params = []) => {
  const [rows] = await pool.execute(sql, params);
  return rows;
};

/** For queries with dynamic LIMIT/OFFSET or IN lists, pool.query is used (still escaped). */
export const rawQuery = async (sql, params = []) => {
  const [rows] = await pool.query(sql, params);
  return rows;
};

export const withTransaction = async (fn) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

export const testConnection = async () => {
  const conn = await pool.getConnection();
  try {
    await conn.ping();
  } finally {
    conn.release();
  }
};

export default pool;
