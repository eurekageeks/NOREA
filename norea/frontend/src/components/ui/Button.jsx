import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const VARIANTS = {
  primary: 'bg-navy text-ivory hover:bg-navy-700 shadow-soft active:scale-[0.99]',
  gold: 'bg-gold text-navy-900 font-semibold hover:bg-gold-dark hover:text-white shadow-soft active:scale-[0.99]',
  outline: 'border border-navy/25 bg-transparent text-navy hover:border-navy hover:bg-navy hover:text-ivory',
  outlineLight: 'border border-ivory/35 bg-transparent text-ivory hover:border-gold hover:bg-gold hover:text-navy-900',
  subtle: 'bg-sand text-navy hover:bg-beige',
  ghost: 'bg-transparent text-navy/80 hover:bg-sand hover:text-navy',
  danger: 'bg-red-600 text-white hover:bg-red-700 shadow-soft',
  dangerOutline: 'border border-red-200 bg-white text-red-600 hover:bg-red-50',
};

const SIZES = {
  xs: 'px-3 py-1.5 text-xs gap-1.5 rounded-lg',
  sm: 'px-4 py-2 text-xs gap-1.5 rounded-xl',
  md: 'px-5 py-2.5 text-sm gap-2 rounded-xl',
  lg: 'px-7 py-3.5 text-sm gap-2.5 rounded-xl',
};

const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', loading = false, disabled = false, to, href, className = '', children, type = 'button', ...rest },
  ref
) {
  const cls = `inline-flex items-center justify-center font-medium tracking-wide transition duration-200 cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed ${VARIANTS[variant] || VARIANTS.primary} ${SIZES[size] || SIZES.md} ${className}`;

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
