import { FadeIn, PageTransition } from '../../components/ui/Motion';
import WhyNoreaGrid from '../../components/WhyNoreaGrid';
import CtaBanner from '../../components/CtaBanner';
import { useSettings } from '../../context/SettingsContext';
import { useSeo } from '../../hooks/useSeo';

export default function WhyNoreaPage() {
  const { settings } = useSettings();
  useSeo({
    title: 'Why NŌRÉA',
    description:
      'Discover why learners and parents choose NŌRÉA — practical learning, interactive sessions, personal attention, confidence-building activities and experienced trainers.',
  });

  return (
    <PageTransition>
      <section className="border-b border-beige/70 bg-sand/50 py-16 sm:py-24">
        <div className="container-x grid items-center gap-12 lg:grid-cols-12">
          <FadeIn className="lg:col-span-7">
            <span className="eyebrow">Why {settings.institute_name}</span>
            <h1 className="display mt-4 text-4xl sm:text-5xl lg:text-6xl">
              An environment built for genuine confidence, not performance.
            </h1>
            <p className="mt-6 text-base leading-relaxed text-charcoal/85 sm:text-lg">
              Lasting communication and personality growth require more than theory. At NŌRÉA, every detail — from
              session format to individual mentorship — is crafted to help you feel heard, supported and steadily
              stronger.
            </p>
          </FadeIn>

          <FadeIn delay={0.1} className="lg:col-span-5">
            <div className="overflow-hidden rounded-3xl border border-beige bg-white shadow-lift">
              <img
                src="/images/why-norea.jpg"
                alt="Interactive learning circle at NŌRÉA"
                className="aspect-[4/5] w-full object-cover"
              />
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="container-x">
          <FadeIn className="mb-12 max-w-2xl">
            <span className="eyebrow">The NŌRÉA Difference</span>
            <h2 className="display mt-4 text-4xl sm:text-5xl">Five pillars of our learning experience.</h2>
          </FadeIn>
          <WhyNoreaGrid />
        </div>
      </section>

      <section className="border-y border-beige/70 bg-navy py-20 text-ivory sm:py-24">
        <div className="container-x grid gap-10 lg:grid-cols-3">
          {[
            ['Supportive Space', 'A warm, judgement-free room where learners feel comfortable speaking up, trying new habits and asking honest questions.'],
            ['Structured Progress', 'Clear milestones from week to week so you can observe real improvement in fluency, poise and emotional clarity.'],
            ['Flexible Formats', 'Choose online, in-person or hybrid learning modes that fit smoothly around work, studies or family responsibilities.'],
          ].map(([title, body]) => (
            <FadeIn key={title}>
              <div className="border-l border-gold/40 pl-6">
                <h3 className="font-serif text-2xl text-ivory">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ivory/75">{body}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      <CtaBanner />
    </PageTransition>
  );
}
