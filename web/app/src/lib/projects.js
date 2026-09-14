import { supabase } from './supabaseClient.js';

export async function fetchClientProjects(userId) {
  if (!userId) return [];

  const { data: projects, error } = await supabase
    .from('client_projects')
    .select(
      `
      id,
      title,
      pillar,
      status,
      start_date,
      target_completion_date,
      actual_completion_date,
      description,
      tech_lead_name,
      tech_lead_contact,
      created_at,
      project_milestones (
        id,
        title,
        description,
        due_date,
        status,
        order_index
      ),
      project_deliverables (
        id,
        milestone_id,
        title,
        file_type,
        file_path,
        external_url,
        version,
        created_at
      )
    `,
    )
    .eq('client_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error al obtener proyectos del cliente en Supabase:', error);
    throw new Error(error.message || 'Error al cargar los proyectos.');
  }

  // Sort milestones by order_index
  return (projects || []).map((p) => ({
    ...p,
    milestones: (p.project_milestones || []).sort((a, b) => a.order_index - b.order_index),
    deliverables: p.project_deliverables || [],
  }));
}

export async function getSignedDeliverableUrl(filePath, expiresIn = 3600) {
  if (!filePath) return null;

  const { data, error } = await supabase.storage.from('project-deliverables').createSignedUrl(filePath, expiresIn);

  if (error) {
    console.error('Error al generar URL firmada de entregable:', error);
    throw new Error(error.message || 'No se pudo generar el enlace de descarga.');
  }

  return data.signedUrl;
}
