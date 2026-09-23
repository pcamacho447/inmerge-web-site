import { supabase } from './supabaseClient.js';

/**
 * submitClaim - Registra un reclamo/queja en el Libro de Reclamaciones
 *
 * @param {Object} params
 * @param {string} params.type - 'reclamo' o 'queja'
 * @param {string} params.fullName - Nombre o Razón Social
 * @param {string} params.documentType - DNI, CE, RUC, etc.
 * @param {string} params.documentNumber - Número de documento
 * @param {string} params.email - Correo electrónico
 * @param {string} params.phone - Teléfono
 * @param {string} params.address - Domicilio
 * @param {string} params.service - Bien/Servicio contratado
 * @param {string} params.amount - Monto reclamado (opcional)
 * @param {string} params.detail - Detalle del reclamo
 * @param {string} params.request - Pedido del consumidor
 * @param {string} params.honeypot - Campo trampa anti-bot
 * @returns {Promise<{ success: boolean, isSpamFiltered?: boolean }>}
 */
export async function submitClaim({
  type = 'reclamo',
  fullName = '',
  documentType = 'DNI',
  documentNumber = '',
  email = '',
  phone = '',
  address = '',
  service = '',
  amount = '',
  detail = '',
  request = '',
  honeypot = '',
}) {
  // 1. Shadow Ban for Bots
  if (honeypot && String(honeypot).trim().length > 0) {
    console.warn('[claims] Bot detectado mediante honeypot. Ejecutando shadow ban silencioso.');
    return { success: true, isSpamFiltered: true };
  }

  const cleanEmail = (email || '').trim().toLowerCase();
  if (!cleanEmail) throw new Error('El correo electrónico es requerido.');
  if (!fullName.trim()) throw new Error('El nombre o razón social es requerido.');
  if (!detail.trim()) throw new Error('El detalle del reclamo es requerido.');

  const payload = {
    type,
    full_name: fullName.trim(),
    document_type: documentType,
    document_number: documentNumber.trim(),
    email: cleanEmail,
    phone: (phone || '').trim() || null,
    address: (address || '').trim() || null,
    service: (service || '').trim() || null,
    amount: (amount || '').trim() || null,
    detail: detail.trim(),
    request: (request || '').trim() || null,
    status: 'NUEVO',
  };

  const { error } = await supabase.from('claims').insert([payload]);

  if (error) {
    console.error('Error al registrar reclamo en Supabase:', error);
    if (error.message && error.message.includes('RATE_LIMIT_EXCEEDED')) {
      const rateLimitErr = new Error('Has superado el límite de solicitudes. Por favor, intenta de nuevo más tarde.');
      rateLimitErr.isRateLimited = true;
      rateLimitErr.code = 'RATE_LIMIT_EXCEEDED';
      throw rateLimitErr;
    }
    throw new Error(error.message || 'Error al guardar el reclamo en el servidor.');
  }

  return { success: true, claim: payload };
}
