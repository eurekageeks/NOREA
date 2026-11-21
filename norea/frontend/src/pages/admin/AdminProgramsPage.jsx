import { useState } from 'react';
import { Plus, Pencil, Trash2, BookOpen, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal, { ConfirmDialog } from '../../components/ui/Modal';
import { ImageUploader, Input, Select, Textarea } from '../../components/ui/Field';
import { EmptyState, ErrorState, TableSkeleton } from '../../components/ui/StateViews';
import { useAsync } from '../../hooks';
import { useSeo } from '../../hooks/useSeo';
import { programService } from '../../services';
import { assetUrl, parseError } from '../../services/api';
import { PROGRAM_STATUSES, statusMeta } from '../../utils/constants';

const BLANK = {
  title: '',
  slug: '',
  short_description: '',
  description: '',
  image: '',
  topicsText: '',
  outcomesText: '',
  highlightsText: '',
  learning_modes: ['online', 'offline', 'hybrid'],
  duration: '',
  fees: '',
  certification: '',
  trainer_info: '',
  display_order: 0,
  status: 'active',
};

const toLines = (arr) => (arr || []).map((x) => (typeof x === 'string' ? x : x.topic_name)).join('\n');
const fromLines = (str) => str.split('\n').map((s) => s.trim()).filter(Boolean);

export default function AdminProgramsPage() {
  useSeo({ title: 'Manage Programs', noindex: true });
  const { data: res, loading, error, reload } = useAsync(() => programService.list({ all: 1 }), []);
  const programs = res?.data || [];

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const openAdd = () => {
    setEditing(null);
    setForm({ ...BLANK, display_order: programs.length + 1 });
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      title: p.title || '',
      slug: p.slug || '',
      short_description: p.short_description || '',
      description: p.description || '',
      image: p.image || '',
      topicsText: toLines(p.topics),
      outcomesText: toLines(p.learning_outcomes),
      highlightsText: toLines(p.highlights),
      learning_modes: p.learning_modes?.length ? p.learning_modes : ['online', 'offline', 'hybrid'],
      duration: p.duration || '',
      fees: p.fees || '',
      certification: p.certification || '',
      trainer_info: p.trainer_info || '',
      display_order: p.display_order ?? 0,
      status: p.status || 'active',
    });
    setErrors({});
    setModalOpen(true);
  };

  const toggleMode = (m) =>
    setForm((f) => ({
      ...f,
      learning_modes: f.learning_modes.includes(m)
        ? f.learning_modes.filter((x) => x !== m)
        : [...f.learning_modes, m],
    }));

  const onSave = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required.';
    if (!form.description.trim()) errs.description = 'Description is required.';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim() || undefined,
      short_description: form.short_description.trim(),
      description: form.description.trim(),
      image: form.image,
      topics: fromLines(form.topicsText),
      learning_outcomes: fromLines(form.outcomesText),
      highlights: fromLines(form.highlightsText),
      learning_modes: form.learning_modes,
      duration: form.duration.trim(),
      fees: form.fees.trim(),
      certification: form.certification.trim(),
      trainer_info: form.trainer_info.trim(),
      display_order: Number(form.display_order) || 0,
      status: form.status,
    };

    setSaving(true);
    try {
      if (editing) {
        await programService.update(editing.id, payload);
        toast.success('Program updated.');
      } else {
        await programService.create(payload);
        toast.success('Program created.');
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
      await programService.remove(deleteTarget.id);
      toast.success('Program deleted.');
      setDeleteTarget(null);
      reload();
    } catch (err) {
      toast.error(parseError(err).message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-dark">Curriculum</p>
          <h1 className="mt-1 font-serif text-3xl text-navy sm:text-4xl">Program Management</h1>
        </div>
        <Button onClick={openAdd} size="sm">
          <Plus className="h-4 w-4" /> Add Program
        </Button>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <TableSkeleton rows={4} cols={5} />
        ) : error ? (
          <div className="p-6">
            <ErrorState message="Could not load programs." onRetry={reload} />
          </div>
        ) : programs.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={BookOpen}
              title="No programs yet"
              description="Add your first learning program to publish it on the NŌRÉA website."
              action={<Button onClick={openAdd}>Add Program</Button>}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[740px]">
              <thead>
                <tr className="border-b border-beige bg-ivory/70">
                  <th className="table-th">Program</th>
                  <th className="table-th">Topics</th>
                  <th className="table-th">Enquiries</th>
                  <th className="table-th">Enrolled</th>
                  <th className="table-th">Status</th>
                  <th className="table-th text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-beige/60">
                {programs.map((p) => {
                  const st = statusMeta(PROGRAM_STATUSES, p.status);
                  return (
                    <tr key={p.id} className="hover:bg-ivory/50">
                      <td className="table-td">
                        <div className="flex items-center gap-3.5">
                          <img
                            src={assetUrl(p.image) || '/images/hero.jpg'}
                            alt={p.title}
                            className="h-12 w-16 shrink-0 rounded-lg object-cover border border-beige"
                          />
                          <div>
                            <p className="font-semibold text-navy">{p.title}</p>
                            <p className="text-xs text-muted">/programs/{p.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="table-td text-xs text-muted">{p.topics?.length || 0} topics</td>
                      <td className="table-td text-sm font-medium">{p.enquiry_count ?? 0}</td>
                      <td className="table-td text-sm font-medium">{p.student_count ?? 0}</td>
                      <td className="table-td">
                        <Badge tone={st.tone}>{st.label}</Badge>
                      </td>
                      <td className="table-td text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <a
                            href={`/programs/${p.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            title="Preview page"
                            className="rounded-lg p-1.5 text-muted hover:bg-sand hover:text-navy"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                          <Button variant="subtle" size="xs" onClick={() => openEdit(p)}>
                            <Pencil className="h-3.5 w-3.5" /> Edit
                          </Button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(p)}
                            title="Delete program"
                            className="rounded-lg p-1.5 text-muted hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Program' : 'Add New Program'}
        subtitle="Optional details (duration, fees, certification, trainer info) appear on the public page only when filled in."
        size="lg"
      >
        <form onSubmit={onSave} className="space-y-5">
          <ImageUploader
            label="Program Cover Image"
            value={form.image}
            onChange={(url) => setForm((f) => ({ ...f, image: url }))}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Program Title"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              error={errors.title}
            />
            <Input
              label="URL Slug (Optional)"
              hint="Auto-generated from title if left blank"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              error={errors.slug}
            />
          </div>

          <Input
            label="Short Description"
            placeholder="One-line summary shown on program cards"
            value={form.short_description}
            onChange={(e) => setForm({ ...form, short_description: e.target.value })}
          />

          <Textarea
            label="Full Description"
            required
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            error={errors.description}
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <Textarea
              label="Topics (one per line)"
              rows={5}
              placeholder={'Public Speaking\nFluency & Conversation'}
              value={form.topicsText}
              onChange={(e) => setForm({ ...form, topicsText: e.target.value })}
            />
            <Textarea
              label="Learning Outcomes (one per line)"
              rows={5}
              value={form.outcomesText}
              onChange={(e) => setForm({ ...form, outcomesText: e.target.value })}
            />
            <Textarea
              label="Highlights (one per line)"
              rows={5}
              value={form.highlightsText}
              onChange={(e) => setForm({ ...form, highlightsText: e.target.value })}
            />
          </div>

          <div>
            <span className="field-label">Learning Modes</span>
            <div className="flex flex-wrap gap-3">
              {[
                ['online', 'Online'],
                ['offline', 'In-person'],
                ['hybrid', 'Hybrid'],
              ].map(([val, lbl]) => (
                <label key={val} className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-beige bg-ivory px-3.5 py-2 text-xs font-medium text-navy">
                  <input
                    type="checkbox"
                    checked={form.learning_modes.includes(val)}
                    onChange={() => toggleMode(val)}
                    className="accent-navy"
                  />
                  {lbl}
                </label>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Input label="Duration (Optional)" placeholder="e.g. 8 Weeks" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
            <Input label="Fees (Optional)" placeholder="Configured by institute" value={form.fees} onChange={(e) => setForm({ ...form, fees: e.target.value })} />
            <Input label="Certification (Optional)" placeholder="e.g. Completion Certificate" value={form.certification} onChange={(e) => setForm({ ...form, certification: e.target.value })} />
          </div>

          <Textarea
            label="Trainer / Mentor Information (Optional)"
            rows={2}
            value={form.trainer_info}
            onChange={(e) => setForm({ ...form, trainer_info: e.target.value })}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              options={PROGRAM_STATUSES.map((s) => ({ value: s.value, label: s.label }))}
            />
            <Input
              label="Display Order"
              type="number"
              min={0}
              value={form.display_order}
              onChange={(e) => setForm({ ...form, display_order: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {editing ? 'Save Changes' : 'Create Program'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={onDelete}
        loading={deleting}
        title="Delete Program"
        message={`Delete "${deleteTarget?.title}"? Programs with linked admissions cannot be deleted — set them to Inactive instead.`}
        confirmLabel="Delete Program"
      />
    </div>
  );
}
