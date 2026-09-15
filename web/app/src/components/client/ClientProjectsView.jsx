import ProjectGantt from '../ProjectGantt.jsx';
import ProjectTimeline from '../ProjectTimeline.jsx';
import { calculateProjectProgress, HEALTH_STATUS_CONFIG } from '../../lib/pm.js';

export const PILLAR_LABELS = {
  auditoria: '01. Auditoría Técnica & Datos',
  desarrollo: '02. Desarrollo Cloud & AWS',
  datos: '03. Datos & IA',
  integral: 'Solución Integral',
};

export const DELIVERABLE_TYPE_BADGES = {
  PDF: { label: 'PDF / INFORME', bg: 'rgba(168, 71, 43, 0.1)', text: 'var(--terracotta)', border: 'var(--terracotta)' },
  DASHBOARD_URL: { label: 'DASHBOARD BI', bg: 'rgba(216, 168, 78, 0.15)', text: '#9B7322', border: 'var(--gold)' },
  REPO: { label: 'REPOSITORIO GIT', bg: 'rgba(36, 26, 18, 0.08)', text: 'var(--ink)', border: 'var(--border)' },
  DATASET: { label: 'DATASET / CSV', bg: 'rgba(46, 117, 89, 0.12)', text: '#2E7559', border: '#2E7559' },
  DOCUMENTO: { label: 'DOCUMENTO', bg: 'rgba(0,0,0,0.05)', text: 'var(--muted)', border: 'var(--border)' },
};

export default function ClientProjectsView({
  projects,
  loading,
  error,
  downloadingId,
  onDownloadDeliverable,
}) {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>
        <p>Cargando información técnica de tus proyectos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: '16px 20px',
          borderRadius: 8,
          background: 'rgba(168, 71, 43, 0.1)',
          border: '1px solid var(--terracotta)',
          color: 'var(--terracotta)',
          marginBottom: 24,
        }}
      >
        ⚠️ Error al sincronizar proyectos: {error}
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div
        style={{
          padding: 48,
          textAlign: 'center',
          background: 'var(--cream2)',
          borderRadius: 8,
          border: '1px dashed var(--border)',
        }}
      >
        <h3 style={{ fontFamily: "'Spectral', serif", fontSize: 22, margin: '0 0 12px' }}>
          No tienes proyectos activos asignados
        </h3>
        <p style={{ color: 'var(--muted)', maxWidth: 500, margin: '0 auto 24px', fontSize: 14, lineHeight: 1.6 }}>
          Si ya enviaste una solicitud de cotización o TDR, nuestro equipo técnico habilitará tu cronograma y entregables una vez validado el requerimiento.
        </p>
        <a
          href="/contacto"
          className="btn-accent"
          style={{
            display: 'inline-block',
            background: 'var(--terracotta)',
            color: '#fff',
            padding: '10px 24px',
            borderRadius: 20,
            fontSize: 14,
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Solicitar Nueva Auditoría o Proyecto →
        </a>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {projects.map((proj) => {
        const totalMilestones = proj.milestones?.length || 0;
        const completedMilestones = proj.milestones?.filter((m) => m.status === 'COMPLETADO').length || 0;
        const weightedProgress = calculateProjectProgress(proj.milestones, proj.tasks || []);
        const progressPct =
          proj.progress !== undefined && proj.progress !== null && proj.progress > 0
            ? proj.progress
            : weightedProgress;
        const healthCfg = HEALTH_STATUS_CONFIG[proj.health_status || 'ON_TRACK'] || HEALTH_STATUS_CONFIG.ON_TRACK;

        return (
          <div
            key={proj.id}
            style={{
              background: 'var(--cream2)',
              borderRadius: 8,
              padding: '28px clamp(16px, 4vw, 32px)',
              border: '1px solid var(--border)',
              boxShadow: '0 2px 12px rgba(36,26,18,0.04)',
            }}
          >
            {/* Project Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: 16,
                marginBottom: 20,
                borderBottom: '1px solid var(--border)',
                paddingBottom: 16,
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 11,
                      padding: '3px 10px',
                      borderRadius: 4,
                      background: healthCfg.badgeBg,
                      color: healthCfg.color,
                      border: `1px solid ${healthCfg.color}`,
                      fontWeight: 700,
                    }}
                  >
                    {healthCfg.icon} Salud: {healthCfg.label}
                  </span>
                  <span
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 12,
                      color: 'var(--terracotta)',
                      fontWeight: 600,
                    }}
                  >
                    {PILLAR_LABELS[proj.pillar] || proj.pillar}
                  </span>
                  <span
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 11,
                      color: 'var(--muted)',
                    }}
                  >
                    • Estado: {proj.status}
                  </span>
                </div>

                <h2 style={{ fontFamily: "'Spectral', serif", fontSize: 'clamp(22px, 4vw, 26px)', margin: '0 0 8px', fontWeight: 700 }}>
                  {proj.title}
                </h2>

                {proj.description && (
                  <p style={{ margin: 0, fontSize: 14, color: 'var(--ink)', lineHeight: 1.5, maxWidth: 680 }}>
                    {proj.description}
                  </p>
                )}
              </div>

              {/* Progress Summary Card */}
              <div
                style={{
                  background: 'var(--bg)',
                  padding: '16px 20px',
                  borderRadius: 6,
                  border: '1px solid var(--border)',
                  minWidth: 180,
                }}
              >
                <div style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: 'var(--muted)', marginBottom: 4 }}>
                  PROGRESO PONDERADO
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <strong style={{ fontSize: 28, fontFamily: "'IBM Plex Mono', monospace", color: 'var(--terracotta)' }}>
                    {progressPct}%
                  </strong>
                  <span style={{ fontSize: 12, color: 'var(--muted)', fontFamily: "'IBM Plex Mono', monospace" }}>
                    ({completedMilestones}/{totalMilestones} Hitos)
                  </span>
                </div>
                <div style={{ width: '100%', height: 6, background: 'var(--cream2)', marginTop: 8, borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${progressPct}%`, height: '100%', background: 'var(--terracotta)', transition: 'width 0.4s ease' }} />
                </div>
              </div>
            </div>

            {/* Gantt & Milestones */}
            <div style={{ marginBottom: 28 }}>
              <h3 style={{ fontFamily: "'Spectral', serif", fontSize: 18, margin: '0 0 14px', color: 'var(--ink)' }}>
                Cronograma de Ejecución
              </h3>
              <ProjectGantt
                project={proj}
                milestones={proj.milestones || []}
                tasks={proj.tasks || []}
                showTasks={false}
                isExecutive={true}
              />
            </div>

            {/* Timeline Breakdown */}
            {proj.milestones && proj.milestones.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <ProjectTimeline milestones={proj.milestones} />
              </div>
            )}

            {/* Deliverables List */}
            <div>
              <h3 style={{ fontFamily: "'Spectral', serif", fontSize: 18, margin: '0 0 14px', color: 'var(--ink)' }}>
                Entregables & Documentos Técnicos ({proj.deliverables?.length || 0})
              </h3>
              {proj.deliverables && proj.deliverables.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {proj.deliverables.map((deliv) => {
                    const badge = DELIVERABLE_TYPE_BADGES[deliv.file_type] || DELIVERABLE_TYPE_BADGES.DOCUMENTO;
                    const isDownloading = downloadingId === deliv.id;

                    return (
                      <div
                        key={deliv.id}
                        style={{
                          background: '#fff',
                          borderRadius: 6,
                          padding: '14px 18px',
                          border: '1px solid var(--border)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: 12,
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
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
                            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--muted)' }}>
                              Versión: {deliv.version || 'v1.0'}
                            </span>
                          </div>
                          <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--ink)' }}>{deliv.title}</div>
                          {deliv.notes && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{deliv.notes}</div>}
                        </div>

                        <button
                          type="button"
                          onClick={() => onDownloadDeliverable(deliv)}
                          disabled={isDownloading}
                          className="btn-accent"
                          style={{
                            background: 'var(--terracotta)',
                            color: '#fff',
                            border: 'none',
                            padding: '8px 18px',
                            borderRadius: 20,
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: isDownloading ? 'wait' : 'pointer',
                            opacity: isDownloading ? 0.7 : 1,
                          }}
                        >
                          {isDownloading ? 'Generando URL segura...' : deliv.external_url ? 'Abrir Enlace ↗' : 'Descargar Archivo ↓'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ padding: 16, background: '#fff', borderRadius: 6, border: '1px dashed var(--border)', color: 'var(--muted)', fontSize: 13 }}>
                  Los entregables se publicarán a medida que se completen las fases técnicas del cronograma.
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
