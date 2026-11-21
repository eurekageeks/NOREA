import { query, rawQuery } from '../config/db.js';
import { likeEscape } from '../utils/helpers.js';

const SELECT = `SELECT a.*, u.full_name AS student_name, u.email AS student_email, u.phone AS student_phone,
                       p.title AS program_title, p.slug AS program_slug, p.image AS program_image,
                       p.duration AS program_duration, r.full_name AS reviewed_by_name
                  FROM admissions a
                  JOIN users u ON u.id = a.user_id
                  JOIN programs p ON p.id = a.program_id
             LEFT JOIN users r ON r.id = a.reviewed_by`;

export const AdmissionModel = {
  create: async ({ user_id, program_id, enquiry_id = null, status = 'pending', admission_date = null, notes = null, reviewed_by = null }, conn) => {
    const sql = `INSERT INTO admissions (user_id, program_id, enquiry_id, status, admission_date, notes, reviewed_by)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const params = [user_id, program_id, enquiry_id, status, admission_date, notes, reviewed_by];
    const r = conn ? (await conn.execute(sql, params))[0] : await query(sql, params);
    return r.insertId;
  },

  findById: async (id) => (await query(`${SELECT} WHERE a.id = ? LIMIT 1`, [id]))[0] || null,

  findByUserProgram: async (userId, programId) =>
    (await query('SELECT * FROM admissions WHERE user_id = ? AND program_id = ? LIMIT 1', [userId, programId]))[0] || null,

  byUser: (userId) => query(`${SELECT} WHERE a.user_id = ? ORDER BY a.created_at DESC`, [userId]),

  list: async ({ status, program_id, search, user_id }, { limit, offset }) => {
    const where = [];
    const params = [];
    if (status) {
      where.push('a.status = ?');
      params.push(status);
    }
    if (program_id) {
      where.push('a.program_id = ?');
      params.push(Number(program_id));
    }
    if (user_id) {
      where.push('a.user_id = ?');
      params.push(Number(user_id));
    }
    if (search) {
      where.push('(u.full_name LIKE ? OR u.email LIKE ?)');
      const s = likeEscape(search);
      params.push(s, s);
    }
    const w = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const rows = await rawQuery(`${SELECT} ${w} ORDER BY a.created_at DESC, a.id DESC LIMIT ? OFFSET ?`, [...params, limit, offset]);
    const [{ total }] = await rawQuery(
      `SELECT COUNT(*) AS total FROM admissions a JOIN users u ON u.id = a.user_id ${w}`,
      params
    );
    return { rows, total };
  },

  update: async (id, { status, admission_date, notes, reviewed_by }) => {
    const sets = [];
    const params = [];
    if (status !== undefined) sets.push('status = ?') && params.push(status);
    if (admission_date !== undefined) sets.push('admission_date = ?') && params.push(admission_date || null);
    if (notes !== undefined) sets.push('notes = ?') && params.push(notes);
    if (reviewed_by !== undefined) sets.push('reviewed_by = ?') && params.push(reviewed_by);
    if (!sets.length) return;
    await query(`UPDATE admissions SET ${sets.join(', ')} WHERE id = ?`, [...params, id]);
  },

  remove: (id) => query('DELETE FROM admissions WHERE id = ?', [id]),
};
