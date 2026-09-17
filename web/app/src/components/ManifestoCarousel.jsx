import { useState, useRef, useEffect, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';

/**
 * Mochica Geometric SVG Motifs
 * Authentic pre-Columbian Peruvian architectural geometric forms (Huaca de la Luna / Moche Friezes)
 */
function MocheStepPyramid({ color = 'var(--terracotta)' }) {
  return (
    <svg className="mochica-motif" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Outer Stepped Pyramid */}
      <path
        d="M20 180 H180 V150 H160 V120 H140 V90 H120 V60 H100 V60 H80 V90 H60 V120 H40 V150 H20 V180 Z"
        stroke={color}
        strokeWidth="2.5"
        strokeLinejoin="miter"
        opacity="0.25"
      />
      {/* Inner Concentric Stepped Pyramid */}
      <path
        d="M45 180 H155 V155 H135 V125 H115 V95 H85 V125 H65 V155 H45 V180 Z"
        fill={color}
        fillOpacity="0.06"
        stroke={color}
        strokeWidth="1.5"
        opacity="0.4"
      />
      {/* Top Sacred Apex */}
      <rect x="90" y="35" width="20" height="20" fill={color} fillOpacity="0.15" stroke={color} strokeWidth="1.5" />
      {/* Horizontal Baseline Frieze Accents */}
      <line x1="10" y1="188" x2="190" y2="188" stroke={color} strokeWidth="2" strokeDasharray="6 4" opacity="0.3" />
    </svg>
  );
}

function MocheStepGreca({ color = 'var(--gold)' }) {
  return (
    <svg className="mochica-motif" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Interlocking Signo Escalonado (Moche Stepped Wave/Greca) */}
      <path
        d="M20 180 H80 V140 H50 V110 H90 V70 H60 V40 H120 V80 H150 V110 H110 V150 H140 V180 H180"
        stroke={color}
        strokeWidth="3"
        strokeLinejoin="miter"
        strokeLinecap="square"
        opacity="0.3"
      />
      <path
        d="M35 165 H65 V145 H45 V125 H75 V85 H55 V55 H105 V75 H135 V105 H95 V145 H125 V165 H165"
        stroke={color}
        strokeWidth="1.5"
        strokeDasharray="4 3"
        opacity="0.2"
      />
      {/* Stepped Corner Dots */}
      <rect x="25" y="25" width="10" height="10" fill={color} opacity="0.3" transform="rotate(45 30 30)" />
      <rect x="170" y="25" width="10" height="10" fill={color} opacity="0.3" transform="rotate(45 175 30)" />
    </svg>
  );
}

function MocheDualRhombus({ color = 'var(--terracotta)' }) {
  return (
    <svg className="mochica-motif" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Concentric Ceremonial Stepped Rhombus */}
      <path d="M100 15 L185 100 L100 185 L15 100 Z" stroke={color} strokeWidth="2.5" opacity="0.25" />
      <path d="M100 40 L160 100 L100 160 L40 100 Z" stroke={color} strokeWidth="2" strokeDasharray="5 3" opacity="0.35" />
      <path d="M100 65 L135 100 L100 135 L65 100 Z" fill={color} fillOpacity="0.08" stroke={color} strokeWidth="1.5" />
      {/* Central Solar Medallion */}
      <circle cx="100" cy="100" r="10" fill={color} fillOpacity="0.2" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

function MocheFretwork({ color = 'var(--gold)' }) {
  return (
    <svg className="mochica-motif" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Stepped Triangular Frieze (Huaca del Sol/Luna Relieve) */}
      <path d="M10 170 L50 90 L90 170 L130 90 L170 170" stroke={color} strokeWidth="2.5" opacity="0.25" />
      <path
        d="M30 170 L50 130 L70 170 M110 170 L130 130 L150 170"
        stroke={color}
        strokeWidth="1.5"
        fill={color}
        fillOpacity="0.08"
        opacity="0.4"
      />
      <path d="M50 80 L90 20 L130 80" stroke={color} strokeWidth="2" strokeDasharray="4 3" opacity="0.3" />
      {/* Lateral Geometric Staircases */}
      <path d="M15 40 H35 V60 H55 V80" stroke={color} strokeWidth="2" opacity="0.3" />
      <path d="M185 40 H165 V60 H145 V80" stroke={color} strokeWidth="2" opacity="0.3" />
    </svg>
  );
}

function MocheChakana({ color = 'var(--terracotta)' }) {
  return (
    <svg className="mochica-motif" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Andean / Mochica Stepped Chakana */}
      <path
        d="M80 20 H120 V50 H150 V80 H180 V120 H150 V150 H120 V180 H80 V150 H50 V120 H20 V80 H50 V50 H80 V20 Z"
        stroke={color}
        strokeWidth="2.5"
        fill={color}
        fillOpacity="0.05"
        opacity="0.3"
      />
      <path
        d="M90 40 H110 V65 H135 V90 H160 V110 H135 V135 H110 V160 H90 V135 H65 V110 H40 V90 H65 V65 H90 V40 Z"
        stroke={color}
        strokeWidth="1.5"
        strokeDasharray="4 3"
        opacity="0.35"
      />
      {/* Central Void / Origin Circle */}
      <circle cx="100" cy="100" r="16" stroke={color} strokeWidth="2" fill="none" opacity="0.4" />
      <circle cx="100" cy="100" r="5" fill={color} opacity="0.5" />
    </svg>
  );
}

const MOTIF_COMPONENTS = {
  'tested-infra': MocheStepPyramid,
  'traceable-sovereign': MocheStepGreca,
  archetype: MocheDualRhombus,
  'why-inmerge': MocheFretwork,
  manifesto: MocheChakana,
};

const SLIDES_ES = [
  {
    id: 'tested-infra',
    eyebrow: 'PRINCIPIO DE ASEGURAMIENTO',
    title: 'Código Probado, Infraestructura Infalible',
    body: 'Cada módulo cuenta con suites de pruebas unitarias y de integración automáticas para garantizar cero regresiones. Control de acceso granular con Row Level Security (RLS), cifrado de datos en reposo y en tránsito sobre AWS.',
    accent: 'var(--terracotta)',
    tag: '01 — CI/CD & SEGURIDAD',
  },
  {
    id: 'traceable-sovereign',
    eyebrow: 'PRINCIPIO DE ASEGURAMIENTO',
    title: 'Cada Dato Rastreable, Sin Ataduras',
    body: 'Pipelines declarativos de datos donde cada transformación es rastreable desde la fuente de origen hasta la interfaz. Sin ataduras a plataformas propietarias: arquitectura desplegada en las cuentas cloud de tu propia organización.',
    accent: 'var(--gold)',
    tag: '02 — REPRODUCIBILIDAD & SOBERANÍA',
  },
  {
    id: 'archetype',
    eyebrow: 'ARQUETIPO DE INGENIERÍA',
    title: 'El Ingeniero & Auditor Estratégico',
    body: null,
    accent: 'var(--terracotta)',
    tag: 'IDENTIDAD INMERGE',
    isArchetype: true,
    isBlock: 'Experto que audita, programa y explica; riguroso con los números y transparente con el código.',
    notBlock: 'Vendedor comisionista, teórico desconectado de la implementación ni consultora de diapositivas vacías.',
  },
  {
    id: 'why-inmerge',
    eyebrow: 'DIFERENCIAL TÉCNICO',
    title: 'Por Qué Inmerge',
    body: null,
    accent: 'var(--gold)',
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
    eyebrow: 'DECLARACIÓN INSTITUCIONAL',
    title: 'Manifiesto de Aseguramiento',
    body: 'Las decisiones operativas y estratégicas de alto nivel no pueden depender de hojas de cálculo aisladas ni de sistemas opacos: requieren arquitectura sólida, datos auditables y código verificable.',
    accent: 'var(--terracotta)',
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
    tag: '01 — CI/CD & SECURITY',
  },
  {
    id: 'traceable-sovereign',
    eyebrow: 'ENGINEERING ASSURANCE',
    title: 'Every Data Point Traceable, Zero Lock-In',
    body: 'Declarative, idempotent pipelines where each calculation is traced from raw ingestion to client dashboards. Zero proprietary vendor lock-in: infrastructure provisioned directly within your own corporate cloud accounts.',
    accent: 'var(--gold)',
    tag: '02 — REPRODUCIBILITY & SOVEREIGNTY',
  },
  {
    id: 'archetype',
    eyebrow: 'ENGINEERING ARCHETYPE',
    title: 'The Strategic Engineer & Auditor',
    body: null,
    accent: 'var(--terracotta)',
    tag: 'INMERGE IDENTITY',
    isArchetype: true,
    isBlock: 'Hands-on specialists who audit, write code, and communicate clearly; rigorous with numbers and transparent with code.',
    notBlock: 'Commission salespeople, ivory-tower theorists detached from deployment, or slide-deck agencies.',
  },
  {
    id: 'why-inmerge',
    eyebrow: 'TECHNICAL DIFFERENTIATOR',
    title: 'Why Inmerge',
    body: null,
    accent: 'var(--gold)',
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
    eyebrow: 'INSTITUTIONAL STATEMENT',
    title: 'Engineering Assurance Manifesto',
    body: 'Executive operational and strategic decisions cannot rely on isolated spreadsheets or opaque systems: they require solid architecture, auditable data, and verifiable code.',
    accent: 'var(--terracotta)',
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

  // Autoplay (7.5s editorial pacing) — paused on hover/focus/drag
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
    // dragging tracking
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
            <div className="comparative-label" style={{ color: 'var(--terracotta)' }}>
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
      <div className="manifesto-slides-viewport">
        {slides.map((slide, idx) => {
          const isActive = idx === activeIndex;
          const MotifComponent = MOTIF_COMPONENTS[slide.id] || MocheStepPyramid;

          return (
            <article
              key={slide.id}
              className={`manifesto-slide ${isActive ? 'is-active' : 'is-inactive'}`}
              role="group"
              aria-roledescription="slide"
              aria-label={`${isEn ? 'Slide' : 'Diapositiva'} ${idx + 1} ${isEn ? 'of' : 'de'} ${N}: ${slide.title}`}
              aria-hidden={!isActive}
            >
              {/* Mochica Background Geometric Vector Motif */}
              <div className="mochica-motif-wrapper" aria-hidden="true">
                <MotifComponent color={slide.accent} />
              </div>

              <div className="manifesto-slide-inner">
                <div className="manifesto-slide-tag" style={{ color: slide.accent }}>
                  {slide.tag}
                </div>
                <div className="manifesto-slide-eyebrow">{slide.eyebrow}</div>
                <h3 className="manifesto-slide-title">{slide.title}</h3>
                {renderSlideContent(slide)}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
