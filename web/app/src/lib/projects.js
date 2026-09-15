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
      health_status,
      progress,
      start_date,
      target_end_date,
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
        start_date,
        weight,
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
      ),
      project_tasks (
        id,
        milestone_id,
        title,
        description,
        status,
        priority,
        assigned_to_name,
        estimated_hours,
        actual_hours,
        weight,
        due_date,
        completed_at,
        created_at
      ),
      project_risks (
        id,
        milestone_id,
        title,
        description,
        severity,
        status,
        impact,
        mitigation_plan,
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
    milestones: (p.project_milestones || []).sort((a, b) => (a.order_index || 0) - (b.order_index || 0)),
    deliverables: p.project_deliverables || [],
    tasks: p.project_tasks || [],
    risks: p.project_risks || [],
  }));
}

/**
 * Genera una URL firmada de corta duración (15 minutos / 900s) con trazabilidad forense
 * en la bitácora de auditoría (team_activity_logs).
 *
 * Invoca la Edge Function 'secure-download' y recurre a Storage directo con auditoría como fallback.
 */
export async function getSignedDeliverableUrl(filePathOrOptions, deliverableIdParam = null, expiresInParam = 900) {
  let targetPath = null;
  let targetDeliverableId = null;
  let effectiveExpiresIn = 900;

  if (typeof filePathOrOptions === 'object' && filePathOrOptions !== null) {
    targetPath = filePathOrOptions.filePath;
    targetDeliverableId = filePathOrOptions.deliverableId || null;
    effectiveExpiresIn = filePathOrOptions.expiresIn || 900;
  } else {
    targetPath = filePathOrOptions;
    if (typeof deliverableIdParam === 'string') {
      targetDeliverableId = deliverableIdParam;
      effectiveExpiresIn = typeof expiresInParam === 'number' ? expiresInParam : 900;
    } else if (typeof deliverableIdParam === 'number') {
      effectiveExpiresIn = deliverableIdParam;
    }
  }

  if (!targetPath && !targetDeliverableId) return null;

  // 1. Intentar descargar mediante la Edge Function secure-download
  if (supabase.functions && typeof supabase.functions.invoke === 'function') {
    try {
      const { data, error } = await supabase.functions.invoke('secure-download', {
        body: {
          deliverableId: targetDeliverableId,
          filePath: targetPath,
          expiresIn: effectiveExpiresIn,
        },
      });

      if (!error && data?.signedUrl) {
        return data.signedUrl;
      }
    } catch (fnErr) {
      console.warn('[projects] secure-download Edge Function no disponible, ejecutando fallback:', fnErr);
    }
  }

  // 2. Fallback resiliente mediante Supabase Storage directo
  if (!targetPath) {
    throw new Error('Se requiere la ruta del archivo para generar la descarga.');
  }

  const { data, error } = await supabase.storage.from('project-deliverables').createSignedUrl(targetPath, effectiveExpiresIn);

  if (error) {
    console.error('Error al generar URL firmada de entregable:', error);
    throw new Error(error.message || 'No se pudo generar el enlace de descarga.');
  }

  // Registrar trazabilidad de descarga en team_activity_logs
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('team_activity_logs').insert({
        user_id: user.id,
        action: 'DELIVERABLE_DOWNLOADED',
        entity_type: 'deliverable',
        entity_id: targetDeliverableId,
        details: {
          file_path: targetPath,
          expires_in: effectiveExpiresIn,
          client_fallback: true,
        },
      });
    }
  } catch (logErr) {
    console.warn('[projects] Advertencia al registrar auditoría de descarga:', logErr);
  }

  return data.signedUrl;
}
