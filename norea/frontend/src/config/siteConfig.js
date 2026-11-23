/**
 * Central website configuration for NŌRÉA (zero database).
 * Optional env vars (in Vercel or .env) enable automatic background email delivery
 * and direct institute WhatsApp routing:
 *   VITE_INSTITUTE_EMAIL=admissions@yourdomain.com
 *   VITE_WHATSAPP_NUMBER=919876543210   (digits only with country code, no +)
 *   VITE_WEB3FORMS_KEY=your-web3forms-access-key (optional, free at web3forms.com)
 */
export const SITE = {
  name: 'NŌRÉA',
  category: 'Learning & Development',
  tagline: 'Learn • Express • Grow',
  heroHeading: 'Building Confidence. Nurturing Potential.',
  heroSubheading:
    'A colourful, welcoming space for students and families to master Spoken English, shine in Personality Development, and build joyful Parenting habits.',
  aboutIntro:
    'NŌRÉA is dedicated to helping students and individuals develop communication skills, confidence, personality, and positive relationships.',
  mission:
    'To empower every student with the communication skills, self-belief, and emotional awareness they need to express themselves boldly and grow with joy.',
  vision:
    'To be a vibrant, trusted learning community where young minds and families discover their brightest potential.',
  seoDescription:
    'NŌRÉA – Learning & Development. Spoken English & Communication, Personality Development, and Parenting & Child Development. Learn • Express • Grow.',
  // Notification settings (configure in Vercel env vars or directly here)
  instituteEmail: (import.meta.env.VITE_INSTITUTE_EMAIL || '').trim(),
  whatsappNumber: (import.meta.env.VITE_WHATSAPP_NUMBER || '').replace(/\D/g, ''),
  web3formsKey: (import.meta.env.VITE_WEB3FORMS_KEY || '').trim(),
  emailjs: {
    serviceId: (import.meta.env.VITE_EMAILJS_SERVICE_ID || '').trim(),
    templateId: (import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '').trim(),
    publicKey: (import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '').trim(),
  },
  phoneDisplay: (import.meta.env.VITE_PHONE_DISPLAY || '').trim(),
  address: (import.meta.env.VITE_INSTITUTE_ADDRESS || '').trim(),
  officeHours: (import.meta.env.VITE_OFFICE_HOURS || '').trim(),
  mapEmbedUrl: (import.meta.env.VITE_MAP_EMBED_URL || '').trim(),
  socials: {
    instagram: (import.meta.env.VITE_SOCIAL_INSTAGRAM || '').trim(),
    facebook: (import.meta.env.VITE_SOCIAL_FACEBOOK || '').trim(),
    linkedin: (import.meta.env.VITE_SOCIAL_LINKEDIN || '').trim(),
    youtube: (import.meta.env.VITE_SOCIAL_YOUTUBE || '').trim(),
  },
};
