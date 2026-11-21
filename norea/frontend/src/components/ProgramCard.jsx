import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import Button from './ui/Button';
import { assetUrl } from '../services/api';

export default function ProgramCard({ program }) {
  const outcomes = (program.learning_outcomes || []).slice(0, 3);
  const highlights = (program.highlights || []).slice(0, 3);
  const topics = (program.topics || []).slice(0, 5);

  return (
    <article className="group card flex h-full flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-lift">
      <Link to={`/programs/${program.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-sand">
        {program.image ? (
          <img
            src={assetUrl(program.image)}
            alt={program.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-navy text-ivory/50 font-serif text-3xl">
            NŌRÉA
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/45 via-transparent to-transparent" />
        {program.learning_modes?.length > 0 && (
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
            {program.learning_modes.map((m) => (
              <span
                key={m}
                className="rounded-full bg-ivory/92 px-2.5 py-0.5 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-navy backdrop-blur-sm"
              >
                {m === 'offline' ? 'In-person' : m}
              </span>
            ))}
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <Link to={`/programs/${program.slug}`} className="group/title">
          <h3 className="font-serif text-2xl leading-snug text-navy transition group-hover/title:text-gold-dark">
            {program.title}
          </h3>
        </Link>
        <p className="mt-2.5 text-sm leading-relaxed text-muted">
          {program.short_description || program.description}
        </p>

        {topics.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-1.5">
            {topics.map((t) => (
              <span
                key={t.id || t.topic_name}
                className="rounded-lg border border-beige/90 bg-ivory px-2.5 py-1 text-xs font-medium text-navy/80"
              >
                {t.topic_name || t}
              </span>
            ))}
          </div>
        )}

        {outcomes.length > 0 && (
          <div className="mt-5 border-t border-beige/70 pt-4">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-gold-dark">
              Learning Outcomes
            </p>
            <ul className="mt-2.5 space-y-1.5">
              {outcomes.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs leading-relaxed text-charcoal/85">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-dark" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {highlights.length > 0 && (
          <div className="mt-4 border-t border-beige/60 pt-3.5">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-navy/55">
              Course Highlights
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-muted">
              {highlights.join('  •  ')}
            </p>
          </div>
        )}

        <div className="mt-auto flex items-center gap-3 pt-6">
          <Button to={`/programs/${program.slug}`} variant="outline" size="sm" className="flex-1">
            View Details
          </Button>
          <Button to={`/admissions?program=${program.id}`} variant="primary" size="sm" className="flex-1">
            Enquire Now <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </article>
  );
}
