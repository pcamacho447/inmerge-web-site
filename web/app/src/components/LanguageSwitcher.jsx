import { useLanguage } from '../context/LanguageContext.jsx';

export default function LanguageSwitcher({ isLight = true, className = '' }) {
  const { lang, switchLanguage } = useLanguage();

  const containerBg = isLight ? 'rgba(36, 26, 18, 0.06)' : 'rgba(243, 234, 218, 0.12)';
  const containerBorder = isLight ? '1px solid rgba(36, 26, 18, 0.15)' : '1px solid rgba(243, 234, 218, 0.25)';
  const inactiveColor = isLight ? 'var(--ink)' : '#F3EADA';
  const inactiveOpacity = 0.65;

  return (
    <div
      role="group"
      aria-label="Selector de idioma / Language selector"
      className={`lang-switcher-pill ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: containerBg,
        border: containerBorder,
        borderRadius: 9999,
        padding: '2px 3px',
        gap: 2,
        height: 30,
        flexShrink: 0,
        transition: 'all 0.2s ease',
      }}
    >
      <button
        type="button"
        onClick={() => switchLanguage('es')}
        aria-pressed={lang === 'es'}
        aria-label="Español"
        style={{
          border: 'none',
          outline: 'none',
          cursor: 'pointer',
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.05em',
          padding: '3px 9px',
          borderRadius: 9999,
          background: lang === 'es' ? 'var(--terracotta)' : 'transparent',
          color: lang === 'es' ? '#F3EADA' : inactiveColor,
          opacity: lang === 'es' ? 1 : inactiveOpacity,
          boxShadow: lang === 'es' ? '0 1px 4px rgba(168, 71, 43, 0.3)' : 'none',
          transition: 'all 0.18s ease',
        }}
        onMouseEnter={(e) => {
          if (lang !== 'es') e.currentTarget.style.opacity = '1';
        }}
        onMouseLeave={(e) => {
          if (lang !== 'es') e.currentTarget.style.opacity = `${inactiveOpacity}`;
        }}
      >
        ES
      </button>

      <button
        type="button"
        onClick={() => switchLanguage('en')}
        aria-pressed={lang === 'en'}
        aria-label="English"
        style={{
          border: 'none',
          outline: 'none',
          cursor: 'pointer',
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.05em',
          padding: '3px 9px',
          borderRadius: 9999,
          background: lang === 'en' ? 'var(--terracotta)' : 'transparent',
          color: lang === 'en' ? '#F3EADA' : inactiveColor,
          opacity: lang === 'en' ? 1 : inactiveOpacity,
          boxShadow: lang === 'en' ? '0 1px 4px rgba(168, 71, 43, 0.3)' : 'none',
          transition: 'all 0.18s ease',
        }}
        onMouseEnter={(e) => {
          if (lang !== 'en') e.currentTarget.style.opacity = '1';
        }}
        onMouseLeave={(e) => {
          if (lang !== 'en') e.currentTarget.style.opacity = `${inactiveOpacity}`;
        }}
      >
        EN
      </button>
    </div>
  );
}
