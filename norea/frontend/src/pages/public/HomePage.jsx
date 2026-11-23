import { ArrowRight, CheckCircle2, Sparkles, MessageCircle, Mail } from 'lucide-react';
import Button from '../../components/ui/Button';
import ProgramCard from '../../components/ProgramCard';
import WhyNoreaGrid from '../../components/WhyNoreaGrid';
import EnquiryForm from '../../components/EnquiryForm';
import CtaBanner from '../../components/CtaBanner';
import { FadeIn, PageTransition } from '../../components/ui/Motion';
import { SITE } from '../../config/siteConfig';
import { PROGRAMS } from '../../data/programs';
import { useSeo } from '../../hooks/useSeo';

const HIGHLIGHTS = [
  'Practical learning',
  'Interactive sessions',
  'Personal attention',
  'Confidence building',
  'Friendly mentors',
];

export default function HomePage() {
  useSeo({ description: SITE.seoDescription });

  return (
    <PageTransition>
      {/* COLOURFUL STUDENT HERO */}
      <section className="hero-mesh relative overflow-hidden border-b border-indigo-100/80 py-16 sm:py-24">
        <div className="container-x grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <FadeIn y={12}>
              <span className="pill-eyebrow">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" /> {SITE.tagline}
              </span>
            </FadeIn>

            <FadeIn delay={0.08} y={16}>
              <h1 className="display mt-5 text-5xl font-bold sm:text-6xl">
                Building{' '}
                <span className="bg-gradient-to-r from-indigo-600 via-rose-500 to-amber-500 bg-clip-text text-transparent">
                  Confidence.
                </span>{' '}
                Nurturing Potential.
              </h1>
            </FadeIn>

            <FadeIn delay={0.14} y={16}>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
                {SITE.heroSubheading}
              </p>
            </FadeIn>

            <FadeIn delay={0.2} y={16}>
              <div className="mt-8 flex flex-wrap items-center gap-3.5">
                <Button to="/programs" variant="primary" size="lg">
                  Explore Programs <ArrowRight className="h-4 w-4" />
                </Button>
                <Button href="#quick-enquiry" variant="amber" size="lg">
                  Quick Enquiry
                </Button>
              </div>
            </FadeIn>

            <FadeIn delay={0.26} y={14}>
              <div className="mt-8 flex flex-wrap gap-2">
                {HIGHLIGHTS.map((h) => (
                  <span
                    key={h}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3.5 py-1.5 text-xs font-semibold text-indigo-950 shadow-sm ring-1 ring-indigo-100"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> {h}
                  </span>
                ))}
              </div>
            </FadeIn>
          </div>

          <FadeIn delay={0.12} className="lg:col-span-6">
            <div className="relative">
              <div className="absolute -inset-3 rounded-[2.2rem] bg-gradient-to-tr from-indigo-500/20 via-rose-400/20 to-amber-300/25 blur-xl" />
              <div className="relative overflow-hidden rounded-[2rem] border-4 border-white shadow-lift">
                <img
                  src="/images/hero.jpg"
                  alt="Students learning with confidence at NŌRÉA"
                  className="aspect-[16/11] w-full object-cover"
                />
              </div>
              <div className="mt-4 flex flex-wrap gap-3 sm:absolute sm:-bottom-5 sm:left-6 sm:mt-0">
                <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-xs font-bold text-ink shadow-lift ring-1 ring-indigo-100">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <MessageCircle className="h-4 w-4" />
                  </span>
                  WhatsApp Enquiry Alerts
                </div>
                <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-xs font-bold text-ink shadow-lift ring-1 ring-indigo-100">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                    <Mail className="h-4 w-4" />
                  </span>
                  Instant Email Updates
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* OUR PROGRAMS */}
      <section className="py-20 sm:py-24">
        <div className="container-x">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <span className="pill-eyebrow">Our Programs</span>
            <h2 className="display mt-4 text-4xl font-bold sm:text-5xl">
              Colourful learning journeys for every student.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
              Pick a program that matches your goals — Spoken English, Personality Development, or Parenting &amp; Child Development.
            </p>
          </FadeIn>

          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {PROGRAMS.map((program) => (
              <ProgramCard key={program.id} program={program} />
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE NŌRÉA */}
      <section className="border-y border-indigo-100/80 bg-gradient-to-b from-indigo-50/50 via-white to-rose-50/40 py-20 sm:py-24">
        <div className="container-x">
          <div className="mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <FadeIn className="max-w-2xl">
              <span className="pill-eyebrow">Why Students Love {SITE.name}</span>
              <h2 className="display mt-4 text-4xl font-bold sm:text-5xl">
                Confidence that shines inside and outside the classroom.
              </h2>
            </FadeIn>
            <Button to="/why-norea" variant="outline" size="md">
              Explore More <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <WhyNoreaGrid />
        </div>
      </section>

      {/* INLINE SIMPLE ENQUIRY FORM */}
      <section id="quick-enquiry" className="scroll-mt-24 py-20 sm:py-24">
        <div className="container-x grid items-center gap-12 lg:grid-cols-12">
          <FadeIn className="lg:col-span-5 space-y-5">
            <span className="pill-eyebrow">Instant Notification</span>
            <h2 className="display text-4xl font-bold sm:text-5xl">
              Enquire in 30 seconds — get WhatsApp &amp; Email updates!
            </h2>
            <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
              No account creation or complicated forms. Simply submit your enquiry and receive immediate WhatsApp and
              Email confirmation with your reference number.
            </p>
            <div className="overflow-hidden rounded-3xl border-4 border-white shadow-lift">
              <img
                src="/images/about.jpg"
                alt="Friendly mentoring at NŌRÉA"
                loading="lazy"
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
          </FadeIn>

          <FadeIn delay={0.1} className="lg:col-span-7">
            <EnquiryForm />
          </FadeIn>
        </div>
      </section>

      <CtaBanner />
    </PageTransition>
  );
}
