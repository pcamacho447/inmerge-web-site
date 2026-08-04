// Verifica que el flujo de pedidos por depósito no se pueda subvertir desde el
// cliente. Corre con la anon key: todo lo que este script NO logra hacer es
// exactamente la garantía del modelo.
//
// Uso: node scripts/verify-deposit-flow.mjs <email> <password>
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createClient } from '@supabase/supabase-js';

const [email, password] = process.argv.slice(2);
if (!email || !password) {
  console.error('Uso: node scripts/verify-deposit-flow.mjs <email> <password>');
  process.exit(1);
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '..', '.env.local');
if (!existsSync(envPath)) {
  console.error('Falta .env.local');
  process.exit(1);
}
const env = Object.fromEntries(
  readFileSync(envPath, 'utf-8')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'))
    .map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1)]),
);

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);
let failed = false;

function check(ok, label, detail = '') {
  console.log(`${ok ? '✓' : '✗'} ${label}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failed = true;
}

const { data: auth, error: authError } = await supabase.auth.signInWithPassword({ email, password });
if (authError) {
  console.error('✗ login falló:', authError.message);
  process.exit(1);
}
check(true, 'login del usuario de prueba', auth.user.id);

const { data: premium } = await supabase.from('reports').select('id, slug, price_pen').eq('tier', 'premium').limit(1).single();
check(!!premium, 'hay un reporte premium en el catálogo', premium?.slug);

// 1) Crear un pedido mandando un monto falso: el trigger debe ignorarlo.
const { data: order, error: orderError } = await supabase
  .from('orders')
  .insert({ user_id: auth.user.id, kind: 'report', report_id: premium.id, method: 'deposit', amount_pen: 1 })
  .select()
  .single();
check(!orderError && !!order?.code, 'el cliente puede crear su pedido', orderError?.message || order?.code);
check(
  Number(order?.amount_pen) === Number(premium.price_pen),
  'el trigger ignoró el monto falso del cliente',
  `amount_pen = ${order?.amount_pen}`,
);

// 2) Auto-aprobarse editando el pedido: no hay policy de UPDATE.
const { data: updated } = await supabase.from('orders').update({ status: 'approved' }).eq('id', order.id).select();
check(!updated || updated.length === 0, 'el cliente NO puede aprobar su propio pedido con un update');

// 3) Borrar evidencia: no hay policy de DELETE.
const { data: deleted } = await supabase.from('orders').delete().eq('id', order.id).select();
check(!deleted || deleted.length === 0, 'el cliente NO puede borrar su pedido');

// 4) Llamar approve_order como authenticated: EXECUTE revocado.
const { error: rpcError } = await supabase.rpc('approve_order', { p_code: order.code });
check(!!rpcError, 'el cliente NO puede ejecutar approve_order', rpcError?.message);

// 5) has_access tampoco es invocable desde el cliente.
const { error: accessError } = await supabase.rpc('has_access', { p_user_id: auth.user.id, p_report_id: premium.id });
check(!!accessError, 'el cliente NO puede ejecutar has_access', accessError?.message);

// 6) Escribir directamente las tablas de dinero.
const { error: purchaseError } = await supabase
  .from('purchases')
  .insert({ user_id: auth.user.id, report_id: premium.id, amount_pen: 1, status: 'paid' });
check(!!purchaseError, 'el cliente NO puede insertar en purchases', purchaseError?.message);

console.log();
console.log(failed ? 'RESULTADO: revisa los ✗ de arriba.' : 'RESULTADO: el modelo de seguridad se sostiene.');
console.log(`\nPedido de prueba creado: ${order?.code} — apruébalo con: select approve_order('${order?.code}');`);
process.exit(failed ? 1 : 0);
