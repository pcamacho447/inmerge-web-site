import { useState } from 'react';
import { Link } from 'react-router-dom';
import useReveal from '../hooks/useReveal.js';
import useDocumentHead from '../hooks/useDocumentHead.js';
import Footer from '../components/Footer.jsx';
import ProjectCarousel from '../components/ProjectCarousel.jsx';
import LLMAssistantModal from '../components/LLMAssistantModal.jsx';
import { MochicaDivider } from '../components/MochicaPatterns.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function Inicio() {
  useReveal();
  const { isEn, content } = useLanguage();
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [assistantContext, setAssistantContext] = useState(null);

  const handleOpenAssistant = (ctx = null) => {
    setAssistantContext(ctx);
    setIsAssistantOpen(true);
  };

  useDocumentHead({
    title: isEn
      ? 'Inmerge — Software Engineering, Systems Auditing & Data Science'
      : 'Inmerge — Auditoría, Desarrollo Tecnológico & Ciencia de Datos',
    description: isEn
      ? 'High-density engineering consultancy in Lima, Peru: Systems and data auditing, AWS cloud architecture, custom software, and predictive Machine Learning.'
      : 'Consultoría técnica de alto impacto en Lima, Perú: Auditoría de sistemas y datos, desarrollo cloud en AWS, software a medida y modelos de Machine Learning.',
    path: isEn ? '/en' : '/',
  });

  const heroWa = content.waLink(
    isEn
      ? 'Hello Inmerge team, I would like to speak with a technical specialist regarding an audit, cloud development, or data science project.'
      : 'Hola Inmerge, deseo conversar con un especialista técnico sobre un proyecto de auditoría, desarrollo o ciencia de datos.',
  );

  return (
    <>
      {/* Hero Section with Cinematic Video Background */}
      <div
        id="hero-section"
        style={{
          position: 'relative',
          padding: 'clamp(140px, 16vh, 180px) clamp(24px, 5vw, 64px) clamp(90px, 12vh, 130px)',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          overflow: 'hidden',
          background: 'var(--ink)',
          color: '#F3EADA',
        }}
      >
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
            opacity: 0.45,
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
            background: 'linear-gradient(180deg, rgba(36,26,18,0.72) 0%, rgba(36,26,18,0.85) 60%, rgba(36,26,18,0.96) 100%)',
            zIndex: 1,
            pointerEvents: 'none',
          }}
        />

        {/* Decorative Brand Accent */}
        <div
          className="breathe-diamond"
          aria-hidden="true"
          style={{
            position: 'absolute',
            right: 'clamp(16px,6vw,60px)',
            top: '16%',
            width: 'clamp(32px,5vw,56px)',
            height: 'clamp(32px,5vw,56px)',
            background: 'var(--terracotta)',
            zIndex: 2,
          }}
        />

        <div style={{ position: 'relative', maxWidth: 1440, margin: '0 auto', width: '100%', zIndex: 2 }}>
          <div
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 13,
              letterSpacing: 3,
              color: 'var(--gold)',
              fontWeight: 600,
              marginBottom: 24,
              textTransform: 'uppercase',
            }}
          >
            {isEn ? 'AUDITING · CLOUD DEVELOPMENT · DATA SCIENCE' : 'AUDITORÍA · DESARROLLO CLOUD · CIENCIA DE DATOS'}
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 'clamp(44px,7.5vw,108px)',
              lineHeight: 1.04,
              letterSpacing: -1.5,
              margin: '0 0 32px',
              color: '#F3EADA',
              maxWidth: 1180,
            }}
          >
            {isEn ? (
              <>
                Software engineering,
                <br />
                <span style={{ color: 'var(--gold)' }}>systems auditing</span>
                <br />& data intelligence.
              </>
            ) : (
              <>
                Ingeniería de software,
                <br />
                <span style={{ color: 'var(--gold)' }}>auditoría de sistemas</span>
                <br />e inteligencia de datos.
              </>
            )}
          </h1>
        </div>
      </div>

      {/* Mochica Geometric Pattern Divider */}
      <MochicaDivider color="rgba(216, 168, 78, 0.45)" height={18} seed="inmerge-hero-pillars" />

      {/* Case Studies & Engineering Architecture Showcase */}
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: 'clamp(60px, 8vh, 100px) clamp(24px, 5vw, 64px) clamp(80px, 10vh, 120px)' }}>
        <ProjectCarousel onQuoteProject={(proj) => handleOpenAssistant(proj)} />
      </div>

      {/* Mochica Geometric Pattern Divider */}
      <MochicaDivider color="var(--terracotta)" height={18} seed="inmerge-cta-frieze" opacity={0.65} />

      {/* Final CTA */}
      <div
        style={{
          position: 'relative',
          background: 'var(--ink)',
          color: 'var(--bg)',
          padding: 'clamp(120px, 14vh, 180px) clamp(24px, 5vw, 64px)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: -100,
            bottom: -100,
            width: 340,
            height: 340,
            background: 'var(--terracotta)',
            opacity: 0.15,
            transform: 'rotate(45deg)',
          }}
        />
        <div style={{ position: 'relative', maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <div
            data-reveal=""
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 'clamp(32px,5vw,56px)',
              marginBottom: 24,
              lineHeight: 1.15,
            }}
          >
            {isEn
              ? 'Initiate a technical assessment of your systems and data.'
              : 'Iniciemos una evaluación técnica de tus sistemas y datos.'}
          </div>
          <div data-reveal="" style={{ fontSize: 16, color: 'var(--tan-text)', marginBottom: 40, maxWidth: 560, margin: '0 auto 40px' }}>
            {isEn
              ? 'Senior consultants and engineering leads working directly on your architecture, without intermediaries.'
              : 'Consultores e ingenieros senior trabajando directamente en tu arquitectura, sin intermediarios ni demoras.'}
          </div>
          <div data-reveal="" style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
            <Link
              to={isEn ? '/en/contact' : '/contacto'}
              style={{
                background: 'var(--gold)',
                color: 'var(--ink)',
                borderRadius: 2,
                padding: '18px 36px',
                fontSize: 16,
                fontWeight: 700,
                textDecoration: 'none',
              }}
              className="btn-hover"
            >
              {isEn ? 'Request Scope & Terms (TDR)' : 'Solicitar Términos de Referencia (TDR)'}
            </Link>
            <a
              href={heroWa}
              target="_blank"
              rel="noreferrer"
              style={{
                background: 'transparent',
                color: 'var(--bg)',
                border: '1px solid var(--bg)',
                borderRadius: 2,
                padding: '18px 32px',
                fontSize: 16,
                fontWeight: 600,
                textDecoration: 'none',
              }}
              className="btn-outline"
            >
              {isEn ? 'Contact via WhatsApp' : 'Escribir a WhatsApp'}
            </a>
          </div>
        </div>
      </div>

      {/* Floating AI Assistant Trigger Button — Alaec */}
      <button
        type="button"
        className="floating-assistant-btn"
        onClick={() => handleOpenAssistant()}
        aria-label={isEn ? 'Open Alaec AI Assistant' : 'Abrir Asistente IA Alaec'}
      >
        <span className="alaec-pulse-dot" aria-hidden="true" />
        <span className="alaec-trigger-name">Alaec</span>
        <span className="alaec-trigger-badge">AI</span>
      </button>

      {/* Interactive LLM Assistant Modal */}
      <LLMAssistantModal isOpen={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} initialContext={assistantContext} />

      <Footer />
    </>
  );
}
