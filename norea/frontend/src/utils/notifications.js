import { SITE } from '../config/siteConfig';

const cleanPhone = (phone = '') => {
  const digits = String(phone).replace(/\D/g, '');
  if (!digits) return '';
  return digits.length === 10 ? `91${digits}` : digits;
};

export const generateRef = () => `NOR-${Math.floor(10000 + Math.random() * 90000)}`;

/**
 * Synchronously builds the formatted notification payload + WhatsApp & Email links.
 * Call this synchronously inside onSubmit BEFORE any `await` so browsers never block window.open().
 */
export function buildEnquiryPayload(enquiry) {
  const ref = generateRef();
  const submittedAt = new Date().toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  const summaryLines = [
    `Hello ${enquiry.fullName}!`,
    `Thank you for enquiring with *${SITE.name} – ${SITE.category}* (${SITE.tagline}).`,
    '',
    `*Enquiry Reference:* ${ref}`,
    `*Student Name:* ${enquiry.fullName}`,
    `*Email:* ${enquiry.email}`,
    enquiry.phone ? `*Mobile:* ${enquiry.phone}` : null,
    enquiry.program ? `*Program:* ${enquiry.program}` : null,
    enquiry.learningMode ? `*Preferred Mode:* ${enquiry.learningMode}` : null,
    enquiry.message ? `*Message:* ${enquiry.message}` : null,
    `*Submitted:* ${submittedAt}`,
    '',
    'Our team will connect with you shortly with batch timings and details!',
  ].filter((line) => line !== null);

  const plainText = summaryLines.join('\n').replace(/\*/g, '');
  const whatsappText = summaryLines.join('\n');

  const userDigits = cleanPhone(enquiry.phone);
  const targetWhatsappDigits = SITE.whatsappNumber || userDigits;
  const whatsappUrl = targetWhatsappDigits
    ? `https://wa.me/${targetWhatsappDigits}?text=${encodeURIComponent(whatsappText)}`
    : `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;

  const emailSubject = `NŌRÉA Enquiry Confirmation (${ref}) – ${enquiry.program || 'General Enquiry'}`;
  const mailtoRecipient = SITE.instituteEmail || enquiry.email;
  const mailtoCc = SITE.instituteEmail ? `&cc=${encodeURIComponent(enquiry.email)}` : '';
  const mailtoUrl = `mailto:${encodeURIComponent(mailtoRecipient)}?subject=${encodeURIComponent(
    emailSubject
  )}${mailtoCc}&body=${encodeURIComponent(plainText)}`;

  return { ref, submittedAt, plainText, emailSubject, whatsappUrl, mailtoUrl };
}

/**
 * Sends automatic Email notification via EmailJS (direct to student inbox),
 * Web3Forms, or FormSubmit (institute + student auto-reply).
 */
export async function sendEmailNotification(enquiry, payload) {
  const { ref, plainText, emailSubject } = payload;

  // 1) EmailJS (best for 100% frontend direct-to-student email!)
  if (SITE.emailjs.serviceId && SITE.emailjs.templateId && SITE.emailjs.publicKey) {
    try {
      const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: SITE.emailjs.serviceId,
          template_id: SITE.emailjs.templateId,
          user_id: SITE.emailjs.publicKey,
          template_params: {
            to_email: enquiry.email,
            to_name: enquiry.fullName,
            student_name: enquiry.fullName,
            student_email: enquiry.email,
            student_phone: enquiry.phone,
            program: enquiry.program,
            learning_mode: enquiry.learningMode,
            message: enquiry.message || '—',
            reference: ref,
            subject: emailSubject,
          },
        }),
      });
      if (res.ok) return { status: 'sent', provider: 'EmailJS' };
    } catch {
      /* fall through */
    }
  }

  // 2) Web3Forms
  if (SITE.web3formsKey) {
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: SITE.web3formsKey,
          subject: emailSubject,
          from_name: `${SITE.name} Website`,
          name: enquiry.fullName,
          email: enquiry.email,
          phone: enquiry.phone,
          program: enquiry.program || 'General',
          learning_mode: enquiry.learningMode || 'N/A',
          message: enquiry.message || 'No additional message.',
          reference: ref,
        }),
      });
      const data = await res.json();
      if (data?.success) return { status: 'sent', provider: 'Web3Forms' };
    } catch {
      /* fall through */
    }
  }

  // 3) FormSubmit AJAX (institute email + auto-reply to student)
  if (SITE.instituteEmail) {
    try {
      const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(SITE.instituteEmail)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          _subject: emailSubject,
          _autoresponse: plainText,
          _captcha: 'false',
          _template: 'table',
          name: enquiry.fullName,
          email: enquiry.email,
          phone: enquiry.phone || '—',
          program: enquiry.program || 'General',
          learning_mode: enquiry.learningMode || '—',
          message: enquiry.message || '—',
          reference: ref,
        }),
      });
      const data = await res.json().catch(() => ({}));
      const ok = data?.success === true || data?.success === 'true';
      if (res.ok && ok) {
        return { status: 'sent', provider: 'FormSubmit', info: `Email sent to ${SITE.instituteEmail} & auto-reply to ${enquiry.email}` };
      }
      if (data?.message) {
        return { status: 'pending_activation', provider: 'FormSubmit', info: data.message };
      }
    } catch (err) {
      return { status: 'error', provider: 'FormSubmit', info: err?.message || 'Network error reaching FormSubmit.' };
    }
  }

  return {
    status: 'manual',
    provider: null,
    info: 'No email service env var detected in this build. Use the Send Email button below or configure VITE_INSTITUTE_EMAIL / EmailJS and redeploy.',
  };
}
