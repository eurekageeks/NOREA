# NŌRÉA – Learning & Development

**Tagline:** *Learn • Express • Grow*  
**Headline:** *Building Confidence. Nurturing Potential.*

A modern, responsive React + Vite + Tailwind CSS + Framer Motion web application for **NŌRÉA – Learning & Development**, running 100% in the browser with client-side `localStorage` persistence (no backend server or database required).

---

## Features

- **Public Website**: Home, About Us, Our Programs, dynamic Program Details (`/programs/:slug`), Why NŌRÉA, Admissions Enquiry Form, and Contact Us.
- **Student Portal (`/portal`)**: Registration, Login/Logout, Dashboard (enrolled programs, application & enquiry status, apply for programs), Profile & photo upload, and Password Change.
- **Admin Dashboard (`/admin`)**: Overview KPIs & charts, Enquiry Management (search, filter, status workflow, notes, CSV export, convert to admission), Program CRUD with image upload, Student Management, Admission Approval/Rejection, Recharts Analytics, Website Settings, and Team & Activity Logs.

### Default Admin Login
- **URL:** `/admin/login`
- **Email:** `admin@norea.in`
- **Password:** `Admin@1234`

---

## Local Development

```bash
cd norea/frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

---

## Deploy to Vercel (Zero Config)

1. Push this repository to GitHub.
2. Import the repository in Vercel — the root [vercel.json](../vercel.json) automatically builds `norea/frontend` and outputs `norea/frontend/dist` with SPA routing enabled.
3. No environment variables or database setup required.
