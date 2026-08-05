// Verifica que el flujo de pedidos por depósito no se pueda subvertir desde el
// cliente. Corre con la anon key: todo lo que este script NO logra hacer es
// exactamente la garantía del modelo.
//
// Uso: node scripts/verify-deposit-flow.mjs <email> <password> [<email2> <password2>]
// Sin el segundo usuario se saltan las pruebas de lectura cruzada entre cuentas.
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createClient } from '@supabase/supabase-js';

const [email, password, email2, password2] = process.argv.slice(2);
if (!email || !password) {
  console.error('Uso: node scripts/verify-deposit-flow.mjs <email> <password> [<email2> <password2>]');
  console.error('  Sin el segundo usuario se saltan las pruebas de lectura cruzada.');
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

// Una llamada RPC contra una función que no existe (firma incorrecta, typo, o
// una firma vieja que ya no existe) también vuelve con `error` truthy — pero
// por el motivo EQUIVOCADO ("function not found", no "permission denied").
// Un check que solo mira `!!error` no distingue esos dos casos, así que una
// firma que cambió deja el check en verde mintiendo. Esta función sí distingue:
// exige que el error NO tenga forma de "no encontré la función".
function checkExecuteDenied(error, label) {
  const looksLikeMissingFunction =
    !!error && (error.code === 'PGRST202' || /could not find the function|does not exist|no matches/i.test(error.message || ''));
  check(!!error && !looksLikeMissingFunction, label, error?.message);
  if (looksLikeMissingFunction) {
    console.log(`  ⚠ ese error es "función no encontrada", no "permiso denegado" — la firma probada ya no es la real`);
  }
}

const { data: auth, error: authError } = await supabase.auth.signInWithPassword({ email, password });
if (authError) {
  console.error('✗ login falló:', authError.message);
  process.exit(1);
}
check(true, 'login del usuario de prueba', auth.user.id);

const { data: premium } = await supabase.from('reports').select('id, slug, price_pen').eq('tier', 'premium').limit(1).single();
check(!!premium, 'hay un reporte premium en el catálogo', premium?.slug);

// 1) Intentar mandar un monto falso al crear el pedido. Antes de Task 1 esto
// se probaba insertando con amount_pen y confiando en que el trigger lo
// pisara. Desde 0005_column_grants.sql el INSERT de `orders` está acotado
// columna por columna a (user_id, kind, report_id, plan, method) —
// amount_pen NO está en esa lista — así que hoy el intento debe morir por
// permiso de columna ANTES de que el trigger llegue a correr. Confirmarlo así
// es una garantía más fuerte que "el trigger lo corrigió": el cliente ni
// siquiera puede intentarlo.
const { data: montoFalso, error: montoFalsoError } = await supabase
  .from('orders')
  .insert({ user_id: auth.user.id, kind: 'report', report_id: premium.id, method: 'deposit', amount_pen: 1 })
  .select()
  .single();
check(!!montoFalsoError, 'el cliente NO puede mandar un monto falso al crear el pedido', montoFalsoError?.message);
check(!montoFalso, 'ese intento no dejó ninguna fila creada');

// Pedido real, sin tocar amount_pen: el trigger orders_set_amount lo calcula
// desde reports.price_pen del lado del servidor.
const { data: order, error: orderError } = await supabase
  .from('orders')
  .insert({ user_id: auth.user.id, kind: 'report', report_id: premium.id, method: 'deposit' })
  .select()
  .single();
check(!orderError && !!order?.code, 'el cliente puede crear su pedido', orderError?.message || order?.code);
if (!order) {
  console.error('No se pudo crear el pedido de prueba — el resto de checks dependen de él. Abortando.');
  process.exit(1);
}
check(
  Number(order.amount_pen) === Number(premium.price_pen),
  'el pedido se creó con el precio real del servidor, no uno inventado por el cliente',
  `amount_pen = ${order.amount_pen}`,
);

// 2) Auto-aprobarse editando el pedido: UPDATE está revocado en la tabla
// completa (0005_column_grants.sql), no solo sin policy de RLS — por eso el
// error es un permission-denied de Postgres, no un 0-filas silencioso.
const { data: updated, error: updateError } = await supabase.from('orders').update({ status: 'approved' }).eq('id', order.id).select();
check(!updated || updated.length === 0, 'el cliente NO puede aprobar su propio pedido con un update', updateError?.message);

// 3) Borrar evidencia: DELETE también está revocado en la tabla completa.
const { data: deleted, error: deleteError } = await supabase.from('orders').delete().eq('id', order.id).select();
check(!deleted || deleted.length === 0, 'el cliente NO puede borrar su pedido', deleteError?.message);

// 4) Llamar approve_order como authenticated: EXECUTE revocado. La firma real
// hoy es (p_code text, p_amount_received numeric) — Task 3 tumbó la de un
// solo argumento. Si se llama con la firma vieja, Postgres responde "función
// no existe" y el check pasaría por la razón equivocada (justo el bug que
// dejó esta prueba vacía). Se llama con la firma REAL para forzar que el
// único motivo posible de fallo sea el permiso.
const { error: rpcError } = await supabase.rpc('approve_order', { p_code: order.code, p_amount_received: Number(premium.price_pen) });
checkExecuteDenied(rpcError, 'el cliente NO puede ejecutar approve_order');

// 5) has_access tampoco es invocable desde el cliente.
const { error: accessError } = await supabase.rpc('has_access', { p_user_id: auth.user.id, p_report_id: premium.id });
checkExecuteDenied(accessError, 'el cliente NO puede ejecutar has_access');

// 5b) El resto de funciones service_role-only nacidas en Tareas 3/4: preview_order,
// revoke_order y reject_order. Se llaman con su firma real y un código que no
// existe para que, si el EXECUTE alguna vez se filtra, el error deje de ser
// "permiso denegado" y pase a ser "el pedido no existe" — una señal inequívoca
// de que el default-privilege-revoke de 0005 se rompió.
const { error: previewError } = await supabase.rpc('preview_order', { p_code: 'INM-00-000000' });
checkExecuteDenied(previewError, 'el cliente NO puede ejecutar preview_order');

const { error: revokeError } = await supabase.rpc('revoke_order', { p_code: 'INM-00-000000', p_reason: 'prueba adversarial' });
checkExecuteDenied(revokeError, 'el cliente NO puede ejecutar revoke_order');

const { error: rejectError } = await supabase.rpc('reject_order', { p_code: 'INM-00-000000', p_reason: 'prueba adversarial' });
checkExecuteDenied(rejectError, 'el cliente NO puede ejecutar reject_order');

// 6) Escribir directamente las tablas de dinero.
const { error: purchaseError } = await supabase
  .from('purchases')
  .insert({ user_id: auth.user.id, report_id: premium.id, amount_pen: 1, status: 'paid' });
check(!!purchaseError, 'el cliente NO puede insertar en purchases', purchaseError?.message);

const { error: errSub } = await supabase
  .from('subscriptions')
  .insert({ user_id: auth.user.id, plan: 'annual', status: 'active', current_period_end: '2099-01-01' });
check(!!errSub, 'el cliente NO puede insertar en subscriptions', errSub?.message);

// C1: el trigger corrige amount_pen, pero `code` vive en un espacio único
// global del que depende todo el checkout. Desde 0005_column_grants.sql el
// INSERT de `orders` está acotado columna por columna a (user_id, kind,
// report_id, plan, method) — ni `code` ni `status` están en esa lista, así
// que Postgres debe rechazar la sentencia ENTERA por permiso de columna antes
// de que el trigger llegue a correr.
const { data: conCodigo, error: errCodigo } = await supabase
  .from('orders')
  .insert({ user_id: auth.user.id, kind: 'report', report_id: premium.id, method: 'deposit', code: 'INM-99-HACKED' })
  .select()
  .single();
check(!!errCodigo || conCodigo?.code !== 'INM-99-HACKED', 'el cliente NO puede elegir el código de su pedido', errCodigo?.message);

const { error: errAprobado } = await supabase
  .from('orders')
  .insert({ user_id: auth.user.id, kind: 'subscription', plan: 'monthly', method: 'deposit', status: 'approved' })
  .select()
  .single();
check(!!errAprobado, 'el cliente NO puede insertar un pedido ya aprobado', errAprobado?.message);

// PostgREST convierte un insert con onConflict en un INSERT ... ON CONFLICT DO
// UPDATE. Es la forma natural de atacar una tabla sin policy de UPDATE, y acá
// además choca con el mismo grant por columna de arriba (`id`/`status` no son
// insertables), así que el rechazo tiene DOS motivos reales superpuestos, no
// uno especulado.
const { data: upserted, error: upsertError } = await supabase
  .from('orders')
  .upsert({ id: order.id, status: 'approved' }, { onConflict: 'id' })
  .select();
check(!upserted || upserted.length === 0, 'el cliente NO puede aprobar su pedido vía upsert', upsertError?.message);

// El precio de un reporte o de un plan es dinero: ni reports ni plans tienen
// policy de UPDATE (0001/0003, solo SELECT). En la práctica los dos caminos
// verificados son distintos y ambos válidos: `reports` no tiene NINGÚN grant
// de tabla para UPDATE (0011 solo re-otorgó SELECT por columna), así que
// revienta con permiso denegado antes de que RLS entre a jugar; `plans`
// conserva el grant de tabla por defecto, así que ahí sí llega a RLS, que no
// encuentra ninguna fila que una policy autorice a tocar y el UPDATE afecta 0
// filas sin error. El check acepta cualquiera de las dos formas de "no pudo".
const { data: precioEditado, error: precioEditadoError } = await supabase
  .from('reports')
  .update({ price_pen: 1 })
  .eq('id', premium.id)
  .select();
check(!precioEditado || precioEditado.length === 0, 'el cliente NO puede editar el precio de un reporte', precioEditadoError?.message);

const { data: planEditado, error: planEditadoError } = await supabase.from('plans').update({ price_pen: 1 }).eq('id', 'monthly').select();
check(!planEditado || planEditado.length === 0, 'el cliente NO puede editar el precio de un plan', planEditadoError?.message);

// file_path (la ruta interna del PDF en el bucket privado) fue revocado
// columna por columna en 0011: select(id, slug, tag, title, summary, tier,
// price_pen, cover_image_path, published_at, created_at) — file_path no está.
// Pedirla explícitamente debe tumbar la sentencia con permiso denegado.
const { data: fileLeak, error: fileLeakError } = await supabase.from('reports').select('file_path').limit(1);
check(!!fileLeakError || fileLeak?.[0]?.file_path === undefined, 'el cliente NO puede leer file_path', fileLeakError?.message);

// Lectura cruzada entre usuarios: solo corre si se pasó una segunda cuenta.
if (email2 && password2) {
  const otro = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);
  const { data: auth2, error: authError2 } = await otro.auth.signInWithPassword({ email: email2, password: password2 });
  if (authError2) {
    check(false, 'login del segundo usuario', authError2.message);
  } else {
    const { data: ajenos } = await otro.from('orders').select('*').eq('user_id', auth.user.id);
    check(!ajenos || ajenos.length === 0, 'un usuario NO puede leer los pedidos de otro');

    const { data: comprasAjenas } = await otro.from('purchases').select('*').eq('user_id', auth.user.id);
    check(!comprasAjenas || comprasAjenas.length === 0, 'un usuario NO puede leer las compras de otro');
  }
} else {
  console.log('(sin segunda cuenta: se saltan las pruebas de lectura cruzada)');
}

// Limpieza real: el pedido de prueba se borra con la propia sesión del
// usuario si algo dejó una policy de DELETE abierta por error; si no (el caso
// esperado, ver el check #3 de arriba), el script no puede limpiarlo — se
// avisa en vez de dejarlo pendiente en silencio.
const { data: selfCleanup } = await supabase.from('orders').delete().eq('id', order.id).select();
console.log();
console.log(failed ? 'RESULTADO: revisa los ✗ de arriba.' : 'RESULTADO: el modelo de seguridad se sostiene.');
if (selfCleanup && selfCleanup.length > 0) {
  console.log(`\nLimpieza: el pedido de prueba ${order?.code} se borró (el cliente no debería poder hacer esto — revísalo).`);
} else {
  console.log(`\nLimpieza pendiente (esperado — el cliente no puede borrar pedidos): el pedido ${order?.code} quedó pendiente.`);
  console.log(`Bórralo con la service key:`);
  console.log(`  delete from public.orders where code = '${order?.code}';`);
}
process.exit(failed ? 1 : 0);
