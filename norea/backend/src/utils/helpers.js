/** Parse ?page & ?limit safely into integers. */
export const getPagination = (q, { defaultLimit = 10, maxLimit = 100 } = {}) => {
  const page = Math.max(1, parseInt(q.page, 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(q.limit, 10) || defaultLimit));
  return { page, limit, offset: (page - 1) * limit };
};

export const paginated = (rows, total, { page, limit }) => ({
  data: rows,
  pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
});

export const slugify = (str = '') =>
  str
    .toString()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 170);

/** Escape LIKE wildcards in user search input. */
export const likeEscape = (s = '') => `%${String(s).replace(/[\\%_]/g, (m) => `\\${m}`)}%`;
