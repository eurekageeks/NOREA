import { useSearchParams } from 'react-router-dom';
import { MessageCircle, Mail, Sparkles } from 'lucide-react';
import EnquiryForm from '../../components/EnquiryForm';
import { FadeIn, PageTransition } from '../../components/ui/Motion';
import { useSeo } from '../../hooks/useSeo';

export default function AdmissionsPage() {
  useSeo({
    title: 'Admissions & Enquiry',
    description: 'Submit a simple enquiry for NŌRÉA programs and get instant WhatsApp & Email notifications.',
  });

  const [searchParams] = useSearchParams();
  const preselected = searchParams.get('program') || '';

  return (
    <PageTransition>
      <section className="hero-mesh border-b border-indigo-100/80 py-14 sm:py-18">
        <div className="container-x max-w-3xl">
          <FadeIn>
            <span className="pill-eyebrow">Admissions Enquiry</span>
            <h1 className="display mt-4 text-4xl font-bold sm:text-5xl lg:text-6xl">
              Start your NŌRÉA journey today.
            </h1>
            <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
              Fill out the quick form below. Submitting triggers instant <strong>WhatsApp</strong> and{' '}
              <strong>Email</strong> notifications with your enquiry details.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-16 sm:py-22">
        <div className="container-x grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <EnquiryForm
              defaultProgram={preselected}
              title="Student Admission Enquiry"
              subtitle="Simple & fast — no signup required."
            />
          </div>

          <aside className="space-y-6 lg:col-span-5">
            <FadeIn delay={0.1}>
              <div className="rounded-3xl bg-gradient-to-br from-indigo-700 via-violet-700 to-rose-600 p-8 text-white shadow-lift">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-amber-200">
                  <Sparkles className="h-3.5 w-3.5" /> Instant Confirmation
                </span>
                <h3 className="mt-4 font-serif text-3xl font-bold text-white">What happens on submit?</h3>
                <ul className="mt-5 space-y-4 text-sm text-white/90">
                  <li className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#25D366]/25 text-emerald-200">
                      <MessageCircle className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="font-bold text-white">WhatsApp Notification</p>
                      <p className="mt-0.5 text-xs text-white/80">
                        Opens WhatsApp immediately with your formatted enquiry summary and reference number.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-300/25 text-amber-200">
                      <Mail className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="font-bold text-white">Email Notification</p>
                      <p className="mt-0.5 text-xs text-white/80">
                        Triggers an email confirmation with your selected program, preferred learning mode, and reference ID.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </FadeIn>
          </aside>
        </div>
      </section>
    </PageTransition>
  );
}
