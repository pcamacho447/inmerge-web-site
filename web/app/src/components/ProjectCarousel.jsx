import { useState, useRef, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { PROJECTS_DATA } from '../data/projectsData';
import useReducedMotion from '../hooks/useReducedMotion';
import AnimatedNumber from './AnimatedNumber';

/**
 * ProjectCarousel / ProjectShowcase — Continuous Editorial Precision Canvas (Split Master-Detail).
 *
 * Implements a cardless, natural editorial canvas layout inspired by top tech engineering teams
 * (Linear, Stripe, Vercel) and 'modern-web-guidance' directional view transitions.
 *
 * - Left column (35%): Master Index of engineering case studies with KPI teasers.
 * - Right column (65%): Precision Canvas showing active architecture blueprints, forensic
 *   challenge/solution analyses, auditable deliverables, and animated live metrics.
 */
export default function ProjectCarousel({ onQuoteProject }) {
  const { lang } = useLanguage();
  const prefersReducedMotion = useReducedMotion();
  const isEn = lang === 'en';

  const [activeIndex, setActiveIndex] = useState(0);
  const itemRefs = useRef([]);
  const detailPanelRef = useRef(null);

  const projects = PROJECTS_DATA;
  const N = projects.length;
  const activeProject = projects[activeIndex] || projects[0];

  // Modern Directional Navigation Transition using View Transitions API
  const selectProject = useCallback(
    (targetIdx) => {
      if (targetIdx === activeIndex || targetIdx < 0 || targetIdx >= N) return;
      const direction = targetIdx > activeIndex ? 'forward' : 'backward';

      // Progressive Enhancement: Check for native View Transitions support & reduced motion
      if (!document.startViewTransition || prefersReducedMotion) {
        setActiveIndex(targetIdx);
        return;
      }

      // Trigger transition with directional types supported by modern browsers
      document.startViewTransition({
        update: () => {
          setActiveIndex(targetIdx);
        },
        types: [direction],
      });
    },
    [activeIndex, N, prefersReducedMotion],
  );

  // Stepper handlers
  const handlePrev = useCallback(() => {
    const prevIdx = (activeIndex - 1 + N) % N;
    selectProject(prevIdx);
  }, [activeIndex, N, selectProject]);

  const handleNext = useCallback(() => {
    const nextIdx = (activeIndex + 1) % N;
    selectProject(nextIdx);
  }, [activeIndex, N, selectProject]);

  // Keyboard navigation on the tab list (WCAG 2.1 AA)
  const handleKeyDown = (e) => {
    let targetIdx = null;

    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      targetIdx = (activeIndex + 1) % N;
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      targetIdx = (activeIndex - 1 + N) % N;
    } else if (e.key === 'Home') {
      e.preventDefault();
      targetIdx = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      targetIdx = N - 1;
    }

    if (targetIdx !== null) {
      selectProject(targetIdx);
      itemRefs.current[targetIdx]?.focus();
    }
  };

  const getPillarBadge = (pillarId) => {
    switch (pillarId) {
      case 'auditoria':
        return {
          label: isEn ? 'Pilar 01 · Technical Audit' : 'Pilar 01 · Auditoría Técnica',
          color: 'var(--terracotta)',
        };
      case 'desarrollo':
        return {
          label: isEn ? 'Pilar 02 · Cloud Development' : 'Pilar 02 · Desarrollo Cloud',
          color: 'var(--ochre)',
        };
      case 'datos':
        return {
          label: isEn ? 'Pillar 03 · Data Science & AI' : 'Pilar 03 · Ciencia de Datos & IA',
          color: 'var(--gold)',
        };
      default:
        return { label: 'Inmerge Engineering', color: 'var(--ink)' };
    }
  };

  const currentBadge = getPillarBadge(activeProject.pillarId);
  const diagramSteps = activeProject.diagram ? activeProject.diagram.steps || activeProject.diagram.nodes || [] : [];
  const deliverablesList = activeProject.deliverables
    ? Array.isArray(activeProject.deliverables)
      ? activeProject.deliverables
      : isEn
        ? activeProject.deliverables.en || []
        : activeProject.deliverables.es || []
    : [];

  return (
    <section
      className="project-showcase-section project-carousel-section"
      role="region"
      aria-label={isEn ? 'Featured Case Studies & Technical Architecture' : 'Casos de Éxito & Arquitectura Técnica'}
    >
      {/* High-Engineering Editorial Header */}
      <div className="showcase-header carousel-header">
        <span className="showcase-eyebrow carousel-eyebrow">
          {isEn ? 'CASE STUDIES · FORENSIC ARCHITECTURE' : 'CASOS DE ESTUDIO · ARQUITECTURA FORENSE'}
        </span>
        <h2 className="showcase-main-title carousel-main-title">
          {isEn
            ? 'Production Engineering: Technical evidence and auditable outcomes.'
            : 'Ingeniería en Producción: Evidencia técnica y resultados auditables.'}
        </h2>
        <p className="showcase-subtitle carousel-subtitle">
          {isEn
            ? 'Real-world case studies across database sanitization, AWS cloud modernization, and predictive AI deployed in production.'
            : 'Casos representativos de auditoría de datos, modernización cloud en AWS e inteligencia predictiva implementados en producción.'}
        </p>
      </div>

      {/* Master-Detail Split Grid on the Natural Page Canvas (Zero Cards) */}
      <div className="showcase-canvas-split">
        {/* Master Index Navigation (Accessible Tablist) */}
        <div
          className="showcase-index-nav"
          role="tablist"
          aria-orientation="vertical"
          aria-label={isEn ? 'Technical case studies index' : 'Índice de casos de estudio técnicos'}
          onKeyDown={handleKeyDown}
        >
          {projects.map((project, idx) => {
            const isActive = idx === activeIndex;
            const badge = getPillarBadge(project.pillarId);
            const primaryMetric = project.metrics && project.metrics[0];

            return (
              <button
                key={project.id}
                ref={(el) => (itemRefs.current[idx] = el)}
                type="button"
                role="tab"
                id={`showcase-tab-${project.id}`}
                aria-controls={`showcase-panel-${project.id}`}
                aria-selected={isActive}
                tabIndex={isActive ? 0 : -1}
                className={`showcase-index-item ${isActive ? 'is-active' : ''}`}
                onClick={() => selectProject(idx)}
              >
                <div className="showcase-index-meta">
                  <span className="showcase-index-number">{`0${idx + 1} // 0${N}`}</span>
                  <span className="showcase-index-pillar" style={{ color: badge.color }}>
                    {badge.label.split('·')[0].trim()}
                  </span>
                </div>
                <h4 className="showcase-index-title">{isEn ? project.title.en : project.title.es}</h4>
                {primaryMetric && (
                  <div className="showcase-index-kpi">
                    <strong>{primaryMetric.value}</strong>
                    <span>{isEn ? primaryMetric.label.en : primaryMetric.label.es}</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Active Detail Canvas (Pure Editorial Surface, No Cards) */}
        <div
          ref={detailPanelRef}
          role="tabpanel"
          id={`showcase-panel-${activeProject.id}`}
          aria-labelledby={`showcase-tab-${activeProject.id}`}
          tabIndex={0}
          className="showcase-detail-canvas"
        >
          {/* Top Meta: Pillar Tag & Timeline */}
          <div className="showcase-top-meta">
            <span className="showcase-pillar-tag" style={{ color: currentBadge.color }}>
              <span
                style={{
                  display: 'inline-block',
                  width: 7,
                  height: 7,
                  background: currentBadge.color,
                  marginRight: 4,
                }}
              />
              {currentBadge.label}
            </span>
            <span className="showcase-duration-tag">{isEn ? activeProject.duration.en : activeProject.duration.es}</span>
          </div>

          {/* Project Title & Industry */}
          <h3 className="showcase-project-title">{isEn ? activeProject.title.en : activeProject.title.es}</h3>
          <div className="showcase-client-type">
            <strong>{isEn ? 'Industry / Client:' : 'Industria / Cliente:'}</strong>{' '}
            {isEn ? activeProject.clientType.en : activeProject.clientType.es}
          </div>

          {/* Visual Architecture Blueprint Schematics */}
          {activeProject.diagram && diagramSteps.length > 0 && (
            <div
              className="showcase-blueprint-container"
              aria-label={isEn ? 'System Architecture Blueprint' : 'Blueprint de Arquitectura Técnica'}
            >
              <div className="blueprint-top-bar">
                <span className="blueprint-tag">{isEn ? 'SYSTEM ARCHITECTURE' : 'ARQUITECTURA DE SISTEMA'}</span>
                <span className="blueprint-badge-text">{activeProject.diagram.badge}</span>
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

          {/* Problem vs Solution Split Columns */}
          <div className="showcase-challenge-solution">
            <div className="challenge-block">
              <span className="block-label">{isEn ? 'The Technical Challenge' : 'El Desafío Técnico'}</span>
              <p>{isEn ? activeProject.challenge.en : activeProject.challenge.es}</p>
            </div>
            <div className="solution-block">
              <span className="block-label">{isEn ? 'Inmerge Solution & Architecture' : 'Solución & Arquitectura Inmerge'}</span>
              <p>{isEn ? activeProject.solution.en : activeProject.solution.es}</p>
            </div>
          </div>

          {/* Auditable Deliverables Checklist */}
          {deliverablesList.length > 0 && (
            <div className="showcase-deliverables-box">
              <span className="deliverables-box-title">
                {isEn ? 'AUDITABLE DELIVERABLES PRODUCED:' : 'ENTREGABLES AUDITABLES GENERADOS:'}
              </span>
              <ul className="deliverables-box-list">
                {deliverablesList.map((deliv, dIdx) => (
                  <li key={dIdx}>
                    <span className="deliv-check">✓</span>
                    <span>{typeof deliv === 'string' ? deliv : isEn ? deliv.en : deliv.es}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Metrics Telemetry Grid with Animated Numbers */}
          <div className="showcase-metrics-grid" aria-label={isEn ? 'Results and KPIs' : 'Métricas y Resultados'}>
            {activeProject.metrics.map((m, mIdx) => (
              <div key={`${activeProject.id}-m-${mIdx}`} className="metric-box">
                <AnimatedNumber value={m.value} trigger={true} className="metric-number" />
                <span className="metric-text">{isEn ? m.label.en : m.label.es}</span>
              </div>
            ))}
          </div>

          {/* Tech Stack & Primary Action Row */}
          <div className="showcase-footer-row">
            <div className="showcase-stack-row" aria-label={isEn ? 'Tech stack' : 'Stack tecnológico'}>
              {activeProject.stack.map((tech, sIdx) => (
                <span key={sIdx} className="stack-pill">
                  {tech}
                </span>
              ))}
            </div>

            <button
              type="button"
              className="btn-quote-similar"
              onClick={() => {
                if (onQuoteProject) onQuoteProject(activeProject);
              }}
            >
              {isEn ? 'Estimate Similar Project in Sprints →' : 'Cotizar Proyecto Similar en Sprints →'}
            </button>
          </div>

          {/* Sequential Stepper Controls (Linear Browsing & Accessible Counter) */}
          <div className="showcase-stepper" aria-label={isEn ? 'Case switcher' : 'Navegación secuencial'}>
            <button
              type="button"
              className="showcase-stepper-btn"
              onClick={handlePrev}
              aria-label={isEn ? 'Previous case study' : 'Caso de estudio anterior'}
            >
              ← {isEn ? 'Previous Case' : 'Caso Anterior'}
            </button>

            <span className="showcase-stepper-counter">
              {`${String(activeIndex + 1).padStart(2, '0')} // ${String(N).padStart(2, '0')}`}
            </span>

            <button
              type="button"
              className="showcase-stepper-btn"
              onClick={handleNext}
              aria-label={isEn ? 'Next case study' : 'Siguiente caso de estudio'}
            >
              {isEn ? 'Next Case' : 'Siguiente Caso'} →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
