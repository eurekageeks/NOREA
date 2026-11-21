import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import Logo from '../../components/ui/Logo';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Field';
import { useAuth } from '../../context/AuthContext';
import { useSeo } from '../../hooks/useSeo';
import { parseError } from '../../services/api';
import { validators } from '../../utils/constants';

export default function AdminLoginPage() {
  useSeo({ title: 'Admin Sign In', noindex: true });
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (ev) => {
    ev.preventDefault();
    const e = {};
    const em = validators.email(email);
    if (em) e.email = em;
    if (!password) e.password = 'Password is required.';
    setErrors(e);
    if (Object.keys(e).length) return;

    setSubmitting(true);
    try {
      const res = await login({ email, password, portal: 'admin' });
      toast.success(res.message);
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-navy px-5 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-block">
            <Logo variant="light" size="md" />
          </Link>
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.26em] text-gold-light">
            Administration Console
          </p>
        </div>

        <form onSubmit={onSubmit} noValidate className="rounded-2xl border border-beige/20 bg-white p-8 shadow-lift space-y-5">
          <div className="flex items-center gap-3 border-b border-beige/70 pb-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy text-gold-light">
              <Lock className="h-4 w-4" />
            </span>
            <div>
              <h1 className="font-serif text-2xl text-navy">Staff Sign In</h1>
              <p className="text-xs text-muted">Authorized NŌRÉA administrators & staff only</p>
            </div>
          </div>

          <Input
            id="adm-login-email"
            label="Work Email"
            type="email"
            required
            placeholder="admin@norea.in"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            autoComplete="email"
          />

          <Input
            id="adm-login-pw"
            label="Password"
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            autoComplete="current-password"
          />

          <Button type="submit" variant="primary" size="lg" loading={submitting} className="w-full">
            Sign In to Dashboard
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-ivory/65 hover:text-gold-light">
            <ArrowLeft className="h-3.5 w-3.5" /> Return to public website
          </Link>
        </div>
      </div>
    </div>
  );
}
