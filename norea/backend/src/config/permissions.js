/**
 * Role-based permission matrix.
 * super_admin – full access incl. admin-user management
 * admin       – runs the institute (programs, enquiries, students, admissions, settings)
 * staff       – front-desk: works enquiries & admissions, read-only elsewhere
 * student     – student portal only
 */
export const ROLES = Object.freeze({
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  STAFF: 'staff',
  STUDENT: 'student',
});

export const ADMIN_ROLES = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.STAFF];

const { SUPER_ADMIN: SA, ADMIN: A, STAFF: S } = ROLES;

export const PERMISSIONS = Object.freeze({
  'dashboard:view': [SA, A, S],
  'reports:view': [SA, A, S],
  'programs:manage': [SA, A],
  'enquiries:view': [SA, A, S],
  'enquiries:update': [SA, A, S],
  'enquiries:delete': [SA, A],
  'students:view': [SA, A, S],
  'students:manage': [SA, A],
  'admissions:view': [SA, A, S],
  'admissions:create': [SA, A, S],
  'admissions:decide': [SA, A],
  'settings:manage': [SA, A],
  'uploads:create': [SA, A],
  'logs:view': [SA, A],
  'users:manage': [SA],
});

export const permissionsForRole = (role) =>
  Object.entries(PERMISSIONS)
    .filter(([, roles]) => roles.includes(role))
    .map(([perm]) => perm);
