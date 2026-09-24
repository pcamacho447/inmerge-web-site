/**
 * pm.js - Módulo de Lógica y Métricas de Project Management (PM) para Inmerge
 * Sistema de Diseño: Editorial Tech Premium
 */

export const HEALTH_STATUS_CONFIG = {
  ON_TRACK: {
    key: 'ON_TRACK',
    label: 'En Tiempo',
    color: 'var(--green, #4A9C6A)',
    badgeBg: 'rgba(74, 156, 106, 0.12)',
    icon: '✓',
    description: 'El proyecto avanza según el cronograma acordado.',
  },
  AT_RISK: {
    key: 'AT_RISK',
    label: 'En Riesgo',
    color: 'var(--gold, #D8A84E)',
    badgeBg: 'rgba(216, 168, 78, 0.15)',
    icon: '⚠️',
    description: 'Existen posibles desviaciones o hitos próximos a vencer.',
  },
  DELAYED: {
    key: 'DELAYED',
    label: 'Retrasado',
    color: 'var(--terracotta, #A8472B)',
    badgeBg: 'rgba(168, 71, 43, 0.15)',
    icon: '⏱️',
    description: 'La fecha meta ha sido superada o se requiere reajuste.',
  },
  BLOCKED: {
    key: 'BLOCKED',
    label: 'Bloqueado',
    color: '#C53030',
    badgeBg: 'rgba(197, 48, 48, 0.15)',
    icon: '🛑',
    description: 'El proyecto presenta impedimentos técnicos o de acceso.',
  },
};

export const TASK_STATUS_CONFIG = {
  TODO: { key: 'TODO', label: 'Por Hacer', color: 'var(--muted, #7A6B58)', bg: 'rgba(122, 107, 88, 0.08)' },
  IN_PROGRESS: { key: 'IN_PROGRESS', label: 'En Progreso', color: 'var(--gold, #D8A84E)', bg: 'rgba(216, 168, 78, 0.15)' },
  REVIEW: { key: 'REVIEW', label: 'En Revisión', color: '#3182CE', bg: 'rgba(49, 130, 206, 0.12)' },
  DONE: { key: 'DONE', label: 'Completada', color: 'var(--green, #4A9C6A)', bg: 'rgba(74, 156, 106, 0.12)' },
  BLOCKED: { key: 'BLOCKED', label: 'Bloqueada', color: 'var(--terracotta, #A8472B)', bg: 'rgba(168, 71, 43, 0.15)' },
};

export const TASK_PRIORITY_CONFIG = {
  BAJA: { key: 'BAJA', label: 'Baja', color: 'var(--muted, #7A6B58)' },
  MEDIA: { key: 'MEDIA', label: 'Media', color: 'var(--ink, #241A12)' },
  ALTA: { key: 'ALTA', label: 'Alta', color: 'var(--ochre, #C68A3D)' },
  CRITICA: { key: 'CRITICA', label: 'Crítica', color: 'var(--terracotta, #A8472B)' },
};

export const RISK_SEVERITY_CONFIG = {
  BAJA: { key: 'BAJA', label: 'Leve', color: 'var(--muted, #7A6B58)', bg: 'rgba(122, 107, 88, 0.08)' },
  MEDIA: { key: 'MEDIA', label: 'Moderado', color: 'var(--gold, #D8A84E)', bg: 'rgba(216, 168, 78, 0.15)' },
  ALTA: { key: 'ALTA', label: 'Alto', color: 'var(--ochre, #C68A3D)', bg: 'rgba(198, 138, 61, 0.15)' },
  CRITICA: { key: 'CRITICA', label: 'Crítico', color: 'var(--terracotta, #A8472B)', bg: 'rgba(168, 71, 43, 0.15)' },
};

export const RISK_STATUS_CONFIG = {
  ABIERTO: { key: 'ABIERTO', label: 'Abierto', color: 'var(--terracotta, #A8472B)' },
  EN_MITIGACION: { key: 'EN_MITIGACION', label: 'En Mitigación', color: 'var(--gold, #D8A84E)' },
  RESUELTO: { key: 'RESUELTO', label: 'Resuelto', color: 'var(--green, #4A9C6A)' },
};

export const DELIVERABLE_STATUS_CONFIG = {
  BORRADOR_INTERNO: {
    key: 'BORRADOR_INTERNO',
    label: 'Borrador Interno',
    color: 'var(--muted, #7A6B58)',
    bg: 'rgba(122, 107, 88, 0.12)',
    description: 'En elaboración por el auditor o ingeniero. No visible para el cliente.',
  },
  EN_REVISION: {
    key: 'EN_REVISION',
    label: 'En Revisión Lead',
    color: 'var(--gold, #D8A84E)',
    bg: 'rgba(216, 168, 78, 0.15)',
    description: 'Listo para revisión técnica del Tech Lead o Administrador.',
  },
  PUBLICADO_CLIENTE: {
    key: 'PUBLICADO_CLIENTE',
    label: 'Publicado al Cliente',
    color: 'var(--green, #4A9C6A)',
    bg: 'rgba(74, 156, 106, 0.15)',
    description: 'Aprobado y disponible para descarga en el portal del cliente.',
  },
};

export const FINDING_SEVERITY_CONFIG = {
  CRITICA: { key: 'CRITICA', label: 'Crítica', color: 'var(--terracotta, #A8472B)', bg: 'rgba(168, 71, 43, 0.15)', badge: 'CRIT' },
  ALTA: { key: 'ALTA', label: 'Alta', color: 'var(--ochre, #C68A3D)', bg: 'rgba(198, 138, 61, 0.15)', badge: 'HIGH' },
  MEDIA: { key: 'MEDIA', label: 'Media', color: 'var(--gold, #D8A84E)', bg: 'rgba(216, 168, 78, 0.15)', badge: 'MED' },
  BAJA: { key: 'BAJA', label: 'Baja', color: 'var(--muted, #7A6B58)', bg: 'rgba(122, 107, 88, 0.12)', badge: 'LOW' },
  INFORMATIVA: { key: 'INFORMATIVA', label: 'Informativa', color: '#3182CE', bg: 'rgba(49, 130, 206, 0.12)', badge: 'INFO' },
};

export const FINDING_CATEGORY_CONFIG = {
  CORE_WEB_VITALS: { key: 'CORE_WEB_VITALS', label: '01. Core Web Vitals & Web Perf', icon: '⚡' },
  DATOS_CLOUD: { key: 'DATOS_CLOUD', label: '02. Datos & BigQuery / SQL', icon: '📊' },
  SEGURIDAD_OWASP: { key: 'SEGURIDAD_OWASP', label: '03. Seguridad Cloud & OWASP', icon: '🔒' },
  ARQUITECTURA_CLOUD: { key: 'ARQUITECTURA_CLOUD', label: '04. Arquitectura & Infra', icon: '☁️' },
  CALIDAD_CODIGO: { key: 'CALIDAD_CODIGO', label: '05. Calidad de Código & Testing', icon: '🛠️' },
};

export const FINDING_STATUS_CONFIG = {
  DETECTADO: { key: 'DETECTADO', label: 'Detectado', color: 'var(--terracotta, #A8472B)', bg: 'rgba(168, 71, 43, 0.12)' },
  EN_CORRECCION: { key: 'EN_CORRECCION', label: 'En Corrección', color: 'var(--gold, #D8A84E)', bg: 'rgba(216, 168, 78, 0.15)' },
  VERIFICADO: { key: 'VERIFICADO', label: 'Verificado / Resuelto', color: 'var(--green, #4A9C6A)', bg: 'rgba(74, 156, 106, 0.15)' },
};

/**
 * Calcula el progreso de un hito individual basado en sus tareas o en su estado directo.
 * Optimizado mediante recorrido único (single-pass O(N)).
 * @param {Object} milestone
 * @param {Array} tasks
 * @returns {number} Porcentaje de 0 a 100
 */
export function calculateMilestoneProgress(milestone, tasks = []) {
  if (!milestone) return 0;

  const mId = String(milestone.id);
  const taskList = tasks || [];
  let totalWeight = 0;
  let completedWeight = 0;
  let matchingCount = 0;

  for (let i = 0; i < taskList.length; i++) {
    const t = taskList[i];
    if (String(t.milestone_id) === mId) {
      matchingCount++;
      const weight = Number(t.weight) || 1;
      totalWeight += weight;
      if (t.status === 'DONE') {
        completedWeight += weight;
      } else if (t.status === 'REVIEW') {
        completedWeight += weight * 0.8;
      } else if (t.status === 'IN_PROGRESS') {
        completedWeight += weight * 0.4;
      }
    }
  }

  if (matchingCount === 0) {
    if (milestone.status === 'COMPLETADO') return 100;
    if (milestone.status === 'EN_PROGRESO' || milestone.status === 'EN_PROCESO') return 50;
    return 0;
  }

  if (totalWeight === 0) return 0;

  return Math.min(100, Math.max(0, Math.round((completedWeight / totalWeight) * 100)));
}

/**
 * Calcula el progreso global ponderado de un proyecto.
 * @param {Array} milestones
 * @param {Array} tasks
 * @returns {number} Porcentaje de 0 a 100
 */
export function calculateProjectProgress(milestones = [], tasks = []) {
  if (!milestones || milestones.length === 0) {
    if (!tasks || tasks.length === 0) return 0;
    // Si no hay hitos pero sí tareas: pase único
    let totalWeight = 0;
    let doneWeight = 0;
    for (let i = 0; i < tasks.length; i++) {
      const weight = Number(tasks[i].weight) || 1;
      totalWeight += weight;
      if (tasks[i].status === 'DONE') {
        doneWeight += weight;
      }
    }
    if (totalWeight === 0) return 0;
    return Math.round((doneWeight / totalWeight) * 100);
  }

  let totalMilestoneWeight = 0;
  let accumulatedProgress = 0;

  for (let i = 0; i < milestones.length; i++) {
    const m = milestones[i];
    const mWeight = Number(m.weight) || 1;
    const mProg = calculateMilestoneProgress(m, tasks);
    totalMilestoneWeight += mWeight;
    accumulatedProgress += mProg * mWeight;
  }

  if (totalMilestoneWeight === 0) return 0;
  return Math.min(100, Math.max(0, Math.round(accumulatedProgress / totalMilestoneWeight)));
}

/**
 * Calcula total de horas estimadas vs horas reales incurridas en un único pase
 * @param {Array} tasks
 * @returns {{ estimatedHours: number, actualHours: number, varianceHours: number }}
 */
export function calculateProjectHours(tasks = []) {
  if (!tasks || tasks.length === 0) {
    return { estimatedHours: 0, actualHours: 0, varianceHours: 0 };
  }

  let estimated = 0;
  let actual = 0;
  for (let i = 0; i < tasks.length; i++) {
    const t = tasks[i];
    estimated += Number(t.estimated_hours) || 0;
    actual += Number(t.actual_hours) || 0;
  }

  return {
    estimatedHours: Number(estimated.toFixed(1)),
    actualHours: Number(actual.toFixed(1)),
    varianceHours: Number((actual - estimated).toFixed(1)),
  };
}

/**
 * Determina el estado de salud sugerido (RAG) para un proyecto según bloqueos y fechas.
 * @param {Object} project
 * @param {Array} milestones
 * @param {Array} risks
 * @returns {string} ON_TRACK | AT_RISK | DELAYED | BLOCKED
 */
export function deriveProjectHealth(project, milestones = [], risks = []) {
  if (!project) return 'ON_TRACK';

  // 1. Si hay riesgos críticos abiertos, está bloqueado
  const activeCriticalRisks = (risks || []).filter((r) => r.status !== 'RESUELTO' && (r.severity === 'CRITICA' || r.severity === 'ALTA'));
  if (activeCriticalRisks.length > 0) {
    return 'BLOCKED';
  }

  const now = new Date();

  // 2. Si la fecha meta del proyecto ya venció y el progreso < 100, está retrasado
  if (project.target_end_date) {
    const targetEnd = new Date(project.target_end_date);
    if (now > targetEnd && (project.progress || 0) < 100) {
      return 'DELAYED';
    }
  }

  // 3. Si algún hito activo venció en fecha sin completarse
  const overdueMilestones = (milestones || []).filter((m) => {
    if (m.status === 'COMPLETADO') return false;
    if (!m.due_date) return false;
    return now > new Date(m.due_date);
  });

  if (overdueMilestones.length > 0) {
    return 'AT_RISK';
  }

  return project.health_status || 'ON_TRACK';
}

/**
 * Sanitiza el payload para crear o actualizar una tarea
 */
export function sanitizeTaskPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Payload de tarea inválido');
  }
  if (!payload.title || typeof payload.title !== 'string' || !payload.title.trim()) {
    throw new Error('El título de la tarea es obligatorio.');
  }

  const validStatuses = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'BLOCKED'];
  const validPriorities = ['BAJA', 'MEDIA', 'ALTA', 'CRITICA'];

  return {
    project_id: payload.project_id,
    milestone_id: payload.milestone_id || null,
    title: payload.title.trim(),
    description: payload.description ? String(payload.description).trim() : null,
    status: validStatuses.includes(payload.status) ? payload.status : 'TODO',
    priority: validPriorities.includes(payload.priority) ? payload.priority : 'MEDIA',
    assigned_to_name: payload.assigned_to_name ? String(payload.assigned_to_name).trim() : null,
    assigned_to_email: payload.assigned_to_email ? String(payload.assigned_to_email).trim().toLowerCase() : null,
    estimated_hours: Math.max(0, Number(payload.estimated_hours) || 0),
    actual_hours: Math.max(0, Number(payload.actual_hours) || 0),
    weight: Math.max(1, parseInt(payload.weight, 10) || 1),
    due_date: payload.due_date || null,
    completed_at: payload.status === 'DONE' ? payload.completed_at || new Date().toISOString() : null,
  };
}

/**
 * Sanitiza el payload para crear o actualizar un riesgo/bloqueo
 */
export function sanitizeRiskPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Payload de riesgo inválido');
  }
  if (!payload.title || typeof payload.title !== 'string' || !payload.title.trim()) {
    throw new Error('El título del riesgo/bloqueo es obligatorio.');
  }

  const validSeverities = ['BAJA', 'MEDIA', 'ALTA', 'CRITICA'];
  const validStatuses = ['ABIERTO', 'EN_MITIGACION', 'RESUELTO'];

  return {
    project_id: payload.project_id,
    milestone_id: payload.milestone_id || null,
    title: payload.title.trim(),
    description: payload.description ? String(payload.description).trim() : null,
    severity: validSeverities.includes(payload.severity) ? payload.severity : 'MEDIA',
    status: validStatuses.includes(payload.status) ? payload.status : 'ABIERTO',
    impact: payload.impact ? String(payload.impact).trim() : null,
    mitigation_plan: payload.mitigation_plan ? String(payload.mitigation_plan).trim() : null,
    resolved_at: payload.status === 'RESUELTO' ? payload.resolved_at || new Date().toISOString() : null,
  };
}

/**
 * Sanitiza el payload para crear o actualizar un entregable técnico
 */
export function sanitizeDeliverablePayload(payload) {
  if (!payload || typeof payload !== 'object') throw new Error('Payload de entregable inválido');
  if (!payload.title || !String(payload.title).trim()) throw new Error('El título del entregable es obligatorio.');

  const validStatuses = ['BORRADOR_INTERNO', 'EN_REVISION', 'PUBLICADO_CLIENTE'];
  const validFileTypes = ['PDF', 'DASHBOARD_URL', 'REPO', 'DATASET', 'DOCUMENTO', 'XLSX', 'ZIP'];

  return {
    project_id: payload.projectId || payload.project_id,
    milestone_id: payload.milestoneId || payload.milestone_id || null,
    title: String(payload.title).trim(),
    file_type: validFileTypes.includes(payload.fileType || payload.file_type) ? payload.fileType || payload.file_type : 'PDF',
    file_path: payload.filePath || payload.file_path || null,
    external_url: payload.externalUrl || payload.external_url || null,
    version: payload.version ? String(payload.version).trim() : 'v1.0',
    notes: payload.notes ? String(payload.notes).trim() : '',
    status: validStatuses.includes(payload.status) ? payload.status : 'BORRADOR_INTERNO',
    author_name: payload.authorName || payload.author_name || null,
    author_email: payload.authorEmail || payload.author_email || null,
  };
}

/**
 * Sanitiza el payload para registrar o actualizar un hallazgo técnico de auditoría
 */
export function sanitizeFindingPayload(payload) {
  if (!payload || typeof payload !== 'object') throw new Error('Payload de hallazgo inválido');
  if (!payload.title || !String(payload.title).trim()) throw new Error('El título del hallazgo es obligatorio.');

  const validSeverities = ['CRITICA', 'ALTA', 'MEDIA', 'BAJA', 'INFORMATIVA'];
  const validCategories = ['CORE_WEB_VITALS', 'DATOS_CLOUD', 'SEGURIDAD_OWASP', 'ARQUITECTURA_CLOUD', 'CALIDAD_CODIGO'];
  const validStatuses = ['DETECTADO', 'EN_CORRECCION', 'VERIFICADO'];

  return {
    project_id: payload.project_id || payload.projectId,
    milestone_id: payload.milestone_id || payload.milestoneId || null,
    finding_code: payload.finding_code
      ? String(payload.finding_code).trim().toUpperCase()
      : `FIND-${Date.now().toString(36).toUpperCase()}`,
    title: String(payload.title).trim(),
    category: validCategories.includes(payload.category) ? payload.category : 'CORE_WEB_VITALS',
    severity: validSeverities.includes(payload.severity) ? payload.severity : 'MEDIA',
    status: validStatuses.includes(payload.status) ? payload.status : 'DETECTADO',
    evidence_notes: payload.evidence_notes ? String(payload.evidence_notes).trim() : null,
    recommendation: payload.recommendation ? String(payload.recommendation).trim() : null,
    created_by_name: payload.created_by_name || null,
    created_by_email: payload.created_by_email || null,
  };
}

/**
 * Consulta las métricas analíticas del proyecto mediante el RPC PostgreSQL get_project_analytics
 * con fallback local resiliente.
 */
export async function fetchProjectAnalytics(projectId, localProjectData = null) {
  if (!projectId) return null;

  try {
    const { supabase } = await import('./supabaseClient.js');
    if (supabase && typeof supabase.rpc === 'function') {
      const { data, error } = await supabase.rpc('get_project_analytics', {
        p_project_id: projectId,
      });
      if (!error && data) {
        return data;
      }
    }
  } catch (rpcErr) {
    console.warn('[pm] RPC get_project_analytics no disponible, calculando en cliente:', rpcErr);
  }

  // Fallback analítico local si se pasan los datos del proyecto (recorrido en pase único)
  if (localProjectData) {
    const tasks = localProjectData.tasks || [];
    const milestones = localProjectData.milestones || [];
    const risks = localProjectData.risks || [];
    const findings = localProjectData.findings || [];

    const totalTasks = tasks.length;
    let completedTasks = 0;
    let inProgressTasks = 0;
    let blockedTasks = 0;
    let overdueTasks = 0;
    let estHours = 0;
    let actHours = 0;
    const now = new Date();

    for (let i = 0; i < totalTasks; i++) {
      const t = tasks[i];
      if (t.status === 'DONE') {
        completedTasks++;
      } else {
        if (t.status === 'IN_PROGRESS') {
          inProgressTasks++;
        } else if (t.status === 'BLOCKED') {
          blockedTasks++;
        }
        if (t.due_date && new Date(t.due_date) < now) {
          overdueTasks++;
        }
      }
      estHours += Number(t.estimated_hours) || 0;
      actHours += Number(t.actual_hours) || 0;
    }

    const variance = estHours > 0 ? Number((((actHours - estHours) / estHours) * 100).toFixed(2)) : 0;
    const completionPct = totalTasks > 0 ? Number(((completedTasks / totalTasks) * 100).toFixed(1)) : 0;

    let completedMilestones = 0;
    for (let i = 0; i < milestones.length; i++) {
      if (milestones[i].status === 'COMPLETED') completedMilestones++;
    }

    let openRisksCount = 0;
    for (let i = 0; i < risks.length; i++) {
      if (risks[i].status !== 'RESUELTO') openRisksCount++;
    }

    let openCriticalFindingsCount = 0;
    for (let i = 0; i < findings.length; i++) {
      const f = findings[i];
      if (f.status !== 'VERIFICADO' && (f.severity === 'CRITICA' || f.severity === 'ALTA')) {
        openCriticalFindingsCount++;
      }
    }

    return {
      project_id: projectId,
      total_tasks: totalTasks,
      completed_tasks: completedTasks,
      in_progress_tasks: inProgressTasks,
      blocked_tasks: blockedTasks,
      overdue_tasks: overdueTasks,
      total_estimated_hours: estHours,
      total_actual_hours: actHours,
      effort_variance_pct: variance,
      completion_pct: completionPct,
      total_milestones: milestones.length,
      completed_milestones: completedMilestones,
      open_risks_count: openRisksCount,
      open_critical_findings_count: openCriticalFindingsCount,
    };
  }

  return null;
}

/**
 * Agrega y calcula métricas analíticas consolidadas de un conjunto de proyectos en un único pase O(N).
 * Optimizado para el portal de clientes y tableros ejecutivos.
 *
 * @param {Array} projects - Lista de proyectos con sus tareas y entregables asociados
 * @returns {{
 *   totalProjects: number,
 *   totalTasks: number,
 *   completedTasks: number,
 *   completionPct: number,
 *   estimatedHours: number,
 *   actualHours: number,
 *   varianceHours: number,
 *   publishedDeliverablesCount: number,
 *   healthCounts: { ON_TRACK: number, AT_RISK: number, DELAYED: number, BLOCKED: number }
 * }}
 */
export function calculateAggregatedProjectMetrics(projects = []) {
  const emptyMetrics = {
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    completionPct: 0,
    estimatedHours: 0,
    actualHours: 0,
    varianceHours: 0,
    publishedDeliverablesCount: 0,
    healthCounts: {
      ON_TRACK: 0,
      AT_RISK: 0,
      DELAYED: 0,
      BLOCKED: 0,
    },
  };

  if (!projects || !Array.isArray(projects) || projects.length === 0) {
    return emptyMetrics;
  }

  let totalProjects = 0;
  let totalTasks = 0;
  let completedTasks = 0;
  let estHours = 0;
  let actHours = 0;
  let publishedDeliverablesCount = 0;

  const healthCounts = {
    ON_TRACK: 0,
    AT_RISK: 0,
    DELAYED: 0,
    BLOCKED: 0,
  };

  for (let i = 0; i < projects.length; i++) {
    const proj = projects[i];
    if (!proj || typeof proj !== 'object') continue;

    totalProjects++;

    const health = proj.health_status || 'ON_TRACK';
    if (healthCounts[health] !== undefined) {
      healthCounts[health]++;
    } else {
      healthCounts[health] = (healthCounts[health] || 0) + 1;
    }

    const tasks = proj.tasks || proj.project_tasks || [];
    if (Array.isArray(tasks)) {
      for (let j = 0; j < tasks.length; j++) {
        const t = tasks[j];
        if (!t || typeof t !== 'object') continue;

        totalTasks++;
        if (t.status === 'DONE') {
          completedTasks++;
        }
        estHours += Number(t.estimated_hours) || 0;
        actHours += Number(t.actual_hours) || 0;
      }
    }

    const deliverables = proj.deliverables || proj.project_deliverables || [];
    if (Array.isArray(deliverables)) {
      for (let k = 0; k < deliverables.length; k++) {
        const d = deliverables[k];
        if (!d || typeof d !== 'object') continue;

        if (!d.status || d.status === 'PUBLICADO_CLIENTE') {
          publishedDeliverablesCount++;
        }
      }
    }
  }

  const completionPct = totalTasks > 0 ? Number(((completedTasks / totalTasks) * 100).toFixed(1)) : 0;
  const estimatedHours = Number(estHours.toFixed(1));
  const actualHours = Number(actHours.toFixed(1));
  const varianceHours = Number((actualHours - estimatedHours).toFixed(1));

  return {
    totalProjects,
    totalTasks,
    completedTasks,
    completionPct,
    estimatedHours,
    actualHours,
    varianceHours,
    publishedDeliverablesCount,
    healthCounts,
  };
}
