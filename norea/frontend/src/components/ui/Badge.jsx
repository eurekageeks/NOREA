const TONES = {
  blue: 'bg-sky-50 text-sky-800 ring-sky-200/80',
  violet: 'bg-violet-50 text-violet-800 ring-violet-200/80',
  amber: 'bg-amber-50 text-amber-800 ring-amber-200/80',
  green: 'bg-emerald-50 text-emerald-800 ring-emerald-200/80',
  red: 'bg-red-50 text-red-700 ring-red-200/80',
  gray: 'bg-stone-100 text-stone-700 ring-stone-200/80',
  gold: 'bg-gold/15 text-navy ring-gold/40',
  navy: 'bg-navy text-ivory ring-navy',
};

export default function Badge({ tone = 'gray', children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${TONES[tone] || TONES.gray} ${className}`}
    >
      {children}
    </span>
  );
}
