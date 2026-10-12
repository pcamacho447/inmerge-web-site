import { useRef, useState } from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { MochicaStepIcon } from './MochicaPatterns.jsx';

export default function ProjectRow({ project, onOpenSpec }) {
  const { lang, isEn } = useLanguage();
  const videoRef = useRef(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  if (!project) return null;

  const clientName = project.client?.[lang] || project.client?.es || '';
  const industryName = project.industry?.[lang] || project.industry?.es || '';
  const projectTitle = project.title?.[lang] || project.title?.es || '';
  const summary = project.summary?.[lang] || project.summary?.es || project.description?.[lang] || '';
  const catNumber = project.catNumber || 'INM-CAT-2026.01';
  const stack = project.stack || [];
  const metrics = project.metrics || [];

  const posterSrc = project.posterUrl || project.image || '/projects/data-sanitization.jpg';
  const videoSrc =
    project.videoUrl || (project.media && project.media.find((m) => m.type === 'video')?.url) || '/presencia_web_showcase.mp4';

  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current
        .play()
        .then(() => {
          setIsVideoPlaying(true);
        })
        .catch(() => {
          // Silently ignore rapid mouseleave abort
        });
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsVideoPlaying(false);
    }
  };

  return (
    <article className="project-feed-row project-index-row" id={`project-row-${project.id}`}>
      <div className="project-index-grid">
        {/* Columna 1: Metadatos y Clasificación (25%) */}
        <div className="project-index-col-meta">
          <div className="project-number-badge" aria-label={`${isEn ? 'Project' : 'Proyecto'} ${project.number}`}>
            <span className="project-num-text">{project.number}</span>
            <span className="project-num-divider">/</span>
            <span className="project-industry-text">{industryName}</span>
          </div>

          <h3 className="project-client-name">{clientName}</h3>
          <h4 className="project-item-title">{projectTitle}</h4>

          <div className="project-metadata-strip">
            <span className="metadata-pill-tag">[{catNumber}]</span>
            {stack.slice(0, 3).map((tech, idx) => (
              <span key={idx} className="metadata-pill-tag">
                [{tech.toUpperCase()}]
              </span>
            ))}
          </div>
        </div>

        {/* Columna 2: Visor 1:1 Multimedia con Hover Fade a Video (50%) */}
        <div className="project-index-col-media" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          <div className="project-media-viewport">
            {videoSrc && (
              <video
                ref={videoRef}
                src={videoSrc}
                preload="none"
                muted
                loop
                playsInline
                className="project-media-video"
                aria-hidden="true"
              />
            )}
            <img
              src={posterSrc}
              alt={projectTitle}
              loading="lazy"
              decoding="async"
              className={`project-media-poster ${isVideoPlaying ? 'is-faded' : ''}`}
            />
            <div className="project-media-corner-accent" aria-hidden="true" />
          </div>
        </div>

        {/* Columna 3: Sinopsis, Dictamen y Acción (25%) */}
        <div className="project-index-col-synopsis">
          <div className="project-synopsis-top">
            <MochicaStepIcon level={2} color="var(--gold)" size={22} className="project-synopsis-icon" />
            <p className="project-synopsis-text">{summary}</p>
          </div>

          {metrics.length > 0 && (
            <div className="project-index-metrics-strip">
              {metrics.slice(0, 2).map((m, idx) => (
                <div key={idx} className="index-metric-item">
                  <span className="index-metric-value">{m.value}</span>
                  <span className="index-metric-label">{m.label?.[lang] || m.label?.es}</span>
                </div>
              ))}
            </div>
          )}

          <div className="project-index-action-wrap">
            <button
              type="button"
              className="btn-view-spec"
              onClick={() => onOpenSpec?.(project)}
              aria-label={`${isEn ? 'View technical sheet of' : 'Ver ficha técnica de'} ${projectTitle}`}
            >
              <span className="btn-view-spec-label">{isEn ? 'View Technical Sheet →' : 'Ver Ficha Técnica →'}</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
