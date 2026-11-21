import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { settingsService } from '../services';

/** Defaults mirror database/seed.sql so the site renders even before the API responds. */
export const DEFAULT_SETTINGS = {
  institute_name: 'NŌRÉA',
  institute_category: 'Learning & Development',
  logo: '',
  tagline: 'Learn • Express • Grow',
  hero_heading: 'Building Confidence. Nurturing Potential.',
  hero_subheading: 'Discover a better version of yourself with NŌRÉA.',
  hero_image: '/images/hero.jpg',
  about_intro:
    'NŌRÉA is dedicated to helping individuals develop communication skills, confidence, personality, and positive relationships.',
  mission:
    'To empower every learner with the communication skills, confidence and emotional awareness they need to express themselves fully and build meaningful relationships.',
  vision:
    'To be a trusted name in learning and development — where individuals and families discover their potential and grow into their most confident selves.',
  contact_email: '',
  contact_phone: '',
  contact_address: '',
  office_hours: '',
  map_embed_url: '',
  social_instagram: '',
  social_facebook: '',
  social_linkedin: '',
  social_youtube: '',
  social_x: '',
  whatsapp_number: '',
  footer_about:
    'A learning and development institute focused on communication, personality development, confidence building and parenting education.',
  footer_text: 'All rights reserved.',
  seo_description:
    'NŌRÉA – Learning & Development. Spoken English & communication, personality development and parenting programs.',
};

const SettingsContext = createContext({ settings: DEFAULT_SETTINGS, loading: true, reload: () => {} });

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      const res = await settingsService.get();
      const merged = { ...DEFAULT_SETTINGS };
      for (const [k, v] of Object.entries(res.data || {})) {
        // Empty values fall back to defaults only for brand copy, never for contact details.
        if (v !== '' || k.startsWith('contact_') || k.startsWith('social_') || ['logo', 'map_embed_url', 'office_hours', 'whatsapp_number'].includes(k)) {
          merged[k] = v;
        }
      }
      setSettings(merged);
    } catch {
      /* keep defaults */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const value = useMemo(() => ({ settings, loading, reload, setSettings }), [settings, loading, reload]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useSettings = () => useContext(SettingsContext);
