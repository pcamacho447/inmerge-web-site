export const METHODOLOGY_PHASE_PRESETS = [
  { id: '01', order: 1, label: 'Fase 01 — Auditoría & Diagnóstico Inicial', template: 'Fase 01 — Auditoría & Diagnóstico Inicial' },
  { id: '02', order: 2, label: 'Fase 02 — Arquitectura & Diseño de Solución', template: 'Fase 02 — Arquitectura & Diseño de Solución' },
  { id: '03', order: 3, label: 'Fase 03 — Ingeniería, Desarrollo & Modelado', template: 'Fase 03 — Ingeniería, Desarrollo & Modelado' },
  { id: '04', order: 4, label: 'Fase 04 — Validación, Certificación & Despliegue', template: 'Fase 04 — Validación, Certificación & Despliegue' },
  { id: 'custom', order: 1, label: 'Personalizada (Fase a Medida)', template: '' },
];

export default function NewProjectModal({
  clients,
  projects,
  newProj,
  setNewProj,
  handleCreateProject,
  newMilestone,
  setNewMilestone,
  handleAddMilestone,
  newDeliv,
  setNewDeliv,
  delivFile,
  setDelivFile,
  handleUploadDeliverable,
  uploading,
}) {
  const handlePhasePresetChange = (presetId) => {
    const found = METHODOLOGY_PHASE_PRESETS.find((p) => p.id === presetId);
    if (!found) return;

    if (presetId === 'custom') {
      setNewMilestone({
        ...newMilestone,
        phasePreset: 'custom',
      });
    } else {
      setNewMilestone({
        ...newMilestone,
        phasePreset: found.id,
        orderIndex: found.order,
        title: found.template,
      });
    }
  };
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32 }}>
      {/* Form 1: New Project */}
      <div
        style={{
          background: 'var(--cream2)',
          padding: 24,
          borderRadius: 8,
          border: '1px solid var(--border)',
        }}
      >
        <h3 style={{ fontFamily: "'Spectral', serif", fontSize: 20, margin: '0 0 16px', color: 'var(--ink)' }}>
          1. Registrar Nuevo Proyecto
        </h3>
        <form onSubmit={handleCreateProject} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 4 }}>
              Cliente Asignado (Seleccionar Usuario Registrado) *
            </label>
            <select
              value={newProj.clientId}
              onChange={(e) => setNewProj({ ...newProj, clientId: e.target.value })}
              required
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 4,
                border: '1px solid var(--border)',
                fontSize: 13,
                boxSizing: 'border-box',
                background: '#fff',
              }}
            >
              <option value="">-- Seleccionar Cliente ({clients.length} disponibles) --</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name ? `${c.full_name} (${c.email})` : c.email} {c.company ? `— ${c.company}` : ''}
                </option>
              ))}
            </select>
            {clients.length === 0 && (
              <div style={{ fontSize: 11, color: 'var(--terracotta)', marginTop: 4 }}>
                Nota: No hay cuentas de cliente registradas aún. El cliente puede registrarse en /registro.
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 4 }}>
              Nombre del Proyecto / Auditoría *
            </label>
            <input
              type="text"
              placeholder="e.g. Auditoría Integral de Base de Datos y AWS"
              value={newProj.title}
              onChange={(e) => setNewProj({ ...newProj, title: e.target.value })}
              required
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 4,
                border: '1px solid var(--border)',
                fontSize: 13,
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 4 }}>
              Pilar Estratégico *
            </label>
            <select
              value={newProj.pillar}
              onChange={(e) => setNewProj({ ...newProj, pillar: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 4,
                border: '1px solid var(--border)',
                fontSize: 13,
                boxSizing: 'border-box',
              }}
            >
              <option value="auditoria">01. Auditoría Técnica & Datos</option>
              <option value="desarrollo">02. Desarrollo Cloud & AWS</option>
              <option value="datos">03. Datos & IA</option>
              <option value="integral">Solución Integral Multi-pilar</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 4 }}>
              Descripción del Alcance
            </label>
            <textarea
              rows={4}
              placeholder="Objetivos técnicos, infraestructura evaluada y entregables acordados..."
              value={newProj.description}
              onChange={(e) => setNewProj({ ...newProj, description: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 4,
                border: '1px solid var(--border)',
                fontSize: 13,
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 4 }}>
              Fecha Estimada de Entrega
            </label>
            <input
              type="date"
              value={newProj.targetCompletionDate}
              onChange={(e) => setNewProj({ ...newProj, targetCompletionDate: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 4,
                border: '1px solid var(--border)',
                fontSize: 13,
                boxSizing: 'border-box',
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              background: 'var(--terracotta)',
              color: '#fff',
              border: 'none',
              borderRadius: 20,
              padding: '10px 20px',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              marginTop: 8,
            }}
          >
            Guardar Proyecto
          </button>
        </form>
      </div>

      {/* Form 2: Add Milestone & Upload Deliverable */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Milestone Form */}
        <div
          style={{
            background: 'var(--cream2)',
            padding: 24,
            borderRadius: 8,
            border: '1px solid var(--border)',
          }}
        >
          <h3 style={{ fontFamily: "'Spectral', serif", fontSize: 20, margin: '0 0 16px', color: 'var(--ink)' }}>
            2. Agregar Hito a Proyecto
          </h3>
          <form onSubmit={handleAddMilestone} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 4 }}>
                Seleccionar Proyecto *
              </label>
              <select
                value={newMilestone.projectId}
                onChange={(e) => setNewMilestone({ ...newMilestone, projectId: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 4,
                  border: '1px solid var(--border)',
                  fontSize: 13,
                  boxSizing: 'border-box',
                }}
              >
                <option value="">-- Seleccionar Proyecto --</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 4 }}>
                  Fase del Proyecto (Método Inmerge)
                </label>
                <select
                  value={newMilestone.phasePreset || '01'}
                  onChange={(e) => handlePhasePresetChange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 4,
                    border: '1px solid var(--border)',
                    fontSize: 13,
                    boxSizing: 'border-box',
                    background: '#fff',
                  }}
                >
                  {METHODOLOGY_PHASE_PRESETS.map((ph) => (
                    <option key={ph.id} value={ph.id}>
                      {ph.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 4 }}>
                  Nº de Fase *
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={newMilestone.orderIndex || 1}
                  onChange={(e) => setNewMilestone({ ...newMilestone, orderIndex: parseInt(e.target.value, 10) || 1 })}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 4,
                    border: '1px solid var(--border)',
                    fontSize: 13,
                    boxSizing: 'border-box',
                    fontFamily: "'IBM Plex Mono', monospace",
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 4 }}>
                Título del Hito *
              </label>
              <input
                type="text"
                placeholder="e.g. Fase 02 — Arquitectura Cloud & Especificación Técnica"
                value={newMilestone.title}
                onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 4,
                  border: '1px solid var(--border)',
                  fontSize: 13,
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 4 }}>
                Fecha Límite
              </label>
              <input
                type="date"
                value={newMilestone.dueDate}
                onChange={(e) => setNewMilestone({ ...newMilestone, dueDate: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 4,
                  border: '1px solid var(--border)',
                  fontSize: 13,
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                background: 'var(--ink)',
                color: '#fff',
                border: 'none',
                borderRadius: 20,
                padding: '9px 18px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              + Añadir Hito
            </button>
          </form>
        </div>

        {/* Deliverable Form */}
        <div
          style={{
            background: 'var(--cream2)',
            padding: 24,
            borderRadius: 8,
            border: '1px solid var(--border)',
          }}
        >
          <h3 style={{ fontFamily: "'Spectral', serif", fontSize: 20, margin: '0 0 16px', color: 'var(--ink)' }}>
            3. Publicar Entregable / Informe Técnico
          </h3>
          <form onSubmit={handleUploadDeliverable} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 4 }}>
                Proyecto Destino *
              </label>
              <select
                value={newDeliv.projectId}
                onChange={(e) => setNewDeliv({ ...newDeliv, projectId: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 4,
                  border: '1px solid var(--border)',
                  fontSize: 13,
                  boxSizing: 'border-box',
                }}
              >
                <option value="">-- Seleccionar Proyecto --</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 4 }}>
                Nombre del Entregable *
              </label>
              <input
                type="text"
                placeholder="e.g. Informe_Auditoria_Arquitectura_Cloud_v1.0.pdf"
                value={newDeliv.title}
                onChange={(e) => setNewDeliv({ ...newDeliv, title: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 4,
                  border: '1px solid var(--border)',
                  fontSize: 13,
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 4 }}>
                  Tipo
                </label>
                <select
                  value={newDeliv.fileType}
                  onChange={(e) => setNewDeliv({ ...newDeliv, fileType: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 4,
                    border: '1px solid var(--border)',
                    fontSize: 13,
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="PDF">PDF / Informe Técnico</option>
                  <option value="DASHBOARD_URL">Dashboard BI URL</option>
                  <option value="REPO">Repositorio Git</option>
                  <option value="DATASET">Dataset / CSV</option>
                  <option value="DOCUMENTO">Documento Técnico</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 4 }}>
                  Versión
                </label>
                <input
                  type="text"
                  value={newDeliv.version}
                  onChange={(e) => setNewDeliv({ ...newDeliv, version: e.target.value })}
                  placeholder="v1.0"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 4,
                    border: '1px solid var(--border)',
                    fontSize: 13,
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {newDeliv.fileType === 'PDF' || newDeliv.fileType === 'DATASET' || newDeliv.fileType === 'DOCUMENTO' ? (
              <div>
                <label style={{ display: 'block', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 4 }}>
                  Subir Archivo a Storage Seguro
                </label>
                <input
                  type="file"
                  onChange={(e) => setDelivFile(e.target.files?.[0] || null)}
                  style={{
                    width: '100%',
                    padding: '6px',
                    fontSize: 12,
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            ) : (
              <div>
                <label style={{ display: 'block', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 4 }}>
                  URL Externa (Dashboard / Repositorio)
                </label>
                <input
                  type="url"
                  placeholder="https://lookerstudio.google.com/..."
                  value={newDeliv.externalUrl}
                  onChange={(e) => setNewDeliv({ ...newDeliv, externalUrl: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 4,
                    border: '1px solid var(--border)',
                    fontSize: 13,
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={uploading}
              style={{
                background: 'var(--terracotta)',
                color: '#fff',
                border: 'none',
                borderRadius: 20,
                padding: '10px 20px',
                fontSize: 14,
                fontWeight: 600,
                cursor: uploading ? 'not-allowed' : 'pointer',
                opacity: uploading ? 0.7 : 1,
              }}
            >
              {uploading ? 'Subiendo archivo...' : 'Publicar Entregable'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
