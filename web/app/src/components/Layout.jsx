import { useCallback, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Preloader from './Preloader.jsx';
import Nav from './Nav.jsx';
import MobileMenu from './MobileMenu.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function Layout() {
  const [preloaderDone, setPreloaderDone] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isEn } = useLanguage();
  const { pathname } = useLocation();
  const isHome = pathname === '/' || pathname === '/en';

  useEffect(() => {
    // Reduced-motion users get no preloader intro at all — it's a branded
    // animation with no functional purpose, so the honest move is to skip it.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setPreloaderDone(true);
      return undefined;
    }

    // Tied to real page-load readiness instead of a blind fixed delay: a
    // minimum display time avoids a jarring flash on fast/cached loads, a
    // maximum cap avoids hanging forever if 'load' is slow to fire.
    const MIN_DISPLAY_MS = 400;
    const MAX_WAIT_MS = 2500;
    const start = performance.now();
    let finished = false;

    function finish() {
      if (finished) return;
      finished = true;
      const remaining = Math.max(0, MIN_DISPLAY_MS - (performance.now() - start));
      setTimeout(() => setPreloaderDone(true), remaining);
    }

    if (document.readyState === 'complete') {
      finish();
    } else {
      window.addEventListener('load', finish);
    }
    const maxTimer = setTimeout(finish, MAX_WAIT_MS);

    return () => {
      window.removeEventListener('load', finish);
      clearTimeout(maxTimer);
    };
  }, []);

  const toggleMenu = useCallback(() => setMobileMenuOpen((v) => !v), []);
  const closeMenu = useCallback(() => setMobileMenuOpen(false), []);

  return (
    <div style={{ fontFamily: "'IBM Plex Sans',sans-serif", background: 'var(--bg)', color: 'var(--ink)' }}>
      <a href="#main-content" className="skip-to-content">
        {isEn ? 'Skip to main content' : 'Saltar al contenido principal'}
      </a>
      <Preloader done={preloaderDone} />
      <Nav mobileMenuOpen={mobileMenuOpen} onToggleMenu={toggleMenu} />
      {mobileMenuOpen && <MobileMenu onClose={closeMenu} />}
      <main id="main-content" tabIndex="-1" style={{ outline: 'none', paddingTop: isHome ? 0 : '72px' }}>
        <Outlet />
      </main>
    </div>
  );
}
