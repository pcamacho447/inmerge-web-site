import { useState, useEffect } from 'react';
import { FINDING_SEVERITY_CONFIG, FINDING_CATEGORY_CONFIG, FINDING_STATUS_CONFIG, sanitizeFindingPayload } from '../../lib/pm.js';
import { fetchProjectFindings, createProjectFinding, updateProjectFinding, deleteProjectFinding } from '../../lib/team.js';

/**
 * ProjectAuditFindings — Matriz Forense de Hallazgos Técnicos de Auditoría
 * Soporta filtrado por severidad/estado, registro in-situ y exportación a Markdown.
 */
export default function ProjectAuditFindings({
  findings: propFindings,
  projectId,
  projectTitle = 'Auditoría Técnica',
  milestones = [],
  onFindingCreated,
  onFindingUpdated,
  onFindingDeleted,
  showToast,
}) {
  const [findings, setFindings] = useState(propFindings || []);
  const [loading, setLoading] = useState(false);
  const [severityFilter, setSeverityFilter] = useState('TODAS');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [copyStatus, setCopyStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    finding_code: '',
    title: '',
    category: 'CORE_WEB_VITALS',
    severity: 'MEDIA',
    status: 'DETECTADO',
    milestone_id: '',
    evidence_notes: '',
    recommendation: '',
  });

  // Sincronizar propFindings o cargar de Supabase
  useEffect(() => {
    if (propFindings !== undefined) {
      setFindings(propFindings);
    } else if (projectId) {
      setLoading(true);
      fetchProjectFindings(projectId)
        .then((data) => setFindings(data || []))
        .catch((err) => {
          console.warn('Error al cargar hallazgos:', err);
        })
        .finally(() => setLoading(false));
    }
  }, [propFindings, projectId]);

  // Métricas rápidas
  const totalFindings = findings.length;
  const criticalOpen = findings.filter((f) => (f.severity === 'CRITICA' || f.severity === 'ALTA') && f.status !== 'VERIFICADO').length;
  const resolvedCount = findings.filter((f) => f.status === 'VERIFICADO').length;

  // Filtrado
  const filteredFindings = findings.filter((f) => {
    const matchesSeverity = severityFilter === 'TODAS' || f.severity === severityFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      (f.finding_code || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.evidence_notes || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  // Manejo de envío de nuevo hallazgo
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSubmitting(true);

    try {
      const sanitized = sanitizeFindingPayload({
        ...formData,
        project_id: projectId,
        milestone_id: formData.milestone_id || null,
      });

      if (onFindingCreated) {
        await onFindingCreated(sanitized);
      } else {
        const created = await createProjectFinding(sanitized);
        setFindings((prev) => [created, ...prev]);
      }

      setIsAdding(false);
      setFormData({
        finding_code: '',
        title: '',
        category: 'CORE_WEB_VITALS',
        severity: 'MEDIA',
        status: 'DETECTADO',
        milestone_id: '',
        evidence_notes: '',
        recommendation: '',
      });

      if (showToast) {
        showToast({
          type: 'success',
          title: 'Hallazgo Registrado',
          message: `Código ${sanitized.finding_code} incorporado a la matriz de auditoría.`,
        });
      }
    } catch (err) {
      setErrorMessage(err.message || 'Error al registrar el hallazgo técnico.');
    } finally {
      setSubmitting(false);
    }
  };

  // Manejo de actualización de estado
  const handleStatusChange = async (finding, newStatus) => {
    try {
      if (onFindingUpdated) {
        await onFindingUpdated(finding.id, { status: newStatus });
      } else {
        const updated = await updateProjectFinding(finding.id, { status: newStatus });
        setFindings((prev) => prev.map((f) => (f.id === finding.id ? updated : f)));
      }

      if (showToast) {
        showToast({
          type: 'success',
          title: 'Estado Actualizado',
          message: `${finding.finding_code} ahora está en estado ${FINDING_STATUS_CONFIG[newStatus]?.label || newStatus}.`,
        });
      }
    } catch (err) {
      setErrorMessage(err.message || 'Error al actualizar estado del hallazgo.');
    }
  };

  // Manejo de eliminación
  const handleDelete = async (findingId) => {
    try {
      if (onFindingDeleted) {
        await onFindingDeleted(findingId);
      } else {
        await deleteProjectFinding(findingId);
        setFindings((prev) => prev.filter((f) => f.id !== findingId));
      }
    } catch (err) {
      setErrorMessage(err.message || 'Error al eliminar hallazgo.');
    }
  };

  // Generador de informe estructurado Markdown
  const handleExportMarkdown = async () => {
    const lines = [
      `# Informe de Auditoría Técnica — ${projectTitle}`,
      `*Inmerge Software Engineering & Data Science*  `,
      `*Fecha de emisión:* ${new Date().toLocaleDateString('es-PE')}  `,
      `*Total de hallazgos:* ${totalFindings} | *Críticos/Altos abiertos:* ${criticalOpen} | *Verificados:* ${resolvedCount}`,
      '',
      '---',
      '',
      '## Matriz Detallada de Hallazgos',
      '',
    ];

    if (findings.length === 0) {
      lines.push('No se han registrado hallazgos técnicos en este proyecto.');
    } else {
      findings.forEach((f, idx) => {
        const sev = FINDING_SEVERITY_CONFIG[f.severity]?.label || f.severity;
        const cat = FINDING_CATEGORY_CONFIG[f.category]?.label || f.category;
        const st = FINDING_STATUS_CONFIG[f.status]?.label || f.status;

        lines.push(`### ${idx + 1}. [${f.finding_code || 'FIND'}] ${f.title}`);
        lines.push(`- **Severidad:** ${sev}`);
        lines.push(`- **Categoría:** ${cat}`);
        lines.push(`- **Estado:** ${st}`);
        if (f.evidence_notes) {
          lines.push(`- **Evidencia Técnica:**  \n  ${f.evidence_notes}`);
        }
        if (f.recommendation) {
          lines.push(`- **Recomendación de Mitigación:**  \n  ${f.recommendation}`);
        }
        lines.push('');
      });
    }

    const reportMarkdown = lines.join('\n');

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(reportMarkdown);
        setCopyStatus('¡Informe Markdown copiado al portapapeles!');
        setTimeout(() => setCopyStatus(null), 3500);
      }
    } catch (err) {
      console.warn('Error al copiar al portapapeles:', err);
      setCopyStatus('Error al copiar informe.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Encabezado con Métricas Rápidas & Acciones */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          padding: '14px 18px',
          background: 'var(--cream2)',
          border: '1px solid var(--border)',
          borderRadius: 4,
        }}
      >
        <div>
          <h4
            style={{
              fontFamily: "'Space Grotesk', var(--font-display), sans-serif",
              fontSize: 16,
              fontWeight: 700,
              margin: '0 0 4px',
              color: 'var(--ink)',
            }}
          >
            🔍 Matriz Forense de Hallazgos Técnicos
          </h4>
          <div
            style={{
              display: 'flex',
              gap: 12,
              fontFamily: "'Space Mono', var(--font-mono), monospace",
              fontSize: 11,
              color: 'var(--muted)',
            }}
          >
            <span>
              Total: <strong>{totalFindings}</strong>
            </span>
            <span>•</span>
            <span style={{ color: criticalOpen > 0 ? 'var(--terracotta)' : 'inherit' }}>
              Críticos Abiertos: <strong>{criticalOpen}</strong>
            </span>
            <span>•</span>
            <span style={{ color: 'var(--green, #4A9C6A)' }}>
              Verificados / Resueltos: <strong>{resolvedCount}</strong>
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleExportMarkdown}
            style={{
              padding: '6px 12px',
              fontFamily: "'Space Mono', var(--font-mono), monospace",
              fontSize: 11,
              fontWeight: 600,
              background: '#fff',
              color: 'var(--ink)',
              border: '1px solid var(--border)',
              borderRadius: 3,
              cursor: 'pointer',
            }}
          >
            📋 Copiar Informe Markdown
          </button>

          <button
            type="button"
            onClick={() => setIsAdding(!isAdding)}
            style={{
              padding: '6px 14px',
              fontFamily: "'Space Mono', var(--font-mono), monospace",
              fontSize: 11,
              fontWeight: 600,
              background: isAdding ? 'var(--muted)' : 'var(--terracotta)',
              color: '#fff',
              border: 'none',
              borderRadius: 3,
              cursor: 'pointer',
            }}
          >
            {isAdding ? '✕ Cancelar' : '+ Registrar Hallazgo'}
          </button>
        </div>
      </div>

      {copyStatus && (
        <div
          role="status"
          style={{
            padding: '8px 14px',
            background: 'rgba(74, 156, 106, 0.15)',
            border: '1px solid var(--green, #4A9C6A)',
            color: 'var(--ink)',
            fontFamily: "'Space Mono', var(--font-mono), monospace",
            fontSize: 12,
            borderRadius: 3,
          }}
        >
          ✓ {copyStatus}
        </div>
      )}

      {errorMessage && (
        <div
          role="alert"
          style={{
            padding: '8px 14px',
            background: 'rgba(168, 71, 43, 0.15)',
            border: '1px solid var(--terracotta)',
            color: 'var(--terracotta)',
            fontFamily: "'Space Mono', var(--font-mono), monospace",
            fontSize: 12,
            borderRadius: 3,
          }}
        >
          ⚠️ {errorMessage}
        </div>
      )}

      {/* Formulario de Alta de Hallazgo */}
      {isAdding && (
        <form
          onSubmit={handleSubmit}
          style={{
            padding: 16,
            background: '#fff',
            border: '1px solid var(--border)',
            borderRadius: 4,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 13, fontFamily: "'Space Mono', var(--font-mono), monospace" }}>
            Nuevo Hallazgo Técnico Forense
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
            <div>
              <label
                htmlFor="finding-title"
                style={{ display: 'block', fontSize: 11, fontFamily: "'Space Mono', var(--font-mono), monospace", marginBottom: 4 }}
              >
                Título del Hallazgo *
              </label>
              <input
                id="finding-title"
                type="text"
                required
                placeholder="Ej. LCP superior a 4.2s en catálogo"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  border: '1px solid var(--border)',
                  borderRadius: 3,
                  fontSize: 12,
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label
                htmlFor="finding-code"
                style={{ display: 'block', fontSize: 11, fontFamily: "'Space Mono', var(--font-mono), monospace", marginBottom: 4 }}
              >
                Código del Hallazgo (Opcional)
              </label>
              <input
                id="finding-code"
                type="text"
                placeholder="Ej. FIND-CWV-01"
                value={formData.finding_code}
                onChange={(e) => setFormData({ ...formData, finding_code: e.target.value })}
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  border: '1px solid var(--border)',
                  borderRadius: 3,
                  fontSize: 12,
                  boxSizing: 'border-box',
                  fontFamily: "'Space Mono', var(--font-mono), monospace",
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            <div>
              <label
                htmlFor="finding-category"
                style={{ display: 'block', fontSize: 11, fontFamily: "'Space Mono', var(--font-mono), monospace", marginBottom: 4 }}
              >
                Categoría *
              </label>
              <select
                id="finding-category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  border: '1px solid var(--border)',
                  borderRadius: 3,
                  fontSize: 12,
                  boxSizing: 'border-box',
                }}
              >
                {Object.entries(FINDING_CATEGORY_CONFIG).map(([key, cfg]) => (
                  <option key={key} value={key}>
                    {cfg.icon} {cfg.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="finding-severity"
                style={{ display: 'block', fontSize: 11, fontFamily: "'Space Mono', var(--font-mono), monospace", marginBottom: 4 }}
              >
                Severidad *
              </label>
              <select
                id="finding-severity"
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  border: '1px solid var(--border)',
                  borderRadius: 3,
                  fontSize: 12,
                  boxSizing: 'border-box',
                }}
              >
                {Object.entries(FINDING_SEVERITY_CONFIG).map(([key, cfg]) => (
                  <option key={key} value={key}>
                    {cfg.label}
                  </option>
                ))}
              </select>
            </div>

            {milestones.length > 0 && (
              <div>
                <label
                  htmlFor="finding-milestone"
                  style={{ display: 'block', fontSize: 11, fontFamily: "'Space Mono', var(--font-mono), monospace", marginBottom: 4 }}
                >
                  Hito Asociado
                </label>
                <select
                  id="finding-milestone"
                  value={formData.milestone_id}
                  onChange={(e) => setFormData({ ...formData, milestone_id: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    border: '1px solid var(--border)',
                    borderRadius: 3,
                    fontSize: 12,
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="">(Sin hito específico)</option>
                  {milestones.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="finding-evidence"
              style={{ display: 'block', fontSize: 11, fontFamily: "'Space Mono', var(--font-mono), monospace", marginBottom: 4 }}
            >
              Notas de Evidencia / Telemetría
            </label>
            <textarea
              id="finding-evidence"
              rows={2}
              placeholder="Logs, URLs, mediciones de Lighthouse, trazas de query..."
              value={formData.evidence_notes}
              onChange={(e) => setFormData({ ...formData, evidence_notes: e.target.value })}
              style={{
                width: '100%',
                padding: '7px 10px',
                border: '1px solid var(--border)',
                borderRadius: 3,
                fontSize: 12,
                boxSizing: 'border-box',
                fontFamily: 'inherit',
              }}
            />
          </div>

          <div>
            <label
              htmlFor="finding-recommendation"
              style={{ display: 'block', fontSize: 11, fontFamily: "'Space Mono', var(--font-mono), monospace", marginBottom: 4 }}
            >
              Recomendación de Mitigación
            </label>
            <textarea
              id="finding-recommendation"
              rows={2}
              placeholder="Acción correctiva sugerida por el equipo de ingeniería..."
              value={formData.recommendation}
              onChange={(e) => setFormData({ ...formData, recommendation: e.target.value })}
              style={{
                width: '100%',
                padding: '7px 10px',
                border: '1px solid var(--border)',
                borderRadius: 3,
                fontSize: 12,
                boxSizing: 'border-box',
                fontFamily: 'inherit',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              style={{
                padding: '6px 12px',
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: 3,
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '6px 16px',
                background: 'var(--terracotta)',
                color: '#fff',
                border: 'none',
                borderRadius: 3,
                fontSize: 12,
                fontWeight: 600,
                cursor: submitting ? 'wait' : 'pointer',
              }}
            >
              {submitting ? 'Guardando...' : 'Guardar Hallazgo'}
            </button>
          </div>
        </form>
      )}

      {/* Barra de Filtros & Búsqueda */}
      {!isAdding && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 10,
            background: 'var(--bg)',
            padding: '8px 12px',
            border: '1px solid var(--border)',
            borderRadius: 4,
          }}
        >
          <div style={{ flex: '1 1 200px' }}>
            <input
              type="search"
              aria-label="Buscar por código o título"
              placeholder="Buscar por código o título..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                maxWidth: 320,
                padding: '6px 10px',
                fontSize: 12,
                border: '1px solid var(--border)',
                borderRadius: 3,
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label
              htmlFor="filter-severity"
              style={{ fontSize: 11, fontFamily: "'Space Mono', var(--font-mono), monospace", color: 'var(--muted)' }}
            >
              Filtrar por severidad:
            </label>
            <select
              id="filter-severity"
              aria-label="Filtrar por severidad"
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              style={{
                padding: '5px 10px',
                fontSize: 11,
                fontFamily: "'Space Mono', var(--font-mono), monospace",
                border: '1px solid var(--border)',
                borderRadius: 3,
                background: '#fff',
                color: 'var(--ink)',
                cursor: 'pointer',
              }}
            >
              <option value="TODAS">Todas las severidades</option>
              {Object.entries(FINDING_SEVERITY_CONFIG).map(([key, cfg]) => (
                <option key={key} value={key}>
                  [{cfg.badge || key}] {cfg.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Lista de Hallazgos */}
      {loading ? (
        <div style={{ padding: 24, textAlign: 'center', color: 'var(--muted)', fontSize: 12 }}>Cargando matriz forense de hallazgos...</div>
      ) : filteredFindings.length === 0 ? (
        <div
          style={{
            padding: 32,
            textAlign: 'center',
            background: 'var(--cream2)',
            border: '1px dashed var(--border)',
            borderRadius: 4,
            color: 'var(--muted)',
            fontSize: 12,
          }}
        >
          No se registran hallazgos técnicos para los filtros seleccionados.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filteredFindings.map((finding) => {
            const sev = FINDING_SEVERITY_CONFIG[finding.severity] || FINDING_SEVERITY_CONFIG.MEDIA;
            const cat = FINDING_CATEGORY_CONFIG[finding.category] || FINDING_CATEGORY_CONFIG.CORE_WEB_VITALS;
            const stat = FINDING_STATUS_CONFIG[finding.status] || FINDING_STATUS_CONFIG.DETECTADO;

            return (
              <div
                key={finding.id}
                style={{
                  padding: 14,
                  background: '#fff',
                  border: '1px solid var(--border)',
                  borderLeft: `4px solid ${sev.color}`,
                  borderRadius: 4,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                {/* Fila Superior: Código, Categoría, Severidad, Estado */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontFamily: "'Space Mono', var(--font-mono), monospace",
                        fontSize: 12,
                        fontWeight: 700,
                        color: 'var(--ink)',
                        background: 'var(--cream2)',
                        padding: '2px 6px',
                        borderRadius: 3,
                        border: '1px solid var(--border)',
                      }}
                    >
                      {finding.finding_code}
                    </span>

                    <span
                      style={{
                        fontSize: 11,
                        color: 'var(--muted)',
                        background: 'rgba(0,0,0,0.04)',
                        padding: '2px 8px',
                        borderRadius: 12,
                      }}
                    >
                      {cat.icon} {cat.label}
                    </span>

                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: sev.color,
                        background: sev.bg,
                        padding: '2px 8px',
                        borderRadius: 12,
                        border: `1px solid ${sev.color}33`,
                      }}
                    >
                      {sev.label}
                    </span>
                  </div>

                  {/* Selector de Estado Accesible */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <label
                      htmlFor={`status-${finding.id}`}
                      style={{
                        fontSize: 11,
                        fontFamily: "'Space Mono', var(--font-mono), monospace",
                        color: 'var(--muted)',
                      }}
                    >
                      Estado:
                    </label>
                    <select
                      id={`status-${finding.id}`}
                      aria-label={`Cambiar estado para ${finding.finding_code}`}
                      value={finding.status}
                      onChange={(e) => handleStatusChange(finding, e.target.value)}
                      style={{
                        padding: '3px 8px',
                        fontSize: 11,
                        fontFamily: "'Space Mono', var(--font-mono), monospace",
                        fontWeight: 600,
                        borderRadius: 3,
                        border: '1px solid var(--border)',
                        background: stat.bg,
                        color: stat.color,
                        cursor: 'pointer',
                      }}
                    >
                      {Object.entries(FINDING_STATUS_CONFIG).map(([key, cfg]) => (
                        <option key={key} value={key}>
                          {cfg.label}
                        </option>
                      ))}
                    </select>

                    {onFindingDeleted && (
                      <button
                        type="button"
                        aria-label={`Eliminar ${finding.finding_code}`}
                        onClick={() => handleDelete(finding.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--muted)',
                          cursor: 'pointer',
                          fontSize: 12,
                          padding: '2px 4px',
                        }}
                        title="Eliminar hallazgo"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>

                {/* Título */}
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{finding.title}</div>

                {/* Detalles Plegables: Evidencia & Recomendación */}
                {(finding.evidence_notes || finding.recommendation) && (
                  <details style={{ fontSize: 12, color: 'var(--ink)', marginTop: 4 }}>
                    <summary
                      style={{
                        cursor: 'pointer',
                        color: 'var(--terracotta)',
                        fontWeight: 500,
                        fontFamily: "'Space Mono', var(--font-mono), monospace",
                        fontSize: 11,
                      }}
                    >
                      Ver Evidencia Forense & Recomendación ▾
                    </summary>
                    <div
                      style={{
                        padding: '10px 12px',
                        marginTop: 6,
                        background: 'var(--bg)',
                        border: '1px solid var(--border)',
                        borderRadius: 3,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                      }}
                    >
                      {finding.evidence_notes && (
                        <div>
                          <strong style={{ fontSize: 11, fontFamily: "'Space Mono', var(--font-mono), monospace" }}>
                            Evidencia Técnica:
                          </strong>
                          <div style={{ color: 'var(--muted)', marginTop: 2, whiteSpace: 'pre-wrap' }}>{finding.evidence_notes}</div>
                        </div>
                      )}
                      {finding.recommendation && (
                        <div>
                          <strong style={{ fontSize: 11, fontFamily: "'Space Mono', var(--font-mono), monospace" }}>
                            Recomendación de Mitigación:
                          </strong>
                          <div style={{ color: 'var(--ink)', marginTop: 2, whiteSpace: 'pre-wrap' }}>{finding.recommendation}</div>
                        </div>
                      )}
                    </div>
                  </details>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
