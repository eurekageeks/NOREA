import { Sparkles } from 'lucide-react';
import { SITE } from '../../config/siteConfig';

export default function Logo({ variant = 'dark', size = 'md', showSubtitle = true }) {
  const isLight = variant === 'light';
  const titleSize = size === 'sm' ? 'text-xl' : size === 'lg' ? 'text-3xl' : 'text-2xl';

  return (
    <span className="inline-flex items-center gap-2.5 select-none">
      <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 via-rose-500 to-amber-400 text-white shadow-soft">
        <Sparkles className="h-4 w-4" />
      </span>
      <span className="flex flex-col leading-none">
        <span className={`font-serif font-bold tracking-[0.18em] ${titleSize} ${isLight ? 'text-white' : 'text-ink'}`}>
          {SITE.name}
        </span>
        {showSubtitle && (
          <span
            className={`mt-0.5 font-sans text-[0.6rem] font-bold uppercase tracking-[0.24em] ${
              isLight ? 'text-amber-300' : 'text-indigo-600'
            }`}
          >
            {SITE.category}
          </span>
        )}
      </span>
    </span>
  );
}
