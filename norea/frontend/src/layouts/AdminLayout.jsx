import { useRef, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquareText,
  GraduationCap,
  BookOpen,
  Users,
  BarChart3,
  Settings,
  ShieldCheck,
  Menu,
  X,
  LogOut,
  ExternalLink,
  ChevronDown,
  KeyRound,
} from 'lucide-react';
import Logo from '../components/ui/Logo';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import { Input } from '../components/ui/Field';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useClickOutside } from '../hooks';
import { authService } from '../services';
import { parseError } from '../services/api';
import { initials, ROLE_LABELS, validators } from '../utils/constants';

const MENU = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true, perm: 'dashboard:view' },
  { to: '/admin/enquiries', label: 'Enquiries', icon: MessageSquareText, perm: 'enquiries:view' },
  { to: '/admin/admissions', label: 'Admissions', icon: GraduationCap, perm: 'admissions:view' },
  { to: '/admin/programs', label: 'Programs', icon: BookOpen, perm: 'programs:manage' },
  { to: '/admin/students', label: 'Students', icon: Users, perm: 'students:view' },
  { to: '/admin/reports', label: 'Reports & Analytics', icon: BarChart3, perm: 'reports:view' },
  { to: '/admin/settings', label: 'Website Settings', icon: Settings, perm: 'settings:manage' },
  { to: '/admin/users', label: 'Team & Activity', icon: ShieldCheck, perm: 'users:manage' },
];

export default function AdminLayout() {
  const { user, can, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [pwModal, setPwModal] = useState(false);
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [pwErr, setPwErr] = useState({});
  const [savingPw, setSavingPw] = useState(false);
  const menuRef = useRef(null);

  useClickOutside(menuRef, () => setProfileOpen(false), profileOpen);

  const visibleMenu = MENU.filter((item) => !item.perm || can(item.perm));

  const onLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const onSavePassword = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!pwForm.current_password) errs.current_password = 'Current password is required.';
    const np = validators.password(pwForm.new_password);
    if (np) errs.new_password = np;
    if (pwForm.confirm_password !== pwForm.new_password) errs.confirm_password = 'Passwords do not match.';
    setPwErr(errs);
    if (Object.keys(errs).length) return;

    setSavingPw(true);
    try {
      await authService.changePassword(pwForm);
      toast.success('Password updated.');
      setPwModal(false);
      setPwForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      const p = parseError(err);
      setPwErr(p.fields);
      toast.error(p.message);
    } finally {
      setSavingPw(false);
    }
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-navy text-ivory">
      <div className="flex h-18 items-center justify-between border-b border-ivory/10 px-6">
        <Link to="/admin" onClick={() => setSidebarOpen(false)}>
          <Logo variant="light" size="sm" />
        </Link>
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="rounded-lg p-1.5 text-ivory/70 hover:bg-navy-700 lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
        {visibleMenu.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                isActive
                  ? 'bg-gold/18 text-gold-light ring-1 ring-gold/30'
                  : 'text-ivory/75 hover:bg-navy-700/70 hover:text-ivory'
              }`
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-ivory/10 p-4">
        <Link
          to="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between rounded-xl border border-ivory/12 bg-navy-700/40 px-3.5 py-2.5 text-xs font-medium text-ivory/80 transition hover:border-gold/40 hover:text-gold-light"
        >
          <span>View Public Website</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-ivory">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="sticky top-0 h-screen">
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-[1px]" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-10 w-68 max-w-[85vw]">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main area */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-18 items-center justify-between gap-4 border-b border-beige bg-white/95 px-5 backdrop-blur-md sm:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
              className="rounded-xl border border-beige p-2 text-navy lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-gold-dark">
                Admin Console
              </p>
              <p className="text-xs text-muted">NŌRÉA – Learning & Development</p>
            </div>
          </div>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setProfileOpen((o) => !o)}
              className="flex items-center gap-2.5 rounded-full border border-beige bg-ivory py-1 pr-3 pl-1 transition hover:border-gold"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-xs font-semibold text-gold-light">
                {initials(user?.full_name)}
              </span>
              <div className="hidden text-left sm:block">
                <p className="text-xs font-semibold text-navy leading-tight">{user?.full_name}</p>
                <p className="text-[0.68rem] text-muted">{ROLE_LABELS[user?.role]}</p>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-muted" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-beige bg-white py-1.5 shadow-lift">
                <div className="border-b border-beige/70 px-4 py-2.5">
                  <p className="truncate text-sm font-semibold text-navy">{user?.full_name}</p>
                  <p className="truncate text-xs text-muted">{user?.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    setPwModal(true);
                  }}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-xs font-medium text-navy transition hover:bg-sand"
                >
                  <KeyRound className="h-4 w-4 text-gold-dark" /> Change Password
                </button>
                <button
                  type="button"
                  onClick={onLogout}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-xs font-medium text-red-600 transition hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 p-5 sm:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>

      <Modal open={pwModal} onClose={() => setPwModal(false)} title="Change Password" size="sm">
        <form onSubmit={onSavePassword} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            required
            value={pwForm.current_password}
            onChange={(e) => setPwForm({ ...pwForm, current_password: e.target.value })}
            error={pwErr.current_password}
          />
          <Input
            label="New Password"
            type="password"
            required
            hint="8+ characters with letters and numbers"
            value={pwForm.new_password}
            onChange={(e) => setPwForm({ ...pwForm, new_password: e.target.value })}
            error={pwErr.new_password}
          />
          <Input
            label="Confirm New Password"
            type="password"
            required
            value={pwForm.confirm_password}
            onChange={(e) => setPwForm({ ...pwForm, confirm_password: e.target.value })}
            error={pwErr.confirm_password}
          />
          <div className="flex justify-end gap-2.5 pt-2">
            <Button variant="ghost" onClick={() => setPwModal(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={savingPw}>
              Update Password
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
