import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import Logo from '../../components/ui/Logo';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Field';
import { PageTransition } from '../../components/ui/Motion';
import { useAuth } from '../../context/AuthContext';
import { useSeo } from '../../hooks/useSeo';
import { parseError } from '../../services/api';
import { validators } from '../../utils/constants';

export default function LoginPage({ defaultMode = 'login' }) {
  const [mode, setMode] = useState(defaultMode);
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/portal';

  useSeo({
    title: mode === 'login' ? 'Student Login' : 'Student Registration',
    noindex: true,
  });

  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '', confirm_password: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: '' }));
  };

  const switchMode = (m) => {
    setMode(m);
    setErrors({});
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    const e = {};
    if (mode === 'register') {
      const n = validators.name(form.full_name);
      if (n) e.full_name = n;
      const ph = validators.phone(form.phone, true);
      if (ph) e.phone = ph;
    }
    const em = validators.email(form.email);
    if (em) e.email = em;
    if (mode === 'register') {
      const pw = validators.password(form.password);
      if (pw) e.password = pw;
      if (form.confirm_password !== form.password) e.confirm_password = 'Passwords do not match.';
    } else if (!form.password) {
      e.password = 'Password is required.';
    }
    setErrors(e);
    if (Object.keys(e).length) return;

    setSubmitting(true);
    try {
      if (mode === 'login') {
        const res = await login({ email: form.email, password: form.password, portal: 'student' });
        toast.success(res.message);
      } else {
        const res = await register({
          full_name: form.full_name,
          email: form.email,
          phone: form.phone,
          password: form.password,
        });
        toast.success(res.message);
      }
      navigate(from, { replace: true });
    } catch (err) {
      const parsed = parseError(err);
      setErrors(parsed.fields);
      toast.error(parsed.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageTransition>
      <div className="container-x py-14 sm:py-20">
        <div className="mx-auto max-w-md">
          <div className="mb-8 text-center">
            <Link to="/" className="inline-block">
              <Logo size="md" />
            </Link>
            <p className="mt-3 text-sm text-muted">Student Portal — track admissions, programs & profile</p>
          </div>

          <div className="card overflow-hidden">
            <div className="grid grid-cols-2 border-b border-beige bg-ivory/70">
              {[
                ['login', 'Sign In'],
                ['register', 'Create Account'],
              ].map(([m, label]) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => switchMode(m)}
                  className={`py-3.5 text-xs font-semibold uppercase tracking-[0.16em] transition ${
                    mode === m ? 'border-b-2 border-navy bg-white text-navy' : 'text-muted hover:text-navy'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <form onSubmit={onSubmit} noValidate className="p-7 sm:p-8 space-y-4">
              {mode === 'register' && (
                <>
                  <Input
                    id="st-name"
                    label="Full Name"
                    required
                    placeholder="Your full name"
                    value={form.full_name}
                    onChange={set('full_name')}
                    error={errors.full_name}
                    autoComplete="name"
                  />
                  <Input
                    id="st-phone"
                    label="Mobile Number"
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={set('phone')}
                    error={errors.phone}
                    autoComplete="tel"
                  />
                </>
              )}

              <Input
                id="st-email"
                label="Email Address"
                type="email"
                required
                placeholder="you@example.com"
                value={form.email}
                onChange={set('email')}
                error={errors.email}
                autoComplete="email"
              />

              <Input
                id="st-pass"
                label="Password"
                type="password"
                required
                hint={mode === 'register' ? '8+ characters with letters and numbers' : undefined}
                placeholder="••••••••"
                value={form.password}
                onChange={set('password')}
                error={errors.password}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />

              {mode === 'register' && (
                <Input
                  id="st-confirm"
                  label="Confirm Password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={form.confirm_password}
                  onChange={set('confirm_password')}
                  error={errors.confirm_password}
                  autoComplete="new-password"
                />
              )}

              <Button type="submit" variant="primary" size="lg" loading={submitting} className="mt-2 w-full">
                {mode === 'login' ? 'Sign In to Portal' : 'Create Student Account'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </div>

          <div className="mt-6 text-center text-xs text-muted">
            <Link to="/admin/login" className="inline-flex items-center gap-1.5 hover:text-navy">
              <ShieldCheck className="h-3.5 w-3.5 text-gold-dark" /> Staff or Administrator? Sign in here
            </Link>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
