import { query, rawQuery } from '../config/db.js';

/** Keys an admin may edit. Anything else sent to PUT /api/settings is ignored. */
export const SETTING_KEYS = [
  'institute_name',
  'institute_category',
  'logo',
  'tagline',
  'hero_heading',
  'hero_subheading',
  'hero_image',
  'about_intro',
  'mission',
  'vision',
  'contact_email',
  'contact_phone',
  'contact_address',
  'office_hours',
  'map_embed_url',
  'social_instagram',
  'social_facebook',
  'social_linkedin',
  'social_youtube',
  'social_x',
  'whatsapp_number',
  'footer_about',
  'footer_text',
  'seo_description',
];

export const SettingModel = {
  all: async () => {
    const rows = await query('SELECT setting_key, setting_value FROM website_settings');
    return Object.fromEntries(rows.map((r) => [r.setting_key, r.setting_value ?? '']));
  },

  upsertMany: async (entries) => {
    if (!entries.length) return;
    await rawQuery(
      `INSERT INTO website_settings (setting_key, setting_value) VALUES ?
       ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
      [entries]
    );
  },
};

export const ActivityLogModel = {
  log: (adminId, action, description = null) =>
    query('INSERT INTO admin_activity_logs (admin_id, action, description) VALUES (?, ?, ?)', [
      adminId,
      action,
      description ? String(description).slice(0, 500) : null,
    ]).catch((e) => console.error('[activity-log]', e.message)),

  recent: async ({ limit, offset }) => {
    const rows = await rawQuery(
      `SELECT l.id, l.action, l.description, l.created_at, u.full_name AS admin_name, u.role AS admin_role
         FROM admin_activity_logs l LEFT JOIN users u ON u.id = l.admin_id
        ORDER BY l.created_at DESC, l.id DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    const [{ total }] = await rawQuery('SELECT COUNT(*) AS total FROM admin_activity_logs');
    return { rows, total };
  },
};
