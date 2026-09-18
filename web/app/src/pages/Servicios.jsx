import { useState } from 'react';
import { Link } from 'react-router-dom';
import useReveal from '../hooks/useReveal.js';
import useDocumentHead from '../hooks/useDocumentHead.js';
import Footer from '../components/Footer.jsx';
import QuickEstimator from '../components/QuickEstimator.jsx';
import LLMAssistantModal from '../components/LLMAssistantModal.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function Servicios() {
  useReveal();
  const { isEn } = useLanguage();
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [assistantContext, setAssistantContext] = useState(null);

  const handleOpenAssistant = (ctx = null) => {
    setAssistantContext(ctx);
    setIsAssistantOpen(true);
  };

  useDocumentHead({
    title: isEn ? 'Services — Inmerge · Auditing, Cloud Development & Data Science' : 'Servicios — Inmerge · Auditoría, Desarrollo & Datos',
    description: isEn
      ? 'Specialized engineering solutions in Technical Auditing, Cloud Systems Architecture (AWS), and Applied Data Science with Machine Learning.'
      : 'Soluciones especializadas en Auditoría Técnica, Desarrollo de Software en la Nube (AWS) y Ciencia de Datos con Machine Learning.',
    path: isEn ? '/en/services' : '/servicios',
  });

  return (
    <>
      {/* Header */}
      <div style={{ padding: '120px clamp(24px, 5vw, 64px) 40px', maxWidth: 1440, margin: '0 auto' }}>
        <div style={{ fontSize: 13, letterSpacing: 4, color: 'var(--terracotta)', fontWeight: 600, marginBottom: 24 }}>
          {isEn ? 'SERVICES & ESTIMATION' : 'SERVICIOS & ESTIMACIÓN ÁGIL'}
        </div>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 'clamp(42px,7.5vw,96px)',
            lineHeight: 1.05,
            letterSpacing: -1,
            maxWidth: 1100,
            margin: '0 0 28px 0',
          }}
        >
          {isEn ? 'Three strategic pillars, zero technical compromise.' : 'Tres pilares, máxima exigencia técnica.'}
        </h1>
        <p style={{ fontSize: 'clamp(17px, 1.8vw, 20px)', color: 'var(--muted)', maxWidth: 760, lineHeight: 1.7, margin: 0 }}>
          {isEn
            ? 'From independent data and cloud systems audits, to bespoke AWS infrastructure and production-grade machine learning models. Agile sprints, zero bureaucracy.'
            : 'Desde la auditoría de integridad de datos y sistemas, pasando por la arquitectura cloud a medida, hasta modelos predictivos de Machine Learning listos para producción en sprints ágiles de 1 a 2 semanas.'}
        </p>
      </div>

      {/* Main Container - Quick Estimator */}
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '20px clamp(24px, 5vw, 64px) 140px' }}>
        <QuickEstimator
          initialPillar="auditoria"
          onOpenLLMAssistant={(ctx) => handleOpenAssistant(ctx)}
        />
      </div>

      {/* Bottom CTA Banner — Unified Canvas */}
      <div
        data-reveal=""
        style={{
          position: 'relative',
          background: 'var(--bg)',
          color: 'var(--ink)',
          borderTop: '1px solid var(--border)',
          padding: '120px clamp(20px,5vw,40px)',
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
            opacity: 0.06,
            transform: 'rotate(45deg)',
          }}
        />
        <div style={{ position: 'relative', maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 'clamp(32px,5vw,56px)',
              marginBottom: 20,
              lineHeight: 1.15,
              color: 'var(--ink)',
            }}
          >
            {isEn ? 'Need a tailored combination of services?' : '¿Necesitas una combinación de servicios?'}
          </h2>
          <p style={{ fontSize: 16, color: 'var(--muted)', marginBottom: 36, maxWidth: 600, margin: '0 auto 36px', lineHeight: 1.65 }}>
            {isEn
              ? 'Many enterprise mandates start with a 3-week Technical Audit and transition directly into Cloud Architecture or Predictive AI. We engineer modular proposals aligned with your milestones.'
              : 'Muchos proyectos inician con una Auditoría Técnica de 3 semanas y continúan con el Desarrollo Cloud o la Ciencia de Datos. Estructuramos propuestas modulares adaptadas a tus metas.'}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
            <Link
              to={isEn ? '/en/contact' : '/contacto'}
              style={{
                background: 'var(--gold)',
                color: 'var(--ink)',
                borderRadius: 4,
                padding: '18px 36px',
                fontSize: 16,
                fontWeight: 700,
                textDecoration: 'none',
              }}
              className="btn-hover"
            >
              {isEn ? 'Complete Technical Scope Form' : 'Completar Formulario de TDR'}
            </Link>
            <Link
              to={isEn ? '/en/about#metodo' : '/nosotros#metodo'}
              style={{
                background: 'transparent',
                color: 'var(--ink)',
                border: '1px solid var(--border)',
                borderRadius: 4,
                padding: '18px 32px',
                fontSize: 16,
                fontWeight: 600,
                textDecoration: 'none',
              }}
              className="btn-outline"
            >
              {isEn ? 'View Methodology & Stack' : 'Ver Metodología & Stack'}
            </Link>
          </div>
        </div>
      </div>

      {/* Floating AI Assistant Trigger Button */}
      <button
        type="button"
        className="floating-assistant-btn"
        onClick={() => handleOpenAssistant()}
        aria-label={isEn ? 'Open AI Engineering Assistant' : 'Abrir Asistente Técnico de IA'}
      >
        <span aria-hidden="true">💬</span>
        <span>{isEn ? 'AI Assistant' : 'Asistente IA'}</span>
      </button>

      {/* Interactive LLM Assistant Modal */}
      <LLMAssistantModal
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        initialContext={assistantContext}
      />

      <Footer />
    </>
  );
}
