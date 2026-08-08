import { Link } from 'react-router-dom';
import useReveal from '../hooks/useReveal.js';
import useDocumentHead from '../hooks/useDocumentHead.js';
import useReports from '../hooks/useReports.js';
import useReportDownload from '../hooks/useReportDownload.js';
import Frieze from '../components/Frieze.jsx';
import Footer from '../components/Footer.jsx';
import ImagePlaceholder from '../components/ImagePlaceholder.jsx';
import { useAuth } from '../lib/auth.jsx';
import { waLink } from '../data/content.js';

export default function Reportes() {
  useReveal();
  useDocumentHead({
    title: 'Reportes — Inmerge',
    description: 'Análisis narrativos de datos públicos peruanos — crea una cuenta gratis para descargarlos.',
    path: '/reportes',
  });
  const { user } = useAuth();
  const { reports, loading: reportsLoading, error: reportsError } = useReports();
  const { downloadingId, downloadError, handleDownload } = useReportDownload();

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
        {/* minmax a 240px (no 260) es deliberado: con el catálogo real de 7 reportes
            publicados, 240 mantiene 4 columnas a ancho completo (4 llenas + 1 fila
            de 3, un solo hueco). Subir el minmax para forzar 3 columnas — la
            corrección obvia cuando el catálogo tenía 5 reportes — deja acá un
            reporte solo con DOS huecos al lado en vez de uno: peor, no mejor. */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 32 }}>
          {reports.map((r) => (
            <div key={r.id} data-reveal="" className="card-hover" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ width: '100%', aspectRatio: '4/3' }}>
                {/* No cover_image_path yet for any report — real photography is a
                    known open item (see CLAUDE.md). Swap for a real <img> once
                    it exists and a public covers bucket is set up. */}
                <ImagePlaceholder label={`Portada — ${r.title}`} />
              </div>
              <div style={{ padding: '20px 0 0' }}>
                <div style={{ fontSize: 11, letterSpacing: 1.5, color: 'var(--terracotta)', fontWeight: 600, marginBottom: 10 }}>
                  {r.tag}
                </div>
                <div style={{ fontFamily: "'Spectral',serif", fontWeight: 600, fontSize: 22, lineHeight: 1.3, marginBottom: 12 }}>
                  {r.title}
                </div>
                <div style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 20 }}>{r.summary}</div>
                {user ? (
                  <button
                    type="button"
                    onClick={() => handleDownload(r.id)}
                    disabled={downloadingId === r.id}
                    className="link-hover"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 13,
                      fontWeight: 600,
                      fontFamily: "'IBM Plex Sans',sans-serif",
                      cursor: downloadingId === r.id ? 'wait' : 'pointer',
                      background: 'none',
                      border: 'none',
                      color: 'inherit',
                      padding: 0,
                    }}
                  >
                    <div style={{ width: 7, height: 7, background: 'var(--terracotta)', transform: 'rotate(45deg)' }} />
                    {downloadingId === r.id ? 'Generando…' : 'Descargar reporte'}
                  </button>
                ) : (
                  <Link
                    to="/registro"
                    state={{ redirectTo: '/reportes' }}
                    className="link-hover"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600 }}
                  >
                    <div style={{ width: 7, height: 7, background: 'var(--terracotta)', transform: 'rotate(45deg)' }} />
                    Crear cuenta para descargar
                  </Link>
                )}
                {/* Mensaje inline, no un title="" que un móvil nunca ve en un tap —
                    la falla del mismo defecto que ya se corrigió una vez en /cuenta. */}
                {downloadError.id === r.id && downloadError.message && (
                  <div style={{ fontSize: 11, color: 'var(--terracotta)', marginTop: 8 }}>{downloadError.message}</div>
                )}
              </div>
            </div>
          ))}
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
