import { Link } from 'react-router-dom';
import {
  MessageSquareText,
  Users,
  BookOpen,
  BellRing,
  CheckCircle2,
  Clock,
  ArrowRight,
  Check,
  X,
} from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import toast from 'react-hot-toast';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { EmptyState, ErrorState, Skeleton } from '../../components/ui/StateViews';
import { useAuth } from '../../context/AuthContext';
import { useAsync } from '../../hooks';
import { useSeo } from '../../hooks/useSeo';
import { admissionService, dashboardService } from '../../services';
import { parseError } from '../../services/api';
import { ENQUIRY_STATUSES, statusMeta, timeAgo } from '../../utils/constants';

export default function AdminOverviewPage() {
  useSeo({ title: 'Admin Overview', noindex: true });
  const { can } = useAuth();

  const { data: statsRes, loading, error, reload } = useAsync(() => dashboardService.stats(), []);
  const { data: chartRes } = useAsync(() => dashboardService.analytics({ months: 6 }), []);

  const stats = statsRes?.data;
  const monthly = chartRes?.data?.monthly || [];

  const quickDecide = async (id, status) => {
    try {
      await admissionService.update(id, { status });
      toast.success(`Admission ${status}.`);
      reload();
    } catch (err) {
      toast.error(parseError(err).message);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-56" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    );
  }

  if (error || !stats) return <ErrorState message="Could not load dashboard metrics." onRetry={reload} />;

  const kpis = [
    { label: 'Total Enquiries', value: stats.total_enquiries, icon: MessageSquareText, tone: 'bg-navy text-gold-light', to: '/admin/enquiries' },
    { label: 'New Enquiries', value: stats.new_enquiries, icon: BellRing, tone: 'bg-sky-50 text-sky-700', to: '/admin/enquiries?status=new' },
    { label: 'Total Students', value: stats.total_students, icon: Users, tone: 'bg-sand text-gold-dark', to: '/admin/students' },
    { label: 'Total Programs', value: stats.total_programs, icon: BookOpen, tone: 'bg-gold/18 text-navy', to: '/admin/programs' },
    { label: 'Approved Admissions', value: stats.approved_admissions, icon: CheckCircle2, tone: 'bg-emerald-50 text-emerald-700', to: '/admin/admissions?status=approved' },
    { label: 'Pending Admissions', value: stats.pending_admissions, icon: Clock, tone: 'bg-amber-50 text-amber-700', to: '/admin/admissions?status=pending' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-dark">Dashboard</p>
          <h1 className="mt-1 font-serif text-3xl text-navy sm:text-4xl">Institute Overview</h1>
        </div>
        <div className="flex gap-2.5">
          <Button to="/admin/reports" variant="outline" size="sm">
            Full Reports
          </Button>
          {can('programs:manage') && (
            <Button to="/admin/programs" variant="primary" size="sm">
              Manage Programs
            </Button>
          )}
        </div>
      </div>

      {/* 6 KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map(({ label, value, icon: Icon, tone, to }) => (
          <Link key={label} to={to} className="card group flex items-center justify-between p-5 transition hover:-translate-y-0.5 hover:shadow-lift">
            <div>
              <p className="text-xs font-medium text-muted">{label}</p>
              <p className="mt-1 font-serif text-3xl font-semibold text-navy">{value ?? 0}</p>
            </div>
            <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${tone}`}>
              <Icon className="h-5 w-5" />
            </span>
          </Link>
        ))}
      </div>

      {/* Chart + Pending Admissions */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="card p-6 lg:col-span-7">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-serif text-2xl text-navy">Enquiry Trend (Last 6 Months)</h2>
              <p className="text-xs text-muted">{stats.enquiries_last_7_days} enquiries in the last 7 days</p>
            </div>
            <Link to="/admin/reports" className="text-xs font-semibold text-gold-dark hover:text-navy">
              Analytics →
            </Link>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthly}>
                <defs>
                  <linearGradient id="noreaNavy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#17243A" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#17243A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#EAE2D5" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6B6A66' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#6B6A66' }} />
                <Tooltip contentStyle={{ borderRadius: 12, borderColor: '#EAE2D5', fontSize: 12 }} />
                <Area type="monotone" dataKey="enquiries" name="Enquiries" stroke="#17243A" strokeWidth={2} fill="url(#noreaNavy)" />
                <Area type="monotone" dataKey="converted" name="Converted" stroke="#C5A46D" strokeWidth={2} fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6 lg:col-span-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-2xl text-navy">Pending Admissions</h2>
            <Link to="/admin/admissions" className="text-xs font-semibold text-gold-dark hover:text-navy">
              View All
            </Link>
          </div>

          {stats.pendingAdmissions?.length === 0 ? (
            <EmptyState icon={CheckCircle2} title="All caught up" description="There are no pending admission applications." />
          ) : (
            <ul className="divide-y divide-beige/70">
              {stats.pendingAdmissions.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 py-3.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-navy">{a.student_name}</p>
                    <p className="truncate text-xs text-muted">{a.program_title}</p>
                  </div>
                  {can('admissions:decide') && (
                    <div className="flex shrink-0 gap-1.5">
                      <button
                        type="button"
                        title="Approve"
                        onClick={() => quickDecide(a.id, 'approved')}
                        className="rounded-lg bg-emerald-50 p-1.5 text-emerald-700 transition hover:bg-emerald-600 hover:text-white"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        title="Reject"
                        onClick={() => quickDecide(a.id, 'rejected')}
                        className="rounded-lg bg-red-50 p-1.5 text-red-600 transition hover:bg-red-600 hover:text-white"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Recent Enquiries */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-beige/70 px-6 py-4">
          <h2 className="font-serif text-2xl text-navy">Recent Enquiries</h2>
          <Link to="/admin/enquiries" className="inline-flex items-center gap-1 text-xs font-semibold text-gold-dark hover:text-navy">
            Manage All <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {stats.recentEnquiries?.length === 0 ? (
          <div className="p-6">
            <EmptyState title="No enquiries yet" description="New admission and contact enquiries will appear here." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-beige bg-ivory/60">
                  <th className="table-th">Applicant</th>
                  <th className="table-th">Program / Source</th>
                  <th className="table-th">Status</th>
                  <th className="table-th">Received</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-beige/60">
                {stats.recentEnquiries.map((e) => {
                  const st = statusMeta(ENQUIRY_STATUSES, e.status);
                  return (
                    <tr key={e.id} className="hover:bg-ivory/50">
                      <td className="table-td">
                        <p className="font-semibold text-navy">{e.full_name}</p>
                        <p className="text-xs text-muted">{e.email}</p>
                      </td>
                      <td className="table-td text-xs">{e.program_title || 'Contact Message'}</td>
                      <td className="table-td">
                        <Badge tone={st.tone}>{st.label}</Badge>
                      </td>
                      <td className="table-td text-xs text-muted">{timeAgo(e.created_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
