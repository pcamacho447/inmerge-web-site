import { useEffect } from 'react';
import { SITE_URL } from '../data/content.js';

function setMeta(attr, key, content) {
  let tag = document.querySelector(`meta[${attr}="${key}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function setCanonical(href) {
  let tag = document.querySelector('link[rel="canonical"]');
  if (!tag) {
    tag = document.createElement('link');
    tag.setAttribute('rel', 'canonical');
    document.head.appendChild(tag);
  }
  tag.setAttribute('href', href);
}

// Sets per-page <title>/meta description/OG/Twitter tags/canonical on mount.
// Client-side only — fine for Googlebot (executes JS) and for the browser
// tab/history title, but social-link-preview crawlers (WhatsApp, Facebook,
// Twitter) do NOT run JS, so shared links always show the static OG tags
// from index.html regardless of which route was shared. True per-page social
// cards would need prerendering/SSG, which this app doesn't have.
//
// `noIndex` is always written explicitly (not just when true) — the robots
// meta tag persists across client-side navigations, so a page that doesn't
// pass noIndex must still overwrite whatever a previously-visited page (e.g.
// the 404) left behind, or it would inherit that page's noindex by accident.
export default function useDocumentHead({ title, description, path = '/', noIndex = false }) {
  useEffect(() => {
    if (title) {
      document.title = title;
      setMeta('property', 'og:title', title);
      setMeta('name', 'twitter:title', title);
    }
    if (description) {
      setMeta('name', 'description', description);
      setMeta('property', 'og:description', description);
      setMeta('name', 'twitter:description', description);
    }
    const url = `${SITE_URL}${path}`;
    setMeta('property', 'og:url', url);
    setCanonical(url);
    setMeta('name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow');
  }, [title, description, path, noIndex]);
}
