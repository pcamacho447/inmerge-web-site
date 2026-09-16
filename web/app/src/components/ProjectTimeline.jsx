export default function ProjectTimeline({ milestones = [] }) {
  if (!milestones || milestones.length === 0) {
    return (
      <div style={{ padding: 20, fontSize: 14, color: 'var(--muted)', background: 'var(--bg)', border: '1px solid var(--border)' }}>
        No se han definido hitos para este proyecto todavía.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
      {milestones.map((m, idx) => {
        const isCompleted = m.status === 'COMPLETADO';
        const isInProgress = m.status === 'EN_PROGRESO' || m.status === 'EN_PROCESO';
        const isBlocked = m.status === 'BLOQUEADO';

        const statusColor = isCompleted ? 'var(--green)' : isBlocked ? 'var(--terracotta)' : isInProgress ? 'var(--gold)' : 'var(--muted)';
        const statusLabel = isCompleted ? '✓ Completado' : isBlocked ? '⚠️ Bloqueado' : isInProgress ? '● En progreso' : '○ Pendiente';
        const bgBadge = isCompleted
          ? 'rgba(74, 156, 106, 0.1)'
          : isBlocked
            ? 'rgba(168, 71, 43, 0.12)'
            : isInProgress
              ? 'rgba(216, 168, 78, 0.15)'
              : 'rgba(122, 107, 88, 0.08)';

        return (
          <div
            key={m.id || idx}
            style={{
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              padding: 20,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: 16,
              position: 'relative',
            }}
          >
            <div style={{ flex: 1, minWidth: 240 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 12,
                    fontWeight: 700,
                    color: 'var(--terracotta)',
                  }}
                >
                  Fase {m.order_index || idx + 1}
                </span>
                <span
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 11,
                    color: statusColor,
                    background: bgBadge,
                    padding: '2px 8px',
                    border: `1px solid ${statusColor}`,
                  }}
                >
                  {statusLabel}
                </span>
              </div>

              <h4 style={{ fontFamily: "'Spectral', serif", fontSize: 18, fontWeight: 700, margin: '0 0 6px 0', color: 'var(--ink)' }}>
                {m.title}
              </h4>
              {m.description && <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0, lineHeight: 1.5 }}>{m.description}</p>}
            </div>

            <div
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 12,
                color: 'var(--muted)',
                textAlign: 'right',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
            >
              {m.assigned_to_name && (
                <div style={{ fontSize: 11, color: 'var(--ink)' }}>
                  👤 <span style={{ color: 'var(--muted)' }}>Encargado:</span> <strong>{m.assigned_to_name}</strong>
                </div>
              )}
              {m.due_date && (
                <div>
                  Fecha meta: <strong style={{ color: 'var(--ink)' }}>{m.due_date}</strong>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
