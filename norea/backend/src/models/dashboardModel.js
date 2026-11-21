import { query, rawQuery } from '../config/db.js';

export const DashboardModel = {
  stats: async () => {
    const [row] = await query(`
      SELECT
        (SELECT COUNT(*) FROM enquiries)                                   AS total_enquiries,
        (SELECT COUNT(*) FROM enquiries WHERE status = 'new')              AS new_enquiries,
        (SELECT COUNT(*) FROM users WHERE role = 'student')                AS total_students,
        (SELECT COUNT(*) FROM users WHERE role = 'student' AND status = 'active') AS active_students,
        (SELECT COUNT(*) FROM programs)                                    AS total_programs,
        (SELECT COUNT(*) FROM programs WHERE status = 'active')            AS active_programs,
        (SELECT COUNT(*) FROM admissions WHERE status = 'approved')        AS approved_admissions,
        (SELECT COUNT(*) FROM admissions WHERE status = 'pending')         AS pending_admissions,
        (SELECT COUNT(*) FROM admissions WHERE status = 'rejected')        AS rejected_admissions,
        (SELECT COUNT(*) FROM enquiries WHERE created_at >= UTC_TIMESTAMP() - INTERVAL 7 DAY) AS enquiries_last_7_days
    `);
    const recentEnquiries = await query(`
      SELECT e.id, e.full_name, e.email, e.status, e.source, e.created_at, p.title AS program_title
        FROM enquiries e LEFT JOIN programs p ON p.id = e.program_id
       ORDER BY e.created_at DESC LIMIT 6`);
    const pendingAdmissions = await query(`
      SELECT a.id, a.created_at, u.full_name AS student_name, p.title AS program_title
        FROM admissions a JOIN users u ON u.id = a.user_id JOIN programs p ON p.id = a.program_id
       WHERE a.status = 'pending' ORDER BY a.created_at DESC LIMIT 5`);
    return { ...row, recentEnquiries, pendingAdmissions };
  },

  analytics: async ({ months = 12, date_from, date_to }) => {
    const range = [];
    const params = [];
    if (date_from) {
      range.push('e.created_at >= ?');
      params.push(`${date_from} 00:00:00`);
    }
    if (date_to) {
      range.push('e.created_at <= ?');
      params.push(`${date_to} 23:59:59`);
    }
    const rw = range.length ? `WHERE ${range.join(' AND ')}` : '';
    const rwAnd = range.length ? `AND ${range.join(' AND ')}` : '';

    const monthly = await rawQuery(
      `SELECT DATE_FORMAT(created_at, '%Y-%m') AS month,
              COUNT(*) AS enquiries,
              SUM(status = 'converted') AS converted
         FROM enquiries
        WHERE created_at >= DATE_FORMAT(UTC_TIMESTAMP() - INTERVAL ? MONTH, '%Y-%m-01')
        GROUP BY month ORDER BY month`,
      [months - 1]
    );

    // Fill empty months so the chart has a continuous axis.
    const map = Object.fromEntries(monthly.map((m) => [m.month, m]));
    const filled = [];
    const now = new Date();
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
      filled.push({
        month: key,
        label: d.toLocaleString('en', { month: 'short', year: '2-digit', timeZone: 'UTC' }),
        enquiries: Number(map[key]?.enquiries || 0),
        converted: Number(map[key]?.converted || 0),
      });
    }

    const byProgram = await rawQuery(
      `SELECT COALESCE(p.title, 'General / Contact') AS program, COUNT(e.id) AS count,
              SUM(e.status = 'converted') AS converted
         FROM enquiries e LEFT JOIN programs p ON p.id = e.program_id
         ${rw}
        GROUP BY program ORDER BY count DESC`,
      params
    );

    const byStatus = await rawQuery(
      `SELECT e.status, COUNT(*) AS count FROM enquiries e ${rw} GROUP BY e.status`,
      params
    );

    const byMode = await rawQuery(
      `SELECT e.learning_mode AS mode, COUNT(*) AS count FROM enquiries e
        WHERE e.learning_mode IS NOT NULL ${rwAnd} GROUP BY e.learning_mode`,
      params
    );

    const [totals] = await rawQuery(
      `SELECT COUNT(*) AS total, SUM(e.status = 'converted') AS converted FROM enquiries e ${rw}`,
      params
    );
    const [adm] = await rawQuery(
      `SELECT COUNT(*) AS total, SUM(status = 'approved') AS approved, SUM(status = 'rejected') AS rejected,
              SUM(status = 'pending') AS pending FROM admissions`
    );

    const total = Number(totals.total || 0);
    const converted = Number(totals.converted || 0);
    const admTotal = Number(adm.total || 0);
    const approved = Number(adm.approved || 0);

    return {
      monthly: filled,
      byProgram: byProgram.map((r) => ({ ...r, count: Number(r.count), converted: Number(r.converted || 0) })),
      byStatus: byStatus.map((r) => ({ ...r, count: Number(r.count) })),
      byMode: byMode.map((r) => ({ ...r, count: Number(r.count) })),
      conversion: {
        totalEnquiries: total,
        convertedEnquiries: converted,
        enquiryConversionRate: total ? +((converted / total) * 100).toFixed(1) : 0,
        totalAdmissions: admTotal,
        approvedAdmissions: approved,
        rejectedAdmissions: Number(adm.rejected || 0),
        pendingAdmissions: Number(adm.pending || 0),
        admissionApprovalRate: admTotal ? +((approved / admTotal) * 100).toFixed(1) : 0,
        enquiryToAdmissionRate: total ? +((approved / total) * 100).toFixed(1) : 0,
      },
    };
  },
};
