import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useDocumentHead from '../hooks/useDocumentHead.js';
import useReports from '../hooks/useReports.js';
import Footer from '../components/Footer.jsx';
import { useAuth, isSubscriptionActive } from '../lib/auth.jsx';
import { getReportDownloadUrl } from '../lib/downloadReport.js';
import { formatPEN } from '../lib/formatPEN.js';
import { waLink, waVoucherMessage } from '../data/content.js';
import usePlans from '../hooks/usePlans.js';
import CheckoutModal from '../components/CheckoutModal.jsx';
import { DEMO_MODE } from '../lib/demoMode.js';

// La Edge Function responde en inglés y con vocabulario de sistema. Quien lee
// esto ya pagó, así que se traduce a algo accionable. El resto de mensajes se
// deja pasar tal cual: son casos raros y el texto original ayuda a depurar.
function mensajeDeDescarga(mensajeCrudo) {
  if (mensajeCrudo.includes('not available yet')) {
    return 'Este reporte todavía no tiene el archivo cargado. Escríbenos por WhatsApp y te lo enviamos.';
  }
  if (mensajeCrudo.includes('Not entitled')) {
    return 'Tu acceso a este reporte no está activo. Si ya depositaste, mándanos la constancia.';
  }
  return mensajeCrudo;
}

export default function Cuenta() {
  useDocumentHead({ title: 'Mi cuenta — Inmerge', path: '/cuenta', noIndex: true });
  const { user, logout, cancelSubscription } = useAuth();
  const { reports } = useReports();
  const { plans } = usePlans();
  const navigate = useNavigate();
  const [downloadingId, setDownloadingId] = useState(null);
  const [downloadError, setDownloadError] = useState({ id: null, message: '' });
  const [renovando, setRenovando] = useState(null);

  if (!user) return null; // ProtectedRoute redirects before this ever renders

  async function handleDownload(reportId) {
    setDownloadError({ id: null, message: '' });
    setDownloadingId(reportId);
    try {
      const url = await getReportDownloadUrl(reportId);
      // Signed URL is short-lived (5 min) — open it now to start the download.
      window.open(url, '_blank', 'noopener');
    } catch (err) {
      setDownloadError({ id: reportId, message: mensajeDeDescarga(err.message) });
    } finally {
      setDownloadingId(null);
    }
  }

  const plan = plans.find((p) => p.id === user.subscription?.plan);
  const subActiva = isSubscriptionActive(user.subscription);
  const vence = user.subscription?.currentPeriodEnd ? new Date(user.subscription.currentPeriodEnd) : null;
  const venceTexto = vence ? vence.toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' }) : null;
  const purchasedReports = reports.filter((r) => user.purchases.includes(r.id));

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '120px clamp(20px,5vw,40px) 60px' }}>
        <div
          style={{
            background: 'var(--cream2)',
            borderRadius: 3,
            padding: '8px 12px',
            fontSize: 11,
            letterSpacing: 0.5,
            color: 'var(--muted)',
            marginBottom: 24,
          }}
        >
          {DEMO_MODE
            ? 'Modo demo — tu suscripción y compras acá son simuladas, no se cobró nada.'
            : 'Los pedidos se activan a mano tras verificar el depósito.'}
        </div>
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

        <div style={{ marginBottom: 48 }}>
          <div style={{ fontFamily: "'Spectral',serif", fontWeight: 600, fontSize: 22, marginBottom: 16 }}>Suscripción</div>
          {subActiva ? (
            <div
              style={{
                border: '1px solid var(--border)',
                borderRadius: 4,
                padding: 24,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 16,
              }}
            >
              <div>
                <div style={{ fontFamily: "'Spectral',serif", fontWeight: 600, fontSize: 18, marginBottom: 4 }}>
                  {plan?.name ?? user.subscription.plan}
                </div>
                <div style={{ fontSize: 13, color: 'var(--green)', fontWeight: 600 }}>Activa</div>
                {venceTexto && <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>Vence el {venceTexto}</div>}
              </div>
              {/* Con periodos prepagados no hay nada que cancelar: el acceso
                  vence solo. Cancelar solo existe en el modo demo. */}
              {DEMO_MODE ? (
                <button
                  type="button"
                  onClick={cancelSubscription}
                  className="btn-outline-hover"
                  style={{
                    background: 'none',
                    border: '1px solid var(--border)',
                    color: 'var(--muted)',
                    borderRadius: 3,
                    padding: '10px 20px',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: "'IBM Plex Sans',sans-serif",
                  }}
                >
                  Cancelar suscripción
                </button>
              ) : (
                plan && (
                  <button
                    type="button"
                    onClick={() => setRenovando(plan)}
                    className="btn-outline-hover"
                    style={{
                      background: 'none',
                      border: '1px solid var(--border)',
                      color: 'var(--ink)',
                      borderRadius: 3,
                      padding: '10px 20px',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: "'IBM Plex Sans',sans-serif",
                    }}
                  >
                    Renovar por depósito
                  </button>
                )
              )}
            </div>
          ) : (
            <div
              style={{
                border: '1px solid var(--border)',
                borderRadius: 4,
                padding: 24,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 16,
              }}
            >
              <div style={{ fontSize: 14, color: 'var(--muted)' }}>
                {venceTexto ? `Tu suscripción venció el ${venceTexto}.` : 'No tienes una suscripción activa.'}
              </div>
              {venceTexto && plan && (
                <button
                  type="button"
                  onClick={() => setRenovando(plan)}
                  className="btn-hover"
                  style={{
                    background: 'var(--terracotta)',
                    color: 'var(--bg)',
                    border: 'none',
                    borderRadius: 3,
                    padding: '10px 20px',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: "'IBM Plex Sans',sans-serif",
                  }}
                >
                  Renovar por depósito
                </button>
              )}
            </div>
          )}
        </div>

        {user.ordersError && (
          <div
            style={{
              marginBottom: 48,
              border: '1px solid var(--terracotta)',
              borderRadius: 4,
              padding: 20,
              fontSize: 14,
              color: 'var(--muted)',
              lineHeight: 1.6,
            }}
          >
            No pudimos cargar tus pedidos. Recarga la página; si ya depositaste y sigue sin aparecer, escríbenos por WhatsApp.
          </div>
        )}

        {user.orders?.length > 0 && (
          <div style={{ marginBottom: 48 }}>
            <div style={{ fontFamily: "'Spectral',serif", fontWeight: 600, fontSize: 22, marginBottom: 16 }}>Pedidos</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--border)' }}>
              {user.orders.map((o) => {
                const item =
                  o.kind === 'subscription' ? plans.find((p) => p.id === o.plan)?.name : reports.find((r) => r.id === o.report_id)?.title;
                const rechazado = o.status === 'rejected';
                const vencido = o.status === 'expired';
                return (
                  <div
                    key={o.id}
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
                      <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 13, fontWeight: 500 }}>{o.code}</div>
                      <div style={{ fontFamily: "'Spectral',serif", fontWeight: 600, fontSize: 15, marginTop: 2 }}>{item ?? '—'}</div>
                      <div style={{ fontSize: 12, color: rechazado || vencido ? 'var(--terracotta)' : 'var(--muted)', marginTop: 4 }}>
                        {rechazado
                          ? `Rechazado: ${o.notes || 'sin motivo registrado'}`
                          : vencido
                            ? 'Vencido — genera un pedido nuevo para pagar.'
                            : `S/ ${formatPEN(o.amount_pen)} · esperando verificación de tu depósito`}
                      </div>
                    </div>
                    {!rechazado && !vencido && (
                      <a
                        href={waLink(waVoucherMessage(o))}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-outline-hover"
                        style={{
                          border: '1px solid var(--border)',
                          color: 'var(--ink)',
                          borderRadius: 3,
                          padding: '8px 16px',
                          fontSize: 13,
                          fontWeight: 600,
                          flexShrink: 0,
                        }}
                      >
                        Enviar constancia
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div>
          <div style={{ fontFamily: "'Spectral',serif", fontWeight: 600, fontSize: 22, marginBottom: 16 }}>Reportes comprados</div>
          {purchasedReports.length === 0 ? (
            <div style={{ fontSize: 14, color: 'var(--muted)' }}>Aún no has comprado ningún reporte individual.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--border)' }}>
              {purchasedReports.map((r) => (
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
          )}
        </div>
      </div>
      <Footer borderTop />
      {renovando && <CheckoutModal kind="subscription" item={renovando} onClose={() => setRenovando(null)} />}
    </>
  );
}
