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

  const { data, error } = await supabase.from('leads_tdr').insert([payload]).select().single();

  if (error) {
    console.error('Error al registrar solicitud TDR en Supabase:', error);
    throw new Error(error.message || 'Error al guardar la solicitud en el servidor.');
  }

  // Invocación asíncrona no-bloqueante a la Edge Function de notificación
  if (supabase.functions && typeof supabase.functions.invoke === 'function') {
    supabase.functions
      .invoke('notify-lead-tdr', { body: { record: data } })
      .catch((fnErr) => console.warn('Notification trigger warning:', fnErr));
  }

  return { success: true, lead: data };
}
