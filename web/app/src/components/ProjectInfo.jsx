import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function ProjectInfo({ project }) {
  const { lang, isEn } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!project) return null;

  const clientName = project.client?.[lang] || project.client?.es || '';
  const industryName = project.industry?.[lang] || project.industry?.es || '';
  const projectTitle = project.title?.[lang] || project.title?.es || '';
  const description = project.description?.[lang] || project.description?.es || '';
  const scopeItems = project.scope?.[lang] || project.scope?.es || [];
  const resultItems = project.results?.[lang] || project.results?.es || [];
  const specItems = project.specs?.[lang] || project.specs?.es || [];
  const conditionItems = project.conditions?.[lang] || project.conditions?.es || [];

  const toggleAccordion = () => {
    setIsExpanded((prev) => !prev);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleAccordion();
    }
  };

  return (
    <div className="project-info-sticky-col">
      {/* Indicador de Número y Disciplina */}
      <div className="project-number-badge" aria-label={`Proyecto ${project.number}`}>
        <span className="project-num-text">{project.number}</span>
        <span className="project-num-divider">/</span>
        <span className="project-industry-text">{industryName}</span>
      </div>

      {/* Titular y Cliente */}
      <h3 className="project-client-name">{clientName}</h3>
      <h4 className="project-item-title">{projectTitle}</h4>

      {/* Descripción Corta */}
      <p className="project-description-text">{description}</p>

      {/* Metadatos en Tipografía Monospaciada */}
      {(project.catNumber || project.metadata) && (
        <div className="project-metadata-strip" aria-label={isEn ? 'Project Metadata' : 'Metadatos del Proyecto'}>
          {project.catNumber && <span className="metadata-pill-tag">[{project.catNumber}]</span>}
          {project.metadata &&
            Object.entries(project.metadata).map(([key, val]) => (
              <span key={key} className="metadata-pill-tag">
                [{key.toUpperCase()}: {val}]
              </span>
            ))}
        </div>
      )}

      {/* Acordeón de Divulgación Progresiva */}
      <div className="project-accordion-wrapper">
        <button
          type="button"
          className={`project-accordion-trigger ${isExpanded ? 'active' : ''}`}
          aria-expanded={isExpanded}
          aria-controls={`project-details-${project.id}`}
          onClick={toggleAccordion}
          onKeyDown={handleKeyDown}
        >
          <span className="trigger-symbol" aria-hidden="true">
            {isExpanded ? '−' : '+'}
          </span>
          <span>
            {isExpanded
              ? isEn
                ? 'Hide technical details'
                : 'Ocultar detalles técnicos'
              : isEn
                ? 'View technical details'
                : 'Ver detalles técnicos'}
          </span>
        </button>

        {isExpanded && (
          <div id={`project-details-${project.id}`} className="project-accordion-content" role="region">
            {/* Especificaciones Técnicas */}
            {specItems.length > 0 && (
              <div className="accordion-section-block">
                <h5 className="accordion-block-title">
                  <span className="bullet-prefix">◆</span> {isEn ? 'TECHNICAL SPECIFICATIONS' : 'ESPECIFICACIONES TÉCNICAS'}
                </h5>
                <ul className="details-bullets-list">
                  {specItems.map((item, idx) => (
                    <li key={idx} className="details-bullet-item">
                      <span className="bullet-prefix">—</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Condiciones de Entrega & SLA */}
            {conditionItems.length > 0 && (
              <div className="accordion-section-block">
                <h5 className="accordion-block-title">
                  <span className="bullet-prefix">◆</span> {isEn ? 'DELIVERY & SLA CONDITIONS' : 'CONDICIONES DE ENTREGA & SLA'}
                </h5>
                <ul className="details-bullets-list">
                  {conditionItems.map((item, idx) => (
                    <li key={idx} className="details-bullet-item">
                      <span className="bullet-prefix">—</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Stack Tecnológico */}
            {project.stack && project.stack.length > 0 && (
              <div className="accordion-section-block">
                <h5 className="accordion-block-title">{isEn ? 'TECHNOLOGY STACK' : 'STACK TECNOLÓGICO'}</h5>
                <ul className="stack-tags-list">
                  {project.stack.map((tech) => (
                    <li key={tech} className="stack-tag-item">
                      {tech}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Alcance de Ingeniería (fallback) */}
            {specItems.length === 0 && scopeItems.length > 0 && (
              <div className="accordion-section-block">
                <h5 className="accordion-block-title">{isEn ? 'ENGINEERING SCOPE' : 'ALCANCE DE INGENIERÍA'}</h5>
                <ul className="details-bullets-list">
                  {scopeItems.map((item, idx) => (
                    <li key={idx} className="details-bullet-item">
                      <span className="bullet-prefix">◆</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Resultados Auditables */}
            {resultItems.length > 0 && (
              <div className="accordion-section-block">
                <h5 className="accordion-block-title">{isEn ? 'AUDITED RESULTS' : 'RESULTADOS AUDITABLES'}</h5>
                <ul className="details-bullets-list">
                  {resultItems.map((item, idx) => (
                    <li key={idx} className="details-bullet-item result-highlight">
                      <span className="bullet-prefix">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
