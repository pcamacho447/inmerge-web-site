# Endurecimiento del flujo de pago por depósito — Design Spec

**Fecha:** 2026-08-04
**Estado:** aprobado, pendiente de plan de implementación
**Antecede a:** `2026-08-04-pago-deposito-bancario-design.md` (el diseño original, ya implementado)

## Por qué existe este documento

El flujo de pago por depósito se implementó y funciona. Dos revisiones independientes
—una general y una adversarial con acceso de lectura a la base de datos real— lo
auditaron después. Ninguna encontró un camino para obtener acceso sin `approve_order()`:
el modelo central se sostiene, y eso está verificado contra el proyecto vivo, no
inferido de los archivos `.sql`.

Lo que sí encontraron es otra clase de problema. El sistema **puede aceptar dinero y
producir el resultado equivocado**: un usuario registrado puede dejar el checkout
inoperativo con un loop, un pago duplicado devuelve "OK" sin registrar nada, y el paso
manual de aprobación no tiene previsualización, ni verificación de monto, ni forma de
deshacer. Para un sistema que cobra, esa es la misma vara que un agujero de seguridad.

## Principio que ordena todo el trabajo

El pago por depósito con aprobación manual es **un puente**, no el modelo definitivo:
se migrará a una pasarela apenas alguna apruebe la cuenta. De ahí la regla que decide
qué se construye y qué no:

> **Invertir en lo que sobrevive a la migración a pasarela. Lo que muere con ella,
> hacerlo barato o no hacerlo.**

Sobrevive: el diseño de `orders`, la corrección de `approve_order()` (el webhook la va
a llamar igual), el modelo de derechos, el blindaje de permisos y los tests.
Muere: cualquier herramienta de operación manual sofisticada.

Una consecuencia contraintuitiva de este principio: **I1 (la carrera al extender una
suscripción) sube de prioridad en vez de bajar.** Hoy exige dos pestañas del editor SQL
en paralelo y es difícil de provocar. El día que un webhook de pasarela llame a
`approve_order()`, esa concurrencia deja de ser accidental y pasa a ser rutinaria.

## Decisiones tomadas y su razón

| Decisión | Alternativa descartada | Por qué |
|---|---|---|
| Las funciones sensibles se quedan en el esquema `public` | Moverlas a `private`, invisible para PostgREST | `private` es más fuerte, pero rompe el `rpc()` que necesitará el webhook de la pasarela. La protección equivalente se logra con `default privileges` + aserción automática. |
| Bloquear el pedido duplicado en el **servidor** (trigger), no solo en el front | Bloquear solo en la UI | "Bloquear antes de que pague" solo cuenta si no se puede esquivar con un POST directo a PostgREST. |
| `ensure_profile()` como función `SECURITY DEFINER` | Parchar `ensureProfile` en JavaScript | Un solo cambio elimina tres hallazgos distintos (carrera que duplica organizaciones, huevo-y-gallina de RLS, inserción ilimitada de organizaciones) y permite revocar INSERT por completo. |
| Códigos de pedido aleatorios | Mantener la secuencia | Elimina la fuga de volumen de ventas y deja el squatting sin blanco al que apuntar. Se toca el minteo de todas formas por C1. |
| Verificación de monto en `approve_order()` | Confiar en el ojo del operador | Con tres precios distintos (180 / 249 / 2390), un código mal tipeado casi siempre trae otro monto. Hace que el dedazo **falle cerrado**. |

## Alcance explícitamente excluido (YAGNI)

- **Panel de administración.** Muere con la pasarela. El editor SQL basta para el volumen actual.
- **Abstracción de proveedor de pago.** No se sabe qué pasarela será; abstraer para un proveedor desconocido es premature abstraction.
- **Sistema de saldo a favor / créditos.** Complejidad contable que el bloqueo previo hace innecesaria.
- **Barridos automáticos con `pg_cron`.** El vencimiento se evalúa al leer, no por un job.

---

## Fase 1 — Arquitectura de permisos

**Diagnóstico de fondo:** en este proyecto RLS es lo único que limita las escrituras del
cliente, y RLS **no tiene granularidad de columna**. Ahí nace C1: el trigger corrige
`amount_pen`, `status` y `approved_at`, pero nadie vigila `code`, `notes` ni `created_at`.
La regla general a instalar: *donde un trigger "corrige" una columna, revisar qué otras
columnas puede escribir el cliente.*

1. **Revocar INSERT por columna en `orders`** para `anon` y `authenticated`, dejando
   escribibles únicamente `user_id, kind, report_id, plan, method`. Cierra C1 e I4 a
   nivel de permisos, que es más fuerte que a nivel de política.

2. **El trigger acuña el `code`.** Un `default` de columna se sobreescribe; una asignación
   en un BEFORE trigger no. Formato nuevo, no secuencial:
   `'INM-' || to_char(now(),'YY') || '-' || upper(substr(encode(gen_random_bytes(4),'hex'),1,6))`.
   Con reintento ante colisión (el índice único sigue siendo la garantía final).

3. **Blindar la trampa I3:**
   `alter default privileges in schema public revoke execute on functions from anon, authenticated;`
   Así una función recreada nace sin permisos en vez de nacer abierta — que es exactamente
   lo que pasaría al cambiar la firma de `approve_order()` en la Fase 2.

4. **Convertir I3 en falla ruidosa.** Aserción en el script de verificación: las tres
   funciones no deben ser ejecutables por `anon` ni `authenticated`. La garantía deja de
   depender de que alguien se acuerde.

5. **`ensure_profile()` `SECURITY DEFINER`, idempotente y atómica.** Lee identidad y
   metadata de `auth.uid()` / `auth.jwt()`, crea organización y perfil en una sola
   transacción, y no hace nada si ya existen. El front pasa a llamar `rpc('ensure_profile')`.
   Permite **revocar INSERT en `organizations` y `profiles`** por completo.

**Resultado:** el cliente solo puede escribir intención, y solo en las columnas que le corresponden.

## Fase 2 — Invariantes de dinero

1. **Bloquear el pedido duplicado en el trigger.** Si `kind='report'` y el usuario ya tiene
   una compra pagada de ese reporte, se rechaza el INSERT. Para `kind='subscription'` se
   permite: renovar estando activo es legítimo y extiende el periodo.

2. **Índice único parcial sobre pedidos pendientes**
   (`user_id, kind, coalesce(report_id::text, plan)` donde `status='pending'`). Hace que la
   reutilización de pedido pendiente sea segura ante dos pestañas simultáneas, que hoy
   producen dos códigos para el mismo ítem.

3. **`approve_order()` deja de mentir.** El `on conflict do nothing` sin destino se
   reemplaza por un conflicto dirigido (`on conflict (user_id, report_id) where status='paid'`)
   más `get diagnostics`; si no se insertó ninguna fila, la función **lanza excepción** en
   vez de retornar `OK`. Cierra C2.

   *Nota de alcance:* la decisión de producto fue "bloquear antes de que pague" (punto 1),
   no "las dos cosas". Este punto se incluye igual porque son tres líneas y porque el punto 1
   no cubre todos los casos: un pedido creado legítimamente hoy puede volverse duplicado
   mañana si el usuario adquiere ese mismo reporte por otra vía antes de que lo apruebes.
   Sin esto, ese caso devuelve `OK` sin registrar la compra.

4. **Corregir la carrera de extensión (I1).** El cálculo del nuevo vencimiento se mueve
   *dentro* del `on conflict do update`, leyendo `subscriptions.current_period_end` de la
   fila ya bloqueada, en vez de un `v_base` leído antes sin lock.

5. **Verificación de monto.** Nueva firma `approve_order(p_code text, p_amount_received numeric)`,
   que rechaza si no coincide con `orders.amount_pen`. (Este cambio de firma es el que
   dispara la trampa I3 — de ahí que la Fase 1 vaya primero.)

6. **`preview_order(p_code)`** — devuelve email, ítem y monto sin modificar nada, para
   confirmar antes de otorgar.

7. **`revoke_order(p_code, p_reason)`** — deshace una aprobación equivocada. Para un pedido
   de reporte: `purchases.status = 'refunded'` (valor ya permitido por el CHECK existente).
   Para uno de suscripción: retrocede `current_period_end` restando el periodo que se otorgó
   — `subscriptions.status` no admite `'refunded'`, así que el retroceso es por fecha. En
   ambos casos el pedido queda en `'rejected'` con el motivo en `notes`. Hoy no existe forma
   de deshacer salvo UPDATE a mano como service_role.

8. **Vencimiento de pedidos.** Columna `expires_at` (7 días, puesta por el trigger);
   `approve_order()` rechaza pasado ese plazo. Cierra I6 y le da propósito al estado
   `'expired'`, que hoy no lo usa nada.

9. **`current_period_start` se actualiza al renovar** (hoy queda congelado y describe un
   periodo falso en cualquier factura futura).

## Fase 3 — Exposición y fugas

1. **`has_access()` debe respetar `published_at`.** Hoy la rama de suscripción ni siquiera
   mira el `p_report_id`: cualquier suscriptor activo puede descargar **cualquier** reporte
   que tenga archivo, incluido un borrador subido para revisión. No explota hoy solo porque
   ningún borrador tiene archivo — se vuelve real en cuanto empieces a preparar contenido.

2. **`revoke select (file_path) on public.reports`** de `anon` y `authenticated`. El front
   no lo lee; la Edge Function usa service_role. Hoy la ruta interna de cada PDF viaja en
   una respuesta pública.

3. **`useReports` filtra por `published_at`.** Selecciona la columna pero nunca la usa.

4. **Endurecer la Edge Function (I2).** `try/catch` alrededor de `req.json()` devolviendo
   400 *con* cabeceras CORS (hoy un cuerpo no-JSON produce un 500 sin ellas), y fijar
   `Access-Control-Allow-Origin` al dominio real en vez de `*`. Se mantiene `--no-verify-jwt`:
   es obligatorio en este proyecto y la verificación en código es correcta.

## Fase 4 — Correcciones de front-end

1. **`auth.jsx` deja de crear perfiles.** Pasa a `rpc('ensure_profile')`, y se elimina la
   doble ejecución de `buildUser` por login (el listener de `onAuthStateChange` queda como
   único escritor).

2. **`fetchOrders` deja de tragarse el error.** Hoy una falla de carga se ve idéntica a
   "no tienes pedidos", justo en la página que existe para tranquilizar a alguien que acaba
   de depositar. Debe distinguir ambos estados y mostrarlo.

3. **El modal muestra el método persistido** (`order.method`), no el estado local. Hoy un
   pedido reutilizado puede mostrar instrucciones de Yape sobre una fila que dice `deposit`,
   y como `orders` no tiene policy de UPDATE, es incorregible después.

4. **Botones de copiar** en número de cuenta y CCI. El CCI son 20 dígitos y el lector está
   en un celular: es el paso con más probabilidad de error de todo el flujo. Estaba en el
   spec original y se perdió en la implementación.

5. **Accesibilidad del modal:** devolver el foco al diálogo al cambiar de paso (hoy el foco
   cae al `body` y Tab escapa del modal a la página de atrás), `role="alert"` en el mensaje
   de error, y `fieldset`/`legend` en el grupo de radios.

6. **Formato de moneda.** Un solo helper `formatPEN()`: hoy `2390.00` se renderiza `S/ 2390`
   mientras el copy del sitio dice "S/ 2,390".

## Fase 5 — Tests y documentación

1. **El mock de PostgREST no verifica nada.** Cada método devuelve `this` e ignora sus
   argumentos, así que `createOrder` podría filtrar por el usuario equivocado y los cuatro
   tests seguirían pasando. Debe registrar los filtros aplicados y afirmarlos.

2. **Test del modal, que hoy no existe.** La garantía más fuerte del spec original —"nunca
   entregar datos bancarios por un pedido que no quedó registrado"— está sostenida solo por
   un comentario. Un test con `createOrder` rechazando, afirmando que el paso sigue en
   `'form'` y que no se renderiza ningún dato bancario.

3. **Ampliar `verify-deposit-flow.mjs`.** Sus 8 aserciones pasan, pero solo cubren los
   controles que el implementador ya conocía. Faltan: escritura de otras columnas (`code`
   habría delatado C1 con una línea), INSERT directo con `status='approved'`, lectura cruzada
   entre usuarios (requiere un segundo usuario de prueba), escrituras a `subscriptions`,
   `reports` y `plans`, el upsert de PostgREST como vector de UPDATE, las aserciones de ACL
   de la Fase 1, y todo lo posterior a la aprobación. Además debe limpiar el pedido que deja
   vivo en cada corrida.

4. **`CLAUDE.md` se contradice.** El encabezado dice que los pagos son reales; más abajo
   sigue diciendo que lo único simulado es el pago y que no se quiten los banners hasta
   conectar Culqi. También lista `PLANS` y constantes de precio que ya no existen, y marca
   `/cuenta` y `/login` como "(mock)". Un documento declarado fuente de verdad que se
   contradice es un defecto, no una errata.

---

## Orden de ejecución y por qué

Las fases son secuenciales por dependencia real, no por preferencia:

- **Fase 1 antes que Fase 2** porque el cambio de firma de `approve_order()` (Fase 2, punto 5)
  dispara la trampa I3, y la Fase 1 es la que la desactiva. Hacerlo al revés abre una ventana
  en la que cualquier usuario autenticado puede autoaprobarse.
- **Fase 3 antes de publicar el dominio**, porque `--no-verify-jwt` deja la función accesible
  a cualquiera en internet y el CORS sigue en `*`.
- **Fases 4 y 5 son independientes** entre sí y pueden ir en cualquier orden.

## Criterios de éxito

1. `verify-deposit-flow.mjs` ampliado pasa en verde, incluidas las aserciones nuevas de
   columnas, lectura cruzada y ACL.
2. Un intento de insertar un `code` elegido por el cliente es rechazado por permisos.
3. Aprobar dos veces el mismo pedido falla. Crear un pedido por un reporte que el usuario ya
   compró es rechazado en el INSERT. Y un pedido que se volvió duplicado *después* de creado
   falla al aprobarse, con un mensaje que dice qué hacer con el dinero — no un `OK` silencioso.
4. Aprobar anual y mensual en paralelo para el mismo usuario conserva la suma de ambos periodos.
5. Un suscriptor activo **no** puede descargar un reporte sin publicar.
6. `npm test`, `npm run lint` y `npm run build` en verde.

## Riesgos conocidos

- **Cambiar la firma de `approve_order()` es exactamente la operación peligrosa.** Debe
  hacerse después de la Fase 1 y verificarse con la aserción de ACL en la misma corrida.
- **Revocar INSERT en `organizations`/`profiles` rompe el registro si `ensure_profile()`
  falla.** Hay que verificar el alta de un usuario nuevo end-to-end antes de dar la fase por
  cerrada, no solo el login de uno existente.
- **El cambio de formato de código no es retroactivo.** Los pedidos existentes conservan el
  formato secuencial; ambos deben seguir siendo válidos para `approve_order()`.

## Cuestión abierta que no es técnica

La cuenta bancaria está a nombre de una persona natural y el comprobante lo emite
`Servicios Inmerge SAC` (RUC 20608620690). Un cliente empresa que necesite sustentar el
gasto tendrá el pago y la factura a nombre de entidades distintas. **Consultar con el
contador**; si corresponde, abrir cuenta a nombre de la SAC y actualizar `holder`, `number`
y `cci` juntos — el CCI lleva embebido el número de cuenta.
