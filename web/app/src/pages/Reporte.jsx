import { Link, useParams } from 'react-router-dom';
import Footer from '../components/Footer.jsx';
import KeyFigure from '../components/KeyFigure.jsx';
import SankeyChart from '../components/SankeyChart.jsx';
import SourceList from '../components/SourceList.jsx';
import useDocumentHead from '../hooks/useDocumentHead.js';
import useReport from '../hooks/useReport.js';
import useReportDownload from '../hooks/useReportDownload.js';
import { useAuth } from '../lib/auth.jsx';

// Qué reportes tienen anexo interactivo. Se mantiene sincronizado con la
// constante ANNEXES de scripts/extract-sankey.mjs — si agregas uno allá,
// agrégalo acá.
const SANKEY_SLUGS = new Set(['en-que-gasta-el-estado-central', 'un-estado-tres-oficios', 'de-donde-viene-la-plata']);

const WRAP = { maxWidth: 760, margin: '0 auto', padding: '140px clamp(20px,5vw,40px) 0' };

export default function Reporte() {
  const { slug } = useParams();
  const { report, loading, notFound, error } = useReport(slug);
  const { user } = useAuth();
  const { downloadingId, downloadError, handleDownload } = useReportDownload();

  useDocumentHead({
    title: report ? `${report.title} — Inmerge` : 'Reporte — Inmerge',
    description: report?.summary || '',
    path: `/reportes/${slug}`,
    image: report ? `/covers/${report.slug}.png` : undefined,
    noIndex: notFound,
  });

  if (loading) {
    return (
      <>
        <div style={{ ...WRAP, paddingBottom: 120, color: 'var(--muted)', fontSize: 14 }}>Cargando…</div>
        <Footer borderTop />
      </>
    );
  }

  if (notFound || error) {
    return (
      <>
        <div style={{ ...WRAP, paddingBottom: 120 }}>
          <div style={{ fontFamily: "'Spectral',serif", fontWeight: 700, fontSize: 'clamp(28px,5vw,40px)', marginBottom: 16 }}>
            {notFound ? 'No encontramos ese reporte.' : 'No se pudo cargar el reporte.'}
          </div>
          <Link to="/reportes" className="link-hover" style={{ fontSize: 15, fontWeight: 600, color: 'var(--terracotta)' }}>
            Ver todos los reportes
          </Link>
        </div>
        <Footer borderTop />
      </>
    );
  }

  const busy = downloadingId === report.id;

  return (
    <>
      <div style={{ ...WRAP, paddingBottom: 80 }}>
        <Link to="/reportes" className="link-hover" style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1.2, color: 'var(--muted)' }}>
          ← REPORTES
        </Link>

        <h1
          style={{
            fontFamily: "'Spectral',serif",
            fontWeight: 700,
            fontSize: 'clamp(36px,6vw,60px)',
            lineHeight: 1.15,
            margin: '24px 0 20px',
          }}
        >
          {report.title}
        </h1>

        {report.summary && (
          <p style={{ fontSize: 'clamp(16px,2.2vw,19px)', lineHeight: 1.65, color: 'var(--muted)', marginBottom: 48, maxWidth: '58ch' }}>
            {report.summary}
          </p>
        )}

        <KeyFigure figure={report.key_figure} label={report.key_figure_label} />

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 32 }}>
          {user ? (
            <>
              <button
                type="button"
                onClick={() => handleDownload(report.id)}
                disabled={busy}
                className="btn-hover"
                style={{
                  background: 'var(--terracotta)',
                  color: 'var(--bg)',
                  border: 'none',
                  borderRadius: 3,
                  padding: '16px 28px',
                  fontSize: 15,
                  fontWeight: 600,
                  fontFamily: "'IBM Plex Sans',sans-serif",
                  cursor: busy ? 'default' : 'pointer',
                  opacity: busy ? 0.7 : 1,
                }}
              >
                {busy ? 'Preparando…' : 'Descargar el informe (PDF)'}
              </button>
              {downloadError.id === report.id && downloadError.message && (
                <div style={{ fontSize: 13, color: 'var(--rose)', marginTop: 12 }}>{downloadError.message}</div>
              )}
            </>
          ) : (
            <>
              <Link
                to="/registro"
                state={{ redirectTo: `/reportes/${report.slug}` }}
                className="btn-hover"
                style={{
                  display: 'inline-block',
                  background: 'var(--terracotta)',
                  color: 'var(--bg)',
                  borderRadius: 3,
                  padding: '16px 28px',
                  fontSize: 15,
                  fontWeight: 600,
                }}
              >
                Crear cuenta para descargar
              </Link>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 12 }}>
                Es gratis. La cuenta se crea al instante y te da acceso a todos los reportes.
              </div>
            </>
          )}
        </div>

        <SourceList sources={report.sources} />
      </div>

      {SANKEY_SLUGS.has(report.slug) && (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '72px clamp(20px,5vw,40px) 0' }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1.4, color: 'var(--muted)', marginBottom: 8 }}>ANEXO INTERACTIVO</div>
          <div style={{ fontFamily: "'Spectral',serif", fontWeight: 600, fontSize: 'clamp(22px,3.5vw,30px)', marginBottom: 20 }}>
            El flujo, de punta a punta
          </div>
          <SankeyChart slug={report.slug} title={`Diagrama de flujo: ${report.title}`} />
          <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 12, marginBottom: 96 }}>
            Este diagrama es público, sin cuenta. El análisis completo está en el PDF.
          </div>
        </div>
      )}

      <Footer borderTop />
    </>
  );
}
