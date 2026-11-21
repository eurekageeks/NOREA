import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Download, Eye, Trash2, FilterX, GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal, { ConfirmDialog } from '../../components/ui/Modal';
import { Input, Select, Textarea } from '../../components/ui/Field';
import { EmptyState, ErrorState, Pagination, TableSkeleton } from '../../components/ui/StateViews';
import { useAuth } from '../../context/AuthContext';
import { useAsync, useDebounce } from '../../hooks';
import { useSeo } from '../../hooks/useSeo';
import { admissionService, enquiryService, programService } from '../../services';
import { parseError } from '../../services/api';
import {
  ENQUIRY_STATUSES,
  enquiryRef,
  formatDateTime,
  modeLabel,
  statusMeta,
  validators,
} from '../../utils/constants';

export default function AdminEnquiriesPage() {
  useSeo({ title: 'Enquiries', noindex: true });
  const { can } = useAuth();
  const [sp] = useSearchParams();

  const [filters, setFilters] = useState({
    search: '',
    status: sp.get('status') || '',
    program_id: '',
    source: '',
    date_from: '',
    date_to: '',
    page: 1,
  });
  const debouncedSearch = useDebounce(filters.search, 300);

  const queryParams = {
    page: filters.page,
    limit: 12,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.program_id ? { program_id: filters.program_id } : {}),
    ...(filters.source ? { source: filters.source } : {}),
    ...(filters.date_from ? { date_from: filters.date_from } : {}),
    ...(filters.date_to ? { date_to: filters.date_to } : {}),
  };

  const { data: res, loading, error, reload } = useAsync(
    () => enquiryService.list(queryParams),
    [debouncedSearch, filters.status, filters.program_id, filters.source, filters.date_from, filters.date_to, filters.page]
  );
  const { data: progRes } = useAsync(() => programService.list({ all: 1 }), []);
  const programs = progRes?.data || [];

  const [active, setActive] = useState(null);
  const [editForm, setEditForm] = useState({ status: 'new', admin_notes: '' });
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Convert enquiry to admission modal
  const [convertOpen, setConvertOpen] = useState(false);
  const [convertForm, setConvertForm] = useState({ program_id: '', password: '', status: 'approved' });
  const [converting, setConverting] = useState(false);

  const setFilter = (k, v) => setFilters((f) => ({ ...f, [k]: v, page: 1 }));
  const clearFilters = () =>
    setFilters({ search: '', status: '', program_id: '', source: '', date_from: '', date_to: '', page: 1 });

  const openDetail = (enq) => {
    setActive(enq);
    setEditForm({ status: enq.status, admin_notes: enq.admin_notes || '' });
  };

  const onSaveDetail = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await enquiryService.update(active.id, editForm);
      setActive(r.data);
      toast.success('Enquiry updated.');
      reload();
    } catch (err) {
      toast.error(parseError(err).message);
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    setDeleting(true);
    try {
      await enquiryService.remove(deleteTarget.id);
      toast.success('Enquiry deleted.');
      setDeleteTarget(null);
      if (active?.id === deleteTarget.id) setActive(null);
      reload();
    } catch (err) {
      toast.error(parseError(err).message);
    } finally {
      setDeleting(false);
    }
  };

  const onExport = async () => {
    try {
      const r = await enquiryService.exportCsv(queryParams);
      const url = URL.createObjectURL(new Blob([r.data], { type: 'text/csv;charset=utf-8' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `norea-enquiries-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(parseError(err).message);
    }
  };

  const onConvert = async (e) => {
    e.preventDefault();
    if (!convertForm.program_id) return toast.error('Select a program.');
    const pwErr = validators.password(convertForm.password);
    if (pwErr) return toast.error(pwErr);
    setConverting(true);
    try {
      await admissionService.create({
        program_id: Number(convertForm.program_id),
        enquiry_id: active.id,
        status: convertForm.status,
        new_student: {
          full_name: active.full_name,
          email: active.email,
          phone: active.phone || undefined,
          password: convertForm.password,
        },
      });
      toast.success('Student account created & enquiry converted to admission!');
      setConvertOpen(false);
      setActive(null);
      reload();
    } catch (err) {
      toast.error(parseError(err).message);
    } finally {
      setConverting(false);
    }
  };

  const rows = res?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-dark">Leads & Messages</p>
          <h1 className="mt-1 font-serif text-3xl text-navy sm:text-4xl">Enquiry Management</h1>
        </div>
        <Button variant="outline" size="sm" onClick={onExport}>
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="card p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <div className="relative lg:col-span-2">
            <Search className="pointer-events-none absolute top-3.5 left-3.5 h-4 w-4 text-muted" />
            <input
              type="search"
              placeholder="Search name, email, phone…"
              value={filters.search}
              onChange={(e) => setFilter('search', e.target.value)}
              className="field pl-10 py-2.5 text-sm"
            />
          </div>
          <select value={filters.status} onChange={(e) => setFilter('status', e.target.value)} className="field py-2.5 text-sm">
            <option value="">All Statuses</option>
            {ENQUIRY_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <select value={filters.program_id} onChange={(e) => setFilter('program_id', e.target.value)} className="field py-2.5 text-sm">
            <option value="">All Programs</option>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
          <input
            type="date"
            aria-label="Date from"
            value={filters.date_from}
            onChange={(e) => setFilter('date_from', e.target.value)}
            className="field py-2.5 text-sm"
          />
          <div className="flex gap-2">
            <input
              type="date"
              aria-label="Date to"
              value={filters.date_to}
              onChange={(e) => setFilter('date_to', e.target.value)}
              className="field py-2.5 text-sm"
            />
            {(filters.search || filters.status || filters.program_id || filters.date_from || filters.date_to) && (
              <button
                type="button"
                onClick={clearFilters}
                title="Clear filters"
                className="rounded-xl border border-beige px-3 text-muted hover:bg-sand hover:text-navy"
              >
                <FilterX className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <TableSkeleton rows={6} cols={6} />
        ) : error ? (
          <div className="p-6">
            <ErrorState message="Failed to load enquiries." onRetry={reload} />
          </div>
        ) : rows.length === 0 ? (
          <div className="p-8">
            <EmptyState title="No matching enquiries" description="Try adjusting your search or filter criteria." />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[780px]">
                <thead>
                  <tr className="border-b border-beige bg-ivory/70">
                    <th className="table-th">Ref</th>
                    <th className="table-th">Applicant</th>
                    <th className="table-th">Program</th>
                    <th className="table-th">Mode</th>
                    <th className="table-th">Status</th>
                    <th className="table-th">Date</th>
                    <th className="table-th text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-beige/60">
                  {rows.map((e) => {
                    const st = statusMeta(ENQUIRY_STATUSES, e.status);
                    return (
                      <tr key={e.id} className="hover:bg-ivory/50">
                        <td className="table-td font-mono text-xs text-muted">{enquiryRef(e.id)}</td>
                        <td className="table-td">
                          <p className="font-semibold text-navy">{e.full_name}</p>
                          <p className="text-xs text-muted">
                            {e.email} {e.phone ? `• ${e.phone}` : ''}
                          </p>
                        </td>
                        <td className="table-td text-xs">
                          {e.program_title || (
                            <span className="italic text-muted">Contact: {e.subject || 'General'}</span>
                          )}
                        </td>
                        <td className="table-td text-xs">{modeLabel(e.learning_mode)}</td>
                        <td className="table-td">
                          <Badge tone={st.tone}>{st.label}</Badge>
                        </td>
                        <td className="table-td text-xs text-muted">{formatDateTime(e.created_at)}</td>
                        <td className="table-td text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <Button variant="subtle" size="xs" onClick={() => openDetail(e)}>
                              <Eye className="h-3.5 w-3.5" /> View
                            </Button>
                            {can('enquiries:delete') && (
                              <button
                                type="button"
                                onClick={() => setDeleteTarget(e)}
                                title="Delete enquiry"
                                className="rounded-lg p-1.5 text-muted transition hover:bg-red-50 hover:text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination pagination={res?.pagination} onPage={(p) => setFilters((f) => ({ ...f, page: p }))} />
          </>
        )}
      </div>

      {/* Enquiry Detail Modal */}
      <Modal
        open={!!active}
        onClose={() => setActive(null)}
        title={active ? `Enquiry ${enquiryRef(active.id)}` : ''}
        subtitle={active ? `Submitted ${formatDateTime(active.created_at)}` : ''}
        size="md"
      >
        {active && (
          <div className="space-y-6">
            <dl className="grid gap-3 rounded-xl border border-beige bg-ivory/60 p-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-[0.68rem] uppercase tracking-wider text-muted">Full Name</dt>
                <dd className="font-semibold text-navy">{active.full_name}</dd>
              </div>
              <div>
                <dt className="text-[0.68rem] uppercase tracking-wider text-muted">Email</dt>
                <dd>{active.email}</dd>
              </div>
              <div>
                <dt className="text-[0.68rem] uppercase tracking-wider text-muted">Phone</dt>
                <dd>{active.phone || '—'}</dd>
              </div>
              <div>
                <dt className="text-[0.68rem] uppercase tracking-wider text-muted">Program</dt>
                <dd>{active.program_title || 'General Contact'}</dd>
              </div>
              <div>
                <dt className="text-[0.68rem] uppercase tracking-wider text-muted">Preferred Mode</dt>
                <dd>{modeLabel(active.learning_mode)}</dd>
              </div>
              <div>
                <dt className="text-[0.68rem] uppercase tracking-wider text-muted">Source</dt>
                <dd className="capitalize">{active.source}</dd>
              </div>
              {active.message && (
                <div className="sm:col-span-2">
                  <dt className="text-[0.68rem] uppercase tracking-wider text-muted">Message</dt>
                  <dd className="mt-1 whitespace-pre-line text-charcoal/85">{active.message}</dd>
                </div>
              )}
            </dl>

            <form onSubmit={onSaveDetail} className="space-y-4">
              <Select
                label="Enquiry Status"
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                options={ENQUIRY_STATUSES.map((s) => ({ value: s.value, label: s.label }))}
              />
              <Textarea
                label="Internal Admin Notes"
                rows={4}
                placeholder="Add follow-up dates, call summary or counsellor notes…"
                value={editForm.admin_notes}
                onChange={(e) => setEditForm({ ...editForm, admin_notes: e.target.value })}
              />
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                {can('students:manage') && active.status !== 'converted' && (
                  <Button
                    variant="gold"
                    size="sm"
                    onClick={() => {
                      setConvertForm({
                        program_id: String(active.program_id || programs[0]?.id || ''),
                        password: '',
                        status: 'approved',
                      });
                      setConvertOpen(true);
                    }}
                  >
                    <GraduationCap className="h-4 w-4" /> Convert to Admission
                  </Button>
                )}
                <div className="ml-auto flex gap-2">
                  <Button variant="ghost" onClick={() => setActive(null)}>
                    Close
                  </Button>
                  <Button type="submit" loading={saving}>
                    Save Changes
                  </Button>
                </div>
              </div>
            </form>
          </div>
        )}
      </Modal>

      {/* Convert to Admission Modal */}
      <Modal
        open={convertOpen}
        onClose={() => setConvertOpen(false)}
        title="Convert Enquiry to Admission"
        subtitle={active ? `Creates a student account for ${active.full_name} (${active.email}) and links an admission.` : ''}
        size="sm"
      >
        <form onSubmit={onConvert} className="space-y-4">
          <Select
            label="Program"
            required
            value={convertForm.program_id}
            onChange={(e) => setConvertForm({ ...convertForm, program_id: e.target.value })}
            options={programs.map((p) => ({ value: String(p.id), label: p.title }))}
          />
          <Input
            label="Temporary Student Password"
            type="password"
            required
            hint="8+ characters with letters and numbers"
            value={convertForm.password}
            onChange={(e) => setConvertForm({ ...convertForm, password: e.target.value })}
          />
          <Select
            label="Initial Admission Status"
            value={convertForm.status}
            onChange={(e) => setConvertForm({ ...convertForm, status: e.target.value })}
            options={[
              { value: 'approved', label: 'Approved' },
              { value: 'pending', label: 'Pending' },
            ]}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setConvertOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={converting}>
              Create Admission
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={onDelete}
        loading={deleting}
        title="Delete Enquiry"
        message={`Permanently delete enquiry ${deleteTarget ? enquiryRef(deleteTarget.id) : ''} from ${deleteTarget?.full_name}? This cannot be undone.`}
        confirmLabel="Delete"
      />
    </div>
  );
}
