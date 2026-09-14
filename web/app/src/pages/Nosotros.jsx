import useReveal from '../hooks/useReveal.js';
import useDocumentHead from '../hooks/useDocumentHead.js';
import Frieze from '../components/Frieze.jsx';
import Footer from '../components/Footer.jsx';
import { waLink, VALUES, ROLES } from '../data/content.js';

export default function Nosotros() {
  useReveal();
  useDocumentHead({
    title: 'Nosotros — Inmerge · Auditoría, Ingeniería & Datos',
    description:
      'Equipo senior de ingeniería de datos, arquitectura cloud y auditoría técnica en Lima, Perú. Diseñamos y ejecutamos sin intermediarios.',
    path: '/nosotros',
  });

  return (
    <>
      <div style={{ padding: '100px clamp(20px,5vw,40px) 80px', maxWidth: 1240, margin: '0 auto' }}>
        <div style={{ fontSize: 13, letterSpacing: 4, color: 'var(--terracotta)', fontWeight: 600, marginBottom: 24 }}>NOSOTROS</div>
        <h1
          style={{
            fontFamily: "'Spectral',serif",
            fontWeight: 700,
            fontSize: 'clamp(40px,7vw,88px)',
            lineHeight: 1.05,
            letterSpacing: -1,
            maxWidth: 900,
            margin: '0 0 24px 0',
            color: 'var(--ink)',
          }}
        >
          Rigor técnico sin intermediarios.
        </h1>
        <p style={{ fontSize: 18, color: 'var(--muted)', maxWidth: 640, lineHeight: 1.7, margin: 0 }}>
          Somos una firma boutique especializada en auditoría de sistemas, ingeniería de software cloud y ciencia de datos. Diseñamos
          soluciones donde cada cálculo es citable y cada línea de código es mantenible.
        </p>
      </div>

      <Frieze border="#A8472B" upColor="#D8A84E" downColor="#C68A3D" medallionBg="#A8472B" medallionBorder="#F3EADA" />

      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '100px clamp(20px,5vw,40px)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 1, background: 'var(--border)' }}>
          <div data-reveal="" className="card-hover" style={{ background: 'var(--bg)', padding: 40 }}>
            <div style={{ fontSize: 11, letterSpacing: 1.5, color: 'var(--terracotta)', fontWeight: 600, marginBottom: 12 }}>PROPÓSITO</div>
            <p style={{ fontFamily: "'Spectral',serif", fontWeight: 600, fontSize: 19, lineHeight: 1.6, margin: 0 }}>
              Garantizar que la toma de decisiones y la operación tecnológica descansen sobre datos íntegros y arquitecturas sólidas.
            </p>
          </div>
          <div data-reveal="" className="card-hover" style={{ background: 'var(--bg)', padding: 40 }}>
            <div style={{ fontSize: 11, letterSpacing: 1.5, color: 'var(--terracotta)', fontWeight: 600, marginBottom: 12 }}>MISIÓN</div>
            <p style={{ fontFamily: "'Spectral',serif", fontWeight: 600, fontSize: 19, lineHeight: 1.6, margin: 0 }}>
              Auditar, desarrollar e implementar plataformas tecnológicas y modelos de IA con estándares de ingeniería de clase mundial.
            </p>
          </div>
          <div data-reveal="" className="card-hover" style={{ background: 'var(--bg)', padding: 40 }}>
            <div style={{ fontSize: 11, letterSpacing: 1.5, color: 'var(--terracotta)', fontWeight: 600, marginBottom: 12 }}>VISIÓN</div>
            <p style={{ fontFamily: "'Spectral',serif", fontWeight: 600, fontSize: 19, lineHeight: 1.6, margin: 0 }}>
              Ser el socio estratégico de referencia para organizaciones que no aceptan cajas negras ni vulnerabilidades en su stack.
            </p>
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--ink)', color: 'var(--bg)', padding: '120px clamp(20px,5vw,40px)' }}>
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
            <div style={{ fontSize: 12, letterSpacing: 2, color: 'var(--gold)', fontWeight: 600, marginBottom: 16 }}>ARQUETIPO</div>
            <div style={{ fontFamily: "'Spectral',serif", fontWeight: 700, fontSize: 'clamp(32px,4vw,48px)', lineHeight: 1.1 }}>
              El Ingeniero & Auditor Estratégico.
            </div>
          </div>
          <div data-reveal="" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div style={{ background: 'var(--brown2)', borderRadius: 4, padding: 28 }}>
              <div style={{ fontSize: 12, letterSpacing: 1.5, color: 'var(--green)', fontWeight: 600, marginBottom: 12 }}>ES</div>
              <div style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--tan-text)' }}>
                Experto que audita, programa y explica; riguroso con los números y transparente con el código.
              </div>
            </div>
            <div style={{ background: 'var(--brown2)', borderRadius: 4, padding: 28 }}>
              <div style={{ fontSize: 12, letterSpacing: 1.5, color: 'var(--rose)', fontWeight: 600, marginBottom: 12 }}>NO ES</div>
              <div style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--tan-text)' }}>
                Vendedor comisionista, teórico desconectado de la implementación ni consultora de diapositivas vacías.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '120px clamp(20px,5vw,40px)' }}>
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

      <Frieze
        bg="var(--cream2)"
        border="#241A12"
        upColor="#A8472B"
        downColor="#C68A3D"
        medallionBg="#241A12"
        medallionBorder="#D8A84E"
        flip
      />

      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '120px clamp(20px,5vw,40px)' }}>
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

      <div style={{ background: 'var(--cream2)', padding: '120px clamp(20px,5vw,40px)' }}>
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
            ¿Conversamos sobre tus requerimientos técnicos?
          </h2>
          <p style={{ fontSize: 16, color: 'var(--tan-text)', marginBottom: 36, maxWidth: 560, margin: '0 auto 36px' }}>
            Auditoría preliminar, arquitectura cloud o modelos analíticos — estamos listos para revisar tu caso.
          </p>
          <a
            href={waLink('Hola, leí sobre el equipo de Inmerge y quiero coordinar una conversación técnica.')}
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
