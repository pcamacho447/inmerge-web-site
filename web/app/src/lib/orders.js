import { supabase } from './supabaseClient.js';

// El cliente puede INSERTAR su propio pedido (RLS: orders_insert_own) y nada
// más: no hay policy de UPDATE ni DELETE, y un trigger BEFORE INSERT
// sobreescribe amount_pen desde la BD, así que el precio nunca viaja desde el
// navegador. El acceso solo aparece cuando el dueño corre approve_order() como
// service-role. Ver supabase/migrations/0003 y 0004.

export const ORDER_METHODS = { DEPOSIT: 'deposit', YAPE_PLIN: 'yape_plin' };

function targetColumn(kind) {
  return kind === 'subscription' ? 'plan' : 'report_id';
}

// Reutiliza un pedido pendiente del mismo ítem en vez de acuñar un código
// nuevo cada vez que el cliente reabre el modal — si no, un solo cliente
// produce cinco códigos para el mismo reporte y conciliarlos a mano se vuelve
// adivinanza.
export async function createOrder({ kind, itemId, method }) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) throw new Error('Necesitas iniciar sesión para generar un pedido.');

  const column = targetColumn(kind);

  const { data: existing, error: existingError } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user.id)
    .eq('kind', kind)
    .eq(column, itemId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(1);
  if (existingError) throw new Error(existingError.message);
  if (existing?.length) return existing[0];

  // amount_pen se omite a propósito: lo pone el trigger.
  const { data, error } = await supabase
    .from('orders')
    .insert({ user_id: user.id, kind, [column]: itemId, method })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

// Solo pendientes y rechazados: los aprobados ya se reflejan como suscripción
// o como reporte comprado, mostrarlos otra vez sería ruido.
export async function fetchOrders(userId) {
  const { data, error } = await supabase
    .from('orders')
    .select('id, code, kind, report_id, plan, amount_pen, method, status, notes, created_at')
    .eq('user_id', userId)
    .in('status', ['pending', 'rejected'])
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}
