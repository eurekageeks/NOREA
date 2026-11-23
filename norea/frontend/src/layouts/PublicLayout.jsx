import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';
import Logo from '../components/ui/Logo';
import Button from '../components/ui/Button';
import { SITE } from '../config/siteConfig';

const NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About Us' },
  { to: '/programs', label: 'Our Programs' },
  { to: '/why-norea', label: 'Why NŌRÉA' },
  { to: '/contact', label: 'Contact Us' },
];

export default function PublicLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-cream text-slate-800">
      <header className="sticky top-0 z-40 border-b border-indigo-100/80 bg-white/90 backdrop-blur-md">
        <div className="container-x flex h-20 items-center justify-between gap-4">
          <Link to="/" aria-label="NŌRÉA Home">
            <Logo size="md" />
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-2 lg:flex">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-indigo-700'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-2.5 lg:flex">
            <Button to="/admissions" variant="primary" size="sm">
              Enquire Now <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle navigation menu"
            className="inline-flex rounded-xl border border-indigo-100 bg-indigo-50 p-2.5 text-indigo-700 lg:hidden"
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
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-indigo-100 bg-white lg:hidden"
            >
              <nav className="container-x flex flex-col gap-1 py-4">
                {NAV.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                        isActive ? 'bg-indigo-600 text-white' : 'text-slate-700 hover:bg-indigo-50'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <Button to="/admissions" variant="primary" size="md" className="w-full">
                    Enquire Now <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-ink text-indigo-100">
        <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-rose-500 via-amber-400 to-teal-400" />
        <div className="container-x py-14">
          <div className="grid gap-10 md:grid-cols-3">
            <div>
              <Logo variant="light" size="md" />
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-indigo-200/85">
                A colourful, welcoming learning institute focused on Spoken English, Personality Development,
                Confidence Building, and Positive Parenting.
              </p>
              <p className="mt-4 text-xs font-bold uppercase tracking-[0.26em] text-amber-300">{SITE.tagline}</p>
            </div>

            <div>
              <h4 className="font-sans text-xs font-bold uppercase tracking-[0.22em] text-amber-300">Quick Links</h4>
              <ul className="mt-4 space-y-2.5 text-sm">
                {[...NAV, { to: '/admissions', label: 'Admissions Enquiry' }].map((item) => (
                  <li key={item.to}>
                    <Link to={item.to} className="text-indigo-200 transition hover:text-white">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-sans text-xs font-bold uppercase tracking-[0.22em] text-amber-300">Get In Touch</h4>
              <ul className="mt-4 space-y-3 text-sm text-indigo-200">
                {SITE.address && (
                  <li className="flex items-start gap-2.5">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                    <span>{SITE.address}</span>
                  </li>
                )}
                {SITE.phoneDisplay && (
                  <li className="flex items-center gap-2.5">
                    <Phone className="h-4 w-4 shrink-0 text-amber-300" />
                    <a href={`tel:${SITE.phoneDisplay}`} className="hover:text-white">
                      {SITE.phoneDisplay}
                    </a>
                  </li>
                )}
                {SITE.instituteEmail && (
                  <li className="flex items-center gap-2.5">
                    <Mail className="h-4 w-4 shrink-0 text-amber-300" />
                    <a href={`mailto:${SITE.instituteEmail}`} className="hover:text-white">
                      {SITE.instituteEmail}
                    </a>
                  </li>
                )}
                {!SITE.address && !SITE.phoneDisplay && !SITE.instituteEmail && (
                  <li className="text-sm text-indigo-200/80">
                    Have a question?{' '}
                    <Link to="/admissions" className="font-semibold text-amber-300 underline underline-offset-4">
                      Submit a quick enquiry
                    </Link>{' '}
                    for instant WhatsApp &amp; Email updates.
                  </li>
                )}
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-white/10 pt-6 text-xs text-indigo-300/80 sm:flex-row">
            <p>
              © {new Date().getFullYear()} {SITE.name} – {SITE.category}. All rights reserved.
            </p>
            <p className="font-semibold uppercase tracking-widest text-amber-300/90">{SITE.tagline}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
