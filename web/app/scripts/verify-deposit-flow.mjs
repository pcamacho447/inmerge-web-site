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

// Igual que checkExecuteDenied pero para INSERTs de `orders`: exige que el
// rechazo sea específicamente un permiso de columna denegado (42501), no
// cualquier error. En particular no debe poder pasar por una violación de
// índice único (23505) — si el ítem elegido ya tiene un pedido pendiente,
// orders_one_pending_per_item también tumbaría el insert, y el check quedaría
// en verde aunque el grant de columna que en verdad se quiere probar se
// hubiera restaurado por error. Ver hallazgo de code review, ronda 1.
function checkColumnGrantDenied(error, label) {
  const isUniqueViolation = error?.code === '23505' || /duplicate key value violates unique constraint/i.test(error?.message || '');
  const isColumnGrantDenied = error?.code === '42501';
  check(isColumnGrantDenied && !isUniqueViolation, label, error?.message);
  if (isUniqueViolation) {
    console.log('  ⚠ ese error es una violación de índice único (23505), no el permiso de columna que se quiere probar');
  }
}

const { data: auth, error: authError } = await supabase.auth.signInWithPassword({ email, password });
if (authError) {
  console.error('✗ login falló:', authError.message);
  process.exit(1);
}
check(true, 'login del usuario de prueba', auth.user.id);

const { data: premiums } = await supabase.from('reports').select('id, slug, price_pen').eq('tier', 'premium').order('created_at').limit(2);
const [premium, premium2] = premiums || [];
check(!!premium, 'hay un reporte premium en el catálogo', premium?.slug);
// Los checks de inyección de monto falso y de `code` más abajo necesitan un
// ÍTEM DISTINTO al del pedido principal: si usaran el mismo report_id,
// orders_one_pending_per_item (índice único parcial sobre pedidos 'pending')
// también tumbaría el insert, y el check pasaría por esa razón aunque el
// grant de columna que en verdad prueba se hubiera restaurado por error. Ver
// hallazgo de code review, ronda 1 (originalmente solo para `code`; Important
// 4 de la revisión final extendió el mismo motivo a la inyección de monto,
// para que esa prueba corra completa incluso reutilizando el pedido
// principal de una corrida anterior).
check(!!premium2 && premium2.id !== premium?.id, 'hay un SEGUNDO reporte premium para aislar los checks de inyección', premium2?.slug);
// Deferred minor de la revisión final: antes esto solo imprimía un ✗ y
// seguía — con un único reporte premium en el catálogo, `premium2` queda
// `undefined` y el resto del script revienta con un TypeError al leer
// `premium2.id` varias líneas más abajo, en vez de salir con un mensaje
// entendible. El resto de checks de este script asume que ambos existen.
if (!premium || !premium2) {
  console.error('Se necesitan al menos 2 reportes premium en el catálogo — el resto de checks depende de esto. Abortando.');
  process.exit(1);
}

// 1) Intentar mandar un monto falso al crear el pedido. Antes de Task 1 esto
// se probaba insertando con amount_pen y confiando en que el trigger lo
// pisara. Desde 0005_column_grants.sql el INSERT de `orders` está acotado
// columna por columna a (user_id, kind, report_id, plan, method) —
// amount_pen NO está en esa lista — así que hoy el intento debe morir por
// permiso de columna ANTES de que el trigger llegue a correr. Confirmarlo así
// es una garantía más fuerte que "el trigger lo corrigió": el cliente ni
// siquiera puede intentarlo.
//
// Usa `premium2`, NO `premium`: este intento tiene que poder correr en
// CUALQUIER corrida del script, incluida una que reutiliza un pedido
// 'pending' que quedó de una corrida anterior para `premium.id` (ver más
// abajo — el cliente no tiene DELETE sobre `orders`, así que esa fila nunca
// se limpia sola). Si este intento apuntara a `premium.id` y ya hubiera un
// pendiente ahí, correría el mismo riesgo que `checkColumnGrantDenied` existe
// para evitar en el check de inyección de `code`: si el grant de columna
// alguna vez se restaura por error, el insert moriría por 23505 (índice
// único) en vez de 42501 (permiso de columna), y el check quedaría en verde
// mintiendo sobre lo que en verdad prueba. `premium2` nunca recibe un insert
// exitoso en este script (el check de inyección de `code` de más abajo
// también apunta ahí y también falla sin dejar fila), así que se mantiene
// limpio entre corridas y esta prueba corre completa siempre, sin
// debilitarse por reutilización.
const { data: montoFalso, error: montoFalsoError } = await supabase
  .from('orders')
  .insert({ user_id: auth.user.id, kind: 'report', report_id: premium2.id, method: 'deposit', amount_pen: 1 })
  .select()
  .single();
check(!!montoFalsoError, 'el cliente NO puede mandar un monto falso al crear el pedido', montoFalsoError?.message);
check(!montoFalso, 'ese intento no dejó ninguna fila creada');

// Reutilización del pedido real: el cliente NO tiene DELETE sobre `orders`
// (0005/0012), así que una corrida anterior de este mismo script deja su
// pedido de prueba 'pending' para siempre. Antes, la SEGUNDA corrida
// intentaba insertar otro pedido para el mismo reporte premium, chocaba con
// orders_one_pending_per_item (23505), y el script abortaba con
// process.exit(1) — Important 4 de la revisión final: un harness que necesita
// SQL manual entre corridas deja de correrse. Se busca un pendiente existente
// para este ítem y, si existe, se reutiliza en vez de insertar; si no, se crea
// uno nuevo (el trigger orders_set_amount calcula amount_pen desde
// reports.price_pen del lado del servidor, sin tocar amount_pen desde acá).
const { data: pendientesExistentes, error: pendienteError } = await supabase
  .from('orders')
  .select('*')
  .eq('user_id', auth.user.id)
  .eq('kind', 'report')
  .eq('report_id', premium.id)
  .eq('status', 'pending')
  .order('created_at', { ascending: false })
  .limit(1);
if (pendienteError) {
  console.error('No se pudo buscar un pedido pendiente existente:', pendienteError.message);
  process.exit(1);
}
const pedidoReutilizable = pendientesExistentes?.[0] ?? null;

let order;
if (pedidoReutilizable) {
  console.log(`(reutilizando el pedido pendiente existente ${pedidoReutilizable.code} en vez de crear uno nuevo)`);
  order = pedidoReutilizable;
  check(true, 'el cliente reutiliza su pedido pendiente existente en vez de duplicarlo', order.code);
} else {
  const { data: nuevoOrder, error: orderError } = await supabase
    .from('orders')
    .insert({ user_id: auth.user.id, kind: 'report', report_id: premium.id, method: 'deposit' })
    .select()
    .single();
  check(!orderError && !!nuevoOrder?.code, 'el cliente puede crear su pedido', orderError?.message || nuevoOrder?.code);
  if (!nuevoOrder) {
    console.error('No se pudo crear el pedido de prueba — el resto de checks dependen de él. Abortando.');
    process.exit(1);
  }
  order = nuevoOrder;
}

check(
  Number(order.amount_pen) === Number(premium.price_pen),
  'el pedido tiene el precio real del servidor, no uno inventado por el cliente',
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
//
// Usa `premium2` (un ítem SIN pedido pendiente) a propósito, no `premium`: el
// pedido principal de arriba ya dejó una fila 'pending' para
// (user, 'report', premium.id), y orders_one_pending_per_item también
// rechazaría un segundo insert sobre ESE mismo ítem — con un 23505 de índice
// único, no con el permiso de columna que este check existe para probar. Si
// se reusara `premium.id` acá, el check seguiría en verde aunque el grant de
// `code` se restaurara por error: pasaría por la razón equivocada, exactamente
// el defecto que esta tarea existe para eliminar. checkColumnGrantDenied
// además exige que el error sea 42501 y rechaza explícitamente un 23505.
const { data: conCodigo, error: errCodigo } = await supabase
  .from('orders')
  .insert({ user_id: auth.user.id, kind: 'report', report_id: premium2.id, method: 'deposit', code: 'INM-99-HACKED' })
  .select()
  .single();
checkColumnGrantDenied(errCodigo, 'el cliente NO puede elegir el código de su pedido');
check(!conCodigo, 'ese intento no dejó ninguna fila creada con el código elegido por el cliente');

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
// policy de UPDATE (0001/0003, solo SELECT). Verificado contra el proyecto
// real: el mecanismo es IDÉNTICO en ambas tablas — `information_schema`
// confirma que tanto `reports` como `plans` sí tienen el UPDATE de tabla Y de
// columna (`price_pen` incluida) otorgado a anon/authenticated; ninguna de
// las dos tiene grants revocados como sí los tiene `orders` (0005). Sin
// policy de UPDATE, RLS filtra el UPDATE a 0 filas — sin error — en las dos.
//
// (Ronda 1 de code review encontró que el comentario anterior decía que
// `reports` rechazaba con permiso de columna denegado, "antes de que RLS
// entre a jugar" — falso, y probablemente un artefacto de copiar el
// comentario del check de `file_path` de más abajo. Lo que en verdad pasaba:
// este check encadenaba `.select()` sin columnas, que por defecto pide
// `select=*` — y ESE `*` sí choca con el SELECT restringido de 0009 (que
// excluye `file_path`), disparando un permission-denied que no tiene nada que
// ver con el UPDATE que se quiere probar. Aislado con
// `.select('id, price_pen')` — columnas que sí están en el grant de SELECT —
// el UPDATE por sí solo vuelve con 0 filas, sin error, igual que `plans`.)
const { data: precioEditado, error: precioEditadoError } = await supabase
  .from('reports')
  .update({ price_pen: 1 })
  .eq('id', premium.id)
  .select('id, price_pen');
check(!precioEditado || precioEditado.length === 0, 'el cliente NO puede editar el precio de un reporte', precioEditadoError?.message);

const { data: planEditado, error: planEditadoError } = await supabase
  .from('plans')
  .update({ price_pen: 1 })
  .eq('id', 'monthly')
  .select('id, price_pen');
check(!planEditado || planEditado.length === 0, 'el cliente NO puede editar el precio de un plan', planEditadoError?.message);

// file_path (la ruta interna del PDF en el bucket privado) fue revocado
// columna por columna en 0009: select(id, slug, tag, title, summary, tier,
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
