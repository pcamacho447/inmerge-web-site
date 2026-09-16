import { useState } from 'react';
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
  leads = [],
  clients = [],
  staffList = [],
  user,
  isAdmin = true,
  onUpdateLeadStatus,
  onConvertLeadToProject,
}) {
  const [filterStatus, setFilterStatus] = useState('TODOS');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLeads = leads.filter((lead) => {
    if (filterStatus !== 'TODOS' && lead.status !== filterStatus) {
      return false;
    }
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (lead.full_name && lead.full_name.toLowerCase().includes(q)) ||
      (lead.company && lead.company.toLowerCase().includes(q)) ||
      (lead.email && lead.email.toLowerCase().includes(q)) ||
      (lead.message && lead.message.toLowerCase().includes(q)) ||
      (lead.pillar && lead.pillar.toLowerCase().includes(q))
    );
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: "'Spectral', serif", fontSize: 24, margin: '0 0 4px', color: 'var(--ink)' }}>
            Bandeja de Leads & Solicitudes TDR ({leads.length})
          </h2>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--muted)' }}>
            {isAdmin
              ? 'Gestión técnica y designación de consultores/ingenieros para evaluación de requerimientos.'
              : 'Visualización técnica de requerimientos y solicitudes TDR recibidas.'}
          </p>
        </div>

        {/* Filtros rápidos de búsqueda y estado */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="🔍 Buscar prospecto, empresa o requerimiento..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: 4,
              border: '1px solid var(--border)',
              background: 'var(--cream2)',
              fontSize: 12,
              fontFamily: "'IBM Plex Sans', sans-serif",
              minWidth: 260,
            }}
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: 4,
              border: '1px solid var(--border)',
              background: '#fff',
              fontSize: 12,
              fontFamily: "'IBM Plex Mono', monospace",
              fontWeight: 600,
            }}
          >
            <option value="TODOS">Todos los Estados ({leads.length})</option>
            <option value="NUEVO">NUEVO</option>
            <option value="EN_REVISION">EN_REVISION</option>
            <option value="CONTACTADO">CONTACTADO</option>
            <option value="PROPUESTA_ENVIADA">PROPUESTA_ENVIADA</option>
            <option value="CERRADO_GANADO">CERRADO_GANADO</option>
            <option value="DESCARTADO">DESCARTADO</option>
          </select>
        </div>
      </div>

      {filteredLeads.length === 0 ? (
        <div
          style={{
            padding: 40,
            textAlign: 'center',
            background: 'var(--cream2)',
            borderRadius: 8,
            border: '1px dashed var(--border)',
          }}
        >
          <p style={{ color: 'var(--muted)', margin: 0 }}>
            {leads.length === 0
              ? 'No hay solicitudes de cotización registradas aún.'
              : 'No se encontraron solicitudes que coincidan con los filtros seleccionados.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filteredLeads.map((lead) => {
            const color = STATUS_COLORS[lead.status] || STATUS_COLORS.NUEVO;
            const matchedClient = clients.find((c) => c.email && c.email.toLowerCase() === lead.email?.toLowerCase());
            const assignedStaff =
              staffList.find((s) => s.id === lead.assigned_to) ||
              (lead.assigned_profile ? { ...lead.assigned_profile, id: lead.assigned_to } : null);

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
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                      {/* Estado Badge / Select */}
                      {isAdmin ? (
                        <select
                          value={lead.status}
                          onChange={(e) => onUpdateLeadStatus(lead.id, { status: e.target.value })}
                          title="Cambiar estado del lead TDR"
                          style={{
                            fontFamily: "'IBM Plex Mono', monospace",
                            fontSize: 11,
                            padding: '3px 8px',
                            borderRadius: 4,
                            background: color.bg,
                            color: color.text,
                            border: `1px solid ${color.border}`,
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          <option value="NUEVO">NUEVO</option>
                          <option value="EN_REVISION">EN_REVISION</option>
                          <option value="CONTACTADO">CONTACTADO</option>
                          <option value="PROPUESTA_ENVIADA">PROPUESTA_ENVIADA</option>
                          <option value="CERRADO_GANADO">CERRADO_GANADO</option>
                          <option value="DESCARTADO">DESCARTADO</option>
                        </select>
                      ) : (
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
                          title="Estado del lead (Solo editable por Admin)"
                        >
                          🔒 {lead.status}
                        </span>
                      )}

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

                      {/* Designación de Ingeniero / Auditor */}
                      {isAdmin ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <select
                            value={lead.assigned_to || ''}
                            onChange={(e) => {
                              const memberId = e.target.value || null;
                              onUpdateLeadStatus(lead.id, { assignedTo: memberId });
                            }}
                            style={{
                              fontFamily: "'IBM Plex Mono', monospace",
                              fontSize: 11,
                              padding: '2px 8px',
                              borderRadius: 4,
                              border: '1px solid var(--border)',
                              background: '#fff',
                              color: 'var(--ink)',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                            title="Designar auditor/ingeniero encargado de evaluar este lead TDR"
                          >
                            <option value="">👤 Designar Consultor...</option>
                            {staffList.map((m) => (
                              <option key={m.id} value={m.id}>
                                👤 {m.full_name || m.email} ({m.role ? m.role.toUpperCase() : 'STAFF'})
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <span
                          style={{
                            fontFamily: "'IBM Plex Mono', monospace",
                            fontSize: 11,
                            padding: '2px 8px',
                            borderRadius: 4,
                            background: assignedStaff ? 'rgba(36, 26, 18, 0.05)' : 'rgba(0,0,0,0.03)',
                            color: assignedStaff ? 'var(--ink)' : 'var(--muted)',
                            border: '1px solid var(--border)',
                          }}
                        >
                          👤{' '}
                          {assignedStaff
                            ? `${assignedStaff.full_name || assignedStaff.email} (${assignedStaff.role ? assignedStaff.role.toUpperCase() : 'STAFF'})`
                            : 'Sin asignar'}
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
                  <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: 'var(--ink)', whiteSpace: 'pre-line' }}>{lead.message}</p>
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

                    {/* Botón Convertir en Proyecto (Solo Admin) */}
                    {isAdmin ? (
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
                    ) : (
                      <span
                        style={{
                          fontSize: 11,
                          fontFamily: "'IBM Plex Mono', monospace",
                          color: 'var(--muted)',
                        }}
                      >
                        🔒 Solo Admin puede convertir a proyecto
                      </span>
                    )}
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
