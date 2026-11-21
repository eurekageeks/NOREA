# NŌRÉA – Learning & Development Platform

**Tagline:** *Learn • Express • Grow*  
**Headline:** *Building Confidence. Nurturing Potential.*

A full-stack educational and personal development web platform built with **React (Vite + Tailwind CSS + Framer Motion)**, **Node.js + Express**, and **MySQL 8+**.

---

## Project Structure

```
norea/
├── frontend/                   # React + Vite SPA
│   ├── public/images/          # Editorial brand photography
│   └── src/
│       ├── components/         # Shared UI & public brand components
│       ├── context/            # AuthContext, SettingsContext
│       ├── hooks/              # useAsync, useDebounce, useSeo, etc.
│       ├── layouts/            # PublicLayout, PortalLayout, AdminLayout
│       ├── pages/
│       │   ├── public/         # Home, About, Programs, ProgramDetail, WhyNorea, Admissions, Contact
│       │   ├── auth/           # Student Login/Register, Admin Sign In
│       │   ├── portal/         # Student Dashboard, Profile & Security
│       │   └── admin/          # Overview, Enquiries, Admissions, Programs, Students, Reports, Settings, Team
│       ├── routes/             # Role & permission route guards
│       ├── services/           # Axios client & domain API modules
│       └── utils/              # Constants, formatting & validators
├── backend/                    # Express.js REST API (MVC)
│   ├── scripts/                # initDb.js, createAdmin.js
│   ├── src/
│   │   ├── config/             # env.js, db.js (mysql2 pool), permissions.js
│   │   ├── controllers/        # auth, program, enquiry, student, admission, misc
│   │   ├── middleware/         # auth, validate, errorHandler, rateLimiters, upload
│   │   ├── models/             # Parameterized SQL queries
│   │   ├── routes/             # /api/* routes
│   │   ├── services/           # authService
│   │   ├── utils/              # ApiError, asyncHandler, helpers, token
│   │   └── validators/         # express-validator rules
│   ├── tests/                  # Integration tests
│   └── uploads/                # Uploaded images (served statically)
├── database/
│   ├── schema.sql              # Normalized MySQL 8+ schema (norea_learning)
│   └── seed.sql                # 3 flagship NŌRÉA programs, topics & default settings
└── README.md
```

---

## Prerequisites

- **Node.js** 20+
- **MySQL** 8.0+

---

## 1. Database Setup

### Option A — Automated script (recommended)

1. Copy `backend/.env.example` to `backend/.env` and configure your MySQL credentials (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`) and a strong `JWT_SECRET`.
2. Initialize the schema and seed data:

```bash
cd norea/backend
npm install
npm run db:init
```

3. Create your first **Super Admin** account (passwords are never hard-coded in SQL):

```bash
npm run db:admin -- --email admin@yourdomain.com --password "YourStrongPassword1" --name "NŌRÉA Admin"
```

### Option B — Manual MySQL CLI

```bash
mysql -u root -p < norea/database/schema.sql
mysql -u root -p norea_learning < norea/database/seed.sql
```

Then run `npm run db:admin` inside `norea/backend`.

---

## 2. Running Locally (Development)

Open two terminals:

**Backend API** (`http://localhost:5050`):
```bash
cd norea/backend
npm run dev
```

**Frontend App** (`http://localhost:5173`, proxies `/api`, `/uploads`, `/sitemap.xml`, `/robots.txt` to the backend):
```bash
cd norea/frontend
npm install
npm run dev
```

### Key URLs
- Public Website: `http://localhost:5173/`
- Student Login / Registration: `http://localhost:5173/login`
- Student Portal: `http://localhost:5173/portal`
- Admin Sign In: `http://localhost:5173/admin/login`
- Admin Dashboard: `http://localhost:5173/admin`

---

## 3. Running Tests

With MySQL running and `norea_learning` initialized:

```bash
cd norea/backend
npm test
```

---

## 4. Security & Architecture Highlights

- **Authentication**: JWT stored in `httpOnly`, `SameSite=Lax` cookies (never in `localStorage`), with `token_version` invalidation on password change or deactivation.
- **Passwords**: Hashed with `bcryptjs` (12 rounds in production) and timing-equalized login checks.
- **Authorization**: Strict role & permission matrix (`super_admin`, `admin`, `staff`, `student`). Students cannot access any admin endpoints.
- **SQL Injection Protection**: 100% parameterized queries via `mysql2/promise` connection pooling.
- **Input Validation & Sanitization**: `express-validator` on all routes + honeypot spam protection + 24-hour duplicate enquiry guard.
- **Uploads**: Random server-generated filenames, MIME allow-list, size limit, and magic-byte header verification.
- **HTTP Hardening**: `helmet`, strict `cors`, `express-rate-limit` (separate tiers for general API, auth, and public forms), and centralized error handling.
- **Admin-Configurable Content**: Contact details, social links, Google Maps embed, hero copy, and optional program metadata (duration, fees, certification, trainer info) are all managed from **Admin ▸ Website Settings** and **Admin ▸ Programs** — nothing is hard-coded or invented.

---

## 5. Production Deployment

1. **Build the frontend**:
   ```bash
   cd norea/frontend
   npm run build
   ```
2. **Configure `backend/.env` for production**:
   - `NODE_ENV=production`
   - `JWT_SECRET=<64+ char random hex>`
   - `CLIENT_ORIGIN=https://yourdomain.com`
   - `SITE_URL=https://yourdomain.com`
   - `COOKIE_SECURE=true` (requires HTTPS)
   - `TRUST_PROXY=1` (when behind Nginx / Cloudflare / load balancer)
   - `SERVE_FRONTEND=true` (optional: serve `frontend/dist` directly from Express on a single server, or serve `frontend/dist` from Nginx/CDN and reverse-proxy `/api` & `/uploads` to Node)
3. **Start the backend** (e.g. with PM2 or systemd):
   ```bash
   cd norea/backend
   npm start
   ```
