import { Link } from 'react-router-dom';
import { openCookiePreferences } from '../lib/cookies.js';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function Footer({ borderTop = false }) {
  const { isEn } = useLanguage();

  return (
    <footer
      style={{
        padding: '56px clamp(24px, 5vw, 64px)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 20,
        maxWidth: 1440,
        margin: '0 auto',
        borderTop: borderTop ? '1px solid var(--border)' : undefined,
      }}
    >
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, letterSpacing: 1.5 }}>INMERGE — 2026</div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          fontSize: 13,
          color: 'var(--muted)',
          flexWrap: 'wrap',
        }}
      >
        <Link to={isEn ? '/en/cookies' : '/cookies'} style={{ color: 'var(--muted)' }} className="hover-underline-link">
          {isEn ? 'Cookie Policy' : 'Política de Cookies'}
        </Link>
        <span>·</span>
        <button
          type="button"
          onClick={openCookiePreferences}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            color: 'var(--muted)',
            fontSize: 13,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
          className="hover-underline-link"
        >
          {isEn ? 'Cookie Settings' : 'Configurar Cookies'}
        </button>
      </div>

      <div style={{ fontSize: 13, color: 'var(--muted)' }}>inmerge3@gmail.com · Lima, Perú</div>
    </footer>
  );
}
