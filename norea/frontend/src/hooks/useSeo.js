import { useEffect } from 'react';
import { SITE } from '../config/siteConfig';

export function useSeo({ title, description } = {}) {
  useEffect(() => {
    document.title = title ? `${title} | ${SITE.name}` : `${SITE.name} – ${SITE.category} | ${SITE.tagline}`;
    const desc = description || SITE.seoDescription;
    let el = document.head.querySelector('meta[name="description"]');
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute('name', 'description');
      document.head.appendChild(el);
    }
    el.setAttribute('content', desc);
  }, [title, description]);
}
