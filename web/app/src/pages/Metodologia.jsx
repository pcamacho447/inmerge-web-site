import useReveal from '../hooks/useReveal.js';
import useDocumentHead from '../hooks/useDocumentHead.js';
import Frieze from '../components/Frieze.jsx';
import Footer from '../components/Footer.jsx';
import StackTabs from '../components/StackTabs.jsx';
import ArchitectureDiagram from '../components/ArchitectureDiagram.jsx';
import { METHODOLOGY_STEPS } from '../data/stack.js';
import { waLink } from '../data/content.js';
import { Link } from 'react-router-dom';

export default function Metodologia() {
  useReveal();
  useDocumentHead({
    title: 'Stack & Metodología — Inmerge',
    description: 'Conoce nuestra arquitectura técnica, estándares de auditoría, pipelines de datos en AWS y stack tecnológico moderno.',
    path: '/metodologia',
  });

  const whatsappCta = waLink(
    'Hola Inmerge, he revisado su metodología y stack técnico. Me gustaría coordinar una reunión técnica para un proyecto.',
  );

  return (
    <>
      {/* Header Section */}
      <div style={{ padding: '100px clamp(20px,5vw,40px) 60px', maxWidth: 1240, margin: '0 auto' }}>
        <div style={{ fontSize: 13, letterSpacing: 4, color: 'var(--terracotta)', fontWeight: 600, marginBottom: 24 }}>
          MÉTODO & TECNOLOGÍA
        </div>
        <h1
          style={{
            fontFamily: "'Spectral', serif",
            fontWeight: 700,
            fontSize: 'clamp(40px,7vw,88px)',
            lineHeight: 1.05,
            letterSpacing: -1,
            maxWidth: 960,
            color: 'var(--ink)',
            margin: '0 0 24px 0',
          }}
        >
          Ingeniería rigurosa, auditoría estricta y datos reproducibles.
        </h1>
        <p style={{ fontSize: 18, color: 'var(--muted)', maxWidth: 680, lineHeight: 1.7, margin: 0 }}>
          No usamos cajas negras ni plantillas genéricas. Aplicamos una metodología de 4 fases que asegura trazabilidad, seguridad cloud y
          sistemas vivos capaces de resistir cualquier auditoría.
        </p>
      </div>

      <Frieze border="#A8472B" upColor="#D8A84E" downColor="#C68A3D" medallionBg="#A8472B" medallionBorder="#F3EADA" />

      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '80px clamp(20px,5vw,40px) 120px' }}>
        {/* Section 1: Las 4 Fases de la Metodología */}
        <section style={{ marginBottom: 100 }}>
          <div style={{ fontSize: 12, letterSpacing: 2, color: 'var(--terracotta)', fontWeight: 600, marginBottom: 16 }}>
            CICLO DE VIDA DEL PROYECTO
          </div>
          <h2
            style={{
              fontFamily: "'Spectral', serif",
              fontSize: 'clamp(32px, 5vw, 48px)',
              fontWeight: 700,
              color: 'var(--ink)',
              margin: '0 0 40px 0',
            }}
          >
            El Método Inmerge en 4 etapas
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 24,
            }}
          >
            {METHODOLOGY_STEPS.map((step) => (
              <div
                key={step.step}
                data-reveal=""
                style={{
                  background: 'var(--cream2)',
                  border: '1px solid var(--border)',
                  padding: 32,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
                className="card-hover"
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 16,
                      borderBottom: '1px solid var(--border)',
                      paddingBottom: 8,
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
                      fontSize: 22,
                      fontWeight: 700,
                      color: 'var(--ink)',
                      margin: '0 0 8px 0',
                    }}
                  >
                    {step.phase}
                  </h3>

                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--terracotta)', marginBottom: 12 }}>{step.title}</div>

                  <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6, margin: '0 0 20px 0' }}>{step.desc}</p>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
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
                    Entregables Clave:
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
        </section>

        {/* Section 2: Diagrama de Arquitectura */}
        <section style={{ marginBottom: 100 }} data-reveal="">
          <ArchitectureDiagram />
        </section>

        {/* Section 3: Stack Tecnológico Interactivo */}
        <section style={{ marginBottom: 100 }}>
          <div style={{ fontSize: 12, letterSpacing: 2, color: 'var(--terracotta)', fontWeight: 600, marginBottom: 16 }}>
            HERRAMIENTAS & ECOEFICIENCIA TÉCNICA
          </div>
          <h2
            style={{
              fontFamily: "'Spectral', serif",
              fontSize: 'clamp(32px, 5vw, 48px)',
              fontWeight: 700,
              color: 'var(--ink)',
              margin: '0 0 16px 0',
            }}
          >
            Stack Tecnológico Seleccionado
          </h2>
          <p style={{ fontSize: 16, color: 'var(--muted)', maxWidth: 680, margin: 0 }}>
            Utilizamos tecnologías probadas en producción, de código abierto o estándares globales en la nube (AWS), garantizando que el
            cliente sea dueño absoluto de su infraestructura y código.
          </p>

          <StackTabs />
        </section>

        {/* Section 4: Estándares de Auditoría y Calidad */}
        <section
          style={{
            background: 'var(--ink)',
            color: '#F3EADA',
            padding: 'clamp(40px, 6vw, 64px)',
            marginBottom: 80,
          }}
          data-reveal=""
        >
          <div style={{ fontSize: 12, letterSpacing: 2, color: 'var(--gold)', fontWeight: 600, marginBottom: 16 }}>COMPROMISO TÉCNICO</div>
          <h2
            style={{
              fontFamily: "'Spectral', serif",
              fontSize: 'clamp(28px, 4vw, 40px)',
              fontWeight: 700,
              margin: '0 0 24px 0',
            }}
          >
            Nuestros 4 Principios de Aseguramiento
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 32,
              marginTop: 32,
            }}
          >
            <div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: 'var(--terracotta)', marginBottom: 8 }}>
                01. CÓDIGO PROBADO & CI/CD
              </div>
              <p style={{ fontSize: 14, color: 'rgba(243,234,218,0.8)', lineHeight: 1.6, margin: 0 }}>
                Cada módulo cuenta con suites de pruebas unitarias y de integración automáticas para garantizar cero regresiones.
              </p>
            </div>

            <div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: 'var(--ochre)', marginBottom: 8 }}>
                02. SEGURIDAD & COMPLIANCE
              </div>
              <p style={{ fontSize: 14, color: 'rgba(243,234,218,0.8)', lineHeight: 1.6, margin: 0 }}>
                Control de acceso granular con Row Level Security (RLS), cifrado de datos en reposo y en tránsito sobre AWS.
              </p>
            </div>

            <div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: 'var(--gold)', marginBottom: 8 }}>
                03. REPRODUCIBILIDAD TOTAL
              </div>
              <p style={{ fontSize: 14, color: 'rgba(243,234,218,0.8)', lineHeight: 1.6, margin: 0 }}>
                Pipelines declarativos de datos donde cada transformación es rastreable desde la fuente de origen hasta la interfaz.
              </p>
            </div>

            <div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: '#F3EADA', marginBottom: 8 }}>
                04. CERO VENDOR LOCK-IN
              </div>
              <p style={{ fontSize: 14, color: 'rgba(243,234,218,0.8)', lineHeight: 1.6, margin: 0 }}>
                Entregamos todo el código fuente documentado y configurado para que tu equipo opere con independencia total.
              </p>
            </div>
          </div>
        </section>

        {/* Final Call to Action */}
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            borderTop: '1px solid var(--border)',
          }}
          data-reveal=""
        >
          <h2
            style={{
              fontFamily: "'Spectral', serif",
              fontSize: 'clamp(28px, 4vw, 44px)',
              fontWeight: 700,
              color: 'var(--ink)',
              margin: '0 0 16px 0',
            }}
          >
            ¿Listo para auditar, modernizar o escalar tus sistemas?
          </h2>
          <p style={{ fontSize: 17, color: 'var(--muted)', maxWidth: 600, margin: '0 auto 32px', lineHeight: 1.6 }}>
            Conversemos sobre la arquitectura y requerimientos específicos de tu organización.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
            <Link
              to="/contacto"
              style={{
                background: 'var(--terracotta)',
                color: '#F3EADA',
                padding: '14px 28px',
                fontSize: 15,
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'opacity 0.2s ease',
              }}
              className="btn-accent"
            >
              Solicitar Cotización TDR
            </Link>

            <a
              href={whatsappCta}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: 'transparent',
                color: 'var(--ink)',
                border: '1px solid var(--ink)',
                padding: '14px 28px',
                fontSize: 15,
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'background 0.2s ease, color 0.2s ease',
              }}
              className="btn-outline"
            >
              Contactar por WhatsApp
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
