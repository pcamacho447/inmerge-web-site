import { Link } from 'react-router-dom';
import useReveal from '../hooks/useReveal.js';
import useDocumentHead from '../hooks/useDocumentHead.js';
import useReports from '../hooks/useReports.js';
import Frieze from '../components/Frieze.jsx';
import Footer from '../components/Footer.jsx';
import { waLink } from '../data/content.js';

export default function Reportes() {
  useReveal();
  useDocumentHead({
    title: 'Reportes — Inmerge',
    description: 'Análisis narrativos de datos públicos peruanos — crea una cuenta gratis para descargarlos.',
    path: '/reportes',
  });
  const { reports, loading: reportsLoading, error: reportsError } = useReports();

  return (
    <>
      <div style={{ padding: '100px clamp(20px,5vw,40px) 60px', maxWidth: 1240, margin: '0 auto' }}>
        <div style={{ fontSize: 13, letterSpacing: 4, color: 'var(--terracotta)', fontWeight: 600, marginBottom: 24 }}>REPORTES</div>
        <div
          style={{
            fontFamily: "'Spectral',serif",
            fontWeight: 700,
            fontSize: 'clamp(40px,7vw,84px)',
            lineHeight: 1,
            letterSpacing: -1,
            maxWidth: 900,
          }}
        >
          El método, antes de la primera factura.
        </div>
        <p style={{ fontSize: 17, color: 'var(--muted)', maxWidth: 600, lineHeight: 1.7, marginTop: 28 }}>
          Análisis narrativos de datos públicos peruanos, sin cliente de por medio — así trabajamos, a la vista de cualquiera. Crea una
          cuenta gratis para descargarlos.
        </p>
      </div>

      <Frieze border="#A8472B" upColor="#D8A84E" downColor="#C68A3D" medallionBg="#A8472B" medallionBorder="#F3EADA" />

      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '80px clamp(20px,5vw,40px) 140px' }}>
        {reportsLoading && <div style={{ fontSize: 14, color: 'var(--muted)' }}>Cargando reportes...</div>}
        {reportsError && <div style={{ fontSize: 14, color: 'var(--rose)' }}>No se pudieron cargar los reportes: {reportsError}</div>}
        {!reportsLoading && !reportsError && reports.length === 0 && (
          <div style={{ border: '1px solid var(--border)', borderRadius: 3, padding: 'clamp(32px,6vw,56px)', textAlign: 'center' }}>
            <div style={{ fontFamily: "'Spectral',serif", fontWeight: 600, fontSize: 'clamp(20px,3vw,26px)', marginBottom: 12 }}>
              Estamos preparando la biblioteca.
            </div>
            <div style={{ fontSize: 15, color: 'var(--muted)', lineHeight: 1.6, maxWidth: '48ch', margin: '0 auto 24px' }}>
              Los primeros informes sobre gasto público peruano se publican en las próximas semanas. Mientras tanto, podemos conversar sobre
              tus datos.
            </div>
            <Link
              to="/contacto"
              className="btn-hover"
              style={{
                display: 'inline-block',
                background: 'var(--terracotta)',
                color: 'var(--bg)',
                borderRadius: 3,
                padding: '14px 24px',
                fontSize: 15,
                fontWeight: 600,
              }}
            >
              Conversemos
            </Link>
          </div>
        )}
        {!reportsLoading && !reportsError && reports.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 380px))',
              justifyContent: 'start',
              gap: 32,
            }}
          >
            {reports.map((r) => (
              <Link
                key={r.id}
                to={`/reportes/${r.slug}`}
                data-reveal=""
                className="card-hover"
                style={{ display: 'flex', flexDirection: 'column', color: 'inherit', textDecoration: 'none' }}
              >
                <img
                  src={`/covers/${r.slug}.png`}
                  alt=""
                  loading="lazy"
                  width={1200}
                  height={630}
                  style={{ width: '100%', height: 'auto', display: 'block', borderBottom: '1px solid var(--border)' }}
                />
                <div style={{ padding: '20px 0 0' }}>
                  <div style={{ fontSize: 11, letterSpacing: 1.5, color: 'var(--terracotta)', fontWeight: 600, marginBottom: 10 }}>
                    {r.tag}
                  </div>
                  <div style={{ fontFamily: "'Spectral',serif", fontWeight: 600, fontSize: 22, lineHeight: 1.3, marginBottom: 12 }}>
                    {r.title}
                  </div>
                  {r.key_figure && (
                    <div
                      style={{
                        fontFamily: "'Spectral',serif",
                        fontWeight: 700,
                        fontSize: 32,
                        color: 'var(--terracotta)',
                        lineHeight: 1,
                        marginBottom: 8,
                      }}
                    >
                      {r.key_figure}
                    </div>
                  )}
                  <div style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6 }}>{r.summary}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
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
          <div
            style={{
              fontFamily: "'Spectral',serif",
              fontWeight: 700,
              fontSize: 'clamp(28px,4.5vw,48px)',
              marginBottom: 24,
              lineHeight: 1.2,
            }}
          >
            ¿Un dato específico que necesitas verificar?
          </div>
          <div style={{ fontSize: 15, color: 'var(--tan-text)', marginBottom: 36 }}>
            Escríbenos y vemos si ya lo tenemos analizado, o lo agregamos a la lista.
          </div>
          <a
            href={waLink('Hola, tengo un dato específico que quiero verificar con Inmerge.')}
            target="_blank"
            rel="noreferrer"
            className="btn-hover"
            style={{
              background: 'var(--gold)',
              color: 'var(--ink)',
              borderRadius: 2,
              padding: '18px 38px',
              fontSize: 16,
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
