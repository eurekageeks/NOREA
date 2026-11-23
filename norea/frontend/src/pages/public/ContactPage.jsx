import { Mail, Phone, MapPin, Clock, MessageCircle } from 'lucide-react';
import EnquiryForm from '../../components/EnquiryForm';
import Button from '../../components/ui/Button';
import { FadeIn, PageTransition } from '../../components/ui/Motion';
import { SITE } from '../../config/siteConfig';
import { useSeo } from '../../hooks/useSeo';

export default function ContactPage() {
  useSeo({
    title: 'Contact Us',
    description: `Contact ${SITE.name} – ${SITE.category} via WhatsApp, Email, or our quick enquiry form.`,
  });

  const info = [
    SITE.address && { icon: MapPin, label: 'Address', value: SITE.address },
    SITE.phoneDisplay && { icon: Phone, label: 'Phone', value: SITE.phoneDisplay, href: `tel:${SITE.phoneDisplay}` },
    SITE.instituteEmail && { icon: Mail, label: 'Email', value: SITE.instituteEmail, href: `mailto:${SITE.instituteEmail}` },
    SITE.officeHours && { icon: Clock, label: 'Office Hours', value: SITE.officeHours },
  ].filter(Boolean);

  return (
    <PageTransition>
      <section className="hero-mesh border-b border-indigo-100/80 py-14 sm:py-18">
        <div className="container-x max-w-3xl">
          <FadeIn>
            <span className="pill-eyebrow">Contact Us</span>
            <h1 className="display mt-4 text-4xl font-bold sm:text-5xl lg:text-6xl">
              We&apos;d love to hear from you!
            </h1>
            <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
              Have a question about Spoken English, Personality Development, or Parenting batches? Send us a quick
              message and get an instant WhatsApp &amp; Email notification.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-16 sm:py-22">
        <div className="container-x grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <EnquiryForm
              title="Send Us a Message"
              subtitle="Submitting triggers instant WhatsApp & Email notifications."
            />
          </div>

          <div className="space-y-6 lg:col-span-5">
            <div className="card overflow-hidden">
              <img src="/images/contact.jpg" alt="NŌRÉA learning lounge" className="h-48 w-full object-cover" />
              <div className="p-7">
                <h3 className="font-serif text-2xl font-bold text-ink">Connect with {SITE.name}</h3>

                {info.length > 0 ? (
                  <dl className="mt-5 space-y-4">
                    {info.map(({ icon: Icon, label, value, href }) => (
                      <div key={label} className="flex items-start gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                          <Icon className="h-4 w-4" />
                        </span>
                        <div>
                          <dt className="text-[0.68rem] font-bold uppercase tracking-wider text-slate-500">{label}</dt>
                          <dd className="text-sm font-semibold text-ink">
                            {href ? <a href={href} className="hover:text-indigo-600">{value}</a> : value}
                          </dd>
                        </div>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    Use the enquiry form alongside to receive immediate WhatsApp and Email confirmation from our team.
                  </p>
                )}

                {SITE.whatsappNumber && (
                  <div className="mt-6">
                    <Button
                      href={`https://wa.me/${SITE.whatsappNumber}`}
                      target="_blank"
                      rel="noreferrer"
                      variant="whatsapp"
                      className="w-full"
                    >
                      <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {SITE.mapEmbedUrl && (
              <div className="card overflow-hidden">
                <iframe
                  title="NŌRÉA Location Map"
                  src={SITE.mapEmbedUrl}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-56 w-full border-0"
                />
              </div>
            )}
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
