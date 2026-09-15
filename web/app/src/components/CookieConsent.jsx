import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getCookieConsent,
  setCookieConsent,
  acceptAllCookies,
  rejectOptionalCookies,
  EVENT_COOKIE_CONSENT_CHANGED,
  EVENT_OPEN_COOKIE_PREFERENCES,
} from '../lib/cookies.js';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [analyticsChecked, setAnalyticsChecked] = useState(false);
  const [preferencesChecked, setPreferencesChecked] = useState(false);

  useEffect(() => {
    // Verificar si ya existe consentimiento registrado
    const existingConsent = getCookieConsent();
    if (!existingConsent) {
      // Pequeño retardo para no interferir con la primera pintura y el preloader
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 700);
      return () => clearTimeout(timer);
    } else {
      setAnalyticsChecked(existingConsent.analytics);
      setPreferencesChecked(existingConsent.preferences);
    }

    // Escuchar solicitudes externas para reabrir el panel de preferencias
    const handleOpenPrefs = () => {
      const current = getCookieConsent() || { analytics: false, preferences: false };
      setAnalyticsChecked(current.analytics);
      setPreferencesChecked(current.preferences);
      setShowPreferences(true);
      setIsVisible(true);
    };

    const handleConsentChange = (e) => {
      if (e.detail) {
        setAnalyticsChecked(e.detail.analytics);
        setPreferencesChecked(e.detail.preferences);
      }
    };

    window.addEventListener(EVENT_OPEN_COOKIE_PREFERENCES, handleOpenPrefs);
    window.addEventListener(EVENT_COOKIE_CONSENT_CHANGED, handleConsentChange);

    return () => {
      window.removeEventListener(EVENT_OPEN_COOKIE_PREFERENCES, handleOpenPrefs);
      window.removeEventListener(EVENT_COOKIE_CONSENT_CHANGED, handleConsentChange);
    };
  }, []);

  if (!isVisible) return null;

  const handleAcceptAll = () => {
    acceptAllCookies();
    setIsVisible(false);
    setShowPreferences(false);
  };

  const handleRejectOptional = () => {
    rejectOptionalCookies();
    setIsVisible(false);
    setShowPreferences(false);
  };

  const handleSaveCustom = () => {
    setCookieConsent({
      analytics: analyticsChecked,
      preferences: preferencesChecked,
    });
    setIsVisible(false);
    setShowPreferences(false);
  };

  return (
    <>
      {/* Banner flotante principal */}
      {!showPreferences && (
        <aside
          role="region"
          aria-label="Aviso de privacidad y cookies"
          className="cookie-banner-container"
          style={{
            position: 'fixed',
            bottom: 24,
            left: 24,
            right: 24,
            maxWidth: 640,
            margin: '0 auto',
            zIndex: 9990,
            background: 'var(--cream2)',
            border: '1px solid var(--border)',
            borderRadius: 4,
            boxShadow: '0 12px 36px rgba(36,26,18,0.18)',
            padding: '24px 28px',
            animation: 'fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
            <div
              style={{
                width: 10,
                height: 10,
                marginTop: 6,
                background: 'var(--terracotta)',
                transform: 'rotate(45deg)',
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: "'Spectral', serif",
                  fontSize: 18,
                  fontWeight: 600,
                  color: 'var(--ink)',
                  marginBottom: 8,
                }}
              >
                Control de Privacidad y Cookies
              </div>
              <p
                style={{
                  fontSize: 13,
                  lineHeight: 1.6,
                  color: 'var(--ink)',
                  margin: '0 0 16px',
                }}
              >
                Inmerge utiliza cookies técnicas esenciales para el funcionamiento de la plataforma y autenticación segura.
                Opcionalmente, podemos emplear herramientas analíticas y de preferencias de interfaz para optimizar su experiencia.{' '}
                <Link
                  to="/cookies"
                  style={{
                    color: 'var(--terracotta)',
                    fontWeight: 600,
                    textDecoration: 'underline',
                  }}
                >
                  Leer Política de Cookies
                </Link>
                .
              </p>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="btn-accent"
                  style={{
                    background: 'var(--terracotta)',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 18px',
                    borderRadius: 3,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Aceptar Todas
                </button>

                <button
                  type="button"
                  onClick={handleRejectOptional}
                  className="btn-outline"
                  style={{
                    background: 'transparent',
                    color: 'var(--ink)',
                    border: '1px solid var(--border)',
                    padding: '10px 18px',
                    borderRadius: 3,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Solo Esenciales
                </button>

                <button
                  type="button"
                  onClick={() => setShowPreferences(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--muted)',
                    fontSize: 13,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: '6px 8px',
                    fontFamily: 'inherit',
                  }}
                >
                  Personalizar
                </button>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* Modal / Panel de Preferencias Detalladas */}
      {showPreferences && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-prefs-title"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9995,
            background: 'rgba(36,26,18,0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            animation: 'fadeIn 0.25s ease',
          }}
        >
          <div
            style={{
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: 6,
              maxWidth: 580,
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '32px 36px',
              boxShadow: '0 20px 50px rgba(36,26,18,0.25)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2
                id="cookie-prefs-title"
                style={{
                  fontFamily: "'Spectral', serif",
                  fontSize: 22,
                  fontWeight: 600,
                  margin: 0,
                  color: 'var(--ink)',
                }}
              >
                Preferencias de Cookies
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowPreferences(false);
                  if (getCookieConsent()) setIsVisible(false);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 22,
                  cursor: 'pointer',
                  color: 'var(--muted)',
                  lineHeight: 1,
                }}
                aria-label="Cerrar modal de preferencias"
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--muted)', marginBottom: 24 }}>
              Configure qué tecnologías de almacenamiento permite que Inmerge ejecute en su navegador. Las cookies necesarias garantizan la operatividad técnica de la plataforma.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 28 }}>
              {/* 1. Esenciales */}
              <div
                style={{
                  background: 'var(--cream2)',
                  border: '1px solid var(--border)',
                  borderRadius: 4,
                  padding: '16px 20px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)' }}>Cookies Técnicas & Esenciales</span>
                    <span
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 10,
                        background: 'var(--ochre)',
                        color: '#fff',
                        padding: '2px 6px',
                        borderRadius: 2,
                        textTransform: 'uppercase',
                      }}
                    >
                      Obligatorias
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={true}
                    disabled={true}
                    aria-label="Cookies Esenciales (Siempre activas)"
                    style={{ accentColor: 'var(--terracotta)', width: 16, height: 16, cursor: 'not-allowed' }}
                  />
                </div>
                <p style={{ fontSize: 12, lineHeight: 1.5, color: 'var(--muted)', margin: 0 }}>
                  Imprescindibles para autenticación de usuarios (Supabase JWT), navegación segura por roles, validación perimetral anti-DDoS y persistencia de su estado de sesión.
                </p>
              </div>

              {/* 2. Analíticas */}
              <div
                style={{
                  background: 'var(--cream2)',
                  border: '1px solid var(--border)',
                  borderRadius: 4,
                  padding: '16px 20px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)' }}>Cookies de Rendimiento & Analítica</span>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={analyticsChecked}
                      onChange={(e) => setAnalyticsChecked(e.target.checked)}
                      aria-label="Permitir Cookies Analíticas"
                      style={{ accentColor: 'var(--terracotta)', width: 16, height: 16, cursor: 'pointer' }}
                    />
                  </label>
                </div>
                <p style={{ fontSize: 12, lineHeight: 1.5, color: 'var(--muted)', margin: 0 }}>
                  Recopilan telemetría técnica anónima sobre latencia, tiempos de carga y flujos de navegación para ayudarnos a optimizar la infraestructura de Inmerge.
                </p>
              </div>

              {/* 3. Preferencias */}
              <div
                style={{
                  background: 'var(--cream2)',
                  border: '1px solid var(--border)',
                  borderRadius: 4,
                  padding: '16px 20px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)' }}>Cookies de Preferencias & Personalización</span>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={preferencesChecked}
                      onChange={(e) => setPreferencesChecked(e.target.checked)}
                      aria-label="Permitir Cookies de Preferencias"
                      style={{ accentColor: 'var(--terracotta)', width: 16, height: 16, cursor: 'pointer' }}
                    />
                  </label>
                </div>
                <p style={{ fontSize: 12, lineHeight: 1.5, color: 'var(--muted)', margin: 0 }}>
                  Guardan sus ajustes de interfaz como el zoom del cronograma Gantt, filtros preseleccionados en catálogo de servicios y opciones de visualización.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleRejectOptional}
                className="btn-outline"
                style={{
                  background: 'transparent',
                  color: 'var(--ink)',
                  border: '1px solid var(--border)',
                  padding: '10px 18px',
                  borderRadius: 3,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Rechazar Opcionales
              </button>
              <button
                type="button"
                onClick={handleSaveCustom}
                className="btn-accent"
                style={{
                  background: 'var(--terracotta)',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: 3,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Guardar Preferencias
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
