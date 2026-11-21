import { useEffect, useState } from 'react';
import { Save, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import { ImageUploader, Input, Textarea } from '../../components/ui/Field';
import { useAuth } from '../../context/AuthContext';
import { useSeo } from '../../hooks/useSeo';
import { authService, portalService } from '../../services';
import { parseError } from '../../services/api';
import { toDateInput, validators } from '../../utils/constants';

export default function StudentProfilePage() {
  useSeo({ title: 'Profile & Security', noindex: true });
  const { user, refresh } = useAuth();

  const [profile, setProfile] = useState({
    full_name: '',
    phone: '',
    date_of_birth: '',
    address: '',
    profile_image: '',
  });
  const [pErr, setPErr] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);

  const [pw, setPw] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [pwErr, setPwErr] = useState({});
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile({
        full_name: user.full_name || '',
        phone: user.phone || '',
        date_of_birth: toDateInput(user.profile?.date_of_birth),
        address: user.profile?.address || '',
        profile_image: user.profile?.profile_image || '',
      });
    }
  }, [user]);

  const onSaveProfile = async (e) => {
    e.preventDefault();
    const errs = {};
    const n = validators.name(profile.full_name);
    if (n) errs.full_name = n;
    const ph = validators.phone(profile.phone, false);
    if (ph) errs.phone = ph;
    setPErr(errs);
    if (Object.keys(errs).length) return;

    setSavingProfile(true);
    try {
      const res = await portalService.updateProfile(profile);
      await refresh();
      toast.success(res.message);
    } catch (err) {
      const p = parseError(err);
      setPErr(p.fields);
      toast.error(p.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const onSavePassword = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!pw.current_password) errs.current_password = 'Current password is required.';
    const np = validators.password(pw.new_password);
    if (np) errs.new_password = np;
    if (pw.confirm_password !== pw.new_password) errs.confirm_password = 'Passwords do not match.';
    setPwErr(errs);
    if (Object.keys(errs).length) return;

    setSavingPw(true);
    try {
      const res = await authService.changePassword(pw);
      setPw({ current_password: '', new_password: '', confirm_password: '' });
      toast.success(res.message);
    } catch (err) {
      const p = parseError(err);
      setPwErr(p.fields);
      toast.error(p.message);
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-dark">Account</p>
        <h1 className="mt-1 font-serif text-3xl text-navy sm:text-4xl">Profile & Security</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        <form onSubmit={onSaveProfile} className="card p-6 sm:p-8 space-y-5 lg:col-span-7">
          <div>
            <h2 className="font-serif text-2xl text-navy">Personal Details</h2>
            <p className="text-xs text-muted">Keep your contact and personal details up to date.</p>
          </div>

          <ImageUploader
            label="Profile Photo"
            value={profile.profile_image}
            onChange={(url) => setProfile((p) => ({ ...p, profile_image: url }))}
            aspect="aspect-square"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Full Name"
              required
              value={profile.full_name}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              error={pErr.full_name}
            />
            <Input label="Email Address" value={user?.email || ''} disabled hint="Email cannot be changed here." />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Mobile Number"
              type="tel"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              error={pErr.phone}
            />
            <Input
              label="Date of Birth"
              type="date"
              value={profile.date_of_birth}
              onChange={(e) => setProfile({ ...profile, date_of_birth: e.target.value })}
              error={pErr.date_of_birth}
            />
          </div>

          <Textarea
            label="Address"
            rows={3}
            placeholder="Your residential address"
            value={profile.address}
            onChange={(e) => setProfile({ ...profile, address: e.target.value })}
            error={pErr.address}
          />

          <Button type="submit" loading={savingProfile}>
            <Save className="h-4 w-4" /> Save Profile
          </Button>
        </form>

        <form onSubmit={onSavePassword} className="card h-fit p-6 sm:p-8 space-y-4 lg:col-span-5">
          <div className="flex items-center gap-2.5">
            <KeyRound className="h-5 w-5 text-gold-dark" />
            <h2 className="font-serif text-2xl text-navy">Change Password</h2>
          </div>
          <p className="text-xs text-muted">Updating your password signs out other active devices.</p>

          <Input
            label="Current Password"
            type="password"
            required
            value={pw.current_password}
            onChange={(e) => setPw({ ...pw, current_password: e.target.value })}
            error={pwErr.current_password}
          />
          <Input
            label="New Password"
            type="password"
            required
            hint="8+ characters with letters and numbers"
            value={pw.new_password}
            onChange={(e) => setPw({ ...pw, new_password: e.target.value })}
            error={pwErr.new_password}
          />
          <Input
            label="Confirm New Password"
            type="password"
            required
            value={pw.confirm_password}
            onChange={(e) => setPw({ ...pw, confirm_password: e.target.value })}
            error={pwErr.confirm_password}
          />

          <Button type="submit" variant="outline" loading={savingPw} className="w-full">
            Update Password
          </Button>
        </form>
      </div>
    </div>
  );
}
