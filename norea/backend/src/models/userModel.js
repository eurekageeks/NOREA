import { query, rawQuery } from '../config/db.js';
import { likeEscape } from '../utils/helpers.js';

const PUBLIC_COLS = 'u.id, u.full_name, u.email, u.phone, u.role, u.status, u.last_login_at, u.created_at, u.updated_at';

/** Build "col = ?, col2 = ?" from a whitelist. */
export const buildSet = (data, allowed) => {
  const cols = [];
  const params = [];
  for (const key of allowed) {
    if (data[key] !== undefined) {
      cols.push(`${key} = ?`);
      params.push(data[key]);
    }
  }
  return { set: cols.join(', '), params };
};

const exec = (conn, sql, params) => (conn ? conn.execute(sql, params).then(([r]) => r) : query(sql, params));

export const UserModel = {
  findByEmail: async (email) =>
    (await query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]))[0] || null,

  findById: async (id) =>
    (await query(`SELECT ${PUBLIC_COLS} FROM users u WHERE u.id = ? LIMIT 1`, [id]))[0] || null,

  findAuthById: async (id) => (await query('SELECT * FROM users WHERE id = ? LIMIT 1', [id]))[0] || null,

  create: async ({ full_name, email, phone = null, password_hash, role = 'student', status = 'active' }, conn) => {
    const r = await exec(
      conn,
      'INSERT INTO users (full_name, email, phone, password_hash, role, status) VALUES (?, ?, ?, ?, ?, ?)',
      [full_name, email, phone, password_hash, role, status]
    );
    return r.insertId;
  },

  update: async (id, data, conn) => {
    const { set, params } = buildSet(data, ['full_name', 'email', 'phone', 'role', 'status', 'password_hash']);
    if (!set) return;
    await exec(conn, `UPDATE users SET ${set} WHERE id = ?`, [...params, id]);
  },

  bumpTokenVersion: (id) => query('UPDATE users SET token_version = token_version + 1 WHERE id = ?', [id]),

  touchLogin: (id) => query('UPDATE users SET last_login_at = UTC_TIMESTAMP() WHERE id = ?', [id]),

  remove: (id) => query('DELETE FROM users WHERE id = ?', [id]),

  listStudents: async ({ search, status, limit, offset, sort = 'newest' }) => {
    const where = ["u.role = 'student'"];
    const params = [];
    if (search) {
      where.push('(u.full_name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)');
      const s = likeEscape(search);
      params.push(s, s, s);
    }
    if (status) {
      where.push('u.status = ?');
      params.push(status);
    }
    const order = sort === 'name' ? 'u.full_name ASC' : sort === 'oldest' ? 'u.created_at ASC' : 'u.created_at DESC';
    const w = where.join(' AND ');
    const rows = await rawQuery(
      `SELECT ${PUBLIC_COLS},
              (SELECT COUNT(*) FROM admissions a WHERE a.user_id = u.id AND a.status = 'approved') AS enrolled_count,
              (SELECT COUNT(*) FROM admissions a WHERE a.user_id = u.id AND a.status = 'pending') AS pending_count
         FROM users u WHERE ${w} ORDER BY ${order} LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    const [{ total }] = await rawQuery(`SELECT COUNT(*) AS total FROM users u WHERE ${w}`, params);
    return { rows, total };
  },

  listAdmins: () =>
    query(
      `SELECT ${PUBLIC_COLS} FROM users u WHERE u.role IN ('super_admin','admin','staff') ORDER BY FIELD(u.role,'super_admin','admin','staff'), u.full_name`
    ),

  countByRole: async (role) => (await query('SELECT COUNT(*) AS c FROM users WHERE role = ?', [role]))[0].c,
};

export const ProfileModel = {
  findByUser: async (userId) =>
    (await query('SELECT date_of_birth, address, profile_image FROM student_profiles WHERE user_id = ? LIMIT 1', [userId]))[0] ||
    null,

  upsert: async (userId, { date_of_birth, address, profile_image }, conn) => {
    await exec(
      conn,
      `INSERT INTO student_profiles (user_id, date_of_birth, address, profile_image)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         date_of_birth = IF(? IS NULL, date_of_birth, VALUES(date_of_birth)),
         address       = IF(? IS NULL, address, VALUES(address)),
         profile_image = IF(? IS NULL, profile_image, VALUES(profile_image))`,
      [
        userId,
        date_of_birth ?? null,
        address ?? null,
        profile_image ?? null,
        date_of_birth === undefined ? null : 1,
        address === undefined ? null : 1,
        profile_image === undefined ? null : 1,
      ]
    );
  },
};
