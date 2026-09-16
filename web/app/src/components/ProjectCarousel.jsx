import { useState, useRef, useEffect, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { PROJECTS_DATA } from '../data/projectsData';

export default function ProjectCarousel({ onQuoteProject }) {
  const { lang } = useLanguage();
  const [selectedPillar, setSelectedPillar] = useState('all');
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  const carouselRef = useRef(null);
  const cardRefs = useRef([]);

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
    setProgress(0);
    if (carouselRef.current) {
      if (typeof carouselRef.current.scrollTo === 'function') {
        carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        carouselRef.current.scrollLeft = 0;
      }
    }
  }, [selectedPillar]);

  // Scroll to specific card by index
  const scrollToIndex = useCallback((index) => {
    if (index < 0 || index >= filteredProjects.length) return;
    setActiveIndex(index);
    setProgress(0);

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

  const handlePrev = () => {
    const nextIdx = activeIndex > 0 ? activeIndex - 1 : filteredProjects.length - 1;
    scrollToIndex(nextIdx);
  };

  const handleNext = useCallback(() => {
    const nextIdx = activeIndex < filteredProjects.length - 1 ? activeIndex + 1 : 0;
    scrollToIndex(nextIdx);
  }, [activeIndex, filteredProjects.length, scrollToIndex]);

  // Autoplay timer with progressive bar
  useEffect(() => {
    if (!isAutoplay || isPaused || filteredProjects.length <= 1) {
      return;
    }

    const intervalTime = 5000; // 5 seconds per slide
    const stepTime = 100;
    const progressStep = (stepTime / intervalTime) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + progressStep;
      });
    }, stepTime);

    return () => clearInterval(timer);
  }, [isAutoplay, isPaused, handleNext, filteredProjects.length]);

  // Handle keyboard navigation on the carousel
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
        return { label: isEn ? '01 Auditoría' : '01 Auditoría', color: 'var(--terracotta)' };
      case 'desarrollo':
        return { label: isEn ? '02 Desarrollo' : '02 Desarrollo', color: 'var(--ochre)' };
      case 'datos':
        return { label: isEn ? '03 Ciencia de Datos' : '03 Ciencia de Datos', color: 'var(--gold)' };
      default:
        return { label: 'Inmerge', color: 'var(--ink)' };
    }
  };

  return (
    <section
      className="project-carousel-section"
      role="region"
      aria-roledescription="carousel"
      aria-label={isEn ? 'Featured Case Studies' : 'Casos de Éxito y Proyectos Reales'}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <div className="carousel-header">
        <div className="carousel-titles">
          <span className="carousel-eyebrow">
            {isEn ? 'PROVEN TRACK RECORD' : 'CASOS DE ÉXITO & PROYECTOS REALES'}
          </span>
          <h2 className="carousel-main-title">
            {isEn
              ? 'Engineering Impact in Days, Not Months'
              : 'Resultados de Ingeniería en Días, No en Meses'}
          </h2>
          <p className="carousel-subtitle">
            {isEn
              ? 'Direct execution by senior engineers with auditable deliverables, fixed sprints, and zero corporate bureaucracy.'
              : 'Ejecución directa por ingenieros senior con entregables auditables, tiempos ágiles de 1 a 2 semanas y cero sobrecostos.'}
          </p>
        </div>

        {/* Carousel Deck Navigation & Counters */}
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

      {/* Progress Bar for Current Slide */}
      {isAutoplay && !isPaused && (
        <div className="carousel-progress-wrapper" aria-hidden="true">
          <div className="carousel-progress-bar" style={{ width: `${progress}%` }} />
        </div>
      )}

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

      {/* Interactive Snap Scroll Deck Container */}
      <div
        className="carousel-track"
        ref={carouselRef}
        tabIndex={0}
        aria-live="polite"
        onKeyDown={handleKeyDown}
      >
        {filteredProjects.map((project, idx) => {
          const badge = getPillarBadge(project.pillarId);
          const isActive = idx === activeIndex;

          return (
            <article
              key={project.id}
              ref={(el) => (cardRefs.current[idx] = el)}
              className={`carousel-card ${isActive ? 'is-active-card' : ''}`}
              role="group"
              aria-roledescription="slide"
              aria-label={`${isEn ? 'Slide' : 'Caso'} ${idx + 1} ${isEn ? 'of' : 'de'} ${filteredProjects.length}: ${isEn ? project.title.en : project.title.es}`}
              onClick={() => scrollToIndex(idx)}
            >
              <div className="card-top-meta">
                <span className="card-pillar-tag" style={{ borderColor: badge.color, color: badge.color }}>
                  {badge.label}
                </span>
                <span className="card-duration-tag">
                  {isEn ? project.duration.en : project.duration.es}
                </span>
              </div>

              <h3 className="card-project-title">
                {isEn ? project.title.en : project.title.es}
              </h3>

              <div className="card-client-type">
                <strong>{isEn ? 'Client / Sector:' : 'Cliente / Sector:'}</strong>{' '}
                {isEn ? project.clientType.en : project.clientType.es}
              </div>

              <div className="card-challenge-solution">
                <div className="challenge-block">
                  <span className="block-label">{isEn ? 'Challenge:' : 'Desafío:'}</span>
                  <p>{isEn ? project.challenge.en : project.challenge.es}</p>
                </div>
                <div className="solution-block">
                  <span className="block-label">{isEn ? 'Inmerge Solution:' : 'Solución Inmerge:'}</span>
                  <p>{isEn ? project.solution.en : project.solution.es}</p>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="card-metrics-grid">
                {project.metrics.map((m, mIdx) => (
                  <div key={mIdx} className="metric-box">
                    <span className="metric-number">{m.value}</span>
                    <span className="metric-text">{isEn ? m.label.en : m.label.es}</span>
                  </div>
                ))}
              </div>

              {/* Tech Stack Badges */}
              <div className="card-stack-row" aria-label={isEn ? 'Technologies used' : 'Tecnologías empleadas'}>
                {project.stack.map((tech, sIdx) => (
                  <span key={sIdx} className="stack-pill">
                    {tech}
                  </span>
                ))}
              </div>

              {/* CTA Action */}
              <div className="card-footer-cta">
                <button
                  type="button"
                  className="btn-quote-similar"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onQuoteProject) onQuoteProject(project);
                  }}
                >
                  {isEn ? 'Estimate Similar Project →' : 'Cotizar Proyecto Similar →'}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* Slide Pagination Dots / Quick Selector */}
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
