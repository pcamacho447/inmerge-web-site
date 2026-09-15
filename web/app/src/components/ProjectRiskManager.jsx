import React, { useState } from 'react';
import { RISK_SEVERITY_CONFIG, RISK_STATUS_CONFIG, sanitizeRiskPayload } from '../lib/pm.js';

/**
 * ProjectRiskManager - Gestión de Riesgos, Bloqueos e Impedimentos Técnicos
 * Para el Panel de Consultores & Tech Leads (/equipo)
 */
export default function ProjectRiskManager({
  projectId,
  milestones = [],
  risks = [],
  onRiskCreated,
  onRiskUpdated,
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'MEDIA',
    milestone_id: '',
    impact: '',
    mitigation_plan: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleCreateRisk = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);
    try {
      const sanitized = sanitizeRiskPayload({
        ...formData,
        project_id: projectId,
        status: 'ABIERTO',
      });

      if (onRiskCreated) {
        await onRiskCreated(sanitized);
      }
      setIsAdding(false);
      setFormData({
        title: '',
        description: '',
        severity: 'MEDIA',
        milestone_id: '',
        impact: '',
        mitigation_plan: '',
      });
    } catch (err) {
      setErrorMsg(err.message || 'Error al registrar riesgo/bloqueo');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (risk, newStatus) => {
    try {
      if (onRiskUpdated) {
        await onRiskUpdated(risk.id, {
          status: newStatus,
          resolved_at: newStatus === 'RESUELTO' ? new Date().toISOString() : null,
        });
      }
    } catch (err) {
      console.error('Error al actualizar riesgo:', err);
    }
  };

  const activeRisks = (risks || []).filter((r) => r.status !== 'RESUELTO');
  const resolvedRisks = (risks || []).filter((r) => r.status === 'RESUELTO');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Cabecera y Botón Nuevo Bloqueo */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          padding: '12px 16px',
          background: 'var(--bg)',
          border: '1px solid var(--border)',
        }}
      >
        <div>
          <h4 style={{ fontFamily: "'Spectral', serif", fontSize: 16, margin: 0, color: 'var(--ink)' }}>
            Matriz de Riesgos & Bloqueos Técnicos
          </h4>
          <span style={{ fontSize: 12, color: 'var(--muted)', fontFamily: "'IBM Plex Mono', monospace" }}>
            {activeRisks.length} bloqueo(s) activo(s) • {resolvedRisks.length} resuelto(s)
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsAdding(!isAdding)}
          style={{
            padding: '6px 14px',
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 12,
            background: isAdding ? 'var(--muted)' : 'var(--terracotta)',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          {isAdding ? '✕ Cancelar' : '+ Reportar Bloqueo'}
        </button>
      </div>

      {/* Formulario de Registro de Bloqueo */}
      {isAdding && (
        <form
          onSubmit={handleCreateRisk}
          style={{
            padding: 16,
            background: 'var(--cream2)',
            border: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          {errorMsg && (
            <div style={{ color: 'var(--terracotta)', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace" }}>
              {errorMsg}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: 'var(--ink)', marginBottom: 4 }}>
                Título del Bloqueo / Riesgo *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Falta de credenciales IAM para AWS RDS"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  color: 'var(--ink)',
                  fontSize: 13,
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: 'var(--ink)', marginBottom: 4 }}>
                Severidad
              </label>
              <select
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  color: 'var(--ink)',
                  fontSize: 13,
                }}
              >
                {Object.values(RISK_SEVERITY_CONFIG).map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label} ({s.key})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: 'var(--ink)', marginBottom: 4 }}>
                Hito Afectado
              </label>
              <select
                value={formData.milestone_id}
                onChange={(e) => setFormData({ ...formData, milestone_id: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  color: 'var(--ink)',
                  fontSize: 13,
                }}
              >
                <option value="">(Todo el proyecto)</option>
                {milestones.map((m, idx) => (
                  <option key={m.id || idx} value={m.id}>
                    Fase {m.order_index || idx + 1}: {m.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: 'var(--ink)', marginBottom: 4 }}>
                Impacto Estimado
              </label>
              <input
                type="text"
                placeholder="Ej. Retraso de 3 días en la fase de ingesta"
                value={formData.impact}
                onChange={(e) => setFormData({ ...formData, impact: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  color: 'var(--ink)',
                  fontSize: 13,
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: 'var(--ink)', marginBottom: 4 }}>
                Plan de Mitigación / Acción
              </label>
              <input
                type="text"
                placeholder="Ej. Coordinar sesión técnica con el equipo de TI del cliente"
                value={formData.mitigation_plan}
                onChange={(e) => setFormData({ ...formData, mitigation_plan: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  color: 'var(--ink)',
                  fontSize: 13,
                }}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '8px 16px',
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 12,
                background: 'var(--terracotta)',
                color: '#fff',
                border: 'none',
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontWeight: 700,
              }}
            >
              {submitting ? 'Registrando...' : 'Registrar Bloqueo'}
            </button>
          </div>
        </form>
      )}

      {/* Lista de Riesgos y Bloqueos */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {risks.length === 0 ? (
          <div
            style={{
              padding: 20,
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              fontSize: 13,
              color: 'var(--muted)',
              textAlign: 'center',
            }}
          >
            ✓ No hay riesgos ni bloqueos registrados para este proyecto.
          </div>
        ) : (
          risks.map((risk) => {
            const sevCfg = RISK_SEVERITY_CONFIG[risk.severity] || RISK_SEVERITY_CONFIG.MEDIA;
            const isResolved = risk.status === 'RESUELTO';

            return (
              <div
                key={risk.id}
                style={{
                  padding: '14px 16px',
                  background: isResolved ? 'rgba(74, 156, 106, 0.04)' : 'var(--bg)',
                  border: `1px solid ${isResolved ? 'var(--green)' : 'var(--border)'}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: 12,
                }}
              >
                <div style={{ flex: 1, minWidth: 220 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 10,
                        fontWeight: 700,
                        color: sevCfg.color,
                        background: sevCfg.bg,
                        padding: '2px 6px',
                        border: `1px solid ${sevCfg.color}`,
                      }}
                    >
                      {sevCfg.label.toUpperCase()}
                    </span>
                    <span
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 11,
                        color: isResolved ? 'var(--green)' : 'var(--terracotta)',
                        fontWeight: 600,
                      }}
                    >
                      {isResolved ? '✓ Resuelto' : '⚠️ ' + risk.status}
                    </span>
                  </div>

                  <strong style={{ fontSize: 14, color: 'var(--ink)' }}>{risk.title}</strong>
                  {risk.description && (
                    <p style={{ fontSize: 12, color: 'var(--muted)', margin: '4px 0' }}>{risk.description}</p>
                  )}
                  {risk.impact && (
                    <div style={{ fontSize: 12, color: 'var(--terracotta)', marginTop: 4 }}>
                      <strong>Impacto:</strong> {risk.impact}
                    </div>
                  )}
                  {risk.mitigation_plan && (
                    <div style={{ fontSize: 12, color: 'var(--ink)', marginTop: 2 }}>
                      <strong>Mitigación:</strong> {risk.mitigation_plan}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <select
                    value={risk.status}
                    onChange={(e) => handleStatusChange(risk, e.target.value)}
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 11,
                      fontWeight: 600,
                      color: 'var(--ink)',
                      background: 'var(--bg)',
                      border: '1px solid var(--border)',
                      padding: '4px 8px',
                      cursor: 'pointer',
                    }}
                  >
                    {Object.values(RISK_STATUS_CONFIG).map((st) => (
                      <option key={st.key} value={st.key}>
                        {st.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
