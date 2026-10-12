import { useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function ProjectGallery({ mediaList = [] }) {
  const { lang, isEn } = useLanguage();
  const containerRef = useRef(null);

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion =
      typeof window !== 'undefined' && typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false;

    if (!containerRef.current || typeof IntersectionObserver === 'undefined') return;

    const videoElements = containerRef.current.querySelectorAll('video');

    if (prefersReducedMotion) {
      videoElements.forEach((video) => {
        video.pause();
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          if (entry.isIntersecting) {
            video.play().catch(() => {
              // Silently handle browser autoplay policy restriction
            });
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.25 },
    );

    videoElements.forEach((video) => observer.observe(video));

    return () => {
      videoElements.forEach((video) => observer.unobserve(video));
      observer.disconnect();
    };
  }, [mediaList]);

  if (!mediaList || mediaList.length === 0) return null;

  return (
    <div className="project-gallery-grid-12" ref={containerRef}>
      {mediaList.map((item) => {
        const spanClass = `media-span-${item.span || 12}`;
        const itemTitle = item.title?.[lang] || item.title?.es || '';

        return (
          <div key={item.id || item.url} className={`gallery-media-card ${spanClass}`}>
            <div className="media-aspect-wrapper">
              {item.type === 'video' ? (
                <video
                  src={item.url}
                  poster={item.poster}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  className="gallery-media-element"
                  aria-label={itemTitle || (isEn ? 'Project showcase video' : 'Video del proyecto')}
                />
              ) : (
                <img
                  src={item.url || item.poster}
                  alt={itemTitle || (isEn ? 'Project specimen image' : 'Imagen del proyecto')}
                  className="gallery-media-element"
                  loading="lazy"
                />
              )}
            </div>

            {itemTitle && (
              <div className="gallery-media-caption">
                <span className="caption-dot" aria-hidden="true">
                  ◆
                </span>
                <span className="caption-label">{itemTitle}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
