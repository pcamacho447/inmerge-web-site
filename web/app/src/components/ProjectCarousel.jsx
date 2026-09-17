import { useState, useRef, useEffect, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { PROJECTS_DATA } from '../data/projectsData';

export default function ProjectCarousel({ onQuoteProject }) {
  const { lang } = useLanguage();
  const [selectedPillar, setSelectedPillar] = useState('all');
  const [isAutoplay, setIsAutoplay] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [withTransition, setWithTransition] = useState(true);
  const [translateX, setTranslateX] = useState(0);

  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const cardRefs = useRef([]);
  const startXRef = useRef(0);
  const startTranslateXRef = useRef(0);
  const isDraggingRef = useRef(false);
  const hasMovedRef = useRef(false);

  const filteredProjects =
    selectedPillar === 'all'
      ? PROJECTS_DATA
      : PROJECTS_DATA.filter((p) => p.pillarId === selectedPillar);

  const N = filteredProjects.length;

  // Triplicated virtual buffer for continuous 360° infinite sliding
  const virtualProjects = N > 0 ? [...filteredProjects, ...filteredProjects, ...filteredProjects] : [];

  // Start at the center clone buffer (index N)
  const [virtualIndex, setVirtualIndex] = useState(N);

  const isEn = lang === 'en';

  const filterTabs = [
    { id: 'all', label: isEn ? 'All Projects' : 'Todos los Proyectos' },
    { id: 'auditoria', label: isEn ? 'Pillar 01: Audit' : 'Pilar 01: Auditoría' },
    { id: 'desarrollo', label: isEn ? 'Pillar 02: Cloud & Dev' : 'Pilar 02: Cloud & Dev' },
    { id: 'datos', label: isEn ? 'Pillar 03: Data & AI' : 'Pilar 03: Datos & IA' },
  ];

  // Real 0-based active index for pagination dots
  const realActiveIndex = N > 0 ? ((virtualIndex % N) + N) % N : 0;

  // Calculates track translation to center the target virtual card
  const calculateTranslateForIndex = useCallback((vIdx) => {
    const container = viewportRef.current;
    const targetCard = cardRefs.current[vIdx];
    if (container && targetCard) {
      const containerWidth = container.offsetWidth || 0;
      const cardLeft = targetCard.offsetLeft || 0;
      const cardWidth = targetCard.offsetWidth || 0;
      return -(cardLeft - (containerWidth / 2) + (cardWidth / 2));
    }
    return 0;
  }, []);

  // Update track position with or without smooth CSS transition
  const moveToVirtualIndex = useCallback((newVIdx, smooth = true) => {
    if (N === 0) return;
    setVirtualIndex(newVIdx);
    setWithTransition(smooth);

    const offset = calculateTranslateForIndex(newVIdx);
    setTranslateX(offset);
  }, [N, calculateTranslateForIndex]);

  // Initial center alignment and reset only on filter changes
  useEffect(() => {
    setVirtualIndex(N);
    setWithTransition(false);

    const timer = setTimeout(() => {
      const container = viewportRef.current;
      const targetCard = cardRefs.current[N];
      if (container && targetCard) {
        const containerWidth = container.offsetWidth || 0;
        const cardLeft = targetCard.offsetLeft || 0;
        const cardWidth = targetCard.offsetWidth || 0;
        setTranslateX(-(cardLeft - (containerWidth / 2) + (cardWidth / 2)));
      }
    }, 40);

    return () => clearTimeout(timer);
  }, [selectedPillar, N]);

  // Separate effect for responsive window resizing
  useEffect(() => {
    const handleResize = () => {
      moveToVirtualIndex(virtualIndex, false);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [moveToVirtualIndex, virtualIndex]);

  // Next and Prev handlers
  const handleNext = useCallback(() => {
    if (N === 0) return;
    moveToVirtualIndex(virtualIndex + 1, true);
  }, [virtualIndex, N, moveToVirtualIndex]);

  const handlePrev = useCallback(() => {
    if (N === 0) return;
    moveToVirtualIndex(virtualIndex - 1, true);
  }, [virtualIndex, N, moveToVirtualIndex]);

  // Seamless rebase on CSS transition end:
  // When animation finishes in left or right clone zone, silently snap to middle clone (zero visual rewind!)
  const handleTransitionEnd = (e) => {
    if (e.target !== trackRef.current) return;
    if (N === 0) return;

    if (virtualIndex >= 2 * N || virtualIndex < N) {
      const normalizedVIdx = (((virtualIndex % N) + N) % N) + N;
      if (trackRef.current) {
        trackRef.current.style.transition = 'none';
      }
      setWithTransition(false);
      setVirtualIndex(normalizedVIdx);
      const offset = calculateTranslateForIndex(normalizedVIdx);
      setTranslateX(offset);

      if (trackRef.current) {
        trackRef.current.style.transform = `translate3d(${offset}px, 0, 0)`;
        void trackRef.current.offsetHeight;
      }
    }
  };

  // Jump directly to card from bottom pagination dots using the shortest circular path (never rewinding across all cards)
  const goToRealIndex = useCallback((targetRealIdx) => {
    if (N === 0) return;
    const currentRealIdx = ((virtualIndex % N) + N) % N;
    if (currentRealIdx === targetRealIdx) return;

    const forwardDistance = (targetRealIdx - currentRealIdx + N) % N;
    const backwardDistance = (currentRealIdx - targetRealIdx + N) % N;

    if (forwardDistance <= backwardDistance) {
      moveToVirtualIndex(virtualIndex + forwardDistance, true);
    } else {
      moveToVirtualIndex(virtualIndex - backwardDistance, true);
    }
  }, [N, virtualIndex, moveToVirtualIndex]);

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

  // Mouse Drag Handlers
  const handleMouseDown = (e) => {
    if (N === 0) return;
    isDraggingRef.current = true;
    setIsDragging(true);
    setIsPaused(true);
    setWithTransition(false);
    hasMovedRef.current = false;
    startXRef.current = getEventCoord(e);
    startTranslateXRef.current = translateX;
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return;
    if (e.preventDefault) e.preventDefault();
    const currentX = getEventCoord(e);
    const walk = currentX - startXRef.current;
    if (Math.abs(walk) > 5) {
      hasMovedRef.current = true;
    }
    setTranslateX(startTranslateXRef.current + walk);
  };

  const handleMouseUp = (e) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);
    setIsPaused(false);
    const currentX = getEventCoord(e);
    const walk = currentX - startXRef.current;

    if (walk < -40) {
      handleNext();
    } else if (walk > 40) {
      handlePrev();
    } else {
      moveToVirtualIndex(virtualIndex, true);
    }
  };

  const handleMouseLeave = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      setIsDragging(false);
      setIsPaused(false);
      moveToVirtualIndex(virtualIndex, true);
    }
  };

  // Touch Swipe Handlers for mobile
  const handleTouchStart = (e) => {
    if (N === 0 || e.touches.length === 0) return;
    isDraggingRef.current = true;
    setIsDragging(true);
    setIsPaused(true);
    setWithTransition(false);
    startXRef.current = e.touches[0].pageX ?? e.touches[0].clientX ?? 0;
    startTranslateXRef.current = translateX;
  };

  const handleTouchMove = (e) => {
    if (!isDraggingRef.current || e.touches.length === 0) return;
    const pageX = e.touches[0].pageX ?? e.touches[0].clientX ?? 0;
    const walk = pageX - startXRef.current;
    setTranslateX(startTranslateXRef.current + walk);
  };

  const handleTouchEnd = (e) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);
    setIsPaused(false);
    if (e.changedTouches.length === 0) return;
    const pageX = e.changedTouches[0].pageX ?? e.changedTouches[0].clientX ?? 0;
    const walk = pageX - startXRef.current;

    if (walk < -40) {
      handleNext();
    } else if (walk > 40) {
      handlePrev();
    } else {
      moveToVirtualIndex(virtualIndex, true);
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
        return { label: isEn ? 'Pillar 03 · Data Science & AI' : 'Pilar 03 · Ciencia de Datos & IA', color: 'var(--gold)' };
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
      {/* Clean Editorial Header (No counter clutter or arrows) */}
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

      {/* Viewport for GPU-accelerated Transform Track */}
      <div
        className="carousel-viewport"
        ref={viewportRef}
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
        <div
          className={`carousel-track ${isDragging ? 'is-dragging' : ''}`}
          ref={trackRef}
          onTransitionEnd={handleTransitionEnd}
          style={{
            transform: `translate3d(${translateX}px, 0, 0)`,
            transition: withTransition
              ? 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
              : 'none',
          }}
        >
          {virtualProjects.map((project, vIdx) => {
            const badge = getPillarBadge(project.pillarId);
            const isActive = vIdx === virtualIndex;
            const realIdx = vIdx % N;

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
                    moveToVirtualIndex(vIdx, true);
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
      </div>

      {/* Slide Pagination Dots, Direction Arrows & Autoplay Toggle */}
      <div className="carousel-dots-pagination" role="group" aria-label={isEn ? 'Slide pagination' : 'Paginación de tarjetas'}>
        <button
          type="button"
          className="carousel-arrow-btn carousel-arrow-prev"
          onClick={handlePrev}
          aria-label={isEn ? 'Previous slide' : 'Tarjeta anterior'}
          title={isEn ? 'Previous slide' : 'Tarjeta anterior'}
        >
          ←
        </button>

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
          className="carousel-arrow-btn carousel-arrow-next"
          onClick={handleNext}
          aria-label={isEn ? 'Next slide' : 'Siguiente tarjeta'}
          title={isEn ? 'Next slide' : 'Siguiente tarjeta'}
        >
          →
        </button>

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
