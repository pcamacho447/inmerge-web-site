import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth.jsx';
import { NAV_LINKS } from '../data/content.js';

export default function Nav({ mobileMenuOpen, onToggleMenu }) {
  const { pathname } = useLocation();
  const { user } = useAuth();

  const accountPath = user ? (user.isStaff ? '/equipo' : '/cuenta') : '/login';
  const accountLabel = user ? (user.isStaff ? 'Panel Equipo' : 'Mi cuenta') : 'Iniciar sesión';

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        background: 'rgba(243,234,218,0.9)',
        backdropFilter: 'blur(6px)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 24,
        padding: '18px clamp(20px,5vw,40px)',
      }}
    >
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, color: 'var(--ink)' }}>
        <div style={{ width: 12, height: 12, background: 'var(--terracotta)', transform: 'rotate(45deg)' }} />
        <div style={{ fontFamily: "'Spectral',serif", fontWeight: 700, fontSize: 18, letterSpacing: 1.5 }}>INMERGE</div>
      </Link>

      <div
        className="nav-desktop"
        style={{ gap: 28, fontSize: 14, flex: 1, minWidth: 0, overflowX: 'auto', padding: '2px 0', alignItems: 'center' }}
      >
        {NAV_LINKS.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="link-hover"
            style={{ color: 'var(--ink)', fontWeight: pathname === link.to ? 600 : 400, flexShrink: 0, whiteSpace: 'nowrap' }}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <Link
        to={accountPath}
        className="nav-desktop btn-hover"
        style={{
          background: 'var(--ink)',
          color: 'var(--bg)',
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
        }}
      >
        {user?.isStaff && (
          <span
            style={{
              fontSize: 10,
              background: 'var(--terracotta)',
              color: '#fff',
              padding: '1px 5px',
              borderRadius: 3,
              fontFamily: "'IBM Plex Mono', monospace",
            }}
          >
            STAFF
          </span>
        )}
        <span>{accountLabel}</span>
      </Link>

      <button
        type="button"
        className="nav-mobile-toggle icon-btn-hover"
        onClick={onToggleMenu}
        aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
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
        <div style={{ width: 22, height: 2, background: 'var(--ink)' }} />
        <div style={{ width: 22, height: 2, background: 'var(--ink)' }} />
        <div style={{ width: 22, height: 2, background: 'var(--ink)' }} />
      </button>
    </nav>
  );
}
