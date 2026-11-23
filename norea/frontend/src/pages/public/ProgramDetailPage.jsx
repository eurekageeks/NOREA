import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Monitor } from 'lucide-react';
import Button from '../../components/ui/Button';
import EnquiryForm from '../../components/EnquiryForm';
import { FadeIn, PageTransition } from '../../components/ui/Motion';
import { getProgramBySlug } from '../../data/programs';
import { useSeo } from '../../hooks/useSeo';

export default function ProgramDetailPage() {
  const { slug } = useParams();
  const program = getProgramBySlug(slug);

  useSeo({
    title: program?.title || 'Program Not Found',
    description: program?.shortDescription,
  });

  if (!program) {
    return (
      <div className="container-x py-24 text-center">
        <h1 className="display text-4xl font-bold">Program not found</h1>
        <Button to="/programs" variant="primary" className="mt-6">
          <ArrowLeft className="h-4 w-4" /> Back to Programs
        </Button>
      </div>
    );
  }

  return (
    <PageTransition>
      <section className="hero-mesh border-b border-indigo-100/80 py-14 sm:py-20">
        <div className="container-x">
          <Link
            to="/programs"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-indigo-700 hover:text-indigo-950"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> All Programs
          </Link>

          <div className="mt-6 grid items-center gap-10 lg:grid-cols-12">
            <FadeIn className="lg:col-span-7">
              <span
                className={`inline-block rounded-full bg-gradient-to-r ${program.gradient} px-4 py-1 text-xs font-bold uppercase tracking-wider text-white`}
              >
                {program.badge}
              </span>
              <h1 className="display mt-4 text-4xl font-bold sm:text-5xl">{program.title}</h1>
              <p className="mt-4 text-base leading-relaxed text-slate-700 sm:text-lg">{program.description}</p>

              <div className="mt-6 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <Monitor className="h-4 w-4 text-indigo-600" /> Modes:
                </span>
                {program.learningModes.map((m) => (
                  <span key={m} className="rounded-full bg-white px-3 py-1 text-xs font-bold text-indigo-900 ring-1 ring-indigo-100">
                    {m}
                  </span>
                ))}
              </div>

              <div className="mt-8">
                <Button href="#program-enquiry" variant="primary" size="lg">
                  Enquire for This Program <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </FadeIn>

            <FadeIn delay={0.1} className="lg:col-span-5">
              <div className="overflow-hidden rounded-[2rem] border-4 border-white shadow-lift">
                <img src={program.image} alt={program.title} className="aspect-[4/3] w-full object-cover" />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-22">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <div className="space-y-10 lg:col-span-7">
            <FadeIn>
              <h2 className="font-serif text-3xl font-bold text-ink">Key Topics Covered</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {program.topics.map((t, i) => (
                  <div key={t} className={`flex items-center gap-3.5 rounded-2xl border p-4 ${program.softBg} border-indigo-100`}>
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${program.gradient} text-xs font-bold text-white`}
                    >
                      {i + 1}
                    </span>
                    <span className="text-sm font-bold text-ink">{t}</span>
                  </div>
                ))}
              </div>
            </FadeIn>

            <FadeIn>
              <h2 className="font-serif text-3xl font-bold text-ink">Learning Outcomes</h2>
              <ul className="mt-4 space-y-3">
                {program.learningOutcomes.map((o) => (
                  <li key={o} className="flex items-start gap-3 text-sm leading-relaxed text-slate-700 sm:text-base">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                    <span>{o}</span>
                  </li>
                ))}
              </ul>
            </FadeIn>

            <FadeIn>
              <h2 className="font-serif text-3xl font-bold text-ink">Course Highlights</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {program.highlights.map((h) => (
                  <div key={h} className="flex items-start gap-2.5 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-ink">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>

          <div id="program-enquiry" className="scroll-mt-24 lg:col-span-5">
            <div className="sticky top-28">
              <EnquiryForm
                defaultProgram={program.title}
                title="Enquire for This Program"
                subtitle="Submit your details to get instant WhatsApp & Email confirmation."
              />
            </div>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
