import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';

const SITE_URL = (import.meta.env.VITE_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '')).replace(/\/$/, '');

const setMeta = (attr, key, content) => {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
};

const setLink = (rel, href) => {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
};

const setJsonLd = (id, data) => {
  let el = document.getElementById(id);
  if (!data) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement('script');
    el.type = 'application/ld+json';
    el.id = id;
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
};

/**
 * Dynamic page title, meta description, canonical URL, Open Graph & Twitter tags,
 * and optional page-level Schema.org JSON-LD.
 */
export function useSeo({ title, description, image, noindex = false, jsonLd } = {}) {
  const { settings } = useSettings();
  const { pathname } = useLocation();

  useEffect(() => {
    const brand = `${settings.institute_name} – ${settings.institute_category}`;
    const fullTitle = title ? `${title} | ${settings.institute_name}` : `${brand} | ${settings.tagline}`;
    const desc = description || settings.seo_description;
    const url = `${SITE_URL}${pathname}`;
    const img = image ? (image.startsWith('http') ? image : `${SITE_URL}${image}`) : `${SITE_URL}/images/hero.jpg`;

    document.title = fullTitle;
    setMeta('name', 'description', desc);
    setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', desc);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:image', img);
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', desc);
    setMeta('name', 'twitter:image', img);
    setLink('canonical', url);
    setJsonLd('page-jsonld', jsonLd || null);
  }, [title, description, image, noindex, jsonLd, pathname, settings]);
}
