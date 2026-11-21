export const ENQUIRY_STATUSES = [
  { value: 'new', label: 'New', tone: 'blue' },
  { value: 'contacted', label: 'Contacted', tone: 'violet' },
  { value: 'follow_up', label: 'Follow-up', tone: 'amber' },
  { value: 'converted', label: 'Converted', tone: 'green' },
  { value: 'closed', label: 'Closed', tone: 'gray' },
];

export const ADMISSION_STATUSES = [
  { value: 'pending', label: 'Pending', tone: 'amber' },
  { value: 'approved', label: 'Approved', tone: 'green' },
  { value: 'rejected', label: 'Rejected', tone: 'red' },
];

export const PROGRAM_STATUSES = [
  { value: 'active', label: 'Active', tone: 'green' },
  { value: 'inactive', label: 'Inactive', tone: 'gray' },
  { value: 'draft', label: 'Draft', tone: 'amber' },
];

export const LEARNING_MODES = [
  { value: 'online', label: 'Online (live virtual sessions)' },
  { value: 'offline', label: 'In-person (at the institute)' },
  { value: 'hybrid', label: 'Hybrid (online + in-person)' },
];

export const ROLE_LABELS = { super_admin: 'Super Admin', admin: 'Admin', staff: 'Staff', student: 'Student' };

export const statusMeta = (list, value) => list.find((s) => s.value === value) || { label: value, tone: 'gray' };

export const modeLabel = (v) => ({ online: 'Online', offline: 'In-person', hybrid: 'Hybrid' })[v] || '—';

export const formatDate = (d, opts = {}) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', ...opts }) : '—';

export const formatDateTime = (d) =>
  d
    ? new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })
    : '—';

export const timeAgo = (d) => {
  if (!d) return '';
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(d);
};

export const initials = (name = '') =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');

export const enquiryRef = (id) => `NOR-${String(id).padStart(5, '0')}`;

export const toDateInput = (d) => {
  if (!d) return '';
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return '';
  // Use local date parts to avoid timezone shift.
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

/* ---------- client-side validation (mirrors backend rules) ---------- */
export const PHONE_RE = /^\+?[0-9\s\-()]{7,20}$/;
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const NAME_RE = /^[\p{L}\p{M}\s.'-]+$/u;

export const validators = {
  name: (v) => (!v?.trim() ? 'Full name is required.' : v.trim().length < 2 ? 'Name is too short.' : !NAME_RE.test(v.trim()) ? 'Please use letters only.' : ''),
  email: (v) => (!v?.trim() ? 'Email address is required.' : !EMAIL_RE.test(v.trim()) ? 'Please enter a valid email address.' : ''),
  phone: (v, required = true) =>
    !v?.trim() ? (required ? 'Mobile number is required.' : '') : !PHONE_RE.test(v.trim()) ? 'Please enter a valid mobile number.' : '',
  password: (v) =>
    !v ? 'Password is required.' : v.length < 8 || !/[A-Za-z]/.test(v) || !/\d/.test(v) ? 'Use 8+ characters with letters and numbers.' : '',
  required: (v, msg = 'This field is required.') => (!String(v ?? '').trim() ? msg : ''),
};
