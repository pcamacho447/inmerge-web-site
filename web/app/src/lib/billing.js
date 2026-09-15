import { supabase } from './supabaseClient.js';

export const INMERGE_BANK_ACCOUNTS = [
  {
    bank: 'BCP (Banco de Crédito del Perú)',
    accountType: 'Cuenta Corriente Soles',
    accountNumber: '193-98765432-0-12',
    cci: '002-193-009876543201-12',
    holder: 'Inmerge Consulting S.A.C.',
  },
  {
    bank: 'Interbank',
    accountType: 'Cuenta Corriente Soles',
    accountNumber: '200-3001234567',
    cci: '003-200-003001234567-89',
    holder: 'Inmerge Consulting S.A.C.',
  },
  {
    bank: 'BBVA Perú',
    accountType: 'Cuenta Corriente Soles',
    accountNumber: '0011-0123-0100456789',
    cci: '011-123-000100456789-45',
    holder: 'Inmerge Consulting S.A.C.',
  },
];

export const ORDER_STATUS_CONFIG = {
  pending: {
    key: 'pending',
    label: 'PENDIENTE DE TRANSFERENCIA',
    bg: 'rgba(216, 168, 78, 0.15)',
    color: '#9B7322',
    border: 'var(--gold)',
    icon: '⏳',
    description: 'A la espera del depósito y verificación bancaria por el equipo de finanzas.',
  },
  approved: {
    key: 'approved',
    label: 'PAGO APROBADO & ACTIVO',
    bg: 'rgba(46, 117, 89, 0.15)',
    color: '#2E7559',
    border: '#2E7559',
    icon: '✓',
    description: 'Transferencia verificada y comprobante fiscal emitido.',
  },
  rejected: {
    key: 'rejected',
    label: 'ORDEN ANULADA / RECHAZADA',
    bg: 'rgba(168, 71, 43, 0.15)',
    color: 'var(--terracotta)',
    border: 'var(--terracotta)',
    icon: '✕',
    description: 'La orden fue anulada o no se constató la transferencia bancaria.',
  },
};

/**
 * Obtiene la información de la organización asociada a un usuario
 */
export async function fetchClientOrganization(userId) {
  if (!userId) return null;

  try {
    const { data: profile, error: pErr } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', userId)
      .single();

    if (pErr || !profile?.organization_id) return null;

    const { data: org, error: oErr } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', profile.organization_id)
      .single();

    if (oErr) return null;
    return org;
  } catch (err) {
    console.error('Error al cargar organización:', err);
    return null;
  }
}

/**
 * Actualiza o registra los datos fiscales de la organización
 */
export async function updateOrganizationBilling(userId, orgData) {
  if (!userId) throw new Error('Usuario no autenticado.');

  const payload = {
    billing_type: orgData.billingType || 'ruc',
    legal_name: orgData.legalName?.trim(),
    tax_id: orgData.taxId?.trim() || null,
    billing_email: orgData.billingEmail?.trim().toLowerCase(),
    billing_address: orgData.billingAddress?.trim() || null,
  };

  if (!payload.legal_name || !payload.billing_email) {
    throw new Error('Razón Social y Correo de Facturación son obligatorios.');
  }

  // Buscar si el usuario ya tiene organization_id
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', userId)
    .single();

  if (profile?.organization_id) {
    const { data, error } = await supabase
      .from('organizations')
      .update(payload)
      .eq('id', profile.organization_id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Crear nueva organización y vincularla al perfil
  const { data: newOrg, error: insErr } = await supabase
    .from('organizations')
    .insert([payload])
    .select()
    .single();

  if (insErr) throw insErr;

  await supabase
    .from('profiles')
    .update({ organization_id: newOrg.id })
    .eq('id', userId);

  return newOrg;
}

/**
 * Obtiene el historial de órdenes de servicio del usuario (exclusivo transferencia bancaria)
 */
export async function fetchClientOrders(userId) {
  if (!userId) return [];

  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error al obtener órdenes de cliente:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Excepción al cargar órdenes:', err);
    return [];
  }
}

/**
 * Registra una nueva orden de servicio mediante Transferencia Bancaria
 */
export async function createBankTransferOrder({ userId, plan, amountPen, notes }) {
  if (!userId) throw new Error('Usuario no autenticado.');

  const payload = {
    user_id: userId,
    kind: 'consultoria_servicio',
    plan: plan || 'Servicio de Consultoría Técnica',
    amount_pen: Number(amountPen) || 0,
    method: 'transferencia_bancaria',
    status: 'pending',
    notes: notes || 'Pago vía Transferencia Bancaria Directa a Cuentas Inmerge',
  };

  const { data, error } = await supabase
    .from('orders')
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return data;
}
