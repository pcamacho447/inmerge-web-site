import { Link } from 'react-router-dom';
import useReveal from '../hooks/useReveal.js';
import useDocumentHead from '../hooks/useDocumentHead.js';
import Frieze from '../components/Frieze.jsx';
import Footer from '../components/Footer.jsx';
import ServicePillarCard from '../components/ServicePillarCard.jsx';
import ArchitectureDiagram from '../components/ArchitectureDiagram.jsx';
import { waLink, PILLARS, SEGMENTS, VALUES, MARQUEE_ITEMS } from '../data/content.js';

export default function Inicio() {
  useReveal();
  useDocumentHead({
    title: 'Inmerge — Auditoría, Desarrollo Tecnológico & Ciencia de Datos',
    description:
      'Consultoría técnica de alto impacto en Lima, Perú: Auditoría de sistemas y datos, desarrollo cloud en AWS, software a medida y modelos de Machine Learning.',
    path: '/',
  });

  const heroWa = waLink(
    'Hola Inmerge, deseo conversar con un especialista técnico sobre un proyecto de auditoría, desarrollo o ciencia de datos.',
  );

  return (
    <>
      {/* Hero Section */}
      <div
        style={{
          position: 'relative',
          padding: '120px clamp(20px,5vw,40px) 80px',
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: -120,
            top: '50%',
            transform: 'translateY(-50%) rotate(45deg)',
            width: 440,
            height: 440,
            background: 'var(--ink)',
            opacity: 0.04,
          }}
        />
        <div
          className="breathe-diamond"
          style={{
            position: 'absolute',
            right: 'clamp(16px,6vw,60px)',
            top: '14%',
            width: 'clamp(32px,6vw,64px)',
            height: 'clamp(32px,6vw,64px)',
            background: 'var(--terracotta)',
          }}
        />
        <div style={{ position: 'relative', maxWidth: 1240, margin: '0 auto', width: '100%' }}>
          <div
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 13,
              letterSpacing: 3,
              color: 'var(--terracotta)',
              fontWeight: 600,
              marginBottom: 24,
              textTransform: 'uppercase',
            }}
          >
            AUDITORÍA · DESARROLLO CLOUD · CIENCIA DE DATOS
          </div>
          <h1
            style={{
              fontFamily: "'Spectral',serif",
              fontWeight: 700,
              fontSize: 'clamp(44px,7.8vw,110px)',
              lineHeight: 1.02,
              letterSpacing: -1.5,
              margin: '0 0 clamp(24px,4vw,36px)',
              color: 'var(--ink)',
              maxWidth: 1050,
            }}
          >
            Ingeniería de software,
            <br />
            <span style={{ color: 'var(--terracotta)' }}>auditoría de sistemas</span>
            <br />e inteligencia de datos.
          </h1>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 32 }}>
            <p style={{ fontSize: 18, color: 'var(--muted)', maxWidth: 520, lineHeight: 1.7, margin: 0 }}>
              Construimos plataformas cloud robustas, auditamos la integridad de datos críticos y desplegamos modelos de IA orientados a
              resultados reales de negocio.
            </p>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <Link
                to="/contacto"
                style={{
                  background: 'var(--terracotta)',
                  color: 'var(--bg)',
                  padding: '16px 30px',
                  fontSize: 15,
                  fontWeight: 600,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
                className="btn-accent"
              >
                <span>Solicitar Cotización TDR</span>
                <span aria-hidden="true">→</span>
              </Link>
              <a
                href={heroWa}
                target="_blank"
                rel="noreferrer"
                style={{
                  background: 'transparent',
                  color: 'var(--ink)',
                  border: '1px solid var(--ink)',
                  padding: '16px 26px',
                  fontSize: 15,
                  fontWeight: 600,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
                className="btn-outline"
              >
                <span>WhatsApp Directo</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Marquee Banner */}
      <div
        aria-hidden="true"
        style={{
          background: 'var(--ink)',
          overflow: 'hidden',
          padding: '16px 0',
          borderTop: '1px solid #4A3826',
          borderBottom: '1px solid #4A3826',
        }}
      >
        <div className="marquee-track">
          {MARQUEE_ITEMS.map((m, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '0 20px', whiteSpace: 'nowrap' }}>
              <div style={{ fontFamily: "'Spectral',serif", fontWeight: 600, fontSize: 20, color: 'var(--gold)' }}>{m}</div>
              <div style={{ width: 8, height: 8, background: 'var(--terracotta)', transform: 'rotate(45deg)', flexShrink: 0 }} />
            </div>
          ))}
        </div>
      </div>

      {/* Quote / Manifesto */}
      <div data-reveal="" style={{ padding: '120px clamp(20px,5vw,40px)' }}>
        <div style={{ maxWidth: 1050, margin: '0 auto', position: 'relative' }}>
          <div
            style={{
              fontFamily: "'Spectral',serif",
              fontWeight: 800,
              fontSize: 180,
              color: '#EBDFC9',
              position: 'absolute',
              top: -100,
              left: -40,
              lineHeight: 1,
              zIndex: 0,
            }}
          >
            &ldquo;
          </div>
          <p
            style={{
              position: 'relative',
              zIndex: 1,
              fontFamily: "'Spectral',serif",
              fontWeight: 600,
              fontSize: 'clamp(26px,3.8vw,42px)',
              lineHeight: 1.4,
              margin: 0,
              color: 'var(--ink)',
            }}
          >
            Las decisiones operativas y estratégicas de alto nivel no pueden depender de hojas de cálculo aisladas ni de sistemas opacos:{' '}
            <span style={{ color: 'var(--terracotta)' }}>requieren arquitectura sólida, datos auditables y código verificable.</span>
          </p>
        </div>
      </div>

      <Frieze border="#D8A84E" upColor="#C68A3D" downColor="#A8472B" medallionBg="#D8A84E" medallionBorder="#241A12" />

      {/* 3 Pillars Section */}
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '80px clamp(20px,5vw,40px) 120px' }}>
        <div
          data-reveal=""
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 56, flexWrap: 'wrap', gap: 16 }}
        >
          <div>
            <div
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 12,
                color: 'var(--terracotta)',
                letterSpacing: 2,
                fontWeight: 600,
                marginBottom: 8,
              }}
            >
              NUESTRA OFERTA ESTRATÉGICA
            </div>
            <h2 style={{ fontFamily: "'Spectral',serif", fontWeight: 700, fontSize: 'clamp(32px,4.5vw,52px)', margin: 0 }}>
              Los Tres Pilares de Inmerge
            </h2>
          </div>
          <Link to="/servicios" className="link-hover" style={{ fontSize: 15, fontWeight: 600 }}>
            Ver desglose de servicios →
          </Link>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 24,
          }}
        >
          {PILLARS.map((pillar) => (
            <div key={pillar.id} data-reveal="">
              <ServicePillarCard pillar={pillar} />
            </div>
          ))}
        </div>
      </div>

      {/* Architecture & Flow Section */}
      <div style={{ background: 'var(--ink)', color: 'var(--bg)', padding: '100px clamp(20px,5vw,40px)' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>
          <div data-reveal="" style={{ maxWidth: 700, marginBottom: 40 }}>
            <div
              style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: 'var(--gold)', letterSpacing: 2, marginBottom: 12 }}
            >
              DISEÑO & INGENIERÍA
            </div>
            <h2
              style={{
                fontFamily: "'Spectral',serif",
                fontWeight: 700,
                fontSize: 'clamp(32px,4vw,52px)',
                lineHeight: 1.1,
                margin: '0 0 16px 0',
              }}
            >
              De la ingestión cruda al producto vivo.
            </h2>
            <p style={{ fontSize: 16, color: 'rgba(243,234,218,0.8)', lineHeight: 1.6, margin: 0 }}>
              Nuestras soluciones integran auditoría continua en cada capa del flujo técnico, asegurando que cada dato que alimenta tus
              dashboards o modelos provenga de fuentes sanitizadas.
            </p>
          </div>

          <div data-reveal="">
            <ArchitectureDiagram />
          </div>

          <div data-reveal="" style={{ textAlign: 'center', marginTop: 40 }}>
            <Link
              to="/metodologia"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                color: 'var(--gold)',
                fontSize: 15,
                fontWeight: 600,
                textDecoration: 'none',
                borderBottom: '1px solid var(--gold)',
                paddingBottom: 4,
              }}
            >
              <span>Explorar nuestro stack tecnológico y metodología de 4 fases</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Segments Section */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {SEGMENTS.map((seg) => (
          <div key={seg.name} style={{ padding: '90px clamp(20px,5vw,40px)', background: seg.bg, color: seg.fg }}>
            <div
              data-reveal=""
              style={{
                maxWidth: 1160,
                margin: '0 auto',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))',
                gap: 40,
                alignItems: 'center',
              }}
            >
              <div style={{ fontFamily: "'Spectral',serif", fontWeight: 700, fontSize: 'clamp(26px,3.2vw,38px)', lineHeight: 1.2 }}>
                {seg.name}
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "'Spectral',serif",
                    fontWeight: 600,
                    fontStyle: 'italic',
                    fontSize: 'clamp(20px,2.2vw,26px)',
                    lineHeight: 1.4,
                    marginBottom: 14,
                  }}
                >
                  &ldquo;{seg.quote}&rdquo;
                </div>
                <div style={{ fontSize: 14, opacity: 0.8, lineHeight: 1.6 }}>{seg.line}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Frieze border="#A8472B" upColor="#D8A84E" downColor="#C68A3D" medallionBg="#A8472B" medallionBorder="#F3EADA" />

      {/* Values Section */}
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '120px clamp(20px,5vw,40px)' }}>
        <div data-reveal="" style={{ fontFamily: "'Spectral',serif", fontWeight: 700, fontSize: 'clamp(32px,4vw,52px)', marginBottom: 56 }}>
          Principios de Ingeniería
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 1, background: 'var(--border)' }}>
          {VALUES.map((v) => (
            <div key={v.name} data-reveal="" className="row-hover" style={{ background: 'var(--bg)', padding: 44 }}>
              <div style={{ fontFamily: "'Spectral',serif", fontWeight: 700, fontSize: 22, marginBottom: 12, color: 'var(--ink)' }}>
                {v.name}
              </div>
              <div style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7, maxWidth: 360 }}>{v.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Final CTA */}
      <div
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
          <div
            data-reveal=""
            style={{
              fontFamily: "'Spectral',serif",
              fontWeight: 700,
              fontSize: 'clamp(32px,5vw,56px)',
              marginBottom: 24,
              lineHeight: 1.15,
            }}
          >
            Iniciemos una evaluación técnica de tus sistemas y datos.
          </div>
          <div data-reveal="" style={{ fontSize: 16, color: 'var(--tan-text)', marginBottom: 40, maxWidth: 560, margin: '0 auto 40px' }}>
            Consultores e ingenieros senior trabajando directamente en tu arquitectura, sin intermediarios ni demoras.
          </div>
          <div data-reveal="" style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
            <Link
              to="/contacto"
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
              Solicitar Términos de Referencia (TDR)
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
              Escribir a WhatsApp
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
