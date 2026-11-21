import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, MessageSquareText, Plus, ArrowRight, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { Select } from '../../components/ui/Field';
import { EmptyState, ErrorState, Skeleton } from '../../components/ui/StateViews';
import { useAuth } from '../../context/AuthContext';
import { useAsync } from '../../hooks';
import { useSeo } from '../../hooks/useSeo';
import { admissionService, portalService, programService } from '../../services';
import { assetUrl, parseError } from '../../services/api';
import { ADMISSION_STATUSES, ENQUIRY_STATUSES, enquiryRef, formatDate, modeLabel, statusMeta } from '../../utils/constants';

export default function StudentDashboardPage() {
  useSeo({ title: 'Student Dashboard', noindex: true });
  const { user } = useAuth();
  const { data: res, loading, error, reload } = useAsync(() => portalService.overview(), []);
  const { data: progRes } = useAsync(() => programService.list(), []);

  const [applyOpen, setApplyOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState('');
  const [applying, setApplying] = useState(false);

  const overview = res?.data;
  const admissions = overview?.admissions || [];
  const enquiries = overview?.enquiries || [];
  const enrolled = admissions.filter((a) => a.status === 'approved');
  const pending = admissions.filter((a) => a.status === 'pending');

  const appliedProgramIds = new Set(admissions.map((a) => a.program_id));
  const availablePrograms = (progRes?.data || []).filter((p) => !appliedProgramIds.has(p.id));

  const onApply = async (e) => {
    e.preventDefault();
    if (!selectedProgram) return toast.error('Please select a program.');
    setApplying(true);
    try {
      const r = await admissionService.create({ program_id: Number(selectedProgram) });
      toast.success(r.message);
      setApplyOpen(false);
      setSelectedProgram('');
      reload();
    } catch (err) {
      toast.error(parseError(err).message);
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-5 sm:grid-cols-3">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (error) return <ErrorState message="Could not load your student dashboard." onRetry={reload} />;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-dark">Welcome Back</p>
          <h1 className="mt-1 font-serif text-3xl text-navy sm:text-4xl">{user?.full_name}</h1>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {availablePrograms.length > 0 && (
            <Button variant="primary" size="sm" onClick={() => setApplyOpen(true)}>
              <Plus className="h-4 w-4" /> Apply for a Program
            </Button>
          )}
          <Button to="/portal/profile" variant="outline" size="sm">
            Edit Profile
          </Button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid gap-5 sm:grid-cols-3">
        {[
          { icon: CheckCircle2, label: 'Enrolled Programs', value: enrolled.length, accent: 'bg-emerald-50 text-emerald-700' },
          { icon: Clock, label: 'Pending Applications', value: pending.length, accent: 'bg-amber-50 text-amber-700' },
          { icon: MessageSquareText, label: 'My Enquiries', value: enquiries.length, accent: 'bg-sand text-gold-dark' },
        ].map(({ icon: Icon, label, value, accent }) => (
          <div key={label} className="card flex items-center gap-4 p-6">
            <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${accent}`}>
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-medium text-muted">{label}</p>
              <p className="font-serif text-3xl font-semibold text-navy">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Enrolled & Applied Programs */}
      <section className="card p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-2xl text-navy">My Programs & Admissions</h2>
            <p className="text-xs text-muted">Track your active enrollments and admission applications.</p>
          </div>
          <Link to="/programs" className="inline-flex items-center gap-1 text-xs font-semibold text-gold-dark hover:text-navy">
            Browse All Programs <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {admissions.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              icon={BookOpen}
              title="No program applications yet"
              description="Explore our Spoken English, Personality Development or Parenting programs and submit an application."
              action={
                availablePrograms.length > 0 ? (
                  <Button size="sm" onClick={() => setApplyOpen(true)}>
                    Apply for a Program
                  </Button>
                ) : (
                  <Button to="/programs" size="sm">
                    Explore Programs
                  </Button>
                )
              }
            />
          </div>
        ) : (
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {admissions.map((adm) => {
              const st = statusMeta(ADMISSION_STATUSES, adm.status);
              return (
                <div key={adm.id} className="flex gap-4 rounded-2xl border border-beige bg-ivory/60 p-4">
                  <img
                    src={assetUrl(adm.program_image) || '/images/hero.jpg'}
                    alt={adm.program_title}
                    className="h-24 w-24 shrink-0 rounded-xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        to={`/programs/${adm.program_slug}`}
                        className="font-serif text-lg font-medium text-navy hover:text-gold-dark line-clamp-2"
                      >
                        {adm.program_title}
                      </Link>
                      <Badge tone={st.tone}>{st.label}</Badge>
                    </div>
                    <p className="mt-2 text-xs text-muted">
                      Applied on {formatDate(adm.created_at)}
                      {adm.admission_date ? ` • Admitted ${formatDate(adm.admission_date)}` : ''}
                    </p>
                    {adm.program_duration && (
                      <p className="mt-1 text-xs font-medium text-navy/80">Duration: {adm.program_duration}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Enquiry History */}
      <section className="card p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-2xl text-navy">Enquiry Status</h2>
            <p className="text-xs text-muted">Enquiries submitted with your email ({user?.email}).</p>
          </div>
          <Button to="/admissions" variant="subtle" size="xs">
            New Enquiry
          </Button>
        </div>

        {enquiries.length === 0 ? (
          <div className="mt-5">
            <EmptyState
              icon={MessageSquareText}
              title="No enquiries on record"
              description="Any admission or contact enquiries you submit using your account email will appear here."
            />
          </div>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[540px] text-left">
              <thead>
                <tr className="border-b border-beige">
                  <th className="table-th">Reference</th>
                  <th className="table-th">Program</th>
                  <th className="table-th">Mode</th>
                  <th className="table-th">Submitted</th>
                  <th className="table-th">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-beige/60">
                {enquiries.map((enq) => {
                  const st = statusMeta(ENQUIRY_STATUSES, enq.status);
                  return (
                    <tr key={enq.id}>
                      <td className="table-td font-mono text-xs font-semibold text-navy">{enquiryRef(enq.id)}</td>
                      <td className="table-td font-medium">{enq.program_title || enq.subject || 'General Contact'}</td>
                      <td className="table-td">{modeLabel(enq.learning_mode)}</td>
                      <td className="table-td text-xs text-muted">{formatDate(enq.created_at)}</td>
                      <td className="table-td">
                        <Badge tone={st.tone}>{st.label}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Apply Modal */}
      <Modal
        open={applyOpen}
        onClose={() => setApplyOpen(false)}
        title="Apply for a Program"
        subtitle="Your application will be reviewed by our admissions team."
        size="sm"
      >
        <form onSubmit={onApply} className="space-y-4">
          <Select
            label="Select Program"
            required
            placeholder="Choose a program…"
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
            options={availablePrograms.map((p) => ({ value: String(p.id), label: p.title }))}
          />
          <div className="flex justify-end gap-2.5 pt-2">
            <Button variant="ghost" onClick={() => setApplyOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={applying}>
              Submit Application
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
