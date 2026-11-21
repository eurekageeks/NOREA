import { useMemo, useState } from 'react';
import ProgramCard from '../../components/ProgramCard';
import CtaBanner from '../../components/CtaBanner';
import { FadeIn, PageTransition } from '../../components/ui/Motion';
import { CardSkeleton, EmptyState, ErrorState } from '../../components/ui/StateViews';
import { useAsync } from '../../hooks';
import { useSeo } from '../../hooks/useSeo';
import { programService } from '../../services';

const MODES = [
  { value: 'all', label: 'All Programs' },
  { value: 'online', label: 'Online' },
  { value: 'offline', label: 'In-person' },
  { value: 'hybrid', label: 'Hybrid' },
];

export default function ProgramsPage() {
  useSeo({
    title: 'Our Programs',
    description:
      'Explore NŌRÉA programs in Spoken English & Communication, Personality Development, and Parenting & Child Development.',
  });

  const [mode, setMode] = useState('all');
  const { data: res, loading, error, reload } = useAsync(() => programService.list(), []);
  const programs = res?.data || [];

  const filtered = useMemo(() => {
    if (mode === 'all') return programs;
    return programs.filter((p) => (p.learning_modes || []).includes(mode));
  }, [programs, mode]);

  return (
    <PageTransition>
      <section className="border-b border-beige/70 bg-sand/50 py-16 sm:py-22">
        <div className="container-x">
          <FadeIn className="max-w-3xl">
            <span className="eyebrow">Our Programs</span>
            <h1 className="display mt-4 text-4xl sm:text-5xl lg:text-6xl">
              Programs crafted for clarity, poise and connection.
            </h1>
            <p className="mt-5 text-base leading-relaxed text-muted sm:text-lg">
              Choose a program aligned with your personal or parenting goals. Each curriculum combines structured
              foundations with practical, interactive sessions.
            </p>
          </FadeIn>

          <div className="mt-8 flex flex-wrap gap-2">
            {MODES.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setMode(m.value)}
                className={`rounded-full px-4 py-2 text-xs font-semibold tracking-wide transition ${
                  mode === m.value
                    ? 'bg-navy text-ivory shadow-soft'
                    : 'border border-beige bg-white text-navy/75 hover:border-gold hover:text-navy'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="container-x">
          {loading ? (
            <CardSkeleton count={3} />
          ) : error ? (
            <ErrorState message="Could not load programs." onRetry={reload} />
          ) : filtered.length === 0 ? (
            <EmptyState
              title="No programs match this learning mode"
              description="Try viewing all programs or reach out to our admissions team for upcoming batches."
            />
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((p) => (
                <ProgramCard key={p.id} program={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      <CtaBanner
        heading="Unsure which program is right for you?"
        body="Share your goals with our admissions counsellors and we will guide you toward the right fit."
      />
    </PageTransition>
  );
}
