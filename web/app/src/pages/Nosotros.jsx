import useReveal from '../hooks/useReveal.js';
import useDocumentHead from '../hooks/useDocumentHead.js';
import Frieze from '../components/Frieze.jsx';
import Footer from '../components/Footer.jsx';
import { waLink, VALUES, ROLES } from '../data/content.js';

export default function Nosotros() {
  useReveal();
  useDocumentHead({
    title: 'Nosotros — Inmerge',
    description: 'Hacemos verificable la información que mueve al Perú — un equipo compacto que diseña y ejecuta sin intermediarios.',
    path: '/nosotros',
  });

  return (
    <>
      <div style={{ padding: '100px clamp(20px,5vw,40px) 80px', maxWidth: 1240, margin: '0 auto' }}>
        <div style={{ fontSize: 13, letterSpacing: 4, color: 'var(--terracotta)', fontWeight: 600, marginBottom: 24 }}>NOSOTROS</div>
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
          Evidencia con raíz.
        </div>
        <p style={{ fontSize: 17, color: 'var(--muted)', maxWidth: 600, lineHeight: 1.7, marginTop: 28 }}>
          Hacemos verificable la información que mueve al Perú — pública, privada y de investigación — para que gastar, invertir y publicar
          dejen de ser actos de fe.
        </p>
      </div>

      <Frieze border="#A8472B" upColor="#D8A84E" downColor="#C68A3D" medallionBg="#A8472B" medallionBorder="#F3EADA" />

      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '120px clamp(20px,5vw,40px)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 1, background: 'var(--border)' }}>
          <div data-reveal="" className="card-hover" style={{ background: 'var(--bg)', padding: 40 }}>
            <div style={{ fontSize: 11, letterSpacing: 1.5, color: 'var(--terracotta)', fontWeight: 600, marginBottom: 12 }}>PROPÓSITO</div>
            <p style={{ fontFamily: "'Spectral',serif", fontWeight: 600, fontSize: 19, lineHeight: 1.6, margin: 0 }}>
              Hacer verificable la información que mueve al Perú.
            </p>
          </div>
          <div data-reveal="" className="card-hover" style={{ background: 'var(--bg)', padding: 40 }}>
            <div style={{ fontSize: 11, letterSpacing: 1.5, color: 'var(--terracotta)', fontWeight: 600, marginBottom: 12 }}>MISIÓN</div>
            <p style={{ fontFamily: "'Spectral',serif", fontWeight: 600, fontSize: 19, lineHeight: 1.6, margin: 0 }}>
              Convertir datos dispersos en sistemas que citan su origen y resisten una auditoría.
            </p>
          </div>
          <div data-reveal="" className="card-hover" style={{ background: 'var(--bg)', padding: 40 }}>
            <div style={{ fontSize: 11, letterSpacing: 1.5, color: 'var(--terracotta)', fontWeight: 600, marginBottom: 12 }}>VISIÓN</div>
            <p style={{ fontFamily: "'Spectral',serif", fontWeight: 600, fontSize: 19, lineHeight: 1.6, margin: 0 }}>
              Que ningún funcionario, gerente o periodista tenga que &ldquo;confiar&rdquo; en un dato — que pueda rastrearlo.
            </p>
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--ink)', color: 'var(--bg)', padding: '140px clamp(20px,5vw,40px)' }}>
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
              El Sabio Cercano.
            </div>
          </div>
          <div data-reveal="" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div style={{ background: 'var(--brown2)', borderRadius: 4, padding: 28 }}>
              <div style={{ fontSize: 12, letterSpacing: 1.5, color: 'var(--green)', fontWeight: 600, marginBottom: 12 }}>ES</div>
              <div style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--tan-text)' }}>
                Experto que explica, directo, verificable, cálido sin ser informal.
              </div>
            </div>
            <div style={{ background: 'var(--brown2)', borderRadius: 4, padding: 28 }}>
              <div style={{ fontSize: 12, letterSpacing: 1.5, color: 'var(--rose)', fontWeight: 600, marginBottom: 12 }}>NO ES</div>
              <div style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--tan-text)' }}>
                Vendedor efusivo, genio inaccesible, ni burócrata acartonado.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '140px clamp(20px,5vw,40px)' }}>
        <div data-reveal="" style={{ fontFamily: "'Spectral',serif", fontWeight: 600, fontSize: 'clamp(32px,4vw,52px)', marginBottom: 64 }}>
          Lo que nos sostiene.
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
              <div style={{ fontFamily: "'Spectral',serif", fontWeight: 600, fontSize: 22, flex: '0 0 200px' }}>{v.name}</div>
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

      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '140px clamp(20px,5vw,40px)' }}>
        <div data-reveal="" style={{ fontFamily: "'Spectral',serif", fontWeight: 600, fontSize: 'clamp(32px,4vw,52px)', marginBottom: 16 }}>
          Por qué no somos ni una boutique ni una Big Four.
        </div>
        <div data-reveal="" style={{ fontSize: 15, color: 'var(--muted)', marginBottom: 56, maxWidth: 680 }}>
          El mercado peruano de datos se divide en dos extremos. Ninguno combina especialización pública con transparencia metodológica como
          promesa de marca.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 0 }}>
          <div data-reveal="" className="row-hover" style={{ padding: 32, borderRight: '1px solid var(--border)' }}>
            <div style={{ fontSize: 12, letterSpacing: 1.5, color: 'var(--muted)', fontWeight: 600, marginBottom: 12 }}>
              BOUTIQUES BI LOCALES
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--muted)' }}>
              Fuertes en Power BI y ETL, casi sin especialización en sector público.
            </div>
          </div>
          <div data-reveal="" className="row-hover" style={{ padding: 32, borderRight: '1px solid var(--border)' }}>
            <div style={{ fontSize: 12, letterSpacing: 1.5, color: 'var(--muted)', fontWeight: 600, marginBottom: 12 }}>
              FIRMAS GLOBALES
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--muted)' }}>
              Escala y credibilidad, pero precio y proceso excluyen a gobiernos regionales.
            </div>
          </div>
          <div data-reveal="" className="card-hover" style={{ padding: 32, background: 'var(--ink)', color: 'var(--bg)' }}>
            <div style={{ fontSize: 12, letterSpacing: 1.5, color: 'var(--gold)', fontWeight: 600, marginBottom: 12 }}>INMERGE</div>
            <div style={{ fontSize: 14, lineHeight: 1.7 }}>
              Narrativa cultural propia, transparencia metodológica explícita, accesible para un ministerio o un gobierno regional por
              igual.
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--cream2)', padding: '140px clamp(20px,5vw,40px)' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>
          <div
            data-reveal=""
            style={{ fontFamily: "'Spectral',serif", fontWeight: 600, fontSize: 'clamp(32px,4vw,52px)', marginBottom: 16 }}
          >
            Un equipo compacto.
          </div>
          <div data-reveal="" style={{ fontSize: 15, color: 'var(--muted)', marginBottom: 56, maxWidth: 680 }}>
            El mismo equipo que diseña, ejecuta — sin capas comerciales entre el cliente y quien hace el trabajo.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 20 }}>
            {ROLES.map((r) => (
              <div key={r.name} data-reveal="" className="card-hover" style={{ background: 'var(--bg)', borderRadius: 4, padding: 24 }}>
                <div style={{ width: 8, height: 8, background: 'var(--terracotta)', transform: 'rotate(45deg)', marginBottom: 16 }} />
                <div style={{ fontFamily: "'Spectral',serif", fontWeight: 600, fontSize: 15, marginBottom: 8 }}>{r.name}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>{r.desc}</div>
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
            ¿Conversamos sobre tus datos?
          </div>
          <div style={{ fontSize: 15, color: 'var(--tan-text)', marginBottom: 40 }}>
            El mismo consultor que diseña, ejecuta — sin intermediarios.
          </div>
          <a
            href={waLink('Hola, leí sobre Inmerge y quiero conversar sobre mis datos.')}
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

      <Footer />
    </>
  );
}
