import { supabase } from './supabaseClient.js';

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
 * Consulta todos los proyectos y clientes para el equipo técnico.
 */
export async function fetchTeamProjects() {
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
        order_index
      ),
      deliverables:project_deliverables (
        id,
        title,
        file_type,
        file_path,
        external_url,
        version,
        notes,
        created_at
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

  return (data || []).map((p) => ({
    ...p,
    milestones: (p.milestones || []).sort((a, b) => (a.order_index || 0) - (b.order_index || 0)),
    deliverables: p.deliverables || [],
    tasks: p.tasks || [],
    risks: p.risks || [],
  }));
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
    .select(`
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
    `)
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

  return data;
}

/**
 * Agrega un nuevo hito/fase a un proyecto.
 */
export async function addProjectMilestone({ projectId, title, description = '', dueDate = null, orderIndex = 1 }) {
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
    details: { project_id: projectId, title, due_date: dueDate },
  });

  return data;
}

/**
 * Actualiza el estado de un hito.
 */
export async function updateMilestoneStatus(milestoneId, status) {
  const { data, error } = await supabase.from('project_milestones').update({ status }).eq('id', milestoneId).select().single();

  if (error) {
    console.error('Error al actualizar hito:', error);
    throw new Error(error.message || 'No se pudo actualizar el hito.');
  }

  logTeamActivity({
    action: 'MILESTONE_STATUS_UPDATED',
    entityType: 'milestone',
    entityId: milestoneId,
    details: { new_status: status, title: data.title, project_id: data.project_id },
  });

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
  project = null,
  clientEmail = null,
  clientName = null,
}) {
  if (!projectId || !title || !fileType) {
    throw new Error('Proyecto, título y tipo de archivo son obligatorios.');
  }

  const { data, error } = await supabase
    .from('project_deliverables')
    .insert({
      project_id: projectId,
      milestone_id: milestoneId,
      title,
      file_type: fileType,
      file_path: filePath,
      external_url: externalUrl,
      version,
      notes,
    })
    .select()
    .single();

  if (error) {
    console.error('Error al registrar entregable:', error);
    throw new Error(error.message || 'No se pudo registrar el entregable.');
  }

  // Registrar en bitácora de auditoría
  logTeamActivity({
    action: 'DELIVERABLE_PUBLISHED',
    entityType: 'deliverable',
    entityId: data.id,
    details: { project_id: projectId, title, file_type: fileType, version },
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

  const { data, error } = await supabase.rpc('create_staff_member', {
    p_email: email,
    p_password: password,
    p_full_name: fullName,
    p_role: role,
    new_email: email,
    new_password: password,
    new_full_name: fullName,
    new_role: role,
  });

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
  const { data, error } = await supabase
    .from('project_tasks')
    .insert(taskPayload)
    .select()
    .single();

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

  return data;
}

/**
 * Elimina una tarea técnica.
 */
export async function deleteProjectTask(taskId, projectId) {
  const { error } = await supabase
    .from('project_tasks')
    .delete()
    .eq('id', taskId);

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
  const { data, error } = await supabase
    .from('project_risks')
    .insert(riskPayload)
    .select()
    .single();

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

  return data;
}

/**
 * Actualiza el estado de salud RAG y fechas de un proyecto.
 */
export async function updateProjectHealth(projectId, { healthStatus, startDate, targetEndDate, progress }) {
  const updates = {};
  if (healthStatus !== undefined) updates.health_status = healthStatus;
  if (startDate !== undefined) updates.start_date = startDate;
  if (targetEndDate !== undefined) updates.target_end_date = targetEndDate;
  if (progress !== undefined) updates.progress = progress;

  const { data, error } = await supabase
    .from('client_projects')
    .update(updates)
    .eq('id', projectId)
    .select()
    .single();

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

  return data;
}
