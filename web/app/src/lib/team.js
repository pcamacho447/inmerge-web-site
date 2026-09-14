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

  const { data, error } = await supabase
    .from('leads_tdr')
    .update(updates)
    .eq('id', leadId)
    .select()
    .single();

  if (error) {
    console.error('Error al actualizar lead:', error);
    throw new Error(error.message || 'No se pudo actualizar el estado del lead');
  }

  return data;
}

/**
 * Consulta todos los proyectos y clientes para el equipo técnico.
 */
export async function fetchTeamProjects() {
  const { data, error } = await supabase
    .from('client_projects')
    .select(`
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
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error al obtener proyectos del equipo:', error);
    throw new Error(error.message || 'No se pudieron cargar los proyectos');
  }

  return data || [];
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
  techLeadContact = 'contacto@inmerge.pe',
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

  return data;
}

/**
 * Actualiza el estado de un hito.
 */
export async function updateMilestoneStatus(milestoneId, status) {
  const { data, error } = await supabase
    .from('project_milestones')
    .update({ status })
    .eq('id', milestoneId)
    .select()
    .single();

  if (error) {
    console.error('Error al actualizar hito:', error);
    throw new Error(error.message || 'No se pudo actualizar el hito.');
  }

  return data;
}

/**
 * Sube un archivo al bucket seguro 'project-deliverables' en Supabase Storage.
 */
export async function uploadDeliverableFile(file, destinationPath) {
  if (!file) throw new Error('No se ha seleccionado ningún archivo.');

  const { data, error } = await supabase.storage
    .from('project-deliverables')
    .upload(destinationPath, file, {
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
    new_email: email,
    new_password: password,
    new_full_name: fullName,
    new_role: role,
  });

  if (error) {
    console.error('Error al registrar colaborador:', error);
    throw new Error(error.message || 'No se pudo registrar el colaborador.');
  }

  return data;
}
