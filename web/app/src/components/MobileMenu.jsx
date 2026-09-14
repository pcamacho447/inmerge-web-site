import { Link } from 'react-router-dom';
import useOverlay from '../hooks/useOverlay.js';
import { useAuth } from '../lib/auth.jsx';
import { NAV_LINKS, waLink } from '../data/content.js';

export default function MobileMenu({ onClose }) {
  const containerRef = useOverlay(true, onClose);
  const { user } = useAuth();

  return (
    <div
      id="mobile-menu"
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label="Menú principal"
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
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar menú"
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
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {NAV_LINKS.map((link) => (
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
        {user?.isStaff && (
          <Link
            to="/equipo"
            onClick={onClose}
            className="row-hover"
            style={{
              fontFamily: "'Spectral',serif",
              fontWeight: 600,
              fontSize: 22,
              color: 'var(--terracotta)',
              padding: '18px 0',
              borderTop: '1px solid var(--border)',
            }}
          >
            Panel Equipo [STAFF]
          </Link>
        )}
        <Link
          to={user ? (user.isStaff ? '/equipo' : '/cuenta') : '/login'}
          onClick={onClose}
          className="row-hover"
          style={{
            fontFamily: "'Spectral',serif",
            fontWeight: 600,
            fontSize: 22,
            color: 'var(--ink)',
            padding: '18px 0',
            borderTop: '1px solid var(--border)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          {user ? (user.isStaff ? 'Portal de Clientes' : 'Mi cuenta') : 'Iniciar sesión'}
        </Link>
      </div>
      <a
        href={waLink('Hola, quiero conversar sobre datos con Inmerge.')}
        target="_blank"
        rel="noreferrer"
        className="btn-hover"
        style={{
          marginTop: 'auto',
          background: 'var(--terracotta)',
          color: 'var(--bg)',
          textAlign: 'center',
          borderRadius: 2,
          padding: 18,
          fontSize: 16,
          fontWeight: 700,
        }}
      >
        Escríbenos por WhatsApp
      </a>
    </div>
  );
}
