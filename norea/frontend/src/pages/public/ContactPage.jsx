import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, ArrowUpRight } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Field';
import { FadeIn, PageTransition } from '../../components/ui/Motion';
import { useSettings } from '../../context/SettingsContext';
import { useSeo } from '../../hooks/useSeo';
import { enquiryService } from '../../services';
import { parseError } from '../../services/api';
import { validators } from '../../utils/constants';

const EMPTY = { full_name: '', email: '', phone: '', subject: '', message: '', website: '' };

export default function ContactPage() {
  const { settings } = useSettings();
  useSeo({
    title: 'Contact Us',
    description: `Get in touch with ${settings.institute_name} – ${settings.institute_category}.`,
  });

  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: '' }));
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    const e = {};
    const n = validators.name(form.full_name);
    if (n) e.full_name = n;
    const em = validators.email(form.email);
    if (em) e.email = em;
    const ph = validators.phone(form.phone, false);
    if (ph) e.phone = ph;
    if (!form.message.trim() || form.message.trim().length < 10) {
      e.message = 'Please write a message of at least 10 characters.';
    }
    setErrors(e);
    if (Object.keys(e).length) return;

    setSubmitting(true);
    try {
      const res = await enquiryService.submit({ ...form, source: 'contact' });
      setSent(true);
      setForm(EMPTY);
      toast.success(res.message);
    } catch (err) {
      const parsed = parseError(err);
      setErrors(parsed.fields);
      toast.error(parsed.message);
    } finally {
      setSubmitting(false);
    }
  };

  const contactItems = [
    settings.contact_address && { icon: MapPin, label: 'Address', value: settings.contact_address },
    settings.contact_phone && { icon: Phone, label: 'Phone', value: settings.contact_phone, href: `tel:${settings.contact_phone}` },
    settings.contact_email && { icon: Mail, label: 'Email', value: settings.contact_email, href: `mailto:${settings.contact_email}` },
    settings.office_hours && { icon: Clock, label: 'Office Hours', value: settings.office_hours },
  ].filter(Boolean);

  const socials = [
    ['Instagram', settings.social_instagram],
    ['Facebook', settings.social_facebook],
    ['LinkedIn', settings.social_linkedin],
    ['YouTube', settings.social_youtube],
    ['X', settings.social_x],
  ].filter(([, url]) => Boolean(url));

  return (
    <PageTransition>
      <section className="relative overflow-hidden border-b border-beige/70 bg-navy py-16 text-ivory sm:py-22">
        <div className="absolute inset-0">
          <img src="/images/contact.jpg" alt="NŌRÉA reception lounge" className="h-full w-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-900/95 via-navy/85 to-navy/70" />
        </div>
        <div className="container-x relative max-w-3xl">
          <FadeIn>
            <span className="inline-flex items-center gap-3 text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-gold-light">
              <span className="h-px w-8 bg-gold" /> Contact Us
            </span>
            <h1 className="mt-4 font-serif text-4xl text-ivory sm:text-5xl lg:text-6xl">
              We would love to hear from you.
            </h1>
            <p className="mt-4 text-base leading-relaxed text-ivory/80">
              Whether you have a question about our programs, schedules or parenting sessions, send us a note and our
              team will respond promptly.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-16 sm:py-22">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          {/* Contact form */}
          <div className="lg:col-span-7">
            {sent ? (
              <div className="card p-10 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h2 className="mt-5 font-serif text-3xl text-navy">Message Sent</h2>
                <p className="mx-auto mt-2 max-w-md text-sm text-muted">
                  Thank you for contacting {settings.institute_name}. Our team will get back to you shortly.
                </p>
                <Button variant="outline" className="mt-6" onClick={() => setSent(false)}>
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate className="card p-7 sm:p-10 space-y-5">
                <div>
                  <h2 className="font-serif text-3xl text-navy">Send Us a Message</h2>
                  <p className="mt-1 text-sm text-muted">We reply to all messages as soon as possible.</p>
                </div>

                <input type="text" name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={set('website')} className="hidden" aria-hidden="true" />

                <div className="grid gap-5 sm:grid-cols-2">
                  <Input id="c-name" label="Full Name" required placeholder="Your name" value={form.full_name} onChange={set('full_name')} error={errors.full_name} />
                  <Input id="c-email" label="Email Address" type="email" required placeholder="you@example.com" value={form.email} onChange={set('email')} error={errors.email} />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Input id="c-phone" label="Phone Number (Optional)" type="tel" placeholder="Your mobile number" value={form.phone} onChange={set('phone')} error={errors.phone} />
                  <Input id="c-subject" label="Subject (Optional)" placeholder="How can we help?" value={form.subject} onChange={set('subject')} error={errors.subject} />
                </div>

                <Textarea id="c-message" label="Message" required rows={5} placeholder="Write your message here…" value={form.message} onChange={set('message')} error={errors.message} />

                <Button type="submit" variant="primary" size="lg" loading={submitting}>
                  <Send className="h-4 w-4" /> Send Message
                </Button>
              </form>
            )}
          </div>

          {/* Contact info & map */}
          <div className="space-y-6 lg:col-span-5">
            <div className="card p-7 sm:p-8">
              <h3 className="font-serif text-2xl text-navy">Institute Information</h3>
              <div className="gold-rule mt-2.5" />

              {contactItems.length > 0 ? (
                <dl className="mt-6 space-y-5">
                  {contactItems.map(({ icon: Icon, label, value, href }) => (
                    <div key={label} className="flex items-start gap-3.5">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sand text-gold-dark">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div>
                        <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted">{label}</dt>
                        <dd className="mt-0.5 text-sm font-medium text-navy whitespace-pre-line">
                          {href ? (
                            <a href={href} className="hover:text-gold-dark">
                              {value}
                            </a>
                          ) : (
                            value
                          )}
                        </dd>
                      </div>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="mt-5 text-sm leading-relaxed text-muted">
                  Institute address, phone and email details can be configured anytime from{' '}
                  <strong className="text-navy">Admin ▸ Website Settings</strong>. In the meantime, please use the
                  message form to reach us directly.
                </p>
              )}

              {socials.length > 0 && (
                <div className="mt-7 border-t border-beige/70 pt-5">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted">Follow Us</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {socials.map(([label, url]) => (
                      <a
                        key={label}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-xl border border-beige bg-ivory px-3 py-1.5 text-xs font-medium text-navy transition hover:border-gold hover:bg-sand"
                      >
                        {label} <ArrowUpRight className="h-3.5 w-3.5 text-gold-dark" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Google Maps embed or clean placeholder */}
            <div className="card overflow-hidden">
              {settings.map_embed_url ? (
                <iframe
                  title="NŌRÉA Location Map"
                  src={settings.map_embed_url}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-64 w-full border-0"
                />
              ) : (
                <div className="flex h-56 flex-col items-center justify-center bg-sand/70 p-6 text-center">
                  <MapPin className="h-7 w-7 text-gold-dark" />
                  <p className="mt-3 font-serif text-xl text-navy">Google Maps Location</p>
                  <p className="mt-1 max-w-xs text-xs text-muted">
                    Add your Google Maps embed URL in Admin ▸ Website Settings to display an interactive map here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
