import { useState, useRef, useEffect, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';

/**
 * ManifestoCarousel — Cinematic editorial full-width carousel for /nosotros.
 *
 * Features:
 *   - Full-viewport editorial slides with alternating dark/light backgrounds
 *   - Fade + Scale transitions
 *   - Spectral serif-dominant typography
 *   - Horizontal segmented progress bar
 *   - Mouse drag & touch swipe support (horizontal delta threshold)
 *   - Autoplay pauses on hover/focus/drag
 *   - WCAG 2.1 AA accessible keyboard navigation & aria tags
 */

const SLIDES_ES = [
  {
    id: 'tested-infra',
    eyebrow: 'PRINCIPIO DE ASEGURAMIENTO',
    title: 'Código Probado, Infraestructura Infalible',
    body: 'Cada módulo cuenta con suites de pruebas unitarias y de integración automáticas para garantizar cero regresiones. Control de acceso granular con Row Level Security (RLS), cifrado de datos en reposo y en tránsito sobre AWS.',
    accent: 'var(--terracotta)',
    theme: 'dark',
    tag: '01 — CI/CD & SEGURIDAD',
  },
  {
    id: 'traceable-sovereign',
    eyebrow: 'PRINCIPIO DE ASEGURAMIENTO',
    title: 'Cada Dato Rastreable, Sin Ataduras',
    body: 'Pipelines declarativos de datos donde cada transformación es rastreable desde la fuente de origen hasta la interfaz. Sin ataduras a plataformas propietarias: arquitectura desplegada en las cuentas cloud de tu propia organización.',
    accent: 'var(--gold)',
    theme: 'dark',
    tag: '02 — REPRODUCIBILIDAD & SOBERANÍA',
  },
  {
    id: 'archetype',
    eyebrow: 'ARQUETIPO',
    title: 'El Ingeniero & Auditor Estratégico',
    body: null,
    accent: 'var(--terracotta)',
    theme: 'light',
    tag: 'IDENTIDAD INMERGE',
    isArchetype: true,
    isBlock: 'Experto que audita, programa y explica; riguroso con los números y transparente con el código.',
    notBlock: 'Vendedor comisionista, teórico desconectado de la implementación ni consultora de diapositivas vacías.',
  },
  {
    id: 'why-inmerge',
    eyebrow: 'DIFERENCIAL',
    title: 'Por Qué Inmerge',
    body: null,
    accent: 'var(--gold)',
    theme: 'dark',
    tag: 'INMERGE VS. EL MERCADO',
    isComparative: true,
    competitors: [
      {
        label: 'CONSULTORAS GENERALISTAS',
        text: 'Entregan diagnósticos en diapositivas pero no tienen capacidad técnica para construir o auditar el código fuente.',
      },
      {
        label: 'SOFTWARE FACTORIES GENÉRICAS',
        text: 'Construyen interfaces sin criterio de auditoría de datos, gobernanza ni modelos predictivos matemáticos.',
      },
    ],
    inmerge: 'Auditoría rigurosa, ingeniería de software en la nube y ciencia de datos avanzada ejecutadas por el mismo equipo senior.',
  },
  {
    id: 'manifesto',
    eyebrow: 'DECLARACIÓN',
    title: 'Manifiesto de Aseguramiento',
    body: 'Las decisiones operativas y estratégicas de alto nivel no pueden depender de hojas de cálculo aisladas ni de sistemas opacos: requieren arquitectura sólida, datos auditables y código verificable.',
    accent: 'var(--terracotta)',
    theme: 'dark',
    tag: 'NUESTRO COMPROMISO',
  },
];

const SLIDES_EN = [
  {
    id: 'tested-infra',
    eyebrow: 'ENGINEERING ASSURANCE',
    title: 'Tested Code, Resilient Infrastructure',
    body: 'Every software module is validated with automated unit and integration suites to guarantee zero regression. Granular access control with Row Level Security (RLS), full data encryption at rest and in transit across AWS.',
    accent: 'var(--terracotta)',
    theme: 'dark',
    tag: '01 — CI/CD & SECURITY',
  },
  {
    id: 'traceable-sovereign',
    eyebrow: 'ENGINEERING ASSURANCE',
    title: 'Every Data Point Traceable, Zero Lock-In',
    body: 'Declarative, idempotent pipelines where each calculation is traced from raw ingestion to client dashboards. Zero proprietary vendor lock-in: infrastructure provisioned directly within your own corporate cloud accounts.',
    accent: 'var(--gold)',
    theme: 'dark',
    tag: '02 — REPRODUCIBILITY & SOVEREIGNTY',
  },
  {
    id: 'archetype',
    eyebrow: 'ARCHETYPE',
    title: 'The Strategic Engineer & Auditor',
    body: null,
    accent: 'var(--terracotta)',
    theme: 'light',
    tag: 'INMERGE IDENTITY',
    isArchetype: true,
    isBlock: 'Hands-on specialists who audit, write code, and communicate clearly; rigorous with numbers and transparent with code.',
    notBlock: 'Commission salespeople, ivory-tower theorists detached from deployment, or slide-deck agencies.',
  },
  {
    id: 'why-inmerge',
    eyebrow: 'DIFFERENTIATOR',
    title: 'Why Inmerge',
    body: null,
    accent: 'var(--gold)',
    theme: 'dark',
    tag: 'INMERGE VS. THE MARKET',
    isComparative: true,
    competitors: [
      {
        label: 'GENERALIST CONSULTANCIES',
        text: 'Deliver recommendations in PowerPoint decks but lack the technical depth to audit source code or configure AWS infrastructure.',
      },
      {
        label: 'GENERIC SOFTWARE FACTORIES',
        text: 'Ship frontends quickly without data audit protocols, governance models, or mathematical ML grounding.',
      },
    ],
    inmerge: 'Rigorous auditing, cloud engineering, and advanced data science executed directly by the same senior technical partners.',
  },
  {
    id: 'manifesto',
    eyebrow: 'STATEMENT',
    title: 'Engineering Assurance Manifesto',
    body: 'Executive operational and strategic decisions cannot rely on isolated spreadsheets or opaque systems: they require solid architecture, auditable data, and verifiable code.',
    accent: 'var(--terracotta)',
    theme: 'dark',
    tag: 'OUR COMMITMENT',
  },
];

export default function ManifestoCarousel() {
  const { lang } = useLanguage();
  const isEn = lang === 'en';
  const slides = isEn ? SLIDES_EN : SLIDES_ES;
  const N = slides.length;

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

  // Autoplay every 7s (slower editorial pacing) — paused on hover/focus/drag
  useEffect(() => {
    if (isPaused || isDragging || N <= 1) return;
    intervalRef.current = setInterval(handleNext, 7000);
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
    // Only primary button
    if (e.button !== 0) return;
    isMouseDown.current = true;
    mouseStartX.current = e.clientX;
    setIsDragging(true);
  };

  const handleMouseMove = () => {
    if (!isMouseDown.current) return;
    // user is dragging
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

  const renderSlideContent = (slide) => {
    if (slide.isArchetype) {
      return (
        <div className="manifesto-archetype-grid">
          <div className="archetype-col archetype-is">
            <div className="archetype-label" style={{ color: 'var(--green, #2E7559)' }}>
              {isEn ? 'WHAT WE ARE' : 'ES'}
            </div>
            <div className="archetype-text">{slide.isBlock}</div>
          </div>
          <div className="archetype-col archetype-not">
            <div className="archetype-label" style={{ color: 'var(--terracotta)' }}>
              {isEn ? 'WHAT WE ARE NOT' : 'NO ES'}
            </div>
            <div className="archetype-text">{slide.notBlock}</div>
          </div>
        </div>
      );
    }

    if (slide.isComparative) {
      return (
        <div className="manifesto-comparative-grid">
          {slide.competitors.map((c, i) => (
            <div key={i} className="comparative-col comparative-other">
              <div className="comparative-label">{c.label}</div>
              <div className="comparative-text">{c.text}</div>
            </div>
          ))}
          <div className="comparative-col comparative-inmerge">
            <div className="comparative-label" style={{ color: 'var(--gold)' }}>
              INMERGE
            </div>
            <div className="comparative-text">{slide.inmerge}</div>
          </div>
        </div>
      );
    }

    return <p className="manifesto-slide-body">{slide.body}</p>;
  };

  return (
    <section
      className={`manifesto-carousel ${isDragging ? 'is-dragging' : ''}`}
      role="region"
      aria-roledescription="carousel"
      aria-label={isEn ? 'Inmerge Engineering Manifesto' : 'Manifiesto de Ingeniería Inmerge'}
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
      {/* Slides container */}
      <div className="manifesto-slides-viewport">
        {slides.map((slide, idx) => {
          const isActive = idx === activeIndex;
          return (
            <article
              key={slide.id}
              className={`manifesto-slide manifesto-slide--${slide.theme} ${isActive ? 'is-active' : 'is-inactive'}`}
              role="group"
              aria-roledescription="slide"
              aria-label={`${isEn ? 'Slide' : 'Diapositiva'} ${idx + 1} ${isEn ? 'of' : 'de'} ${N}: ${slide.title}`}
              aria-hidden={!isActive}
            >
              <div className="manifesto-slide-inner">
                <div className="manifesto-slide-tag" style={{ color: slide.accent }}>
                  {slide.tag}
                </div>
                <div className="manifesto-slide-eyebrow">{slide.eyebrow}</div>
                <h3 className="manifesto-slide-title">{slide.title}</h3>
                {renderSlideContent(slide)}
              </div>

              {/* Decorative accent diamond */}
              <div className="manifesto-slide-diamond" aria-hidden="true" style={{ background: slide.accent }} />
            </article>
          );
        })}
      </div>

      {/* Controls: arrows + segmented progress bar (no play button) */}
      <div className="manifesto-controls" aria-label={isEn ? 'Carousel controls' : 'Controles del carrusel'}>
        <button
          type="button"
          className="manifesto-arrow manifesto-arrow--prev"
          onClick={handlePrev}
          aria-label={isEn ? 'Previous slide' : 'Diapositiva anterior'}
        >
          ←
        </button>

        {/* Segmented progress bar */}
        <div className="manifesto-progress-bar" role="group" aria-label={isEn ? 'Slide progress' : 'Progreso'}>
          {slides.map((slide, idx) => (
            <button
              key={slide.id}
              type="button"
              className={`manifesto-progress-segment ${idx === activeIndex ? 'is-active' : ''}`}
              onClick={() => goTo(idx)}
              aria-label={`${isEn ? 'Go to slide' : 'Ir a diapositiva'} ${idx + 1}`}
              aria-current={idx === activeIndex ? 'true' : 'false'}
            >
              <span className="segment-fill" />
            </button>
          ))}
        </div>

        <button
          type="button"
          className="manifesto-arrow manifesto-arrow--next"
          onClick={handleNext}
          aria-label={isEn ? 'Next slide' : 'Siguiente diapositiva'}
        >
          →
        </button>
      </div>
    </section>
  );
}
