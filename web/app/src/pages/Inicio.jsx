import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useReducedMotion from '../hooks/useReducedMotion.js';
import useDocumentHead from '../hooks/useDocumentHead.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import { openCookiePreferences } from '../lib/cookies.js';

export default function Inicio() {
  const { isEn } = useLanguage();
  const prefersReducedMotion = useReducedMotion();

  useDocumentHead({
    title: isEn
      ? 'Inmerge — Software Engineering, Systems Auditing & Data Science'
      : 'Inmerge — Auditoría, Desarrollo Tecnológico & Ciencia de Datos',
    description: isEn
      ? 'High-density engineering consultancy in Lima, Peru: Systems and data auditing, AWS cloud architecture, custom software, and predictive Machine Learning.'
      : 'Consultoría técnica de alto impacto en Lima, Perú: Auditoría de sistemas y datos, desarrollo cloud en AWS, software a medida y modelos de Machine Learning.',
    path: isEn ? '/en' : '/',
  });

  const fullHeadline = isEn
    ? 'Software engineering, systems auditing & data intelligence.'
    : 'Ingeniería de software, auditoría de sistemas e inteligencia de datos.';

  const [typedLength, setTypedLength] = useState(() => (prefersReducedMotion ? fullHeadline.length : 0));

  useEffect(() => {
    if (prefersReducedMotion) {
      setTypedLength(fullHeadline.length);
      return;
    }
    setTypedLength(0);
    let currentIndex = 0;
    const timer = setInterval(() => {
      currentIndex += 1;
      setTypedLength(currentIndex);
      if (currentIndex >= fullHeadline.length) {
        clearInterval(timer);
      }
    }, 32);

    return () => clearInterval(timer);
  }, [fullHeadline, prefersReducedMotion]);

  const displayedText = fullHeadline.slice(0, typedLength);
  const isTypingComplete = typedLength >= fullHeadline.length;

  const portals = [
    {
      code: '01',
      tag: isEn ? 'SERVICES' : 'SERVICIOS',
      title: isEn ? 'Monograph & 1:1 Prototypes' : 'Monografía & Prototipos 1:1',
      desc: isEn
        ? 'Curatorial pavilion with technical specifications, timelines, and auditable deliverables.'
        : 'Cédula curatorial con especificaciones técnicas, plazos y entregables auditables.',
      action: isEn ? 'Explore room ↗' : 'Explorar sala ↗',
      to: isEn ? '/en/services' : '/servicios',
    },
    {
      code: '02',
      tag: isEn ? 'ABOUT' : 'NOSOTROS',
      title: isEn ? 'Manifesto & Directors' : 'Manifiesto & Directores',
      desc: isEn
        ? 'Engineering principles, Mochica Method of 4 phases, and senior directorial team.'
        : 'Principios de ingeniería, Método Mochica de 4 fases y equipo directivo senior.',
      action: isEn ? 'Discover the firm ↗' : 'Conocer la firma ↗',
      to: isEn ? '/en/about' : '/nosotros',
    },
    {
      code: '03',
      tag: isEn ? 'CONTACT' : 'CONTACTO',
      title: isEn ? 'Proposals & Technical Scope' : 'Términos de Referencia (TDR)',
      desc: isEn
        ? 'Direct technical discussion with senior partners, WhatsApp channel, and project scope.'
        : 'Evaluación técnica directa con consultores senior, canal WhatsApp y alcance a medida.',
      action: isEn ? 'Initiate consultation ↗' : 'Iniciar consulta ↗',
      to: isEn ? '/en/contact' : '/contacto',
    },
  ];

  return (
    <div id="hero-section" className="atrium-hero-section">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0,
          opacity: 0.42,
        }}
      >
        <source src="/hero_inmerge.mp4" type="video/mp4" />
      </video>

      {/* Cinematic Gradient Overlay */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(36,26,18,0.72) 0%, rgba(36,26,18,0.85) 50%, rgba(36,26,18,0.97) 100%)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      {/* Decorative Mochica Diamond Accent */}
      <div
        className="breathe-diamond"
        aria-hidden="true"
        style={{
          position: 'absolute',
          right: 'clamp(16px, 6vw, 60px)',
          top: '14%',
          width: 'clamp(28px, 4vw, 48px)',
          height: 'clamp(28px, 4vw, 48px)',
          background: 'var(--terracotta)',
          zIndex: 2,
          opacity: 0.85,
        }}
      />

      <div className="atrium-inner-container">
        {/* Middle Body with Typewriter Heading */}
        <div className="atrium-center-body">
          <div className="atrium-coords-tag">
            <span className="atrium-coords-dot" aria-hidden="true" />
            <span>
              {isEn ? '08°06′S 79°01′W · LIMA, PERU · ENGINEERING CONSULTANCY' : '08°06′S 79°01′W · LIMA, PERÚ · CONSULTORÍA DE INGENIERÍA'}
            </span>
          </div>

          <h1 className="atrium-h1" aria-label={fullHeadline}>
            <span aria-hidden="true">
              {displayedText}
              <span className={`typewriter-cursor ${isTypingComplete ? 'is-complete' : 'is-typing'}`} aria-hidden="true">
                |
              </span>
            </span>
            <span className="sr-only">{fullHeadline}</span>
          </h1>

          <p className="atrium-subhead">
            {isEn
              ? 'Direct senior engineering advisory in mission-critical systems, cloud architectures, and applied data science.'
              : 'Consultoría senior directa en sistemas de misión crítica, arquitecturas cloud y ciencia de datos aplicada.'}
          </p>
        </div>

        {/* Bottom Tier: Pure Typographic Portals (No Boxes, No Lines) */}
        <div className="atrium-portals-wrapper">
          <nav className="atrium-portals-grid" aria-label={isEn ? 'Exhibition Portals' : 'Salas de Exhibición'}>
            {portals.map((portal) => (
              <Link key={portal.code} to={portal.to} className="atrium-portal-card">
                <div>
                  <div className="atrium-portal-tag">
                    [ {portal.code} / {portal.tag} ]
                  </div>
                  <h2 className="atrium-portal-title">{portal.title}</h2>
                  <p className="atrium-portal-desc">{portal.desc}</p>
                </div>
                <div className="atrium-portal-action">
                  <span>{portal.action}</span>
                </div>
              </Link>
            ))}
          </nav>

          {/* Micro Institutional Footer Bar */}
          <div className="atrium-micro-footer">
            <div>INMERGE S.A.C. · 2026</div>
            <div>
              <Link to={isEn ? '/en/cookies' : '/cookies'}>{isEn ? 'Cookie Policy' : 'Política de Cookies'}</Link>
              {' · '}
              <button type="button" onClick={openCookiePreferences}>
                {isEn ? 'Cookie Settings' : 'Configurar Cookies'}
              </button>
            </div>
            <div>inmerge3@gmail.com · Lima, Perú</div>
          </div>
        </div>
      </div>
    </div>
  );
}
