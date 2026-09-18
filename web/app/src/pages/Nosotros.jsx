import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import useReveal from '../hooks/useReveal.js';
import useDocumentHead from '../hooks/useDocumentHead.js';
import Footer from '../components/Footer.jsx';
import ManifestoCarousel from '../components/ManifestoCarousel.jsx';
import DirectorsCarousel from '../components/DirectorsCarousel.jsx';
import { MochicaDivider, MochicaCornerFrame } from '../components/MochicaPatterns.jsx';
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

  return (
    <>
      {/* =====================================================================
          1. HEADER EDITORIAL — Atelier Portfolio Hero & Architectural Grid
          ===================================================================== */}
      <section
        style={{
          padding: '100px clamp(24px, 5vw, 64px) 40px',
          maxWidth: 1440,
          margin: '0 auto',
          position: 'relative',
        }}
      >
        {/* Top Studio Meta Strip with Technical Coordinates & Live Status */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
            paddingBottom: 20,
            borderBottom: '1px solid var(--border)',
            marginBottom: 36,
            fontFamily: "'Space Mono', monospace",
            fontSize: 12,
            letterSpacing: 1.5,
            color: 'var(--muted)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              style={{
                display: 'inline-block',
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: 'var(--green)',
                boxShadow: '0 0 0 3px rgba(74, 156, 106, 0.2)',
              }}
            />
            <span style={{ color: 'var(--ink)', fontWeight: 600 }}>
              {isEn ? 'LIMA, PE [12°02\'36"S 77°01\'42"W] // AUDIT LAB ACTIVE' : 'LIMA, PE [12°02\'36"S 77°01\'42"W] // ESTUDIO TÉCNICO ACTIVO'}
            </span>
          </div>
          <div
            style={{
              letterSpacing: 4,
              color: 'var(--terracotta)',
              fontWeight: 600,
              textTransform: 'uppercase',
            }}
          >
            {isEn ? 'THE FIRM // INMERGE' : 'LA FIRMA // INMERGE'}
          </div>
        </div>

        {/* Hero Title (Right-Aligned Editorial Headline) */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            textAlign: 'right',
            marginBottom: 44,
          }}
        >
          <h1
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: 'clamp(42px, 7vw, 92px)',
              lineHeight: 1.05,
              letterSpacing: -1.5,
              maxWidth: 1100,
              margin: '0 0 24px 0',
              color: 'var(--ink)',
            }}
          >
            {isEn
              ? 'Rigorous engineering, strict auditing, and verifiable data.'
              : 'Ingeniería rigurosa, auditoría estricta y datos reproducibles.'}
          </h1>
        </div>

        {/* Left-Aligned Studio Manifesto Plate with Precision Corner Crosshairs */}
        <div
          style={{
            position: 'relative',
            maxWidth: 780,
            background: 'rgba(235, 223, 201, 0.45)',
            border: '1px solid rgba(36, 26, 18, 0.12)',
            borderRadius: 4,
            padding: 'clamp(24px, 3.5vw, 36px)',
            marginBottom: 20,
            backdropFilter: 'blur(4px)',
          }}
        >
          {/* Corner Crosshair Marks (+) */}
          <span style={{ position: 'absolute', top: -7, left: -6, fontFamily: "'Space Mono', monospace", fontSize: 13, color: 'var(--terracotta)', lineHeight: 1, fontWeight: 700 }}>+</span>
          <span style={{ position: 'absolute', top: -7, right: -6, fontFamily: "'Space Mono', monospace", fontSize: 13, color: 'var(--terracotta)', lineHeight: 1, fontWeight: 700 }}>+</span>
          <span style={{ position: 'absolute', bottom: -7, left: -6, fontFamily: "'Space Mono', monospace", fontSize: 13, color: 'var(--terracotta)', lineHeight: 1, fontWeight: 700 }}>+</span>
          <span style={{ position: 'absolute', bottom: -7, right: -6, fontFamily: "'Space Mono', monospace", fontSize: 13, color: 'var(--terracotta)', lineHeight: 1, fontWeight: 700 }}>+</span>

          <div
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 11,
              letterSpacing: 2,
              color: 'var(--terracotta)',
              fontWeight: 600,
              marginBottom: 14,
              textTransform: 'uppercase',
            }}
          >
            {isEn ? '// BOUTIQUE PRACTICE STATEMENT' : '// DECLARACIÓN DE PRÁCTICA BOUTIQUE'}
          </div>

          <p
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 'clamp(17px, 1.8vw, 21px)',
              color: 'var(--ink)',
              lineHeight: 1.6,
              margin: '0 0 20px 0',
              textAlign: 'left',
              fontWeight: 400,
            }}
          >
            {isEn
              ? 'We are a boutique consultancy specializing in systems auditing, cloud software engineering, and applied data science. We architect platforms where every computation is citable and every line of code is verifiable.'
              : 'Somos una firma boutique especializada en auditoría de sistemas, ingeniería de software cloud y ciencia de datos. Diseñamos soluciones donde cada cálculo es citable y cada línea de código es mantenible.'}
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <span
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 11,
                padding: '4px 10px',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 2,
                color: 'var(--ink)',
              }}
            >
              {isEn ? '01. SYSTEMS AUDIT' : '01. AUDITORÍA DE SISTEMAS'}
            </span>
            <span
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 11,
                padding: '4px 10px',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 2,
                color: 'var(--ink)',
              }}
            >
              {isEn ? '02. CLOUD INFRASTRUCTURE' : '02. INFRAESTRUCTURA CLOUD'}
            </span>
            <span
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 11,
                padding: '4px 10px',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 2,
                color: 'var(--ink)',
              }}
            >
              {isEn ? '03. DATA SCIENCE & AI' : '03. CIENCIA DE DATOS & IA'}
            </span>
          </div>
        </div>
      </section>

      {/* =====================================================================
          2. MANIFIESTO — Propósito, Misión y Visión (Declaraciones de Rigor I, II, III)
          ===================================================================== */}
      <section id="mision" style={{ maxWidth: 1440, margin: '0 auto', padding: 'clamp(100px, 12vh, 150px) clamp(24px, 5vw, 64px)' }}>
        <div style={{ fontSize: 12, letterSpacing: 2, color: 'var(--terracotta)', fontWeight: 600, marginBottom: 16 }}>
          {isEn ? 'STATEMENTS OF RIGOR' : 'DECLARACIONES DE RIGOR'}
        </div>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(34px, 5.2vw, 52px)',
            fontWeight: 700,
            color: 'var(--ink)',
            margin: '0 0 48px 0',
          }}
        >
          {isEn ? 'The Inmerge Standard: Purpose, Mission & Vision' : 'El Estándar Inmerge: Propósito, Misión & Visión'}
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))',
            gap: 'clamp(36px, 4.5vw, 64px)',
            paddingTop: 12,
          }}
        >
          {/* Propósito */}
          <article data-reveal="" style={{ padding: '8px 0' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 16 }}>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
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
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  letterSpacing: 1.5,
                  color: 'var(--terracotta)',
                  fontWeight: 700,
                }}
              >
                {isEn ? '[PRINCIPLE // PURPOSE]' : '[PRINCIPIO // PROPÓSITO]'}
              </div>
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: 'var(--ink)', marginBottom: 12, lineHeight: 1.2 }}>
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
                  fontFamily: 'var(--font-display)',
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
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  letterSpacing: 1.5,
                  color: 'var(--terracotta)',
                  fontWeight: 700,
                }}
              >
                {isEn ? '[COMMITMENT // MISSION]' : '[COMPROMISO // MISIÓN]'}
              </div>
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: 'var(--ink)', marginBottom: 12, lineHeight: 1.2 }}>
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
                  fontFamily: 'var(--font-display)',
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
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  letterSpacing: 1.5,
                  color: 'var(--terracotta)',
                  fontWeight: 700,
                }}
              >
                {isEn ? '[HORIZON // VISION]' : '[HORIZONTE // VISIÓN]'}
              </div>
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: 'var(--ink)', marginBottom: 12, lineHeight: 1.2 }}>
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
      <section id="directores" style={{ background: 'var(--bg)', padding: 'clamp(100px, 12vh, 150px) clamp(24px, 5vw, 64px)' }}>
        <div style={{ maxWidth: 1440, margin: '0 auto' }}>
          <div
            data-reveal=""
            style={{
              fontFamily: 'var(--font-mono)',
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
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 'clamp(34px,4.5vw,56px)',
              marginBottom: 16,
              color: 'var(--ink)',
            }}
          >
            {isEn ? 'Senior Leadership & Technical Directors' : 'Directores de Práctica & Especialistas Senior'}
          </div>
          <p data-reveal="" style={{ fontSize: 16.5, color: 'var(--muted)', marginBottom: 40, maxWidth: 780, lineHeight: 1.6 }}>
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
          5. MÉTODO + STACK — Unified Bento Grid (Methodology & Stack)
          ===================================================================== */}
      <section id="metodo" style={{ maxWidth: 1440, margin: '0 auto', padding: 'clamp(100px, 12vh, 150px) clamp(24px, 5vw, 64px)' }}>
        <div style={{ fontSize: 12, letterSpacing: 2, color: 'var(--terracotta)', fontWeight: 600, marginBottom: 16 }}>
          {isEn ? 'METHODOLOGY & TECHNOLOGY' : 'METODOLOGÍA & TECNOLOGÍA'}
        </div>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(32px, 5vw, 48px)',
            fontWeight: 700,
            color: 'var(--ink)',
            margin: '0 0 16px 0',
          }}
        >
          {isEn ? 'How We Build & What We Build With' : 'Cómo Construimos y Con Qué'}
        </h2>
        <p style={{ fontSize: 16, color: 'var(--muted)', maxWidth: 760, margin: '0 0 56px 0', lineHeight: 1.65 }}>
          {isEn
            ? 'Our end-to-end engineering methodology coupled with production-grade technologies on AWS, ensuring verifiable quality, zero technical debt, and client sovereignty.'
            : 'Nuestra metodología de ingeniería de punta a punta junto a tecnologías probadas en producción sobre AWS, garantizando calidad verificable, cero deuda técnica y soberanía total del cliente.'}
        </p>

        {/* Bloque 1: El Método (4 Etapas de Rigor) */}
        <div style={{ marginBottom: 72 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                letterSpacing: 2,
                color: 'var(--terracotta)',
                fontWeight: 700,
              }}
            >
              {isEn ? '[01 // THE METHOD]' : '[01 // EL MÉTODO]'}
            </span>
            <span style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
              {isEn ? '4 Phases of Technical Rigor' : '4 Etapas de Rigor Metodológico'}
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 20,
            }}
          >
            {stack.METHODOLOGY_STEPS.map((step, idx) => (
              <MochicaCornerFrame
                key={step.step}
                cornerSize={18}
                color={idx % 2 === 0 ? 'var(--terracotta)' : 'var(--gold)'}
                variant={idx % 2 === 0 ? 'stepped' : 'greca'}
              >
                <div
                  data-reveal=""
                  style={{
                    background: 'transparent',
                    padding: '24px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '100%',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 20,
                          fontWeight: 700,
                          color: 'var(--terracotta)',
                        }}
                      >
                        {step.step}
                      </span>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 10.5,
                          letterSpacing: 1,
                          textTransform: 'uppercase',
                          color: 'var(--muted)',
                          background: 'var(--cream2)',
                          padding: '2px 8px',
                          borderRadius: 2,
                        }}
                      >
                        {step.tag}
                      </span>
                    </div>
                    <h3
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 19,
                        fontWeight: 700,
                        color: 'var(--ink)',
                        margin: '0 0 6px 0',
                        lineHeight: 1.25,
                      }}
                    >
                      {step.phase}
                    </h3>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--terracotta)', marginBottom: 12 }}>
                      {step.title}
                    </div>
                    <p style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.6, margin: '0 0 20px 0' }}>
                      {step.desc}
                    </p>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                    <div
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 11,
                        textTransform: 'uppercase',
                        color: 'var(--ink)',
                        fontWeight: 700,
                        marginBottom: 8,
                      }}
                    >
                      {isEn ? 'Key Deliverables:' : 'Entregables Clave:'}
                    </div>
                    <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.6 }}>
                      {step.deliverables.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </MochicaCornerFrame>
            ))}
          </div>
        </div>

        {/* Mochica Geometric Pattern Divider between Method and Stack */}
        <MochicaDivider color="var(--border)" height={16} seed="inmerge-nosotros-stack" style={{ margin: '0 0 64px 0' }} />

        {/* Bloque 2: Ecosistema & Stack Tecnológico */}
        <div id="stack">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                letterSpacing: 2,
                color: 'var(--terracotta)',
                fontWeight: 700,
              }}
            >
              {isEn ? '[02 // TECH STACK]' : '[02 // STACK TECNOLÓGICO]'}
            </span>
            <span style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
              {isEn ? 'Curated Production-Grade Stack' : 'Ecosistema Tecnológico & Estándares Abiertos'}
            </span>
          </div>

          <p style={{ fontSize: 15, color: 'var(--muted)', maxWidth: 740, margin: '0 0 28px 0', lineHeight: 1.6 }}>
            {isEn
              ? 'We build exclusively on production-proven, open standards and battle-tested cloud backbones (AWS), ensuring the client retains absolute sovereignty over all code and infrastructure.'
              : 'Utilizamos tecnologías probadas en producción, de código abierto o estándares globales en la nube (AWS), garantizando que el cliente sea dueño absoluto de su infraestructura y código.'}
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 24,
            }}
          >
            {stack.STACK_CATEGORIES.map((cat, idx) => (
              <MochicaCornerFrame
                key={cat.id}
                cornerSize={18}
                color={idx % 2 === 0 ? 'var(--gold)' : 'var(--terracotta)'}
                variant={idx % 2 === 0 ? 'greca' : 'stepped'}
              >
                <div
                  data-reveal=""
                  style={{
                    background: 'transparent',
                    padding: '24px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '100%',
                  }}
                >
                  <div>
                    <h4
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 20,
                        fontWeight: 700,
                        margin: '0 0 6px 0',
                        color: 'var(--ink)',
                      }}
                    >
                      {cat.name}
                    </h4>
                    <p style={{ color: 'var(--muted)', fontSize: 13.5, margin: '0 0 20px 0', lineHeight: 1.5 }}>
                      {cat.desc}
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {cat.tools.map((tool) => (
                        <div
                          key={tool.name}
                          style={{
                            borderTop: '1px solid var(--border)',
                            paddingTop: 10,
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                            <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 14.5, color: 'var(--ink)' }}>
                              {tool.name}
                            </span>
                            <span
                              style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: 10,
                                letterSpacing: 0.5,
                                textTransform: 'uppercase',
                                color: 'var(--terracotta)',
                                fontWeight: 700,
                              }}
                            >
                              {tool.level}
                            </span>
                          </div>
                          <div style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.4 }}>
                            {tool.role}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </MochicaCornerFrame>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          6. COMPROMISOS TÉCNICOS & SLA — Editorial Accordion
          ===================================================================== */}
      <div id="compromisos" style={{ background: 'var(--bg)', padding: 'clamp(100px, 12vh, 150px) clamp(24px, 5vw, 64px)' }}>
        <div style={{ maxWidth: 1440, margin: '0 auto' }}>
          <div
            data-reveal=""
            style={{
              fontFamily: 'var(--font-mono)',
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
              fontFamily: 'var(--font-display)',
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
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 22, flex: 1 }}>{v.name}</div>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
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
          7. CTA FINAL EDITORIAL — Unified Canvas
          ===================================================================== */}
      <div
        data-reveal=""
        style={{
          position: 'relative',
          background: 'var(--bg)',
          color: 'var(--ink)',
          borderTop: '1px solid var(--border)',
          padding: 'clamp(100px, 12vh, 150px) clamp(24px, 5vw, 64px)',
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
            opacity: 0.06,
          }}
        />
        <div style={{ position: 'relative', maxWidth: 960, margin: '0 auto', textAlign: 'center' }}>
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
            {isEn ? 'Ready to evaluate your technical requirements?' : '¿Conversamos sobre tus requerimientos técnicos?'}
          </h2>
          <p style={{ fontSize: 16, color: 'var(--muted)', marginBottom: 36, maxWidth: 560, margin: '0 auto 36px', lineHeight: 1.65 }}>
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
              borderRadius: 4,
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
