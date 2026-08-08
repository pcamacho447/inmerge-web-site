import { useNavigate } from 'react-router-dom';
import useDocumentHead from '../hooks/useDocumentHead.js';
import useReports from '../hooks/useReports.js';
import useReportDownload from '../hooks/useReportDownload.js';
import Footer from '../components/Footer.jsx';
import { useAuth } from '../lib/auth.jsx';

export default function Cuenta() {
  useDocumentHead({ title: 'Mi cuenta — Inmerge', path: '/cuenta', noIndex: true });
  const { user, logout } = useAuth();
  const { reports, loading: reportsLoading, error: reportsError } = useReports();
  const navigate = useNavigate();
  const { downloadingId, downloadError, handleDownload } = useReportDownload();

  if (!user) return null; // ProtectedRoute redirects before this ever renders

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '120px clamp(20px,5vw,40px) 60px' }}>
        <div
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 16, marginBottom: 8 }}
        >
          <div style={{ fontFamily: "'Spectral',serif", fontWeight: 700, fontSize: 'clamp(32px,5vw,44px)' }}>Mi cuenta</div>
          <button
            type="button"
            onClick={handleLogout}
            className="btn-outline-hover"
            style={{
              background: 'none',
              border: '1px solid var(--border)',
              color: 'var(--ink)',
              borderRadius: 20,
              padding: '9px 20px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: "'IBM Plex Sans',sans-serif",
            }}
          >
            Cerrar sesión
          </button>
        </div>
        <div style={{ fontSize: 15, color: 'var(--muted)', marginBottom: 48 }}>{user.email}</div>

        <div>
          <div style={{ fontFamily: "'Spectral',serif", fontWeight: 600, fontSize: 22, marginBottom: 16 }}>Reportes disponibles</div>
          {reportsLoading && <div style={{ fontSize: 14, color: 'var(--muted)' }}>Cargando reportes...</div>}
          {reportsError && <div style={{ fontSize: 14, color: 'var(--rose)' }}>No se pudieron cargar los reportes: {reportsError}</div>}
          {!reportsLoading &&
            !reportsError &&
            (reports.length === 0 ? (
              <div style={{ fontSize: 14, color: 'var(--muted)' }}>Todavía no hay reportes publicados.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--border)' }}>
                {reports.map((r) => (
                  <div
                    key={r.id}
                    className="row-hover"
                    style={{
                      background: 'var(--bg)',
                      padding: 20,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 12,
                    }}
                  >
                    <div>
                      <div style={{ fontFamily: "'Spectral',serif", fontWeight: 600, fontSize: 15 }}>{r.title}</div>
                      {/* Visible inline error, not a title="" tooltip — tooltips don't show on tap, so a
                          mobile user tapping the button and getting a 403/404 would otherwise see nothing.
                          The Edge Function's own message ("Not entitled…", "…not available yet") is surfaced. */}
                      {downloadError.id === r.id && downloadError.message && (
                        <div style={{ fontSize: 11, color: 'var(--terracotta)', marginTop: 4 }}>{downloadError.message}</div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDownload(r.id)}
                      disabled={downloadingId === r.id}
                      className="btn-hover"
                      style={{
                        background: 'var(--terracotta)',
                        color: 'var(--bg)',
                        border: 'none',
                        borderRadius: 3,
                        padding: '8px 16px',
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: downloadingId === r.id ? 'wait' : 'pointer',
                        fontFamily: "'IBM Plex Sans',sans-serif",
                        flexShrink: 0,
                        opacity: downloadingId === r.id ? 0.7 : 1,
                      }}
                    >
                      {downloadingId === r.id ? 'Generando…' : 'Descargar'}
                    </button>
                  </div>
                ))}
              </div>
            ))}
        </div>
      </div>
      <Footer borderTop />
    </>
  );
}
