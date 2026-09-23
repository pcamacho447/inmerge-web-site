import { useState } from 'react';
import ProjectGantt from '../ProjectGantt.jsx';
import ProjectTaskManager from '../ProjectTaskManager.jsx';
import ProjectRiskManager from '../ProjectRiskManager.jsx';
import ProjectDocumentHub from './ProjectDocumentHub.jsx';
import DocumentPreviewDrawer from './DocumentPreviewDrawer.jsx';
import { METHODOLOGY_PHASE_PRESETS } from './NewProjectModal.jsx';

import { calculateProjectProgress, calculateProjectHours, HEALTH_STATUS_CONFIG } from '../../lib/pm.js';
import { getSignedDeliverableUrl } from '../../lib/projects.js';

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
  onUploadDeliverable,
  onOpenNewProject,
  showToast,
}) {
  const [projectSubTabs, setProjectSubTabs] = useState({});
  const [addingMilestoneProjId, setAddingMilestoneProjId] = useState(null);
  const [uploadingDeliverableProjId, setUploadingDeliverableProjId] = useState(null);
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
  const [inlineDeliverable, setInlineDeliverable] = useState({
    milestoneId: '',
    title: '',
    fileType: 'PDF',
    externalUrl: '',
    version: 'v1.0',
    notes: '',
  });
  const [inlineDelivFile, setInlineDelivFile] = useState(null);
  const [isUploadingDeliv, setIsUploadingDeliv] = useState(false);
  const [downloadingDelivId, setDownloadingDelivId] = useState(null);
  const [viewLayout, setViewLayout] = useState('LIST'); // 'LIST' | 'GRID' | 'SPLIT' | 'KANBAN'
  const [selectedProjId, setSelectedProjId] = useState(projects[0]?.id || null);

  const [activePreviewDoc, setActivePreviewDoc] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleOpenPreview = (doc) => {
    setActivePreviewDoc(doc);
    setIsPreviewOpen(true);
  };

  const setProjSubTab = (projId, tab) => {
    setProjectSubTabs((prev) => ({
      ...prev,
      [projId]: tab,
    }));
  };

  const activeSelectedId = projects.find((p) => p.id === selectedProjId) ? selectedProjId : projects[0]?.id;
  const selectedProject = projects.find((p) => p.id === activeSelectedId) || projects[0];

  // Helper to render full project inspector card
  const renderProjectCard = (proj, isSplitDetail = false) => {
    const totalMilestones = proj.milestones?.length || 0;
    const completedMilestones = proj.milestones?.filter((m) => m.status === 'COMPLETADO').length || 0;
    const weightedProgress = calculateProjectProgress(proj.milestones, proj.tasks || []);
    const progressPct = proj.progress !== undefined && proj.progress !== null && proj.progress > 0 ? proj.progress : weightedProgress;
    const hoursInfo = calculateProjectHours(proj.tasks || []);
    const activeRisksCount = (proj.risks || []).filter((r) => r.status !== 'RESUELTO').length;
    const currentSubTab = projectSubTabs[proj.id] || 'PM_DOCS';

    const healthCfg = HEALTH_STATUS_CONFIG[proj.health_status || 'ON_TRACK'] || HEALTH_STATUS_CONFIG.ON_TRACK;
    const pColor = PROJECT_STATUS_COLORS[proj.status] || PROJECT_STATUS_COLORS.EN_PLANIFICACION;

    return (
      <div
        key={proj.id}
        style={{
          background: 'var(--cream2)',
          borderRadius: 8,
          padding: isSplitDetail ? '20px' : '24px',
          border: '1px solid var(--border)',
          boxShadow: isSplitDetail ? '0 4px 16px rgba(36,26,18,0.06)' : 'none',
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
            {Array.from(new Set((proj.milestones || []).filter((m) => m.assigned_to_name).map((m) => m.assigned_to_name))).map((name) => (
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
            ))}
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
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{proj.tasks?.length || 0} tareas técnicas registradas</div>
          </div>
        </div>

        {/* Sub-Tabs de Gestión PM con Divulgación Progresiva */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            borderBottom: '1px solid var(--border)',
            marginBottom: 16,
            overflowX: 'auto',
            paddingBottom: 2,
          }}
        >
          {/* 1. Especificaciones & Docs */}
          <button
            type="button"
            onClick={() => setProjSubTab(proj.id, 'PM_DOCS')}
            style={{
              padding: '8px 14px',
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 12,
              fontWeight: currentSubTab === 'PM_DOCS' ? 700 : 500,
              background: currentSubTab === 'PM_DOCS' ? 'var(--bg)' : 'transparent',
              color: currentSubTab === 'PM_DOCS' ? 'var(--terracotta)' : 'var(--muted)',
              border: '1px solid var(--border)',
              borderBottom: currentSubTab === 'PM_DOCS' ? '1px solid var(--bg)' : '1px solid var(--border)',
              cursor: 'pointer',
              borderRadius: '4px 4px 0 0',
            }}
          >
            📖 Especificaciones & Docs
          </button>

          {/* 2. Tareas Técnicas */}
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
              borderRadius: '4px 4px 0 0',
            }}
          >
            📋 Tareas Técnicas ({proj.tasks?.length || 0})
          </button>

          {/* 3. Menú Desplegable de Herramientas Avanzadas */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: 'var(--muted)' }}>Herramientas PM:</span>
            <select
              value={['PM_GANTT', 'PM_RISKS', 'PM_MILESTONES', 'PM_DELIVERABLES'].includes(currentSubTab) ? currentSubTab : ''}
              onChange={(e) => {
                if (e.target.value) {
                  setProjSubTab(proj.id, e.target.value);
                }
              }}
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 11,
                padding: '5px 10px',
                borderRadius: 4,
                border: '1px solid var(--border)',
                background: ['PM_GANTT', 'PM_RISKS', 'PM_MILESTONES', 'PM_DELIVERABLES'].includes(currentSubTab) ? 'var(--cream2)' : '#fff',
                color: 'var(--ink)',
                cursor: 'pointer',
                fontWeight: 600,
              }}
              aria-label="Seleccionar herramienta avanzada de proyecto"
            >
              <option value="">⋯ Seleccionar Vista / Gestión ▾</option>
              <option value="PM_GANTT">📊 Cronograma Gantt</option>
              <option value="PM_RISKS">⚠️ Riesgos & Bloqueos ({proj.risks?.length || 0})</option>
              <option value="PM_MILESTONES">📌 Fases & Hitos ({totalMilestones})</option>
              <option value="PM_DELIVERABLES">📦 Entregables Auditados ({proj.deliverables?.length || 0})</option>
            </select>
          </div>
        </div>

        {/* Render Sub-Tab Active */}
        {currentSubTab === 'PM_DOCS' && (
          <ProjectDocumentHub
            project={proj}
            deliverables={proj.deliverables || []}
            isAdmin={isAdmin}
            onOpenPreview={handleOpenPreview}
            onUploadClick={() => {
              setProjSubTab(proj.id, 'PM_DELIVERABLES');
              setUploadingDeliverableProjId(proj.id);
            }}
          />
        )}

        {/* Render Sub-Tab Active */}
        {currentSubTab === 'PM_GANTT' && (
          <ProjectGantt project={proj} milestones={proj.milestones || []} tasks={proj.tasks || []} showTasks={true} isExecutive={false} />
        )}

        {currentSubTab === 'PM_TASKS' && (
          <ProjectTaskManager
            projectId={proj.id}
            milestones={proj.milestones || []}
            tasks={proj.tasks || []}
            staffList={staffList}
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

        {/* Subtab PM_DELIVERABLES: Gestión in-situ de entregables y descargas firmadas */}
        {currentSubTab === 'PM_DELIVERABLES' && (
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
                flexWrap: 'wrap',
                gap: 10,
              }}
            >
              <div>
                <span style={{ fontSize: 13, fontFamily: "'IBM Plex Mono', monospace", color: 'var(--muted)' }}>
                  Documentos y Entregables del Proyecto ({proj.deliverables?.length || 0})
                </span>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                  Entregables confidenciales auditados y accesibles para el cliente mediante enlaces firmados.
                </div>
              </div>

              {isAdmin && onUploadDeliverable && (
                <button
                  type="button"
                  onClick={() => {
                    if (uploadingDeliverableProjId === proj.id) {
                      setUploadingDeliverableProjId(null);
                    } else {
                      setUploadingDeliverableProjId(proj.id);
                      setInlineDeliverable({
                        milestoneId: '',
                        title: '',
                        fileType: 'PDF',
                        externalUrl: '',
                        version: 'v1.0',
                        notes: '',
                      });
                      setInlineDelivFile(null);
                    }
                  }}
                  className="btn-accent"
                  style={{
                    background: uploadingDeliverableProjId === proj.id ? 'var(--muted)' : 'var(--terracotta)',
                    color: '#fff',
                    border: 'none',
                    padding: '6px 14px',
                    borderRadius: 16,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {uploadingDeliverableProjId === proj.id ? 'Cancelar' : '+ Subir Entregable Técnico'}
                </button>
              )}
            </div>

            {/* Formulario In-Situ para Subir Entregable (Admin Only) */}
            {isAdmin && uploadingDeliverableProjId === proj.id && (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!inlineDeliverable.title.trim()) {
                    showToast?.({
                      type: 'error',
                      title: 'Campo Requerido',
                      message: 'El título del entregable es obligatorio.',
                    });
                    return;
                  }
                  setIsUploadingDeliv(true);
                  try {
                    const success = await onUploadDeliverable(
                      e,
                      {
                        projectId: proj.id,
                        milestoneId: inlineDeliverable.milestoneId || null,
                        title: inlineDeliverable.title,
                        fileType: inlineDeliverable.fileType,
                        externalUrl: inlineDeliverable.externalUrl || null,
                        version: inlineDeliverable.version || 'v1.0',
                        notes: inlineDeliverable.notes || '',
                      },
                      inlineDelivFile,
                    );

                    if (success !== false) {
                      setUploadingDeliverableProjId(null);
                      setInlineDeliverable({
                        milestoneId: '',
                        title: '',
                        fileType: 'PDF',
                        externalUrl: '',
                        version: 'v1.0',
                        notes: '',
                      });
                      setInlineDelivFile(null);
                    }
                  } finally {
                    setIsUploadingDeliv(false);
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
                  gap: 12,
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 3 }}>
                      Vincular a Hito / Fase
                    </label>
                    <select
                      value={inlineDeliverable.milestoneId}
                      onChange={(e) => setInlineDeliverable({ ...inlineDeliverable, milestoneId: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        borderRadius: 4,
                        border: '1px solid var(--border)',
                        fontSize: 12,
                        background: '#fff',
                      }}
                    >
                      <option value="">-- Entrega General / Sin Hito --</option>
                      {(proj.milestones || []).map((m) => (
                        <option key={m.id} value={m.id}>
                          Fase {m.order_index}: {m.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 3 }}>
                      Tipo de Entregable *
                    </label>
                    <select
                      value={inlineDeliverable.fileType}
                      onChange={(e) => setInlineDeliverable({ ...inlineDeliverable, fileType: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        borderRadius: 4,
                        border: '1px solid var(--border)',
                        fontSize: 12,
                        background: '#fff',
                      }}
                    >
                      <option value="PDF">Informe Técnico (PDF)</option>
                      <option value="ZIP">Paquete de Código / Artefactos (ZIP)</option>
                      <option value="DOCX">Documento de Especificación (DOCX)</option>
                      <option value="XLSX">Matriz de Datos / Auditoría (XLSX)</option>
                      <option value="URL">Enlace a Repositorio / Dashboard (URL)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 3 }}>
                      Versión de Entrega *
                    </label>
                    <input
                      type="text"
                      value={inlineDeliverable.version}
                      onChange={(e) => setInlineDeliverable({ ...inlineDeliverable, version: e.target.value })}
                      placeholder="e.g. v1.0, v1.2-rev"
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
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 3 }}>
                    Título del Entregable *
                  </label>
                  <input
                    type="text"
                    value={inlineDeliverable.title}
                    onChange={(e) => setInlineDeliverable({ ...inlineDeliverable, title: e.target.value })}
                    placeholder="e.g. Informe Forense de Rendimiento PostgreSQL & AWS ECS"
                    required
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

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 3 }}>
                      Archivo Adjunto (Storage Privado)
                    </label>
                    <input
                      type="file"
                      onChange={(e) => setInlineDelivFile(e.target.files?.[0] || null)}
                      accept=".pdf,.zip,.docx,.xlsx,.png,.jpg,.webp"
                      style={{ width: '100%', fontSize: 12 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 3 }}>
                      O Enlace Externo (Figma, GitHub, S3, etc.)
                    </label>
                    <input
                      type="url"
                      value={inlineDeliverable.externalUrl}
                      onChange={(e) => setInlineDeliverable({ ...inlineDeliverable, externalUrl: e.target.value })}
                      placeholder="https://..."
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
                    Notas Técnicas / Resumen de Cambios
                  </label>
                  <textarea
                    rows={2}
                    value={inlineDeliverable.notes}
                    onChange={(e) => setInlineDeliverable({ ...inlineDeliverable, notes: e.target.value })}
                    placeholder="Alcance cubierto en este entregable..."
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
                    disabled={isUploadingDeliv}
                    style={{
                      background: 'var(--ink)',
                      color: '#fff',
                      border: 'none',
                      padding: '8px 18px',
                      borderRadius: 16,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: isUploadingDeliv ? 'wait' : 'pointer',
                      opacity: isUploadingDeliv ? 0.7 : 1,
                    }}
                  >
                    {isUploadingDeliv ? 'Subiendo y notificando...' : 'Publicar Entregable'}
                  </button>
                </div>
              </form>
            )}

            {/* Deliverables List */}
            {proj.deliverables && proj.deliverables.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {proj.deliverables.map((deliv) => {
                  const isDownloading = downloadingDelivId === deliv.id;
                  return (
                    <div
                      key={deliv.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: '#fff',
                        padding: '12px 16px',
                        borderRadius: 6,
                        border: '1px solid var(--border)',
                        fontSize: 13,
                        flexWrap: 'wrap',
                        gap: 10,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                        <span
                          style={{
                            fontFamily: "'IBM Plex Mono', monospace",
                            fontSize: 10,
                            fontWeight: 700,
                            background: 'var(--cream2)',
                            color: 'var(--terracotta)',
                            padding: '4px 8px',
                            borderRadius: 4,
                            border: '1px solid var(--border)',
                            marginTop: 2,
                          }}
                        >
                          {deliv.file_type || 'DOC'}
                        </span>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <strong style={{ color: 'var(--ink)' }}>{deliv.title}</strong>
                            <span
                              style={{
                                fontFamily: "'IBM Plex Mono', monospace",
                                fontSize: 11,
                                color: 'var(--muted)',
                                background: 'rgba(36, 26, 18, 0.05)',
                                padding: '1px 6px',
                                borderRadius: 3,
                              }}
                            >
                              {deliv.version || 'v1.0'}
                            </span>
                          </div>
                          {deliv.notes && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>{deliv.notes}</div>}
                          <div style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: 'var(--muted)', marginTop: 4 }}>
                            {deliv.created_at
                              ? new Date(deliv.created_at).toLocaleDateString('es-PE', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : ''}
                          </div>
                        </div>
                      </div>

                      <div>
                        <button
                          type="button"
                          disabled={isDownloading}
                          onClick={async () => {
                            if (deliv.external_url) {
                              window.open(deliv.external_url, '_blank', 'noopener,noreferrer');
                              return;
                            }
                            if (!deliv.file_path) {
                              showToast?.({ type: 'warning', title: 'Archivo no disponible', message: 'No hay archivo adjunto.' });
                              return;
                            }
                            setDownloadingDelivId(deliv.id);
                            try {
                              const signedUrl = await getSignedDeliverableUrl(deliv.file_path, deliv.id);
                              if (signedUrl) {
                                window.open(signedUrl, '_blank', 'noopener,noreferrer');
                                showToast?.({
                                  type: 'info',
                                  title: 'Descarga Autorizada',
                                  message: `Descarga segura de "${deliv.title}" (15 min).`,
                                });
                              } else {
                                showToast?.({
                                  type: 'error',
                                  title: 'Error de Descarga',
                                  message: 'No se pudo generar la URL firmada.',
                                });
                              }
                            } catch (err) {
                              showToast?.({ type: 'error', title: 'Error', message: err.message });
                            } finally {
                              setDownloadingDelivId(null);
                            }
                          }}
                          className="btn-outline-hover"
                          style={{
                            background: 'none',
                            border: '1px solid var(--border)',
                            color: 'var(--ink)',
                            borderRadius: 16,
                            padding: '6px 14px',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: isDownloading ? 'wait' : 'pointer',
                            fontFamily: "'IBM Plex Sans', sans-serif",
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                          }}
                        >
                          <span>{isDownloading ? 'Firmando URL...' : deliv.external_url ? '🔗 Abrir Enlace' : '⬇ Descargar Auditado'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div
                style={{
                  padding: 20,
                  textAlign: 'center',
                  color: 'var(--muted)',
                  background: 'var(--cream2)',
                  borderRadius: 6,
                  border: '1px dashed var(--border)',
                  fontSize: 13,
                }}
              >
                No se han subido entregables para este proyecto aún.
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
  };

  const kanbanColumns = [
    {
      id: 'phase-01',
      title: 'Fase 01 — Diagnóstico',
      subtitle: 'Auditoría inicial & esquema',
      badgeColor: 'var(--terracotta)',
      projects: projects.filter((p) => p.status === 'EN_AUDITORIA' || (p.status === 'EN_PLANIFICACION' && p.pillar === 'auditoria')),
    },
    {
      id: 'phase-02',
      title: 'Fase 02 — Arquitectura',
      subtitle: 'Diseño técnico & solución cloud',
      badgeColor: 'var(--ochre)',
      projects: projects.filter((p) => p.status === 'EN_PLANIFICACION' && p.pillar !== 'auditoria'),
    },
    {
      id: 'phase-03',
      title: 'Fase 03 — Ingeniería & IA',
      subtitle: 'Modelado, APIs & pipelines',
      badgeColor: '#345995',
      projects: projects.filter((p) => p.status === 'EN_DESARROLLO'),
    },
    {
      id: 'phase-04',
      title: 'Fase 04 — Certificación',
      subtitle: 'Validación forense & entrega',
      badgeColor: '#2E7559',
      projects: projects.filter((p) => ['EN_VALIDACION', 'ENTREGADO', 'FINALIZADO'].includes(p.status)),
    },
  ];

  const matchedProjectIds = new Set(kanbanColumns.flatMap((c) => c.projects.map((p) => p.id)));
  const orphanProjects = projects.filter((p) => !matchedProjectIds.has(p.id));
  if (orphanProjects.length > 0) {
    kanbanColumns[0].projects.push(...orphanProjects);
  }

  return (
    <div>
      {/* Module Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: "'Spectral', serif", fontSize: 24, margin: '0 0 4px', color: 'var(--ink)' }}>
            Proyectos en Curso & Auditorías ({projects.length})
          </h2>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--muted)' }}>
            {isAdmin
              ? 'Supervisión técnica, cronograma de hitos, asignación de consultores y entregables firmados.'
              : 'Seguimiento operativo de cronogramas y tareas técnicas asignadas.'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Layout View Mode Switcher (4 Modes) */}
          <div
            role="group"
            aria-label="Modo de visualización de proyectos"
            style={{
              display: 'inline-flex',
              background: 'var(--cream2)',
              border: '1px solid var(--border)',
              borderRadius: 6,
              padding: 2,
            }}
          >
            <button
              type="button"
              onClick={() => setViewLayout('LIST')}
              title="Vista Lista Extendida (100% Ancho)"
              aria-pressed={viewLayout === 'LIST'}
              style={{
                background: viewLayout === 'LIST' ? 'var(--ink)' : 'transparent',
                color: viewLayout === 'LIST' ? 'var(--gold)' : 'var(--muted)',
                border: 'none',
                borderRadius: 4,
                padding: '6px 12px',
                fontSize: 12,
                fontWeight: 600,
                fontFamily: "'IBM Plex Sans', sans-serif",
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                transition: 'all 0.15s ease',
              }}
            >
              <span>☰ Lista</span>
            </button>
            <button
              type="button"
              onClick={() => setViewLayout('GRID')}
              title="Vista Cuadrícula 2 Columnas"
              aria-pressed={viewLayout === 'GRID'}
              style={{
                background: viewLayout === 'GRID' ? 'var(--ink)' : 'transparent',
                color: viewLayout === 'GRID' ? 'var(--gold)' : 'var(--muted)',
                border: 'none',
                borderRadius: 4,
                padding: '6px 12px',
                fontSize: 12,
                fontWeight: 600,
                fontFamily: "'IBM Plex Sans', sans-serif",
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                transition: 'all 0.15s ease',
              }}
            >
              <span>▦ Cuadrícula</span>
            </button>
            <button
              type="button"
              onClick={() => setViewLayout('SPLIT')}
              title="Vista Maestro-Detalle Dividida (60/40)"
              aria-pressed={viewLayout === 'SPLIT'}
              style={{
                background: viewLayout === 'SPLIT' ? 'var(--ink)' : 'transparent',
                color: viewLayout === 'SPLIT' ? 'var(--gold)' : 'var(--muted)',
                border: 'none',
                borderRadius: 4,
                padding: '6px 12px',
                fontSize: 12,
                fontWeight: 600,
                fontFamily: "'IBM Plex Sans', sans-serif",
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                transition: 'all 0.15s ease',
              }}
            >
              <span>◫ Split 60/40</span>
            </button>
            <button
              type="button"
              onClick={() => setViewLayout('KANBAN')}
              title="Vista Tablero Kanban por Fases Metodológicas"
              aria-pressed={viewLayout === 'KANBAN'}
              style={{
                background: viewLayout === 'KANBAN' ? 'var(--ink)' : 'transparent',
                color: viewLayout === 'KANBAN' ? 'var(--gold)' : 'var(--muted)',
                border: 'none',
                borderRadius: 4,
                padding: '6px 12px',
                fontSize: 12,
                fontWeight: 600,
                fontFamily: "'IBM Plex Sans', sans-serif",
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                transition: 'all 0.15s ease',
              }}
            >
              <span>☷ Kanban</span>
            </button>
          </div>

          {isAdmin && onOpenNewProject && (
            <button
              type="button"
              onClick={onOpenNewProject}
              className="btn-hover"
              style={{
                background: 'var(--terracotta)',
                color: '#fff',
                border: 'none',
                borderRadius: 20,
                padding: '9px 18px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontFamily: "'IBM Plex Sans', sans-serif",
              }}
            >
              <span>+ Registrar Nuevo Proyecto</span>
            </button>
          )}
        </div>
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
      ) : viewLayout === 'SPLIT' ? (
        /* VISTA SPLIT MAESTRO-DETALLE (60/40) */
        <div className="equipo-split-container">
          {/* Master List (Left Pane) */}
          <div className="equipo-split-master">
            <div className="equipo-split-master-header">
              <span style={{ fontWeight: 600, fontSize: 13 }}>Proyectos Activos ({projects.length})</span>
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>Selecciona para inspeccionar</span>
            </div>
            <div className="equipo-split-master-list">
              {projects.map((proj) => {
                const isSelected = proj.id === activeSelectedId;
                const totalMilestones = proj.milestones?.length || 0;
                const weightedProgress = calculateProjectProgress(proj.milestones, proj.tasks || []);
                const progressPct =
                  proj.progress !== undefined && proj.progress !== null && proj.progress > 0 ? proj.progress : weightedProgress;
                const pColor = PROJECT_STATUS_COLORS[proj.status] || PROJECT_STATUS_COLORS.EN_PLANIFICACION;

                return (
                  <div
                    key={proj.id}
                    className={`equipo-split-master-card ${isSelected ? 'is-active' : ''}`}
                    onClick={() => setSelectedProjId(proj.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedProjId(proj.id);
                      }
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span className="equipo-split-master-pillar">{PILLAR_LABELS[proj.pillar] || proj.pillar}</span>
                      <span
                        style={{
                          fontSize: 10,
                          padding: '2px 6px',
                          borderRadius: 4,
                          background: pColor.bg,
                          color: pColor.text,
                          border: `1px solid ${pColor.border}`,
                          fontWeight: 700,
                          fontFamily: "'IBM Plex Mono', monospace",
                        }}
                      >
                        {proj.status}
                      </span>
                    </div>
                    <h4 className="equipo-split-master-title">{proj.title}</h4>
                    <div className="equipo-split-master-client">
                      Cliente: {proj.client?.full_name || proj.client?.email || 'Inmerge Client'}
                    </div>
                    <div className="equipo-split-master-progress-bar">
                      <div
                        className="equipo-split-master-progress-fill"
                        style={{
                          width: `${progressPct}%`,
                          background: progressPct === 100 ? '#2E7559' : 'var(--terracotta)',
                        }}
                      />
                    </div>
                    <div className="equipo-split-master-meta">
                      <span>{progressPct}% avance</span>
                      <span>{totalMilestones} hitos</span>
                      <span>{proj.tasks?.length || 0} tareas</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detail Inspector (Right Pane) */}
          <div className="equipo-split-detail">
            {selectedProject ? (
              renderProjectCard(selectedProject, true)
            ) : (
              <div className="equipo-split-detail-empty">
                Selecciona un proyecto de la columna izquierda para inspeccionar sus hitos, entregables y tareas.
              </div>
            )}
          </div>
        </div>
      ) : viewLayout === 'KANBAN' ? (
        /* VISTA KANBAN POR FASES METODOLÓGICAS */
        <div className="equipo-kanban-board">
          {kanbanColumns.map((col) => (
            <div key={col.id} className="equipo-kanban-column">
              <div className="equipo-kanban-column-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: col.badgeColor,
                      display: 'inline-block',
                    }}
                  />
                  <h4 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{col.title}</h4>
                </div>
                <span className="equipo-kanban-badge">{col.projects.length}</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 12 }}>{col.subtitle}</div>

              <div className="equipo-kanban-cards-list">
                {col.projects.length === 0 ? (
                  <div className="equipo-kanban-empty">Sin proyectos en esta etapa</div>
                ) : (
                  col.projects.map((proj) => {
                    const weightedProgress = calculateProjectProgress(proj.milestones, proj.tasks || []);
                    const progressPct =
                      proj.progress !== undefined && proj.progress !== null && proj.progress > 0 ? proj.progress : weightedProgress;
                    const pColor = PROJECT_STATUS_COLORS[proj.status] || PROJECT_STATUS_COLORS.EN_PLANIFICACION;

                    return (
                      <div key={proj.id} className="equipo-kanban-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6 }}>
                          <span
                            style={{
                              fontSize: 10,
                              fontFamily: "'IBM Plex Mono', monospace",
                              color: 'var(--muted)',
                            }}
                          >
                            {PILLAR_LABELS[proj.pillar] || proj.pillar}
                          </span>
                          <span
                            style={{
                              fontSize: 10,
                              padding: '2px 5px',
                              borderRadius: 4,
                              background: pColor.bg,
                              color: pColor.text,
                              fontWeight: 700,
                              fontFamily: "'IBM Plex Mono', monospace",
                            }}
                          >
                            {proj.status}
                          </span>
                        </div>

                        <h5 className="equipo-kanban-card-title">{proj.title}</h5>
                        <div className="equipo-kanban-card-client">{proj.client?.full_name || proj.client?.email || 'Inmerge Client'}</div>

                        <div style={{ margin: '10px 0 6px' }}>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              fontSize: 10,
                              color: 'var(--muted)',
                              marginBottom: 4,
                            }}
                          >
                            <span>Progreso</span>
                            <span>{progressPct}%</span>
                          </div>
                          <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                            <div
                              style={{
                                height: '100%',
                                width: `${progressPct}%`,
                                background: progressPct === 100 ? '#2E7559' : 'var(--terracotta)',
                              }}
                            />
                          </div>
                        </div>

                        <div className="equipo-kanban-card-footer">
                          <div style={{ display: 'flex', gap: 8, fontSize: 11, color: 'var(--muted)' }}>
                            <span>📍 {proj.milestones?.length || 0}</span>
                            <span>📦 {proj.deliverables?.length || 0}</span>
                          </div>

                          <button
                            type="button"
                            className="btn-kanban-inspect"
                            onClick={() => {
                              setSelectedProjId(proj.id);
                              setViewLayout('SPLIT');
                            }}
                            title="Abrir inspector de proyecto en vista Split"
                          >
                            Inspeccionar →
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* VISTA LISTA O CUADRÍCULA */
        <div
          style={
            viewLayout === 'GRID'
              ? {
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 580px), 1fr))',
                  gap: 20,
                  alignItems: 'start',
                }
              : {
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 20,
                }
          }
        >
          {projects.map((proj) => renderProjectCard(proj, false))}
        </div>
      )}

      <DocumentPreviewDrawer
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        document={activePreviewDoc}
        showToast={showToast}
      />
    </div>
  );
}
