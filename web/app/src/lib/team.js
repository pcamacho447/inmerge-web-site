import { supabase } from './supabaseClient.js';
import { sanitizeDeliverablePayload, sanitizeFindingPayload } from './pm.js';
import { createInAppNotification } from './notifications.js';

const TEAM_PROJECTS_CACHE_TTL_MS = 30000; // 30s TTL
let teamProjectsCache = null;

export const TELEMETRY_CACHE_TTL_MS = 15000; // 15s TTL
let telemetrySnapshotCache = null;

let cacheHits = 0;
let cacheMisses = 0;

/**
 * Retorna las métricas operativas y de salud del caché en memoria del equipo.
 * @returns {{
 *   hits: number,
 *   misses: number,
 *   totalRequests: number,
 *   hitRatioPct: number,
 *   hasProjectsCache: boolean,
 *   hasTelemetryCache: boolean
 * }}
 */
export function getCacheTelemetryMetrics() {
  const now = Date.now();
  const totalRequests = cacheHits + cacheMisses;
  const hitRatioPct = totalRequests === 0 ? 0 : Number(((cacheHits / totalRequests) * 100).toFixed(2));

  return {
    hits: cacheHits,
    misses: cacheMisses,
    totalRequests,
    hitRatioPct,
    hasProjectsCache: Boolean(teamProjectsCache && now - teamProjectsCache.timestamp < TEAM_PROJECTS_CACHE_TTL_MS),
    hasTelemetryCache: Boolean(telemetrySnapshotCache && now - telemetrySnapshotCache.timestamp < TELEMETRY_CACHE_TTL_MS),
  };
}

/**
 * Restablece los contadores de telemetría de caché a cero (para diagnóstico o aislamiento en tests).
 */
export function resetCacheTelemetryMetrics() {
  cacheHits = 0;
  cacheMisses = 0;
}

/**
 * Invalida el caché en memoria de proyectos y/o telemetría del equipo técnico de forma granular.
 * @param {Object} [options={}]
 * @param {'all' | 'projects' | 'telemetry'} [options.entity='all']
 */
export function clearTeamDataCache({ entity = 'all' } = {}) {
  if (entity === 'all' || entity === 'projects') {
    teamProjectsCache = null;
  }
  if (entity === 'all' || entity === 'telemetry') {
    telemetrySnapshotCache = null;
  }
}

/**
 * Consulta la lista de clientes registrados en la plataforma.
 */
export async function fetchRegisteredClients() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, company, phone, role')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error al obtener clientes registrados:', error);
    throw new Error(error.message || 'No se pudieron cargar los clientes');
  }

  return data || [];
}

/**
 * Registra una entrada inmutable en la bitácora de auditoría (team_activity_logs).
 */
export async function logTeamActivity({ action, entityType, entityId = null, details = {} }) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase.from('team_activity_logs').insert({
      user_id: user?.id || null,
      action,
      entity_type: entityType,
      entity_id: entityId,
      details,
    });
  } catch (err) {
    console.warn('Activity logging warning:', err);
  }
}

/**
 * Consulta los registros recientes de la bitácora de auditoría.
 */
export async function fetchTeamActivityLogs({ limit = 50 } = {}) {
  const { data, error } = await supabase
    .from('team_activity_logs')
    .select(
      `
      id,
      action,
      entity_type,
      entity_id,
      details,
      created_at,
      author:user_id (
        id,
        email,
        full_name,
        role
      )
    `,
    )
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error al obtener logs de auditoría:', error);
    throw new Error(error.message || 'No se pudieron cargar los registros de auditoría');
  }

  return data || [];
}

/**
 * Consulta todas las solicitudes de cotización / TDRs para el equipo de consultores.
 */
export async function fetchTeamLeads() {
  const { data, error } = await supabase
    .from('leads_tdr')
    .select('*, assigned_profile:assigned_to(full_name, email)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error al obtener leads:', error);
    throw new Error(error.message || 'No se pudieron cargar los leads');
  }

  return data || [];
}

/**
 * Actualiza el estado o notas de un Lead TDR.
 */
export async function updateLeadStatus(leadId, { status, notes, assignedTo }) {
  const updates = {};
  if (status !== undefined) updates.status = status;
  if (notes !== undefined) updates.notes = notes;
  if (assignedTo !== undefined) updates.assigned_to = assignedTo;

  const { data, error } = await supabase.from('leads_tdr').update(updates).eq('id', leadId).select().single();

  if (error) {
    console.error('Error al actualizar lead:', error);
    throw new Error(error.message || 'No se pudo actualizar el estado del lead');
  }

  // Registrar en bitácora de auditoría
  logTeamActivity({
    action: 'LEAD_STATUS_UPDATED',
    entityType: 'lead',
    entityId: leadId,
    details: { new_status: status, notes, assigned_to: assignedTo, email: data?.email, full_name: data?.full_name },
  });

  return data;
}

/**
 * Consulta todos los proyectos y clientes para el equipo técnico con caché en memoria (30s TTL).
 */
export async function fetchTeamProjects({ forceRefresh = false } = {}) {
  const now = Date.now();
  if (!forceRefresh && teamProjectsCache && now - teamProjectsCache.timestamp < TEAM_PROJECTS_CACHE_TTL_MS) {
    cacheHits++;
    return teamProjectsCache.data;
  }

  cacheMisses++;
  const { data, error } = await supabase
    .from('client_projects')
    .select(
      `
      *,
      client:client_id (
        id,
        email,
        full_name,
        company,
        phone
      ),
      milestones:project_milestones (
        id,
        title,
        description,
        due_date,
        start_date,
        weight,
        status,
        order_index,
        assigned_to_name,
        assigned_to_email,
        assigned_to_id
      ),
      deliverables:project_deliverables (
        *
      ),
      tasks:project_tasks (
        *
      ),
      risks:project_risks (
        *
      )
    `,
    )
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error al obtener proyectos del equipo:', error);
    throw new Error(error.message || 'No se pudieron cargar los proyectos');
  }

  const processed = (data || []).map((p) => ({
    ...p,
    milestones: (p.milestones || []).sort((a, b) => (a.order_index || 0) - (b.order_index || 0)),
    deliverables: p.deliverables || [],
    tasks: p.tasks || [],
    risks: p.risks || [],
  }));

  teamProjectsCache = {
    data: processed,
    timestamp: now,
  };

  return processed;
}

/**
 * Consulta la telemetría consolidada de proyectos, tareas y entregables del workspace
 * mediante el RPC optimizado get_workspace_telemetry_snapshot, con fallback analítico local resiliente
 * y deduplicación en caché en memoria (15s TTL).
 */
export async function fetchWorkspaceTelemetrySnapshot({
  userEmail = null,
  isAdmin = false,
  forceRefresh = false,
  localProjects = null,
  localLeads = null,
} = {}) {
  const now = Date.now();
  const cacheKey = `${userEmail || ''}_${isAdmin ? '1' : '0'}`;

  if (
    !forceRefresh &&
    telemetrySnapshotCache &&
    telemetrySnapshotCache.key === cacheKey &&
    now - telemetrySnapshotCache.timestamp < TELEMETRY_CACHE_TTL_MS
  ) {
    cacheHits++;
    return telemetrySnapshotCache.data;
  }

  cacheMisses++;
  try {
    if (supabase && typeof supabase.rpc === 'function') {
      const { data, error } = await supabase.rpc('get_workspace_telemetry_snapshot', {
        p_user_email: userEmail,
        p_is_admin: isAdmin,
      });

      if (!error && data) {
        telemetrySnapshotCache = {
          data,
          timestamp: now,
          key: cacheKey,
        };
        return data;
      }
      if (error) {
        console.warn('[team] RPC get_workspace_telemetry_snapshot arrojó error, aplicando fallback:', error.message);
      }
    }
  } catch (rpcErr) {
    console.warn('[team] Error invocando get_workspace_telemetry_snapshot, aplicando fallback:', rpcErr);
  }

  // Fallback analítico local si el RPC no está disponible o falla
  try {
    const projects = localProjects || (await fetchTeamProjects());
    const leads = localLeads || (await fetchTeamLeads());

    const activeProjects = (projects || []).filter((p) => p.status !== 'FINALIZADO');
    const activeLeads = (leads || []).filter((l) => ['NUEVO', 'EN_REVISION'].includes(l.status));

    let pendingDeliverables = 0;
    let openCriticalFindings = 0;
    let userAssignedTasks = 0;

    for (const p of projects || []) {
      if (Array.isArray(p.deliverables)) {
        pendingDeliverables += p.deliverables.filter((d) => ['BORRADOR_INTERNO', 'EN_REVISION'].includes(d.status)).length;
      }
      if (Array.isArray(p.findings)) {
        openCriticalFindings += p.findings.filter((f) => ['CRITICA', 'ALTA'].includes(f.severity) && f.status !== 'VERIFICADO').length;
      }
      if (Array.isArray(p.tasks) && userEmail) {
        userAssignedTasks += p.tasks.filter((t) => t.assigned_to_email === userEmail && t.status !== 'DONE').length;
      }
    }

    const fallbackSnapshot = {
      kpis: {
        active_projects_count: activeProjects.length,
        active_leads_count: activeLeads.length,
        pending_deliverables_count: pendingDeliverables,
        open_critical_findings_count: openCriticalFindings,
        user_assigned_tasks_count: userAssignedTasks,
      },
      generated_at: new Date().toISOString(),
    };

    telemetrySnapshotCache = {
      data: fallbackSnapshot,
      timestamp: now,
      key: cacheKey,
    };

    return fallbackSnapshot;
  } catch (fallbackErr) {
    console.error('[team] Error en fallback de telemetría de workspace:', fallbackErr);
    return {
      kpis: {
        active_projects_count: 0,
        active_leads_count: 0,
        pending_deliverables_count: 0,
        open_critical_findings_count: 0,
        user_assigned_tasks_count: 0,
      },
      generated_at: new Date().toISOString(),
    };
  }
}

/**
 * Registra un nuevo proyecto para un cliente.
 */
export async function createTeamProject({
  clientId,
  title,
  pillar,
  description = '',
  targetCompletionDate = null,
  techLeadName = 'Inmerge Technical Lead',
  techLeadContact = 'inmerge3@gmail.com',
}) {
  if (!clientId || !title || !pillar) {
    throw new Error('El ID de cliente, título y pilar estratégico son obligatorios.');
  }

  const { data, error } = await supabase
    .from('client_projects')
    .insert({
      client_id: clientId,
      title,
      pillar,
      description,
      target_completion_date: targetCompletionDate,
      tech_lead_name: techLeadName,
      tech_lead_contact: techLeadContact,
      status: 'EN_PLANIFICACION',
    })
    .select()
    .single();

  if (error) {
    console.error('Error al crear proyecto:', error);
    throw new Error(error.message || 'No se pudo registrar el proyecto.');
  }

  // Registrar en bitácora de auditoría
  logTeamActivity({
    action: 'PROJECT_CREATED',
    entityType: 'project',
    entityId: data.id,
    details: { title, pillar, client_id: clientId, tech_lead_name: techLeadName },
  });

  clearTeamDataCache();

  return data;
}

/**
 * Actualiza la designación de equipo técnico (Lead, Ingenieros, Auditores) o detalles del proyecto (Exclusivo Admin).
 */
export async function updateProjectStaff(projectId, { techLeadName, techLeadContact, description, title, targetCompletionDate } = {}) {
  if (!projectId) throw new Error('El ID de proyecto es obligatorio.');

  const updateFields = {};
  if (techLeadName !== undefined) updateFields.tech_lead_name = techLeadName;
  if (techLeadContact !== undefined) updateFields.tech_lead_contact = techLeadContact;
  if (description !== undefined) updateFields.description = description;
  if (title !== undefined) updateFields.title = title;
  if (targetCompletionDate !== undefined) updateFields.target_completion_date = targetCompletionDate;

  const { data, error } = await supabase.from('client_projects').update(updateFields).eq('id', projectId).select().single();

  if (error) {
    console.error('Error al actualizar equipo del proyecto:', error);
    throw new Error(error.message || 'No se pudo actualizar el equipo asignado al proyecto.');
  }

  logTeamActivity({
    action: 'PROJECT_STAFF_ASSIGNED',
    entityType: 'project',
    entityId: projectId,
    details: { updateFields, title: data?.title },
  });

  clearTeamDataCache();

  return data;
}

/**
 * Actualiza el estado de un proyecto de cliente y dispara la Edge Function notify-project-status.
 */
export async function updateProjectStatus(projectId, newStatus, { notes = '', clientEmail = '', clientName = '' } = {}) {
  if (!projectId || !newStatus) {
    throw new Error('El ID de proyecto y el nuevo estado son obligatorios.');
  }

  const validStatuses = ['EN_PLANIFICACION', 'EN_AUDITORIA', 'EN_DESARROLLO', 'EN_VALIDACION', 'ENTREGADO', 'FINALIZADO'];
  if (!validStatuses.includes(newStatus)) {
    throw new Error(`Estado inválido: ${newStatus}. Valores permitidos: ${validStatuses.join(', ')}`);
  }

  const updateFields = { status: newStatus };
  if (['ENTREGADO', 'FINALIZADO'].includes(newStatus)) {
    updateFields.actual_completion_date = new Date().toISOString().split('T')[0];
  }

  const { data, error } = await supabase
    .from('client_projects')
    .update(updateFields)
    .eq('id', projectId)
    .select(
      `
      id,
      title,
      pillar,
      status,
      start_date,
      target_completion_date,
      actual_completion_date,
      tech_lead_name,
      tech_lead_contact,
      client_id,
      profiles:client_id (
        id,
        email,
        full_name
      )
    `,
    )
    .single();

  if (error) {
    console.error('Error al actualizar estado del proyecto:', error);
    throw new Error(error.message || 'No se pudo actualizar el estado del proyecto.');
  }

  const recipientEmail = clientEmail || data.profiles?.email;
  const recipientName = clientName || data.profiles?.full_name || 'Cliente';

  // Invocación a Edge Function notify-project-status
  if (supabase.functions && typeof supabase.functions.invoke === 'function') {
    try {
      await supabase.functions.invoke('notify-project-status', {
        body: {
          project: data,
          newStatus,
          clientEmail: recipientEmail,
          clientName: recipientName,
          notes,
        },
      });
    } catch (fnErr) {
      console.warn('[team] Error al invocar notify-project-status:', fnErr);
    }
  }

  // Registrar en bitácora de auditoría
  logTeamActivity({
    action: 'PROJECT_STATUS_UPDATED',
    entityType: 'project',
    entityId: projectId,
    details: { new_status: newStatus, title: data.title, notes },
  });

  clearTeamDataCache();

  return data;
}

/**
 * Agrega un nuevo hito/fase a un proyecto con soporte de asignación a equipo interno.
 */
export async function addProjectMilestone({
  projectId,
  title,
  description = '',
  dueDate = null,
  orderIndex = 1,
  assignedToName = null,
  assignedToEmail = null,
  assignedToId = null,
}) {
  if (!projectId || !title) {
    throw new Error('El ID de proyecto y título del hito son obligatorios.');
  }

  const { data, error } = await supabase
    .from('project_milestones')
    .insert({
      project_id: projectId,
      title,
      description,
      due_date: dueDate,
      order_index: orderIndex,
      status: 'PENDIENTE',
      assigned_to_name: assignedToName || null,
      assigned_to_email: assignedToEmail || null,
      assigned_to_id: assignedToId || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error al crear hito:', error);
    throw new Error(error.message || 'No se pudo agregar el hito al proyecto.');
  }

  logTeamActivity({
    action: 'MILESTONE_CREATED',
    entityType: 'milestone',
    entityId: data.id,
    details: {
      project_id: projectId,
      title,
      due_date: dueDate,
      assigned_to_name: assignedToName,
      assigned_to_email: assignedToEmail,
    },
  });

  clearTeamDataCache();

  return data;
}

/**
 * Actualiza el estado o datos de un hito (incluyendo encargado asignado).
 */
export async function updateMilestoneStatus(milestoneId, statusOrUpdates) {
  const updates =
    typeof statusOrUpdates === 'string'
      ? { status: statusOrUpdates }
      : {
          ...(statusOrUpdates.status && { status: statusOrUpdates.status }),
          ...(statusOrUpdates.assignedToName !== undefined && { assigned_to_name: statusOrUpdates.assignedToName }),
          ...(statusOrUpdates.assignedToEmail !== undefined && { assigned_to_email: statusOrUpdates.assignedToEmail }),
          ...(statusOrUpdates.assignedToId !== undefined && { assigned_to_id: statusOrUpdates.assignedToId }),
          ...(statusOrUpdates.assigned_to_name !== undefined && { assigned_to_name: statusOrUpdates.assigned_to_name }),
          ...(statusOrUpdates.assigned_to_email !== undefined && { assigned_to_email: statusOrUpdates.assigned_to_email }),
          ...(statusOrUpdates.assigned_to_id !== undefined && { assigned_to_id: statusOrUpdates.assigned_to_id }),
          ...(statusOrUpdates.dueDate !== undefined && { due_date: statusOrUpdates.dueDate }),
          ...(statusOrUpdates.due_date !== undefined && { due_date: statusOrUpdates.due_date }),
        };

  const { data, error } = await supabase.from('project_milestones').update(updates).eq('id', milestoneId).select().single();

  if (error) {
    console.error('Error al actualizar hito:', error);
    throw new Error(error.message || 'No se pudo actualizar el hito.');
  }

  logTeamActivity({
    action: 'MILESTONE_STATUS_UPDATED',
    entityType: 'milestone',
    entityId: milestoneId,
    details: { updates, title: data.title, project_id: data.project_id },
  });

  clearTeamDataCache();

  return data;
}

/**
 * Sube un archivo al bucket seguro 'project-deliverables' en Supabase Storage.
 */
export async function uploadDeliverableFile(file, destinationPath) {
  if (!file) throw new Error('No se ha seleccionado ningún archivo.');

  const { data, error } = await supabase.storage.from('project-deliverables').upload(destinationPath, file, {
    upsert: true,
    contentType: file.type || 'application/pdf',
  });

  if (error) {
    console.error('Error al subir archivo a Storage:', error);
    throw new Error(error.message || 'Error al subir el archivo entregable.');
  }

  return data?.path || destinationPath;
}

/**
 * Registra un entregable técnico vinculado a un proyecto e hito.
 */
export async function createDeliverableRecord({
  projectId,
  milestoneId = null,
  title,
  fileType = 'PDF',
  filePath = null,
  externalUrl = null,
  version = 'v1.0',
  notes = '',
  status = 'BORRADOR_INTERNO',
  authorName = null,
  authorEmail = null,
  author_name = null,
  author_email = null,
  project = null,
  clientEmail = null,
  clientName = null,
}) {
  if (!projectId || !title || !fileType) {
    throw new Error('Proyecto, título y tipo de archivo son obligatorios.');
  }

  const sanitized = sanitizeDeliverablePayload({
    projectId,
    milestoneId,
    title,
    fileType,
    filePath,
    externalUrl,
    version,
    notes,
    status,
    authorName: authorName || author_name,
    authorEmail: authorEmail || author_email,
  });

  const { data, error } = await supabase.from('project_deliverables').insert(sanitized).select().single();

  if (error) {
    console.error('Error al registrar entregable:', error);
    throw new Error(error.message || 'No se pudo registrar el entregable.');
  }

  // Registrar en bitácora de auditoría
  logTeamActivity({
    action: 'DELIVERABLE_PUBLISHED',
    entityType: 'deliverable',
    entityId: data.id,
    details: {
      project_id: projectId,
      title: sanitized.title,
      file_type: sanitized.file_type,
      version: sanitized.version,
      status: sanitized.status,
    },
  });

  // Disparar Edge Function notify-deliverable de forma asíncrona no-bloqueante
  if (supabase.functions && typeof supabase.functions.invoke === 'function') {
    supabase.functions
      .invoke('notify-deliverable', {
        body: {
          deliverable: data,
          project,
          clientEmail,
          clientName,
        },
      })
      .catch((fnErr) => console.warn('Deliverable notification warning:', fnErr));
  }

  clearTeamDataCache();

  return data;
}

/**
 * Actualiza el estado de publicación de un entregable técnico (Borrador -> En Revisión -> Publicado).
 */
export async function updateDeliverableStatus(deliverableId, newStatus, { projectId, title, notes = '' } = {}) {
  if (!deliverableId || !newStatus) throw new Error('ID y nuevo estado son obligatorios.');
  const validStatuses = ['BORRADOR_INTERNO', 'EN_REVISION', 'PUBLICADO_CLIENTE'];
  if (!validStatuses.includes(newStatus)) throw new Error('Estado de entregable inválido.');

  const { data, error } = await supabase
    .from('project_deliverables')
    .update({ status: newStatus, notes: notes || undefined, updated_at: new Date().toISOString() })
    .eq('id', deliverableId)
    .select()
    .single();

  if (error) {
    console.error('Error al actualizar estado de entregable:', error);
    throw new Error(error.message || 'No se pudo actualizar el estado del entregable.');
  }

  logTeamActivity({
    action: 'DELIVERABLE_STATUS_UPDATED',
    entityType: 'deliverable',
    entityId: deliverableId,
    details: { new_status: newStatus, title: title || data?.title, project_id: projectId || data?.project_id },
  });

  if (newStatus === 'EN_REVISION') {
    createInAppNotification({
      targetRole: 'admin',
      title: 'Entregable en Revisión',
      message: `El entregable "${title || data?.title || 'Entregable'}" ha cambiado a estado EN_REVISION y requiere aprobación.`,
      category: 'DELIVERABLE',
      severity: 'INFO',
      projectId: projectId || data?.project_id,
      linkUrl: `/equipo?tab=projects&projectId=${projectId || data?.project_id}&subtab=deliverables`,
    }).catch((notifErr) => console.warn('Deliverable notification warning:', notifErr));
  }

  clearTeamDataCache();

  return data;
}

/**
 * Consulta la lista de miembros del equipo interno (staff).
 */
export async function fetchStaffMembers() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, created_at')
    .in('role', ['admin', 'auditor', 'engineer'])
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error al obtener miembros del equipo:', error);
    throw new Error(error.message || 'No se pudo cargar la lista del equipo');
  }

  return data || [];
}

/**
 * Registra un nuevo colaborador interno mediante RPC seguro.
 */
export async function createStaffMember({ email, password, fullName, role = 'engineer' }) {
  if (!email || !password || !fullName) {
    throw new Error('Correo, contraseña y nombre completo son obligatorios.');
  }

  // 1. Invocar con la signatura canónica estándar (p_*)
  let { data, error } = await supabase.rpc('create_staff_member', {
    p_email: email,
    p_password: password,
    p_full_name: fullName,
    p_role: role,
  });

  // 2. Fallback defensivo si el esquema de base de datos utiliza la signatura legacy (new_*)
  if (error && error.message?.includes('Could not find the function')) {
    const fallback = await supabase.rpc('create_staff_member', {
      new_email: email,
      new_password: password,
      new_full_name: fullName,
      new_role: role,
    });
    data = fallback.data;
    error = fallback.error;
  }

  if (error) {
    console.error('Error al registrar colaborador:', error);
    throw new Error(error.message || 'No se pudo registrar el colaborador.');
  }

  logTeamActivity({
    action: 'STAFF_REGISTERED',
    entityType: 'profile',
    entityId: typeof data === 'string' ? data : null,
    details: { email, full_name: fullName, role },
  });

  return data;
}

/**
 * Consulta las tareas técnicas desglosadas de un proyecto.
 */
export async function fetchProjectTasks(projectId) {
  if (!projectId) return [];
  const { data, error } = await supabase
    .from('project_tasks')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error al obtener tareas del proyecto:', error);
    throw new Error(error.message || 'No se pudieron cargar las tareas.');
  }

  return data || [];
}

/**
 * Crea una nueva tarea técnica asociada a un hito y proyecto.
 */
export async function createProjectTask(taskPayload) {
  const { data, error } = await supabase.from('project_tasks').insert(taskPayload).select().single();

  if (error) {
    console.error('Error al crear tarea técnica:', error);
    throw new Error(error.message || 'No se pudo crear la tarea.');
  }

  logTeamActivity({
    action: 'TASK_CREATED',
    entityType: 'task',
    entityId: data.id,
    details: { project_id: data.project_id, title: data.title, status: data.status },
  });

  clearTeamDataCache();

  return data;
}

/**
 * Actualiza el estado o atributos de una tarea técnica.
 */
export async function updateProjectTask(taskId, updates) {
  const { data, error } = await supabase
    .from('project_tasks')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', taskId)
    .select()
    .single();

  if (error) {
    console.error('Error al actualizar tarea técnica:', error);
    throw new Error(error.message || 'No se pudo actualizar la tarea.');
  }

  logTeamActivity({
    action: 'TASK_UPDATED',
    entityType: 'task',
    entityId: data.id,
    details: { project_id: data.project_id, title: data.title, status: data.status },
  });

  clearTeamDataCache();

  return data;
}

/**
 * Elimina una tarea técnica.
 */
export async function deleteProjectTask(taskId, projectId) {
  const { error } = await supabase.from('project_tasks').delete().eq('id', taskId);

  if (error) {
    console.error('Error al eliminar tarea técnica:', error);
    throw new Error(error.message || 'No se pudo eliminar la tarea.');
  }

  logTeamActivity({
    action: 'TASK_DELETED',
    entityType: 'task',
    entityId: taskId,
    details: { project_id: projectId },
  });

  clearTeamDataCache();

  return true;
}

/**
 * Consulta los riesgos e incidencias de un proyecto.
 */
export async function fetchProjectRisks(projectId) {
  if (!projectId) return [];
  const { data, error } = await supabase
    .from('project_risks')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error al obtener riesgos del proyecto:', error);
    throw new Error(error.message || 'No se pudieron cargar los riesgos.');
  }

  return data || [];
}

/**
 * Registra un nuevo riesgo o bloqueo.
 */
export async function createProjectRisk(riskPayload) {
  const { data, error } = await supabase.from('project_risks').insert(riskPayload).select().single();

  if (error) {
    console.error('Error al registrar riesgo/bloqueo:', error);
    throw new Error(error.message || 'No se pudo registrar el riesgo.');
  }

  logTeamActivity({
    action: 'RISK_REPORTED',
    entityType: 'risk',
    entityId: data.id,
    details: { project_id: data.project_id, title: data.title, severity: data.severity },
  });

  return data;
}

/**
 * Actualiza un riesgo o bloqueo (ej. marcar como resuelto).
 */
export async function updateProjectRisk(riskId, updates) {
  const { data, error } = await supabase
    .from('project_risks')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', riskId)
    .select()
    .single();

  if (error) {
    console.error('Error al actualizar riesgo/bloqueo:', error);
    throw new Error(error.message || 'No se pudo actualizar el riesgo.');
  }

  logTeamActivity({
    action: 'RISK_UPDATED',
    entityType: 'risk',
    entityId: data.id,
    details: { project_id: data.project_id, status: data.status },
  });

  clearTeamDataCache();

  return data;
}

/**
 * Actualiza el estado de salud RAG y fechas de un proyecto.
 */
export async function updateProjectHealth(projectId, { healthStatus, startDate, targetEndDate }) {
  const updates = {};
  if (healthStatus !== undefined) updates.health_status = healthStatus;
  if (startDate !== undefined) updates.start_date = startDate;
  if (targetEndDate !== undefined) updates.target_end_date = targetEndDate;

  const { data, error } = await supabase.from('client_projects').update(updates).eq('id', projectId).select().single();

  if (error) {
    console.error('Error al actualizar salud del proyecto:', error);
    throw new Error(error.message || 'No se pudo actualizar la salud del proyecto.');
  }

  logTeamActivity({
    action: 'PROJECT_HEALTH_UPDATED',
    entityType: 'project',
    entityId: projectId,
    details: updates,
  });

  clearTeamDataCache();

  return data;
}

/**
 * Consulta la lista de hallazgos forenses técnicos vinculados a un proyecto.
 */
export async function fetchProjectFindings(projectId) {
  if (!projectId) return [];
  const { data, error } = await supabase
    .from('project_findings')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('project_findings query notice:', error.message);
    return [];
  }
  return data || [];
}

/**
 * Registra un nuevo hallazgo técnico en la auditoría del proyecto.
 */
export async function createProjectFinding(payload) {
  const sanitized = sanitizeFindingPayload(payload);
  const { data, error } = await supabase.from('project_findings').insert(sanitized).select().single();

  if (error) {
    console.error('Error al registrar hallazgo:', error);
    throw new Error(error.message || 'No se pudo registrar el hallazgo técnico.');
  }

  logTeamActivity({
    action: 'FINDING_CREATED',
    entityType: 'finding',
    entityId: data.id,
    details: { code: sanitized.finding_code, title: sanitized.title, severity: sanitized.severity, project_id: sanitized.project_id },
  });

  const isCriticalOrHigh = ['CRITICA', 'CRITICAL', 'ALTA', 'HIGH'].includes(sanitized.severity);
  if (isCriticalOrHigh) {
    const notifSeverity = sanitized.severity === 'CRITICA' || sanitized.severity === 'CRITICAL' ? 'CRITICAL' : 'HIGH';
    createInAppNotification({
      targetRole: 'admin',
      title: `Hallazgo ${notifSeverity === 'CRITICAL' ? 'Crítico' : 'de Alta Severidad'}: ${sanitized.finding_code || 'Auditoría'}`,
      message: `Se ha detectado un hallazgo de severidad ${notifSeverity}: "${sanitized.title}".`,
      category: 'FINDING',
      severity: notifSeverity,
      projectId: sanitized.project_id,
      linkUrl: `/equipo?tab=projects&projectId=${sanitized.project_id}&subtab=findings`,
    }).catch((notifErr) => console.warn('Finding notification warning:', notifErr));
  }

  clearTeamDataCache();

  return data;
}

/**
 * Actualiza el estado o detalles de un hallazgo técnico.
 */
export async function updateProjectFinding(findingId, updates) {
  if (!findingId) throw new Error('ID de hallazgo obligatorio.');
  const { data, error } = await supabase
    .from('project_findings')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', findingId)
    .select()
    .single();

  if (error) {
    console.error('Error al actualizar hallazgo:', error);
    throw new Error(error.message || 'No se pudo actualizar el hallazgo.');
  }

  logTeamActivity({
    action: 'FINDING_UPDATED',
    entityType: 'finding',
    entityId: findingId,
    details: { updates, title: data?.title, project_id: data?.project_id },
  });

  clearTeamDataCache();

  return data;
}

/**
 * Elimina un hallazgo técnico de la base de datos.
 */
export async function deleteProjectFinding(findingId) {
  if (!findingId) throw new Error('ID de hallazgo obligatorio.');
  const { error } = await supabase.from('project_findings').delete().eq('id', findingId);
  if (error) {
    console.error('Error al eliminar hallazgo:', error);
    throw new Error(error.message || 'No se pudo eliminar el hallazgo.');
  }

  clearTeamDataCache();

  return true;
}
