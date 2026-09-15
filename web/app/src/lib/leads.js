import { supabase } from './supabaseClient.js';

export async function submitLeadTdr({
  pillar = 'auditoria',
  fullName = '',
  company = '',
  email = '',
  phone = '',
  timeline = '1 a 2 meses',
  message = '',
}) {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanMessage = (message || '').trim();

  if (!cleanEmail) {
    throw new Error('El correo electrónico es requerido.');
  }

  if (!cleanMessage) {
    throw new Error('La descripción del requerimiento es requerida.');
  }

  const payload = {
    pillar: pillar || 'auditoria',
    full_name: (fullName || '').trim() || null,
    company: (company || '').trim() || null,
    email: cleanEmail,
    phone: (phone || '').trim() || null,
    timeline: (timeline || '').trim() || null,
    message: cleanMessage,
    status: 'NUEVO',
  };

  const { error } = await supabase.from('leads_tdr').insert([payload]);

  if (error) {
    console.error('Error al registrar solicitud TDR en Supabase:', error);
    throw new Error(error.message || 'Error al guardar la solicitud en el servidor.');
  }

  // Invocación a la Edge Function de notificación con registro detallado
  if (supabase.functions && typeof supabase.functions.invoke === 'function') {
    try {
      const { data: fnData, error: fnError } = await supabase.functions.invoke('notify-lead-tdr', {
        body: { record: payload },
      });
      if (fnError) {
        console.warn('[leads] Advertencia de notificación (Edge Function):', fnError);
      } else {
        console.log('[leads] Notificación procesada con éxito por notify-lead-tdr:', fnData);
      }
    } catch (fnErr) {
      console.warn('[leads] Error de red al invocar Edge Function notify-lead-tdr:', fnErr);
    }
  }

  return { success: true, lead: payload };
}
