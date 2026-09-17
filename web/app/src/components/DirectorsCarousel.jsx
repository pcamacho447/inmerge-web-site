import { useState, useRef, useEffect, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';

/**
 * DirectorsCarousel — Cinematic editorial carousel showcasing the 4 Directors & Senior Specialists.
 *
 * Features:
 *   - 4 full-depth director profiles with quotes, credentials badges, and focus areas
 *   - Editorial typography (Spectral + IBM Plex Mono)
 *   - Mouse drag & touch swipe support (horizontal delta threshold)
 *   - Segmented selector tabs & progress indicators
 *   - Fully accessible with keyboard navigation (ArrowLeft / ArrowRight)
 *   - No play button (clean editorial aesthetics)
 */
export default function DirectorsCarousel() {
  const { lang, content } = useLanguage();
  const isEn = lang === 'en';
  const directors = content.DIRECTORS || [];
  const N = directors.length;

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const intervalRef = useRef(null);

  const goTo = useCallback(
    (idx) => {
      setActiveIndex(((idx % N) + N) % N);
    },
    [N],
  );

  const handleNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const handlePrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  // Autoplay (7.5s editorial pacing) — pauses on hover/focus/drag
  useEffect(() => {
    if (isPaused || isDragging || N <= 1) return;
    intervalRef.current = setInterval(handleNext, 7500);
    return () => clearInterval(intervalRef.current);
  }, [isPaused, isDragging, handleNext, N]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handlePrev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleNext();
    }
  };

  // Mouse drag support
  const mouseStartX = useRef(0);
  const isMouseDown = useRef(false);

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    isMouseDown.current = true;
    mouseStartX.current = e.clientX;
    setIsDragging(true);
  };

  const handleMouseMove = () => {
    // tracking drag
  };

  const handleMouseUp = (e) => {
    if (!isMouseDown.current) return;
    isMouseDown.current = false;
    setIsDragging(false);
    const deltaX = e.clientX - mouseStartX.current;
    if (deltaX < -45) {
      handleNext();
    } else if (deltaX > 45) {
      handlePrev();
    }
  };

  const handleMouseLeave = (e) => {
    if (isMouseDown.current) {
      isMouseDown.current = false;
      setIsDragging(false);
      const deltaX = e.clientX - mouseStartX.current;
      if (deltaX < -45) {
        handleNext();
      } else if (deltaX > 45) {
        handlePrev();
      }
    }
    setIsPaused(false);
  };

  // Touch swipe support
  const touchStartX = useRef(0);
  const handleTouchStart = (e) => {
    if (e.touches.length > 0) touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e) => {
    if (e.changedTouches.length === 0) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (deltaX < -45) handleNext();
    else if (deltaX > 45) handlePrev();
  };

  if (!directors.length) return null;

  return (
    <section
      className={`directors-carousel ${isDragging ? 'is-dragging' : ''}`}
      role="region"
      aria-roledescription="carousel"
      aria-label={isEn ? 'Senior Directors Directory' : 'Directorio de Especialistas Senior y Directores'}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={handleMouseLeave}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onKeyDown={handleKeyDown}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      tabIndex={0}
      style={{ cursor: isDragging ? 'grabbing' : 'grab', userSelect: isDragging ? 'none' : 'auto' }}
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
              role="group"
              aria-roledescription="slide"
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

      {/* Footer Controls: Arrows + Segmented Progress Bar */}
      <div className="directors-controls-bar" aria-label={isEn ? 'Director controls' : 'Controles de directores'}>
        <button
          type="button"
          className="directors-arrow directors-arrow--prev"
          onClick={handlePrev}
          aria-label={isEn ? 'Previous director profile' : 'Perfil de director anterior'}
        >
          ←
        </button>

        {/* Segmented progress bar */}
        <div className="directors-progress-bar" role="group" aria-label={isEn ? 'Director progress' : 'Progreso de directores'}>
          {directors.map((dir, idx) => (
            <button
              key={dir.id}
              type="button"
              className={`directors-progress-segment ${idx === activeIndex ? 'is-active' : ''}`}
              onClick={() => goTo(idx)}
              aria-label={`${isEn ? 'Go to director' : 'Ir a director'} ${dir.number}`}
              aria-current={idx === activeIndex ? 'true' : 'false'}
            >
              <span className="segment-fill" style={{ background: dir.accent }} />
            </button>
          ))}
        </div>

        <button
          type="button"
          className="directors-arrow directors-arrow--next"
          onClick={handleNext}
          aria-label={isEn ? 'Next director profile' : 'Siguiente perfil de director'}
        >
          →
        </button>
      </div>
    </section>
  );
}
