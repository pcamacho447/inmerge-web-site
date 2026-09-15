import { useState } from 'react';
import ProjectGantt from '../ProjectGantt.jsx';
import ProjectTaskManager from '../ProjectTaskManager.jsx';
import ProjectRiskManager from '../ProjectRiskManager.jsx';
import { METHODOLOGY_PHASE_PRESETS } from './NewProjectModal.jsx';
import {
  calculateProjectProgress,
  calculateProjectHours,
  HEALTH_STATUS_CONFIG,
} from '../../lib/pm.js';

export const PILLAR_LABELS = {
  auditoria: '01. Auditoría Técnica & Datos',
  desarrollo: '02. Desarrollo Cloud & AWS',
  datos: '03. Datos & IA',
  integral: 'Solución Integral',
};

export const PROJECT_STATUS_COLORS = {
  EN_PLANIFICACION: { bg: 'rgba(216, 168, 78, 0.15)', text: '#9B7322', border: 'var(--gold)' },
  EN_AUDITORIA: { bg: 'rgba(168, 71, 43, 0.1)', text: 'var(--terracotta)', border: 'var(--terracotta)' },
  EN_DESARROLLO: { bg: 'rgba(52, 89, 149, 0.12)', text: '#345995', border: '#345995' },
  EN_VALIDACION: { bg: 'rgba(198, 138, 61, 0.15)', text: 'var(--ochre)', border: 'var(--ochre)' },
  ENTREGADO: { bg: 'rgba(46, 117, 89, 0.15)', text: '#2E7559', border: '#2E7559' },
  FINALIZADO: { bg: 'rgba(36, 26, 18, 0.08)', text: 'var(--ink)', border: 'var(--border)' },
};

export const MILESTONE_STATUS_COLORS = {
  PENDIENTE: { bg: 'rgba(122, 107, 88, 0.08)', text: 'var(--muted)', border: 'var(--border)' },
  EN_PROGRESO: { bg: 'rgba(216, 168, 78, 0.15)', text: '#9B7322', border: 'var(--gold)' },
  EN_PROCESO: { bg: 'rgba(198, 138, 61, 0.15)', text: 'var(--ochre)', border: 'var(--ochre)' },
  COMPLETADO: { bg: 'rgba(46, 117, 89, 0.15)', text: '#2E7559', border: '#2E7559' },
  BLOQUEADO: { bg: 'rgba(168, 71, 43, 0.15)', text: 'var(--terracotta)', border: 'var(--terracotta)' },
};

export default function ProjectsManagementView({
  projects,
  onUpdateProjectStatus,
  onProjectHealthChange,
  onUpdateMilestone,
  onAddMilestone,
  onTaskCreated,
  onTaskUpdated,
  onTaskDeleted,
  onRiskCreated,
  onRiskUpdated,
}) {
  const [projectSubTabs, setProjectSubTabs] = useState({});
  const [addingMilestoneProjId, setAddingMilestoneProjId] = useState(null);
  const [inlineMilestone, setInlineMilestone] = useState({
    title: 'Fase 01 — Auditoría & Diagnóstico Inicial',
    orderIndex: 1,
    phasePreset: '01',
    dueDate: '',
  });

  const setProjSubTab = (projId, tab) => {
    setProjectSubTabs((prev) => ({
      ...prev,
      [projId]: tab,
    }));
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontFamily: "'Spectral', serif", fontSize: 24, margin: 0 }}>
          Proyectos en Curso & Auditorías ({projects.length})
        </h2>
      </div>

      {projects.length === 0 ? (
        <div
          style={{
            padding: 40,
            textAlign: 'center',
            background: 'var(--cream2)',
            borderRadius: 8,
            border: '1px dashed var(--border)',
          }}
        >
          <p style={{ color: 'var(--muted)', margin: 0 }}>No hay proyectos activos registrados.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {projects.map((proj) => {
            const totalMilestones = proj.milestones?.length || 0;
            const completedMilestones = proj.milestones?.filter((m) => m.status === 'COMPLETADO').length || 0;
            const weightedProgress = calculateProjectProgress(proj.milestones, proj.tasks || []);
            const progressPct =
              proj.progress !== undefined && proj.progress !== null && proj.progress > 0
                ? proj.progress
                : weightedProgress;
            const hoursInfo = calculateProjectHours(proj.tasks || []);
            const activeRisksCount = (proj.risks || []).filter((r) => r.status !== 'RESUELTO').length;
            const currentSubTab = projectSubTabs[proj.id] || 'PM_GANTT';

            const healthCfg = HEALTH_STATUS_CONFIG[proj.health_status || 'ON_TRACK'] || HEALTH_STATUS_CONFIG.ON_TRACK;
            const pColor = PROJECT_STATUS_COLORS[proj.status] || PROJECT_STATUS_COLORS.EN_PLANIFICACION;

            return (
              <div
                key={proj.id}
                style={{
                  background: 'var(--cream2)',
                  borderRadius: 8,
                  padding: '24px',
                  border: '1px solid var(--border)',
                }}
              >
                {/* Project Header */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: 12,
                    marginBottom: 16,
                    borderBottom: '1px solid var(--border)',
                    paddingBottom: 14,
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                      <select
                        value={proj.status}
                        onChange={(e) => onUpdateProjectStatus(proj.id, e.target.value)}
                        title="Cambiar estado del proyecto y notificar al cliente"
                        style={{
                          fontFamily: "'IBM Plex Mono', monospace",
                          fontSize: 11,
                          padding: '3px 8px',
                          borderRadius: 4,
                          background: pColor.bg,
                          color: pColor.text,
                          border: `1px solid ${pColor.border}`,
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        <option value="EN_PLANIFICACION">EN_PLANIFICACION</option>
                        <option value="EN_AUDITORIA">EN_AUDITORIA</option>
                        <option value="EN_DESARROLLO">EN_DESARROLLO</option>
                        <option value="EN_VALIDACION">EN_VALIDACION</option>
                        <option value="ENTREGADO">ENTREGADO</option>
                        <option value="FINALIZADO">FINALIZADO</option>
                      </select>

                      <select
                        value={proj.health_status || 'ON_TRACK'}
                        onChange={(e) => onProjectHealthChange(proj.id, e.target.value)}
                        title="Indicador de Salud RAG del Proyecto"
                        style={{
                          fontFamily: "'IBM Plex Mono', monospace",
                          fontSize: 11,
                          padding: '3px 8px',
                          borderRadius: 4,
                          background: healthCfg.badgeBg,
                          color: healthCfg.color,
                          border: `1px solid ${healthCfg.color}`,
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        {Object.values(HEALTH_STATUS_CONFIG).map((h) => (
                          <option key={h.key} value={h.key}>
                            {h.icon} Salud: {h.label}
                          </option>
                        ))}
                      </select>

                      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: 'var(--muted)' }}>
                        Pilar: <strong>{PILLAR_LABELS[proj.pillar] || proj.pillar}</strong>
                      </span>
                    </div>

                    <h3 style={{ margin: '4px 0', fontSize: 22, fontFamily: "'Spectral', serif", fontWeight: 700 }}>
                      {proj.title}
                    </h3>
                    <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                      Cliente:{' '}
                      <strong style={{ color: 'var(--ink)' }}>
                        {proj.client?.full_name
                          ? `${proj.client.full_name} (${proj.client.email})`
                          : proj.client?.email || proj.client_id}
                      </strong>
                      {proj.client?.company && ` — ${proj.client.company}`}
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
                    <div>Inicio: {proj.start_date || 'N/A'}</div>
                    {proj.target_completion_date && <div>Meta: {proj.target_completion_date}</div>}
                  </div>
                </div>

                {proj.description && (
                  <p style={{ fontSize: 14, color: 'var(--ink)', marginBottom: 16, whiteSpace: 'pre-line' }}>
                    {proj.description}
                  </p>
                )}

                {/* PM KPI Bar */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: 12,
                    marginBottom: 20,
                  }}
                >
                  {/* Progreso Ponderado */}
                  <div
                    style={{
                      background: 'var(--bg)',
                      padding: '12px 14px',
                      border: '1px solid var(--border)',
                      borderRadius: 4,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        fontFamily: "'IBM Plex Mono', monospace",
                        color: 'var(--muted)',
                        marginBottom: 4,
                      }}
                    >
                      PROGRESO PONDERADO
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong
                        style={{
                          fontSize: 18,
                          color: 'var(--terracotta)',
                          fontFamily: "'IBM Plex Mono', monospace",
                        }}
                      >
                        {progressPct}%
                      </strong>
                      <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: "'IBM Plex Mono', monospace" }}>
                        {completedMilestones}/{totalMilestones} Hitos
                      </span>
                    </div>
                    <div
                      style={{
                        width: '100%',
                        height: 4,
                        background: 'var(--cream2)',
                        marginTop: 6,
                        borderRadius: 2,
                        overflow: 'hidden',
                      }}
                    >
                      <div style={{ width: `${progressPct}%`, height: '100%', background: 'var(--terracotta)' }} />
                    </div>
                  </div>

                  {/* Horas de Consultoría */}
                  <div
                    style={{
                      background: 'var(--bg)',
                      padding: '12px 14px',
                      border: '1px solid var(--border)',
                      borderRadius: 4,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        fontFamily: "'IBM Plex Mono', monospace",
                        color: 'var(--muted)',
                        marginBottom: 4,
                      }}
                    >
                      HORAS TÉCNICAS (REAL / EST.)
                    </div>
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        fontFamily: "'IBM Plex Mono', monospace",
                        color: 'var(--ink)',
                      }}
                    >
                      {hoursInfo.actualHours}h / {hoursInfo.estimatedHours}h
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: hoursInfo.varianceHours > 0 ? 'var(--terracotta)' : 'var(--green)',
                        marginTop: 4,
                      }}
                    >
                      Desviación: {hoursInfo.varianceHours > 0 ? `+${hoursInfo.varianceHours}h` : `${hoursInfo.varianceHours}h`}
                    </div>
                  </div>

                  {/* Bloqueos Activos */}
                  <div
                    style={{
                      background: 'var(--bg)',
                      padding: '12px 14px',
                      border: '1px solid var(--border)',
                      borderRadius: 4,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        fontFamily: "'IBM Plex Mono', monospace",
                        color: 'var(--muted)',
                        marginBottom: 4,
                      }}
                    >
                      BLOQUEOS / RIESGOS
                    </div>
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        fontFamily: "'IBM Plex Mono', monospace",
                        color: activeRisksCount > 0 ? 'var(--terracotta)' : 'var(--green)',
                      }}
                    >
                      {activeRisksCount > 0 ? `⚠️ ${activeRisksCount} Activo(s)` : '✓ 0 Bloqueos'}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
                      {proj.tasks?.length || 0} tareas técnicas registradas
                    </div>
                  </div>
                </div>

                {/* Sub-Tabs de Gestión PM */}
                <div
                  style={{
                    display: 'flex',
                    gap: 6,
                    borderBottom: '1px solid var(--border)',
                    marginBottom: 16,
                    overflowX: 'auto',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setProjSubTab(proj.id, 'PM_GANTT')}
                    style={{
                      padding: '8px 14px',
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 12,
                      fontWeight: currentSubTab === 'PM_GANTT' ? 700 : 500,
                      background: currentSubTab === 'PM_GANTT' ? 'var(--bg)' : 'transparent',
                      color: currentSubTab === 'PM_GANTT' ? 'var(--terracotta)' : 'var(--muted)',
                      border: '1px solid var(--border)',
                      borderBottom: currentSubTab === 'PM_GANTT' ? '1px solid var(--bg)' : '1px solid var(--border)',
                      cursor: 'pointer',
                    }}
                  >
                    📊 Cronograma Gantt
                  </button>
                  <button
                    type="button"
                    onClick={() => setProjSubTab(proj.id, 'PM_TASKS')}
                    style={{
                      padding: '8px 14px',
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 12,
                      fontWeight: currentSubTab === 'PM_TASKS' ? 700 : 500,
                      background: currentSubTab === 'PM_TASKS' ? 'var(--bg)' : 'transparent',
                      color: currentSubTab === 'PM_TASKS' ? 'var(--terracotta)' : 'var(--muted)',
                      border: '1px solid var(--border)',
                      borderBottom: currentSubTab === 'PM_TASKS' ? '1px solid var(--bg)' : '1px solid var(--border)',
                      cursor: 'pointer',
                    }}
                  >
                    📋 Tareas Técnicas ({proj.tasks?.length || 0})
                  </button>
                  <button
                    type="button"
                    onClick={() => setProjSubTab(proj.id, 'PM_RISKS')}
                    style={{
                      padding: '8px 14px',
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 12,
                      fontWeight: currentSubTab === 'PM_RISKS' ? 700 : 500,
                      background: currentSubTab === 'PM_RISKS' ? 'var(--bg)' : 'transparent',
                      color: currentSubTab === 'PM_RISKS' ? 'var(--terracotta)' : 'var(--muted)',
                      border: '1px solid var(--border)',
                      borderBottom: currentSubTab === 'PM_RISKS' ? '1px solid var(--bg)' : '1px solid var(--border)',
                      cursor: 'pointer',
                    }}
                  >
                    ⚠️ Riesgos & Bloqueos ({proj.risks?.length || 0})
                  </button>
                  <button
                    type="button"
                    onClick={() => setProjSubTab(proj.id, 'PM_MILESTONES')}
                    style={{
                      padding: '8px 14px',
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 12,
                      fontWeight: currentSubTab === 'PM_MILESTONES' ? 700 : 500,
                      background: currentSubTab === 'PM_MILESTONES' ? 'var(--bg)' : 'transparent',
                      color: currentSubTab === 'PM_MILESTONES' ? 'var(--terracotta)' : 'var(--muted)',
                      border: '1px solid var(--border)',
                      borderBottom: currentSubTab === 'PM_MILESTONES' ? '1px solid var(--bg)' : '1px solid var(--border)',
                      cursor: 'pointer',
                    }}
                  >
                    📌 Hitos & Entregables
                  </button>
                </div>

                {/* Render Sub-Tab Active */}
                {currentSubTab === 'PM_GANTT' && (
                  <ProjectGantt
                    project={proj}
                    milestones={proj.milestones || []}
                    tasks={proj.tasks || []}
                    showTasks={true}
                    isExecutive={false}
                  />
                )}

                {currentSubTab === 'PM_TASKS' && (
                  <ProjectTaskManager
                    projectId={proj.id}
                    milestones={proj.milestones || []}
                    tasks={proj.tasks || []}
                    onTaskCreated={onTaskCreated}
                    onTaskUpdated={onTaskUpdated}
                    onTaskDeleted={onTaskDeleted}
                  />
                )}

                {currentSubTab === 'PM_RISKS' && (
                  <ProjectRiskManager
                    projectId={proj.id}
                    milestones={proj.milestones || []}
                    risks={proj.risks || []}
                    onRiskCreated={onRiskCreated}
                    onRiskUpdated={onRiskUpdated}
                  />
                )}

                {currentSubTab === 'PM_MILESTONES' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{ fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", color: 'var(--muted)' }}>
                        Fases & Hitos del Proyecto ({proj.milestones?.length || 0})
                      </span>
                      {onAddMilestone && (
                        <button
                          type="button"
                          onClick={() => {
                            if (addingMilestoneProjId === proj.id) {
                              setAddingMilestoneProjId(null);
                            } else {
                              setAddingMilestoneProjId(proj.id);
                              setInlineMilestone({
                                title: 'Fase 01 — Auditoría & Diagnóstico Inicial',
                                orderIndex: (proj.milestones?.length || 0) + 1,
                                phasePreset: '01',
                                dueDate: '',
                              });
                            }
                          }}
                          className="btn-accent"
                          style={{
                            background: addingMilestoneProjId === proj.id ? 'var(--muted)' : 'var(--terracotta)',
                            color: '#fff',
                            border: 'none',
                            padding: '6px 14px',
                            borderRadius: 16,
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          {addingMilestoneProjId === proj.id ? 'Cancelar' : '+ Agregar Hito a Proyecto'}
                        </button>
                      )}
                    </div>

                    {/* Inline Add Milestone Form */}
                    {addingMilestoneProjId === proj.id && (
                      <form
                        onSubmit={async (e) => {
                          e.preventDefault();
                          if (onAddMilestone) {
                            await onAddMilestone(e, {
                              projectId: proj.id,
                              title: inlineMilestone.title,
                              orderIndex: parseInt(inlineMilestone.orderIndex, 10) || 1,
                              dueDate: inlineMilestone.dueDate || null,
                            });
                            setAddingMilestoneProjId(null);
                          }
                        }}
                        style={{
                          background: 'var(--cream2)',
                          padding: '16px',
                          borderRadius: 6,
                          border: '1px solid var(--border)',
                          marginBottom: 16,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 10,
                        }}
                      >
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
                          <div>
                            <label style={{ display: 'block', fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 3 }}>
                              Fase del Proyecto (Método Inmerge)
                            </label>
                            <select
                              value={inlineMilestone.phasePreset}
                              onChange={(e) => {
                                const presetId = e.target.value;
                                const found = METHODOLOGY_PHASE_PRESETS.find((p) => p.id === presetId);
                                if (found) {
                                  if (presetId === 'custom') {
                                    setInlineMilestone({ ...inlineMilestone, phasePreset: 'custom' });
                                  } else {
                                    setInlineMilestone({
                                      ...inlineMilestone,
                                      phasePreset: found.id,
                                      orderIndex: found.order,
                                      title: found.template,
                                    });
                                  }
                                }
                              }}
                              style={{
                                width: '100%',
                                padding: '6px 10px',
                                borderRadius: 4,
                                border: '1px solid var(--border)',
                                fontSize: 12,
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
                            <label style={{ display: 'block', fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 3 }}>
                              Nº de Fase (Orden) *
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="20"
                              value={inlineMilestone.orderIndex}
                              onChange={(e) => setInlineMilestone({ ...inlineMilestone, orderIndex: parseInt(e.target.value, 10) || 1 })}
                              required
                              style={{
                                width: '100%',
                                padding: '6px 10px',
                                borderRadius: 4,
                                border: '1px solid var(--border)',
                                fontSize: 12,
                                fontFamily: "'IBM Plex Mono', monospace",
                              }}
                            />
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 3 }}>
                              Fecha Límite
                            </label>
                            <input
                              type="date"
                              value={inlineMilestone.dueDate}
                              onChange={(e) => setInlineMilestone({ ...inlineMilestone, dueDate: e.target.value })}
                              style={{
                                width: '100%',
                                padding: '6px 10px',
                                borderRadius: 4,
                                border: '1px solid var(--border)',
                                fontSize: 12,
                              }}
                            />
                          </div>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 3 }}>
                            Título del Hito *
                          </label>
                          <input
                            type="text"
                            value={inlineMilestone.title}
                            onChange={(e) => setInlineMilestone({ ...inlineMilestone, title: e.target.value })}
                            required
                            placeholder="e.g. Fase 02 — Arquitectura Cloud & Especificación Técnica"
                            style={{
                              width: '100%',
                              padding: '6px 10px',
                              borderRadius: 4,
                              border: '1px solid var(--border)',
                              fontSize: 12,
                              boxSizing: 'border-box',
                            }}
                          />
                        </div>

                        <div>
                          <button
                            type="submit"
                            style={{
                              background: 'var(--ink)',
                              color: '#fff',
                              border: 'none',
                              padding: '7px 16px',
                              borderRadius: 16,
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            Guardar Hito
                          </button>
                        </div>
                      </form>
                    )}

                    {proj.milestones && proj.milestones.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                        {proj.milestones.map((m) => {
                          const mColor = MILESTONE_STATUS_COLORS[m.status] || MILESTONE_STATUS_COLORS.PENDIENTE;
                          const phaseNumberStr = String(m.order_index || 1).padStart(2, '0');
                          return (
                            <div
                              key={m.id}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                background: '#fff',
                                padding: '10px 14px',
                                borderRadius: 4,
                                border: '1px solid var(--border)',
                                fontSize: 13,
                                flexWrap: 'wrap',
                                gap: 8,
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span
                                  style={{
                                    fontFamily: "'IBM Plex Mono', monospace",
                                    fontSize: 11,
                                    fontWeight: 700,
                                    background: 'var(--cream2)',
                                    color: 'var(--terracotta)',
                                    padding: '2px 8px',
                                    borderRadius: 4,
                                    border: '1px solid var(--border)',
                                  }}
                                >
                                  Fase {phaseNumberStr}
                                </span>
                                <strong>{m.title}</strong>
                                {m.due_date && (
                                  <span
                                    style={{
                                      marginLeft: 4,
                                      color: 'var(--muted)',
                                      fontSize: 11,
                                      fontFamily: "'IBM Plex Mono', monospace",
                                    }}
                                  >
                                    (Fecha: {m.due_date})
                                  </span>
                                )}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <select
                                  value={m.status}
                                  onChange={(e) => onUpdateMilestone(m.id, e.target.value)}
                                  style={{
                                    padding: '4px 8px',
                                    borderRadius: 4,
                                    border: `1px solid ${mColor.border}`,
                                    background: mColor.bg,
                                    color: mColor.text,
                                    fontSize: 11,
                                    fontFamily: "'IBM Plex Mono', monospace",
                                    fontWeight: 700,
                                  }}
                                >
                                  <option value="PENDIENTE">PENDIENTE</option>
                                  <option value="EN_PROGRESO">EN_PROGRESO</option>
                                  <option value="EN_PROCESO">EN_PROCESO</option>
                                  <option value="COMPLETADO">COMPLETADO</option>
                                  <option value="BLOQUEADO">BLOQUEADO</option>
                                </select>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div style={{ padding: 16, color: 'var(--muted)', fontSize: 13 }}>
                        No hay hitos registrados en este proyecto.
                      </div>
                    )}
                  </div>
                )}

                {/* Footer Info */}
                <div
                  style={{
                    display: 'flex',
                    gap: 24,
                    flexWrap: 'wrap',
                    paddingTop: 14,
                    marginTop: 16,
                    borderTop: '1px solid var(--border)',
                    fontSize: 12,
                    fontFamily: "'IBM Plex Mono', monospace",
                    color: 'var(--muted)',
                  }}
                >
                  <div>📍 {totalMilestones} Hitos</div>
                  <div>📋 {proj.tasks?.length || 0} Tareas</div>
                  <div>📦 {proj.deliverables?.length || 0} Entregables</div>
                  <div>⚠️ {activeRisksCount} Bloqueos activos</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
