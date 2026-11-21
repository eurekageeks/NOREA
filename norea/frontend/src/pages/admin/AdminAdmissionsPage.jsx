import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Plus, Check, X, Trash2, GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal, { ConfirmDialog } from '../../components/ui/Modal';
import { Input, Select, Textarea } from '../../components/ui/Field';
import { EmptyState, ErrorState, Pagination, TableSkeleton } from '../../components/ui/StateViews';
import { useAuth } from '../../context/AuthContext';
import { useAsync, useDebounce } from '../../hooks';
import { useSeo } from '../../hooks/useSeo';
import { admissionService, programService, studentService } from '../../services';
import { parseError } from '../../services/api';
import { ADMISSION_STATUSES, formatDate, statusMeta } from '../../utils/constants';

export default function AdminAdmissionsPage() {
  useSeo({ title: 'Admissions', noindex: true });
  const { can } = useAuth();
  const [sp] = useSearchParams();

  const [filters, setFilters] = useState({ search: '', status: sp.get('status') || '', program_id: '', page: 1 });
  const debounced = useDebounce(filters.search, 300);

  const { data: res, loading, error, reload } = useAsync(
    () =>
      admissionService.list({
        page: filters.page,
        limit: 12,
        ...(debounced ? { search: debounced } : {}),
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.program_id ? { program_id: filters.program_id } : {}),
      }),
    [debounced, filters.status, filters.program_id, filters.page]
  );

  const { data: progRes } = useAsync(() => programService.list({ all: 1 }), []);
  const { data: stuRes } = useAsync(() => studentService.list({ limit: 100 }), []);
  const programs = progRes?.data || [];
  const students = stuRes?.data || [];

  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ user_id: '', program_id: '', status: 'pending', notes: '' });
  const [saving, setSaving] = useState(false);

  const [decideTarget, setDecideTarget] = useState(null); // { adm, status }
  const [decideNotes, setDecideNotes] = useState('');
  const [deciding, setDeciding] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const onCreate = async (e) => {
    e.preventDefault();
    if (!addForm.user_id || !addForm.program_id) return toast.error('Select both a student and a program.');
    setSaving(true);
    try {
      await admissionService.create({
        user_id: Number(addForm.user_id),
        program_id: Number(addForm.program_id),
        status: addForm.status,
        notes: addForm.notes,
      });
      toast.success('Admission recorded.');
      setAddOpen(false);
      setAddForm({ user_id: '', program_id: '', status: 'pending', notes: '' });
      reload();
    } catch (err) {
      toast.error(parseError(err).message);
    } finally {
      setSaving(false);
    }
  };

  const onDecide = async () => {
    setDeciding(true);
    try {
      await admissionService.update(decideTarget.adm.id, { status: decideTarget.status, notes: decideNotes });
      toast.success(`Admission ${decideTarget.status}.`);
      setDecideTarget(null);
      reload();
    } catch (err) {
      toast.error(parseError(err).message);
    } finally {
      setDeciding(false);
    }
  };

  const onDelete = async () => {
    setDeleting(true);
    try {
      await admissionService.remove(deleteTarget.id);
      toast.success('Admission removed.');
      setDeleteTarget(null);
      reload();
    } catch (err) {
      toast.error(parseError(err).message);
    } finally {
      setDeleting(false);
    }
  };

  const rows = res?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-dark">Enrollments</p>
          <h1 className="mt-1 font-serif text-3xl text-navy sm:text-4xl">Admission Management</h1>
        </div>
        {can('admissions:create') && (
          <Button onClick={() => setAddOpen(true)} size="sm">
            <Plus className="h-4 w-4" /> New Admission
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="card p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="relative">
            <Search className="pointer-events-none absolute top-3.5 left-3.5 h-4 w-4 text-muted" />
            <input
              type="search"
              placeholder="Search student name or email…"
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value, page: 1 }))}
              className="field pl-10 py-2.5 text-sm"
            />
          </div>
          <select
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value, page: 1 }))}
            className="field py-2.5 text-sm"
          >
            <option value="">All Statuses</option>
            {ADMISSION_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <select
            value={filters.program_id}
            onChange={(e) => setFilters((f) => ({ ...f, program_id: e.target.value, page: 1 }))}
            className="field py-2.5 text-sm"
          >
            <option value="">All Programs</option>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <TableSkeleton rows={6} cols={5} />
        ) : error ? (
          <div className="p-6">
            <ErrorState message="Could not load admissions." onRetry={reload} />
          </div>
        ) : rows.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={GraduationCap}
              title="No admissions found"
              description="Approve student applications or create a new admission record."
            />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[740px]">
                <thead>
                  <tr className="border-b border-beige bg-ivory/70">
                    <th className="table-th">Student</th>
                    <th className="table-th">Program</th>
                    <th className="table-th">Status</th>
                    <th className="table-th">Applied / Admitted</th>
                    <th className="table-th text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-beige/60">
                  {rows.map((a) => {
                    const st = statusMeta(ADMISSION_STATUSES, a.status);
                    return (
                      <tr key={a.id} className="hover:bg-ivory/50">
                        <td className="table-td">
                          <p className="font-semibold text-navy">{a.student_name}</p>
                          <p className="text-xs text-muted">{a.student_email}</p>
                        </td>
                        <td className="table-td font-medium">{a.program_title}</td>
                        <td className="table-td">
                          <Badge tone={st.tone}>{st.label}</Badge>
                        </td>
                        <td className="table-td text-xs text-muted">
                          <div>Applied: {formatDate(a.created_at)}</div>
                          {a.admission_date && <div className="text-navy">Admitted: {formatDate(a.admission_date)}</div>}
                        </td>
                        <td className="table-td text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {can('admissions:decide') && a.status !== 'approved' && (
                              <Button
                                variant="subtle"
                                size="xs"
                                onClick={() => {
                                  setDecideTarget({ adm: a, status: 'approved' });
                                  setDecideNotes(a.notes || '');
                                }}
                                className="!bg-emerald-50 !text-emerald-700 hover:!bg-emerald-600 hover:!text-white"
                              >
                                <Check className="h-3.5 w-3.5" /> Approve
                              </Button>
                            )}
                            {can('admissions:decide') && a.status !== 'rejected' && (
                              <Button
                                variant="subtle"
                                size="xs"
                                onClick={() => {
                                  setDecideTarget({ adm: a, status: 'rejected' });
                                  setDecideNotes(a.notes || '');
                                }}
                                className="!bg-red-50 !text-red-700 hover:!bg-red-600 hover:!text-white"
                              >
                                <X className="h-3.5 w-3.5" /> Reject
                              </Button>
                            )}
                            {can('admissions:decide') && (
                              <button
                                type="button"
                                onClick={() => setDeleteTarget(a)}
                                title="Delete record"
                                className="rounded-lg p-1.5 text-muted hover:bg-red-50 hover:text-red-600"
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

      {/* Create Admission Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Create Admission" size="sm">
        <form onSubmit={onCreate} className="space-y-4">
          <Select
            label="Student"
            required
            placeholder="Select a student…"
            value={addForm.user_id}
            onChange={(e) => setAddForm({ ...addForm, user_id: e.target.value })}
            options={students.map((s) => ({ value: String(s.id), label: `${s.full_name} (${s.email})` }))}
          />
          <Select
            label="Program"
            required
            placeholder="Select a program…"
            value={addForm.program_id}
            onChange={(e) => setAddForm({ ...addForm, program_id: e.target.value })}
            options={programs.map((p) => ({ value: String(p.id), label: p.title }))}
          />
          {can('admissions:decide') && (
            <Select
              label="Status"
              value={addForm.status}
              onChange={(e) => setAddForm({ ...addForm, status: e.target.value })}
              options={ADMISSION_STATUSES.map((s) => ({ value: s.value, label: s.label }))}
            />
          )}
          <Textarea label="Notes (Optional)" rows={2} value={addForm.notes} onChange={(e) => setAddForm({ ...addForm, notes: e.target.value })} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              Save Admission
            </Button>
          </div>
        </form>
      </Modal>

      {/* Approve / Reject Modal */}
      <Modal
        open={!!decideTarget}
        onClose={() => setDecideTarget(null)}
        title={decideTarget?.status === 'approved' ? 'Approve Admission' : 'Reject Admission'}
        subtitle={decideTarget ? `${decideTarget.adm.student_name} → ${decideTarget.adm.program_title}` : ''}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDecideTarget(null)}>
              Cancel
            </Button>
            <Button
              variant={decideTarget?.status === 'approved' ? 'primary' : 'danger'}
              onClick={onDecide}
              loading={deciding}
            >
              Confirm {decideTarget?.status === 'approved' ? 'Approval' : 'Rejection'}
            </Button>
          </>
        }
      >
        <Textarea
          label="Internal Notes (Optional)"
          rows={3}
          placeholder="Optional note for internal records…"
          value={decideNotes}
          onChange={(e) => setDecideNotes(e.target.value)}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={onDelete}
        loading={deleting}
        title="Delete Admission Record"
        message={`Remove admission record for ${deleteTarget?.student_name} (${deleteTarget?.program_title})?`}
        confirmLabel="Remove"
      />
    </div>
  );
}
