import { openCookiePreferences, COOKIE_INVENTORY } from '../lib/cookies.js';
import useDocumentHead from '../hooks/useDocumentHead.js';
import Footer from '../components/Footer.jsx';

export default function CookiesPolicy() {
  useDocumentHead({
    title: 'Política de Cookies & Privacidad — Inmerge',
    description: 'Conozca las tecnologías de almacenamiento local y cookies empleadas por Inmerge, su finalidad técnica y cómo gestionar sus preferencias de privacidad.',
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <main style={{ flex: 1, padding: '120px clamp(20px, 5vw, 60px) 80px', maxWidth: 960, margin: '0 auto', width: '100%' }}>
        {/* Encabezado Editorial */}
        <div style={{ marginBottom: 48 }}>
          <div
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 12,
              color: 'var(--terracotta)',
              textTransform: 'uppercase',
              letterSpacing: 2,
              marginBottom: 12,
            }}
          >
            Marco de Privacidad & Gobernanza Técnica
          </div>
          <h1
            style={{
              fontFamily: "'Spectral', serif",
              fontSize: 'clamp(32px, 4vw, 48px)',
              fontWeight: 600,
              color: 'var(--ink)',
              lineHeight: 1.15,
              margin: '0 0 16px',
            }}
          >
            Política de Cookies y Almacenamiento Local
          </h1>
          <p
            style={{
              fontSize: 16,
              color: 'var(--muted)',
              lineHeight: 1.6,
              maxWidth: 760,
              margin: 0,
            }}
          >
            En Inmerge aplicamos los mismos estándares de rigor e integridad a la privacidad de datos que a nuestros servicios de auditoría y arquitectura cloud. Esta política detalla cómo y para qué utilizamos cookies y almacenamiento en su navegador.
          </p>
        </div>

        {/* Panel de Control Rápido */}
        <div
          style={{
            background: 'var(--cream2)',
            border: '1px solid var(--border)',
            borderRadius: 6,
            padding: '28px 32px',
            marginBottom: 48,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 20,
          }}
        >
          <div>
            <div style={{ fontFamily: "'Spectral', serif", fontSize: 20, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>
              Administrador de Consentimiento
            </div>
            <div style={{ fontSize: 13, color: 'var(--muted)', maxWidth: 520 }}>
              Puede revisar, activar o revocar las cookies opcionales (analíticas y de preferencias) en cualquier momento.
            </div>
          </div>
          <button
            type="button"
            onClick={openCookiePreferences}
            className="btn-accent"
            style={{
              background: 'var(--terracotta)',
              color: '#fff',
              border: 'none',
              padding: '12px 24px',
              borderRadius: 3,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Configurar Mis Preferencias
          </button>
        </div>

        {/* Secciones de Contenido */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 40, lineHeight: 1.7, fontSize: 15, color: 'var(--ink)' }}>
          <section>
            <h2 style={{ fontFamily: "'Spectral', serif", fontSize: 24, fontWeight: 600, marginBottom: 14 }}>
              1. ¿Qué son las cookies y tecnologías afines?
            </h2>
            <p style={{ margin: '0 0 12px' }}>
              Las cookies son pequeños archivos de texto que los sitios web almacenan en su navegador para recordar información sobre su visita, sesiones autenticadas o parámetros de configuración.
            </p>
            <p style={{ margin: 0 }}>
              Junto con las cookies, utilizamos tecnologías modernas como <code>localStorage</code> y <code>sessionStorage</code> para garantizar la persistencia de tokens de seguridad JWT de Supabase, optimizar la carga de recursos y recordar opciones del usuario sin transmitir datos innecesarios a servidores de terceros.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: "'Spectral', serif", fontSize: 24, fontWeight: 600, marginBottom: 14 }}>
              2. Categorías de cookies utilizadas
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ borderLeft: '3px solid var(--terracotta)', paddingLeft: 16 }}>
                <strong>A. Técnicas y Estrictamente Necesarias (Obligatorias):</strong>
                <p style={{ margin: '4px 0 0', color: 'var(--muted)', fontSize: 14 }}>
                  Permiten la autenticación mediante tokens criptográficos, el acceso al portal de clientes y panel del equipo consultor, control de sesiones y protección perimetral contra tráfico malicioso. No pueden desactivarse.
                </p>
              </div>

              <div style={{ borderLeft: '3px solid var(--gold)', paddingLeft: 16 }}>
                <strong>B. Rendimiento y Analítica Técnica (Opcionales):</strong>
                <p style={{ margin: '4px 0 0', color: 'var(--muted)', fontSize: 14 }}>
                  Miden de forma totalmente agregada y anónima la velocidad de carga de módulos, latencia de APIs y telemetría de rendimiento para mejorar continuamente la arquitectura web.
                </p>
              </div>

              <div style={{ borderLeft: '3px solid var(--ochre)', paddingLeft: 16 }}>
                <strong>C. Preferencias y Personalización de Interfaz (Opcionales):</strong>
                <p style={{ margin: '4px 0 0', color: 'var(--muted)', fontSize: 14 }}>
                  Conservan parámetros seleccionados por el cliente, tales como la escala temporal en los diagramas Gantt y visualizaciones de cronogramas.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 style={{ fontFamily: "'Spectral', serif", fontSize: 24, fontWeight: 600, marginBottom: 16 }}>
              3. Inventario técnico de cookies y almacenamiento
            </h2>
            <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 4 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'var(--cream2)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '12px 16px', fontFamily: "'IBM Plex Mono', monospace" }}>Identificador</th>
                    <th style={{ padding: '12px 16px' }}>Proveedor</th>
                    <th style={{ padding: '12px 16px' }}>Categoría</th>
                    <th style={{ padding: '12px 16px' }}>Caducidad</th>
                    <th style={{ padding: '12px 16px' }}>Propósito</th>
                  </tr>
                </thead>
                <tbody>
                  {COOKIE_INVENTORY.map((item, idx) => (
                    <tr
                      key={item.name}
                      style={{
                        borderBottom: idx < COOKIE_INVENTORY.length - 1 ? '1px solid var(--border)' : undefined,
                        background: idx % 2 === 0 ? 'transparent' : 'rgba(235, 223, 201, 0.3)',
                      }}
                    >
                      <td style={{ padding: '12px 16px', fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600 }}>
                        {item.name}
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--muted)' }}>{item.provider}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            fontFamily: "'IBM Plex Mono', monospace",
                            fontSize: 11,
                            padding: '2px 6px',
                            borderRadius: 2,
                            background:
                              item.category === 'essential'
                                ? 'var(--brown2)'
                                : item.category === 'analytics'
                                  ? 'var(--gold)'
                                  : 'var(--ochre)',
                            color: '#fff',
                          }}
                        >
                          {item.category}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--muted)' }}>{item.duration}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--ink)' }}>{item.purpose}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 style={{ fontFamily: "'Spectral', serif", fontSize: 24, fontWeight: 600, marginBottom: 14 }}>
              4. Marco Normativo y Derechos ARCO
            </h2>
            <p style={{ margin: '0 0 12px' }}>
              En cumplimiento con la <strong>Ley N° 29733 (Ley de Protección de Datos Personales de Perú)</strong>, su reglamento y directivas internacionales de privacidad (RGPD / ePrivacy), usted tiene derecho a acceder, rectificar, cancelar u oponerse al tratamiento de sus datos personales.
            </p>
            <p style={{ margin: 0 }}>
              Para cualquier consulta sobre el tratamiento de datos o ejercicio de derechos ARCO, contáctenos directamente a <code>inmerge3@gmail.com</code> indicando como referencia <em>«Protección de Datos & Privacidad»</em>.
            </p>
          </section>
        </div>
      </main>

      <Footer borderTop={true} />
    </div>
  );
}
