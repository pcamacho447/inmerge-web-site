import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import useReveal from '../hooks/useReveal.js';
import useDocumentHead from '../hooks/useDocumentHead.js';
import Frieze from '../components/Frieze.jsx';
import Footer from '../components/Footer.jsx';
import StackTabs from '../components/StackTabs.jsx';
import ArchitectureDiagram from '../components/ArchitectureDiagram.jsx';
import { METHODOLOGY_STEPS } from '../data/stack.js';
import { waLink, VALUES, ROLES } from '../data/content.js';

export default function Nosotros() {
  useReveal();
  useDocumentHead({
    title: 'Nosotros & Metodología — Inmerge · Auditoría, Ingeniería & Datos',
    description:
      'Firma boutique de ingeniería de datos, arquitectura cloud y auditoría técnica en Lima, Perú. Conoce nuestro equipo senior, metodología de 4 fases y stack tecnológico.',
    path: '/nosotros',
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

  const whatsappCta = waLink(
    'Hola Inmerge, he revisado su equipo, metodología y stack técnico. Me gustaría coordinar una reunión técnica para un proyecto.',
  );

  return (
    <>
      {/* Hero Section */}
      <div style={{ padding: '100px clamp(20px,5vw,40px) 40px', maxWidth: 1240, margin: '0 auto' }}>
        <div style={{ fontSize: 13, letterSpacing: 4, color: 'var(--terracotta)', fontWeight: 600, marginBottom: 24 }}>
          LA FIRMA // INMERGE
        </div>
        <h1
          style={{
            fontFamily: "'Spectral', serif",
            fontWeight: 700,
            fontSize: 'clamp(40px,7vw,88px)',
            lineHeight: 1.05,
            letterSpacing: -1,
            maxWidth: 980,
            margin: '0 0 24px 0',
            color: 'var(--ink)',
          }}
        >
          Ingeniería rigurosa, auditoría estricta y datos reproducibles.
        </h1>
        <p style={{ fontSize: 18, color: 'var(--muted)', maxWidth: 720, lineHeight: 1.7, margin: '0 0 32px 0' }}>
          Somos una firma boutique especializada en auditoría de sistemas, ingeniería de software cloud y ciencia de datos. Diseñamos
          soluciones donde cada cálculo es citable y cada línea de código es mantenible, ejecutando proyectos sin intermediarios.
        </p>

        {/* Quick Anchor Subnav */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 10,
            paddingTop: 12,
            borderTop: '1px solid var(--border)',
          }}
        >
          <a
            href="#mision"
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 12,
              padding: '6px 14px',
              borderRadius: 20,
              background: 'var(--cream2)',
              color: 'var(--ink)',
              textDecoration: 'none',
              border: '1px solid var(--border)',
            }}
            className="link-hover"
          >
            # Misión & Propósito
          </a>
          <a
            href="#metodo"
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 12,
              padding: '6px 14px',
              borderRadius: 20,
              background: 'var(--cream2)',
              color: 'var(--ink)',
              textDecoration: 'none',
              border: '1px solid var(--border)',
            }}
            className="link-hover"
          >
            # El Método (4 Etapas)
          </a>
          <a
            href="#arquitectura"
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 12,
              padding: '6px 14px',
              borderRadius: 20,
              background: 'var(--cream2)',
              color: 'var(--ink)',
              textDecoration: 'none',
              border: '1px solid var(--border)',
            }}
            className="link-hover"
          >
            # Arquitectura Cloud
          </a>
          <a
            href="#stack"
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 12,
              padding: '6px 14px',
              borderRadius: 20,
              background: 'var(--cream2)',
              color: 'var(--ink)',
              textDecoration: 'none',
              border: '1px solid var(--border)',
            }}
            className="link-hover"
          >
            # Stack Tecnológico
          </a>
          <a
            href="#equipo"
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 12,
              padding: '6px 14px',
              borderRadius: 20,
              background: 'var(--cream2)',
              color: 'var(--ink)',
              textDecoration: 'none',
              border: '1px solid var(--border)',
            }}
            className="link-hover"
          >
            # Especialistas Senior
          </a>
        </div>
      </div>

      <Frieze border="#A8472B" upColor="#D8A84E" downColor="#C68A3D" medallionBg="#A8472B" medallionBorder="#F3EADA" />

      {/* Núcleo Estratégico: Propósito, Misión y Visión */}
      <section id="mision" style={{ maxWidth: 1240, margin: '0 auto', padding: '90px clamp(20px,5vw,40px)' }}>
        <div style={{ fontSize: 12, letterSpacing: 2, color: 'var(--terracotta)', fontWeight: 600, marginBottom: 16 }}>
          DECLARACIONES DE RIGOR
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
          El Estándar Inmerge: Propósito, Misión & Visión
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))',
            gap: 1,
            background: 'var(--border)',
            border: '1px solid var(--border)',
          }}
        >
          {/* Propósito */}
          <div data-reveal="" className="card-hover" style={{ background: 'var(--bg)', padding: 40 }}>
            <div
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 11,
                letterSpacing: 1.5,
                color: 'var(--terracotta)',
                fontWeight: 700,
                marginBottom: 16,
              }}
            >
              [PRINCIPIO // PROPÓSITO]
            </div>
            <h3 style={{ fontFamily: "'Spectral',serif", fontWeight: 700, fontSize: 22, color: 'var(--ink)', marginBottom: 14 }}>
              Garantía de Verdad Operativa
            </h3>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--muted)', margin: 0 }}>
              Garantizar que la toma de decisiones estratégicas y la infraestructura operacional descansen sobre datos matemáticamente íntegros,
              trazables y sobre arquitecturas cloud resilientes.
            </p>
          </div>

          {/* Misión */}
          <div data-reveal="" className="card-hover" style={{ background: 'var(--bg)', padding: 40 }}>
            <div
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 11,
                letterSpacing: 1.5,
                color: 'var(--terracotta)',
                fontWeight: 700,
                marginBottom: 16,
              }}
            >
              [COMPROMISO // MISIÓN]
            </div>
            <h3 style={{ fontFamily: "'Spectral',serif", fontWeight: 700, fontSize: 22, color: 'var(--ink)', marginBottom: 14 }}>
              Ingeniería sin Cajas Negras
            </h3>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--muted)', margin: 0 }}>
              Auditar, desarrollar y desplegar plataformas de software, tuberías de datos y modelos de IA con estándares de ingeniería de
              clase mundial, asegurando código auditable donde el cliente conserva la propiedad total.
            </p>
          </div>

          {/* Visión */}
          <div data-reveal="" className="card-hover" style={{ background: 'var(--bg)', padding: 40 }}>
            <div
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 11,
                letterSpacing: 1.5,
                color: 'var(--terracotta)',
                fontWeight: 700,
                marginBottom: 16,
              }}
            >
              [HORIZONTE // VISIÓN]
            </div>
            <h3 style={{ fontFamily: "'Spectral',serif", fontWeight: 700, fontSize: 22, color: 'var(--ink)', marginBottom: 14 }}>
              Referencia Técnica Regional
            </h3>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--muted)', margin: 0 }}>
              Ser la firma boutique de referencia en Latinoamérica para organizaciones que no aceptan cajas negras, inconsistencias en sus
              métricas ni vulnerabilidades en su stack tecnológico.
            </p>
          </div>
        </div>
      </section>

      {/* Ciclo de Vida: El Método Inmerge en 4 etapas */}
      <section id="metodo" style={{ maxWidth: 1240, margin: '0 auto', padding: '0 clamp(20px,5vw,40px) 100px' }}>
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

      {/* Sección: Diagrama de Arquitectura */}
      <section id="arquitectura" style={{ maxWidth: 1240, margin: '0 auto', padding: '0 clamp(20px,5vw,40px) 100px' }} data-reveal="">
        <ArchitectureDiagram />
      </section>

      {/* Sección: Stack Tecnológico Interactivo */}
      <section id="stack" style={{ maxWidth: 1240, margin: '0 auto', padding: '0 clamp(20px,5vw,40px) 100px' }}>
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

      {/* Sección: Principios de Aseguramiento Técnico */}
      <div
        style={{
          background: 'var(--ink)',
          color: '#F3EADA',
          padding: 'clamp(60px, 8vw, 100px) clamp(20px, 5vw, 40px)',
        }}
        data-reveal=""
      >
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>
          <div style={{ fontSize: 12, letterSpacing: 2, color: 'var(--gold)', fontWeight: 600, marginBottom: 16 }}>COMPROMISO TÉCNICO</div>
          <h2
            style={{
              fontFamily: "'Spectral', serif",
              fontSize: 'clamp(28px, 4vw, 44px)',
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
              marginTop: 36,
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
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: 'var(--green)', marginBottom: 8 }}>
                04. SOBERANÍA TECNOLÓGICA
              </div>
              <p style={{ fontSize: 14, color: 'rgba(243,234,218,0.8)', lineHeight: 1.6, margin: 0 }}>
                Sin ataduras a plataformas propietarias: arquitectura desplegada en las cuentas cloud de tu propia organización.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sección: El Arquetipo (Es vs No Es) */}
      <div style={{ background: 'var(--bg)', color: 'var(--ink)', padding: '100px clamp(20px,5vw,40px)' }}>
        <div
          style={{
            maxWidth: 1240,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))',
            gap: 56,
            alignItems: 'center',
          }}
        >
          <div data-reveal="">
            <div style={{ fontSize: 12, letterSpacing: 2, color: 'var(--terracotta)', fontWeight: 600, marginBottom: 16 }}>ARQUETIPO</div>
            <div style={{ fontFamily: "'Spectral',serif", fontWeight: 700, fontSize: 'clamp(32px,4vw,48px)', lineHeight: 1.1 }}>
              El Ingeniero & Auditor Estratégico.
            </div>
          </div>
          <div data-reveal="" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div style={{ background: 'var(--cream2)', borderRadius: 4, padding: 28, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 12, letterSpacing: 1.5, color: 'var(--green)', fontWeight: 700, marginBottom: 12 }}>ES</div>
              <div style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--ink)' }}>
                Experto que audita, programa y explica; riguroso con los números y transparente con el código.
              </div>
            </div>
            <div style={{ background: 'var(--cream2)', borderRadius: 4, padding: 28, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 12, letterSpacing: 1.5, color: 'var(--terracotta)', fontWeight: 700, marginBottom: 12 }}>NO ES</div>
              <div style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--muted)' }}>
                Vendedor comisionista, teórico desconectado de la implementación ni consultora de diapositivas vacías.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sección: Por qué elegir a Inmerge */}
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 clamp(20px,5vw,40px) 100px' }}>
        <div data-reveal="" style={{ fontFamily: "'Spectral',serif", fontWeight: 600, fontSize: 'clamp(32px,4vw,52px)', marginBottom: 16 }}>
          Por qué elegir a Inmerge
        </div>
        <div data-reveal="" style={{ fontSize: 15, color: 'var(--muted)', marginBottom: 56, maxWidth: 680 }}>
          Combinamos la profundidad de auditoría con la capacidad de ejecución en ingeniería de software y ciencia de datos.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 0 }}>
          <div data-reveal="" className="row-hover" style={{ padding: 32, borderRight: '1px solid var(--border)' }}>
            <div style={{ fontSize: 12, letterSpacing: 1.5, color: 'var(--muted)', fontWeight: 600, marginBottom: 12 }}>
              CONSULTORAS GENERALISTAS
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--muted)' }}>
              Entregan diagnósticos en diapositivas pero no tienen capacidad técnica para construir o auditar el código fuente.
            </div>
          </div>
          <div data-reveal="" className="row-hover" style={{ padding: 32, borderRight: '1px solid var(--border)' }}>
            <div style={{ fontSize: 12, letterSpacing: 1.5, color: 'var(--muted)', fontWeight: 600, marginBottom: 12 }}>
              SOFTWARE FACTORIES GENÉRICAS
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--muted)' }}>
              Construyen interfaces sin criterio de auditoría de datos, gobernanza ni modelos predictivos matemáticos.
            </div>
          </div>
          <div data-reveal="" className="card-hover" style={{ padding: 32, background: 'var(--ink)', color: 'var(--bg)' }}>
            <div style={{ fontSize: 12, letterSpacing: 1.5, color: 'var(--gold)', fontWeight: 600, marginBottom: 12 }}>INMERGE</div>
            <div style={{ fontSize: 14, lineHeight: 1.7 }}>
              Auditoría rigurosa, ingeniería de software en la nube y ciencia de datos avanzada ejecutadas por el mismo equipo senior.
            </div>
          </div>
        </div>
      </div>

      {/* Sección: Especialistas Senior */}
      <div id="equipo" style={{ background: 'var(--cream2)', padding: '100px clamp(20px,5vw,40px)' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>
          <div
            data-reveal=""
            style={{ fontFamily: "'Spectral',serif", fontWeight: 600, fontSize: 'clamp(32px,4vw,52px)', marginBottom: 16 }}
          >
            Especialistas Senior
          </div>
          <div data-reveal="" style={{ fontSize: 15, color: 'var(--muted)', marginBottom: 56, maxWidth: 680 }}>
            Sin intermediarios comerciales: cada proyecto es liderado e implementado directamente por perfiles especializados.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 20 }}>
            {ROLES.map((r) => (
              <div key={r.name} data-reveal="" className="card-hover" style={{ background: 'var(--bg)', padding: 28 }}>
                <div style={{ width: 8, height: 8, background: 'var(--terracotta)', transform: 'rotate(45deg)', marginBottom: 16 }} />
                <div style={{ fontFamily: "'Spectral',serif", fontWeight: 700, fontSize: 17, marginBottom: 8, color: 'var(--ink)' }}>
                  {r.name}
                </div>
                <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>{r.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sección: Nuestros Compromisos / Valores */}
      <div id="compromisos" style={{ maxWidth: 1240, margin: '0 auto', padding: '100px clamp(20px,5vw,40px)' }}>
        <div data-reveal="" style={{ fontFamily: "'Spectral',serif", fontWeight: 600, fontSize: 'clamp(32px,4vw,52px)', marginBottom: 56 }}>
          Nuestros Compromisos
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {VALUES.map((v) => (
            <div
              key={v.name}
              data-reveal=""
              className="row-hover"
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'baseline',
                gap: '12px 24px',
                padding: '28px 0',
                borderTop: '1px solid var(--border)',
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  background: 'var(--terracotta)',
                  transform: 'rotate(45deg)',
                  flexShrink: 0,
                  alignSelf: 'center',
                }}
              />
              <div style={{ fontFamily: "'Spectral',serif", fontWeight: 600, fontSize: 22, flex: '0 0 240px' }}>{v.name}</div>
              <div style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6, flex: 1, minWidth: 220 }}>{v.desc}</div>
            </div>
          ))}
          <div style={{ borderTop: '1px solid var(--border)' }} />
        </div>
      </div>

      {/* CTA Final */}
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
            ¿Conversamos sobre tus requerimientos técnicos?
          </h2>
          <p style={{ fontSize: 16, color: 'var(--tan-text)', marginBottom: 36, maxWidth: 560, margin: '0 auto 36px' }}>
            Auditoría preliminar, arquitectura cloud o modelos analíticos — estamos listos para revisar tu caso sin intermediarios.
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
            Escríbenos por WhatsApp
          </a>
        </div>
      </div>

      <Footer />
    </>
  );
}
