import { useState } from 'react';
import ProjectGantt from '../ProjectGantt.jsx';
import ProjectTaskManager from '../ProjectTaskManager.jsx';
import ProjectRiskManager from '../ProjectRiskManager.jsx';
import { METHODOLOGY_PHASE_PRESETS } from './NewProjectModal.jsx';
import { calculateProjectProgress, calculateProjectHours, HEALTH_STATUS_CONFIG } from '../../lib/pm.js';

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
  staffList = [],
  isAdmin = true,
  onUpdateProjectStatus,
  onProjectHealthChange,
  onUpdateMilestone,
  onAddMilestone,
  onUpdateProjectStaff,
  onTaskCreated,
  onTaskUpdated,
  onTaskDeleted,
  onRiskCreated,
  onRiskUpdated,
}) {
  const [projectSubTabs, setProjectSubTabs] = useState({});
  const [addingMilestoneProjId, setAddingMilestoneProjId] = useState(null);
  const [editingStaffProjId, setEditingStaffProjId] = useState(null);
  const [staffFormData, setStaffFormData] = useState({
    techLeadName: '',
    techLeadContact: '',
  });
  const [inlineMilestone, setInlineMilestone] = useState({
    title: 'Fase 01 — Auditoría & Diagnóstico Inicial',
    orderIndex: 1,
    phasePreset: '01',
    dueDate: '',
    assignedToId: '',
    assignedToName: '',
    assignedToEmail: '',
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
        <h2 style={{ fontFamily: "'Spectral', serif", fontSize: 24, margin: 0 }}>Proyectos en Curso & Auditorías ({projects.length})</h2>
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
              proj.progress !== undefined && proj.progress !== null && proj.progress > 0 ? proj.progress : weightedProgress;
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
                      {isAdmin ? (
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
                      ) : (
                        <span
                          title="Solo administradores pueden modificar el estado del proyecto"
                          style={{
                            fontFamily: "'IBM Plex Mono', monospace",
                            fontSize: 11,
                            padding: '3px 8px',
                            borderRadius: 4,
                            background: pColor.bg,
                            color: pColor.text,
                            border: `1px solid ${pColor.border}`,
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          🔒 {proj.status}
                        </span>
                      )}

                      {isAdmin ? (
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
                      ) : (
                        <span
                          title="Indicador de Salud RAG (Solo lectura)"
                          style={{
                            fontFamily: "'IBM Plex Mono', monospace",
                            fontSize: 11,
                            padding: '3px 8px',
                            borderRadius: 4,
                            background: healthCfg.badgeBg,
                            color: healthCfg.color,
                            border: `1px solid ${healthCfg.color}`,
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          🔒 {healthCfg.icon} Salud: {healthCfg.label}
                        </span>
                      )}

                      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: 'var(--muted)' }}>
                        Pilar: <strong>{PILLAR_LABELS[proj.pillar] || proj.pillar}</strong>
                      </span>
                    </div>

                    <h3 style={{ margin: '4px 0', fontSize: 22, fontFamily: "'Spectral', serif", fontWeight: 700 }}>{proj.title}</h3>
                    <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                      Cliente:{' '}
                      <strong style={{ color: 'var(--ink)' }}>
                        {proj.client?.full_name ? `${proj.client.full_name} (${proj.client.email})` : proj.client?.email || proj.client_id}
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

                {/* Sección de Equipo Técnico Asignado & Designación */}
                <div
                  style={{
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    borderRadius: 4,
                    padding: '12px 16px',
                    marginBottom: 16,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 12,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                    <div>
                      <span style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: 'var(--muted)', display: 'block' }}>
                        LEAD TÉCNICO / AUDITOR RESPONSABLE
                      </span>
                      <strong style={{ fontSize: 13, color: 'var(--ink)' }}>👤 {proj.tech_lead_name || 'Inmerge Technical Lead'}</strong>{' '}
                      <span style={{ fontSize: 12, color: 'var(--muted)' }}>({proj.tech_lead_contact || 'inmerge3@gmail.com'})</span>
                    </div>

                    {/* Miembros del equipo interno participantes */}
                    {Array.from(new Set((proj.milestones || []).filter((m) => m.assigned_to_name).map((m) => m.assigned_to_name))).map(
                      (name) => (
                        <span
                          key={name}
                          style={{
                            fontSize: 11,
                            fontFamily: "'IBM Plex Mono', monospace",
                            padding: '2px 8px',
                            borderRadius: 12,
                            background: 'var(--cream2)',
                            border: '1px solid var(--border)',
                            color: 'var(--ink)',
                          }}
                        >
                          🛠️ {name}
                        </span>
                      ),
                    )}
                  </div>

                  {isAdmin && onUpdateProjectStaff && (
                    <div>
                      <button
                        type="button"
                        onClick={() => {
                          if (editingStaffProjId === proj.id) {
                            setEditingStaffProjId(null);
                          } else {
                            setEditingStaffProjId(proj.id);
                            setStaffFormData({
                              techLeadName: proj.tech_lead_name || '',
                              techLeadContact: proj.tech_lead_contact || '',
                            });
                          }
                        }}
                        style={{
                          background: 'none',
                          border: '1px dotted var(--terracotta)',
                          color: 'var(--terracotta)',
                          padding: '4px 10px',
                          borderRadius: 4,
                          fontSize: 12,
                          cursor: 'pointer',
                          fontFamily: "'IBM Plex Mono', monospace",
                        }}
                      >
                        {editingStaffProjId === proj.id ? 'Cancelar' : '⚙️ Designar / Cambiar Lead'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Formulario Inline de Designación de Lead (Admin) */}
                {editingStaffProjId === proj.id && isAdmin && (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (onUpdateProjectStaff) {
                        await onUpdateProjectStaff(proj.id, staffFormData);
                        setEditingStaffProjId(null);
                      }
                    }}
                    style={{
                      background: 'var(--cream2)',
                      border: '1px solid var(--border)',
                      borderRadius: 4,
                      padding: '14px 16px',
                      marginBottom: 16,
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr)) auto',
                      gap: 12,
                      alignItems: 'flex-end',
                    }}
                  >
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 3 }}>
                        Seleccionar Consultor / Ingeniero
                      </label>
                      <select
                        onChange={(e) => {
                          const selected = staffList.find((s) => s.id === e.target.value);
                          if (selected) {
                            setStaffFormData({
                              techLeadName: selected.full_name || selected.email,
                              techLeadContact: selected.email,
                            });
                          }
                        }}
                        style={{
                          width: '100%',
                          padding: '6px 8px',
                          borderRadius: 4,
                          border: '1px solid var(--border)',
                          fontSize: 12,
                          background: '#fff',
                        }}
                      >
                        <option value="">-- Seleccionar de la lista de consultores --</option>
                        {staffList.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.full_name || s.email} ({s.role ? s.role.toUpperCase() : 'STAFF'})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 3 }}>
                        Nombre del Lead Técnico *
                      </label>
                      <input
                        type="text"
                        value={staffFormData.techLeadName}
                        onChange={(e) => setStaffFormData({ ...staffFormData, techLeadName: e.target.value })}
                        required
                        style={{ width: '100%', padding: '6px 8px', borderRadius: 4, border: '1px solid var(--border)', fontSize: 12 }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 3 }}>
                        Email de Contacto *
                      </label>
                      <input
                        type="email"
                        value={staffFormData.techLeadContact}
                        onChange={(e) => setStaffFormData({ ...staffFormData, techLeadContact: e.target.value })}
                        required
                        style={{ width: '100%', padding: '6px 8px', borderRadius: 4, border: '1px solid var(--border)', fontSize: 12 }}
                      />
                    </div>

                    <div>
                      <button
                        type="submit"
                        className="btn-accent"
                        style={{
                          background: 'var(--terracotta)',
                          color: '#fff',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: 4,
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Guardar Designación
                      </button>
                    </div>
                  </form>
                )}

                {proj.description && (
                  <p style={{ fontSize: 14, color: 'var(--ink)', marginBottom: 16, whiteSpace: 'pre-line' }}>{proj.description}</p>
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
                      {isAdmin && onAddMilestone ? (
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
                                assignedToId: '',
                                assignedToName: '',
                                assignedToEmail: '',
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
                      ) : (
                        <span style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: 'var(--muted)' }}>
                          🔒 Solo Admin gestiona hitos
                        </span>
                      )}
                    </div>

                    {/* Inline Add Milestone Form (Admin Only) */}
                    {isAdmin && addingMilestoneProjId === proj.id && (
                      <form
                        onSubmit={async (e) => {
                          e.preventDefault();
                          if (onAddMilestone) {
                            await onAddMilestone(e, {
                              projectId: proj.id,
                              title: inlineMilestone.title,
                              orderIndex: parseInt(inlineMilestone.orderIndex, 10) || 1,
                              dueDate: inlineMilestone.dueDate || null,
                              assignedToId: inlineMilestone.assignedToId || null,
                              assignedToName: inlineMilestone.assignedToName || null,
                              assignedToEmail: inlineMilestone.assignedToEmail || null,
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
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
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

                          <div>
                            <label style={{ display: 'block', fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 3 }}>
                              Encargado (Equipo Interno)
                            </label>
                            <select
                              value={inlineMilestone.assignedToId || ''}
                              onChange={(e) => {
                                const memberId = e.target.value;
                                if (!memberId) {
                                  setInlineMilestone({
                                    ...inlineMilestone,
                                    assignedToId: '',
                                    assignedToName: '',
                                    assignedToEmail: '',
                                  });
                                } else {
                                  const member = staffList.find((s) => s.id === memberId);
                                  setInlineMilestone({
                                    ...inlineMilestone,
                                    assignedToId: member?.id || memberId,
                                    assignedToName: member?.full_name || member?.email || '',
                                    assignedToEmail: member?.email || '',
                                  });
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
                              <option value="">-- Sin asignar / General --</option>
                              {staffList.map((member) => (
                                <option key={member.id} value={member.id}>
                                  {member.full_name || member.email} ({member.role ? member.role.toUpperCase() : 'STAFF'})
                                </option>
                              ))}
                            </select>
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
                                {m.assigned_to_name && (
                                  <span
                                    style={{
                                      fontFamily: "'IBM Plex Mono', monospace",
                                      fontSize: 11,
                                      background: 'rgba(36, 26, 18, 0.05)',
                                      color: 'var(--ink)',
                                      padding: '2px 8px',
                                      borderRadius: 4,
                                      border: '1px solid var(--border)',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: 4,
                                    }}
                                  >
                                    👤 {m.assigned_to_name}
                                  </span>
                                )}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                {isAdmin ? (
                                  <>
                                    {staffList.length > 0 && (
                                      <select
                                        value={m.assigned_to_id || ''}
                                        onChange={(e) => {
                                          const memberId = e.target.value;
                                          const member = staffList.find((s) => s.id === memberId);
                                          onUpdateMilestone(m.id, {
                                            assignedToId: member?.id || null,
                                            assignedToName: member?.full_name || member?.email || null,
                                            assignedToEmail: member?.email || null,
                                          });
                                        }}
                                        style={{
                                          padding: '4px 8px',
                                          borderRadius: 4,
                                          border: '1px solid var(--border)',
                                          background: '#fff',
                                          color: 'var(--ink)',
                                          fontSize: 11,
                                          fontFamily: "'IBM Plex Mono', monospace",
                                        }}
                                        title="Designar auditor/ingeniero encargado del hito"
                                      >
                                        <option value="">👤 Sin asignar</option>
                                        {staffList.map((member) => (
                                          <option key={member.id} value={member.id}>
                                            👤 {member.full_name || member.email} ({member.role ? member.role.toUpperCase() : 'STAFF'})
                                          </option>
                                        ))}
                                      </select>
                                    )}
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
                                      title="Cambiar estado del hito"
                                    >
                                      <option value="PENDIENTE">PENDIENTE</option>
                                      <option value="EN_PROGRESO">EN_PROGRESO</option>
                                      <option value="EN_PROCESO">EN_PROCESO</option>
                                      <option value="COMPLETADO">COMPLETADO</option>
                                      <option value="BLOQUEADO">BLOQUEADO</option>
                                    </select>
                                  </>
                                ) : (
                                  <>
                                    <span
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
                                      title="Estado del hito (Solo editable por Admin)"
                                    >
                                      🔒 {m.status}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div style={{ padding: 16, color: 'var(--muted)', fontSize: 13 }}>No hay hitos registrados en este proyecto.</div>
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
