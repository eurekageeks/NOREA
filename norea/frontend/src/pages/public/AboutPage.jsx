import { CheckCircle2, Compass, Eye, Sparkles } from 'lucide-react';
import { FadeIn, PageTransition, Stagger, StaggerItem } from '../../components/ui/Motion';
import CtaBanner from '../../components/CtaBanner';
import { useSettings } from '../../context/SettingsContext';
import { useSeo } from '../../hooks/useSeo';

const APPROACH = [
  {
    title: 'Practical Learning',
    body: 'Skills come alive through practice. Every concept is immediately applied through real dialogue, exercises and constructive reflection.',
  },
  {
    title: 'Interactive Experiences',
    body: 'Safe, supportive cohorts invite participation, peer learning and candid exchange so learners build fluency naturally.',
  },
  {
    title: 'Personal Attention',
    body: 'No two learners share the same starting point. Trainers take time to understand individual strengths, hesitations and goals.',
  },
  {
    title: 'Confidence Development',
    body: 'Confidence is not performed — it is cultivated step by step through clear preparation, positive reinforcement and steady progress.',
  },
  {
    title: 'Positive Transformation',
    body: 'Our focus extends beyond technique to how you carry yourself, connect with others and show up in daily life and relationships.',
  },
];

export default function AboutPage() {
  const { settings } = useSettings();
  useSeo({
    title: 'About Us',
    description: settings.about_intro,
  });

  return (
    <PageTransition>
      {/* Header */}
      <section className="border-b border-beige/70 bg-sand/50 py-16 sm:py-24">
        <div className="container-x">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            <FadeIn className="lg:col-span-7">
              <span className="eyebrow">About {settings.institute_name}</span>
              <h1 className="display mt-4 text-4xl sm:text-5xl lg:text-6xl">
                Building Confidence. Nurturing Potential.
              </h1>
              <p className="mt-6 text-base leading-relaxed text-charcoal/85 sm:text-lg">{settings.about_intro}</p>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                Founded on the belief that communication and self-assurance shape every area of life, NŌRÉA brings
                together structured communication training, personality development and thoughtful parenting education in
                a warm, contemporary learning environment.
              </p>
            </FadeIn>

            <FadeIn delay={0.12} className="lg:col-span-5">
              <div className="overflow-hidden rounded-3xl border border-beige bg-white shadow-lift">
                <img
                  src="/images/about.jpg"
                  alt="Mentoring session at NŌRÉA"
                  className="aspect-[4/5] w-full object-cover"
                />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 sm:py-24">
        <div className="container-x grid gap-8 md:grid-cols-2">
          <FadeIn>
            <div className="card h-full p-8 sm:p-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy text-gold-light">
                <Compass className="h-5 w-5" />
              </div>
              <h2 className="mt-6 font-serif text-3xl text-navy">Our Mission</h2>
              <div className="gold-rule mt-3" />
              <p className="mt-5 text-sm leading-relaxed text-charcoal/80 sm:text-base">{settings.mission}</p>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="card h-full p-8 sm:p-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/20 text-gold-dark">
                <Eye className="h-5 w-5" />
              </div>
              <h2 className="mt-6 font-serif text-3xl text-navy">Our Vision</h2>
              <div className="gold-rule mt-3" />
              <p className="mt-5 text-sm leading-relaxed text-charcoal/80 sm:text-base">{settings.vision}</p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Learning Philosophy */}
      <section className="border-y border-beige/70 bg-navy py-20 text-ivory sm:py-24">
        <div className="container-x">
          <FadeIn className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-3 text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-gold-light">
              <span className="h-px w-7 bg-gold/70" />
              Our Learning Philosophy
              <span className="h-px w-7 bg-gold/70" />
            </span>
            <h2 className="mt-5 font-serif text-4xl text-ivory sm:text-5xl">{settings.tagline}</h2>
            <p className="mt-5 text-sm leading-relaxed text-ivory/75 sm:text-base">
              We believe meaningful learning follows three gentle rhythms: first you <strong className="text-gold-light">Learn</strong> clear,
              practical foundations; then you <strong className="text-gold-light">Express</strong> yourself in a supportive room without fear of
              judgement; and finally you <strong className="text-gold-light">Grow</strong> into lasting poise, clarity and connection.
            </p>
          </FadeIn>

          <Stagger className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              ['01', 'Learn', 'Understand clear principles of language, presence, emotional awareness and communication.'],
              ['02', 'Express', 'Practise openly through conversations, presentations, role plays and reflective discussions.'],
              ['03', 'Grow', 'Carry renewed confidence and empathy into interviews, workplaces, stages and family life.'],
            ].map(([num, title, desc]) => (
              <StaggerItem key={num}>
                <div className="h-full rounded-2xl border border-ivory/12 bg-navy-700/40 p-7">
                  <span className="font-serif text-3xl text-gold-light/80">{num}</span>
                  <h3 className="mt-3 font-serif text-2xl text-ivory">{title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-ivory/70">{desc}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Our Approach */}
      <section className="py-20 sm:py-24">
        <div className="container-x">
          <FadeIn className="max-w-2xl">
            <span className="eyebrow">Our Approach</span>
            <h2 className="display mt-4 text-4xl sm:text-5xl">Five commitments that guide every session.</h2>
          </FadeIn>

          <Stagger className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {APPROACH.map((item) => (
              <StaggerItem key={item.title}>
                <div className="card h-full p-7">
                  <CheckCircle2 className="h-5 w-5 text-gold-dark" />
                  <h3 className="mt-4 font-serif text-2xl text-navy">{item.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted">{item.body}</p>
                </div>
              </StaggerItem>
            ))}
            <StaggerItem>
              <div className="flex h-full flex-col justify-between rounded-2xl border border-gold/30 bg-sand/70 p-7">
                <div>
                  <Sparkles className="h-5 w-5 text-gold-dark" />
                  <h3 className="mt-4 font-serif text-2xl text-navy">Tailored to Your Pace</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted">
                    Available across online, in-person and hybrid formats so learning fits smoothly into your schedule.
                  </p>
                </div>
              </div>
            </StaggerItem>
          </Stagger>
        </div>
      </section>

      <CtaBanner />
    </PageTransition>
  );
}
