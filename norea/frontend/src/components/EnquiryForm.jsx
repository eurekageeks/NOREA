import { useEffect, useState } from 'react';
import { Send, RotateCcw, CheckCircle2, Mail, MessageCircle, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from './ui/Button';
import { Input, Select, Textarea } from './ui/Field';
import { PROGRAMS } from '../data/programs';
import { buildEnquiryPayload, sendEmailNotification } from '../utils/notifications';
import { LEARNING_MODES, validators } from '../utils/constants';

const EMPTY = {
  fullName: '',
  email: '',
  phone: '',
  program: '',
  learningMode: '',
  message: '',
};

export default function EnquiryForm({ defaultProgram = '', title = 'Quick Student Enquiry', subtitle }) {
  const [form, setForm] = useState({ ...EMPTY, program: defaultProgram });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (defaultProgram) setForm((f) => ({ ...f, program: defaultProgram }));
  }, [defaultProgram]);

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: '' }));
  };

  const validate = () => {
    const e = {};
    const n = validators.name(form.fullName);
    if (n) e.fullName = n;
    const em = validators.email(form.email);
    if (em) e.email = em;
    const ph = validators.phone(form.phone, true);
    if (ph) e.phone = ph;
    if (!form.program) e.program = 'Please select a program.';
    if (!form.learningMode) e.learningMode = 'Please choose a learning mode.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    // 1) Build payload & open WhatsApp SYNCHRONOUSLY inside click handler so popup blockers don't block it
    const payload = buildEnquiryPayload(form);
    const waWindow = window.open(payload.whatsappUrl, '_blank', 'noopener,noreferrer');

    try {
      // 2) Trigger automatic email notification (EmailJS / Web3Forms / FormSubmit)
      const emailRes = await sendEmailNotification(form, payload);
      setResult({
        ...payload,
        emailStatus: emailRes.status,
        emailProvider: emailRes.provider,
        whatsappOpened: Boolean(waWindow),
        studentName: form.fullName,
        email: form.email,
        phone: form.phone,
        program: form.program,
      });
      toast.success(
        emailRes.status === 'sent'
          ? 'Enquiry submitted! Email sent & WhatsApp opened.'
          : 'Enquiry submitted! Click the buttons below to send via WhatsApp & Email.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <div className="card relative overflow-hidden p-8 text-center sm:p-10">
        <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-indigo-500 via-rose-500 to-amber-400" />
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h3 className="mt-5 font-serif text-3xl text-ink">Thank you, {result.studentName}!</h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
          Your enquiry for <strong className="text-indigo-700">{result.program}</strong> is ready. We&apos;ve
          prepared both your <strong>WhatsApp</strong> and <strong>Email</strong> notifications below.
        </p>

        <div className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 text-xs font-bold tracking-widest text-indigo-700 ring-1 ring-indigo-200">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" /> REF: {result.ref}
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <Button href={result.whatsappUrl} target="_blank" rel="noreferrer" variant="whatsapp" size="lg" className="w-full">
            <MessageCircle className="h-4 w-4" /> Open WhatsApp Notification
          </Button>
          <Button href={result.mailtoUrl} variant="primary" size="lg" className="w-full">
            <Mail className="h-4 w-4" /> {result.emailStatus === 'sent' ? 'Email Sent (Send Copy)' : 'Send Email Notification'}
          </Button>
        </div>

        {result.emailStatus === 'sent' && (
          <p className="mt-3 text-xs font-semibold text-emerald-700">
            ✓ Automatic confirmation email triggered to {result.email}
          </p>
        )}

        <div className="mt-6 border-t border-slate-100 pt-5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setResult(null);
              setForm(EMPTY);
            }}
          >
            Submit Another Enquiry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="card relative overflow-hidden p-7 sm:p-9 space-y-5">
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-indigo-600 via-rose-500 to-amber-400" />

      <div>
        <h3 className="font-serif text-3xl text-ink">{title}</h3>
        <p className="mt-1 text-sm text-slate-600">
          {subtitle || 'Fill in your details below — instant WhatsApp & Email notifications will be triggered on submit.'}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          id="enq-name"
          label="Full Name"
          required
          placeholder="Enter student name"
          value={form.fullName}
          onChange={set('fullName')}
          error={errors.fullName}
        />
        <Input
          id="enq-email"
          label="Email Address"
          type="email"
          required
          placeholder="student@example.com"
          value={form.email}
          onChange={set('email')}
          error={errors.email}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          id="enq-phone"
          label="WhatsApp / Mobile Number"
          type="tel"
          required
          placeholder="+91 98765 43210"
          value={form.phone}
          onChange={set('phone')}
          error={errors.phone}
        />
        <Select
          id="enq-program"
          label="Select Program"
          required
          placeholder="Choose a program…"
          value={form.program}
          onChange={set('program')}
          error={errors.program}
          options={PROGRAMS.map((p) => ({ value: p.title, label: p.title }))}
        />
      </div>

      <Select
        id="enq-mode"
        label="Preferred Learning Mode"
        required
        placeholder="Select learning mode…"
        value={form.learningMode}
        onChange={set('learningMode')}
        error={errors.learningMode}
        options={LEARNING_MODES.map((m) => ({ value: m.label, label: m.label }))}
      />

      <Textarea
        id="enq-msg"
        label="Message (Optional)"
        rows={3}
        placeholder="Share your goals, preferred batch timings, or questions…"
        value={form.message}
        onChange={set('message')}
      />

      <div className="flex flex-wrap items-center gap-3 pt-1">
        <Button type="submit" variant="primary" size="lg" loading={submitting} className="flex-1 sm:flex-none">
          <Send className="h-4 w-4" /> Submit &amp; Notify
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => {
            setForm(EMPTY);
            setErrors({});
          }}
        >
          <RotateCcw className="h-4 w-4" /> Clear
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-4 pt-1 text-xs font-medium text-slate-500">
        <span className="inline-flex items-center gap-1.5 text-emerald-700">
          <MessageCircle className="h-3.5 w-3.5" /> Instant WhatsApp Notification
        </span>
        <span className="inline-flex items-center gap-1.5 text-indigo-700">
          <Mail className="h-3.5 w-3.5" /> Instant Email Notification
        </span>
      </div>
    </form>
  );
}
