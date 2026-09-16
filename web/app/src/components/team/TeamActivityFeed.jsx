export const ACTIVITY_ACTION_BADGES = {
  LEAD_STATUS_UPDATED: { label: 'LEAD ACTUALIZADO', bg: 'rgba(216, 168, 78, 0.15)', text: '#9B7322', border: 'var(--gold)' },
  PROJECT_CREATED: { label: 'PROYECTO CREADO', bg: 'rgba(168, 71, 43, 0.1)', text: 'var(--terracotta)', border: 'var(--terracotta)' },
  PROJECT_STATUS_UPDATED: { label: 'PROYECTO ACTUALIZADO', bg: 'rgba(52, 89, 149, 0.12)', text: '#345995', border: '#345995' },
  MILESTONE_CREATED: { label: 'HITO AGREGADO', bg: 'rgba(36, 26, 18, 0.08)', text: 'var(--ink)', border: 'var(--border)' },
  MILESTONE_STATUS_UPDATED: { label: 'HITO ACTUALIZADO', bg: 'rgba(198, 138, 61, 0.15)', text: 'var(--ochre)', border: 'var(--ochre)' },
  DELIVERABLE_PUBLISHED: { label: 'ENTREGABLE PUBLICADO', bg: 'rgba(46, 117, 89, 0.15)', text: '#2E7559', border: '#2E7559' },
  STAFF_REGISTERED: { label: 'STAFF REGISTRADO', bg: 'rgba(74, 114, 186, 0.12)', text: '#345995', border: '#345995' },
};

export default function TeamActivityFeed({ filteredActivityLogs, activityFilter, setActivityFilter }) {
  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <h2 style={{ fontFamily: "'Spectral', serif", fontSize: 24, margin: 0 }}>
            Bitácora de Auditoría Técnica & Actividad ({filteredActivityLogs.length})
          </h2>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
            Registro inmutable de trazabilidad de proyectos, hitos, entregables y leads.
          </div>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[
            { key: 'ALL', label: 'Todos' },
            { key: 'LEADS', label: 'Leads TDR' },
            { key: 'PROJECTS', label: 'Proyectos & Hitos' },
            { key: 'DELIVERABLES', label: 'Entregables' },
            { key: 'STAFF', label: 'Equipo' },
          ].map((btn) => (
            <button
              key={btn.key}
              type="button"
              onClick={() => setActivityFilter(btn.key)}
              style={{
                background: activityFilter === btn.key ? 'var(--terracotta)' : 'var(--cream2)',
                color: activityFilter === btn.key ? '#fff' : 'var(--ink)',
                border: '1px solid var(--border)',
                borderRadius: 16,
                padding: '5px 12px',
                fontSize: 12,
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {filteredActivityLogs.length === 0 ? (
        <div
          style={{
            padding: 40,
            textAlign: 'center',
            background: 'var(--cream2)',
            borderRadius: 8,
            border: '1px dashed var(--border)',
          }}
        >
          <p style={{ color: 'var(--muted)', margin: 0 }}>No hay eventos registrados en esta categoría.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredActivityLogs.map((log) => {
            const badge = ACTIVITY_ACTION_BADGES[log.action] || {
              label: log.action,
              bg: 'rgba(0,0,0,0.05)',
              text: 'var(--ink)',
              border: 'var(--border)',
            };

            return (
              <div
                key={log.id}
                style={{
                  background: 'var(--cream2)',
                  borderRadius: 8,
                  padding: '16px 20px',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 10,
                        padding: '2px 8px',
                        borderRadius: 4,
                        background: badge.bg,
                        color: badge.text,
                        border: `1px solid ${badge.border}`,
                        fontWeight: 700,
                      }}
                    >
                      {badge.label}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--muted)', fontFamily: "'IBM Plex Mono', monospace" }}>
                      Entidad: <strong>{log.entity_type}</strong>
                    </span>
                  </div>

                  <div style={{ fontSize: 14, color: 'var(--ink)', marginBottom: 6 }}>
                    {log.action === 'PROJECT_CREATED' && (
                      <span>
                        Proyecto creado: <strong>{log.details?.title}</strong> (Pilar: {log.details?.pillar})
                      </span>
                    )}
                    {log.action === 'LEAD_STATUS_UPDATED' && (
                      <span>
                        Lead actualizado a <strong>{log.details?.new_status}</strong>{' '}
                        {log.details?.full_name ? `(${log.details.full_name})` : ''}
                      </span>
                    )}
                    {log.action === 'MILESTONE_CREATED' && (
                      <span>
                        Nuevo hito creado: <strong>{log.details?.title}</strong>
                      </span>
                    )}
                    {log.action === 'MILESTONE_STATUS_UPDATED' && (
                      <span>
                        Hito cambiado a <strong>{log.details?.new_status}</strong> {log.details?.title ? `(${log.details.title})` : ''}
                      </span>
                    )}
                    {log.action === 'DELIVERABLE_PUBLISHED' && (
                      <span>
                        Entregable publicado: <strong>{log.details?.title}</strong> ({log.details?.file_type} {log.details?.version})
                      </span>
                    )}
                    {log.action === 'STAFF_REGISTERED' && (
                      <span>
                        Nuevo colaborador dado de alta: <strong>{log.details?.full_name}</strong> ({log.details?.email}, Rol:{' '}
                        {log.details?.role})
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                    Autor:{' '}
                    <strong style={{ color: 'var(--ink)' }}>{log.author?.full_name || log.author?.email || 'Sistema / Staff'}</strong>
                    {log.author?.role && ` (${log.author.role})`}
                  </div>
                </div>

                <div
                  style={{
                    textAlign: 'right',
                    fontSize: 12,
                    fontFamily: "'IBM Plex Mono', monospace",
                    color: 'var(--muted)',
                  }}
                >
                  {new Date(log.created_at).toLocaleDateString('es-PE', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
