import { useState } from 'react';
import { Link } from 'react-router-dom';
import useReveal from '../hooks/useReveal.js';
import useDocumentHead from '../hooks/useDocumentHead.js';
import Frieze from '../components/Frieze.jsx';
import Footer from '../components/Footer.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function Servicios() {
  useReveal();
  const { isEn, content } = useLanguage();

  useDocumentHead({
    title: isEn ? 'Services — Inmerge · Auditing, Cloud Development & Data Science' : 'Servicios — Inmerge · Auditoría, Desarrollo & Datos',
    description: isEn
      ? 'Specialized engineering solutions in Technical Auditing, Cloud Systems Architecture (AWS), and Applied Data Science with Machine Learning.'
      : 'Soluciones especializadas en Auditoría Técnica, Desarrollo de Software en la Nube (AWS) y Ciencia de Datos con Machine Learning.',
    path: isEn ? '/en/services' : '/servicios',
  });

  const [openIndex, setOpenIndex] = useState(0);
  const [selectedPillar, setSelectedPillar] = useState('all');

  const servicesList = content.SERVICES;
  const pillarsList = content.PILLARS;

  const filteredServices = selectedPillar === 'all' ? servicesList : servicesList.filter((s) => s.pillarId === selectedPillar);

  return (
    <>
      {/* Header */}
      <div style={{ padding: '100px clamp(20px,5vw,40px) 60px', maxWidth: 1240, margin: '0 auto' }}>
        <div style={{ fontSize: 13, letterSpacing: 4, color: 'var(--terracotta)', fontWeight: 600, marginBottom: 24 }}>
          {isEn ? 'SERVICES CATALOG' : 'CATÁLOGO DE SERVICIOS'}
        </div>
        <h1
          style={{
            fontFamily: "'Spectral',serif",
            fontWeight: 700,
            fontSize: 'clamp(40px,7vw,88px)',
            lineHeight: 1.05,
            letterSpacing: -1,
            maxWidth: 960,
            margin: '0 0 24px 0',
          }}
        >
          {isEn ? 'Three strategic pillars, zero technical compromise.' : 'Tres pilares, máxima exigencia técnica.'}
        </h1>
        <p style={{ fontSize: 18, color: 'var(--muted)', maxWidth: 640, lineHeight: 1.7, margin: 0 }}>
          {isEn
            ? 'From independent data and cloud systems audits, to bespoke AWS infrastructure and production-grade machine learning models.'
            : 'Desde la auditoría de integridad de datos y sistemas, pasando por la arquitectura cloud a medida, hasta modelos predictivos de Machine Learning listos para producción.'}
        </p>
      </div>

      <Frieze border="#A8472B" upColor="#D8A84E" downColor="#C68A3D" medallionBg="#A8472B" medallionBorder="#F3EADA" />

      {/* Main Container */}
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '60px clamp(20px,5vw,40px) 140px' }}>
        {/* Pillar Filter Tabs */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
            marginBottom: 48,
            borderBottom: '1px solid var(--border)',
            paddingBottom: 20,
          }}
        >
          <button
            type="button"
            onClick={() => setSelectedPillar('all')}
            style={{
              background: selectedPillar === 'all' ? 'var(--terracotta)' : 'transparent',
              color: selectedPillar === 'all' ? '#F3EADA' : 'var(--ink)',
              border: '1px solid',
              borderColor: selectedPillar === 'all' ? 'var(--terracotta)' : 'var(--border)',
              padding: '10px 22px',
              fontSize: 14,
              fontWeight: selectedPillar === 'all' ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {isEn ? `All services (${servicesList.length})` : `Todos los servicios (${servicesList.length})`}
          </button>

          {pillarsList.map((pillar) => {
            const isSelected = selectedPillar === pillar.id;
            return (
              <button
                key={pillar.id}
                type="button"
                onClick={() => setSelectedPillar(pillar.id)}
                style={{
                  background: isSelected ? 'var(--terracotta)' : 'transparent',
                  color: isSelected ? '#F3EADA' : 'var(--ink)',
                  border: '1px solid',
                  borderColor: isSelected ? 'var(--terracotta)' : 'var(--border)',
                  padding: '10px 22px',
                  fontSize: 14,
                  fontWeight: isSelected ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {isEn ? `Pillar ${pillar.number}: ${pillar.title}` : `Pilar ${pillar.number}: ${pillar.title}`}
              </button>
            );
          })}
        </div>

        {/* Services Accordion List */}
        <div>
          {filteredServices.map((s, i) => {
            const isOpen = openIndex === i;
            const waQuoteText = isEn
              ? `Hello Inmerge team, I would like to request a proposal for "${s.name}" (${s.pillarName}). Can we schedule a preliminary call?`
              : `Hola Inmerge, deseo cotizar el servicio "${s.name}" (${s.pillarName}). ¿Podemos coordinar una llamada?`;
            const quoteWaUrl = content.waLink(waQuoteText);

            return (
              <details
                key={s.number}
                name="inmerge-services"
                open={isOpen}
                onToggle={(e) => {
                  if (e.currentTarget.open) {
                    setOpenIndex(i);
                  } else if (openIndex === i) {
                    setOpenIndex(null);
                  }
                }}
                className="service-accordion-item"
                data-reveal=""
              >
                <summary
                  className="row-hover"
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: '12px 24px',
                    padding: '32px 8px',
                    cursor: 'pointer',
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    font: 'inherit',
                    color: 'inherit',
                    textAlign: 'left',
                    userSelect: 'none',
                  }}
                >
                  <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 14, color: 'var(--terracotta)', flexShrink: 0 }}>
                    {s.number}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Spectral',serif",
                      fontWeight: 600,
                      fontSize: 'clamp(20px,2.4vw,28px)',
                      flex: 1,
                      minWidth: 220,
                    }}
                  >
                    {s.name}
                  </div>
                  <div
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 12,
                      letterSpacing: 0.5,
                      color: 'var(--terracotta)',
                      background: 'rgba(168,71,43,0.08)',
                      padding: '4px 10px',
                      flexShrink: 0,
                    }}
                  >
                    {s.pillarName}
                  </div>
                  <div style={{ fontSize: 13, letterSpacing: 0.5, color: 'var(--muted)', flexShrink: 0 }}>{s.timeline}</div>
                  <div
                    style={{
                      width: 14,
                      height: 14,
                      background: 'var(--terracotta)',
                      transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s ease',
                      flexShrink: 0,
                      marginLeft: 'auto',
                    }}
                  />
                </summary>

                <div
                  id={`service-panel-${s.number}`}
                  style={{
                    padding: '0 8px clamp(24px,4vw,40px)',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))',
                    gap: 24,
                    animation: 'fadeIn 0.25s ease',
                  }}
                >
                  {/* Problem Card */}
                  <div style={{ background: 'var(--cream2)', border: '1px solid var(--border)', padding: 24 }}>
                    <div
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 11,
                        letterSpacing: 1.5,
                        color: 'var(--muted)',
                        fontWeight: 600,
                        marginBottom: 8,
                      }}
                    >
                      {isEn ? 'DIAGNOSTIC / PROBLEM' : 'DIAGNÓSTICO / PROBLEMA'}
                    </div>
                    <div style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--ink)' }}>{s.problem}</div>
                  </div>

                  {/* Value Card */}
                  <div style={{ background: 'var(--ink)', color: 'var(--bg)', padding: 24 }}>
                    <div
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 11,
                        letterSpacing: 1.5,
                        color: 'var(--gold)',
                        fontWeight: 600,
                        marginBottom: 8,
                      }}
                    >
                      {isEn ? 'VALUE PROPOSITION' : 'PROPUESTA DE VALOR'}
                    </div>
                    <div style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--tan-text)' }}>{s.value}</div>
                  </div>

                  {/* Deliverables & CTA */}
                  <div
                    style={{
                      gridColumn: '1 / -1',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 20,
                      background: 'var(--bg)',
                      border: '1px solid var(--border)',
                      padding: '20px 24px',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontFamily: "'IBM Plex Mono', monospace",
                          fontSize: 11,
                          letterSpacing: 1.5,
                          color: 'var(--muted)',
                          fontWeight: 600,
                          marginBottom: 10,
                        }}
                      >
                        {isEn ? 'TANGIBLE DELIVERABLES' : 'ENTREGABLES TANGIBLES'}
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {s.deliverables.map((d) => (
                          <div
                            key={d}
                            style={{
                              border: '1px solid var(--border)',
                              background: 'var(--cream2)',
                              padding: '6px 14px',
                              fontSize: 13,
                              color: 'var(--ink)',
                            }}
                          >
                            {d}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      <Link
                        to={
                          isEn ? `/en/contact?service=${encodeURIComponent(s.name)}` : `/contacto?servicio=${encodeURIComponent(s.name)}`
                        }
                        style={{
                          background: 'var(--terracotta)',
                          color: '#F3EADA',
                          padding: '10px 20px',
                          fontSize: 13,
                          fontWeight: 600,
                          textDecoration: 'none',
                        }}
                        className="btn-accent"
                      >
                        {isEn ? 'Request Scope (TDR)' : 'Solicitar TDR'}
                      </Link>
                      <a
                        href={quoteWaUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          background: 'transparent',
                          color: 'var(--ink)',
                          border: '1px solid var(--border)',
                          padding: '10px 18px',
                          fontSize: 13,
                          fontWeight: 600,
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                        className="btn-outline-hover"
                      >
                        <span>WhatsApp</span>
                        <span aria-hidden="true">→</span>
                      </a>
                    </div>
                  </div>
                </div>
              </details>
            );
          })}
          <div style={{ borderTop: '1px solid var(--border)' }} />
        </div>
      </div>

      {/* Bottom CTA Banner */}
      <div
        data-reveal=""
        style={{
          position: 'relative',
          background: 'var(--ink)',
          color: 'var(--bg)',
          padding: '140px clamp(20px,5vw,40px)',
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
          <h2
            style={{
              fontFamily: "'Spectral',serif",
              fontWeight: 700,
              fontSize: 'clamp(32px,5vw,56px)',
              marginBottom: 20,
              lineHeight: 1.15,
            }}
          >
            {isEn ? 'Need a tailored combination of services?' : '¿Necesitas una combinación de servicios?'}
          </h2>
          <p style={{ fontSize: 16, color: 'var(--tan-text)', marginBottom: 36, maxWidth: 600, margin: '0 auto 36px' }}>
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
                borderRadius: 2,
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
              {isEn ? 'View Methodology & Stack' : 'Ver Metodología & Stack'}
            </Link>
          </div>
        </div>
      </div>

      <Frieze border="#D8A84E" upColor="#C68A3D" downColor="#A8472B" medallionBg="#D8A84E" medallionBorder="#241A12" />

      <Footer />
    </>
  );
}
