# NŌRÉA – Learning & Development

**Tagline:** *Learn • Express • Grow*  
**Headline:** *Building Confidence. Nurturing Potential.*

A vibrant, colourful, student-friendly website built with **React + Vite + Tailwind CSS + Framer Motion** — with **zero database** and **zero backend**.

## Features
- **Colourful Student-Friendly Design**: Bright indigo, coral, amber, and teal theme across Home, About Us, Our Programs, Program Details, Why NŌRÉA, Admissions, and Contact Us.
- **Simple Enquiry Form with WhatsApp & Email Notifications**:
  - Submitting an enquiry generates a reference number (`NOR-XXXXX`) and triggers **WhatsApp** (`wa.me`) and **Email** notifications (automatic via `VITE_INSTITUTE_EMAIL` / FormSubmit or `VITE_WEB3FORMS_KEY`, plus instant one-click WhatsApp & Email buttons).

## Optional Notification Config (Vercel Environment Variables)
- `VITE_INSTITUTE_EMAIL` — your institute email (enables automatic background email + student auto-reply via FormSubmit)
- `VITE_WHATSAPP_NUMBER` — your WhatsApp number with country code, digits only (e.g. `919876543210`)
- `VITE_WEB3FORMS_KEY` — optional free Web3Forms access key

## Local Development
```bash
cd norea/frontend
npm install
npm run dev
```
