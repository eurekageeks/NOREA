import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import { ImageUploader, Input, Textarea } from '../../components/ui/Field';
import { useSettings } from '../../context/SettingsContext';
import { useSeo } from '../../hooks/useSeo';
import { settingsService } from '../../services';
import { parseError } from '../../services/api';

const TABS = [
  ['brand', 'Brand & Identity'],
  ['homepage', 'Homepage & About'],
  ['contact', 'Contact & Map'],
  ['social', 'Social & Footer'],
];

export default function AdminSettingsPage() {
  useSeo({ title: 'Website Settings', noindex: true });
  const { settings, reload } = useSettings();

  const [tab, setTab] = useState('brand');
  const [form, setForm] = useState(settings);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errors[`settings.${k}`]) setErrors((er) => ({ ...er, [`settings.${k}`]: '' }));
  };

  const err = (k) => errors[`settings.${k}`];

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      await settingsService.update(form);
      await reload();
      toast.success('Website settings saved.');
    } catch (er) {
      const p = parseError(er);
      setErrors(p.fields);
      toast.error(p.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-dark">Configuration</p>
        <h1 className="mt-1 font-serif text-3xl text-navy sm:text-4xl">Website Settings</h1>
        <p className="mt-1 text-sm text-muted">Changes update the public NŌRÉA website immediately.</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
              tab === key ? 'bg-navy text-ivory' : 'border border-beige bg-white text-navy/75 hover:bg-sand'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <form onSubmit={onSave} className="card p-6 sm:p-8 space-y-5">
        {tab === 'brand' && (
          <>
            <ImageUploader
              label="Custom Brand Logo (Optional)"
              hint="Leave empty to use the elegant NŌRÉA typographic wordmark."
              value={form.logo || ''}
              onChange={(url) => setForm((f) => ({ ...f, logo: url }))}
              aspect="aspect-[16/9]"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Institute Name" value={form.institute_name || ''} onChange={set('institute_name')} />
              <Input label="Brand Category" value={form.institute_category || ''} onChange={set('institute_category')} />
            </div>
            <Input label="Tagline" value={form.tagline || ''} onChange={set('tagline')} />
            <Textarea label="SEO Meta Description" rows={2} value={form.seo_description || ''} onChange={set('seo_description')} />
          </>
        )}

        {tab === 'homepage' && (
          <>
            <ImageUploader
              label="Hero Banner Image"
              value={form.hero_image || ''}
              onChange={(url) => setForm((f) => ({ ...f, hero_image: url }))}
            />
            <Input label="Hero Main Heading" value={form.hero_heading || ''} onChange={set('hero_heading')} />
            <Input label="Hero Supporting Text" value={form.hero_subheading || ''} onChange={set('hero_subheading')} />
            <Textarea label="About Us Introduction" rows={3} value={form.about_intro || ''} onChange={set('about_intro')} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Textarea label="Mission Statement" rows={3} value={form.mission || ''} onChange={set('mission')} />
              <Textarea label="Vision Statement" rows={3} value={form.vision || ''} onChange={set('vision')} />
            </div>
          </>
        )}

        {tab === 'contact' && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Contact Email"
                type="email"
                placeholder="admissions@yourdomain.com"
                value={form.contact_email || ''}
                onChange={set('contact_email')}
                error={err('contact_email')}
              />
              <Input
                label="Contact Phone"
                type="tel"
                placeholder="+91 98765 43210"
                value={form.contact_phone || ''}
                onChange={set('contact_phone')}
                error={err('contact_phone')}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="WhatsApp Number (Optional)" value={form.whatsapp_number || ''} onChange={set('whatsapp_number')} />
              <Input label="Office Hours (Optional)" placeholder="Mon–Sat, 9:30 AM – 6:30 PM" value={form.office_hours || ''} onChange={set('office_hours')} />
            </div>
            <Textarea label="Institute Address" rows={3} placeholder="Full street address, city, postal code" value={form.contact_address || ''} onChange={set('contact_address')} />
            <Input
              label="Google Maps Embed URL"
              placeholder="https://www.google.com/maps/embed?pb=..."
              hint="In Google Maps: Share → Embed a map → copy only the src URL inside the iframe."
              value={form.map_embed_url || ''}
              onChange={set('map_embed_url')}
              error={err('map_embed_url')}
            />
          </>
        )}

        {tab === 'social' && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Instagram URL" placeholder="https://instagram.com/..." value={form.social_instagram || ''} onChange={set('social_instagram')} error={err('social_instagram')} />
              <Input label="Facebook URL" placeholder="https://facebook.com/..." value={form.social_facebook || ''} onChange={set('social_facebook')} error={err('social_facebook')} />
              <Input label="LinkedIn URL" placeholder="https://linkedin.com/company/..." value={form.social_linkedin || ''} onChange={set('social_linkedin')} error={err('social_linkedin')} />
              <Input label="YouTube URL" placeholder="https://youtube.com/@..." value={form.social_youtube || ''} onChange={set('social_youtube')} error={err('social_youtube')} />
              <Input label="X (Twitter) URL" placeholder="https://x.com/..." value={form.social_x || ''} onChange={set('social_x')} error={err('social_x')} />
            </div>
            <Textarea label="Footer About Text" rows={3} value={form.footer_about || ''} onChange={set('footer_about')} />
            <Input label="Footer Copyright Suffix" value={form.footer_text || ''} onChange={set('footer_text')} />
          </>
        )}

        <div className="flex justify-end border-t border-beige/70 pt-5">
          <Button type="submit" loading={saving}>
            <Save className="h-4 w-4" /> Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
