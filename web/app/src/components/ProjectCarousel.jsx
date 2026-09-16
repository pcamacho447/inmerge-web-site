import { useState, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { PROJECTS_DATA } from '../data/projectsData';

export default function ProjectCarousel({ onQuoteProject }) {
  const { lang } = useLanguage();
  const [selectedPillar, setSelectedPillar] = useState('all');
  const carouselRef = useRef(null);

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

  const scroll = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = carouselRef.current.clientWidth * 0.85;
      carouselRef.current.scrollBy({
        left: direction === 'next' ? scrollAmount : -scrollAmount,
        behavior: 'smooth',
      });
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

        <div className="carousel-controls" aria-label={isEn ? 'Carousel navigation' : 'Navegación del carrusel'}>
          <button
            type="button"
            className="carousel-arrow-btn"
            onClick={() => scroll('prev')}
            aria-label={isEn ? 'Previous projects' : 'Ver proyectos anteriores'}
          >
            ←
          </button>
          <button
            type="button"
            className="carousel-arrow-btn"
            onClick={() => scroll('next')}
            aria-label={isEn ? 'Next projects' : 'Ver proyectos siguientes'}
          >
            →
          </button>
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

      {/* Snap Scroll Container */}
      <div className="carousel-track" ref={carouselRef} tabIndex={0} aria-live="polite">
        {filteredProjects.map((project) => {
          const badge = getPillarBadge(project.pillarId);
          return (
            <article key={project.id} className="carousel-card">
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
                {project.metrics.map((m, idx) => (
                  <div key={idx} className="metric-box">
                    <span className="metric-number">{m.value}</span>
                    <span className="metric-text">{isEn ? m.label.en : m.label.es}</span>
                  </div>
                ))}
              </div>

              {/* Tech Stack Badges */}
              <div className="card-stack-row" aria-label={isEn ? 'Technologies used' : 'Tecnologías empleadas'}>
                {project.stack.map((tech, idx) => (
                  <span key={idx} className="stack-pill">
                    {tech}
                  </span>
                ))}
              </div>

              {/* CTA Action */}
              <div className="card-footer-cta">
                <button
                  type="button"
                  className="btn-quote-similar"
                  onClick={() => onQuoteProject && onQuoteProject(project)}
                >
                  {isEn ? 'Estimate Similar Project →' : 'Cotizar Proyecto Similar →'}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
