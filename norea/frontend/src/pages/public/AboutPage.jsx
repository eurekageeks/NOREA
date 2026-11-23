import { CheckCircle2, Compass, Eye, Sparkles } from 'lucide-react';
import { FadeIn, PageTransition, Stagger, StaggerItem } from '../../components/ui/Motion';
import CtaBanner from '../../components/CtaBanner';
import { SITE } from '../../config/siteConfig';
import { useSeo } from '../../hooks/useSeo';

const APPROACH = [
  ['Practical Learning', 'bg-indigo-50 border-indigo-100', 'Skills come alive through practice — real dialogue, activities and friendly feedback.'],
  ['Interactive Experiences', 'bg-rose-50 border-rose-100', 'Safe, upbeat groups invite every student to speak up and enjoy learning together.'],
  ['Personal Attention', 'bg-amber-50 border-amber-100', 'Mentors get to know each student’s strengths and help them grow at their own pace.'],
  ['Confidence Development', 'bg-teal-50 border-teal-100', 'Step-by-step exercises turn hesitation into natural stage and classroom poise.'],
  ['Positive Transformation', 'bg-violet-50 border-violet-100', 'Lasting growth in how you speak, carry yourself and connect with others.'],
];

export default function AboutPage() {
  useSeo({ title: 'About Us', description: SITE.aboutIntro });

  return (
    <PageTransition>
      <section className="hero-mesh border-b border-indigo-100/80 py-16 sm:py-22">
        <div className="container-x grid items-center gap-12 lg:grid-cols-12">
          <FadeIn className="lg:col-span-7">
            <span className="pill-eyebrow">About {SITE.name}</span>
            <h1 className="display mt-4 text-4xl font-bold sm:text-5xl lg:text-6xl">
              Building Confidence. Nurturing Potential.
            </h1>
            <p className="mt-5 text-base leading-relaxed text-slate-700 sm:text-lg">{SITE.aboutIntro}</p>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              NŌRÉA brings together engaging Spoken English training, uplifting Personality Development, and thoughtful
              Parenting education in a joyful, student-first environment.
            </p>
          </FadeIn>

          <FadeIn delay={0.1} className="lg:col-span-5">
            <div className="overflow-hidden rounded-[2rem] border-4 border-white shadow-lift">
              <img src="/images/about.jpg" alt="Mentoring at NŌRÉA" className="aspect-[4/5] w-full object-cover" />
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="py-18 sm:py-22">
        <div className="container-x grid gap-8 md:grid-cols-2">
          <FadeIn>
            <div className="card h-full p-8 sm:p-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-soft">
                <Compass className="h-5 w-5" />
              </div>
              <h2 className="mt-5 font-serif text-3xl font-bold text-ink">Our Mission</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">{SITE.mission}</p>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="card h-full p-8 sm:p-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 text-white shadow-soft">
                <Eye className="h-5 w-5" />
              </div>
              <h2 className="mt-5 font-serif text-3xl font-bold text-ink">Our Vision</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">{SITE.vision}</p>
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container-x">
          <FadeIn className="max-w-2xl">
            <span className="pill-eyebrow">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Our Approach
            </span>
            <h2 className="display mt-4 text-4xl font-bold sm:text-5xl">Five commitments that guide every session.</h2>
          </FadeIn>

          <Stagger className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {APPROACH.map(([title, tint, body]) => (
              <StaggerItem key={title}>
                <div className={`h-full rounded-3xl border p-7 ${tint}`}>
                  <CheckCircle2 className="h-5 w-5 text-indigo-600" />
                  <h3 className="mt-4 font-serif text-2xl font-bold text-ink">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{body}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <CtaBanner />
    </PageTransition>
  );
}
