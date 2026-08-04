import { useState } from 'react';
import useReveal from '../hooks/useReveal.js';
import useDocumentHead from '../hooks/useDocumentHead.js';
import Frieze from '../components/Frieze.jsx';
import Footer from '../components/Footer.jsx';
import { waLink, SERVICES } from '../data/content.js';

export default function Servicios() {
  useReveal();
  useDocumentHead({
    title: 'Servicios — Inmerge',
    description:
      'Seis servicios, un mismo método: diagnóstico de datos, arquitectura en la nube, dashboards ejecutivos, gobierno de datos, capacitación en IA y sistema vivo.',
    path: '/servicios',
  });
  // Defaults open on "01 Diagnóstico de Datos" — the lowest-commitment entry
  // point in the service ladder (explicitly framed in its own copy as "sin
  // comprometerse todavía a un proyecto grande"), so a first-time visitor sees
  // one worked example without having to click first.
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <>
      <div style={{ padding: '100px clamp(20px,5vw,40px) 60px', maxWidth: 1240, margin: '0 auto' }}>
        <div style={{ fontSize: 13, letterSpacing: 4, color: 'var(--terracotta)', fontWeight: 600, marginBottom: 24 }}>PORTAFOLIO</div>
        <div
          style={{
            fontFamily: "'Spectral',serif",
            fontWeight: 700,
            fontSize: 'clamp(40px,7vw,88px)',
            lineHeight: 1,
            letterSpacing: -1,
            maxWidth: 900,
          }}
        >
          Seis servicios, un mismo método.
        </div>
        <p style={{ fontSize: 17, color: 'var(--muted)', maxWidth: 560, lineHeight: 1.7, marginTop: 28 }}>
          Del diagnóstico inicial al sistema vivo — cada servicio corresponde a una fase real del Método Acequia. Toca cada uno para ver el
          detalle.
        </p>
      </div>

      <Frieze border="#A8472B" upColor="#D8A84E" downColor="#C68A3D" medallionBg="#A8472B" medallionBorder="#F3EADA" />

      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '60px clamp(20px,5vw,40px) 140px' }}>
        {SERVICES.map((s, i) => {
          const isOpen = openIndex === i;
          return (
            <div key={s.number} data-reveal="" style={{ borderTop: '1px solid var(--border)' }}>
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : i)}
                aria-expanded={isOpen}
                aria-controls={`service-panel-${s.number}`}
                className="row-hover"
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: '10px 24px',
                  padding: '32px 8px',
                  cursor: 'pointer',
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  font: 'inherit',
                  color: 'inherit',
                  textAlign: 'left',
                }}
              >
                <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 14, color: 'var(--terracotta)', flexShrink: 0 }}>
                  {s.number}
                </div>
                <div
                  style={{ fontFamily: "'Spectral',serif", fontWeight: 600, fontSize: 'clamp(20px,2.4vw,30px)', flex: 1, minWidth: 180 }}
                >
                  {s.name}
                </div>
                <div style={{ fontSize: 12, letterSpacing: 1, color: 'var(--muted)', flexShrink: 0 }}>{s.timeline}</div>
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
              </button>
              {isOpen && (
                <div
                  id={`service-panel-${s.number}`}
                  style={{
                    padding: '0 8px clamp(20px,5vw,40px)',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))',
                    gap: 24,
                  }}
                >
                  <div style={{ background: 'var(--cream2)', borderRadius: 4, padding: 24 }}>
                    <div style={{ fontSize: 11, letterSpacing: 1.5, color: 'var(--muted)', fontWeight: 600, marginBottom: 8 }}>
                      PROBLEMA
                    </div>
                    <div style={{ fontSize: 14, lineHeight: 1.6 }}>{s.problem}</div>
                  </div>
                  <div style={{ background: 'var(--ink)', color: 'var(--bg)', borderRadius: 4, padding: 24 }}>
                    <div style={{ fontSize: 11, letterSpacing: 1.5, color: 'var(--gold)', fontWeight: 600, marginBottom: 8 }}>VALOR</div>
                    <div style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--tan-text)' }}>{s.value}</div>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <div style={{ fontSize: 11, letterSpacing: 1.5, color: 'var(--muted)', fontWeight: 600, marginBottom: 10 }}>
                      ENTREGABLES
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {s.deliverables.map((d) => (
                        <div key={d} style={{ border: '1px solid var(--border)', borderRadius: 20, padding: '6px 16px', fontSize: 13 }}>
                          {d}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        <div style={{ borderTop: '1px solid var(--border)' }} />
      </div>

      <div
        data-reveal=""
        style={{
          position: 'relative',
          background: 'var(--ink)',
          color: 'var(--bg)',
          padding: '160px clamp(20px,5vw,40px)',
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
            style={{
              fontFamily: "'Spectral',serif",
              fontWeight: 700,
              fontSize: 'clamp(32px,5vw,58px)',
              marginBottom: 32,
              lineHeight: 1.15,
            }}
          >
            ¿Cuál de estos resuelve tu problema hoy?
          </div>
          <div style={{ fontSize: 15, color: 'var(--tan-text)', marginBottom: 40 }}>Cuéntanos tu caso y te decimos por dónde empezar.</div>
          <a
            href={waLink('Hola, vi el portafolio de servicios de Inmerge y quiero contarles mi caso.')}
            target="_blank"
            rel="noreferrer"
            className="btn-hover"
            style={{
              background: 'var(--gold)',
              color: 'var(--ink)',
              borderRadius: 2,
              padding: '20px 44px',
              fontSize: 17,
              fontWeight: 700,
              display: 'inline-block',
            }}
          >
            Escríbenos por WhatsApp
          </a>
        </div>
      </div>

      <Frieze border="#D8A84E" upColor="#C68A3D" downColor="#A8472B" medallionBg="#D8A84E" medallionBorder="#241A12" />

      <Footer />
    </>
  );
}
