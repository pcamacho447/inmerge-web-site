import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import useReveal from '../hooks/useReveal.js';
import useOverlay from '../hooks/useOverlay.js';
import useDocumentHead from '../hooks/useDocumentHead.js';
import useReports from '../hooks/useReports.js';
import Frieze from '../components/Frieze.jsx';
import Footer from '../components/Footer.jsx';
import ImagePlaceholder from '../components/ImagePlaceholder.jsx';
import CheckoutModal from '../components/CheckoutModal.jsx';
import { useAuth, hasAccess } from '../lib/auth.jsx';
import { formatPEN } from '../lib/formatPEN.js';
import { waLink } from '../data/content.js';

export default function Reportes() {
  useReveal();
  useDocumentHead({
    title: 'Reportes — Inmerge',
    description: 'Análisis narrativos de datos públicos peruanos — reportes públicos gratuitos, y series premium más granulares.',
    path: '/reportes',
  });
  const { user } = useAuth();
  const { reports, loading: reportsLoading, error: reportsError } = useReports();
  const freeReports = reports.filter((r) => r.tier === 'free');
  const premiumReports = reports.filter((r) => r.tier === 'premium');
  const [activeReport, setActiveReport] = useState(null);
  const [gateContact, setGateContact] = useState('');
  const [gateSubmitted, setGateSubmitted] = useState(false);
  const [checkoutReport, setCheckoutReport] = useState(null);

  const gateOpen = activeReport !== null;

  function openGate(report) {
    setActiveReport(report);
    setGateContact('');
    setGateSubmitted(false);
  }
  const closeGate = useCallback(() => setActiveReport(null), []);
  const modalRef = useOverlay(gateOpen, closeGate);

  function submitGate() {
    if (!gateContact.trim() || !activeReport) return;
    const subject = `Solicitud de reporte: ${activeReport.title}`;
    const body = `Hola,\n\nQuisiera recibir el reporte "${activeReport.title}".\n\nMi contacto: ${gateContact}`;
    window.location.href = `mailto:contacto@inmerge.pe?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setGateSubmitted(true);
  }

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
          Análisis narrativos de datos públicos peruanos, sin cliente de por medio — así trabajamos, a la vista de cualquiera. Además,
          series premium con más profundidad — de a{' '}
          <Link to="/planes" style={{ fontWeight: 600 }}>
            un reporte suelto o por suscripción
          </Link>
          .
        </p>
      </div>

      <Frieze border="#A8472B" upColor="#D8A84E" downColor="#C68A3D" medallionBg="#A8472B" medallionBorder="#F3EADA" />

      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '80px clamp(20px,5vw,40px) 0' }}>
        {reportsLoading && <div style={{ fontSize: 14, color: 'var(--muted)' }}>Cargando reportes...</div>}
        {reportsError && <div style={{ fontSize: 14, color: 'var(--rose)' }}>No se pudieron cargar los reportes: {reportsError}</div>}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 32 }}>
          {freeReports.map((r) => (
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
                <button
                  type="button"
                  onClick={() => openGate(r)}
                  className="link-hover"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    fontFamily: "'IBM Plex Sans',sans-serif",
                    cursor: 'pointer',
                    background: 'none',
                    border: 'none',
                    color: 'inherit',
                    padding: 0,
                  }}
                >
                  <div style={{ width: 7, height: 7, background: 'var(--terracotta)', transform: 'rotate(45deg)' }} />
                  Descargar reporte
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '100px clamp(20px,5vw,40px) 140px' }}>
        <div
          data-reveal=""
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}
        >
          <div style={{ fontFamily: "'Spectral',serif", fontWeight: 600, fontSize: 'clamp(28px,3.6vw,40px)' }}>Reportes premium</div>
          <Link to="/planes" style={{ fontSize: 14, fontWeight: 600 }}>
            Ver planes →
          </Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 32 }}>
          {premiumReports.map((r) => {
            const entitled = hasAccess(user, r);
            return (
              <div key={r.id} data-reveal="" className="card-hover" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ width: '100%', aspectRatio: '4/3', position: 'relative' }}>
                  <ImagePlaceholder label={`Portada — ${r.title}`} />
                  <div
                    style={{
                      position: 'absolute',
                      top: 12,
                      left: 12,
                      background: 'var(--ink)',
                      color: 'var(--gold)',
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: 1,
                      padding: '6px 12px',
                      borderRadius: 20,
                    }}
                  >
                    PREMIUM
                  </div>
                </div>
                <div style={{ padding: '20px 0 0' }}>
                  <div style={{ fontSize: 11, letterSpacing: 1.5, color: 'var(--terracotta)', fontWeight: 600, marginBottom: 10 }}>
                    {r.tag}
                  </div>
                  <div style={{ fontFamily: "'Spectral',serif", fontWeight: 600, fontSize: 22, lineHeight: 1.3, marginBottom: 12 }}>
                    {r.title}
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 20 }}>{r.summary}</div>
                  {entitled ? (
                    <Link
                      to="/cuenta"
                      className="link-hover"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: 'var(--green)' }}
                    >
                      <div style={{ width: 7, height: 7, background: 'var(--green)', transform: 'rotate(45deg)' }} />
                      Incluido — descargar en mi cuenta
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setCheckoutReport(r)}
                      className="link-hover"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        fontSize: 13,
                        fontWeight: 600,
                        fontFamily: "'IBM Plex Sans',sans-serif",
                        cursor: 'pointer',
                        background: 'none',
                        border: 'none',
                        color: 'inherit',
                        padding: 0,
                      }}
                    >
                      <div style={{ width: 7, height: 7, background: 'var(--terracotta)', transform: 'rotate(45deg)' }} />
                      Comprar por depósito — S/ {formatPEN(r.price_pen)}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {gateOpen && (
        <div
          onClick={closeGate}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            background: 'rgba(36,26,18,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <div
            ref={modalRef}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={activeReport ? activeReport.title : 'Descarga de reporte'}
            tabIndex={-1}
            style={{ background: 'var(--bg)', borderRadius: 4, maxWidth: 440, width: '100%', padding: 40, position: 'relative' }}
          >
            <button
              type="button"
              onClick={closeGate}
              aria-label="Cerrar"
              className="icon-btn-hover"
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                background: 'none',
                border: 'none',
                padding: 0,
              }}
            >
              {/* Fixed-size icon glyph, flex-centered by the button above — the
                  clickable box grew to a proper ~40px touch target, but the X
                  itself stays the original size and stays centered regardless. */}
              <span style={{ position: 'relative', width: 14, height: 14 }}>
                <div style={{ width: 16, height: 2, background: 'var(--ink)', transform: 'rotate(45deg)', position: 'absolute', top: 6 }} />
                <div
                  style={{ width: 16, height: 2, background: 'var(--ink)', transform: 'rotate(-45deg)', position: 'absolute', top: 6 }}
                />
              </span>
            </button>
            {gateSubmitted ? (
              <>
                <div style={{ width: 14, height: 14, background: 'var(--green)', transform: 'rotate(45deg)', marginBottom: 20 }} />
                <div style={{ fontFamily: "'Spectral',serif", fontWeight: 600, fontSize: 22, marginBottom: 12 }}>Casi listo.</div>
                <div style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6 }}>
                  Se abrió tu cliente de correo con el mensaje para &ldquo;{activeReport?.title}&rdquo; listo — solo confirma el envío. Si
                  no se abrió, escríbenos por WhatsApp.
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 11, letterSpacing: 1.5, color: 'var(--terracotta)', fontWeight: 600, marginBottom: 10 }}>
                  DESCARGA GRATUITA
                </div>
                <div style={{ fontFamily: "'Spectral',serif", fontWeight: 600, fontSize: 22, marginBottom: 18, lineHeight: 1.3 }}>
                  {activeReport?.title}
                </div>
                <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>
                  Déjanos tu correo o WhatsApp y te abrimos un mensaje ya listo para pedirlo.
                </div>
                <input
                  value={gateContact}
                  onChange={(e) => setGateContact(e.target.value)}
                  placeholder="tucorreo@empresa.com o +51 999 999 999"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    border: '1px solid var(--border)',
                    background: '#FFFFFF',
                    borderRadius: 3,
                    padding: '14px 16px',
                    fontSize: 14,
                    fontFamily: "'IBM Plex Sans',sans-serif",
                    marginBottom: 16,
                  }}
                />
                <button
                  type="button"
                  onClick={submitGate}
                  className="btn-hover"
                  style={{
                    background: 'var(--terracotta)',
                    color: 'var(--bg)',
                    textAlign: 'center',
                    borderRadius: 3,
                    padding: 14,
                    fontSize: 14,
                    fontWeight: 600,
                    fontFamily: "'IBM Plex Sans',sans-serif",
                    cursor: 'pointer',
                    width: '100%',
                    border: 'none',
                  }}
                >
                  Recibir reporte
                </button>
              </>
            )}
          </div>
        </div>
      )}

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

      {checkoutReport && <CheckoutModal kind="report" item={checkoutReport} onClose={() => setCheckoutReport(null)} />}
    </>
  );
}
