# Pago por depósito bancario — diseño

**Fecha:** 2026-08-04
**Estado:** aprobado, pendiente de plan de implementación
**Reemplaza:** Fase B4 (Culqi) del plan en `web/app/CLAUDE.md`

## Contexto

Culqi quedó descartado: el área comercial de Culqi no aceptó la solicitud, así que no hay API key ni fecha para tenerla. El sitio ya tiene precios publicados (S/180 por reporte suelto, S/249/mes, S/2,390/año) y toda la cadena de entitlements funciona de verdad (Supabase Auth + Postgres + Storage + la Edge Function `get-report-download-url` con `has_access()`). Lo único simulado era el **write de pago**: `subscribe()`/`purchaseReport()` en `src/lib/auth.jsx` escriben en `localStorage`.

Este diseño reemplaza ese paso por **depósito/transferencia bancaria y Yape/Plin, con verificación humana**, hasta que exista una pasarela. La facturación ya era manual (boleta/factura enviada a mano), así que el proceso no introduce un modo de operación nuevo: lo extiende al cobro.

## Decisiones tomadas

| Decisión | Elegido | Alternativas descartadas |
|---|---|---|
| Dónde se coordina el pago | Pedido registrado en la web, **constancia por WhatsApp** | Subida de voucher en la web (más código: bucket + pantalla de revisión); todo por WhatsApp sin pedido (sin trazabilidad) |
| Cómo se aprueba | **Función SQL** `approve_order()` ejecutada desde el SQL Editor de Supabase | Pantalla `/admin` (requiere rol admin + Edge Function con service-role); script local (ata a la máquina del proyecto) |
| Suscripciones sin cobro recurrente | **Renovación manual con vencimiento real** — periodo pagado por adelantado, `has_access()` exige `current_period_end > now()` | Solo venta individual (pierde el producto recurrente); activación indefinida (acceso gratis si te olvidas de revisar) |
| Medios de pago | **Cuenta bancaria + Yape/Plin** | Solo cuenta bancaria; no mostrar datos en la web |
| Capa mock actual | **Se conserva detrás de `VITE_DEMO_MODE`** | Eliminarla ya |
| Quién escribe el pedido | **Insert directo del cliente en `orders`** con RLS + trigger de monto | Edge Function `create-order`; reusar `purchases` con `status='pending'` |

Sobre la última decisión: `0001_init.sql` establece que las tablas de dinero solo las escriben Edge Functions con service-role. `orders` es la **excepción deliberada** porque es una tabla de *intención*: una fila ahí no otorga nada. El comentario de cabecera de la migración debe decirlo explícitamente, o en tres meses parece una violación de la regla.

Sobre `VITE_DEMO_MODE`: el riesgo aceptado es mantener dos caminos vivos. Se mitiga apagando el mock **por completo** cuando la bandera es `false` — sin unión `mock ∪ real` en producción, que es lo que ya causó confusión una vez. El default con la variable ausente es producción, no demo: olvidar configurarla nunca puede regalar acceso.

## Alcance

**Incluye:** tabla `orders` + `plans`, `approve_order()`/`reject_order()`, corrección de `has_access()`, flujo de checkout por depósito, sección de pedidos y vencimiento en `/cuenta`, script de verificación de seguridad, tests unitarios, y dos correcciones de honestidad en la UI (abajo).

**No incluye:** Culqi (si aparece la API key, `orders` sigue sirviendo: la webhook llamaría a la misma `approve_order`), pantalla de administración, subida de vouchers, rate limiting, facturación electrónica SUNAT, cron de expiración de status.

## Modelo de datos — `migrations/0003_deposit_orders.sql`

### `public.plans`

Los precios y la **duración del periodo** viven hoy solo en `content.js` (front-end). El servidor necesita saber que "mensual" es 1 mes y "anual" 12 para calcular el vencimiento:

```sql
create table public.plans (
  id text primary key check (id in ('monthly','annual')),
  name text not null,
  price_pen numeric(10,2) not null,
  period_months int not null
);
-- seed: ('monthly','Premium Mensual',249.00,1), ('annual','Premium Anual',2390.00,12)
```

RLS: `select` público (como `reports`), sin insert/update de cliente.

### `public.orders`

```
code         text unique      -- INM-2026-0042, default desde una sequence
user_id      uuid  → auth.users (on delete cascade)
kind         text  check ('report' | 'subscription')
report_id    uuid  → reports   -- obligatorio si kind='report', null si no
plan         text  → plans     -- obligatorio si kind='subscription', null si no
amount_pen   numeric(10,2)     -- lo escribe el trigger, no el cliente
method       text  check ('deposit' | 'yape_plin')
status       text  check ('pending' | 'approved' | 'rejected' | 'expired')  default 'pending'
notes        text              -- motivo de rechazo, visible al cliente
approved_at  timestamptz
created_at   timestamptz not null default now()
```

Un `check` de tabla garantiza la coherencia `kind` ↔ objetivo:
```sql
constraint orders_kind_target check (
  (kind = 'report'       and report_id is not null and plan is null) or
  (kind = 'subscription' and plan      is not null and report_id is null)
)
```

El valor `expired` de `status` no lo usa nada automáticamente en esta fase; existe para poder cerrar a mano pedidos viejos que nunca se pagaron, sin borrarlos.

RLS:
```sql
orders_select_own  for select using (auth.uid() = user_id)
orders_insert_own  for insert with check (auth.uid() = user_id and status = 'pending')
```
**Sin policy de `update` ni `delete`:** el cliente no puede aprobarse a sí mismo ni borrar evidencia.

### Trigger `orders_set_amount()` (BEFORE INSERT)

Sobreescribe `amount_pen` con `reports.price_pen` o `plans.price_pen` según `kind`, ignorando lo que envió el cliente. Rechaza pedidos sobre reportes `tier='free'`.

### `approve_order(p_code)` / `reject_order(p_code, p_reason)`

`security definer`, `set search_path = public`, y **`revoke execute from anon, authenticated`** — solo el service-role (SQL Editor del dashboard) puede ejecutarlas. En una transacción, `approve_order`:

1. `select … for update` por `code`; excepción si no existe o si `status <> 'pending'` (dos ejecuciones seguidas no duplican).
2. `kind='report'` → `insert into purchases (user_id, report_id, amount_pen, status='paid') on conflict do nothing`.
3. `kind='subscription'` → upsert en `subscriptions` con
   `current_period_end = greatest(coalesce(current_period_end, now()), now()) + interval '1 month' * period_months`
   — renovar **extiende desde el vencimiento, no desde hoy**, para no regalar ni quitar días.
4. `orders.status='approved'`, `approved_at=now()`.
5. Devuelve un resumen legible (cliente, ítem, monto, nuevo vencimiento).

Uso: `select approve_order('INM-2026-0042');`

### Correcciones al esquema existente

- **`has_access()`**: agregar `and s.current_period_end > now()` en la rama de suscripción. Sin esto nada vence nunca y el modelo de "periodo pagado" no existe. Además `set search_path = public` y `revoke execute from anon, authenticated` — seguro porque la Edge Function la invoca con un cliente **service-role** (verificado en `functions/get-report-download-url/index.ts:35`). Cierra las 3 advertencias del linter de seguridad.
- Índice único parcial `purchases (user_id, report_id) where status='paid'` — impide cobrar dos veces el mismo reporte y habilita el `on conflict do nothing`.
- Índice único `subscriptions (user_id)` — una suscripción por usuario, que es la semántica que `has_access()` ya asume. Seguro de agregar: las tablas están en 0 filas.

`status` queda en `'active'` aunque el periodo venza: el acceso caduca por la fecha, no por el status, y el front deriva "vencida" de la fecha. No se agrega `pg_cron` — sería complejidad sin efecto sobre la corrección.

## Front-end

| Archivo | Cambio |
|---|---|
| `src/lib/demoMode.js` | **Nuevo.** `export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true'`. Un solo punto de lectura; ausente = producción. |
| `src/data/bankDetails.js` | **Nuevo.** Banco, tipo de cuenta, número, CCI, titular, RUC, número de Yape/Plin, plazo de verificación. Lo edita el usuario. |
| `src/lib/orders.js` | **Nuevo.** `createOrder({kind, item, method})` y `fetchOrders(userId)`. |
| `src/hooks/usePlans.js` | **Nuevo.** Espejo de `useReports.js`, lee la tabla `plans`. |
| `src/components/CheckoutModal.jsx` | Dos pasos en modo real; sin inputs de tarjeta. |
| `src/lib/auth.jsx` | Mock tras la bandera; `current_period_end`; `pendingOrders`; manejo de sesión zombi. |
| `src/pages/Cuenta.jsx` | Sección de pedidos; vencimiento; botón de renovar. |
| `src/pages/Reportes.jsx` | Copy de botones; corregir el caption obsoleto (ver "Correcciones de honestidad"). |
| `src/pages/Planes.jsx` | Consume `usePlans()`; el "desde S/ 180" se deriva del mínimo `price_pen` de los reportes premium. |
| `src/data/content.js` | `waVoucherMessage(order)`; se eliminan `PLAN_PRICE_PEN` **y** `REPORT_PRICE_PEN` (la BD pasa a ser la fuente). |

**`createOrder` reutiliza el pendiente:** busca primero un pedido `pending` del mismo usuario para el mismo ítem y lo devuelve si existe. Sin esto, cada vez que el cliente reabre el modal se generaría un código nuevo y habría cinco pedidos del mismo reporte que conciliar.

**Precios desde la BD:** si `content.js` dice S/249 y la tabla dice otra cosa, el cliente ve un precio y el trigger le cobra otro. `content.js` conserva solo copy (`name`, `description`, `features`, `badge`). Aplica igual a `REPORT_PRICE_PEN`, que `Planes.jsx:125` usa hoy para el texto "desde S/ 180": pasa a derivarse del mínimo `price_pen` de los reportes premium, que es el número que el trigger va a cobrar de verdad.

**`CheckoutModal`, modo real:**
1. *Resumen* — título, precio, selector de método (depósito o Yape/Plin), y el banner reemplazado por el aviso de activación manual. Botón "Generar pedido", o "Crear cuenta para continuar" sin sesión.
2. *Instrucciones* — código visible, monto exacto, datos del método elegido con botones de copiar, y CTA de WhatsApp con mensaje pre-llenado que incluye el código.

Un link `wa.me` **no puede adjuntar la foto**: abre el chat con el texto listo y el cliente adjunta la constancia a mano. El copy debe pedirlo explícitamente.

**`auth.jsx`:** con `DEMO_MODE=false`, `buildUser()` ignora `localStorage` por completo (sin `loadMockState`, sin unión). `subscribe()`/`cancelSubscription()`/`purchaseReport()` permanecen en el contexto para no cambiar la forma de `useAuth()`, pero lanzan error si se invocan con la bandera apagada — si alguien las cablea por accidente, revienta en desarrollo en vez de conceder acceso falso en silencio. `hasAccess()` agrega la comprobación de fecha para seguir siendo espejo de `has_access()`.

## Manejo de errores

- **Crear pedido falla** → error inline, **no** avanza al paso de instrucciones: nunca se entregan datos bancarios por un pedido que no quedó registrado. Reintentar es idempotente por la reutilización del pendiente.
- **Aprobar un pedido no-`pending`** → excepción con mensaje legible, en vez de una segunda fila de `purchases`.
- **Rechazo** → `notes` visible en `/cuenta`; sin eso el cliente espera indefinidamente.
- **Estados imposibles** → imposibles por `check` de tabla y por el trigger, no por validación de UI.
- **`file_path` nulo** → hoy los 7 reportes lo tienen en `null`, así que un pedido aprobado igual devuelve el `404 "Report file not available yet"` de la Edge Function. La UI debe decir "el archivo aún no está disponible, escríbenos" en lugar del error crudo.

## Seguridad

Invariante verificable: **el único camino que otorga acceso es `approve_order`, y solo el service-role puede ejecutarla.**

- `orders` sin policy de `update`/`delete`.
- El precio no viaja desde el cliente (trigger).
- `has_access()` con `search_path` fijo y `EXECUTE` revocado.
- Los datos bancarios van en el bundle del navegador: son públicos por diseño. El número de Yape es el mismo WhatsApp ya publicado en todo el sitio, así que no agrega exposición.

**Riesgos aceptados, explícitamente:** (1) nada valida que el depósito sea real — la verificación es humana, y ahí está el riesgo de fraude por voucher editado; (2) un cliente autenticado puede crear pedidos indefinidamente. La reutilización del pendiente evita duplicados accidentales pero no es un rate limit; no se implementa uno porque el daño de un pedido basura es ensuciar una lista que solo ve el dueño.

## Verificación

**`scripts/verify-deposit-flow.mjs`** — con la anon key, desde la posición de un atacante y no de un administrador. Afirma:

1. login del usuario de prueba
2. crear pedido devuelve un `code`
3. insertar con `amount_pen: 1` → el trigger lo dejó en `180`
4. `update` de su propio pedido a `approved` → **falla**
5. `rpc('approve_order')` como `authenticated` → **falla**
6. leer el pedido de otro usuario → devuelve vacío

**Tests unitarios (vitest, ya instalado):** `hasAccess()` como espejo de `has_access()`, incluyendo **suscripción vencida** — cálculo puro, sin BD, y justo la rama que introduce el SQL nuevo. Más `createOrder` reutilizando el pendiente, con el cliente de Supabase mockeado.

**Cierre end-to-end:** aprobar un pedido de suscripción y correr `test-download-url.mjs`. Esto ejercita por fin la rama de suscripción de `has_access()`, que nunca se probó.

## Prerequisitos y bloqueadores

**Bloquea toda verificación end-to-end** (detectado al revisar el proyecto el 2026-08-04): el proyecto `zboxdsiejvmjupdawgax` está sin datos de prueba — `auth.users`, `storage.objects`, `purchases`, `subscriptions` y `profiles` en 0 filas, y `file_path` nulo en los 7 reportes. Hay que recrear: un usuario de prueba, un PDF en el bucket `report-files`, y el `file_path` de al menos un reporte premium.

**Bloquea el primer pedido real:** los valores de `bankDetails.js`. El archivo se crea con la estructura y comentarios; los datos (cuenta, CCI, RUC, Yape) los pone el dueño.

**No bloquea nada de esto, pero sigue abierto:** el dominio `inmerge.pe` no resuelve (sin registros MX/A/NS), así que los `mailto:contacto@inmerge.pe` del sitio son indeseables y Supabase rechaza direcciones `@inmerge.pe` al registrarse.

## Correcciones de honestidad incluidas

Dos cosas que el estado actual del código ya reclama y que este trabajo toca de paso:

1. **`Reportes.jsx:181`** muestra "Descarga disponible cuando el backend esté conectado" en tarjetas a las que el usuario **sí** tiene acceso, con el botón `disabled`. Es falso desde B3: la descarga funciona.
2. **Sesión zombi.** `ensureProfile` no maneja el caso "sesión válida en storage, usuario inexistente en la BD": reintenta el insert en cada `getSession`, cada `onAuthStateChange` y cada cambio de visibilidad de pestaña, fallando con `42501` contra `organizations` y escribiendo solo en consola. Debe cerrar la sesión y tratarla como no autenticada — una sesión cuyo usuario no existe es basura, no un error transitorio. Reproducido en vivo el 2026-08-04 con el usuario `8fa340f1-d035-4164-8fec-50a49215c220`, que ya no existe.

## Arreglado durante esta sesión (no forma parte del plan pendiente)

**Los reportes no se veían en `/reportes`.** Causa raíz: `useReveal` tomaba una única foto del DOM con `querySelectorAll`, así que las tarjetas —que desde B2 llegan asíncronas de Supabase— nunca entraban al `IntersectionObserver` y se quedaban en `opacity: 0` para siempre. Estaban en el DOM con sus títulos reales; se leía como un fallo de carga de datos. Regresión introducida en B2, enmascarada por la regla `prefers-reduced-motion` de `index.css:232`, que fuerza `opacity: 1`.

Arreglado en el origen con un `MutationObserver` en `useReveal`, no en la página: `/cuenta` tiene el mismo patrón y la nueva sección de pedidos lo heredaría. Cubierto por `src/hooks/useReveal.test.jsx` — verificado que **falla** contra la implementación vieja y pasa con la nueva. Se agregaron `vitest` + `jsdom` y los scripts `test`/`test:watch`.
