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
        order_index,
        assigned_to_name,
        assigned_to_email,
        assigned_to_id
      ),
      project_deliverables (
        id,
        milestone_id,
        title,
        file_type,
        file_path,
        external_url,
        version,
        sha256_checksum,
        file_size_bytes,
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

  // Sort milestones by order_index and tasks by due_date
  return (projects || []).map((p) => ({
    ...p,
    milestones: (p.project_milestones || []).sort((a, b) => (a.order_index || 0) - (b.order_index || 0)),
    deliverables: p.project_deliverables || [],
    tasks: (p.project_tasks || []).sort((a, b) => new Date(a.due_date || a.created_at || 0) - new Date(b.due_date || b.created_at || 0)),
    risks: p.project_risks || [],
  }));
}

/**
 * Calcula el hash criptográfico SHA-256 de un Blob o ArrayBuffer (Web Crypto API)
 */
export async function calculateFileSha256(fileBlobOrBuffer) {
  if (!fileBlobOrBuffer) return null;
  const buffer = fileBlobOrBuffer instanceof ArrayBuffer
    ? fileBlobOrBuffer
    : await fileBlobOrBuffer.arrayBuffer();

  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Valida la integridad criptográfica de un archivo descargado contra el hash esperado
 */
export async function verifyDeliverableIntegrity(fileBlob, expectedSha256) {
  if (!fileBlob || !expectedSha256) {
    return { valid: false, reason: 'Parámetros insuficientes para la validación.' };
  }
  const calculatedHash = await calculateFileSha256(fileBlob);
  const match = calculatedHash.toLowerCase() === expectedSha256.trim().toLowerCase();
  return {
    valid: match,
    calculatedHash,
    expectedSha256,
  };
}

/**
 * Genera un reporte ejecutivo en formato Markdown estructurado con la identidad Inmerge
 */
export function generateExecutiveReportMarkdown(project) {
  if (!project) return '';

  const totalTasks = project.tasks?.length || 0;
  const doneTasks = project.tasks?.filter((t) => t.status === 'DONE').length || 0;
  const estHours = project.tasks?.reduce((sum, t) => sum + (Number(t.estimated_hours) || 0), 0) || 0;
  const actHours = project.tasks?.reduce((sum, t) => sum + (Number(t.actual_hours) || 0), 0) || 0;
  const variance = estHours > 0 ? (((actHours - estHours) / estHours) * 100).toFixed(1) : 0;

  return `# INMERGE — Resumen Ejecutivo de Proyecto

**Proyecto:** ${project.title}
**Pilar Estratégico:** ${project.pillar || 'Consultoría de Ingeniería'}
**Estado de Salud (RAG):** ${project.health_status || 'ON_TRACK'}
**Tech Lead Asignado:** ${project.tech_lead_name || 'Equipo Senior Inmerge'} (${project.tech_lead_contact || 'inmerge3@gmail.com'})
**Fecha de Emisión:** ${new Date().toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' })}

---

## 1. Métrica de Ejecución y Consumo de Horas Técnicas
- **Tareas Totales:** ${totalTasks} (${doneTasks} finalizadas)
- **Horas Estimadas:** ${estHours}h
- **Horas Imputadas (Reales):** ${actHours}h
- **Desviación de Esfuerzo:** ${variance}% ${variance > 20 ? '⚠️ (Desviación presupuestal)' : '✅ (Dentro de margen)'}

---

## 2. Cronograma de Hitos
${
  (project.milestones || []).length > 0
    ? project.milestones
        .map(
          (m, idx) =>
            `${idx + 1}. **${m.title}** [${m.status}] — Vencimiento: ${m.due_date || 'Sin fecha'}\n   _${m.description || ''}_`
        )
        .join('\n')
    : '_No se han registrado hitos en este proyecto._'
}

---

## 3. Entregables e Integridad Criptográfica (SHA-256)
${
  (project.deliverables || []).length > 0
    ? project.deliverables
        .map(
          (d) =>
            `- **${d.title}** (v${d.version || '1.0'})\n  - Tipo: \`${d.file_type}\`\n  - Checksum SHA-256: \`${d.sha256_checksum || 'Sellado pendiente'}\``
        )
        .join('\n')
    : '_Sin entregables emitidos aún._'
}

---
_Inmerge Consulting — Auditoría de Sistemas, Cloud & Data Science (Lima, Perú)_
`;
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
