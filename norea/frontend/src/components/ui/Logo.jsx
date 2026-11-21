import { assetUrl } from '../../services/api';
import { useSettings } from '../../context/SettingsContext';

/**
 * Elegant typographic NŌRÉA logo (with optional custom uploaded logo from settings).
 * variant: 'dark' (navy text on light bg) | 'light' (ivory text on navy bg)
 */
export default function Logo({ variant = 'dark', size = 'md', showSubtitle = true, className = '' }) {
  const { settings } = useSettings();
  const isLight = variant === 'light';
  const name = settings.institute_name || 'NŌRÉA';
  const category = settings.institute_category || 'Learning & Development';

  const sizes = {
    sm: { title: 'text-xl tracking-[0.22em]', sub: 'text-[0.55rem] tracking-[0.28em]', img: 'h-8' },
    md: { title: 'text-2xl tracking-[0.24em]', sub: 'text-[0.6rem] tracking-[0.3em]', img: 'h-9' },
    lg: { title: 'text-3xl sm:text-4xl tracking-[0.26em]', sub: 'text-[0.68rem] tracking-[0.34em]', img: 'h-11' },
  }[size];

  if (settings.logo) {
    return (
      <span className={`inline-flex items-center gap-3 ${className}`}>
        <img src={assetUrl(settings.logo)} alt={name} className={`${sizes.img} w-auto object-contain`} />
        {showSubtitle && (
          <span className="flex flex-col leading-none">
            <span className={`font-serif font-semibold ${sizes.title} ${isLight ? 'text-ivory' : 'text-navy'}`}>
              {name}
            </span>
            <span className={`mt-1 font-sans uppercase ${sizes.sub} ${isLight ? 'text-gold-light' : 'text-gold-dark'}`}>
              {category}
            </span>
          </span>
        )}
      </span>
    );
  }

  return (
    <span className={`inline-flex flex-col leading-none select-none ${className}`}>
      <span className="inline-flex items-center gap-2">
        <span className={`font-serif font-semibold ${sizes.title} ${isLight ? 'text-ivory' : 'text-navy'}`}>
          {name}
        </span>
      </span>
      {showSubtitle && (
        <span className="mt-1 flex items-center gap-2">
          <span className="h-px w-4 bg-gold/80" />
          <span className={`font-sans font-medium uppercase ${sizes.sub} ${isLight ? 'text-gold-light/90' : 'text-gold-dark'}`}>
            {category}
          </span>
        </span>
      )}
    </span>
  );
}
