import { body, param, query } from 'express-validator';

const PHONE_RE = /^\+?[0-9\s\-()]{7,20}$/;
const PASSWORD_MSG = 'Password must be at least 8 characters and include a letter and a number.';

const name = (field = 'full_name') =>
  body(field)
    .trim()
    .notEmpty().withMessage('Full name is required.')
    .bail()
    .isLength({ min: 2, max: 120 }).withMessage('Name must be between 2 and 120 characters.')
    .matches(/^[\p{L}\p{M}\s.'-]+$/u).withMessage('Name may contain letters, spaces, apostrophes and hyphens only.');

const email = (field = 'email') =>
  body(field)
    .trim()
    .notEmpty().withMessage('Email address is required.')
    .bail()
    .isEmail().withMessage('Please enter a valid email address.')
    .bail()
    .isLength({ max: 190 })
    .normalizeEmail({ gmail_remove_dots: false, gmail_remove_subaddress: false });

const phone = (field = 'phone', required = false) => {
  const chain = body(field).trim();
  return (required ? chain.notEmpty().withMessage('Mobile number is required.').bail() : chain.optional({ values: 'falsy' }))
    .matches(PHONE_RE).withMessage('Please enter a valid mobile number.');
};

/** Strip HTML tags & control characters from free text. */
export const cleanText = (v) =>
  typeof v === 'string' ? v.replace(/<[^>]*>/g, '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '') : v;

const password = (field = 'password', chain = body(field)) =>
  chain
    .isString().withMessage(PASSWORD_MSG)
    .isLength({ min: 8, max: 72 }).withMessage(PASSWORD_MSG)
    .matches(/[A-Za-z]/).withMessage(PASSWORD_MSG)
    .matches(/\d/).withMessage(PASSWORD_MSG);

export const idParam = [param('id').isInt({ min: 1 }).withMessage('Invalid id.').toInt()];

export const paginationQuery = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isString().isLength({ max: 120 }),
];

// ---------- auth ----------
export const registerRules = [name(), email(), phone('phone', true), password()];

export const loginRules = [
  email(),
  body('password').isString().notEmpty().withMessage('Password is required.'),
  body('portal').optional().isIn(['admin', 'student']),
];

export const changePasswordRules = [
  body('current_password').isString().notEmpty().withMessage('Current password is required.'),
  password('new_password'),
  body('confirm_password').custom((v, { req }) => {
    if (v !== req.body.new_password) throw new Error('Passwords do not match.');
    return true;
  }),
];

export const updateProfileRules = [
  name().optional(),
  phone('phone'),
  body('date_of_birth')
    .optional({ values: 'falsy' })
    .isISO8601({ strict: true }).withMessage('Please enter a valid date.')
    .bail()
    .custom((v) => {
      const d = new Date(v);
      if (d > new Date()) throw new Error('Date of birth cannot be in the future.');
      if (d < new Date('1900-01-01')) throw new Error('Please enter a valid date of birth.');
      return true;
    }),
  body('address').optional({ values: 'null' }).isString().trim().isLength({ max: 500 }).withMessage('Address is too long.'),
  body('profile_image').optional({ values: 'null' }).isString().isLength({ max: 255 }),
];

// ---------- programs ----------
const stringList = (field, max = 20) =>
  body(field)
    .optional()
    .isArray({ max }).withMessage(`${field} must be a list (max ${max}).`)
    .bail()
    .custom((arr) => arr.every((s) => typeof s === 'string' && s.trim().length > 0 && s.length <= 300))
    .withMessage('Each item must be a non-empty text up to 300 characters.')
    .customSanitizer((arr) => arr.map((s) => s.trim()));

export const programRules = (isUpdate = false) => {
  const req = (chain) => (isUpdate ? chain.optional() : chain);
  return [
    req(body('title').trim().notEmpty().withMessage('Title is required.').bail().isLength({ max: 160 })),
    body('slug')
      .optional({ values: 'falsy' })
      .trim()
      .toLowerCase()
      .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).withMessage('Slug may contain lowercase letters, numbers and hyphens.')
      .isLength({ max: 180 }),
    body('short_description').optional({ values: 'null' }).trim().isLength({ max: 300 }),
    req(body('description').trim().notEmpty().withMessage('Description is required.').bail().isLength({ max: 10000 })),
    body('image')
      .optional({ values: 'null' })
      .trim()
      .isLength({ max: 255 })
      .custom((v) => v === '' || /^\/(uploads|images)\/[\w\-.]+$/.test(v) || /^https:\/\/[^\s]+$/.test(v))
      .withMessage('Invalid image path.'),
    stringList('learning_outcomes'),
    stringList('highlights'),
    stringList('topics', 30),
    body('learning_modes')
      .optional()
      .isArray()
      .custom((arr) => arr.every((m) => ['online', 'offline', 'hybrid'].includes(m)))
      .withMessage('Invalid learning mode.'),
    body('duration').optional({ values: 'null' }).trim().isLength({ max: 100 }),
    body('fees').optional({ values: 'null' }).trim().isLength({ max: 100 }),
    body('certification').optional({ values: 'null' }).trim().isLength({ max: 255 }),
    body('trainer_info').optional({ values: 'null' }).trim().isLength({ max: 5000 }),
    body('display_order').optional().isInt({ min: 0, max: 9999 }).toInt(),
    body('status').optional().isIn(['active', 'inactive', 'draft']).withMessage('Invalid status.'),
  ];
};

// ---------- enquiries ----------
const isContact = (req) => req.body.source === 'contact';

export const enquiryCreateRules = [
  name(),
  email(),
  body('source').optional().isIn(['admission', 'contact']).withMessage('Invalid source.'),
  body('phone')
    .trim()
    .custom((v, { req }) => {
      if (!v) {
        if (isContact(req)) return true;
        throw new Error('Mobile number is required.');
      }
      if (!PHONE_RE.test(v)) throw new Error('Please enter a valid mobile number.');
      return true;
    }),
  body('program_id').custom((v, { req }) => {
    if (v === undefined || v === null || v === '') {
      if (isContact(req)) return true;
      throw new Error('Please select a program.');
    }
    if (!Number.isInteger(Number(v)) || Number(v) < 1) throw new Error('Please select a program.');
    return true;
  }),
  body('learning_mode').custom((v, { req }) => {
    if (!v) {
      if (isContact(req)) return true;
      throw new Error('Please select a preferred learning mode.');
    }
    if (!['online', 'offline', 'hybrid'].includes(v)) throw new Error('Please select a valid learning mode.');
    return true;
  }),
  body('subject').optional({ values: 'falsy' }).isString().trim().isLength({ max: 200 }).customSanitizer(cleanText),
  body('message')
    .optional({ values: 'null' })
    .isString()
    .trim()
    .customSanitizer(cleanText)
    .custom((v, { req }) => {
      if (isContact(req) && (!v || v.length < 10)) throw new Error('Please write a message of at least 10 characters.');
      if (v && v.length > 2000) throw new Error('Message must be under 2000 characters.');
      return true;
    }),
  // Honeypot – bots fill hidden fields, humans don't.
  body('website').optional().isEmpty().withMessage('Spam detected.'),
];

export const enquiryUpdateRules = [
  ...idParam,
  body('status').optional().isIn(['new', 'contacted', 'follow_up', 'converted', 'closed']).withMessage('Invalid status.'),
  body('admin_notes').optional({ values: 'null' }).isString().trim().isLength({ max: 5000 }),
];

export const enquiryListRules = [
  ...paginationQuery,
  query('status').optional({ values: 'falsy' }).isIn(['new', 'contacted', 'follow_up', 'converted', 'closed']),
  query('program_id').optional({ values: 'falsy' }).isInt({ min: 1 }),
  query('source').optional({ values: 'falsy' }).isIn(['admission', 'contact']),
  query('learning_mode').optional({ values: 'falsy' }).isIn(['online', 'offline', 'hybrid']),
  query('date_from').optional({ values: 'falsy' }).isISO8601({ strict: true }).withMessage('Invalid start date.'),
  query('date_to').optional({ values: 'falsy' }).isISO8601({ strict: true }).withMessage('Invalid end date.'),
];

// ---------- students (admin) ----------
export const studentCreateRules = [
  name(),
  email(),
  phone('phone', true),
  password(),
  body('status').optional().isIn(['active', 'inactive']),
  ...updateProfileRules.slice(2),
];

export const studentUpdateRules = [
  ...idParam,
  name().optional(),
  email().optional(),
  phone('phone'),
  body('status').optional().isIn(['active', 'inactive']).withMessage('Invalid status.'),
  password('password').optional({ values: 'falsy' }),
  ...updateProfileRules.slice(2),
];

// ---------- admissions ----------
export const admissionCreateRules = [
  body('program_id').isInt({ min: 1 }).withMessage('Please select a program.').toInt(),
  body('user_id').optional({ values: 'falsy' }).isInt({ min: 1 }).toInt(),
  body('enquiry_id').optional({ values: 'falsy' }).isInt({ min: 1 }).toInt(),
  body('status').optional().isIn(['pending', 'approved', 'rejected']),
  body('notes').optional({ values: 'null' }).isString().trim().isLength({ max: 2000 }),
  body('new_student').optional().isObject(),
  body('new_student.full_name').if(body('new_student').exists()).trim().notEmpty().withMessage('Student name is required.').isLength({ max: 120 }),
  body('new_student.email').if(body('new_student').exists()).trim().isEmail().withMessage('Valid student email is required.').normalizeEmail({ gmail_remove_dots: false, gmail_remove_subaddress: false }),
  body('new_student.phone').if(body('new_student').exists()).optional({ values: 'falsy' }).trim().matches(PHONE_RE).withMessage('Invalid phone number.'),
  password('new_student.password', body('new_student.password').if(body('new_student').exists())),
];

export const admissionUpdateRules = [
  ...idParam,
  body('status').optional().isIn(['pending', 'approved', 'rejected']).withMessage('Invalid status.'),
  body('admission_date').optional({ values: 'null' }).custom((v) => v === '' || /^\d{4}-\d{2}-\d{2}$/.test(v)).withMessage('Invalid date.'),
  body('notes').optional({ values: 'null' }).isString().trim().isLength({ max: 2000 }),
];

// ---------- admin users ----------
export const adminUserCreateRules = [
  name(),
  email(),
  phone('phone'),
  password(),
  body('role').isIn(['super_admin', 'admin', 'staff']).withMessage('Invalid role.'),
  body('status').optional().isIn(['active', 'inactive']),
];

export const adminUserUpdateRules = [
  ...idParam,
  name().optional(),
  email().optional(),
  phone('phone'),
  password('password').optional({ values: 'falsy' }),
  body('role').optional().isIn(['super_admin', 'admin', 'staff']).withMessage('Invalid role.'),
  body('status').optional().isIn(['active', 'inactive']),
];

// ---------- settings ----------
export const settingsRules = [
  body('settings').isObject().withMessage('settings must be an object.'),
  body('settings.*').optional({ values: 'null' }).isString().isLength({ max: 5000 }).withMessage('Value is too long.'),
  body('settings.contact_email').optional({ values: 'falsy' }).isEmail().withMessage('Invalid contact email.'),
  body('settings.contact_phone').optional({ values: 'falsy' }).matches(PHONE_RE).withMessage('Invalid phone number.'),
  body('settings.map_embed_url')
    .optional({ values: 'falsy' })
    .matches(/^https:\/\/(www\.)?google\.[a-z.]+\/maps\/embed\?/)
    .withMessage('Use the Google Maps "Embed a map" URL (https://www.google.com/maps/embed?...).'),
  ...['social_instagram', 'social_facebook', 'social_linkedin', 'social_youtube', 'social_x'].map((k) =>
    body(`settings.${k}`).optional({ values: 'falsy' }).isURL({ protocols: ['https', 'http'], require_protocol: true }).withMessage('Enter a full URL starting with https://')
  ),
];
