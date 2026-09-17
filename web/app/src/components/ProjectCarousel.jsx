import { useState, useRef, useEffect, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { PROJECTS_DATA } from '../data/projectsData';

export default function ProjectCarousel({ onQuoteProject }) {
  const { lang } = useLanguage();
  const [selectedPillar, setSelectedPillar] = useState('all');
  const [isAutoplay, setIsAutoplay] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const carouselRef = useRef(null);
  const cardRefs = useRef([]);
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);
  const hasMovedRef = useRef(false);
  const isDraggingRef = useRef(false);
  const rebaseTimeoutRef = useRef(null);

  const filteredProjects =
    selectedPillar === 'all'
      ? PROJECTS_DATA
      : PROJECTS_DATA.filter((p) => p.pillarId === selectedPillar);

  const N = filteredProjects.length;

  // Triplicated virtual buffer for continuous 360° infinite scrolling
  const virtualProjects = N > 0 ? [...filteredProjects, ...filteredProjects, ...filteredProjects] : [];

  // Start in the middle buffer (index N)
  const [virtualIndex, setVirtualIndex] = useState(N);

  const isEn = lang === 'en';

  const filterTabs = [
    { id: 'all', label: isEn ? 'All Projects' : 'Todos los Proyectos' },
    { id: 'auditoria', label: isEn ? 'Pillar 01: Audit' : 'Pilar 01: Auditoría' },
    { id: 'desarrollo', label: isEn ? 'Pillar 02: Cloud & Dev' : 'Pilar 02: Cloud & Dev' },
    { id: 'datos', label: isEn ? 'Pillar 03: Data & AI' : 'Pilar 03: Datos & IA' },
  ];

  // Normalized active index (0 to N - 1) for indicators and pagination dots
  const realActiveIndex = N > 0 ? ((virtualIndex % N) + N) % N : 0;

  // Scroll to a specific virtual card with center alignment
  const scrollToVirtualIndex = useCallback((vIdx, smooth = true) => {
    if (N === 0) return;
    setVirtualIndex(vIdx);

    if (rebaseTimeoutRef.current) {
      clearTimeout(rebaseTimeoutRef.current);
    }

    const targetCard = cardRefs.current[vIdx];
    if (targetCard && carouselRef.current) {
      const container = carouselRef.current;
      const cardLeft = targetCard.offsetLeft || 0;
      const cardWidth = targetCard.offsetWidth || 0;
      const containerWidth = container.offsetWidth || 0;
      const targetScroll = cardLeft - (containerWidth / 2) + (cardWidth / 2);

      if (typeof container.scrollTo === 'function') {
        container.scrollTo({
          left: Math.max(0, targetScroll),
          behavior: smooth ? 'smooth' : 'auto',
        });
      } else {
        container.scrollLeft = Math.max(0, targetScroll);
      }
    }

    // Seamless infinite buffer rebase: if we drifted into the left or right clone zone,
    // silently reset position to the middle clone after the smooth animation completes.
    if (vIdx < N || vIdx >= 2 * N) {
      const normalizedVIdx = (((vIdx % N) + N) % N) + N;
      rebaseTimeoutRef.current = setTimeout(() => {
        setVirtualIndex(normalizedVIdx);
        const middleCard = cardRefs.current[normalizedVIdx];
        if (middleCard && carouselRef.current) {
          const container = carouselRef.current;
          const cardLeft = middleCard.offsetLeft || 0;
          const cardWidth = middleCard.offsetWidth || 0;
          const containerWidth = container.offsetWidth || 0;
          const targetScroll = cardLeft - (containerWidth / 2) + (cardWidth / 2);

          if (typeof container.scrollTo === 'function') {
            container.scrollTo({
              left: Math.max(0, targetScroll),
              behavior: 'auto',
            });
          } else {
            container.scrollLeft = Math.max(0, targetScroll);
          }
        }
      }, smooth ? 400 : 0);
    }
  }, [N]);

  // Reset virtual index to the center set whenever filter changes
  useEffect(() => {
    setVirtualIndex(N);
    const timer = setTimeout(() => {
      scrollToVirtualIndex(N, false);
    }, 50);
    return () => clearTimeout(timer);
  }, [selectedPillar, N, scrollToVirtualIndex]);

  const handleNext = useCallback(() => {
    if (N === 0) return;
    scrollToVirtualIndex(virtualIndex + 1, true);
  }, [virtualIndex, N, scrollToVirtualIndex]);

  const handlePrev = useCallback(() => {
    if (N === 0) return;
    scrollToVirtualIndex(virtualIndex - 1, true);
  }, [virtualIndex, N, scrollToVirtualIndex]);

  // Jump directly to item from bottom pagination dots
  const goToRealIndex = useCallback((realIdx) => {
    if (N === 0) return;
    scrollToVirtualIndex(N + realIdx, true);
  }, [N, scrollToVirtualIndex]);

  // Smooth automatic motion progression every 5 seconds
  useEffect(() => {
    if (!isAutoplay || isPaused || isDragging || N <= 1) {
      return;
    }

    const timer = setInterval(() => {
      handleNext();
    }, 5000);

    return () => clearInterval(timer);
  }, [isAutoplay, isPaused, isDragging, handleNext, N]);

  const getEventCoord = (e) => {
    if (e.clientX !== undefined) return e.clientX;
    if (e.pageX !== undefined) return e.pageX;
    return 0;
  };

  // Mouse Drag to Scroll Handlers
  const handleMouseDown = (e) => {
    if (!carouselRef.current) return;
    isDraggingRef.current = true;
    setIsDragging(true);
    setIsPaused(true);
    hasMovedRef.current = false;
    startXRef.current = getEventCoord(e);
    startScrollLeftRef.current = carouselRef.current.scrollLeft || 0;
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current || !carouselRef.current) return;
    if (e.preventDefault) e.preventDefault();
    const currentX = getEventCoord(e);
    const walk = currentX - startXRef.current;
    if (Math.abs(walk) > 5) {
      hasMovedRef.current = true;
    }
    carouselRef.current.scrollLeft = (startScrollLeftRef.current || 0) - walk;
  };

  const handleMouseUp = (e) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);
    setIsPaused(false);
    if (!carouselRef.current) return;
    const currentX = getEventCoord(e);
    const walk = currentX - startXRef.current;

    if (walk < -40) {
      handleNext();
    } else if (walk > 40) {
      handlePrev();
    } else {
      scrollToVirtualIndex(virtualIndex, true);
    }
  };

  const handleMouseLeave = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      setIsDragging(false);
      setIsPaused(false);
      scrollToVirtualIndex(virtualIndex, true);
    }
  };

  // Touch Swipe Handlers for mobile & trackpads
  const handleTouchStart = (e) => {
    if (!carouselRef.current || e.touches.length === 0) return;
    isDraggingRef.current = true;
    setIsDragging(true);
    setIsPaused(true);
    startXRef.current = e.touches[0].pageX ?? e.touches[0].clientX ?? 0;
    startScrollLeftRef.current = carouselRef.current.scrollLeft || 0;
  };

  const handleTouchMove = (e) => {
    if (!isDraggingRef.current || !carouselRef.current || e.touches.length === 0) return;
    const pageX = e.touches[0].pageX ?? e.touches[0].clientX ?? 0;
    const walk = pageX - startXRef.current;
    carouselRef.current.scrollLeft = (startScrollLeftRef.current || 0) - walk;
  };

  const handleTouchEnd = (e) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);
    setIsPaused(false);
    if (!carouselRef.current || e.changedTouches.length === 0) return;
    const pageX = e.changedTouches[0].pageX ?? e.changedTouches[0].clientX ?? 0;
    const walk = pageX - startXRef.current;

    if (walk < -40) {
      handleNext();
    } else if (walk > 40) {
      handlePrev();
    } else {
      scrollToVirtualIndex(virtualIndex, true);
    }
  };

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

  const getPillarBadge = (pillarId) => {
    switch (pillarId) {
      case 'auditoria':
        return { label: isEn ? 'Pilar 01 · Auditoría Técnica' : 'Pilar 01 · Auditoría Técnica', color: 'var(--terracotta)' };
      case 'desarrollo':
        return { label: isEn ? 'Pilar 02 · Desarrollo Cloud' : 'Pilar 02 · Desarrollo Cloud', color: 'var(--ochre)' };
      case 'datos':
        return { label: isEn ? 'Pilar 03 · Ciencia de Datos & IA' : 'Pilar 03 · Ciencia de Datos & IA', color: 'var(--gold)' };
      default:
        return { label: 'Inmerge Engineering', color: 'var(--ink)' };
    }
  };

  return (
    <section
      className="project-carousel-section single-card-mode"
      role="region"
      aria-roledescription="carousel"
      aria-label={isEn ? 'Featured Case Studies & Technical Architecture' : 'Casos de Éxito & Arquitectura Técnica'}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => {
        if (!isDragging) setIsPaused(false);
      }}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      {/* Clean Editorial Header (No redundant counter boxes or arrows) */}
      <div className="carousel-header">
        <div className="carousel-titles">
          <span className="carousel-eyebrow">
            {isEn ? 'PROVEN TRACK RECORD & SYSTEM ARCHITECTURE' : 'CASOS DE ÉXITO & PROYECTOS REALES'}
          </span>
          <h2 className="carousel-main-title">
            {isEn
              ? 'Engineering Impact in Days, Not Months'
              : 'Resultados de Ingeniería en Días, No en Meses'}
          </h2>
          <p className="carousel-subtitle">
            {isEn
              ? 'Auditable production-ready systems, scalable cloud architectures, and verifiable business ROI.'
              : 'Arquitecturas cloud en producción, modelos de datos de alta precisión y entregables forenses con ROI verificable.'}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="carousel-filter-bar" role="tablist" aria-label={isEn ? 'Filter by pillar' : 'Filtrar por pilar'}>
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={selectedPillar === tab.id}
            className={`carousel-filter-btn ${selectedPillar === tab.id ? 'is-active' : ''}`}
            onClick={() => setSelectedPillar(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Interactive Infinite Single-Card Track with Drag & Auto-motion */}
      <div
        className={`carousel-track single-card-track ${isDragging ? 'is-dragging' : ''}`}
        ref={carouselRef}
        tabIndex={0}
        aria-live="polite"
        onKeyDown={handleKeyDown}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {virtualProjects.map((project, vIdx) => {
          const badge = getPillarBadge(project.pillarId);
          const isActive = vIdx === virtualIndex;
          const realIdx = vIdx % N;

          // Safe extraction of diagram steps and deliverables
          const diagramSteps = project.diagram ? (project.diagram.steps || project.diagram.nodes || []) : [];
          const deliverablesList = project.deliverables
            ? (Array.isArray(project.deliverables)
                ? project.deliverables
                : isEn ? (project.deliverables.en || []) : (project.deliverables.es || []))
            : [];

          return (
            <article
              key={`${project.id}-v${vIdx}`}
              ref={(el) => (cardRefs.current[vIdx] = el)}
              className={`carousel-card single-focus-card ${isActive ? 'is-active-card' : 'is-inactive-card'}`}
              role="group"
              aria-roledescription="slide"
              aria-label={`${isEn ? 'Case' : 'Caso'} ${realIdx + 1} ${isEn ? 'of' : 'de'} ${N}: ${isEn ? project.title.en : project.title.es}`}
              onClick={() => {
                if (!hasMovedRef.current) {
                  scrollToVirtualIndex(vIdx, true);
                }
              }}
            >
              {/* Header Meta */}
              <div className="card-top-meta">
                <span className="card-pillar-tag" style={{ borderColor: badge.color, color: badge.color }}>
                  {badge.label}
                </span>
                <span className="card-duration-tag">
                  {isEn ? project.duration.en : project.duration.es}
                </span>
              </div>

              {/* Main Titles */}
              <h3 className="card-project-title">
                {isEn ? project.title.en : project.title.es}
              </h3>
              <div className="card-client-type">
                <strong>{isEn ? 'Industry / Client:' : 'Industria / Cliente:'}</strong>{' '}
                {isEn ? project.clientType.en : project.clientType.es}
              </div>

              {/* Visual Architecture Blueprint Schematics */}
              {project.diagram && diagramSteps.length > 0 && (
                <div className="card-blueprint-container" aria-label={isEn ? 'System Architecture Blueprint' : 'Blueprint de Arquitectura Técnica'}>
                  <div className="blueprint-top-bar">
                    <span className="blueprint-tag">{isEn ? 'SYSTEM ARCHITECTURE' : 'ARQUITECTURA DE SISTEMA'}</span>
                    <span className="blueprint-badge-text">{project.diagram.badge}</span>
                  </div>
                  <div className="blueprint-nodes-row">
                    {diagramSteps.map((step, nIdx) => (
                      <div key={nIdx} className="blueprint-node-item">
                        <span className="node-step-index">0{nIdx + 1}</span>
                        <span className="node-title">{step.name || step.title}</span>
                        <span className="node-detail">{step.detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Problem vs Solution Split Grid */}
              <div className="card-challenge-solution dual-grid">
                <div className="challenge-block">
                  <span className="block-label">{isEn ? 'The Technical Challenge' : 'El Desafío Técnico'}</span>
                  <p>{isEn ? project.challenge.en : project.challenge.es}</p>
                </div>
                <div className="solution-block">
                  <span className="block-label">{isEn ? 'Inmerge Solution & Architecture' : 'Solución & Arquitectura Inmerge'}</span>
                  <p>{isEn ? project.solution.en : project.solution.es}</p>
                </div>
              </div>

              {/* Forensic Deliverables Checklist */}
              {deliverablesList.length > 0 && (
                <div className="card-deliverables-box">
                  <span className="deliverables-box-title">
                    {isEn ? 'AUDITABLE DELIVERABLES PRODUCED:' : 'ENTREGABLES AUDITABLES GENERADOS:'}
                  </span>
                  <ul className="deliverables-box-list">
                    {deliverablesList.map((deliv, dIdx) => (
                      <li key={dIdx}>
                        <span className="deliv-check">✓</span>
                        {typeof deliv === 'string' ? deliv : isEn ? deliv.en : deliv.es}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Metrics Grid */}
              <div className="card-metrics-grid" aria-label={isEn ? 'Results and KPIs' : 'Métricas y Resultados'}>
                {project.metrics.map((m, mIdx) => (
                  <div key={mIdx} className="metric-box">
                    <span className="metric-number">{m.value}</span>
                    <span className="metric-text">{isEn ? m.label.en : m.label.es}</span>
                  </div>
                ))}
              </div>

              {/* Tech Stack Pills */}
              <div className="card-stack-row" aria-label={isEn ? 'Tech stack' : 'Stack tecnológico'}>
                {project.stack.map((tech, sIdx) => (
                  <span key={sIdx} className="stack-pill">
                    {tech}
                  </span>
                ))}
              </div>

              {/* Action Button */}
              <div className="card-footer-cta">
                <button
                  type="button"
                  className="btn-quote-similar"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onQuoteProject) onQuoteProject(project);
                  }}
                >
                  {isEn ? 'Estimate Similar Project in Sprints →' : 'Cotizar Proyecto Similar en Sprints →'}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* Slide Pagination Dots & Autoplay Toggle */}
      <div className="carousel-dots-pagination" role="group" aria-label={isEn ? 'Slide pagination' : 'Paginación de tarjetas'}>
        {filteredProjects.map((project, idx) => (
          <button
            key={project.id}
            type="button"
            className={`carousel-dot-btn ${idx === realActiveIndex ? 'is-active-dot' : ''}`}
            onClick={() => goToRealIndex(idx)}
            aria-label={`${isEn ? 'Go to slide' : 'Ir a tarjeta'} ${idx + 1}: ${isEn ? project.title.en : project.title.es}`}
            aria-current={idx === realActiveIndex ? 'true' : 'false'}
          >
            <span className="dot-inner" />
          </button>
        ))}

        <button
          type="button"
          className={`carousel-autoplay-toggle ${isAutoplay ? 'is-playing' : 'is-paused'}`}
          onClick={() => setIsAutoplay(!isAutoplay)}
          aria-label={
            isAutoplay
              ? (isEn ? 'Pause automatic slide progression' : 'Pausar avance automático')
              : (isEn ? 'Play automatic slide progression' : 'Iniciar avance automático')
          }
          title={isAutoplay ? (isEn ? 'Pause Auto-slide' : 'Pausar Auto-slide') : (isEn ? 'Play Auto-slide' : 'Activar Auto-slide')}
        >
          {isAutoplay ? '⏸' : '▶'}
        </button>
      </div>
    </section>
  );
}
