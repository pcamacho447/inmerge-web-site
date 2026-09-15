import { waLink } from '../../data/content.js';

export const PILLAR_LABELS = {
  auditoria: '01. Auditoría Técnica & Datos',
  desarrollo: '02. Desarrollo Cloud & AWS',
  datos: '03. Datos & IA',
  integral: 'Solución Integral',
};

export const STATUS_COLORS = {
  NUEVO: { bg: 'rgba(168, 71, 43, 0.1)', text: 'var(--terracotta)', border: 'var(--terracotta)' },
  EN_REVISION: { bg: 'rgba(198, 138, 61, 0.12)', text: 'var(--ochre)', border: 'var(--ochre)' },
  CONTACTADO: { bg: 'rgba(216, 168, 78, 0.15)', text: '#9B7322', border: 'var(--gold)' },
  PROPUESTA_ENVIADA: { bg: 'rgba(74, 114, 186, 0.1)', text: '#345995', border: '#345995' },
  CERRADO_GANADO: { bg: 'rgba(46, 117, 89, 0.12)', text: '#2E7559', border: '#2E7559' },
  DESCARTADO: { bg: 'rgba(0,0,0,0.05)', text: 'var(--muted)', border: 'var(--border)' },
};

export default function LeadsInboxTable({
  leads,
  clients,
  user,
  onUpdateLeadStatus,
  onConvertLeadToProject,
}) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontFamily: "'Spectral', serif", fontSize: 24, margin: 0 }}>
          Solicitudes de Cotización Recibidas ({leads.length})
        </h2>
      </div>

      {leads.length === 0 ? (
        <div
          style={{
            padding: 40,
            textAlign: 'center',
            background: 'var(--cream2)',
            borderRadius: 8,
            border: '1px dashed var(--border)',
          }}
        >
          <p style={{ color: 'var(--muted)', margin: 0 }}>No hay solicitudes de cotización registradas aún.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {leads.map((lead) => {
            const color = STATUS_COLORS[lead.status] || STATUS_COLORS.NUEVO;
            const matchedClient = clients.find((c) => c.email && c.email.toLowerCase() === lead.email?.toLowerCase());

            const leadWaMsg = `Hola ${lead.full_name || 'estimado(a)'}, te saluda ${user?.fullName || 'el equipo técnico'} de Inmerge. Recibimos tu solicitud para "${PILLAR_LABELS[lead.pillar] || lead.pillar}"${lead.company ? ` en ${lead.company}` : ''}. ¿Podemos agendar una breve llamada técnica para revisar los requerimientos?`;
            const leadWaUrl = waLink(leadWaMsg);

            return (
              <div
                key={lead.id}
                style={{
                  background: 'var(--cream2)',
                  borderRadius: 8,
                  padding: '24px',
                  border: '1px solid var(--border)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: 12,
                    marginBottom: 12,
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontFamily: "'IBM Plex Mono', monospace",
                          fontSize: 11,
                          padding: '3px 8px',
                          borderRadius: 4,
                          background: color.bg,
                          color: color.text,
                          border: `1px solid ${color.border}`,
                          fontWeight: 700,
                        }}
                      >
                        {lead.status}
                      </span>
                      <span
                        style={{
                          fontFamily: "'IBM Plex Mono', monospace",
                          fontSize: 12,
                          color: 'var(--terracotta)',
                          fontWeight: 600,
                        }}
                      >
                        {PILLAR_LABELS[lead.pillar] || lead.pillar}
                      </span>
                      {matchedClient ? (
                        <span
                          style={{
                            fontFamily: "'IBM Plex Mono', monospace",
                            fontSize: 11,
                            padding: '2px 8px',
                            borderRadius: 4,
                            background: 'rgba(46, 117, 89, 0.12)',
                            color: '#2E7559',
                            border: '1px solid #2E7559',
                          }}
                        >
                          ✓ Cuenta Cliente Vinculada
                        </span>
                      ) : (
                        <span
                          style={{
                            fontFamily: "'IBM Plex Mono', monospace",
                            fontSize: 11,
                            padding: '2px 8px',
                            borderRadius: 4,
                            background: 'rgba(0,0,0,0.04)',
                            color: 'var(--muted)',
                            border: '1px solid var(--border)',
                          }}
                        >
                          Prospecto nuevo
                        </span>
                      )}
                    </div>
                    <h3 style={{ margin: '4px 0', fontSize: 18, fontWeight: 700 }}>
                      {lead.company ? `${lead.company} — ` : ''}
                      {lead.full_name || 'Solicitud Anónima'}
                    </h3>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: 'var(--muted)' }}>
                      {new Date(lead.created_at).toLocaleDateString('es-PE', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    background: '#fff',
                    padding: 14,
                    borderRadius: 6,
                    marginBottom: 14,
                    border: '1px solid rgba(0,0,0,0.06)',
                  }}
                >
                  <div style={{ fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", color: 'var(--muted)', marginBottom: 4 }}>
                    DESCRIPCIÓN DEL REQUERIMIENTO / TDR:
                  </div>
                  <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: 'var(--ink)' }}>{lead.message}</p>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 12,
                    fontSize: 13,
                  }}
                >
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', color: 'var(--muted)' }}>
                    <span>
                      📧 <strong style={{ color: 'var(--ink)' }}>{lead.email}</strong>
                    </span>
                    {lead.phone && (
                      <span>
                        📞 <strong style={{ color: 'var(--ink)' }}>{lead.phone}</strong>
                      </span>
                    )}
                    {lead.timeline && (
                      <span>
                        ⏱️ Plazo: <strong style={{ color: 'var(--ink)' }}>{lead.timeline}</strong>
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <a
                      href={leadWaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        background: '#25D366',
                        color: '#fff',
                        padding: '6px 14px',
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 600,
                        textDecoration: 'none',
                        fontFamily: "'IBM Plex Sans', sans-serif",
                      }}
                    >
                      💬 WhatsApp Directo
                    </a>

                    <button
                      type="button"
                      onClick={() => onConvertLeadToProject(lead)}
                      style={{
                        background: 'var(--terracotta)',
                        color: '#fff',
                        border: 'none',
                        padding: '6px 14px',
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontFamily: "'IBM Plex Sans', sans-serif",
                      }}
                    >
                      Convertir en Proyecto →
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <label style={{ fontSize: 12, fontFamily: "'IBM Plex Mono', monospace" }}>Estado:</label>
                      <select
                        value={lead.status}
                        onChange={(e) => onUpdateLeadStatus(lead.id, e.target.value)}
                        style={{
                          padding: '6px 10px',
                          borderRadius: 4,
                          border: '1px solid var(--border)',
                          background: '#fff',
                          fontSize: 12,
                          fontFamily: "'IBM Plex Mono', monospace",
                          fontWeight: 600,
                        }}
                      >
                        <option value="NUEVO">NUEVO</option>
                        <option value="EN_REVISION">EN_REVISION</option>
                        <option value="CONTACTADO">CONTACTADO</option>
                        <option value="PROPUESTA_ENVIADA">PROPUESTA_ENVIADA</option>
                        <option value="CERRADO_GANADO">CERRADO_GANADO</option>
                        <option value="DESCARTADO">DESCARTADO</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
