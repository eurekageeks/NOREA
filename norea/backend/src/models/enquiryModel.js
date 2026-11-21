import { query, rawQuery } from '../config/db.js';
import { buildSet } from './userModel.js';
import { likeEscape } from '../utils/helpers.js';

const SELECT = `SELECT e.*, p.title AS program_title, p.slug AS program_slug
                  FROM enquiries e LEFT JOIN programs p ON p.id = e.program_id`;

const buildFilters = ({ search, status, program_id, source, date_from, date_to, learning_mode }) => {
  const where = [];
  const params = [];
  if (search) {
    where.push('(e.full_name LIKE ? OR e.email LIKE ? OR e.phone LIKE ? OR e.message LIKE ?)');
    const s = likeEscape(search);
    params.push(s, s, s, s);
  }
  if (status) {
    where.push('e.status = ?');
    params.push(status);
  }
  if (program_id) {
    where.push('e.program_id = ?');
    params.push(Number(program_id));
  }
  if (source) {
    where.push('e.source = ?');
    params.push(source);
  }
  if (learning_mode) {
    where.push('e.learning_mode = ?');
    params.push(learning_mode);
  }
  if (date_from) {
    where.push('e.created_at >= ?');
    params.push(`${date_from} 00:00:00`);
  }
  if (date_to) {
    where.push('e.created_at <= ?');
    params.push(`${date_to} 23:59:59`);
  }
  return { where: where.length ? `WHERE ${where.join(' AND ')}` : '', params };
};

export const EnquiryModel = {
  create: async (d) => {
    const r = await query(
      `INSERT INTO enquiries (full_name, email, phone, program_id, learning_mode, subject, message, source, ip_address)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        d.full_name,
        d.email,
        d.phone || null,
        d.program_id || null,
        d.learning_mode || null,
        d.subject || null,
        d.message || null,
        d.source || 'admission',
        d.ip_address || null,
      ]
    );
    return r.insertId;
  },

  /** Duplicate guard: same email + program (+source) still open within the last 24h. */
  findRecentDuplicate: async ({ email, program_id, source, message }) => {
    const rows = await query(
      `SELECT id FROM enquiries
        WHERE email = ? AND source = ?
          AND ${program_id ? 'program_id = ?' : 'program_id IS NULL'}
          AND status NOT IN ('closed','converted')
          AND created_at >= (UTC_TIMESTAMP() - INTERVAL 24 HOUR)
          ${source === 'contact' ? 'AND message = ?' : ''}
        LIMIT 1`,
      [email, source, ...(program_id ? [program_id] : []), ...(source === 'contact' ? [message || ''] : [])]
    );
    return rows[0] || null;
  },

  list: async (filters, { limit, offset }) => {
    const { where, params } = buildFilters(filters);
    const rows = await rawQuery(`${SELECT} ${where} ORDER BY e.created_at DESC, e.id DESC LIMIT ? OFFSET ?`, [
      ...params,
      limit,
      offset,
    ]);
    const [{ total }] = await rawQuery(`SELECT COUNT(*) AS total FROM enquiries e ${where}`, params);
    return { rows, total };
  },

  findById: async (id) => (await query(`${SELECT} WHERE e.id = ? LIMIT 1`, [id]))[0] || null,

  byEmail: (email) => query(`${SELECT} WHERE e.email = ? ORDER BY e.created_at DESC`, [email]),

  update: async (id, data, conn) => {
    const { set, params } = buildSet(data, ['status', 'admin_notes', 'program_id', 'learning_mode']);
    if (!set) return;
    const sql = `UPDATE enquiries SET ${set} WHERE id = ?`;
    if (conn) await conn.execute(sql, [...params, id]);
    else await query(sql, [...params, id]);
  },

  remove: (id) => query('DELETE FROM enquiries WHERE id = ?', [id]),
};
