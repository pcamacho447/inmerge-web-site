import { useState, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';

/**
 * DirectorsCarousel — Editorial interactive showcase of the 4 Directors & Senior Specialists.
 *
 * Features:
 *   - 4 full-depth director profiles with quotes, credentials badges, and focus areas
 *   - Editorial typography (Spectral + IBM Plex Mono)
 *   - Clean client click-driven tab selector
 *   - Accessible with keyboard navigation (ArrowLeft / ArrowRight / Home / End)
 */
export default function DirectorsCarousel() {
  const { lang, content } = useLanguage();
  const isEn = lang === 'en';
  const directors = content.DIRECTORS || [];
  const N = directors.length;

  const [activeIndex, setActiveIndex] = useState(0);

  const goTo = useCallback(
    (idx) => {
      setActiveIndex(((idx % N) + N) % N);
    },
    [N],
  );

  const handleNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const handlePrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handlePrev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleNext();
    } else if (e.key === 'Home') {
      e.preventDefault();
      goTo(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      goTo(N - 1);
    }
  };

  if (!directors.length) return null;

  return (
    <section
      className="directors-carousel"
      role="region"
      aria-label={isEn ? 'Senior Directors Directory' : 'Directorio de Especialistas Senior y Directores'}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Quick Director Selector Tabs (Pills) */}
      <div
        className="directors-selector-bar"
        role="tablist"
        aria-label={isEn ? 'Select director profile' : 'Seleccionar perfil de director'}
      >
        {directors.map((dir, idx) => {
          const isSelected = idx === activeIndex;
          return (
            <button
              key={dir.id}
              role="tab"
              type="button"
              className={`director-pill-btn ${isSelected ? 'is-active' : ''}`}
              aria-selected={isSelected}
              onClick={() => goTo(idx)}
              style={{
                borderColor: isSelected ? dir.accent : 'var(--border)',
                background: isSelected ? 'var(--ink)' : 'var(--bg)',
                color: isSelected ? '#F3EADA' : 'var(--ink)',
              }}
            >
              <span className="pill-number" style={{ color: isSelected ? dir.accent : 'var(--terracotta)' }}>
                {dir.number}
              </span>
              <span className="pill-name">{dir.role}</span>
            </button>
          );
        })}
      </div>

      {/* Main Director Slide Canvas */}
      <div className="directors-canvas-viewport">
        {directors.map((dir, idx) => {
          const isActive = idx === activeIndex;
          return (
            <article
              key={dir.id}
              className={`director-slide-card ${isActive ? 'is-active' : 'is-inactive'}`}
              role="tabpanel"
              aria-label={`${isEn ? 'Director' : 'Director'} ${dir.number}: ${dir.role}`}
              aria-hidden={!isActive}
            >
              <div className="director-card-grid">
                {/* Left Column: Role, Name, Pillar Tag & Quote */}
                <div className="director-info-col">
                  <div className="director-meta-header">
                    <span className="director-number-badge" style={{ color: dir.accent, borderColor: dir.accent }}>
                      DIR // {dir.number}
                    </span>
                    <span className="director-pillar-badge">{dir.pillar}</span>
                  </div>

                  <h3 className="director-role-title">{dir.role}</h3>
                  <div className="director-subtitle-text">{dir.subtitle}</div>

                  <p className="director-desc-text">{dir.desc}</p>

                  {/* Strategic quote block */}
                  <blockquote className="director-quote-box" style={{ borderLeftColor: dir.accent }}>
                    <p className="director-quote-text">“{dir.quote}”</p>
                  </blockquote>
                </div>

                {/* Right Column: Key Credentials & Technical Directorship Highlights */}
                <div className="director-credentials-col">
                  <div className="credentials-box-header">
                    <span className="credentials-eyebrow" style={{ color: dir.accent }}>
                      {dir.tag}
                    </span>
                    <h4 className="credentials-title">{isEn ? 'Specialized Credentials & Focus' : 'Credenciales & Áreas de Foco'}</h4>
                  </div>

                  <ul className="director-credentials-list">
                    {dir.credentials.map((cred, cIdx) => (
                      <li key={cIdx} className="director-credential-item">
                        <span className="cred-bullet" style={{ background: dir.accent }} />
                        <span className="cred-text">{cred}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="director-guarantee-note">
                    <span className="guarantee-icon">⚖</span>
                    <span className="guarantee-text">
                      {isEn
                        ? 'Direct technical partnership: Led, audited, and executed without commercial intermediaries.'
                        : 'Trato directo: Liderazgo, auditoría e implementación técnica sin intermediarios comerciales.'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Decorative background diamond */}
              <div className="director-slide-diamond" aria-hidden="true" style={{ background: dir.accent }} />
            </article>
          );
        })}
      </div>
    </section>
  );
}
