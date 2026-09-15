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

function setSchemaJson(schemaData) {
  let tag = document.querySelector('script#inmerge-page-schema');
  if (!schemaData) {
    if (tag) tag.remove();
    return;
  }
  if (!tag) {
    tag = document.createElement('script');
    tag.setAttribute('type', 'application/ld+json');
    tag.setAttribute('id', 'inmerge-page-schema');
    document.head.appendChild(tag);
  }
  tag.textContent = typeof schemaData === 'string' ? schemaData : JSON.stringify(schemaData);
}

// Sets per-page <title>/meta description/OG/Twitter tags/canonical/JSON-LD on mount.
export default function useDocumentHead({ title, description, path = '/', image, noIndex = false, schemaJson = null }) {
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
    if (image) {
      const imageUrl = `${SITE_URL}${image}`;
      setMeta('property', 'og:image', imageUrl);
      setMeta('name', 'twitter:image', imageUrl);
    }
    setMeta('name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow');
    setSchemaJson(schemaJson);

    return () => {
      // Clean up dynamic schema when unmounting page
      if (schemaJson) {
        const tag = document.querySelector('script#inmerge-page-schema');
        if (tag) tag.remove();
      }
    };
  }, [title, description, path, image, noIndex, schemaJson]);
}

