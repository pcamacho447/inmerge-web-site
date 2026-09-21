import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import useReveal from '../hooks/useReveal.js';
import useDocumentHead from '../hooks/useDocumentHead.js';
import Footer from '../components/Footer.jsx';
import DirectorsCarousel from '../components/DirectorsCarousel.jsx';
import { MochicaDivider, MochicaCornerFrame, MochicaStepIcon, MochicaPodiumBase } from '../components/MochicaPatterns.jsx';
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

  return (
    <>
      {/* =====================================================================
          1. HERO & MANIFIESTO — Propósito, Misión y Visión (Cimiento & Pilares)
          ===================================================================== */}
      <section
        id="mision"
        style={{
          background: 'var(--bg)',
          padding: 'clamp(80px, 10vh, 120px) clamp(24px, 5vw, 64px) 80px',
          maxWidth: 1440,
          margin: '0 auto',
          position: 'relative',
        }}
      >
        {/* Hero Title (Editorial Headline) */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            textAlign: 'left',
            marginBottom: 48,
          }}
        >
          <h1
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: 'clamp(32px, 4.5vw, 62px)',
              lineHeight: 1.15,
              letterSpacing: -1,
              maxWidth: 1200,
              margin: '0 0 24px 0',
              color: 'var(--ink)',
            }}
          >
            {isEn
              ? 'We are a boutique software engineering consultancy. We design platforms where every computation is citable, every line of code is maintainable, and delivered at competitive costs.'
              : 'Somos una firma boutique especializada en ingeniería de software. Diseñamos soluciones donde cada cálculo es citable, cada línea de código es mantenible y con costos competitivos.'}
          </h1>
        </div>
        {/* Mochica Architectural Continuous Top Divider */}
        <MochicaDivider
          height={14}
          segmentWidth={32}
          color="var(--border)"
          showBaseline={true}
          opacity={0.8}
          seed="inmerge-rigor-top"
          style={{ marginBottom: 36 }}
        />

        {/* Unified Architectural 3-Column Grid */}
        <div className="mochica-podium">
          {/* ESCALÓN 01: Propósito */}
          <article data-reveal="" className="mochica-podium-col">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <MochicaStepIcon level={1} color="var(--terracotta)" size={28} />
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: 24,
                  color: 'var(--ink)',
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                {isEn ? 'Purpose' : 'Propósito'}
              </h3>
            </div>

            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, lineHeight: 1.7, color: 'var(--muted)', margin: 0 }}>
              {isEn
                ? 'High-stakes decisions supported strictly by mathematically sound, verifiable data and fault-tolerant cloud backbones.'
                : 'Decisiones críticas respaldadas estrictamente por datos matemáticamente íntegros, reproducibles y arquitecturas cloud resilientes.'}
            </p>
          </article>

          {/* ESCALÓN 02: Misión */}
          <article data-reveal="" className="mochica-podium-col">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <MochicaStepIcon level={2} color="var(--ochre)" size={28} />
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: 24,
                  color: 'var(--ink)',
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                {isEn ? 'Mission' : 'Misión'}
              </h3>
            </div>

            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, lineHeight: 1.7, color: 'var(--muted)', margin: 0 }}>
              {isEn
                ? 'Auditing, engineering, and deploying tier-1 cloud systems, pipelines, and AI models with auditable code and complete client ownership.'
                : 'Auditar, desarrollar y desplegar software cloud, pipelines de datos y modelos de IA bajo estándares estrictos y soberanía total del cliente.'}
            </p>
          </article>

          {/* ESCALÓN 03: Visión */}
          <article data-reveal="" className="mochica-podium-col">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <MochicaStepIcon level={3} color="var(--gold)" size={28} />
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: 24,
                  color: 'var(--ink)',
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                {isEn ? 'Vision' : 'Visión'}
              </h3>
            </div>

            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, lineHeight: 1.7, color: 'var(--muted)', margin: 0 }}>
              {isEn
                ? 'The premier boutique consultancy in Latin America for organizations that reject opaque black boxes, metric discrepancies, or vendor lock-in.'
                : 'La firma boutique referente en Latinoamérica para organizaciones que no aceptan cajas negras, inconsistencias métricas ni ataduras tecnológicas.'}
            </p>
          </article>
        </div>

        {/* Monumental Mochica Grounding Base Plinth */}
        <MochicaPodiumBase color="var(--border)" height={14} segmentWidth={32} style={{ marginTop: 36 }} />
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
            {isEn ? 'LEADERSHIP' : 'EQUIPO DIRECTIVO'}
          </div>
          <h2
            data-reveal=""
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 'clamp(34px,4.5vw,56px)',
              marginBottom: 40,
              color: 'var(--ink)',
            }}
          >
            {isEn ? 'Our Directors' : 'Nuestros Directores'}
          </h2>

          <DirectorsCarousel />
        </div>
      </section>

      {/* =====================================================================
          4. MÉTODO + STACK — Unified Bento Grid (Methodology & Stack)
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
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--terracotta)', marginBottom: 12 }}>{step.title}</div>
                    <p style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.6, margin: '0 0 20px 0' }}>{step.desc}</p>
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
                    <p style={{ color: 'var(--muted)', fontSize: 13.5, margin: '0 0 20px 0', lineHeight: 1.5 }}>{cat.desc}</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {cat.tools.map((tool) => (
                        <div
                          key={tool.name}
                          style={{
                            borderTop: '1px solid var(--border)',
                            paddingTop: 10,
                          }}
                        >
                          <div style={{ marginBottom: 4 }}>
                            <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 14.5, color: 'var(--ink)' }}>
                              {tool.name}
                            </span>
                          </div>
                          <div style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.4 }}>{tool.role}</div>
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
          6. CTA FINAL EDITORIAL — Unified Canvas
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
