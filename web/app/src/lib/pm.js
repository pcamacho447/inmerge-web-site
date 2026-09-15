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

/**
 * Calcula el progreso de un hito individual basado en sus tareas o en su estado directo.
 * @param {Object} milestone
 * @param {Array} tasks
 * @returns {number} Porcentaje de 0 a 100
 */
export function calculateMilestoneProgress(milestone, tasks = []) {
  if (!milestone) return 0;
  
  const milestoneTasks = (tasks || []).filter(
    (t) => String(t.milestone_id) === String(milestone.id)
  );

  if (milestoneTasks.length === 0) {
    if (milestone.status === 'COMPLETADO') return 100;
    if (milestone.status === 'EN_PROGRESO' || milestone.status === 'EN_PROCESO') return 50;
    return 0;
  }

  const totalWeight = milestoneTasks.reduce((sum, t) => sum + (Number(t.weight) || 1), 0);
  if (totalWeight === 0) return 0;

  const completedWeight = milestoneTasks.reduce((sum, t) => {
    const weight = Number(t.weight) || 1;
    if (t.status === 'DONE') return sum + weight;
    if (t.status === 'REVIEW') return sum + weight * 0.8;
    if (t.status === 'IN_PROGRESS') return sum + weight * 0.4;
    return sum;
  }, 0);

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
    // Si no hay hitos pero sí tareas
    const totalWeight = tasks.reduce((sum, t) => sum + (Number(t.weight) || 1), 0);
    if (totalWeight === 0) return 0;
    const doneWeight = tasks.filter((t) => t.status === 'DONE').reduce((sum, t) => sum + (Number(t.weight) || 1), 0);
    return Math.round((doneWeight / totalWeight) * 100);
  }

  let totalMilestoneWeight = 0;
  let accumulatedProgress = 0;

  for (const m of milestones) {
    const mWeight = Number(m.weight) || 1;
    const mProg = calculateMilestoneProgress(m, tasks);
    totalMilestoneWeight += mWeight;
    accumulatedProgress += mProg * mWeight;
  }

  if (totalMilestoneWeight === 0) return 0;
  return Math.min(100, Math.max(0, Math.round(accumulatedProgress / totalMilestoneWeight)));
}

/**
 * Calcula total de horas estimadas vs horas reales incurridas
 * @param {Array} tasks
 * @returns {{ estimatedHours: number, actualHours: number, varianceHours: number }}
 */
export function calculateProjectHours(tasks = []) {
  if (!tasks || tasks.length === 0) {
    return { estimatedHours: 0, actualHours: 0, varianceHours: 0 };
  }

  const estimated = tasks.reduce((sum, t) => sum + (Number(t.estimated_hours) || 0), 0);
  const actual = tasks.reduce((sum, t) => sum + (Number(t.actual_hours) || 0), 0);

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
  const activeCriticalRisks = (risks || []).filter(
    (r) => r.status !== 'RESUELTO' && (r.severity === 'CRITICA' || r.severity === 'ALTA')
  );
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
    completed_at: payload.status === 'DONE' ? (payload.completed_at || new Date().toISOString()) : null,
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
    resolved_at: payload.status === 'RESUELTO' ? (payload.resolved_at || new Date().toISOString()) : null,
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

  // Fallback analítico local si se pasan los datos del proyecto
  if (localProjectData) {
    const tasks = localProjectData.tasks || [];
    const milestones = localProjectData.milestones || [];
    const risks = localProjectData.risks || [];

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'DONE').length;
    const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
    const blockedTasks = tasks.filter((t) => t.status === 'BLOCKED').length;
    const overdueTasks = tasks.filter((t) => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'DONE').length;

    const estHours = tasks.reduce((sum, t) => sum + (Number(t.estimated_hours) || 0), 0);
    const actHours = tasks.reduce((sum, t) => sum + (Number(t.actual_hours) || 0), 0);
    const variance = estHours > 0 ? Number((((actHours - estHours) / estHours) * 100).toFixed(2)) : 0;
    const completionPct = totalTasks > 0 ? Number(((completedTasks / totalTasks) * 100).toFixed(1)) : 0;

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
      completed_milestones: milestones.filter((m) => m.status === 'COMPLETED').length,
      open_risks_count: risks.filter((r) => r.status !== 'RESUELTO').length,
    };
  }

  return null;
}

