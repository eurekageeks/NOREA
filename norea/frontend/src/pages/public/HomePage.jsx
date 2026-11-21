import { ArrowRight, CheckCircle2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import ProgramCard from '../../components/ProgramCard';
import WhyNoreaGrid from '../../components/WhyNoreaGrid';
import CtaBanner from '../../components/CtaBanner';
import { FadeIn, PageTransition } from '../../components/ui/Motion';
import { CardSkeleton, ErrorState } from '../../components/ui/StateViews';
import { useSettings } from '../../context/SettingsContext';
import { useAsync } from '../../hooks';
import { useSeo } from '../../hooks/useSeo';
import { programService } from '../../services';
import { assetUrl } from '../../services/api';

const APPROACH_POINTS = [
  'Practical learning',
  'Interactive experiences',
  'Personal attention',
  'Confidence development',
  'Positive transformation',
];

export default function HomePage() {
  const { settings } = useSettings();
  useSeo({ description: settings.seo_description });

  const { data: res, loading, error, reload } = useAsync(() => programService.list(), []);
  const programs = res?.data || [];

  return (
    <PageTransition>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-beige/70 bg-navy">
        <div className="absolute inset-0">
          <img
            src={assetUrl(settings.hero_image) || '/images/hero.jpg'}
            alt="NŌRÉA learning workshop"
            fetchPriority="high"
            className="h-full w-full object-cover object-center opacity-55"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-900 via-navy/90 to-navy/35" />
        </div>

        <div className="container-x relative py-24 sm:py-32 lg:py-40">
          <div className="max-w-2xl">
            <FadeIn y={14}>
              <span className="inline-flex items-center gap-3 text-[0.72rem] font-semibold uppercase tracking-[0.3em] text-gold-light">
                <span className="h-px w-8 bg-gold" />
                {settings.institute_name} – {settings.institute_category}
              </span>
            </FadeIn>

            <FadeIn delay={0.08} y={18}>
              <h1 className="mt-6 font-serif text-5xl leading-[1.06] font-medium text-ivory sm:text-6xl lg:text-[4.25rem]">
                {settings.hero_heading}
              </h1>
            </FadeIn>

            <FadeIn delay={0.16} y={18}>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-ivory/82 sm:text-lg">
                {settings.hero_subheading}
              </p>
            </FadeIn>

            <FadeIn delay={0.22} y={16}>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.34em] text-gold-light">
                {settings.tagline}
              </p>
            </FadeIn>

            <FadeIn delay={0.28} y={16}>
              <div className="mt-9 flex flex-wrap items-center gap-3.5">
                <Button to="/programs" variant="gold" size="lg">
                  Explore Our Programs <ArrowRight className="h-4 w-4" />
                </Button>
                <Button to="/admissions" variant="outlineLight" size="lg">
                  Enquire Now
                </Button>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ABOUT PREVIEW */}
      <section className="py-20 sm:py-28">
        <div className="container-x">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
            <FadeIn className="lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="overflow-hidden rounded-3xl border border-beige bg-sand shadow-lift">
                  <img
                    src="/images/about.jpg"
                    alt="One-on-one mentoring at NŌRÉA"
                    loading="lazy"
                    className="aspect-[4/5] w-full object-cover"
                  />
                </div>
                <div className="mt-4 rounded-2xl border border-beige bg-white px-6 py-4 shadow-soft sm:absolute sm:-right-6 sm:-bottom-6 sm:mt-0 sm:max-w-xs">
                  <p className="font-serif text-xl italic text-navy">“{settings.tagline}”</p>
                  <p className="mt-1 text-xs text-muted">Thoughtful guidance for lasting personal growth.</p>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.1} className="lg:col-span-7">
              <span className="eyebrow">About {settings.institute_name}</span>
              <h2 className="display mt-4 text-4xl sm:text-5xl">
                A calm, intentional space for real personal transformation.
              </h2>
              <p className="mt-6 text-base leading-relaxed text-charcoal/80">{settings.about_intro}</p>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                Whether you are refining how you speak in English, stepping into greater confidence and leadership, or
                nurturing a warmer bond with your child, our programs meet you where you are and guide you forward with
                care.
              </p>

              <ul className="mt-7 grid gap-3 sm:grid-cols-2">
                {APPROACH_POINTS.map((pt) => (
                  <li key={pt} className="flex items-center gap-2.5 text-sm font-medium text-navy">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-gold-dark" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <Button to="/about" variant="outline" size="md">
                  Learn More About Us <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* OUR PROGRAMS */}
      <section className="border-y border-beige/70 bg-sand/55 py-20 sm:py-28">
        <div className="container-x">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <span className="eyebrow eyebrow-center">Our Programs</span>
            <h2 className="display mt-4 text-4xl sm:text-5xl">
              Curated learning paths for every stage of growth.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">
              Explore our flagship programs designed around communication, confidence, personality development and
              mindful parenting.
            </p>
          </FadeIn>

          <div className="mt-14">
            {loading ? (
              <CardSkeleton count={3} />
            ) : error ? (
              <ErrorState message="Unable to load programs right now." onRetry={reload} />
            ) : (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {programs.map((program) => (
                  <ProgramCard key={program.id} program={program} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE NŌRÉA */}
      <section className="py-20 sm:py-28">
        <div className="container-x">
          <div className="mb-14 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <FadeIn className="max-w-2xl">
              <span className="eyebrow">Why Choose {settings.institute_name}</span>
              <h2 className="display mt-4 text-4xl sm:text-5xl">
                Designed for confidence that lasts beyond the classroom.
              </h2>
            </FadeIn>
            <FadeIn delay={0.1}>
              <Button to="/why-norea" variant="outline" size="md">
                Our Learning Experience <ArrowRight className="h-4 w-4" />
              </Button>
            </FadeIn>
          </div>

          <WhyNoreaGrid />
        </div>
      </section>

      {/* CTA BANNER */}
      <CtaBanner />
    </PageTransition>
  );
}
