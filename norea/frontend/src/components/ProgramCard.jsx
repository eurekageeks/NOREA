import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import Button from './ui/Button';

export default function ProgramCard({ program }) {
  return (
    <article className="group card flex h-full flex-col overflow-hidden transition duration-300 hover:-translate-y-1.5 hover:shadow-lift">
      <Link to={`/programs/${program.slug}`} className="relative block aspect-[4/3] overflow-hidden">
        <img
          src={program.image}
          alt={program.title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
        <div className={`absolute inset-0 bg-gradient-to-t ${program.gradient} opacity-25 mix-blend-multiply`} />
        <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/65 via-transparent to-transparent" />
        <span
          className={`absolute top-4 left-4 rounded-full bg-gradient-to-r ${program.gradient} px-3.5 py-1 text-[0.7rem] font-bold uppercase tracking-wider text-white shadow-soft`}
        >
          {program.badge}
        </span>
        <div className="absolute bottom-3 left-4 flex flex-wrap gap-1.5">
          {program.learningModes.map((m) => (
            <span
              key={m}
              className="rounded-full bg-white/92 px-2.5 py-0.5 text-[0.68rem] font-bold text-indigo-950 backdrop-blur-sm"
            >
              {m}
            </span>
          ))}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-6">
        <Link to={`/programs/${program.slug}`}>
          <h3 className="font-serif text-2xl font-bold text-ink transition group-hover:text-indigo-600">
            {program.title}
          </h3>
        </Link>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{program.shortDescription}</p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {program.topics.map((t) => (
            <span
              key={t}
              className={`rounded-full ${program.softBg} ${program.accentText} px-3 py-1 text-xs font-semibold ring-1 ring-inset ${program.ring}`}
            >
              {t}
            </span>
          ))}
        </div>

        <ul className="mt-5 space-y-1.5 border-t border-slate-100 pt-4">
          {program.learningOutcomes.slice(0, 3).map((item) => (
            <li key={item} className="flex items-start gap-2 text-xs leading-relaxed text-slate-700">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto flex items-center gap-2.5 pt-6">
          <Button to={`/programs/${program.slug}`} variant="outline" size="sm" className="flex-1">
            View Details
          </Button>
          <Button to={`/admissions?program=${encodeURIComponent(program.title)}`} variant="primary" size="sm" className="flex-1">
            Enquire Now <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </article>
  );
}
