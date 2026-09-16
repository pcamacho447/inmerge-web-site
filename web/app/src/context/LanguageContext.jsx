import { createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as esContent from '../data/content.js';
import * as enContent from '../data/content.en.js';
import * as esStack from '../data/stack.js';
import * as enStack from '../data/stack.en.js';

const LanguageContext = createContext(null);

export const STORAGE_KEY = 'inmerge_preferred_lang';

// Bi-directional route translation mapping
export const ROUTE_MAP = {
  esToEn: {
    '/': '/en',
    '/servicios': '/en/services',
    '/nosotros': '/en/about',
    '/contacto': '/en/contact',
    '/cookies': '/en/cookies',
    '/politica-cookies': '/en/cookies',
  },
  enToEs: {
    '/en': '/',
    '/en/': '/',
    '/en/services': '/servicios',
    '/en/about': '/nosotros',
    '/en/contact': '/contacto',
    '/en/cookies': '/cookies',
  },
};

export function getEquivalentPath(targetLang, currentPath) {
  const normalized = currentPath.endsWith('/') && currentPath.length > 1 ? currentPath.slice(0, -1) : currentPath;

  if (targetLang === 'en') {
    if (normalized.startsWith('/en')) return normalized;
    return ROUTE_MAP.esToEn[normalized] || '/en';
  } else {
    if (!normalized.startsWith('/en')) return normalized;
    return ROUTE_MAP.enToEs[normalized] || '/';
  }
}

export function LanguageProvider({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  const isEn = location.pathname.startsWith('/en');
  const lang = isEn ? 'en' : 'es';

  // Synchronize <html> lang attribute with the current route
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  // Gentle first-visit redirection on root '/'
  useEffect(() => {
    if (location.pathname === '/') {
      const storedPref = localStorage.getItem(STORAGE_KEY);
      if (!storedPref && typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('en')) {
        navigate('/en', { replace: true });
      }
    }
  }, [location.pathname, navigate]);

  const switchLanguage = useCallback(
    (targetLang) => {
      if (targetLang === lang) return;
      try {
        localStorage.setItem(STORAGE_KEY, targetLang);
      } catch {
        // localStorage may be unavailable in private mode
      }

      const nextPath = getEquivalentPath(targetLang, location.pathname);
      if (typeof document !== 'undefined' && typeof document.startViewTransition === 'function') {
        document.startViewTransition(() => {
          navigate(nextPath);
        });
      } else {
        navigate(nextPath);
      }
    },
    [lang, location.pathname, navigate],
  );

  const content = useMemo(() => (isEn ? enContent : esContent), [isEn]);
  const stack = useMemo(() => (isEn ? enStack : esStack), [isEn]);

  const value = useMemo(
    () => ({
      lang,
      isEn,
      switchLanguage,
      content,
      stack,
      getEquivalentPath,
    }),
    [lang, isEn, switchLanguage, content, stack],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    // Fallback if rendered outside LanguageProvider (e.g. isolated test environments)
    return {
      lang: 'es',
      isEn: false,
      switchLanguage: () => {},
      content: esContent,
      stack: esStack,
      getEquivalentPath: (target) => (target === 'en' ? '/en' : '/'),
    };
  }
  return context;
}
