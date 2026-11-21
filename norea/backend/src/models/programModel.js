import { query, rawQuery, withTransaction } from '../config/db.js';
import { buildSet } from './userModel.js';

const parseJson = (v) => {
  if (v == null) return [];
  if (Array.isArray(v)) return v;
  try {
    const p = JSON.parse(v);
    return Array.isArray(p) ? p : [];
  } catch {
    return [];
  }
};

const hydrate = (p, topics = []) =>
  p && {
    ...p,
    learning_outcomes: parseJson(p.learning_outcomes),
    highlights: parseJson(p.highlights),
    learning_modes: p.learning_modes ? p.learning_modes.split(',').filter(Boolean) : [],
    topics,
  };

const FIELDS = [
  'title',
  'slug',
  'short_description',
  'description',
  'image',
  'learning_outcomes',
  'highlights',
  'duration',
  'fees',
  'certification',
  'trainer_info',
  'learning_modes',
  'display_order',
  'status',
];

const serialize = (data) => {
  const out = { ...data };
  if (Array.isArray(out.learning_outcomes)) out.learning_outcomes = JSON.stringify(out.learning_outcomes);
  if (Array.isArray(out.highlights)) out.highlights = JSON.stringify(out.highlights);
  if (Array.isArray(out.learning_modes)) out.learning_modes = out.learning_modes.join(',');
  for (const k of ['duration', 'fees', 'certification', 'trainer_info', 'short_description', 'image']) {
    if (out[k] === '') out[k] = null;
  }
  return out;
};

const topicsFor = async (ids) => {
  if (!ids.length) return {};
  const rows = await rawQuery(
    'SELECT id, program_id, topic_name, display_order FROM program_topics WHERE program_id IN (?) ORDER BY display_order, id',
    [ids]
  );
  return rows.reduce((acc, t) => {
    (acc[t.program_id] ||= []).push(t);
    return acc;
  }, {});
};

const saveTopics = async (conn, programId, topics) => {
  await conn.execute('DELETE FROM program_topics WHERE program_id = ?', [programId]);
  const clean = topics.map((t) => (typeof t === 'string' ? t : t.topic_name)).map((t) => String(t).trim()).filter(Boolean);
  if (!clean.length) return;
  await conn.query('INSERT INTO program_topics (program_id, topic_name, display_order) VALUES ?', [
    clean.map((t, i) => [programId, t, i + 1]),
  ]);
};

export const ProgramModel = {
  list: async ({ includeInactive = false } = {}) => {
    const rows = await query(
      `SELECT p.*,
              (SELECT COUNT(*) FROM enquiries e WHERE e.program_id = p.id) AS enquiry_count,
              (SELECT COUNT(*) FROM admissions a WHERE a.program_id = p.id AND a.status = 'approved') AS student_count
         FROM programs p
        ${includeInactive ? '' : "WHERE p.status = 'active'"}
        ORDER BY p.display_order, p.id`
    );
    const topics = await topicsFor(rows.map((r) => r.id));
    return rows.map((r) => hydrate(r, topics[r.id] || []));
  },

  findBySlug: async (slug, { includeInactive = false } = {}) => {
    const rows = await query(
      `SELECT * FROM programs WHERE slug = ? ${includeInactive ? '' : "AND status = 'active'"} LIMIT 1`,
      [slug]
    );
    if (!rows[0]) return null;
    const topics = await topicsFor([rows[0].id]);
    return hydrate(rows[0], topics[rows[0].id] || []);
  },

  findById: async (id) => {
    const rows = await query('SELECT * FROM programs WHERE id = ? LIMIT 1', [id]);
    if (!rows[0]) return null;
    const topics = await topicsFor([rows[0].id]);
    return hydrate(rows[0], topics[rows[0].id] || []);
  },

  slugExists: async (slug, excludeId = 0) =>
    (await query('SELECT id FROM programs WHERE slug = ? AND id <> ? LIMIT 1', [slug, excludeId])).length > 0,

  create: (data) =>
    withTransaction(async (conn) => {
      const s = serialize(data);
      const cols = FIELDS.filter((f) => s[f] !== undefined);
      const [r] = await conn.execute(
        `INSERT INTO programs (${cols.join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`,
        cols.map((c) => s[c])
      );
      if (Array.isArray(data.topics)) await saveTopics(conn, r.insertId, data.topics);
      return r.insertId;
    }),

  update: (id, data) =>
    withTransaction(async (conn) => {
      const { set, params } = buildSet(serialize(data), FIELDS);
      if (set) await conn.execute(`UPDATE programs SET ${set} WHERE id = ?`, [...params, id]);
      if (Array.isArray(data.topics)) await saveTopics(conn, id, data.topics);
    }),

  admissionCount: async (id) =>
    (await query('SELECT COUNT(*) AS c FROM admissions WHERE program_id = ?', [id]))[0].c,

  remove: (id) => query('DELETE FROM programs WHERE id = ?', [id]),

  sitemapEntries: () => query("SELECT slug, updated_at FROM programs WHERE status = 'active' ORDER BY display_order"),
};
