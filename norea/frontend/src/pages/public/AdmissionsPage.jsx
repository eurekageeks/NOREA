import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle2, Send, RotateCcw, ShieldCheck, Sparkles, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Field';
import { FadeIn, PageTransition } from '../../components/ui/Motion';
import { useAsync } from '../../hooks';
import { useSeo } from '../../hooks/useSeo';
import { enquiryService, programService } from '../../services';
import { parseError } from '../../services/api';
import { LEARNING_MODES, validators } from '../../utils/constants';

const EMPTY = {
  full_name: '',
  email: '',
  phone: '',
  program_id: '',
  learning_mode: '',
  message: '',
  website: '', // honeypot
};

export default function AdmissionsPage() {
  useSeo({
    title: 'Admissions & Enquiry',
    description:
      'Submit an admission enquiry for NŌRÉA programs in Spoken English, Personality Development or Parenting & Child Development.',
  });

  const [searchParams] = useSearchParams();
  const preselected = searchParams.get('program') || '';

  const { data: progRes } = useAsync(() => programService.list(), []);
  const programs = progRes?.data || [];

  const [form, setForm] = useState({ ...EMPTY, program_id: preselected });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);

  useEffect(() => {
    if (preselected) setForm((f) => ({ ...f, program_id: preselected }));
  }, [preselected]);

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: '' }));
  };

  const validate = () => {
    const e = {};
    const n = validators.name(form.full_name);
    if (n) e.full_name = n;
    const em = validators.email(form.email);
    if (em) e.email = em;
    const ph = validators.phone(form.phone, true);
    if (ph) e.phone = ph;
    if (!form.program_id) e.program_id = 'Please select a program.';
    if (!form.learning_mode) e.learning_mode = 'Please select a preferred learning mode.';
    if (form.message.length > 2000) e.message = 'Message must be under 2000 characters.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await enquiryService.submit({ ...form, source: 'admission' });
      setSubmitted({ ...res.data, message: res.message, name: form.full_name });
      toast.success('Enquiry submitted successfully!');
    } catch (err) {
      const parsed = parseError(err);
      setErrors(parsed.fields);
      toast.error(parsed.message);
    } finally {
      setSubmitting(false);
    }
  };

  const onClear = () => {
    setForm(EMPTY);
    setErrors({});
  };

  return (
    <PageTransition>
      <section className="border-b border-beige/70 bg-sand/50 py-14 sm:py-20">
        <div className="container-x max-w-3xl">
          <FadeIn>
            <span className="eyebrow">Admissions</span>
            <h1 className="display mt-4 text-4xl sm:text-5xl lg:text-6xl">Start your NŌRÉA journey.</h1>
            <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
              Share your details and program of interest. Our admissions team will reach out with upcoming batch
              options and personal guidance.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-16 sm:py-22">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            {submitted ? (
              <FadeIn>
                <div className="card p-8 text-center sm:p-12">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                    <CheckCircle2 className="h-7 w-7" />
                  </div>
                  <h2 className="mt-5 font-serif text-3xl text-navy">Thank you, {submitted.name}!</h2>
                  <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">{submitted.message}</p>
                  <div className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-sand px-5 py-2 text-xs font-semibold tracking-widest text-navy">
                    Reference: {submitted.reference}
                  </div>
                  <div className="mt-8 flex flex-wrap justify-center gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSubmitted(null);
                        setForm(EMPTY);
                      }}
                    >
                      Submit Another Enquiry
                    </Button>
                    <Button to="/programs" variant="primary">
                      Explore Programs
                    </Button>
                  </div>
                </div>
              </FadeIn>
            ) : (
              <FadeIn>
                <form onSubmit={onSubmit} noValidate className="card p-7 sm:p-10 space-y-5">
                  <div>
                    <h2 className="font-serif text-3xl text-navy">Admission Enquiry Form</h2>
                    <p className="mt-1 text-sm text-muted">Fields marked with * are required.</p>
                  </div>

                  {/* Honeypot field */}
                  <input
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={form.website}
                    onChange={set('website')}
                    className="hidden"
                    aria-hidden="true"
                  />

                  <div className="grid gap-5 sm:grid-cols-2">
                    <Input
                      id="adm-name"
                      label="Full Name"
                      required
                      placeholder="Your full name"
                      value={form.full_name}
                      onChange={set('full_name')}
                      error={errors.full_name}
                      autoComplete="name"
                    />
                    <Input
                      id="adm-email"
                      label="Email Address"
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={set('email')}
                      error={errors.email}
                      autoComplete="email"
                    />
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <Input
                      id="adm-phone"
                      label="Mobile Number"
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={form.phone}
                      onChange={set('phone')}
                      error={errors.phone}
                      autoComplete="tel"
                    />
                    <Select
                      id="adm-program"
                      label="Select Program"
                      required
                      placeholder="Choose a program…"
                      value={form.program_id}
                      onChange={set('program_id')}
                      error={errors.program_id}
                      options={programs.map((p) => ({ value: String(p.id), label: p.title }))}
                    />
                  </div>

                  <Select
                    id="adm-mode"
                    label="Preferred Learning Mode"
                    required
                    placeholder="Select learning mode…"
                    value={form.learning_mode}
                    onChange={set('learning_mode')}
                    error={errors.learning_mode}
                    options={LEARNING_MODES}
                  />

                  <Textarea
                    id="adm-msg"
                    label="Message (Optional)"
                    rows={4}
                    placeholder="Tell us about your learning goals, preferred timings or any questions you have…"
                    value={form.message}
                    onChange={set('message')}
                    error={errors.message}
                  />

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <Button type="submit" variant="primary" size="lg" loading={submitting}>
                      <Send className="h-4 w-4" /> Submit Enquiry
                    </Button>
                    <Button type="button" variant="outline" size="lg" onClick={onClear} disabled={submitting}>
                      <RotateCcw className="h-4 w-4" /> Clear Form
                    </Button>
                  </div>
                </form>
              </FadeIn>
            )}
          </div>

          <aside className="space-y-6 lg:col-span-5">
            <FadeIn delay={0.1}>
              <div className="rounded-3xl bg-navy p-8 text-ivory">
                <span className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-gold-light">
                  What Happens Next
                </span>
                <h3 className="mt-3 font-serif text-3xl text-ivory">Simple, personal admissions.</h3>
                <ol className="mt-6 space-y-5 text-sm text-ivory/80">
                  {[
                    [Sparkles, 'We review your enquiry', 'Our admissions team notes your chosen program, preferred mode and learning goals.'],
                    [Clock, 'Personal counselling call', 'We reach out to share batch schedules, fee details and help you pick the right level.'],
                    [ShieldCheck, 'Seamless onboarding', 'Once confirmed, you can track your admission and enrolled programs right in the Student Portal.'],
                  ].map(([Icon, title, desc]) => (
                    <li key={title} className="flex items-start gap-3.5">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold-light">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="font-semibold text-ivory">{title}</p>
                        <p className="mt-1 text-xs leading-relaxed text-ivory/70">{desc}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </FadeIn>

            <FadeIn delay={0.16}>
              <div className="card p-7">
                <h3 className="font-serif text-2xl text-navy">Already a student?</h3>
                <p className="mt-2 text-sm text-muted">
                  Sign in to your student portal to track your admission status, view enrolled programs and manage your profile.
                </p>
                <div className="mt-5 flex gap-2.5">
                  <Button to="/login" variant="outline" size="sm">
                    Student Login
                  </Button>
                  <Button to="/register" variant="subtle" size="sm">
                    Create Account
                  </Button>
                </div>
              </div>
            </FadeIn>
          </aside>
        </div>
      </section>
    </PageTransition>
  );
}
