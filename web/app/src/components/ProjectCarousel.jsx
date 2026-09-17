import { useState, useRef, useEffect, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { PROJECTS_DATA } from '../data/projectsData';

export default function ProjectCarousel({ onQuoteProject }) {
  const { lang } = useLanguage();
  const [selectedPillar, setSelectedPillar] = useState('all');
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const carouselRef = useRef(null);
  const cardRefs = useRef([]);
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);
  const hasMovedRef = useRef(false);

  const filteredProjects =
    selectedPillar === 'all'
      ? PROJECTS_DATA
      : PROJECTS_DATA.filter((p) => p.pillarId === selectedPillar);

  const isEn = lang === 'en';

  const filterTabs = [
    { id: 'all', label: isEn ? 'All Projects' : 'Todos los Proyectos' },
    { id: 'auditoria', label: isEn ? 'Pillar 01: Audit' : 'Pilar 01: Auditoría' },
    { id: 'desarrollo', label: isEn ? 'Pillar 02: Cloud & Dev' : 'Pilar 02: Cloud & Dev' },
    { id: 'datos', label: isEn ? 'Pillar 03: Data & AI' : 'Pilar 03: Datos & IA' },
  ];

  // Reset activeIndex when filter changes
  useEffect(() => {
    setActiveIndex(0);
    if (carouselRef.current) {
      if (typeof carouselRef.current.scrollTo === 'function') {
        carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        carouselRef.current.scrollLeft = 0;
      }
    }
  }, [selectedPillar]);

  // Scroll to specific card by index with center alignment
  const scrollToIndex = useCallback((index) => {
    if (index < 0 || index >= filteredProjects.length) return;
    setActiveIndex(index);

    const targetCard = cardRefs.current[index];
    if (targetCard && carouselRef.current) {
      const container = carouselRef.current;
      const cardLeft = targetCard.offsetLeft || 0;
      const cardWidth = targetCard.offsetWidth || 0;
      const containerWidth = container.offsetWidth || 0;
      const targetScroll = cardLeft - (containerWidth / 2) + (cardWidth / 2);

      if (typeof container.scrollTo === 'function') {
        container.scrollTo({
          left: Math.max(0, targetScroll),
          behavior: 'smooth',
        });
      } else {
        container.scrollLeft = Math.max(0, targetScroll);
      }
    }
  }, [filteredProjects.length]);

  const handlePrev = useCallback(() => {
    const nextIdx = activeIndex > 0 ? activeIndex - 1 : filteredProjects.length - 1;
    scrollToIndex(nextIdx);
  }, [activeIndex, filteredProjects.length, scrollToIndex]);

  const handleNext = useCallback(() => {
    const nextIdx = activeIndex < filteredProjects.length - 1 ? activeIndex + 1 : 0;
    scrollToIndex(nextIdx);
  }, [activeIndex, filteredProjects.length, scrollToIndex]);

  // Smooth automatic motion progression every 5 seconds
  useEffect(() => {
    if (!isAutoplay || isPaused || isDragging || filteredProjects.length <= 1) {
      return;
    }

    const timer = setInterval(() => {
      handleNext();
    }, 5000);

    return () => clearInterval(timer);
  }, [isAutoplay, isPaused, isDragging, handleNext, filteredProjects.length]);

  const isDraggingRef = useRef(false);

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
      scrollToIndex(activeIndex);
    }
  };

  const handleMouseLeave = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      setIsDragging(false);
      setIsPaused(false);
      scrollToIndex(activeIndex);
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
      scrollToIndex(activeIndex);
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

        {/* Deck Navigation & Controls */}
        <div className="carousel-top-controls">
          <div className="carousel-deck-meta">
            <span className="deck-counter" aria-live="polite">
              {String(activeIndex + 1).padStart(2, '0')} / {String(filteredProjects.length).padStart(2, '0')}
            </span>
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

          <div className="carousel-arrow-group" aria-label={isEn ? 'Carousel navigation' : 'Navegación del carrusel'}>
            <button
              type="button"
              className="carousel-arrow-btn"
              onClick={handlePrev}
              aria-label={isEn ? 'Previous project card' : 'Ver proyecto anterior'}
            >
              ←
            </button>
            <button
              type="button"
              className="carousel-arrow-btn"
              onClick={handleNext}
              aria-label={isEn ? 'Next project card' : 'Ver proyecto siguiente'}
            >
              →
            </button>
          </div>
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

      {/* Interactive Single-Card Track with Drag & Auto-motion */}
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
        {filteredProjects.map((project, idx) => {
          const badge = getPillarBadge(project.pillarId);
          const isActive = idx === activeIndex;

          return (
            <article
              key={project.id}
              ref={(el) => (cardRefs.current[idx] = el)}
              className={`carousel-card single-focus-card ${isActive ? 'is-active-card' : 'is-inactive-card'}`}
              role="group"
              aria-roledescription="slide"
              aria-label={`${isEn ? 'Case' : 'Caso'} ${idx + 1} ${isEn ? 'of' : 'de'} ${filteredProjects.length}: ${isEn ? project.title.en : project.title.es}`}
              onClick={() => {
                if (!hasMovedRef.current) {
                  scrollToIndex(idx);
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
              {project.diagram && (
                <div className="card-blueprint-container" aria-label={isEn ? 'System Architecture Blueprint' : 'Blueprint de Arquitectura Técnica'}>
                  <div className="blueprint-top-bar">
                    <span className="blueprint-tag">SYSTEM BLUEPRINT</span>
                    <span className="blueprint-badge-text">{project.diagram.badge}</span>
                  </div>
                  <div className="blueprint-nodes-row">
                    {project.diagram.steps.map((step, sIdx) => (
                      <div key={sIdx} className="blueprint-node-item">
                        <span className="node-step-index">0{sIdx + 1}</span>
                        <span className="node-title">{step.name}</span>
                        <span className="node-detail">{step.detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Challenge & Solution Grid */}
              <div className="card-challenge-solution dual-grid">
                <div className="challenge-block">
                  <span className="block-label">{isEn ? 'Critical Challenge:' : 'Desafío Crítico:'}</span>
                  <p>{isEn ? project.challenge.en : project.challenge.es}</p>
                </div>
                <div className="solution-block">
                  <span className="block-label">{isEn ? 'Engineering Solution:' : 'Solución de Ingeniería:'}</span>
                  <p>{isEn ? project.solution.en : project.solution.es}</p>
                </div>
              </div>

              {/* Deliverables Checklist */}
              {project.deliverables && (
                <div className="card-deliverables-box">
                  <span className="deliverables-box-title">
                    {isEn ? 'AUDITED DELIVERABLES:' : 'ENTREGABLES AUDITADOS:'}
                  </span>
                  <ul className="deliverables-box-list">
                    {(isEn ? project.deliverables.en : project.deliverables.es).map((item, dIdx) => (
                      <li key={dIdx}>
                        <span className="deliv-check">✓</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Impact Metrics */}
              <div className="card-metrics-grid">
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

      {/* Slide Pagination Dots */}
      <div className="carousel-dots-pagination" role="group" aria-label={isEn ? 'Slide pagination' : 'Paginación de tarjetas'}>
        {filteredProjects.map((project, idx) => (
          <button
            key={project.id}
            type="button"
            className={`carousel-dot-btn ${idx === activeIndex ? 'is-active-dot' : ''}`}
            onClick={() => scrollToIndex(idx)}
            aria-label={`${isEn ? 'Go to slide' : 'Ir a tarjeta'} ${idx + 1}: ${isEn ? project.title.en : project.title.es}`}
            aria-current={idx === activeIndex ? 'true' : 'false'}
          >
            <span className="dot-inner" />
          </button>
        ))}
      </div>
    </section>
  );
}
