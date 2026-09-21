import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';

/**
 * DirectorsCarousel — Editorial interactive showcase of the 4 Directors & Senior Specialists.
 *
 * Features:
 *   - Pinned Virtual Scroll: scrolling down through the section steps through each director
 *     sequentially (0 -> 1 -> 2 -> 3) before seamlessly resuming page scroll.
 *   - 4 full-depth director profiles with quotes, credentials badges, and focus areas
 *   - Editorial typography and portrait photographs
 *   - Clean client click-driven tab selector that scrolls to the corresponding step
 *   - Accessible with keyboard navigation (ArrowLeft / ArrowRight / Home / End)
 */
export default function DirectorsCarousel() {
  const { lang, content } = useLanguage();
  const isEn = lang === 'en';
  const directors = useMemo(() => content.DIRECTORS || [], [content.DIRECTORS]);
  const N = directors.length;

  const [activeIndex, setActiveIndex] = useState(0);
  const trackRef = useRef(null);
  const isManualJumpRef = useRef(false);

  const goTo = useCallback(
    (idx) => {
      const nextIdx = ((idx % N) + N) % N;
      if (nextIdx === activeIndex) return;

      const isForward = nextIdx > activeIndex || (activeIndex === N - 1 && nextIdx === 0 && N > 2);
      const vtClass = isForward ? 'vt-forward' : 'vt-backward';
      const vtType = isForward ? 'forward' : 'backward';

      const updateState = () => {
        setActiveIndex(nextIdx);
      };

      if (typeof document !== 'undefined' && typeof document.startViewTransition === 'function') {
        document.documentElement.classList.add(vtClass);
        try {
          const transition = document.startViewTransition({
            update: updateState,
            types: [vtType],
          });
          if (transition && transition.finished) {
            transition.finished.finally(() => {
              document.documentElement.classList.remove(vtClass);
            });
          }
        } catch {
          const transition = document.startViewTransition(updateState);
          if (transition && transition.finished) {
            transition.finished.finally(() => {
              document.documentElement.classList.remove(vtClass);
            });
          } else {
            document.documentElement.classList.remove(vtClass);
          }
        }
      } else {
        updateState();
      }

      // Smooth scroll synchronization on Desktop pinned scroll
      if (trackRef.current && typeof window !== 'undefined' && typeof window.scrollTo === 'function' && window.innerWidth > 960) {
        const rect = trackRef.current.getBoundingClientRect();
        const scrollTop = window.scrollY || window.pageYOffset;
        const trackTop = rect.top + scrollTop;
        const totalScrollable = rect.height - window.innerHeight;
        if (totalScrollable > 0) {
          const stepOffset = (totalScrollable / Math.max(N - 1, 1)) * nextIdx;
          isManualJumpRef.current = true;
          try {
            window.scrollTo({
              top: trackTop + stepOffset,
              behavior: 'smooth',
            });
          } catch {
            // jsdom fallback
          }
          setTimeout(() => {
            isManualJumpRef.current = false;
          }, 700);
        }
      }

      // Smooth horizontal scroll into view for active tab on mobile
      if (typeof document !== 'undefined' && typeof window !== 'undefined' && window.innerWidth <= 960) {
        const activeTabEl = document.getElementById(`dir-tab-${directors[nextIdx]?.id}`);
        if (activeTabEl && typeof activeTabEl.scrollIntoView === 'function') {
          try {
            activeTabEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
          } catch {
            // jsdom fallback
          }
        }
      }
    },
    [N, activeIndex, directors],
  );

  const handleNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const handlePrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  // Pinned Virtual Scroll: sync scroll progress within trackRef to activeIndex (Desktop only)
  useEffect(() => {
    if (typeof window === 'undefined' || N <= 1) return;

    let rafId = null;

    const onScroll = () => {
      if (isManualJumpRef.current || !trackRef.current) return;
      if (window.innerWidth <= 960) return; // Native unpinned page scroll on mobile

      const rect = trackRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight || 800;

      const totalScrollable = rect.height - windowHeight;
      if (totalScrollable <= 0) return;

      const currentScrolled = -rect.top;
      const progress = Math.min(Math.max(currentScrolled / totalScrollable, 0), 0.999);
      const computedIndex = Math.min(Math.floor(progress * N), N - 1);

      setActiveIndex((prev) => (prev !== computedIndex ? computedIndex : prev));
    };

    const handleScrollThrottled = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        onScroll();
        rafId = null;
      });
    };

    window.addEventListener('scroll', handleScrollThrottled, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScrollThrottled);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [N]);

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
      ref={trackRef}
      className="directors-carousel"
      role="region"
      aria-label={isEn ? 'Senior Directors Directory' : 'Directorio de Especialistas Senior y Directores'}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="directors-editorial-layout">
        {/* LEFT COLUMN (Sticky): Compact Director Selector List */}
        <aside className="directors-left-nav">
          <div
            className="directors-selector-list"
            role="tablist"
            aria-label={isEn ? 'Select director profile' : 'Seleccionar perfil de director'}
          >
            {directors.map((dir, idx) => {
              const isSelected = idx === activeIndex;
              return (
                <button
                  key={dir.id}
                  id={`dir-tab-${dir.id}`}
                  role="tab"
                  type="button"
                  className={`director-pill-btn ${isSelected ? 'is-active' : ''}`}
                  aria-selected={isSelected}
                  aria-controls={`dir-panel-${dir.id}`}
                  onClick={() => goTo(idx)}
                >
                  <span className="pill-number" style={{ color: isSelected ? dir.accent || 'var(--terracotta)' : 'var(--muted)' }}>
                    {dir.number}
                  </span>
                  <span className="pill-name">{dir.role}</span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* RIGHT COLUMN: Full Director Editorial Showcase on Natural Canvas */}
        <div className="directors-right-canvas">
          {directors.map((dir, idx) => {
            const isActive = idx === activeIndex;
            return (
              <article
                key={dir.id}
                id={`dir-panel-${dir.id}`}
                className={`director-story-panel director-slide-card ${isActive ? 'is-active' : 'is-inactive'}`}
                role="tabpanel"
                aria-labelledby={`dir-tab-${dir.id}`}
                aria-label={`${isEn ? 'Director' : 'Director'} ${dir.number}: ${dir.role}`}
                aria-hidden={!isActive}
              >
                {/* Director Header: Badge, Pillar/Tag, Role Title & Subtitle */}
                <div className="director-header-block">
                  <div className="director-meta-header">
                    <span className="director-number-badge" style={{ color: dir.accent }}>
                      DIR // {dir.number}
                    </span>
                    <span className="director-pillar-badge">{dir.tag || dir.pillar}</span>
                  </div>

                  <h3 className="director-role-title">{dir.role}</h3>
                  <div className="director-subtitle-text">{dir.subtitle}</div>
                  <div className="dir-accent-ruler" style={{ background: dir.accent }} />
                </div>

                {/* Director Content Body: Big Photo + Clean 2-Text Flow */}
                <div className="director-card-grid">
                  {/* Left Column: Enlarged Portrait Photo */}
                  <div className="director-media-col">
                    <div className="director-portrait-card">
                      <div className="director-image-wrapper" style={{ borderColor: dir.accent }}>
                        <img
                          src={dir.photo}
                          alt={dir.role}
                          className="director-portrait-img"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <div className="director-image-corner" style={{ borderColor: dir.accent }} aria-hidden="true" />
                      </div>

                      <div className="director-portrait-meta">
                        <span className="director-meta-code" style={{ color: dir.accent }}>
                          {`INM-DIR-${dir.number} // LIMA-PE`}
                        </span>
                        <span className="director-meta-status">● {isEn ? 'ACTIVE PRINCIPAL' : 'DIRECTOR ACTIVO'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Only Description and Quote on Natural Canvas */}
                  <div className="director-info-col">
                    <p className="director-desc-text">{dir.desc}</p>

                    <blockquote className="director-quote-box" style={{ borderLeftColor: dir.accent }}>
                      <p className="director-quote-text">&ldquo;{dir.quote}&rdquo;</p>
                    </blockquote>
                  </div>
                </div>

                {/* Decorative background diamond */}
                <div className="director-slide-diamond" aria-hidden="true" style={{ background: dir.accent }} />
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
