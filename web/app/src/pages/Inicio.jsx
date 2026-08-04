import { Link } from 'react-router-dom';
import useReveal from '../hooks/useReveal.js';
import useDocumentHead from '../hooks/useDocumentHead.js';
import Frieze from '../components/Frieze.jsx';
import Footer from '../components/Footer.jsx';
import { waLink, SERVICES, SEGMENTS, PHASES, VALUES, MARQUEE_ITEMS } from '../data/content.js';

export default function Inicio() {
  useReveal();
  useDocumentHead({
    title: 'Inmerge — Consultoría en Datos · Perú',
    description: 'Gobiernos, empresas e investigadores en el Perú decidiendo sobre datos verificables — no solo creíbles.',
    path: '/',
  });

  return (
    <>
      <div
        style={{
          position: 'relative',
          padding: '120px clamp(20px,5vw,40px) 80px',
          minHeight: '78vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: -120,
            top: '50%',
            transform: 'translateY(-50%) rotate(45deg)',
            width: 420,
            height: 420,
            background: 'var(--ink)',
            opacity: 0.04,
          }}
        />
        <div
          className="breathe-diamond"
          style={{
            position: 'absolute',
            right: 'clamp(16px,6vw,60px)',
            top: '12%',
            width: 'clamp(28px,6vw,60px)',
            height: 'clamp(28px,6vw,60px)',
            background: 'var(--terracotta)',
          }}
        />
        <div style={{ position: 'relative', maxWidth: 1240, margin: '0 auto', width: '100%' }}>
          <div style={{ fontSize: 13, letterSpacing: 4, color: 'var(--terracotta)', fontWeight: 600, marginBottom: 28 }}>
            CONSULTORÍA EN DATOS · PERÚ
          </div>
          <div
            style={{
              fontFamily: "'Spectral',serif",
              fontWeight: 700,
              fontSize: 'clamp(48px,9vw,140px)',
              lineHeight: 0.98,
              letterSpacing: -2,
              margin: '0 0 clamp(20px,5vw,40px)',
            }}
          >
            Cada cifra,
            <br />
            <span style={{ color: 'var(--terracotta)' }}>con su fuente</span>
            <br />a la vista.
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 24 }}>
            <p style={{ fontSize: 18, color: 'var(--muted)', maxWidth: 440, lineHeight: 1.7, margin: 0 }}>
              Gobiernos, empresas e investigadores en el Perú decidiendo sobre datos verificables — no solo creíbles.
            </p>
            <a
              href={waLink('Hola, vi la página de Inmerge y quiero conversar sobre datos verificables para mi organización.')}
              target="_blank"
              rel="noreferrer"
              className="btn-hover"
              style={{
                background: 'var(--terracotta)',
                color: 'var(--bg)',
                borderRadius: 2,
                padding: '18px 34px',
                fontSize: 15,
                fontWeight: 600,
                whiteSpace: 'nowrap',
              }}
            >
              Hablemos por WhatsApp →
            </a>
          </div>
        </div>
      </div>

      <Frieze border="#A8472B" upColor="#D8A84E" downColor="#C68A3D" medallionBg="#A8472B" medallionBorder="#F3EADA" />

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
              <div style={{ fontFamily: "'Spectral',serif", fontWeight: 600, fontSize: 22, color: 'var(--gold)' }}>{m}</div>
              <div style={{ width: 8, height: 8, background: 'var(--terracotta)', transform: 'rotate(45deg)', flexShrink: 0 }} />
            </div>
          ))}
        </div>
      </div>

      <div data-reveal="" style={{ padding: '140px clamp(20px,5vw,40px)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', position: 'relative' }}>
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
              fontSize: 'clamp(28px,4vw,46px)',
              lineHeight: 1.35,
              margin: 0,
            }}
          >
            Las decisiones que más afectan a la gente —presupuesto público, salud, educación, seguridad— hoy se toman con datos que{' '}
            <span style={{ color: 'var(--terracotta)' }}>casi nadie puede verificar.</span>
          </p>
        </div>
      </div>

      <Frieze border="#D8A84E" upColor="#C68A3D" downColor="#A8472B" medallionBg="#D8A84E" medallionBorder="#241A12" />

      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '60px clamp(20px,5vw,40px) 140px' }}>
        <div
          data-reveal=""
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 56, flexWrap: 'wrap', gap: 16 }}
        >
          <div style={{ fontFamily: "'Spectral',serif", fontWeight: 600, fontSize: 'clamp(32px,4vw,52px)' }}>Qué hacemos</div>
          <Link to="/servicios" className="link-hover" style={{ fontSize: 14, fontWeight: 600 }}>
            Portafolio completo →
          </Link>
        </div>
        <div>
          {SERVICES.map((s) => (
            <div
              key={s.number}
              data-reveal=""
              className="row-hover"
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '10px 28px',
                padding: '28px 8px',
                borderTop: '1px solid var(--border)',
              }}
            >
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 14, color: 'var(--terracotta)', flexShrink: 0 }}>
                {s.number}
              </div>
              <div style={{ fontFamily: "'Spectral',serif", fontWeight: 600, fontSize: 'clamp(20px,2.6vw,32px)', flex: 1, minWidth: 220 }}>
                {s.name}
              </div>
              <div style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6, flex: 2, minWidth: 220 }}>{s.line}</div>
            </div>
          ))}
          <div style={{ borderTop: '1px solid var(--border)' }} />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {SEGMENTS.map((seg) => (
          <div key={seg.name} style={{ padding: '100px clamp(20px,5vw,40px)', background: seg.bg, color: seg.fg }}>
            <div
              data-reveal=""
              style={{
                maxWidth: 1160,
                margin: '0 auto',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))',
                gap: 48,
                alignItems: 'center',
              }}
            >
              <div style={{ fontFamily: "'Spectral',serif", fontWeight: 600, fontSize: 'clamp(26px,3.2vw,40px)', lineHeight: 1.2 }}>
                {seg.name}
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "'Spectral',serif",
                    fontWeight: 600,
                    fontStyle: 'italic',
                    fontSize: 'clamp(20px,2.2vw,28px)',
                    lineHeight: 1.4,
                    marginBottom: 16,
                  }}
                >
                  &ldquo;{seg.quote}&rdquo;
                </div>
                <div style={{ fontSize: 14, opacity: 0.75, lineHeight: 1.6 }}>{seg.line}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: 'var(--ink)', color: 'var(--bg)', padding: '140px clamp(20px,5vw,40px)' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>
          <div
            data-reveal=""
            style={{ fontFamily: "'Spectral',serif", fontWeight: 600, fontSize: 'clamp(32px,4vw,52px)', marginBottom: 16 }}
          >
            Método Acequia
          </div>
          <div data-reveal="" style={{ fontSize: 15, color: 'var(--tan-text)', marginBottom: 72, maxWidth: 600 }}>
            Cinco fases, un quality gate en cada una — el dato fluye por un canal diseñado.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 20 }}>
            {PHASES.map((ph) => (
              <div key={ph.number} data-reveal="" style={{ position: 'relative', padding: '0 12px 0 0' }}>
                <div
                  style={{
                    fontFamily: "'Spectral',serif",
                    fontWeight: 800,
                    fontSize: 72,
                    color: 'var(--brown2)',
                    lineHeight: 1,
                    marginBottom: 20,
                  }}
                >
                  {ph.number}
                </div>
                <div style={{ width: 10, height: 10, background: 'var(--gold)', transform: 'rotate(45deg)', marginBottom: 16 }} />
                <div style={{ fontFamily: "'Spectral',serif", fontWeight: 600, fontSize: 18 }}>{ph.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Frieze border="#A8472B" upColor="#D8A84E" downColor="#C68A3D" medallionBg="#A8472B" medallionBorder="#F3EADA" />

      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '140px clamp(20px,5vw,40px)' }}>
        <div data-reveal="" style={{ fontFamily: "'Spectral',serif", fontWeight: 600, fontSize: 'clamp(32px,4vw,52px)', marginBottom: 64 }}>
          Lo que nos sostiene.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 1, background: 'var(--border)' }}>
          {VALUES.map((v) => (
            <div key={v.name} data-reveal="" className="row-hover" style={{ background: 'var(--bg)', padding: 48 }}>
              <div style={{ fontFamily: "'Spectral',serif", fontWeight: 600, fontSize: 24, marginBottom: 14 }}>{v.name}</div>
              <div style={{ fontSize: 15, color: 'var(--muted)', lineHeight: 1.7, maxWidth: 360 }}>{v.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div
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
            data-reveal=""
            style={{
              fontFamily: "'Spectral',serif",
              fontWeight: 700,
              fontSize: 'clamp(32px,5vw,58px)',
              marginBottom: 32,
              lineHeight: 1.15,
            }}
          >
            ¿Conversamos
            <br />
            sobre tus datos?
          </div>
          <div data-reveal="" style={{ fontSize: 15, color: 'var(--tan-text)', marginBottom: 40 }}>
            El mismo consultor que diseña, ejecuta — sin intermediarios.
          </div>
          <a
            data-reveal=""
            href={waLink('Hola, quiero conversar sobre mis datos con Inmerge.')}
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
