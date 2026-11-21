import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, UserCircle, LogOut, ArrowLeft } from 'lucide-react';
import Logo from '../components/ui/Logo';
import { useAuth } from '../context/AuthContext';
import { assetUrl } from '../services/api';
import { initials } from '../utils/constants';

const LINKS = [
  { to: '/portal', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/portal/profile', label: 'Profile & Security', icon: UserCircle },
];

export default function PortalLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-ivory">
      <header className="sticky top-0 z-30 border-b border-beige bg-white/95 backdrop-blur-md">
        <div className="container-x flex h-18 items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link to="/portal">
              <Logo size="sm" />
            </Link>
            <span className="hidden rounded-full bg-sand px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-navy/70 sm:inline-block">
              Student Portal
            </span>
          </div>

          <nav className="hidden items-center gap-1 md:flex">
            {LINKS.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${
                    isActive ? 'bg-navy text-ivory' : 'text-navy/70 hover:bg-sand hover:text-navy'
                  }`
                }
              >
                <Icon className="h-4 w-4" /> {label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="hidden items-center gap-1.5 text-xs font-medium text-muted transition hover:text-navy sm:inline-flex"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Website
            </Link>
            <div className="flex items-center gap-2.5 rounded-full border border-beige bg-ivory py-1 pr-3 pl-1">
              {user?.profile?.profile_image ? (
                <img
                  src={assetUrl(user.profile.profile_image)}
                  alt={user.full_name}
                  className="h-7 w-7 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-navy text-xs font-semibold text-gold-light">
                  {initials(user?.full_name)}
                </span>
              )}
              <span className="hidden max-w-32 truncate text-xs font-semibold text-navy sm:inline">
                {user?.full_name}
              </span>
            </div>
            <button
              type="button"
              onClick={onLogout}
              title="Sign out"
              className="inline-flex items-center gap-1.5 rounded-xl border border-beige bg-white px-3 py-2 text-xs font-medium text-navy/80 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Mobile sub-nav */}
        <div className="flex gap-2 border-t border-beige/70 px-5 py-2 md:hidden">
          {LINKS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium ${
                  isActive ? 'bg-navy text-ivory' : 'text-navy/70'
                }`
              }
            >
              <Icon className="h-3.5 w-3.5" /> {label}
            </NavLink>
          ))}
        </div>
      </header>

      <main className="container-x py-8 sm:py-10">
        <Outlet />
      </main>
    </div>
  );
}
