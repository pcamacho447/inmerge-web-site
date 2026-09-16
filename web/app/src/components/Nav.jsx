import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import LanguageSwitcher from './LanguageSwitcher.jsx';

export default function Nav({ mobileMenuOpen, onToggleMenu }) {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const { isEn, content } = useLanguage();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isHome = pathname === '/' || pathname === '/en';
  const isTransparent = isHome && !scrolled;

  const accountPath = user ? (user.isStaff ? '/equipo' : '/cuenta') : '/login';
  const accountLabel = user
    ? user.isStaff
      ? isEn
        ? 'Staff Panel'
        : 'Panel Equipo'
      : isEn
        ? 'My Account'
        : 'Mi cuenta'
    : isEn
      ? 'Sign in'
      : 'Iniciar sesión';

  // Dynamic theme colors based on route and scroll position
  const navBg = isHome ? (scrolled ? 'rgba(36, 26, 18, 0.92)' : 'transparent') : 'rgba(243, 234, 218, 0.9)';

  const navBorder = isHome ? (scrolled ? '1px solid rgba(243, 234, 218, 0.15)' : 'none') : '1px solid var(--border)';

  const textColor = isHome ? '#F3EADA' : 'var(--ink)';
  const activeColor = isHome ? 'var(--gold)' : 'var(--terracotta)';

  const buttonBg = isHome ? 'var(--terracotta)' : 'var(--ink)';
  const buttonColor = isHome ? '#F3EADA' : 'var(--bg)';
  const burgerColor = isHome ? '#F3EADA' : 'var(--ink)';

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 30,
        marginBottom: isHome ? '-76px' : 0,
        background: navBg,
        backdropFilter: isTransparent ? 'none' : 'blur(8px)',
        WebkitBackdropFilter: isTransparent ? 'none' : 'blur(8px)',
        borderBottom: navBorder,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 20,
        padding: '18px clamp(20px,5vw,40px)',
        transition: 'background 0.3s ease, border-color 0.3s ease, backdrop-filter 0.3s ease',
      }}
    >
      <Link
        to={isEn ? '/en' : '/'}
        style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, color: textColor, textDecoration: 'none' }}
      >
        <div style={{ width: 12, height: 12, background: 'var(--terracotta)', transform: 'rotate(45deg)' }} />
        <div style={{ fontFamily: "'Spectral',serif", fontWeight: 700, fontSize: 18, letterSpacing: 1.5, color: textColor }}>INMERGE</div>
      </Link>

      <div
        className="nav-desktop"
        style={{ gap: 28, fontSize: 14, flex: 1, minWidth: 0, overflowX: 'auto', padding: '2px 0', alignItems: 'center' }}
      >
        {content.NAV_LINKS.map((link) => {
          const isActive = pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className="link-hover"
              style={{
                color: isActive ? activeColor : textColor,
                fontWeight: isActive ? 600 : 400,
                flexShrink: 0,
                whiteSpace: 'nowrap',
                transition: 'color 0.2s ease',
              }}
            >
              {link.label}
            </Link>
          );
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
        <div className="nav-desktop">
          <LanguageSwitcher isLight={!isHome || scrolled} />
        </div>

        <Link
          to={accountPath}
          className="nav-desktop btn-hover"
          style={{
            background: buttonBg,
            color: buttonColor,
            borderRadius: 20,
            padding: '9px 20px',
            fontSize: 13,
            fontWeight: 600,
            flexShrink: 0,
            whiteSpace: 'nowrap',
            display: 'inline-flex',
            alignItems: 'center',
            textDecoration: 'none',
            gap: 6,
            boxShadow: isHome && isTransparent ? '0 2px 10px rgba(0,0,0,0.2)' : 'none',
            transition: 'all 0.2s ease',
          }}
        >
          {user?.isStaff && (
            <span
              style={{
                fontSize: 10,
                background: isHome ? 'var(--gold)' : 'var(--terracotta)',
                color: isHome ? 'var(--ink)' : '#fff',
                padding: '1px 5px',
                borderRadius: 3,
                fontFamily: "'IBM Plex Mono', monospace",
                fontWeight: 700,
              }}
            >
              STAFF
            </span>
          )}
          <span>{accountLabel}</span>
        </Link>
      </div>

      <button
        type="button"
        className="nav-mobile-toggle icon-btn-hover"
        onClick={onToggleMenu}
        aria-label={mobileMenuOpen ? (isEn ? 'Close menu' : 'Cerrar menú') : isEn ? 'Open menu' : 'Abrir menú'}
        aria-expanded={mobileMenuOpen}
        aria-controls="mobile-menu"
        style={{
          width: 44,
          height: 44,
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 5,
          cursor: 'pointer',
          flexShrink: 0,
          background: 'none',
          border: 'none',
          font: 'inherit',
          padding: 0,
        }}
      >
        <div style={{ width: 22, height: 2, background: burgerColor, transition: 'background 0.2s ease' }} />
        <div style={{ width: 22, height: 2, background: burgerColor, transition: 'background 0.2s ease' }} />
        <div style={{ width: 22, height: 2, background: burgerColor, transition: 'background 0.2s ease' }} />
      </button>
    </nav>
  );
}
