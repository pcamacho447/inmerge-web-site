import { useRef, useState } from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { MochicaStepIcon } from './MochicaPatterns.jsx';

// Mapeo del primer cuadro exacto de cada video para garantizar cero saltos visuales entre reposo y reproducción
const VIDEO_POSTER_MAP = {
  '/presencia_web_showcase.mp4': '/projects/video_showcase_frame0.jpg',
  '/hero_inmerge.mp4': '/projects/video_inmerge_frame0.jpg',
  '/presencia_web_hero.mp4': '/projects/video_hero_frame0.jpg',
};

export default function ProjectRow({ project, onOpenSpec }) {
  const { lang, isEn } = useLanguage();
  const videoRef = useRef(null);
  const [hasVideoError, setHasVideoError] = useState(false);

  if (!project) return null;

  const rawVideoSrc =
    project?.videoUrl || (project?.media && project.media.find((m) => m.type === 'video')?.url) || '/presencia_web_showcase.mp4';

  const clientName = project.client?.[lang] || project.client?.es || '';
  const industryName = project.industry?.[lang] || project.industry?.es || '';
  const projectTitle = project.title?.[lang] || project.title?.es || '';
  const summary = project.summary?.[lang] || project.summary?.es || project.description?.[lang] || '';
  const catNumber = project.catNumber || 'INM-CAT-2026.01';
  const stack = project.stack || [];
  const metrics = project.metrics || [];

  // Poster exacto correspondiente al fotograma 0 del video para sincronización 1:1
  const posterSrc = VIDEO_POSTER_MAP[rawVideoSrc] || project.posterUrl || project.image || '/projects/video_showcase_frame0.jpg';

  // Video posicionado en reposo en el fotograma 0 (#t=0.001) para que el visor muestre el cuadro congelado
  const videoSrc = rawVideoSrc ? `${rawVideoSrc}#t=0.001` : null;

  // Interacción continua:
  // El video está siempre ahí, en reposo/pausado.
  // Al pasar el mouse por encima reproduce; al retirar el mouse se pausa.
  const handleMouseEnter = () => {
    if (hasVideoError) return;
    const videoEl = videoRef.current;
    if (!videoEl) return;

    const playPromise = videoEl.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Ignorar interrupciones silenciosas del navegador
      });
    }
  };

  const handleMouseLeave = () => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    videoEl.pause();
  };

  const handleClickMedia = () => {
    if (hasVideoError) return;
    const videoEl = videoRef.current;
    if (!videoEl) return;

    if (videoEl.paused) {
      const playPromise = videoEl.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    } else {
      videoEl.pause();
    }
  };

  const handleKeyDownMedia = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClickMedia();
    }
  };

  return (
    <article className="project-feed-row project-index-row" id={`project-row-${project.id}`}>
      <div className="project-index-grid">
        {/* Columna 1: Metadatos y Clasificación (25%) */}
        <div className="project-index-col-meta">
          <div className="project-number-badge" aria-label={`${isEn ? 'Project' : 'Proyecto'} ${project.number}`}>
            <span className="project-num-text">{project.number}</span>
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

        {/* Columna 2: Visor 1:1 Multimedia (El video reside pausado; reproduce al pasar el mouse y se pausa al salir) */}
        <div
          className="project-index-col-media"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleClickMedia}
          onFocus={handleMouseEnter}
          onBlur={handleMouseLeave}
          onKeyDown={handleKeyDownMedia}
          tabIndex={0}
          role="button"
          aria-label={`${isEn ? 'Play video of' : 'Reproducir video de'} ${projectTitle}`}
        >
          <div className="project-media-viewport">
            {videoSrc && !hasVideoError ? (
              <video
                ref={videoRef}
                src={videoSrc}
                poster={posterSrc}
                muted
                loop
                playsInline
                preload="metadata"
                className="project-media-video"
                aria-label={projectTitle}
                onError={() => setHasVideoError(true)}
              />
            ) : (
              <img
                src={posterSrc}
                alt={projectTitle}
                loading="eager"
                decoding="async"
                className="project-media-poster-static"
                onError={(e) => {
                  e.currentTarget.src = '/projects/video_showcase_frame0.jpg';
                }}
              />
            )}
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
