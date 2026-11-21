/**
 * Complete client-side localStorage engine for NŌRÉA (zero backend required).
 * Persists programs, enquiries, students, admissions, team users, settings & activity logs.
 */
import { DEFAULT_SETTINGS } from '../context/SettingsContext';

const STORAGE_KEY = 'norea_platform_db_v1';
const SESSION_KEY = 'norea_session_user_id_v1';

const ADMIN_ROLES = ['super_admin', 'admin', 'staff'];
const PERMISSIONS = {
  'dashboard:view': ['super_admin', 'admin', 'staff'],
  'reports:view': ['super_admin', 'admin', 'staff'],
  'programs:manage': ['super_admin', 'admin'],
  'enquiries:view': ['super_admin', 'admin', 'staff'],
  'enquiries:update': ['super_admin', 'admin', 'staff'],
  'enquiries:delete': ['super_admin', 'admin'],
  'students:view': ['super_admin', 'admin', 'staff'],
  'students:manage': ['super_admin', 'admin'],
  'admissions:view': ['super_admin', 'admin', 'staff'],
  'admissions:create': ['super_admin', 'admin', 'staff'],
  'admissions:decide': ['super_admin', 'admin'],
  'settings:manage': ['super_admin', 'admin'],
  'uploads:create': ['super_admin', 'admin'],
  'logs:view': ['super_admin', 'admin'],
  'users:manage': ['super_admin'],
};

const permissionsForRole = (role) =>
  Object.entries(PERMISSIONS)
    .filter(([, roles]) => roles.includes(role))
    .map(([perm]) => perm);

const nowIso = () => new Date().toISOString();
const todayStr = () => new Date().toISOString().slice(0, 10);

const slugify = (str = '') =>
  str
    .toString()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 170) || 'program';

const apiErr = (status, message, errors = {}) => {
  const err = new Error(message);
  err.response = { status, data: { success: false, message, errors } };
  return err;
};

const SEED_PROGRAMS = [
  {
    id: 1,
    title: 'Spoken English & Communication',
    slug: 'spoken-english-communication',
    short_description: 'Develop effective communication skills and speak English with confidence.',
    description:
      'Develop effective communication skills and speak English with confidence. This program takes you from foundational English to fluent, natural conversation — building the grammar, vocabulary and presence you need to express yourself clearly in everyday, academic and professional situations.',
    image: '/images/program-spoken-english.jpg',
    learning_outcomes: [
      'Speak English fluently and confidently in daily and professional settings',
      'Use correct grammar and a richer vocabulary with ease',
      'Deliver clear, structured presentations and speeches',
      'Approach interviews with poise and well-framed answers',
    ],
    highlights: [
      'Practical, conversation-led sessions',
      'Guided public-speaking practice',
      'Personal feedback on pronunciation and fluency',
      'Mock interviews and real-life role plays',
    ],
    topics: [
      { id: 1, program_id: 1, topic_name: 'Basic to Advanced English', display_order: 1 },
      { id: 2, program_id: 1, topic_name: 'Fluency & Conversation', display_order: 2 },
      { id: 3, program_id: 1, topic_name: 'Grammar & Vocabulary', display_order: 3 },
      { id: 4, program_id: 1, topic_name: 'Public Speaking', display_order: 4 },
      { id: 5, program_id: 1, topic_name: 'Interview Skills', display_order: 5 },
    ],
    duration: '',
    fees: '',
    certification: '',
    trainer_info: '',
    learning_modes: ['online', 'offline', 'hybrid'],
    display_order: 1,
    status: 'active',
    created_at: nowIso(),
    updated_at: nowIso(),
  },
  {
    id: 2,
    title: 'Personality Development',
    slug: 'personality-development',
    short_description: 'Build confidence, improve personality, and develop professional and interpersonal skills.',
    description:
      'Build confidence, improve personality, and develop professional and interpersonal skills. Through interactive activities and reflective practice, you will discover your strengths, refine how you present yourself and learn to lead, collaborate and communicate with impact.',
    image: '/images/program-personality-development.jpg',
    learning_outcomes: [
      'Carry yourself with genuine self-confidence',
      'Understand and use positive body language',
      'Lead discussions and teams with clarity',
      'Present ideas persuasively to any audience',
    ],
    highlights: [
      'Confidence-building activities',
      'Interactive group workshops',
      'Individual attention and guidance',
      'Real-world presentation practice',
    ],
    topics: [
      { id: 6, program_id: 2, topic_name: 'Confidence Building', display_order: 1 },
      { id: 7, program_id: 2, topic_name: 'Personality Enhancement', display_order: 2 },
      { id: 8, program_id: 2, topic_name: 'Body Language', display_order: 3 },
      { id: 9, program_id: 2, topic_name: 'Leadership Skills', display_order: 4 },
      { id: 10, program_id: 2, topic_name: 'Presentation Skills', display_order: 5 },
    ],
    duration: '',
    fees: '',
    certification: '',
    trainer_info: '',
    learning_modes: ['online', 'offline', 'hybrid'],
    display_order: 2,
    status: 'active',
    created_at: nowIso(),
    updated_at: nowIso(),
  },
  {
    id: 3,
    title: 'Parenting & Child Development',
    slug: 'parenting-child-development',
    short_description: 'Understand children better and develop positive parenting approaches.',
    description:
      'Understand children better and develop positive parenting approaches. This program helps parents build stronger, calmer and more connected relationships with their children — grounded in an understanding of child psychology, emotional intelligence and healthy everyday habits.',
    image: '/images/program-parenting.jpg',
    learning_outcomes: [
      'Understand the emotional and developmental needs of children',
      'Communicate with children in a positive, respectful way',
      'Nurture emotional intelligence at home',
      'Build healthy, consistent parenting routines',
    ],
    highlights: [
      'Practical, everyday parenting strategies',
      'Supportive, judgement-free discussions',
      'Real-life scenarios and reflections',
      'Personal attention for every parent',
    ],
    topics: [
      { id: 11, program_id: 3, topic_name: 'Positive Parenting', display_order: 1 },
      { id: 12, program_id: 3, topic_name: 'Understanding Child Psychology', display_order: 2 },
      { id: 13, program_id: 3, topic_name: 'Effective Parent-Child Communication', display_order: 3 },
      { id: 14, program_id: 3, topic_name: 'Emotional Intelligence', display_order: 4 },
      { id: 15, program_id: 3, topic_name: 'Healthy Parenting Habits', display_order: 5 },
    ],
    duration: '',
    fees: '',
    certification: '',
    trainer_info: '',
    learning_modes: ['online', 'offline', 'hybrid'],
    display_order: 3,
    status: 'active',
    created_at: nowIso(),
    updated_at: nowIso(),
  },
];

const createInitialDb = () => ({
  nextId: { users: 2, programs: 4, topics: 16, enquiries: 1, admissions: 1, logs: 1 },
  users: [
    {
      id: 1,
      full_name: 'NŌRÉA Administrator',
      email: 'admin@norea.in',
      phone: '',
      password: 'Admin@1234',
      role: 'super_admin',
      status: 'active',
      last_login_at: null,
      created_at: nowIso(),
      updated_at: nowIso(),
    },
  ],
  profiles: {},
  programs: SEED_PROGRAMS,
  enquiries: [],
  admissions: [],
  logs: [],
  settings: { ...DEFAULT_SETTINGS },
});

const loadDb = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore corrupt storage */
  }
  const db = createInitialDb();
  saveDb(db);
  return db;
};

const saveDb = (db) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
};

const getSessionId = () => {
  const v = localStorage.getItem(SESSION_KEY);
  return v ? Number(v) : null;
};

const setSessionId = (id) => {
  if (id == null) localStorage.removeItem(SESSION_KEY);
  else localStorage.setItem(SESSION_KEY, String(id));
};

const sanitizeUser = (u) => {
  if (!u) return null;
  // eslint-disable-next-line no-unused-vars
  const { password, ...rest } = u;
  return rest;
};

const buildSession = (db, user) => ({
  ...sanitizeUser(user),
  profile: user.role === 'student' ? db.profiles[user.id] || { date_of_birth: null, address: '', profile_image: '' } : null,
  isAdmin: ADMIN_ROLES.includes(user.role),
  permissions: permissionsForRole(user.role),
});

const requireUser = (db) => {
  const id = getSessionId();
  const user = id ? db.users.find((u) => u.id === id) : null;
  if (!user) throw apiErr(401, 'Authentication required');
  if (user.status !== 'active') throw apiErr(403, 'Your account has been deactivated.');
  return user;
};

const requirePerm = (db, perm) => {
  const user = requireUser(db);
  if (!(PERMISSIONS[perm] || []).includes(user.role)) {
    throw apiErr(403, 'You do not have permission to perform this action.');
  }
  return user;
};

const addLog = (db, adminId, action, description) => {
  db.logs.unshift({
    id: db.nextId.logs++,
    admin_id: adminId,
    action,
    description,
    created_at: nowIso(),
  });
};

const paginate = (items, { page = 1, limit = 10 } = {}) => {
  const p = Math.max(1, Number(page) || 1);
  const l = Math.min(100, Math.max(1, Number(limit) || 10));
  const total = items.length;
  const start = (p - 1) * l;
  return {
    data: items.slice(start, start + l),
    pagination: { page: p, limit: l, total, totalPages: Math.max(1, Math.ceil(total / l)) },
  };
};

const enrichEnquiry = (db, e) => {
  const p = db.programs.find((x) => x.id === e.program_id);
  return { ...e, program_title: p?.title || null, program_slug: p?.slug || null };
};

const enrichAdmission = (db, a) => {
  const u = db.users.find((x) => x.id === a.user_id);
  const p = db.programs.find((x) => x.id === a.program_id);
  const r = db.users.find((x) => x.id === a.reviewed_by);
  return {
    ...a,
    student_name: u?.full_name || 'Unknown',
    student_email: u?.email || '',
    student_phone: u?.phone || '',
    program_title: p?.title || 'Program',
    program_slug: p?.slug || '',
    program_image: p?.image || '',
    program_duration: p?.duration || '',
    reviewed_by_name: r?.full_name || null,
  };
};

export const localApi = {
  // ---------------- AUTH ----------------
  me: async () => {
    const db = loadDb();
    const user = requireUser(db);
    return { success: true, user: buildSession(db, user) };
  },

  register: async ({ full_name, email, phone, password }) => {
    const db = loadDb();
    const normEmail = email.trim().toLowerCase();
    if (db.users.some((u) => u.email.toLowerCase() === normEmail)) {
      throw apiErr(409, 'An account with this email already exists.', { email: 'An account with this email already exists.' });
    }
    const user = {
      id: db.nextId.users++,
      full_name: full_name.trim(),
      email: normEmail,
      phone: phone?.trim() || '',
      password,
      role: 'student',
      status: 'active',
      last_login_at: nowIso(),
      created_at: nowIso(),
      updated_at: nowIso(),
    };
    db.users.push(user);
    db.profiles[user.id] = { date_of_birth: null, address: '', profile_image: '' };
    saveDb(db);
    setSessionId(user.id);
    return { success: true, message: 'Welcome to NŌRÉA! Your account has been created.', user: buildSession(db, user) };
  },

  login: async ({ email, password, portal }) => {
    const db = loadDb();
    const normEmail = email.trim().toLowerCase();
    const user = db.users.find((u) => u.email.toLowerCase() === normEmail && u.password === password);
    if (!user) throw apiErr(401, 'Invalid email or password.');
    if (user.status !== 'active') throw apiErr(403, 'Your account has been deactivated.');
    const isAdmin = ADMIN_ROLES.includes(user.role);
    if (portal === 'admin' && !isAdmin) throw apiErr(403, 'This sign-in is for NŌRÉA staff only. Please use the student login.');
    if (portal === 'student' && isAdmin) throw apiErr(403, 'Staff accounts must sign in through the admin portal.');
    user.last_login_at = nowIso();
    if (isAdmin) addLog(db, user.id, 'auth.login', `${user.full_name} signed in`);
    saveDb(db);
    setSessionId(user.id);
    return { success: true, message: `Welcome back, ${user.full_name.split(' ')[0]}.`, user: buildSession(db, user) };
  },

  logout: async () => {
    setSessionId(null);
    return { success: true, message: 'You have been signed out.' };
  },

  changePassword: async ({ current_password, new_password }) => {
    const db = loadDb();
    const user = requireUser(db);
    if (user.password !== current_password) {
      throw apiErr(422, 'Current password is incorrect.', { current_password: 'Current password is incorrect.' });
    }
    user.password = new_password;
    user.updated_at = nowIso();
    if (ADMIN_ROLES.includes(user.role)) addLog(db, user.id, 'auth.password', 'Changed own password');
    saveDb(db);
    return { success: true, message: 'Your password has been updated.' };
  },

  // ---------------- PROGRAMS ----------------
  listPrograms: async (params = {}) => {
    const db = loadDb();
    const includeAll = params.all === 1 || params.all === '1';
    const list = db.programs
      .filter((p) => includeAll || p.status === 'active')
      .sort((a, b) => (a.display_order - b.display_order) || (a.id - b.id))
      .map((p) => ({
        ...p,
        enquiry_count: db.enquiries.filter((e) => e.program_id === p.id).length,
        student_count: db.admissions.filter((a) => a.program_id === p.id && a.status === 'approved').length,
      }));
    return { success: true, data: list };
  },

  getProgram: async (slugOrId) => {
    const db = loadDb();
    const p = db.programs.find((x) => x.slug === slugOrId || String(x.id) === String(slugOrId));
    if (!p) throw apiErr(404, 'Program not found.');
    return { success: true, data: p };
  },

  createProgram: async (payload) => {
    const db = loadDb();
    const admin = requirePerm(db, 'programs:manage');
    let slug = slugify(payload.slug || payload.title);
    let n = 2;
    const base = slug;
    while (db.programs.some((p) => p.slug === slug)) slug = `${base}-${n++}`;

    const id = db.nextId.programs++;
    const topics = (payload.topics || []).map((t, i) => ({
      id: db.nextId.topics++,
      program_id: id,
      topic_name: typeof t === 'string' ? t : t.topic_name,
      display_order: i + 1,
    }));

    const program = {
      id,
      title: payload.title,
      slug,
      short_description: payload.short_description || '',
      description: payload.description,
      image: payload.image || '',
      learning_outcomes: payload.learning_outcomes || [],
      highlights: payload.highlights || [],
      topics,
      duration: payload.duration || '',
      fees: payload.fees || '',
      certification: payload.certification || '',
      trainer_info: payload.trainer_info || '',
      learning_modes: payload.learning_modes || ['online', 'offline', 'hybrid'],
      display_order: Number(payload.display_order) || 0,
      status: payload.status || 'active',
      created_at: nowIso(),
      updated_at: nowIso(),
    };
    db.programs.push(program);
    addLog(db, admin.id, 'program.create', `Created program "${program.title}"`);
    saveDb(db);
    return { success: true, message: 'Program created.', data: program };
  },

  updateProgram: async (id, payload) => {
    const db = loadDb();
    const admin = requirePerm(db, 'programs:manage');
    const p = db.programs.find((x) => x.id === Number(id));
    if (!p) throw apiErr(404, 'Program not found.');

    if (payload.slug && payload.slug !== p.slug) {
      let slug = slugify(payload.slug);
      let n = 2;
      const base = slug;
      while (db.programs.some((x) => x.slug === slug && x.id !== p.id)) slug = `${base}-${n++}`;
      p.slug = slug;
    }

    const fields = ['title', 'short_description', 'description', 'image', 'learning_outcomes', 'highlights', 'duration', 'fees', 'certification', 'trainer_info', 'learning_modes', 'display_order', 'status'];
    for (const f of fields) {
      if (payload[f] !== undefined) p[f] = payload[f];
    }
    if (Array.isArray(payload.topics)) {
      p.topics = payload.topics.map((t, i) => ({
        id: db.nextId.topics++,
        program_id: p.id,
        topic_name: typeof t === 'string' ? t : t.topic_name,
        display_order: i + 1,
      }));
    }
    p.updated_at = nowIso();
    addLog(db, admin.id, 'program.update', `Updated program "${p.title}"`);
    saveDb(db);
    return { success: true, message: 'Program updated.', data: p };
  },

  removeProgram: async (id) => {
    const db = loadDb();
    const admin = requirePerm(db, 'programs:manage');
    const idx = db.programs.findIndex((x) => x.id === Number(id));
    if (idx === -1) throw apiErr(404, 'Program not found.');
    if (db.admissions.some((a) => a.program_id === Number(id))) {
      throw apiErr(409, 'This program has admissions linked to it. Set its status to "Inactive" instead.');
    }
    const [removed] = db.programs.splice(idx, 1);
    addLog(db, admin.id, 'program.delete', `Deleted program "${removed.title}"`);
    saveDb(db);
    return { success: true, message: 'Program deleted.' };
  },

  // ---------------- ENQUIRIES ----------------
  submitEnquiry: async (payload) => {
    const db = loadDb();
    if (payload.website) throw apiErr(422, 'Spam detected.');
    const source = payload.source === 'contact' ? 'contact' : 'admission';
    const program_id = payload.program_id ? Number(payload.program_id) : null;
    const email = payload.email.trim().toLowerCase();
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;

    const dup = db.enquiries.find(
      (e) =>
        e.email === email &&
        e.source === source &&
        e.program_id === program_id &&
        !['closed', 'converted'].includes(e.status) &&
        new Date(e.created_at).getTime() >= cutoff &&
        (source !== 'contact' || e.message === (payload.message || ''))
    );
    if (dup) {
      throw apiErr(
        409,
        source === 'contact'
          ? 'We have already received this message. Our team will be in touch shortly.'
          : 'You have already enquired about this program in the last 24 hours. Our admissions team will contact you soon.'
      );
    }

    const id = db.nextId.enquiries++;
    db.enquiries.unshift({
      id,
      full_name: payload.full_name.trim(),
      email,
      phone: payload.phone?.trim() || '',
      program_id,
      learning_mode: source === 'contact' ? payload.learning_mode || null : payload.learning_mode,
      subject: payload.subject?.trim() || '',
      message: payload.message?.trim() || '',
      source,
      status: 'new',
      admin_notes: '',
      created_at: nowIso(),
      updated_at: nowIso(),
    });
    saveDb(db);
    return {
      success: true,
      message:
        source === 'contact'
          ? 'Thank you for reaching out. We will get back to you shortly.'
          : 'Thank you! Your enquiry has been received. Our admissions team will contact you shortly.',
      data: { id, reference: `NOR-${String(id).padStart(5, '0')}` },
    };
  },

  listEnquiries: async (params = {}) => {
    const db = loadDb();
    requirePerm(db, 'enquiries:view');
    const q = (params.search || '').toLowerCase();
    const rows = db.enquiries
      .filter((e) => {
        if (q && !`${e.full_name} ${e.email} ${e.phone} ${e.message}`.toLowerCase().includes(q)) return false;
        if (params.status && e.status !== params.status) return false;
        if (params.program_id && e.program_id !== Number(params.program_id)) return false;
        if (params.source && e.source !== params.source) return false;
        if (params.date_from && e.created_at.slice(0, 10) < params.date_from) return false;
        if (params.date_to && e.created_at.slice(0, 10) > params.date_to) return false;
        return true;
      })
      .map((e) => enrichEnquiry(db, e));
    return { success: true, ...paginate(rows, params) };
  },

  getEnquiry: async (id) => {
    const db = loadDb();
    requirePerm(db, 'enquiries:view');
    const e = db.enquiries.find((x) => x.id === Number(id));
    if (!e) throw apiErr(404, 'Enquiry not found.');
    return { success: true, data: enrichEnquiry(db, e) };
  },

  updateEnquiry: async (id, { status, admin_notes }) => {
    const db = loadDb();
    const admin = requirePerm(db, 'enquiries:update');
    const e = db.enquiries.find((x) => x.id === Number(id));
    if (!e) throw apiErr(404, 'Enquiry not found.');
    if (status) e.status = status;
    if (admin_notes !== undefined) e.admin_notes = admin_notes;
    e.updated_at = nowIso();
    addLog(db, admin.id, 'enquiry.update', `Updated enquiry #${e.id} (${e.full_name})`);
    saveDb(db);
    return { success: true, message: 'Enquiry updated.', data: enrichEnquiry(db, e) };
  },

  removeEnquiry: async (id) => {
    const db = loadDb();
    const admin = requirePerm(db, 'enquiries:delete');
    const idx = db.enquiries.findIndex((x) => x.id === Number(id));
    if (idx === -1) throw apiErr(404, 'Enquiry not found.');
    const [rem] = db.enquiries.splice(idx, 1);
    addLog(db, admin.id, 'enquiry.delete', `Deleted enquiry #${rem.id} from ${rem.full_name}`);
    saveDb(db);
    return { success: true, message: 'Enquiry deleted.' };
  },

  exportEnquiriesCsv: async (params = {}) => {
    const { data: rows } = await localApi.listEnquiries({ ...params, page: 1, limit: 10000 });
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const header = ['Reference', 'Date', 'Name', 'Email', 'Phone', 'Program', 'Mode', 'Source', 'Status', 'Message'];
    const lines = rows.map((r) =>
      [`NOR-${String(r.id).padStart(5, '0')}`, r.created_at, r.full_name, r.email, r.phone, r.program_title, r.learning_mode, r.source, r.status, r.message]
        .map(esc)
        .join(',')
    );
    return { data: `\uFEFF${[header.join(','), ...lines].join('\r\n')}` };
  },

  // ---------------- STUDENTS ----------------
  listStudents: async (params = {}) => {
    const db = loadDb();
    requirePerm(db, 'students:view');
    const q = (params.search || '').toLowerCase();
    let rows = db.users
      .filter((u) => u.role === 'student')
      .filter((u) => (!q || `${u.full_name} ${u.email} ${u.phone}`.toLowerCase().includes(q)) && (!params.status || u.status === params.status))
      .map((u) => ({
        ...sanitizeUser(u),
        enrolled_count: db.admissions.filter((a) => a.user_id === u.id && a.status === 'approved').length,
        pending_count: db.admissions.filter((a) => a.user_id === u.id && a.status === 'pending').length,
      }));
    if (params.sort === 'name') rows.sort((a, b) => a.full_name.localeCompare(b.full_name));
    else if (params.sort === 'oldest') rows.sort((a, b) => a.created_at.localeCompare(b.created_at));
    else rows.sort((a, b) => b.created_at.localeCompare(a.created_at));
    return { success: true, ...paginate(rows, params) };
  },

  getStudent: async (id) => {
    const db = loadDb();
    requirePerm(db, 'students:view');
    const u = db.users.find((x) => x.id === Number(id) && x.role === 'student');
    if (!u) throw apiErr(404, 'Student not found.');
    return {
      success: true,
      data: {
        ...sanitizeUser(u),
        profile: db.profiles[u.id] || {},
        admissions: db.admissions.filter((a) => a.user_id === u.id).map((a) => enrichAdmission(db, a)),
        enquiries: db.enquiries.filter((e) => e.email === u.email).map((e) => enrichEnquiry(db, e)),
      },
    };
  },

  createStudent: async (payload) => {
    const db = loadDb();
    const admin = requirePerm(db, 'students:manage');
    const email = payload.email.trim().toLowerCase();
    if (db.users.some((u) => u.email.toLowerCase() === email)) {
      throw apiErr(409, 'An account with this email already exists.', { email: 'Email already in use.' });
    }
    const user = {
      id: db.nextId.users++,
      full_name: payload.full_name.trim(),
      email,
      phone: payload.phone?.trim() || '',
      password: payload.password,
      role: 'student',
      status: payload.status || 'active',
      last_login_at: null,
      created_at: nowIso(),
      updated_at: nowIso(),
    };
    db.users.push(user);
    db.profiles[user.id] = {
      date_of_birth: payload.date_of_birth || null,
      address: payload.address || '',
      profile_image: '',
    };
    addLog(db, admin.id, 'student.create', `Added student ${user.full_name}`);
    saveDb(db);
    return { success: true, message: 'Student account created.', data: sanitizeUser(user) };
  },

  updateStudent: async (id, payload) => {
    const db = loadDb();
    const admin = requirePerm(db, 'students:manage');
    const u = db.users.find((x) => x.id === Number(id) && x.role === 'student');
    if (!u) throw apiErr(404, 'Student not found.');
    if (payload.email && payload.email.toLowerCase() !== u.email && db.users.some((x) => x.email === payload.email.toLowerCase())) {
      throw apiErr(409, 'Email already in use.', { email: 'Email already in use.' });
    }
    if (payload.full_name !== undefined) u.full_name = payload.full_name.trim();
    if (payload.email !== undefined) u.email = payload.email.trim().toLowerCase();
    if (payload.phone !== undefined) u.phone = payload.phone.trim();
    if (payload.status !== undefined) u.status = payload.status;
    if (payload.password) u.password = payload.password;
    u.updated_at = nowIso();
    db.profiles[u.id] = {
      ...(db.profiles[u.id] || {}),
      ...(payload.date_of_birth !== undefined ? { date_of_birth: payload.date_of_birth || null } : {}),
      ...(payload.address !== undefined ? { address: payload.address } : {}),
    };
    addLog(db, admin.id, 'student.update', `Updated student ${u.full_name}`);
    saveDb(db);
    return { success: true, message: 'Student updated.', data: sanitizeUser(u) };
  },

  removeStudent: async (id, mode = 'delete') => {
    const db = loadDb();
    const admin = requirePerm(db, 'students:manage');
    const idx = db.users.findIndex((x) => x.id === Number(id) && x.role === 'student');
    if (idx === -1) throw apiErr(404, 'Student not found.');
    const u = db.users[idx];
    if (mode === 'deactivate') {
      u.status = 'inactive';
      addLog(db, admin.id, 'student.deactivate', `Deactivated student ${u.full_name}`);
      saveDb(db);
      return { success: true, message: 'Student deactivated.' };
    }
    db.users.splice(idx, 1);
    db.admissions = db.admissions.filter((a) => a.user_id !== u.id);
    delete db.profiles[u.id];
    addLog(db, admin.id, 'student.delete', `Deleted student ${u.full_name}`);
    saveDb(db);
    return { success: true, message: 'Student permanently deleted.' };
  },

  // ---------------- ADMISSIONS ----------------
  listAdmissions: async (params = {}) => {
    const db = loadDb();
    const user = requireUser(db);
    const q = (params.search || '').toLowerCase();
    const rows = db.admissions
      .filter((a) => (user.role === 'student' ? a.user_id === user.id : true))
      .map((a) => enrichAdmission(db, a))
      .filter((a) => {
        if (params.status && a.status !== params.status) return false;
        if (params.program_id && a.program_id !== Number(params.program_id)) return false;
        if (q && !`${a.student_name} ${a.student_email}`.toLowerCase().includes(q)) return false;
        return true;
      });
    return { success: true, ...paginate(rows, params) };
  },

  createAdmission: async (payload) => {
    const db = loadDb();
    const user = requireUser(db);
    const program = db.programs.find((p) => p.id === Number(payload.program_id));
    if (!program) throw apiErr(422, 'Please select a valid program.');

    let userId = user.role === 'student' ? user.id : Number(payload.user_id || 0);
    if (user.role !== 'student' && !userId && payload.new_student) {
      const email = payload.new_student.email.trim().toLowerCase();
      let existing = db.users.find((u) => u.email === email);
      if (!existing) {
        existing = {
          id: db.nextId.users++,
          full_name: payload.new_student.full_name.trim(),
          email,
          phone: payload.new_student.phone?.trim() || '',
          password: payload.new_student.password,
          role: 'student',
          status: 'active',
          last_login_at: null,
          created_at: nowIso(),
          updated_at: nowIso(),
        };
        db.users.push(existing);
        db.profiles[existing.id] = { date_of_birth: null, address: '', profile_image: '' };
      }
      userId = existing.id;
    }

    if (db.admissions.some((a) => a.user_id === userId && a.program_id === program.id)) {
      throw apiErr(409, 'An admission for this student and program already exists.');
    }

    const status = user.role === 'student' ? 'pending' : payload.status || 'pending';
    const adm = {
      id: db.nextId.admissions++,
      user_id: userId,
      program_id: program.id,
      enquiry_id: payload.enquiry_id ? Number(payload.enquiry_id) : null,
      status,
      admission_date: status === 'approved' ? todayStr() : null,
      notes: payload.notes || '',
      reviewed_by: status !== 'pending' ? user.id : null,
      created_at: nowIso(),
      updated_at: nowIso(),
    };
    db.admissions.unshift(adm);

    if (adm.enquiry_id) {
      const enq = db.enquiries.find((e) => e.id === adm.enquiry_id);
      if (enq) enq.status = 'converted';
    }
    if (user.role !== 'student') {
      const enriched = enrichAdmission(db, adm);
      addLog(db, user.id, 'admission.create', `Created ${status} admission for ${enriched.student_name} → ${program.title}`);
    }
    saveDb(db);
    return {
      success: true,
      message: user.role === 'student' ? 'Your application has been submitted.' : 'Admission created.',
      data: enrichAdmission(db, adm),
    };
  },

  updateAdmission: async (id, { status, admission_date, notes }) => {
    const db = loadDb();
    const admin = requirePerm(db, 'admissions:decide');
    const a = db.admissions.find((x) => x.id === Number(id));
    if (!a) throw apiErr(404, 'Admission not found.');
    if (status) {
      a.status = status;
      a.reviewed_by = admin.id;
      if (status === 'approved' && !a.admission_date && !admission_date) a.admission_date = todayStr();
    }
    if (admission_date !== undefined) a.admission_date = admission_date || null;
    if (notes !== undefined) a.notes = notes;
    a.updated_at = nowIso();
    if (status === 'approved' && a.enquiry_id) {
      const enq = db.enquiries.find((e) => e.id === a.enquiry_id);
      if (enq) enq.status = 'converted';
    }
    const enriched = enrichAdmission(db, a);
    if (status) addLog(db, admin.id, `admission.${status}`, `Admission #${a.id}: ${enriched.student_name} marked ${status}`);
    saveDb(db);
    return { success: true, message: status ? `Admission ${status}.` : 'Admission updated.', data: enriched };
  },

  removeAdmission: async (id) => {
    const db = loadDb();
    const admin = requirePerm(db, 'admissions:decide');
    const idx = db.admissions.findIndex((x) => x.id === Number(id));
    if (idx === -1) throw apiErr(404, 'Admission not found.');
    db.admissions.splice(idx, 1);
    addLog(db, admin.id, 'admission.delete', `Deleted admission #${id}`);
    saveDb(db);
    return { success: true, message: 'Admission removed.' };
  },

  // ---------------- DASHBOARD & REPORTS ----------------
  stats: async () => {
    const db = loadDb();
    requirePerm(db, 'dashboard:view');
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return {
      success: true,
      data: {
        total_enquiries: db.enquiries.length,
        new_enquiries: db.enquiries.filter((e) => e.status === 'new').length,
        total_students: db.users.filter((u) => u.role === 'student').length,
        active_students: db.users.filter((u) => u.role === 'student' && u.status === 'active').length,
        total_programs: db.programs.length,
        active_programs: db.programs.filter((p) => p.status === 'active').length,
        approved_admissions: db.admissions.filter((a) => a.status === 'approved').length,
        pending_admissions: db.admissions.filter((a) => a.status === 'pending').length,
        rejected_admissions: db.admissions.filter((a) => a.status === 'rejected').length,
        enquiries_last_7_days: db.enquiries.filter((e) => new Date(e.created_at).getTime() >= weekAgo).length,
        recentEnquiries: db.enquiries.slice(0, 6).map((e) => enrichEnquiry(db, e)),
        pendingAdmissions: db.admissions
          .filter((a) => a.status === 'pending')
          .slice(0, 5)
          .map((a) => enrichAdmission(db, a)),
      },
    };
  },

  analytics: async ({ months = 12 } = {}) => {
    const db = loadDb();
    requirePerm(db, 'reports:view');
    const mCount = Math.min(24, Math.max(3, Number(months) || 12));
    const now = new Date();
    const monthly = [];
    for (let i = mCount - 1; i >= 0; i--) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
      const bucket = db.enquiries.filter((e) => e.created_at.slice(0, 7) === key);
      monthly.push({
        month: key,
        label: d.toLocaleString('en', { month: 'short', year: '2-digit', timeZone: 'UTC' }),
        enquiries: bucket.length,
        converted: bucket.filter((e) => e.status === 'converted').length,
      });
    }

    const progMap = {};
    for (const e of db.enquiries) {
      const title = db.programs.find((p) => p.id === e.program_id)?.title || 'General / Contact';
      progMap[title] ||= { program: title, count: 0, converted: 0 };
      progMap[title].count += 1;
      if (e.status === 'converted') progMap[title].converted += 1;
    }

    const statusMap = {};
    const modeMap = {};
    for (const e of db.enquiries) {
      statusMap[e.status] = (statusMap[e.status] || 0) + 1;
      if (e.learning_mode) modeMap[e.learning_mode] = (modeMap[e.learning_mode] || 0) + 1;
    }

    const total = db.enquiries.length;
    const converted = db.enquiries.filter((e) => e.status === 'converted').length;
    const admTotal = db.admissions.length;
    const approved = db.admissions.filter((a) => a.status === 'approved').length;

    return {
      success: true,
      data: {
        monthly,
        byProgram: Object.values(progMap).sort((a, b) => b.count - a.count),
        byStatus: Object.entries(statusMap).map(([status, count]) => ({ status, count })),
        byMode: Object.entries(modeMap).map(([mode, count]) => ({ mode, count })),
        conversion: {
          totalEnquiries: total,
          convertedEnquiries: converted,
          enquiryConversionRate: total ? +((converted / total) * 100).toFixed(1) : 0,
          totalAdmissions: admTotal,
          approvedAdmissions: approved,
          rejectedAdmissions: db.admissions.filter((a) => a.status === 'rejected').length,
          pendingAdmissions: db.admissions.filter((a) => a.status === 'pending').length,
          admissionApprovalRate: admTotal ? +((approved / admTotal) * 100).toFixed(1) : 0,
          enquiryToAdmissionRate: total ? +((approved / total) * 100).toFixed(1) : 0,
        },
      },
    };
  },

  activity: async (params = {}) => {
    const db = loadDb();
    requirePerm(db, 'logs:view');
    const rows = db.logs.map((l) => {
      const u = db.users.find((x) => x.id === l.admin_id);
      return { ...l, admin_name: u?.full_name || 'System', admin_role: u?.role || '' };
    });
    return { success: true, ...paginate(rows, { limit: 20, ...params }) };
  },

  // ---------------- SETTINGS ----------------
  getSettings: async () => {
    const db = loadDb();
    return { success: true, data: { ...DEFAULT_SETTINGS, ...db.settings } };
  },

  updateSettings: async (settings) => {
    const db = loadDb();
    const admin = requirePerm(db, 'settings:manage');
    db.settings = { ...db.settings, ...settings };
    addLog(db, admin.id, 'settings.update', 'Updated website settings');
    saveDb(db);
    return { success: true, message: 'Settings saved.', data: db.settings };
  },

  // ---------------- PORTAL ----------------
  portalOverview: async () => {
    const db = loadDb();
    const user = requireUser(db);
    return {
      success: true,
      data: {
        profile: db.profiles[user.id] || {},
        admissions: db.admissions.filter((a) => a.user_id === user.id).map((a) => enrichAdmission(db, a)),
        enquiries: db.enquiries.filter((e) => e.email === user.email).map((e) => enrichEnquiry(db, e)),
      },
    };
  },

  updateMyProfile: async ({ full_name, phone, date_of_birth, address, profile_image }) => {
    const db = loadDb();
    const user = requireUser(db);
    if (full_name !== undefined) user.full_name = full_name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    user.updated_at = nowIso();
    db.profiles[user.id] = {
      ...(db.profiles[user.id] || {}),
      ...(date_of_birth !== undefined ? { date_of_birth: date_of_birth || null } : {}),
      ...(address !== undefined ? { address } : {}),
      ...(profile_image !== undefined ? { profile_image } : {}),
    };
    saveDb(db);
    return { success: true, message: 'Profile updated.', data: { ...sanitizeUser(user), profile: db.profiles[user.id] } };
  },

  // ---------------- ADMIN USERS ----------------
  listUsers: async () => {
    const db = loadDb();
    requirePerm(db, 'users:manage');
    return { success: true, data: db.users.filter((u) => ADMIN_ROLES.includes(u.role)).map(sanitizeUser) };
  },

  createUser: async (payload) => {
    const db = loadDb();
    const admin = requirePerm(db, 'users:manage');
    const email = payload.email.trim().toLowerCase();
    if (db.users.some((u) => u.email === email)) throw apiErr(409, 'Email already in use.', { email: 'Email already in use.' });
    const u = {
      id: db.nextId.users++,
      full_name: payload.full_name.trim(),
      email,
      phone: payload.phone?.trim() || '',
      password: payload.password,
      role: payload.role,
      status: payload.status || 'active',
      last_login_at: null,
      created_at: nowIso(),
      updated_at: nowIso(),
    };
    db.users.push(u);
    addLog(db, admin.id, 'user.create', `Created ${u.role} account for ${u.full_name}`);
    saveDb(db);
    return { success: true, message: 'Team member added.', data: sanitizeUser(u) };
  },

  updateUser: async (id, payload) => {
    const db = loadDb();
    const admin = requirePerm(db, 'users:manage');
    const u = db.users.find((x) => x.id === Number(id) && ADMIN_ROLES.includes(x.role));
    if (!u) throw apiErr(404, 'Team member not found.');
    if (payload.full_name !== undefined) u.full_name = payload.full_name.trim();
    if (payload.email !== undefined) u.email = payload.email.trim().toLowerCase();
    if (payload.phone !== undefined) u.phone = payload.phone.trim();
    if (payload.role !== undefined) u.role = payload.role;
    if (payload.status !== undefined) u.status = payload.status;
    if (payload.password) u.password = payload.password;
    u.updated_at = nowIso();
    addLog(db, admin.id, 'user.update', `Updated team member ${u.full_name}`);
    saveDb(db);
    return { success: true, message: 'Team member updated.', data: sanitizeUser(u) };
  },

  removeUser: async (id) => {
    const db = loadDb();
    const admin = requirePerm(db, 'users:manage');
    if (Number(id) === admin.id) throw apiErr(400, 'You cannot delete your own account.');
    const idx = db.users.findIndex((x) => x.id === Number(id) && ADMIN_ROLES.includes(x.role));
    if (idx === -1) throw apiErr(404, 'Team member not found.');
    const [rem] = db.users.splice(idx, 1);
    addLog(db, admin.id, 'user.delete', `Removed team member ${rem.full_name}`);
    saveDb(db);
    return { success: true, message: 'Team member removed.' };
  },

  // ---------------- IMAGE UPLOAD (Data URL) ----------------
  uploadImage: (file, onProgress) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onprogress = (e) => {
        if (e.lengthComputable) onProgress?.(Math.round((e.loaded * 100) / e.total));
      };
      reader.onload = () => {
        onProgress?.(100);
        resolve({ success: true, message: 'Image uploaded.', data: { url: reader.result } });
      };
      reader.onerror = () => reject(apiErr(400, 'Failed to read image file.'));
      reader.readAsDataURL(file);
    }),
};
