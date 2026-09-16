import { waLink } from '../../data/content.js';

export default function ClientSupportCard({ user, projectsCount, isEn, content }) {
  const supportDict = content?.ACCOUNT_CONTENT?.support || {};

  const supportWaUrl = waLink(
    isEn
      ? `Hello Inmerge engineering team, I am a client with account ${user?.email}. I would like to make a technical inquiry regarding my projects.`
      : `Hola equipo de Inmerge, soy cliente con cuenta ${user?.email}. Deseo realizar una consulta técnica sobre mis proyectos.`,
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
          {supportDict.title || 'Canales de Soporte Técnico & Tech Lead'}
        </h3>
      </div>

      <p style={{ fontSize: 14, color: 'var(--ink)', lineHeight: 1.6, margin: 0 }}>
        {typeof supportDict.desc === 'function' ? (
          supportDict.desc(projectsCount)
        ) : isEn ? (
          <>
            You have <strong>{projectsCount} active project(s)</strong> in progress. For urgent technical matters or milestone reviews,
            contact our engineering lead directly.
          </>
        ) : (
          <>
            Tienes <strong>{projectsCount} proyecto(s)</strong> activos en curso. Ante cualquier requerimiento urgente, consulta sobre hitos
            técnicos o coordinación de entregables, puedes comunicarte directamente con nuestro equipo de ingeniería.
          </>
        )}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
        <div style={{ background: '#fff', padding: 16, borderRadius: 6, border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: 'var(--terracotta)', marginBottom: 4 }}>
            {supportDict.badge || 'CANAL DE MENSAJERÍA DIRECTA'}
          </div>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>{supportDict.whatsappTitle || 'WhatsApp de Guardia Técnica'}</div>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: '0 0 12px' }}>
            {supportDict.whatsappSla || 'Respuesta promedio menor a 30 minutos en días hábiles.'}
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
            {supportDict.whatsappBtn || '💬 Abrir WhatsApp Directo'}
          </a>
        </div>

        <div style={{ background: '#fff', padding: 16, borderRadius: 6, border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: 'var(--terracotta)', marginBottom: 4 }}>
            {isEn ? 'OFFICIAL EMAIL' : 'CORREO INSTITUCIONAL'}
          </div>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>{supportDict.emailTitle || 'Mesa de Ayuda de Ingeniería'}</div>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: '0 0 12px' }}>
            {supportDict.emailSla || 'Para envío de requerimientos formales, TDRs y documentación.'}
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
            {supportDict.emailBtn || '✉️ inmerge3@gmail.com'}
          </a>
        </div>
      </div>
    </div>
  );
}
