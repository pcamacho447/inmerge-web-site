import { waLink } from '../../data/content.js';

export default function ClientSupportCard({ user, projectsCount }) {
  const supportWaUrl = waLink(
    `Hola equipo de Inmerge, soy cliente con cuenta ${user?.email}. Deseo realizar una consulta técnica sobre mis proyectos.`,
  );

  return (
    <div
      style={{
        background: 'var(--cream2)',
        borderRadius: 8,
        padding: '24px clamp(16px, 4vw, 28px)',
        border: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 20 }}>💬</span>
        <h3 style={{ fontFamily: "'Spectral', serif", fontSize: 20, margin: 0, fontWeight: 700 }}>
          Canales de Soporte Técnico & Tech Lead
        </h3>
      </div>

      <p style={{ fontSize: 14, color: 'var(--ink)', lineHeight: 1.6, margin: 0 }}>
        Tienes <strong>{projectsCount} proyecto(s)</strong> activos en curso. Ante cualquier requerimiento urgente, consulta sobre hitos técnicos o coordinación de entregables, puedes comunicarte directamente con nuestro equipo de ingeniería.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
        <div style={{ background: '#fff', padding: 16, borderRadius: 6, border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: 'var(--terracotta)', marginBottom: 4 }}>
            CANAL DE MENSAJERÍA DIRECTA
          </div>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>WhatsApp de Guardia Técnica</div>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: '0 0 12px' }}>
            Respuesta promedio menor a 30 minutos en días hábiles.
          </p>
          <a
            href={supportWaUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: '#25D366',
              color: '#fff',
              padding: '8px 16px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600,
              textDecoration: 'none',
              fontFamily: "'IBM Plex Sans', sans-serif",
            }}
          >
            💬 Abrir WhatsApp Directo
          </a>
        </div>

        <div style={{ background: '#fff', padding: 16, borderRadius: 6, border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: 'var(--terracotta)', marginBottom: 4 }}>
            CORREO INSTITUCIONAL
          </div>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>Mesa de Ayuda de Ingeniería</div>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: '0 0 12px' }}>
            Para envío de requerimientos formales, TDRs y documentación.
          </p>
          <a
            href="mailto:inmerge3@gmail.com"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'var(--ink)',
              color: '#fff',
              padding: '8px 16px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600,
              textDecoration: 'none',
              fontFamily: "'IBM Plex Sans', sans-serif",
            }}
          >
            ✉️ inmerge3@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
}
