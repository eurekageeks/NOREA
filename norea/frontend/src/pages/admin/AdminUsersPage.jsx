import { useState } from 'react';
import { Plus, Pencil, Trash2, ShieldCheck, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal, { ConfirmDialog } from '../../components/ui/Modal';
import { Input, Select } from '../../components/ui/Field';
import { EmptyState, ErrorState, Pagination, TableSkeleton } from '../../components/ui/StateViews';
import { useAuth } from '../../context/AuthContext';
import { useAsync } from '../../hooks';
import { useSeo } from '../../hooks/useSeo';
import { dashboardService, userService } from '../../services';
import { parseError } from '../../services/api';
import { formatDateTime, ROLE_LABELS, validators } from '../../utils/constants';

const BLANK = { full_name: '', email: '', phone: '', password: '', role: 'staff', status: 'active' };

export default function AdminUsersPage() {
  useSeo({ title: 'Team & Activity', noindex: true });
  const { user: currentUser } = useAuth();
  const [tab, setTab] = useState('users');
  const [logPage, setLogPage] = useState(1);

  const { data: usersRes, loading, error, reload } = useAsync(() => userService.list(), []);
  const { data: logsRes, loading: logsLoading } = useAsync(
    () => dashboardService.activity({ page: logPage, limit: 20 }),
    [logPage]
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const openAdd = () => {
    setEditing(null);
    setForm(BLANK);
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (u) => {
    setEditing(u);
    setForm({ full_name: u.full_name, email: u.email, phone: u.phone || '', password: '', role: u.role, status: u.status });
    setErrors({});
    setModalOpen(true);
  };

  const onSave = async (e) => {
    e.preventDefault();
    const errs = {};
    const n = validators.name(form.full_name);
    if (n) errs.full_name = n;
    const em = validators.email(form.email);
    if (em) errs.email = em;
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
        await userService.update(editing.id, payload);
        toast.success('Team member updated.');
      } else {
        await userService.create(payload);
        toast.success('Team member added.');
      }
      setModalOpen(false);
      reload();
    } catch (err) {
      const p = parseError(err);
      setErrors(p.fields);
      toast.error(p.message);
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    setDeleting(true);
    try {
      await userService.remove(deleteTarget.id);
      toast.success('Team member removed.');
      setDeleteTarget(null);
      reload();
    } catch (err) {
      toast.error(parseError(err).message);
    } finally {
      setDeleting(false);
    }
  };

  const users = usersRes?.data || [];
  const logs = logsRes?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-dark">Access Control</p>
          <h1 className="mt-1 font-serif text-3xl text-navy sm:text-4xl">Team & Activity Logs</h1>
        </div>
        {tab === 'users' && (
          <Button onClick={openAdd} size="sm">
            <Plus className="h-4 w-4" /> Add Team Member
          </Button>
        )}
      </div>

      <div className="flex gap-2">
        {[
          ['users', 'Admin Users', ShieldCheck],
          ['logs', 'Activity Logs', Activity],
        ].map(([k, label, Icon]) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
              tab === k ? 'bg-navy text-ivory' : 'border border-beige bg-white text-navy/75 hover:bg-sand'
            }`}
          >
            <Icon className="h-3.5 w-3.5" /> {label}
          </button>
        ))}
      </div>

      {tab === 'users' ? (
        <div className="card overflow-hidden">
          {loading ? (
            <TableSkeleton rows={4} cols={5} />
          ) : error ? (
            <div className="p-6">
              <ErrorState message="Could not load admin users." onRetry={reload} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px]">
                <thead>
                  <tr className="border-b border-beige bg-ivory/70">
                    <th className="table-th">Name</th>
                    <th className="table-th">Role</th>
                    <th className="table-th">Status</th>
                    <th className="table-th">Last Sign In</th>
                    <th className="table-th text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-beige/60">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-ivory/50">
                      <td className="table-td">
                        <p className="font-semibold text-navy">
                          {u.full_name} {u.id === currentUser?.id && <span className="text-xs font-normal text-gold-dark">(You)</span>}
                        </p>
                        <p className="text-xs text-muted">{u.email}</p>
                      </td>
                      <td className="table-td">
                        <Badge tone={u.role === 'super_admin' ? 'navy' : u.role === 'admin' ? 'gold' : 'gray'}>
                          {ROLE_LABELS[u.role]}
                        </Badge>
                      </td>
                      <td className="table-td">
                        <Badge tone={u.status === 'active' ? 'green' : 'gray'}>{u.status}</Badge>
                      </td>
                      <td className="table-td text-xs text-muted">{formatDateTime(u.last_login_at)}</td>
                      <td className="table-td text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <Button variant="subtle" size="xs" onClick={() => openEdit(u)}>
                            <Pencil className="h-3.5 w-3.5" /> Edit
                          </Button>
                          {u.id !== currentUser?.id && (
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(u)}
                              className="rounded-lg p-1.5 text-muted hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="card overflow-hidden">
          {logsLoading ? (
            <TableSkeleton rows={6} cols={4} />
          ) : logs.length === 0 ? (
            <div className="p-8">
              <EmptyState icon={Activity} title="No activity recorded yet" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead>
                    <tr className="border-b border-beige bg-ivory/70">
                      <th className="table-th">Time</th>
                      <th className="table-th">Actor</th>
                      <th className="table-th">Action</th>
                      <th className="table-th">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-beige/60">
                    {logs.map((l) => (
                      <tr key={l.id}>
                        <td className="table-td text-xs text-muted whitespace-nowrap">{formatDateTime(l.created_at)}</td>
                        <td className="table-td text-xs font-semibold text-navy">{l.admin_name || 'System'}</td>
                        <td className="table-td">
                          <Badge tone="gold">{l.action}</Badge>
                        </td>
                        <td className="table-td text-xs text-charcoal/80">{l.description || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination pagination={logsRes?.pagination} onPage={setLogPage} />
            </>
          )}
        </div>
      )}

      {/* Add / Edit Admin Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Team Member' : 'Add Team Member'} size="sm">
        <form onSubmit={onSave} className="space-y-4">
          <Input label="Full Name" required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} error={errors.full_name} />
          <Input label="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={errors.email} />
          <Input label="Phone (Optional)" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input
            label={editing ? 'Reset Password (Optional)' : 'Password'}
            type="password"
            required={!editing}
            hint="8+ characters with letters and numbers"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            error={errors.password}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Select
              label="Role"
              value={form.role}
              disabled={editing?.id === currentUser?.id}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              options={[
                { value: 'super_admin', label: 'Super Admin' },
                { value: 'admin', label: 'Admin' },
                { value: 'staff', label: 'Staff' },
              ]}
            />
            <Select
              label="Status"
              value={form.status}
              disabled={editing?.id === currentUser?.id}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
              ]}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {editing ? 'Save Changes' : 'Add Member'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={onDelete}
        loading={deleting}
        title="Remove Team Member"
        message={`Remove ${deleteTarget?.full_name} (${deleteTarget?.email}) from the admin team?`}
        confirmLabel="Remove"
      />
    </div>
  );
}
