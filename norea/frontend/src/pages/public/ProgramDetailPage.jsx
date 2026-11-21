import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Clock, Award, IndianRupee, UserCheck, Monitor } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { FadeIn, PageTransition } from '../../components/ui/Motion';
import { ErrorState, Skeleton } from '../../components/ui/StateViews';
import { useAuth } from '../../context/AuthContext';
import { useAsync } from '../../hooks';
import { useSeo } from '../../hooks/useSeo';
import { admissionService, programService } from '../../services';
import { assetUrl, parseError } from '../../services/api';
import { modeLabel } from '../../utils/constants';

export default function ProgramDetailPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [applying, setApplying] = useState(false);

  const { data: res, loading, error, reload } = useAsync(() => programService.get(slug), [slug]);
  const program = res?.data;

  const jsonLd = useMemo(
    () =>
      program && {
        '@context': 'https://schema.org',
        '@type': 'Course',
        name: program.title,
        description: program.short_description || program.description,
        provider: { '@type': 'EducationalOrganization', name: 'NŌRÉA – Learning & Development' },
      },
    [program]
  );

  useSeo({
    title: program?.title || 'Program Details',
    description: program?.short_description || program?.description,
    image: program?.image,
    jsonLd,
  });

  const onApply = async () => {
    setApplying(true);
    try {
      const r = await admissionService.create({ program_id: program.id });
      toast.success(r.message);
    } catch (err) {
      toast.error(parseError(err).message);
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="container-x py-16 space-y-6">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-12 w-2/3" />
        <Skeleton className="aspect-[16/7] w-full rounded-3xl" />
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="container-x py-20">
        <ErrorState message="We could not find this program." onRetry={reload} />
        <div className="mt-6 text-center">
          <Button to="/programs" variant="outline">
            <ArrowLeft className="h-4 w-4" /> Back to Programs
          </Button>
        </div>
      </div>
    );
  }

  // Only show optional program metadata that an admin has actually configured.
  const metaRows = [
    program.duration && { icon: Clock, label: 'Duration', value: program.duration },
    program.fees && { icon: IndianRupee, label: 'Program Fee', value: program.fees },
    program.certification && { icon: Award, label: 'Certification', value: program.certification },
    program.learning_modes?.length > 0 && {
      icon: Monitor,
      label: 'Learning Modes',
      value: program.learning_modes.map(modeLabel).join(', '),
    },
  ].filter(Boolean);

  return (
    <PageTransition>
      <section className="border-b border-beige/70 bg-sand/50 py-12 sm:py-18">
        <div className="container-x">
          <Link
            to="/programs"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-navy/70 transition hover:text-navy"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> All Programs
          </Link>

          <div className="mt-7 grid items-center gap-10 lg:grid-cols-12">
            <FadeIn className="lg:col-span-7">
              <div className="flex flex-wrap gap-2">
                {(program.learning_modes || []).map((m) => (
                  <Badge key={m} tone="gold">
                    {modeLabel(m)}
                  </Badge>
                ))}
              </div>
              <h1 className="display mt-4 text-4xl sm:text-5xl lg:text-[3.5rem]">{program.title}</h1>
              <p className="mt-5 text-base leading-relaxed text-charcoal/85 sm:text-lg">
                {program.short_description || program.description}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3.5">
                <Button to={`/admissions?program=${program.id}`} variant="primary" size="lg">
                  Enquire Now <ArrowRight className="h-4 w-4" />
                </Button>
                {user?.role === 'student' && (
                  <Button variant="gold" size="lg" onClick={onApply} loading={applying}>
                    Apply as Student
                  </Button>
                )}
              </div>
            </FadeIn>

            <FadeIn delay={0.1} className="lg:col-span-5">
              <div className="overflow-hidden rounded-3xl border border-beige bg-white shadow-lift">
                <img
                  src={assetUrl(program.image) || '/images/hero.jpg'}
                  alt={program.title}
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-22">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <div className="space-y-12 lg:col-span-8">
            <FadeIn>
              <h2 className="font-serif text-3xl text-navy">About This Program</h2>
              <div className="gold-rule mt-3" />
              <div className="prose-norea mt-5 whitespace-pre-line text-sm leading-relaxed text-charcoal/85 sm:text-base">
                {program.description}
              </div>
            </FadeIn>

            {program.topics?.length > 0 && (
              <FadeIn>
                <h2 className="font-serif text-3xl text-navy">Key Topics Covered</h2>
                <div className="gold-rule mt-3" />
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {program.topics.map((t, i) => (
                    <div key={t.id || i} className="flex items-center gap-3.5 rounded-2xl border border-beige bg-white p-4 shadow-soft">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sand font-serif text-sm font-semibold text-navy">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="text-sm font-medium text-navy">{t.topic_name}</span>
                    </div>
                  ))}
                </div>
              </FadeIn>
            )}

            {program.learning_outcomes?.length > 0 && (
              <FadeIn>
                <h2 className="font-serif text-3xl text-navy">Learning Outcomes</h2>
                <div className="gold-rule mt-3" />
                <ul className="mt-6 space-y-3">
                  {program.learning_outcomes.map((o, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-charcoal/85 sm:text-base">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-gold-dark" />
                      <span>{o}</span>
                    </li>
                  ))}
                </ul>
              </FadeIn>
            )}

            {program.highlights?.length > 0 && (
              <FadeIn>
                <h2 className="font-serif text-3xl text-navy">Course Highlights</h2>
                <div className="gold-rule mt-3" />
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {program.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-2.5 rounded-xl bg-sand/65 px-4 py-3 text-sm text-navy">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold-dark" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </FadeIn>
            )}

            {program.trainer_info && (
              <FadeIn>
                <h2 className="font-serif text-3xl text-navy">Facilitation & Mentorship</h2>
                <div className="gold-rule mt-3" />
                <div className="mt-5 flex items-start gap-4 rounded-2xl border border-beige bg-white p-6 shadow-soft">
                  <UserCheck className="mt-0.5 h-5 w-5 shrink-0 text-gold-dark" />
                  <p className="whitespace-pre-line text-sm leading-relaxed text-charcoal/85">{program.trainer_info}</p>
                </div>
              </FadeIn>
            )}
          </div>

          {/* Sticky sidebar */}
          <aside className="lg:col-span-4">
            <div className="sticky top-28 space-y-6">
              <div className="card p-7">
                <h3 className="font-serif text-2xl text-navy">Program Overview</h3>
                <div className="gold-rule mt-2.5" />

                {metaRows.length > 0 && (
                  <dl className="mt-5 divide-y divide-beige/70">
                    {metaRows.map(({ icon: Icon, label, value }) => (
                      <div key={label} className="flex items-start gap-3 py-3.5">
                        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-gold-dark" />
                        <div>
                          <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted">{label}</dt>
                          <dd className="mt-0.5 text-sm font-medium text-navy">{value}</dd>
                        </div>
                      </div>
                    ))}
                  </dl>
                )}

                <p className="mt-4 text-xs leading-relaxed text-muted">
                  Batch schedules, fee structure and personalised guidance are shared by our admissions team upon enquiry.
                </p>

                <div className="mt-6 space-y-2.5">
                  <Button to={`/admissions?program=${program.id}`} variant="primary" size="md" className="w-full">
                    Enquire for This Program <ArrowRight className="h-4 w-4" />
                  </Button>
                  {user?.role === 'student' ? (
                    <Button variant="outline" size="md" className="w-full" onClick={onApply} loading={applying}>
                      Submit Student Application
                    </Button>
                  ) : (
                    <Button to="/contact" variant="outline" size="md" className="w-full">
                      Ask a Question
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </PageTransition>
  );
}
