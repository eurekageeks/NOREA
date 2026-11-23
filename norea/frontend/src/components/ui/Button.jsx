import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const VARIANTS = {
  primary:
    'bg-gradient-to-r from-indigo-600 via-violet-600 to-rose-500 text-white shadow-soft hover:brightness-110 active:scale-[0.98]',
  amber:
    'bg-gradient-to-r from-amber-400 to-orange-500 text-indigo-950 font-bold shadow-soft hover:brightness-105 active:scale-[0.98]',
  whatsapp:
    'bg-[#25D366] text-white font-semibold shadow-soft hover:bg-[#1ebe5d] active:scale-[0.98]',
  outline:
    'border-2 border-indigo-200 bg-white text-indigo-900 hover:border-indigo-500 hover:bg-indigo-50',
  outlineLight:
    'border-2 border-white/40 bg-white/10 text-white backdrop-blur-sm hover:bg-white hover:text-indigo-950',
  subtle: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100',
  ghost: 'bg-transparent text-slate-700 hover:bg-indigo-50 hover:text-indigo-700',
};

const SIZES = {
  sm: 'px-4 py-2 text-xs gap-1.5 rounded-xl',
  md: 'px-5 py-2.5 text-sm gap-2 rounded-2xl',
  lg: 'px-7 py-3.5 text-sm gap-2.5 rounded-2xl',
};

const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', loading = false, disabled = false, to, href, className = '', children, type = 'button', ...rest },
  ref
) {
  const cls = `inline-flex items-center justify-center font-semibold tracking-wide transition duration-200 cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed ${VARIANTS[variant] || VARIANTS.primary} ${SIZES[size] || SIZES.md} ${className}`;

  if (to) {
    return (
      <Link ref={ref} to={to} className={cls} {...rest}>
        {children}
      </Link>
    );
  }
  if (href) {
    return (
      <a ref={ref} href={href} className={cls} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <button ref={ref} type={type} disabled={disabled || loading} className={cls} {...rest}>
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
});

export default Button;
