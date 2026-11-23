import { FadeIn, PageTransition } from '../../components/ui/Motion';
import WhyNoreaGrid from '../../components/WhyNoreaGrid';
import CtaBanner from '../../components/CtaBanner';
import { SITE } from '../../config/siteConfig';
import { useSeo } from '../../hooks/useSeo';

export default function WhyNoreaPage() {
  useSeo({
    title: 'Why NŌRÉA',
    description:
      'Discover why students love NŌRÉA — practical learning, interactive sessions, personal attention, confidence-building activities, and experienced trainers.',
  });

  return (
    <PageTransition>
      <section className="hero-mesh border-b border-indigo-100/80 py-16 sm:py-22">
        <div className="container-x grid items-center gap-12 lg:grid-cols-12">
          <FadeIn className="lg:col-span-7">
            <span className="pill-eyebrow">Why {SITE.name}</span>
            <h1 className="display mt-4 text-4xl font-bold sm:text-5xl lg:text-6xl">
              An uplifting space where every student finds their voice.
            </h1>
            <p className="mt-5 text-base leading-relaxed text-slate-600 sm:text-lg">
              Real confidence grows in a friendly, encouraging room. At NŌRÉA, every class is interactive, practical,
              and tailored to help students speak freely and enjoy learning.
            </p>
          </FadeIn>

          <FadeIn delay={0.1} className="lg:col-span-5">
            <div className="overflow-hidden rounded-[2rem] border-4 border-white shadow-lift">
              <img
                src="/images/why-norea.jpg"
                alt="Interactive student discussion at NŌRÉA"
                className="aspect-[4/5] w-full object-cover"
              />
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="py-18 sm:py-22">
        <div className="container-x">
          <FadeIn className="mb-12 max-w-2xl">
            <span className="pill-eyebrow">The NŌRÉA Difference</span>
            <h2 className="display mt-4 text-4xl font-bold sm:text-5xl">Five pillars of our learning experience.</h2>
          </FadeIn>
          <WhyNoreaGrid />
        </div>
      </section>

      <CtaBanner />
    </PageTransition>
  );
}
