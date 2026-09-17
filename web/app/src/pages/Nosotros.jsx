import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import useReveal from '../hooks/useReveal.js';
import useDocumentHead from '../hooks/useDocumentHead.js';
import Footer from '../components/Footer.jsx';
import StackTabs from '../components/StackTabs.jsx';
import ManifestoCarousel from '../components/ManifestoCarousel.jsx';
import DirectorsCarousel from '../components/DirectorsCarousel.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function Nosotros() {
  useReveal();
  const { isEn, content, stack } = useLanguage();

  useDocumentHead({
    title: isEn
      ? 'About Us & Methodology — Inmerge · Auditing, Cloud & Data Science'
      : 'Nosotros & Metodología — Inmerge · Auditoría, Ingeniería & Datos',
    description: isEn
      ? 'Boutique data engineering, cloud systems architecture, and technical audit consultancy in Lima, Peru. Meet our senior team, 4-phase methodology, and tech stack.'
      : 'Firma boutique de ingeniería de datos, arquitectura cloud y auditoría técnica en Lima, Perú. Conoce nuestro equipo senior, metodología de 4 fases y stack tecnológico.',
    path: isEn ? '/en/about' : '/nosotros',
  });

  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const targetId = hash.replace('#', '');
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [hash]);

  const whatsappCta = content.waLink(
    isEn
      ? 'Hello Inmerge team, I have reviewed your leadership, methodology, and technology stack. I would like to coordinate a technical consultation for a project.'
      : 'Hola Inmerge, he revisado su equipo directivo, metodología y stack técnico. Me gustaría coordinar una reunión técnica para un proyecto.',
  );

  // Accordion state for Compromisos section
  const [openValue, setOpenValue] = useState(null);

  // Método/Stack tab state
  const [metodoTab, setMetodoTab] = useState('metodo');

  return (
    <>
      {/* =====================================================================
          1. HERO CINEMÁTICO — Parallax-ready with editorial Spectral statement
          ===================================================================== */}
      <div
        style={{
          position: 'relative',
          minHeight: '70vh',
          display: 'flex',
          alignItems: 'center',
          background: 'var(--ink)',
          color: '#F3EADA',
          overflow: 'hidden',
          padding: '140px clamp(20px,5vw,40px) 100px',
        }}
      >
        {/* Parallax-ready gradient overlay */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(36,26,18,0.6) 0%, rgba(36,26,18,0.82) 50%, rgba(36,26,18,0.95) 100%)',
            zIndex: 1,
            pointerEvents: 'none',
          }}
        />

        {/* Decorative breathe-diamond */}
        <div
          className="breathe-diamond"
          aria-hidden="true"
          style={{
            position: 'absolute',
            right: 'clamp(16px,6vw,60px)',
            top: '18%',
            width: 'clamp(32px,5vw,56px)',
            height: 'clamp(32px,5vw,56px)',
            background: 'var(--terracotta)',
            zIndex: 2,
          }}
        />

        {/* Secondary decorative diamond */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: '-40px',
            bottom: '10%',
            width: 120,
            height: 120,
            background: 'var(--gold)',
            opacity: 0.06,
            transform: 'rotate(45deg)',
            zIndex: 0,
          }}
        />

        <div style={{ position: 'relative', maxWidth: 1240, margin: '0 auto', width: '100%', zIndex: 2 }}>
          <div
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 13,
              letterSpacing: 4,
              color: 'var(--gold)',
              fontWeight: 600,
              marginBottom: 28,
              textTransform: 'uppercase',
            }}
          >
            {isEn ? 'THE FIRM // INMERGE' : 'LA FIRMA // INMERGE'}
          </div>
          <h1
            style={{
              fontFamily: "'Spectral', serif",
              fontWeight: 700,
              fontSize: 'clamp(42px,7.5vw,96px)',
              lineHeight: 1.04,
              letterSpacing: -1.5,
              maxWidth: 980,
              margin: '0 0 28px 0',
              color: '#F3EADA',
            }}
          >
            {isEn
              ? 'Rigorous engineering, strict auditing, and verifiable data.'
              : 'Ingeniería rigurosa, auditoría estricta y datos reproducibles.'}
          </h1>
          <p
            style={{
              fontFamily: "'Spectral', serif",
              fontStyle: 'italic',
              fontSize: 'clamp(17px, 2vw, 22px)',
              color: 'rgba(243,234,218,0.9)',
              maxWidth: 700,
              lineHeight: 1.65,
              margin: '0 0 40px 0',
              borderLeft: '3px solid var(--terracotta)',
              paddingLeft: 20,
            }}
          >
            {isEn
              ? 'We are a boutique consultancy specializing in systems auditing, cloud software engineering, and applied data science. We architect platforms where every computation is citable and every line of code is verifiable.'
              : 'Somos una firma boutique especializada en auditoría de sistemas, ingeniería de software cloud y ciencia de datos. Diseñamos soluciones donde cada cálculo es citable y cada línea de código es mantenible.'}
          </p>

          {/* Editorial table of contents */}
          <nav
            aria-label={isEn ? 'Section index' : 'Índice de secciones'}
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '8px 18px',
              paddingTop: 8,
            }}
          >
            {[
              { href: '#mision', label: isEn ? '# Mission & Purpose' : '# Misión & Propósito' },
              { href: '#directores', label: isEn ? '# Practice Directors' : '# Directores de Práctica' },
              { href: '#manifiesto', label: isEn ? '# Engineering Manifesto' : '# Manifiesto de Ingeniería' },
              { href: '#metodo', label: isEn ? '# The Method' : '# El Método' },
              { href: '#stack', label: isEn ? '# Tech Stack' : '# Stack Tecnológico' },
              { href: '#compromisos', label: isEn ? '# Commitments' : '# Compromisos' },
            ].map((pill) => (
              <a
                key={pill.href}
                href={pill.href}
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 12.5,
                  color: 'rgba(243,234,218,0.75)',
                  textDecoration: 'none',
                  transition: 'color 0.2s ease',
                }}
                className="link-hover"
              >
                {pill.label}
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* =====================================================================
          2. MANIFIESTO — Propósito, Misión y Visión (Declaraciones de Rigor I, II, III)
          ===================================================================== */}
      <section id="mision" style={{ maxWidth: 1240, margin: '0 auto', padding: '90px clamp(20px,5vw,40px)' }}>
        <div style={{ fontSize: 12, letterSpacing: 2, color: 'var(--terracotta)', fontWeight: 600, marginBottom: 16 }}>
          {isEn ? 'STATEMENTS OF RIGOR' : 'DECLARACIONES DE RIGOR'}
        </div>
        <h2
          style={{
            fontFamily: "'Spectral', serif",
            fontSize: 'clamp(32px, 5vw, 44px)',
            fontWeight: 700,
            color: 'var(--ink)',
            margin: '0 0 40px 0',
          }}
        >
          {isEn ? 'The Inmerge Standard: Purpose, Mission & Vision' : 'El Estándar Inmerge: Propósito, Misión & Visión'}
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))',
            gap: 'clamp(28px, 4vw, 48px)',
            paddingTop: 12,
          }}
        >
          {/* Propósito */}
          <article data-reveal="" style={{ padding: '8px 0' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 16 }}>
              <span
                style={{
                  fontFamily: "'Spectral', serif",
                  fontSize: 34,
                  fontWeight: 700,
                  color: 'var(--terracotta)',
                  lineHeight: 1,
                }}
              >
                I
              </span>
              <div
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 11,
                  letterSpacing: 1.5,
                  color: 'var(--terracotta)',
                  fontWeight: 700,
                }}
              >
                {isEn ? '[PRINCIPLE // PURPOSE]' : '[PRINCIPIO // PROPÓSITO]'}
              </div>
            </div>
            <h3 style={{ fontFamily: "'Spectral',serif", fontWeight: 700, fontSize: 22, color: 'var(--ink)', marginBottom: 12, lineHeight: 1.2 }}>
              {isEn ? 'Operational Truth Assurance' : 'Garantía de Verdad Operativa'}
            </h3>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--muted)', margin: 0 }}>
              {isEn
                ? 'High-stakes decisions supported strictly by mathematically sound, verifiable data and fault-tolerant cloud backbones.'
                : 'Decisiones críticas respaldadas estrictamente por datos matemáticamente íntegros, reproducibles y arquitecturas cloud resilientes.'}
            </p>
          </article>

          {/* Misión */}
          <article data-reveal="" style={{ padding: '8px 0' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 16 }}>
              <span
                style={{
                  fontFamily: "'Spectral', serif",
                  fontSize: 34,
                  fontWeight: 700,
                  color: 'var(--terracotta)',
                  lineHeight: 1,
                }}
              >
                II
              </span>
              <div
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 11,
                  letterSpacing: 1.5,
                  color: 'var(--terracotta)',
                  fontWeight: 700,
                }}
              >
                {isEn ? '[COMMITMENT // MISSION]' : '[COMPROMISO // MISIÓN]'}
              </div>
            </div>
            <h3 style={{ fontFamily: "'Spectral',serif", fontWeight: 700, fontSize: 22, color: 'var(--ink)', marginBottom: 12, lineHeight: 1.2 }}>
              {isEn ? 'Engineering Without Black Boxes' : 'Ingeniería sin Cajas Negras'}
            </h3>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--muted)', margin: 0 }}>
              {isEn
                ? 'Auditing, engineering, and deploying tier-1 cloud systems, pipelines, and AI models with auditable code and complete client ownership.'
                : 'Auditar, desarrollar y desplegar software cloud, pipelines de datos y modelos de IA bajo estándares estrictos y soberanía total del cliente.'}
            </p>
          </article>

          {/* Visión */}
          <article data-reveal="" style={{ padding: '8px 0' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 16 }}>
              <span
                style={{
                  fontFamily: "'Spectral', serif",
                  fontSize: 34,
                  fontWeight: 700,
                  color: 'var(--terracotta)',
                  lineHeight: 1,
                }}
              >
                III
              </span>
              <div
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 11,
                  letterSpacing: 1.5,
                  color: 'var(--terracotta)',
                  fontWeight: 700,
                }}
              >
                {isEn ? '[HORIZON // VISION]' : '[HORIZONTE // VISIÓN]'}
              </div>
            </div>
            <h3 style={{ fontFamily: "'Spectral',serif", fontWeight: 700, fontSize: 22, color: 'var(--ink)', marginBottom: 12, lineHeight: 1.2 }}>
              {isEn ? 'Regional Technical Benchmark' : 'Referencia Técnica Regional'}
            </h3>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--muted)', margin: 0 }}>
              {isEn
                ? 'The premier boutique consultancy in Latin America for organizations that reject opaque black boxes, metric discrepancies, or vendor lock-in.'
                : 'La firma boutique referente en Latinoamérica para organizaciones que no aceptan cajas negras, inconsistencias métricas ni ataduras tecnológicas.'}
            </p>
          </article>
        </div>
      </section>

      {/* =====================================================================
          3. DIRECTORES DE PRÁCTICA & ESPECIALISTAS SENIOR (Flujo A: Segundo/Tercer Bloque)
          ===================================================================== */}
      <section id="directores" style={{ background: 'var(--bg)', padding: '90px clamp(20px,5vw,40px)' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>
          <div
            data-reveal=""
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 12,
              letterSpacing: 2,
              color: 'var(--terracotta)',
              fontWeight: 700,
              marginBottom: 14,
              textTransform: 'uppercase',
            }}
          >
            {isEn ? 'LEADERSHIP & PRACTICE DIRECTORS' : 'EQUIPO DIRECTIVO & PRÁCTICAS'}
          </div>
          <div
            data-reveal=""
            style={{
              fontFamily: "'Spectral',serif",
              fontWeight: 700,
              fontSize: 'clamp(32px,4vw,52px)',
              marginBottom: 14,
              color: 'var(--ink)',
            }}
          >
            {isEn ? 'Senior Leadership & Technical Directors' : 'Directores de Práctica & Especialistas Senior'}
          </div>
          <p data-reveal="" style={{ fontSize: 16, color: 'var(--muted)', marginBottom: 36, maxWidth: 720, lineHeight: 1.6 }}>
            {isEn
              ? 'Zero commercial middle layers: every project mandate is led, audited, and built directly by our four practice directors.'
              : 'Sin intermediarios comerciales: cada proyecto es liderado, auditado y construido directamente por nuestros 4 directores de práctica.'}
          </p>

          <DirectorsCarousel />
        </div>
      </section>

      {/* =====================================================================
          4. MANIFIESTO & DIFERENCIAL — ManifestoCarousel (Principios + Arquetipo + Comparativa)
          ===================================================================== */}
      <div id="manifiesto">
        <ManifestoCarousel />
      </div>

      {/* =====================================================================
          5. MÉTODO + STACK — Combined tabbed section
          ===================================================================== */}
      <section id="metodo" style={{ maxWidth: 1240, margin: '0 auto', padding: '80px clamp(20px,5vw,40px) 100px' }}>
        <div style={{ fontSize: 12, letterSpacing: 2, color: 'var(--terracotta)', fontWeight: 600, marginBottom: 16 }}>
          {isEn ? 'METHODOLOGY & TECHNOLOGY' : 'METODOLOGÍA & TECNOLOGÍA'}
        </div>
        <h2
          style={{
            fontFamily: "'Spectral', serif",
            fontSize: 'clamp(32px, 5vw, 48px)',
            fontWeight: 700,
            color: 'var(--ink)',
            margin: '0 0 28px 0',
          }}
        >
          {isEn ? 'How We Build & What We Build With' : 'Cómo Construimos y Con Qué'}
        </h2>

        {/* Tab switcher */}
        <div
          role="tablist"
          style={{
            display: 'flex',
            gap: 8,
            borderBottom: '1px solid var(--border)',
            paddingBottom: 16,
            marginBottom: 40,
          }}
        >
          <button
            role="tab"
            type="button"
            aria-selected={metodoTab === 'metodo'}
            onClick={() => setMetodoTab('metodo')}
            style={{
              background: metodoTab === 'metodo' ? 'var(--terracotta)' : 'transparent',
              color: metodoTab === 'metodo' ? '#F3EADA' : 'var(--ink)',
              border: '1px solid',
              borderColor: metodoTab === 'metodo' ? 'var(--terracotta)' : 'var(--border)',
              padding: '10px 22px',
              fontSize: 14,
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontWeight: metodoTab === 'metodo' ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {isEn ? 'The 4-Phase Method' : 'El Método (4 Etapas)'}
          </button>
          <button
            role="tab"
            type="button"
            aria-selected={metodoTab === 'stack'}
            onClick={() => setMetodoTab('stack')}
            style={{
              background: metodoTab === 'stack' ? 'var(--terracotta)' : 'transparent',
              color: metodoTab === 'stack' ? '#F3EADA' : 'var(--ink)',
              border: '1px solid',
              borderColor: metodoTab === 'stack' ? 'var(--terracotta)' : 'var(--border)',
              padding: '10px 22px',
              fontSize: 14,
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontWeight: metodoTab === 'stack' ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {isEn ? 'Technology Stack' : 'Stack Tecnológico'}
          </button>
        </div>

        {/* Tab Panel: Methodology */}
        {metodoTab === 'metodo' && (
          <div role="tabpanel" id="stack">
            {/* Horizontal Timeline */}
            <div
              style={{
                display: 'flex',
                gap: 0,
                overflowX: 'auto',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {stack.METHODOLOGY_STEPS.map((step, idx) => (
                <div
                  key={step.step}
                  data-reveal=""
                  style={{
                    flex: '1 0 260px',
                    maxWidth: 320,
                    padding: 28,
                    borderLeft: idx > 0 ? '1px solid var(--border)' : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                  }}
                >
                  {/* Timeline connector dot */}
                  {idx > 0 && (
                    <div
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        left: -5,
                        top: 36,
                        width: 10,
                        height: 10,
                        background: 'var(--terracotta)',
                        borderRadius: '50%',
                      }}
                    />
                  )}
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 16,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "'IBM Plex Mono', monospace",
                          fontSize: 16,
                          fontWeight: 700,
                          color: 'var(--terracotta)',
                        }}
                      >
                        {step.step}
                      </span>
                      <span
                        style={{
                          fontFamily: "'IBM Plex Mono', monospace",
                          fontSize: 11,
                          textTransform: 'uppercase',
                          color: 'var(--muted)',
                        }}
                      >
                        {step.tag}
                      </span>
                    </div>

                    <h3
                      style={{
                        fontFamily: "'Spectral', serif",
                        fontSize: 20,
                        fontWeight: 700,
                        color: 'var(--ink)',
                        margin: '0 0 6px 0',
                      }}
                    >
                      {step.phase}
                    </h3>

                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--terracotta)', marginBottom: 12 }}>{step.title}</div>

                    <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, margin: '0 0 20px 0' }}>{step.desc}</p>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                    <div
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 11,
                        textTransform: 'uppercase',
                        color: 'var(--ink)',
                        fontWeight: 600,
                        marginBottom: 8,
                      }}
                    >
                      {isEn ? 'Key Deliverables:' : 'Entregables Clave:'}
                    </div>
                    <ul style={{ margin: 0, paddingLeft: 16, fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
                      {step.deliverables.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Panel: Stack */}
        {metodoTab === 'stack' && (
          <div role="tabpanel" id="stack">
            <p style={{ fontSize: 16, color: 'var(--muted)', maxWidth: 680, margin: '0 0 16px 0' }}>
              {isEn
                ? 'We build exclusively on production-proven, open standards and battle-tested cloud backbones (AWS), ensuring the client retains absolute sovereignty over all code and infrastructure.'
                : 'Utilizamos tecnologías probadas en producción, de código abierto o estándares globales en la nube (AWS), garantizando que el cliente sea dueño absoluto de su infraestructura y código.'}
            </p>
            <StackTabs />
          </div>
        )}
      </section>

      {/* =====================================================================
          6. COMPROMISOS TÉCNICOS & SLA — Editorial Accordion
          ===================================================================== */}
      <div id="compromisos" style={{ background: 'var(--bg)', padding: '100px clamp(20px,5vw,40px)' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>
          <div
            data-reveal=""
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 12,
              letterSpacing: 2,
              color: 'var(--terracotta)',
              fontWeight: 700,
              marginBottom: 14,
              textTransform: 'uppercase',
            }}
          >
            {isEn ? 'TECHNICAL ASSURANCE & SLA' : 'ASEGURAMIENTO TÉCNICO & SLA'}
          </div>
          <div
            data-reveal=""
            style={{
              fontFamily: "'Spectral',serif",
              fontWeight: 700,
              fontSize: 'clamp(28px,3.5vw,44px)',
              marginBottom: 32,
              color: 'var(--ink)',
            }}
          >
            {isEn ? 'Our Technical Commitments' : 'Nuestros Compromisos'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {content.VALUES.map((v, idx) => {
              const isOpen = openValue === idx;
              return (
                <div
                  key={v.name}
                  data-reveal=""
                  className="row-hover"
                  style={{
                    borderTop: '1px solid var(--border)',
                    cursor: 'pointer',
                    transition: 'background 0.2s ease',
                  }}
                  onClick={() => setOpenValue(isOpen ? null : idx)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setOpenValue(isOpen ? null : idx);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-expanded={isOpen}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px 24px',
                      padding: '24px 0',
                    }}
                  >
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        background: 'var(--terracotta)',
                        transform: isOpen ? 'rotate(0deg)' : 'rotate(45deg)',
                        transition: 'transform 0.3s ease',
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ fontFamily: "'Spectral',serif", fontWeight: 600, fontSize: 22, flex: 1 }}>{v.name}</div>
                    <span
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 14,
                        color: 'var(--terracotta)',
                        transition: 'transform 0.3s ease',
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      }}
                    >
                      ▾
                    </span>
                  </div>
                  <div
                    style={{
                      maxHeight: isOpen ? 200 : 0,
                      overflow: 'hidden',
                      transition: 'max-height 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                      paddingLeft: 46,
                    }}
                  >
                    <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7, margin: '0 0 20px 0' }}>{v.desc}</p>
                  </div>
                </div>
              );
            })}
            <div style={{ borderTop: '1px solid var(--border)' }} />
          </div>
        </div>
      </div>

      {/* =====================================================================
          7. CTA FINAL CINEMÁTICO
          ===================================================================== */}
      <div
        data-reveal=""
        style={{
          position: 'relative',
          background: 'var(--ink)',
          color: 'var(--bg)',
          padding: '120px clamp(20px,5vw,40px)',
          overflow: 'hidden',
        }}
      >
        <div
          className="breathe-diamond"
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: -100,
            bottom: -100,
            width: 340,
            height: 340,
            background: 'var(--terracotta)',
            opacity: 0.15,
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
            {isEn ? 'Ready to evaluate your technical requirements?' : '¿Conversamos sobre tus requerimientos técnicos?'}
          </h2>
          <p style={{ fontSize: 16, color: 'var(--tan-text)', marginBottom: 36, maxWidth: 560, margin: '0 auto 36px' }}>
            {isEn
              ? 'Preliminary technical audit, cloud architecture, or machine learning models — our engineering leads are ready to review your project directly.'
              : 'Auditoría preliminar, arquitectura cloud o modelos analíticos — estamos listos para revisar tu caso sin intermediarios.'}
          </p>
          <a
            href={whatsappCta}
            target="_blank"
            rel="noreferrer"
            className="btn-hover"
            style={{
              background: 'var(--gold)',
              color: 'var(--ink)',
              borderRadius: 2,
              padding: '18px 40px',
              fontSize: 16,
              fontWeight: 700,
              display: 'inline-block',
              textDecoration: 'none',
            }}
          >
            {isEn ? 'Message us on WhatsApp' : 'Escríbenos por WhatsApp'}
          </a>
        </div>
      </div>

      <Footer />
    </>
  );
}
