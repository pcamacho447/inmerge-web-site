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

function setHreflang(lang, href) {
  let tag = document.querySelector(`link[rel="alternate"][hreflang="${lang}"]`);
  if (!tag) {
    tag = document.createElement('link');
    tag.setAttribute('rel', 'alternate');
    tag.setAttribute('hreflang', lang);
    document.head.appendChild(tag);
  }
  tag.setAttribute('href', href);
}

const CANONICAL_PAIRS = {
  '/': { es: '/', en: '/en' },
  '/en': { es: '/', en: '/en' },
  '/servicios': { es: '/servicios', en: '/en/services' },
  '/en/services': { es: '/servicios', en: '/en/services' },
  '/nosotros': { es: '/nosotros', en: '/en/about' },
  '/en/about': { es: '/nosotros', en: '/en/about' },
  '/contacto': { es: '/contacto', en: '/en/contact' },
  '/en/contact': { es: '/contacto', en: '/en/contact' },
  '/cookies': { es: '/cookies', en: '/en/cookies' },
  '/en/cookies': { es: '/cookies', en: '/en/cookies' },
};

// Sets per-page <title>/meta description/OG/Twitter tags/canonical/hreflang/JSON-LD on mount.
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

    // International Open Graph locales
    const isEnPath = path.startsWith('/en');
    setMeta('property', 'og:locale', isEnPath ? 'en_US' : 'es_PE');
    setMeta('property', 'og:locale:alternate', isEnPath ? 'es_PE' : 'en_US');

    // International SEO: hreflang tags
    const pairs = CANONICAL_PAIRS[path];
    if (pairs) {
      setHreflang('es', `${SITE_URL}${pairs.es}`);
      setHreflang('en', `${SITE_URL}${pairs.en}`);
      setHreflang('x-default', `${SITE_URL}${pairs.es}`);
    }

    if (image) {
      const imageUrl = `${SITE_URL}${image}`;
      setMeta('property', 'og:image', imageUrl);
      setMeta('name', 'twitter:image', imageUrl);
    }
    setMeta('name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow');

    // Attach inLanguage to schemaJson if it's an object and not already specified
    let finalSchema = schemaJson;
    if (schemaJson && typeof schemaJson === 'object' && !Array.isArray(schemaJson)) {
      finalSchema = {
        inLanguage: isEnPath ? 'en-US' : 'es-PE',
        ...schemaJson,
      };
    }
    setSchemaJson(finalSchema);

    return () => {
      // Clean up dynamic schema when unmounting page
      if (schemaJson) {
        const tag = document.querySelector('script#inmerge-page-schema');
        if (tag) tag.remove();
      }
    };
  }, [title, description, path, image, noIndex, schemaJson]);
}
