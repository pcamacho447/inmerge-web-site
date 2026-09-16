import { Link } from 'react-router-dom';
import useOverlay from '../hooks/useOverlay.js';
import { useAuth } from '../lib/auth.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import LanguageSwitcher from './LanguageSwitcher.jsx';

export default function MobileMenu({ onClose }) {
  const containerRef = useOverlay(true, onClose);
  const { user } = useAuth();
  const { isEn, content } = useLanguage();

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

  return (
    <div
      id="mobile-menu"
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label={isEn ? 'Main menu' : 'Menú principal'}
      tabIndex={-1}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 150,
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 28px 40px',
        overflowY: 'auto',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 12, height: 12, background: 'var(--terracotta)', transform: 'rotate(45deg)' }} />
          <div style={{ fontFamily: "'Spectral',serif", fontWeight: 700, fontSize: 18, letterSpacing: 1.5 }}>INMERGE</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <LanguageSwitcher isLight={true} />
          <button
            type="button"
            onClick={onClose}
            aria-label={isEn ? 'Close menu' : 'Cerrar menú'}
            className="icon-btn-hover"
            style={{
              width: 44,
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative',
              background: 'none',
              border: 'none',
              font: 'inherit',
              padding: 0,
            }}
          >
            <div style={{ width: 22, height: 2, background: 'var(--ink)', transform: 'rotate(45deg)', position: 'absolute' }} />
            <div style={{ width: 22, height: 2, background: 'var(--ink)', transform: 'rotate(-45deg)', position: 'absolute' }} />
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {content.NAV_LINKS.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            onClick={onClose}
            className="row-hover"
            style={{
              fontFamily: "'Spectral',serif",
              fontWeight: 600,
              fontSize: 22,
              color: 'var(--ink)',
              padding: '18px 0',
              borderTop: '1px solid var(--border)',
            }}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <Link
        to={accountPath}
        onClick={onClose}
        className="btn-hover"
        style={{
          marginTop: 'auto',
          background: 'var(--ink)',
          color: 'var(--bg)',
          textAlign: 'center',
          borderRadius: 2,
          padding: 18,
          fontSize: 16,
          fontWeight: 700,
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        {user?.isStaff && (
          <span
            style={{
              fontSize: 11,
              background: 'var(--terracotta)',
              color: '#fff',
              padding: '2px 6px',
              borderRadius: 3,
              fontFamily: "'IBM Plex Mono', monospace",
            }}
          >
            STAFF
          </span>
        )}
        <span>{accountLabel}</span>
      </Link>
    </div>
  );
}
