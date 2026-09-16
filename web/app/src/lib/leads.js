import { supabase } from './supabaseClient.js';

/**
 * submitLeadTdr - Registra una solicitud de cotización/TDR con protección Anti-Spam y Rate Limiting.
 *
 * @param {Object} params
 * @param {string} params.pillar - Pilar estratégico
 * @param {string} params.fullName - Nombre de contacto
 * @param {string} params.company - Empresa u organización
 * @param {string} params.email - Correo electrónico
 * @param {string} params.phone - Teléfono o WhatsApp
 * @param {string} params.timeline - Plazo estimado
 * @param {string} params.message - Detalle del requerimiento
 * @param {string} params.honeypot - Campo trampa anti-bot (debe estar vacío para humanos)
 * @returns {Promise<{ success: boolean, isSpamFiltered?: boolean, lead?: Object }>}
 */
export async function submitLeadTdr({
  pillar = 'auditoria',
  fullName = '',
  company = '',
  email = '',
  phone = '',
  timeline = '1 a 2 meses',
  message = '',
  honeypot = '',
}) {
  // 1. Detección de Bots vía Honeypot (Shadow Ban: Simular éxito inmediato sin tocar la base de datos)
  if (honeypot && String(honeypot).trim().length > 0) {
    console.warn('[leads] Bot detectado mediante honeypot. Ejecutando shadow ban silencioso.');
    return { success: true, isSpamFiltered: true };
  }

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

    // Detectar si el trigger de PostgreSQL bloqueó la inserción por exceso de tasa
    if (error.message && error.message.includes('RATE_LIMIT_EXCEEDED')) {
      const rateLimitErr = new Error(
        'Has superado el límite de 3 solicitudes por hora para este correo. Si necesitas atención inmediata, por favor contáctanos vía WhatsApp.',
      );
      rateLimitErr.isRateLimited = true;
      rateLimitErr.code = 'RATE_LIMIT_EXCEEDED';
      throw rateLimitErr;
    }

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
