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
      .maybeSingle();

    if (pErr || !profile?.organization_id) return null;

    const { data: org, error: oErr } = await supabase
      .from('organizations')
      .select('id, billing_type, legal_name, tax_id, billing_email, billing_address, created_at')
      .eq('id', profile.organization_id)
      .maybeSingle();

    if (oErr) {
      console.warn('Error al obtener datos de organización:', oErr);
      return null;
    }
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

  // Validación estricta de formato de RUC peruano (11 dígitos numéricos)
  if (payload.billing_type === 'ruc') {
    if (!payload.tax_id || !/^[0-9]{11}$/.test(payload.tax_id)) {
      throw new Error('El RUC debe contener exactamente 11 dígitos numéricos.');
    }
  }

  // Buscar si el usuario ya tiene organization_id
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', userId)
    .maybeSingle();

  if (profile?.organization_id) {
    const { data, error } = await supabase
      .from('organizations')
      .update(payload)
      .eq('id', profile.organization_id)
      .select('id, billing_type, legal_name, tax_id, billing_email, billing_address, created_at')
      .single();

    if (error) throw error;
    return data;
  }

  // Crear nueva organización y vincularla al perfil
  const { data: newOrg, error: insErr } = await supabase
    .from('organizations')
    .insert([payload])
    .select('id, billing_type, legal_name, tax_id, billing_email, billing_address, created_at')
    .single();

  if (insErr) throw insErr;

  await supabase
    .from('profiles')
    .upsert({ id: userId, organization_id: newOrg.id });

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
      .select('id, code, kind, plan, amount_pen, method, status, notes, approved_at, created_at, expires_at')
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

  const parsedAmount = Number(amountPen);
  if (isNaN(parsedAmount) || !isFinite(parsedAmount) || parsedAmount <= 0) {
    throw new Error('El monto de la orden debe ser un valor numérico positivo en Soles (PEN).');
  }

  const payload = {
    user_id: userId,
    kind: 'consultoria_servicio',
    plan: plan?.trim() || 'Servicio de Consultoría Técnica',
    amount_pen: parsedAmount,
    method: 'transferencia_bancaria',
    status: 'pending',
    notes: notes?.trim() || 'Pago vía Transferencia Bancaria Directa a Cuentas Inmerge',
  };

  const { data, error } = await supabase
    .from('orders')
    .insert([payload])
    .select('id, code, kind, plan, amount_pen, method, status, notes, approved_at, created_at, expires_at')
    .single();

  if (error) throw error;
  return data;
}
