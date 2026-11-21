import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, Mail, Phone, MapPin, User, LayoutDashboard, ArrowUpRight } from 'lucide-react';
import Logo from '../components/ui/Logo';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

const NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About Us' },
  { to: '/programs', label: 'Our Programs' },
  { to: '/why-norea', label: 'Why NŌRÉA' },
  { to: '/contact', label: 'Contact Us' },
  { to: '/admissions', label: 'Admissions' },
];

export default function PublicLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isAdmin } = useAuth();
  const { settings } = useSettings();
  const { pathname } = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const socials = [
    ['Instagram', settings.social_instagram],
    ['Facebook', settings.social_facebook],
    ['LinkedIn', settings.social_linkedin],
    ['YouTube', settings.social_youtube],
    ['X', settings.social_x],
  ].filter(([, url]) => Boolean(url));

  const year = new Date().getFullYear();

  return (
    <div className="flex min-h-screen flex-col bg-ivory text-charcoal">
      <header
        className={`sticky top-0 z-40 transition duration-300 ${
          scrolled ? 'border-b border-beige/90 bg-ivory/95 shadow-soft backdrop-blur-md' : 'border-b border-transparent bg-ivory/85 backdrop-blur-sm'
        }`}
      >
        <div className="container-x flex h-20 items-center justify-between gap-4">
          <Link to="/" aria-label="NŌRÉA Home">
            <Logo size="md" />
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-7 lg:flex">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `relative py-1 text-[0.84rem] font-medium tracking-wide transition ${
                    isActive ? 'text-navy after:absolute after:inset-x-0 after:-bottom-0.5 after:h-[1.5px] after:bg-gold' : 'text-navy/70 hover:text-navy'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-2.5 lg:flex">
            {user ? (
              <Button to={isAdmin ? '/admin' : '/portal'} variant="primary" size="sm">
                {isAdmin ? <LayoutDashboard className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                {isAdmin ? 'Admin Dashboard' : 'Student Portal'}
              </Button>
            ) : (
              <>
                <Button to="/login" variant="ghost" size="sm">
                  Login
                </Button>
                <Button to="/admissions" variant="primary" size="sm">
                  Enquire Now
                </Button>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
            className="inline-flex rounded-xl border border-beige bg-white p-2.5 text-navy lg:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden border-t border-beige bg-ivory lg:hidden"
            >
              <nav className="container-x flex flex-col gap-1 py-4">
                {NAV.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `rounded-xl px-4 py-3 text-sm font-medium transition ${
                        isActive ? 'bg-navy text-ivory' : 'text-navy/80 hover:bg-sand'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
                <div className="mt-3 grid grid-cols-2 gap-2.5 border-t border-beige pt-4">
                  {user ? (
                    <Button to={isAdmin ? '/admin' : '/portal'} variant="primary" size="sm" className="col-span-2">
                      {isAdmin ? 'Admin Dashboard' : 'Student Portal'}
                    </Button>
                  ) : (
                    <>
                      <Button to="/login" variant="outline" size="sm">
                        Login
                      </Button>
                      <Button to="/admissions" variant="primary" size="sm">
                        Enquire Now
                      </Button>
                    </>
                  )}
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-navy-700 bg-navy text-ivory/80">
        <div className="container-x py-16">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <Logo variant="light" size="md" />
              <p className="mt-5 max-w-sm text-sm leading-relaxed text-ivory/70">{settings.footer_about}</p>
              <p className="mt-5 text-xs font-medium uppercase tracking-[0.28em] text-gold-light">{settings.tagline}</p>
            </div>

            <div className="lg:col-span-3">
              <h4 className="font-sans text-xs font-semibold uppercase tracking-[0.22em] text-gold-light">Explore</h4>
              <ul className="mt-4 space-y-2.5 text-sm">
                {NAV.map((item) => (
                  <li key={item.to}>
                    <Link to={item.to} className="transition hover:text-gold-light">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-2">
              <h4 className="font-sans text-xs font-semibold uppercase tracking-[0.22em] text-gold-light">Portals</h4>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <Link to="/login" className="transition hover:text-gold-light">
                    Student Login
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="transition hover:text-gold-light">
                    Student Registration
                  </Link>
                </li>
                <li>
                  <Link to="/admin/login" className="transition hover:text-gold-light">
                    Admin Sign In
                  </Link>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-3">
              <h4 className="font-sans text-xs font-semibold uppercase tracking-[0.22em] text-gold-light">Connect</h4>
              <ul className="mt-4 space-y-3 text-sm text-ivory/75">
                {settings.contact_address && (
                  <li className="flex items-start gap-2.5">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                    <span>{settings.contact_address}</span>
                  </li>
                )}
                {settings.contact_phone && (
                  <li className="flex items-center gap-2.5">
                    <Phone className="h-4 w-4 shrink-0 text-gold" />
                    <a href={`tel:${settings.contact_phone}`} className="hover:text-gold-light">
                      {settings.contact_phone}
                    </a>
                  </li>
                )}
                {settings.contact_email && (
                  <li className="flex items-center gap-2.5">
                    <Mail className="h-4 w-4 shrink-0 text-gold" />
                    <a href={`mailto:${settings.contact_email}`} className="hover:text-gold-light">
                      {settings.contact_email}
                    </a>
                  </li>
                )}
                {!settings.contact_address && !settings.contact_phone && !settings.contact_email && (
                  <li className="text-xs text-ivory/55">
                    Have a question?{' '}
                    <Link to="/contact" className="text-gold-light underline underline-offset-4">
                      Send us a message
                    </Link>
                    .
                  </li>
                )}
              </ul>

              {socials.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {socials.map(([label, url]) => (
                    <a
                      key={label}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg border border-ivory/15 px-2.5 py-1 text-xs text-ivory/80 transition hover:border-gold hover:text-gold-light"
                    >
                      {label} <ArrowUpRight className="h-3 w-3" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-ivory/10 pt-6 text-xs text-ivory/50 sm:flex-row">
            <p>
              © {year} {settings.institute_name} – {settings.institute_category}. {settings.footer_text}
            </p>
            <p className="tracking-widest uppercase text-gold-light/60">{settings.tagline}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
