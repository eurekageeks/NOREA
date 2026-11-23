import ProgramCard from '../../components/ProgramCard';
import CtaBanner from '../../components/CtaBanner';
import { FadeIn, PageTransition } from '../../components/ui/Motion';
import { PROGRAMS } from '../../data/programs';
import { useSeo } from '../../hooks/useSeo';

export default function ProgramsPage() {
  useSeo({
    title: 'Our Programs',
    description:
      'Explore NŌRÉA programs in Spoken English & Communication, Personality Development, and Parenting & Child Development.',
  });

  return (
    <PageTransition>
      <section className="hero-mesh border-b border-indigo-100/80 py-16 sm:py-20">
        <div className="container-x max-w-3xl">
          <FadeIn>
            <span className="pill-eyebrow">Our Programs</span>
            <h1 className="display mt-4 text-4xl font-bold sm:text-5xl lg:text-6xl">
              Programs crafted for clarity, confidence and joy.
            </h1>
            <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
              Choose a program aligned with your personal, academic, or parenting goals. Available in Online, In-person,
              and Hybrid formats.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-16 sm:py-22">
        <div className="container-x grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {PROGRAMS.map((p) => (
            <ProgramCard key={p.id} program={p} />
          ))}
        </div>
      </section>

      <CtaBanner
        heading="Not sure which program fits you best?"
        body="Send a quick enquiry and we will guide you on WhatsApp & Email!"
      />
    </PageTransition>
  );
}
