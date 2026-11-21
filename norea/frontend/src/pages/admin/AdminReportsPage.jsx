import { useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ErrorState, Skeleton } from '../../components/ui/StateViews';
import { useAsync } from '../../hooks';
import { useSeo } from '../../hooks/useSeo';
import { dashboardService } from '../../services';
import { ENQUIRY_STATUSES, modeLabel, statusMeta } from '../../utils/constants';

const PIE_COLORS = ['#17243A', '#C5A46D', '#4A638D', '#8C6D3F', '#B6ACA0'];

export default function AdminReportsPage() {
  useSeo({ title: 'Reports & Analytics', noindex: true });
  const [months, setMonths] = useState(12);

  const { data: res, loading, error, reload } = useAsync(
    () => dashboardService.analytics({ months }),
    [months]
  );

  const report = res?.data;

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    );
  }

  if (error || !report) return <ErrorState message="Could not load analytics." onRetry={reload} />;

  const c = report.conversion;
  const statusData = report.byStatus.map((s) => ({
    name: statusMeta(ENQUIRY_STATUSES, s.status).label,
    value: s.count,
  }));
  const modeData = report.byMode.map((m) => ({ name: modeLabel(m.mode), value: m.count }));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-dark">Insights</p>
          <h1 className="mt-1 font-serif text-3xl text-navy sm:text-4xl">Reports & Analytics</h1>
        </div>
        <div className="flex gap-2">
          {[6, 12].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMonths(m)}
              className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                months === m ? 'bg-navy text-ivory' : 'border border-beige bg-white text-navy hover:bg-sand'
              }`}
            >
              Last {m} Months
            </button>
          ))}
        </div>
      </div>

      {/* Conversion KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Enquiries', value: c.totalEnquiries, sub: `${c.convertedEnquiries} converted` },
          { label: 'Enquiry Conversion Rate', value: `${c.enquiryConversionRate}%`, sub: 'Converted / Total enquiries' },
          { label: 'Admission Approval Rate', value: `${c.admissionApprovalRate}%`, sub: `${c.approvedAdmissions} of ${c.totalAdmissions} approved` },
          { label: 'Enquiry → Admission', value: `${c.enquiryToAdmissionRate}%`, sub: `${c.pendingAdmissions} currently pending` },
        ].map((k) => (
          <div key={k.label} className="card p-5">
            <p className="text-xs font-medium text-muted">{k.label}</p>
            <p className="mt-1 font-serif text-3xl font-semibold text-navy">{k.value}</p>
            <p className="mt-1 text-xs text-muted">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Monthly enquiries */}
      <div className="card p-6">
        <h2 className="font-serif text-2xl text-navy">Monthly Enquiries vs Conversions</h2>
        <p className="mb-5 text-xs text-muted">Track lead volume and converted enquiries over time.</p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={report.monthly}>
              <defs>
                <linearGradient id="repNavy" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#17243A" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#17243A" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="repGold" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C5A46D" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#C5A46D" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#EAE2D5" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6B6A66' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#6B6A66' }} />
              <Tooltip contentStyle={{ borderRadius: 12, borderColor: '#EAE2D5', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="enquiries" name="Total Enquiries" stroke="#17243A" strokeWidth={2} fill="url(#repNavy)" />
              <Area type="monotone" dataKey="converted" name="Converted" stroke="#C5A46D" strokeWidth={2} fill="url(#repGold)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Program-wise + Status & Mode */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="card p-6 lg:col-span-7">
          <h2 className="font-serif text-2xl text-navy">Program-wise Enquiries</h2>
          <p className="mb-5 text-xs text-muted">Comparison of enquiries and conversions by program.</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={report.byProgram} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EAE2D5" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#6B6A66' }} />
                <YAxis type="category" dataKey="program" width={150} tick={{ fontSize: 11, fill: '#17243A' }} />
                <Tooltip contentStyle={{ borderRadius: 12, borderColor: '#EAE2D5', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="count" name="Enquiries" fill="#17243A" radius={[0, 6, 6, 0]} />
                <Bar dataKey="converted" name="Converted" fill="#C5A46D" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6 lg:col-span-5 space-y-6">
          <div>
            <h2 className="font-serif text-2xl text-navy">Enquiries by Status</h2>
            <div className="mt-3 h-52">
              {statusData.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={46} outerRadius={76} paddingAngle={3}>
                      {statusData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 12, borderColor: '#EAE2D5', fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="py-16 text-center text-xs text-muted">No enquiry data yet.</p>
              )}
            </div>
          </div>

          {modeData.length > 0 && (
            <div className="border-t border-beige/70 pt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">Preferred Learning Modes</p>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                {modeData.map((m) => (
                  <div key={m.name} className="rounded-xl bg-ivory p-3">
                    <p className="font-serif text-2xl text-navy">{m.value}</p>
                    <p className="text-[0.7rem] text-muted">{m.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
