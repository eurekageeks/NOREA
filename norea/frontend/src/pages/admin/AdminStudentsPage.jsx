import { useState } from 'react';
import { Search, Plus, Eye, Pencil, Trash2, UserX, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal, { ConfirmDialog } from '../../components/ui/Modal';
import { Input, Select, Textarea } from '../../components/ui/Field';
import { EmptyState, ErrorState, Pagination, TableSkeleton } from '../../components/ui/StateViews';
import { useAuth } from '../../context/AuthContext';
import { useAsync, useDebounce } from '../../hooks';
import { useSeo } from '../../hooks/useSeo';
import { studentService } from '../../services';
import { parseError } from '../../services/api';
import { ADMISSION_STATUSES, formatDate, initials, statusMeta, toDateInput, validators } from '../../utils/constants';

const BLANK = { full_name: '', email: '', phone: '', password: '', status: 'active', date_of_birth: '', address: '' };

export default function AdminStudentsPage() {
  useSeo({ title: 'Students', noindex: true });
  const { can } = useAuth();

  const [filters, setFilters] = useState({ search: '', status: '', sort: 'newest', page: 1 });
  const debounced = useDebounce(filters.search, 300);

  const { data: res, loading, error, reload } = useAsync(
    () =>
      studentService.list({
        page: filters.page,
        limit: 12,
        ...(debounced ? { search: debounced } : {}),
        ...(filters.status ? { status: filters.status } : {}),
        sort: filters.sort,
      }),
    [debounced, filters.status, filters.sort, filters.page]
  );

  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const [actionTarget, setActionTarget] = useState(null); // { student, mode: 'deactivate' | 'delete' }
  const [acting, setActing] = useState(false);

  const openDetail = async (id) => {
    setLoadingDetail(true);
    setDetail({ loading: true });
    try {
      const r = await studentService.get(id);
      setDetail(r.data);
    } catch (err) {
      toast.error(parseError(err).message);
      setDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const openAdd = () => {
    setEditing(null);
    setForm(BLANK);
    setErrors({});
    setFormOpen(true);
  };

  const openEdit = async (s) => {
    try {
      const r = await studentService.get(s.id);
      const d = r.data;
      setEditing(d);
      setForm({
        full_name: d.full_name || '',
        email: d.email || '',
        phone: d.phone || '',
        password: '',
        status: d.status || 'active',
        date_of_birth: toDateInput(d.profile?.date_of_birth),
        address: d.profile?.address || '',
      });
      setErrors({});
      setFormOpen(true);
    } catch (err) {
      toast.error(parseError(err).message);
    }
  };

  const onSave = async (e) => {
    e.preventDefault();
    const errs = {};
    const n = validators.name(form.full_name);
    if (n) errs.full_name = n;
    const em = validators.email(form.email);
    if (em) errs.email = em;
    const ph = validators.phone(form.phone, !editing);
    if (ph) errs.phone = ph;
    if (!editing || form.password) {
      const pw = validators.password(form.password);
      if (pw) errs.password = pw;
    }
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSaving(true);
    try {
      const payload = { ...form };
      if (editing && !payload.password) delete payload.password;
      if (editing) {
        await studentService.update(editing.id, payload);
        toast.success('Student updated.');
      } else {
        await studentService.create(payload);
        toast.success('Student added.');
      }
      setFormOpen(false);
      reload();
    } catch (err) {
      const p = parseError(err);
      setErrors(p.fields);
      toast.error(p.message);
    } finally {
      setSaving(false);
    }
  };

  const onConfirmAction = async () => {
    setActing(true);
    try {
      const r = await studentService.remove(actionTarget.student.id, actionTarget.mode);
      toast.success(r.message);
      setActionTarget(null);
      reload();
    } catch (err) {
      toast.error(parseError(err).message);
    } finally {
      setActing(false);
    }
  };

  const rows = res?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-dark">Directory</p>
          <h1 className="mt-1 font-serif text-3xl text-navy sm:text-4xl">Student Management</h1>
        </div>
        {can('students:manage') && (
          <Button onClick={openAdd} size="sm">
            <Plus className="h-4 w-4" /> Add Student
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
              placeholder="Search name, email, phone…"
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
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select
            value={filters.sort}
            onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value, page: 1 }))}
            className="field py-2.5 text-sm"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name">Name (A–Z)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <TableSkeleton rows={6} cols={5} />
        ) : error ? (
          <div className="p-6">
            <ErrorState message="Could not load students." onRetry={reload} />
          </div>
        ) : rows.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={Users}
              title="No students found"
              description="Students who register on the portal or are added by an admin will appear here."
              action={can('students:manage') ? <Button onClick={openAdd}>Add Student</Button> : null}
            />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead>
                  <tr className="border-b border-beige bg-ivory/70">
                    <th className="table-th">Student</th>
                    <th className="table-th">Phone</th>
                    <th className="table-th">Programs</th>
                    <th className="table-th">Status</th>
                    <th className="table-th">Joined</th>
                    <th className="table-th text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-beige/60">
                  {rows.map((s) => (
                    <tr key={s.id} className="hover:bg-ivory/50">
                      <td className="table-td">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-semibold text-gold-light">
                            {initials(s.full_name)}
                          </span>
                          <div>
                            <p className="font-semibold text-navy">{s.full_name}</p>
                            <p className="text-xs text-muted">{s.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="table-td text-xs">{s.phone || '—'}</td>
                      <td className="table-td text-xs">
                        <span className="font-semibold text-navy">{s.enrolled_count || 0}</span> enrolled
                        {s.pending_count > 0 && <span className="text-amber-700"> • {s.pending_count} pending</span>}
                      </td>
                      <td className="table-td">
                        <Badge tone={s.status === 'active' ? 'green' : 'gray'}>{s.status}</Badge>
                      </td>
                      <td className="table-td text-xs text-muted">{formatDate(s.created_at)}</td>
                      <td className="table-td text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <Button variant="subtle" size="xs" onClick={() => openDetail(s.id)}>
                            <Eye className="h-3.5 w-3.5" /> View
                          </Button>
                          {can('students:manage') && (
                            <>
                              <button
                                type="button"
                                onClick={() => openEdit(s)}
                                title="Edit student"
                                className="rounded-lg p-1.5 text-muted hover:bg-sand hover:text-navy"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              {s.status === 'active' && (
                                <button
                                  type="button"
                                  onClick={() => setActionTarget({ student: s, mode: 'deactivate' })}
                                  title="Deactivate"
                                  className="rounded-lg p-1.5 text-muted hover:bg-amber-50 hover:text-amber-700"
                                >
                                  <UserX className="h-4 w-4" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => setActionTarget({ student: s, mode: 'delete' })}
                                title="Delete permanently"
                                className="rounded-lg p-1.5 text-muted hover:bg-red-50 hover:text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination pagination={res?.pagination} onPage={(p) => setFilters((f) => ({ ...f, page: p }))} />
          </>
        )}
      </div>

      {/* Student Detail Modal */}
      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        title={detail?.full_name || 'Student Details'}
        subtitle={detail?.email}
        size="md"
      >
        {loadingDetail ? (
          <TableSkeleton rows={3} cols={2} />
        ) : detail ? (
          <div className="space-y-6">
            <dl className="grid gap-3 rounded-xl border border-beige bg-ivory/60 p-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-[0.68rem] uppercase tracking-wider text-muted">Phone</dt>
                <dd className="font-medium text-navy">{detail.phone || '—'}</dd>
              </div>
              <div>
                <dt className="text-[0.68rem] uppercase tracking-wider text-muted">Status</dt>
                <dd>
                  <Badge tone={detail.status === 'active' ? 'green' : 'gray'}>{detail.status}</Badge>
                </dd>
              </div>
              <div>
                <dt className="text-[0.68rem] uppercase tracking-wider text-muted">Date of Birth</dt>
                <dd>{formatDate(detail.profile?.date_of_birth)}</dd>
              </div>
              <div>
                <dt className="text-[0.68rem] uppercase tracking-wider text-muted">Joined</dt>
                <dd>{formatDate(detail.created_at)}</dd>
              </div>
              {detail.profile?.address && (
                <div className="sm:col-span-2">
                  <dt className="text-[0.68rem] uppercase tracking-wider text-muted">Address</dt>
                  <dd>{detail.profile.address}</dd>
                </div>
              )}
            </dl>

            <div>
              <h4 className="font-serif text-xl text-navy">Admissions ({detail.admissions?.length || 0})</h4>
              {detail.admissions?.length ? (
                <ul className="mt-2 divide-y divide-beige/70 rounded-xl border border-beige">
                  {detail.admissions.map((a) => {
                    const st = statusMeta(ADMISSION_STATUSES, a.status);
                    return (
                      <li key={a.id} className="flex items-center justify-between px-4 py-3 text-sm">
                        <div>
                          <p className="font-medium text-navy">{a.program_title}</p>
                          <p className="text-xs text-muted">Applied {formatDate(a.created_at)}</p>
                        </div>
                        <Badge tone={st.tone}>{st.label}</Badge>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="mt-2 text-xs text-muted">No admissions recorded.</p>
              )}
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Add / Edit Modal */}
      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? 'Edit Student' : 'Add Student'} size="md">
        <form onSubmit={onSave} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Full Name" required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} error={errors.full_name} />
            <Input label="Email Address" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={errors.email} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Mobile Number" type="tel" required={!editing} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} error={errors.phone} />
            <Select
              label="Status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
              ]}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label={editing ? 'Reset Password (Optional)' : 'Password'}
              type="password"
              required={!editing}
              hint="8+ chars with letters & numbers"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              error={errors.password}
            />
            <Input label="Date of Birth" type="date" value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} />
          </div>
          <Textarea label="Address" rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <div className="flex justify-end gap-2.5 pt-2">
            <Button variant="ghost" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {editing ? 'Save Changes' : 'Create Student'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!actionTarget}
        onClose={() => setActionTarget(null)}
        onConfirm={onConfirmAction}
        loading={acting}
        variant={actionTarget?.mode === 'delete' ? 'danger' : 'primary'}
        title={actionTarget?.mode === 'delete' ? 'Delete Student' : 'Deactivate Student'}
        message={
          actionTarget?.mode === 'delete'
            ? `Permanently delete ${actionTarget?.student?.full_name} and all their admissions? This cannot be undone.`
            : `Deactivate ${actionTarget?.student?.full_name}? They will no longer be able to sign in.`
        }
        confirmLabel={actionTarget?.mode === 'delete' ? 'Delete Permanently' : 'Deactivate'}
      />
    </div>
  );
}
