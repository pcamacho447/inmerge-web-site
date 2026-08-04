# Pago por depósito bancario — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar el write de pago simulado por pedidos de depósito bancario / Yape-Plin con aprobación humana, de modo que una compra real otorgue acceso real a la descarga.

**Architecture:** Una tabla `orders` de *intención* en la que el cliente inserta su propio pedido (RLS + trigger que recalcula el monto en el servidor), y una función SQL `approve_order()` ejecutable **solo** por el service-role que convierte un pedido pendiente en una fila de `purchases` o `subscriptions`. El front muestra código de pedido + datos bancarios y manda al cliente a WhatsApp con la constancia. Las suscripciones pasan a ser periodos prepagados con vencimiento real, lo que obliga a corregir `has_access()`.

**Tech Stack:** React 18, Vite 5, react-router-dom 6, `@supabase/supabase-js` 2, Supabase Postgres + RLS, vitest 4 + jsdom.

**Spec:** `docs/superpowers/specs/2026-08-04-pago-deposito-bancario-design.md`

## Global Constraints

- **Proyecto Supabase:** `zboxdsiejvmjupdawgax`. Es el único vivo; cualquier ref anterior (`dyaj…`) está borrada.
- **Directorio de trabajo:** todos los comandos se corren desde `web/app/`.
- **Shell:** PowerShell en Windows. Encadena con `;`, **nunca** con `&&`.
- **Estilos:** objetos `style={{}}` inline referenciando CSS vars (`var(--terracotta)`). Sin Tailwind, sin CSS-in-JS. Los `:hover`/`:active` solo vía las clases utilitarias existentes (`btn-hover`, `btn-outline-hover`, `card-hover`, `row-hover`, `link-hover`, `icon-btn-hover`).
- **Nunca** uses el shorthand `font` después de `fontSize`/`fontWeight` en el mismo objeto de estilo: los resetea en silencio.
- **Prettier:** 140 caracteres de ancho. Corre `npm run format` antes de cada commit.
- **Copy:** todo el texto visible en español, tono del sitio (directo, sin signos de admiración).
- **Nunca** escribas `purchases` ni `subscriptions` desde el cliente. La única vía es `approve_order()`.
- **Si redespliegas cualquier Edge Function:** obligatorio `--no-verify-jwt`, o el gateway devuelve `401 INVALID_CREDENTIALS` antes de que corra tu código. Para comprobar que el flag aplicó, lee el **body**: `{"error":"Missing Authorization header"}` = correcto; `{"code":"INVALID_CREDENTIALS"}` = no aplicó.
- **Precios:** la BD es la única fuente. Ningún precio hardcodeado en el front.
- **Vocabulario unificado:** `kind` es `'report' | 'subscription'` en la BD, en `orders.js` y en la prop de `CheckoutModal`. El valor `'plan'` que hoy usa `Planes.jsx` desaparece.
- Las migraciones se aplican con la MCP de Supabase (`apply_migration`) o `npx supabase@latest db push`. El archivo `.sql` **siempre** se commitea, aunque se haya aplicado por MCP.

---

### Task 1: Migración `0003` — tablas `plans` y `orders`

**Files:**
- Create: `web/app/supabase/migrations/0003_plans_and_orders.sql`
- Modify: `web/app/supabase/migrations/0001_init.sql:1-15` (extender el comentario de cabecera)

**Interfaces:**
- Consumes: nada.
- Produces: tabla `public.plans (id text, name text, price_pen numeric, period_months int)`; tabla `public.orders (id uuid, code text, user_id uuid, kind text, report_id uuid, plan text, amount_pen numeric, method text, status text, notes text, approved_at timestamptz, created_at timestamptz)`; policies `plans_select_all`, `orders_select_own`, `orders_insert_own`; trigger `orders_set_amount_before_insert`.

- [ ] **Step 1: Escribir la migración**

Crea `web/app/supabase/migrations/0003_plans_and_orders.sql`:

```sql
-- Pedidos de pago por depósito bancario / Yape-Plin (reemplaza la fase Culqi).
--
-- EXCEPCIÓN DELIBERADA a la regla de 0001_init.sql ("las tablas de dinero solo
-- las escriben Edge Functions con service-role"): `orders` es una tabla de
-- INTENCIÓN, no de dinero. Una fila acá no otorga nada — el acceso lo crea
-- únicamente approve_order() (0004), y solo el service-role puede ejecutarla.
-- Por eso el cliente sí puede INSERTAR su propio pedido. `orders` no tiene
-- policy de UPDATE ni DELETE, así que el cliente no puede aprobarse a sí mismo
-- ni borrar evidencia, y `amount_pen` lo sobreescribe un trigger, así que un
-- precio manipulado desde el navegador es imposible.

-- Precio Y duración del periodo. La duración vive acá porque el servidor la
-- necesita para calcular el vencimiento; el front ya no puede ser la fuente.
create table public.plans (
  id text primary key check (id in ('monthly', 'annual')),
  name text not null,
  price_pen numeric(10, 2) not null,
  period_months int not null check (period_months > 0)
);

insert into public.plans (id, name, price_pen, period_months) values
  ('monthly', 'Premium Mensual', 249.00, 1),
  ('annual', 'Premium Anual', 2390.00, 12);

create sequence public.orders_code_seq;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  -- Código legible que el cliente pone en el concepto del depósito y que tú
  -- usas para aprobar. El año es informativo; la secuencia no se reinicia.
  code text not null unique default 'INM-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.orders_code_seq')::text, 4, '0'),
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('report', 'subscription')),
  report_id uuid references public.reports (id),
  plan text references public.plans (id),
  -- Default 0 para que el cliente pueda omitirlo: el trigger lo sobreescribe.
  amount_pen numeric(10, 2) not null default 0,
  method text not null check (method in ('deposit', 'yape_plin')),
  -- 'expired' no lo usa nada automáticamente: existe para cerrar a mano
  -- pedidos viejos que nunca se pagaron, sin borrarlos.
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'expired')),
  notes text, -- motivo de rechazo; se le muestra al cliente en /cuenta
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  constraint orders_kind_target check (
    (kind = 'report' and report_id is not null and plan is null)
    or (kind = 'subscription' and plan is not null and report_id is null)
  )
);

create index on public.orders (user_id);
create index on public.orders (status);

-- El monto NO viaja desde el cliente: se recalcula desde la BD en cada insert.
-- Un cliente que manipule el JSON y pida pagar S/1 termina con un pedido de
-- S/180 igual. `security invoker` a propósito: lee `reports`/`plans`, que son
-- de lectura pública, así que no necesita privilegios elevados.
create or replace function public.orders_set_amount()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_price numeric(10, 2);
  v_tier text;
begin
  if new.kind = 'report' then
    select price_pen, tier into v_price, v_tier from public.reports where id = new.report_id;
    if v_tier is null then
      raise exception 'El reporte % no existe', new.report_id;
    end if;
    if v_tier = 'free' then
      raise exception 'El reporte % es gratuito — no se cobra', new.report_id;
    end if;
    if v_price is null then
      raise exception 'El reporte % no tiene precio individual', new.report_id;
    end if;
  else
    select price_pen into v_price from public.plans where id = new.plan;
    if v_price is null then
      raise exception 'El plan % no existe', new.plan;
    end if;
  end if;

  new.amount_pen := v_price;
  new.status := 'pending'; -- ningún pedido nace aprobado
  new.approved_at := null;
  return new;
end;
$$;

create trigger orders_set_amount_before_insert
  before insert on public.orders
  for each row execute function public.orders_set_amount();

alter table public.plans enable row level security;
alter table public.orders enable row level security;

-- Como `reports`: el catálogo y los precios se muestran a visitantes sin sesión.
create policy "plans_select_all" on public.plans for select using (true);

create policy "orders_select_own" on public.orders for select using (auth.uid() = user_id);
create policy "orders_insert_own" on public.orders for insert with check (auth.uid() = user_id and status = 'pending');
```

- [ ] **Step 2: Extender el comentario de cabecera de `0001_init.sql`**

En `web/app/supabase/migrations/0001_init.sql`, después de la línea 9 (`-- ever written by Edge Functions … Never grant client-writable access to them.`), agrega:

```sql
-- EXCEPTION (added in 0003): `orders` is client-insertable on purpose. It is an
-- INTENT table — a row there grants nothing. Entitlements are still created
-- only by approve_order(), which is service-role-only. See 0003's header.
```

- [ ] **Step 3: Aplicar la migración**

Con la MCP de Supabase: `apply_migration` con name `0003_plans_and_orders` y el contenido del archivo.

- [ ] **Step 4: Verificar el esquema y el trigger**

Corre estas asercioness con `execute_sql`. Las tres deben devolver `t`:

```sql
-- 1) Los planes quedaron sembrados con la duración correcta.
select count(*) = 2 as ok from public.plans where (id, period_months) in (('monthly', 1), ('annual', 12));

-- 2) El check de coherencia kind ↔ objetivo rechaza un pedido incoherente.
select not exists (
  select 1 from pg_constraint where conname = 'orders_kind_target'
) = false as ok;

-- 3) orders tiene RLS activo y exactamente 2 policies (select + insert, sin update/delete).
select (
  select relrowsecurity from pg_class where oid = 'public.orders'::regclass
) and (select count(*) = 2 from pg_policies where tablename = 'orders') as ok;
```

- [ ] **Step 5: Verificar que el trigger ignora el monto del cliente**

Esto necesita un `user_id` real. Si todavía no hay usuario de prueba (Task 3), **salta este paso y vuelve después de Task 3**. Con un usuario existente:

```sql
-- Reemplaza <USER_ID> y usa el slug premium real.
insert into public.orders (user_id, kind, report_id, method, amount_pen)
select '<USER_ID>', 'report', id, 'deposit', 1.00
from public.reports where slug = 'seguimiento-trimestral-educacion'
returning code, amount_pen; -- amount_pen debe ser 180.00, NO 1.00
```

Después bórralo: `delete from public.orders where amount_pen = 180.00 and status = 'pending';`

- [ ] **Step 6: Commit**

```bash
git add web/app/supabase/migrations/0003_plans_and_orders.sql web/app/supabase/migrations/0001_init.sql
git commit -m "feat(db): add plans and orders tables for bank-deposit payments"
```

---

### Task 2: Migración `0004` — aprobación y corrección de `has_access()`

**Files:**
- Create: `web/app/supabase/migrations/0004_approve_orders.sql`

**Interfaces:**
- Consumes: `public.orders`, `public.plans` (Task 1).
- Produces: `approve_order(p_code text) returns text`; `reject_order(p_code text, p_reason text) returns text`; `has_access(uuid, uuid)` con vencimiento; índices `purchases_user_report_paid` y `subscriptions_user_unique`.

- [ ] **Step 1: Escribir la migración**

Crea `web/app/supabase/migrations/0004_approve_orders.sql`:

```sql
-- Aprobación manual de pedidos + el arreglo de vencimiento en has_access().

-- Una sola compra pagada por (usuario, reporte): hace approve_order idempotente
-- y evita cobrar dos veces el mismo reporte.
create unique index purchases_user_report_paid on public.purchases (user_id, report_id) where status = 'paid';

-- Una suscripción por usuario: renovar extiende el periodo existente en vez de
-- apilar filas, que es la semántica que has_access() ya asumía.
create unique index subscriptions_user_unique on public.subscriptions (user_id);

-- La rama de suscripción tiene que respetar el periodo pagado. Sin la
-- comprobación de current_period_end nada vence nunca, y con renovación manual
-- eso significa que un solo pago otorga acceso permanente.
create or replace function public.has_access(p_user_id uuid, p_report_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select
    exists (select 1 from public.reports r where r.id = p_report_id and r.tier = 'free')
    or exists (
      select 1 from public.purchases pu
      where pu.user_id = p_user_id and pu.report_id = p_report_id and pu.status = 'paid'
    )
    or exists (
      select 1 from public.subscriptions s
      where s.user_id = p_user_id
        and s.status = 'active'
        and s.current_period_end > now()
    );
$$;

-- La Edge Function get-report-download-url la invoca con un cliente
-- service-role (ver functions/get-report-download-url/index.ts:35), así que
-- nadie más necesita ejecutarla. Revocar cierra la advertencia del linter
-- "Public Can Execute SECURITY DEFINER Function" y evita que cualquiera pueda
-- consultar los derechos de cualquier usuario vía /rest/v1/rpc/has_access.
revoke execute on function public.has_access(uuid, uuid) from public, anon, authenticated;
grant execute on function public.has_access(uuid, uuid) to service_role;

-- Convierte un pedido pendiente en acceso real. Uso:
--   select approve_order('INM-2026-0042');
create or replace function public.approve_order(p_code text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  o public.orders;
  v_period_months int;
  v_base timestamptz;
  v_new_end timestamptz;
  v_email text;
  v_label text;
begin
  -- for update: dos ejecuciones simultáneas no duplican el acceso.
  select * into o from public.orders where code = upper(trim(p_code)) for update;
  if not found then
    raise exception 'El pedido % no existe', p_code;
  end if;
  if o.status <> 'pending' then
    raise exception 'El pedido % ya está en estado "%"', o.code, o.status;
  end if;

  select email into v_email from auth.users where id = o.user_id;

  if o.kind = 'report' then
    insert into public.purchases (user_id, report_id, amount_pen, status)
    values (o.user_id, o.report_id, o.amount_pen, 'paid')
    on conflict do nothing;
    select title into v_label from public.reports where id = o.report_id;
    v_label := format('reporte "%s"', v_label);
  else
    select period_months into v_period_months from public.plans where id = o.plan;
    select current_period_end into v_base from public.subscriptions where user_id = o.user_id;
    -- Extiende desde el vencimiento, no desde hoy: renovar antes de que venza
    -- no regala días ni los quita.
    v_base := greatest(coalesce(v_base, now()), now());
    v_new_end := v_base + (v_period_months * interval '1 month');

    insert into public.subscriptions (user_id, plan, status, current_period_start, current_period_end)
    values (o.user_id, o.plan, 'active', now(), v_new_end)
    on conflict (user_id) do update
      set plan = excluded.plan,
          status = 'active',
          current_period_end = v_new_end,
          updated_at = now();
    v_label := format('plan %s hasta %s', o.plan, to_char(v_new_end, 'DD/MM/YYYY'));
  end if;

  update public.orders set status = 'approved', approved_at = now() where id = o.id;

  return format('OK — %s: %s (S/ %s). Acceso: %s', o.code, v_email, o.amount_pen, v_label);
end;
$$;

-- Uso: select reject_order('INM-2026-0042', 'no llegó el depósito');
-- El motivo se le muestra al cliente en /cuenta: sin eso queda esperando
-- indefinidamente sin saber que lo rechazaste.
create or replace function public.reject_order(p_code text, p_reason text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  o public.orders;
begin
  select * into o from public.orders where code = upper(trim(p_code)) for update;
  if not found then
    raise exception 'El pedido % no existe', p_code;
  end if;
  if o.status <> 'pending' then
    raise exception 'El pedido % ya está en estado "%"', o.code, o.status;
  end if;

  update public.orders set status = 'rejected', notes = p_reason where id = o.id;
  return format('Rechazado — %s: %s', o.code, p_reason);
end;
$$;

-- ESTO es lo que hace que el modelo se sostenga: si un usuario autenticado
-- pudiera ejecutar approve_order, se aprobaría sus propios pedidos.
revoke execute on function public.approve_order(text) from public, anon, authenticated;
revoke execute on function public.reject_order(text, text) from public, anon, authenticated;
grant execute on function public.approve_order(text) to service_role;
grant execute on function public.reject_order(text, text) to service_role;
```

- [ ] **Step 2: Aplicar la migración**

`apply_migration` con name `0004_approve_orders`.

- [ ] **Step 3: Verificar los permisos de las funciones**

Con `execute_sql`. Debe devolver una fila por función, todas con `anon_puede = false`, `authenticated_puede = false`, `service_role_puede = true`:

```sql
select
  p.proname,
  has_function_privilege('anon', p.oid, 'execute') as anon_puede,
  has_function_privilege('authenticated', p.oid, 'execute') as authenticated_puede,
  has_function_privilege('service_role', p.oid, 'execute') as service_role_puede
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.proname in ('has_access', 'approve_order', 'reject_order')
order by p.proname;
```

- [ ] **Step 4: Verificar que el linter de seguridad quedó limpio**

Corre `get_advisors` con `type: "security"`. Las 3 advertencias sobre `has_access` (`function_search_path_mutable`, `anon_security_definer_function_executable`, `authenticated_security_definer_function_executable`) deben haber desaparecido. Si aparecen nuevas sobre `approve_order`/`reject_order`, revisa que los `revoke` se aplicaron.

- [ ] **Step 5: Commit**

```bash
git add web/app/supabase/migrations/0004_approve_orders.sql
git commit -m "feat(db): add approve_order/reject_order and expire subscriptions in has_access"
```

---

### Task 3: Recrear los datos de prueba

Sin esto no se puede verificar nada end-to-end: el proyecto se reconstruyó el 2026-08-04 y quedó con `auth.users`, `storage.objects`, `purchases`, `subscriptions` y `profiles` en 0 filas, y `file_path` nulo en los 7 reportes.

**Files:**
- Ninguno (operación sobre el proyecto Supabase).

**Interfaces:**
- Produces: un usuario de prueba con email confirmado (guarda su email, contraseña y `id`); un PDF en el bucket `report-files`; `file_path` poblado en `seguimiento-trimestral-educacion`.

- [ ] **Step 1: Crear el usuario de prueba con email confirmado**

En el Dashboard de Supabase → **Authentication → Users → Add user → Create new user**. Marca **Auto Confirm User**. Esto importa: la confirmación por email está **activada** en este proyecto, así que un usuario creado con `signUp()` desde un script no obtiene sesión y no sirve para probar.

No uses una dirección `@inmerge.pe`: Supabase las rechaza porque el dominio no resuelve (sin registros MX/A/NS).

Guarda el email y la contraseña — los necesitas en Task 10.

- [ ] **Step 2: Anotar el `id` del usuario**

```sql
select id, email, email_confirmed_at from auth.users;
```

`email_confirmed_at` no puede ser nulo. Si lo es, el login fallará.

- [ ] **Step 3: Subir un PDF al bucket privado**

Dashboard → **Storage → report-files → Upload file**. Cualquier PDF sirve para probar. Anota el nombre exacto del archivo.

- [ ] **Step 4: Apuntar un reporte premium a ese archivo**

```sql
update public.reports
set file_path = '<NOMBRE_DEL_ARCHIVO>.pdf'
where slug = 'seguimiento-trimestral-educacion'
returning slug, file_path;
```

- [ ] **Step 5: Verificar el estado**

Debe devolver `usuarios = 1`, `archivos = 1`, `reportes_con_archivo = 1`:

```sql
select
  (select count(*) from auth.users) as usuarios,
  (select count(*) from storage.objects where bucket_id = 'report-files') as archivos,
  (select count(*) from public.reports where file_path is not null) as reportes_con_archivo;
```

- [ ] **Step 6: Completar el Step 5 de Task 1**

Ahora que existe un `user_id`, vuelve y corre la verificación del trigger de monto que quedó pendiente.

---

### Task 4: Capa de datos del front — bandera, datos bancarios y `orders.js`

**Files:**
- Create: `web/app/src/lib/demoMode.js`
- Create: `web/app/src/data/bankDetails.js`
- Create: `web/app/src/lib/orders.js`
- Test: `web/app/src/lib/orders.test.js`
- Modify: `web/app/.env.example`

**Interfaces:**
- Consumes: `supabase` de `./supabaseClient.js`.
- Produces:
  - `DEMO_MODE: boolean` (de `demoMode.js`)
  - `BANK_ACCOUNT`, `YAPE_PLIN`, `VERIFICATION_SLA` (de `bankDetails.js`)
  - `ORDER_METHODS = { DEPOSIT: 'deposit', YAPE_PLIN: 'yape_plin' }`
  - `createOrder({ kind, itemId, method }) → Promise<order>` donde `kind` es `'report' | 'subscription'`
  - `fetchOrders(userId) → Promise<order[]>` (solo `pending` y `rejected`)

- [ ] **Step 1: Escribir el test que falla**

Crea `web/app/src/lib/orders.test.js`:

```js
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Estado compartido con el mock. vi.hoisted corre antes que vi.mock, que a su
// vez se iza por encima de los imports.
const mockState = vi.hoisted(() => ({
  pendingRows: [],
  insertedRows: [],
  insertResult: { data: { id: 'o-nuevo', code: 'INM-2026-0007' }, error: null },
}));

// Stand-in mínimo del builder de PostgREST: cada filtro devuelve `this`, la
// cadena awaited resuelve a los pendientes, y `.single()` al insert.
vi.mock('./supabaseClient.js', () => ({
  supabase: {
    auth: { getUser: async () => ({ data: { user: { id: 'u-1' } }, error: null }) },
    from: () => ({
      select() {
        return this;
      },
      eq() {
        return this;
      },
      in() {
        return this;
      },
      order() {
        return this;
      },
      limit() {
        return this;
      },
      insert(row) {
        mockState.insertedRows.push(row);
        return this;
      },
      single() {
        return Promise.resolve(mockState.insertResult);
      },
      then(resolve, reject) {
        return Promise.resolve({ data: mockState.pendingRows, error: null }).then(resolve, reject);
      },
    }),
  },
}));

const { createOrder } = await import('./orders.js');

describe('createOrder', () => {
  beforeEach(() => {
    mockState.pendingRows = [];
    mockState.insertedRows = [];
  });

  it('crea un pedido nuevo cuando no hay ninguno pendiente', async () => {
    const order = await createOrder({ kind: 'report', itemId: 'r-1', method: 'deposit' });

    expect(order.code).toBe('INM-2026-0007');
    expect(mockState.insertedRows).toEqual([{ user_id: 'u-1', kind: 'report', report_id: 'r-1', method: 'deposit' }]);
  });

  it('reutiliza el pedido pendiente en vez de generar otro código', async () => {
    mockState.pendingRows = [{ id: 'o-viejo', code: 'INM-2026-0003', status: 'pending' }];

    const order = await createOrder({ kind: 'report', itemId: 'r-1', method: 'deposit' });

    expect(order.code).toBe('INM-2026-0003');
    expect(mockState.insertedRows).toEqual([]); // no insertó nada
  });

  it('usa la columna plan para suscripciones, no report_id', async () => {
    await createOrder({ kind: 'subscription', itemId: 'monthly', method: 'yape_plin' });

    expect(mockState.insertedRows).toEqual([{ user_id: 'u-1', kind: 'subscription', plan: 'monthly', method: 'yape_plin' }]);
  });

  it('nunca manda amount_pen: el precio lo pone el servidor', async () => {
    await createOrder({ kind: 'report', itemId: 'r-1', method: 'deposit' });

    expect(mockState.insertedRows[0]).not.toHaveProperty('amount_pen');
  });
});
```

- [ ] **Step 2: Correr el test para verificar que falla**

Run: `npm test`
Expected: FAIL — `Failed to resolve import "./orders.js"`.

- [ ] **Step 3: Crear `demoMode.js`**

```js
// Único punto de lectura de la bandera de simulación. Una variable ausente
// significa PRODUCCIÓN (pedidos reales), nunca demo: olvidarse de configurarla
// no puede terminar regalando acceso premium.
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';
```

- [ ] **Step 4: Crear `bankDetails.js`**

```js
// Instrucciones de depósito que ve el cliente. Estos valores son PÚBLICOS por
// diseño: viajan en el bundle del navegador porque el cliente tiene que
// leerlos. Nunca pongas acá la service-role key ni nada secreto.
//
// FALTA CONFIGURAR: completa estos datos antes del primer pedido real. Los
// valores de abajo son deliberadamente evidentes para que un despliegue sin
// configurar sea imposible de confundir con uno funcionando.
export const BANK_ACCOUNT = {
  bank: 'BCP',
  accountType: 'Cuenta corriente soles',
  number: 'FALTA CONFIGURAR',
  cci: 'FALTA CONFIGURAR',
  holder: 'FALTA CONFIGURAR',
  taxId: 'FALTA CONFIGURAR',
};

export const YAPE_PLIN = {
  phone: 'FALTA CONFIGURAR',
  holder: 'FALTA CONFIGURAR',
};

export const VERIFICATION_SLA = 'hasta 24 horas hábiles';
```

- [ ] **Step 5: Crear `orders.js`**

```js
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
```

- [ ] **Step 6: Correr el test para verificar que pasa**

Run: `npm test`
Expected: PASS — 4 tests nuevos + los 3 de `useReveal`.

- [ ] **Step 7: Documentar la bandera en `.env.example`**

Agrega al final de `web/app/.env.example`:

```
# --- Modo demo (opcional) ---
# 'true' reactiva el checkout simulado que escribe en localStorage, para
# mostrar el flujo sin que nadie deposite. Cualquier otro valor, o la variable
# ausente, significa producción: pedidos reales por depósito.
VITE_DEMO_MODE=false
```

- [ ] **Step 8: Commit**

```bash
npm run format
git add web/app/src/lib/demoMode.js web/app/src/data/bankDetails.js web/app/src/lib/orders.js web/app/src/lib/orders.test.js web/app/.env.example
git commit -m "feat: add order creation layer for bank-deposit payments"
```

---

### Task 5: Precios desde la BD — `PLAN_COPY` y `usePlans`

**Files:**
- Create: `web/app/src/hooks/usePlans.js`
- Modify: `web/app/src/data/content.js:24-47` (reemplazar `PLAN_PRICE_PEN`, `REPORT_PRICE_PEN` y `PLANS`)

**Interfaces:**
- Consumes: tabla `public.plans` (Task 1).
- Produces:
  - `PLAN_COPY: { monthly: {description, features}, annual: {badge, description, features} }` en `content.js`
  - `periodLabel(periodMonths) → 'mes' | 'año'` en `content.js`
  - `usePlans() → { plans, loading, error }` donde cada plan es `{ id, name, price_pen, period_months, period, description, features, badge? }`

- [ ] **Step 1: Reemplazar los precios en `content.js`**

Borra las líneas 24-47 (el bloque `// Pricing …` hasta el cierre de `PLANS`) y pon:

```js
// Copy de los planes. El precio y la duración viven en la tabla `plans` de
// Supabase: un precio acá que discrepe de la BD significaría que el cliente ve
// un número y el trigger de pedidos le cobra otro. usePlans() los une.
export const PLAN_COPY = {
  monthly: {
    description: 'Acceso a todos los reportes premium mientras estés suscrito.',
    features: ['Todos los reportes premium publicados cada mes', 'Acceso inmediato a nuevas series', 'Renuevas solo si quieres'],
  },
  annual: {
    badge: 'Ahorra ~20%',
    description: 'La misma suscripción, un pago al año.',
    features: ['Todo lo del plan mensual', 'Precio congelado por 12 meses', 'Un solo pago, sin recordatorios'],
  },
};

export function periodLabel(periodMonths) {
  return periodMonths === 12 ? 'año' : 'mes';
}

// Mensaje de WhatsApp para mandar la constancia. Un link wa.me no puede
// adjuntar la foto: abre el chat con el texto listo y el cliente adjunta.
export function waVoucherMessage(order) {
  return `Hola, deposité S/ ${order.amount_pen} por el pedido ${order.code}. Adjunto mi constancia.`;
}
```

Nota sobre el copy: "Cancela cuando quieras" cambió a "Renuevas solo si quieres" porque con periodos prepagados no hay nada que cancelar — el acceso simplemente vence.

- [ ] **Step 2: Escribir el hook**

Crea `web/app/src/hooks/usePlans.js`:

```js
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';
import { PLAN_COPY, periodLabel } from '../data/content.js';

// Espejo de useReports.js para la tabla `plans`. La BD manda el precio y la
// duración; content.js solo aporta copy. `plans` tiene SELECT público, así que
// esto funciona sin sesión.
export default function usePlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    supabase
      .from('plans')
      .select('id, name, price_pen, period_months')
      .order('period_months')
      .then(({ data, error: fetchError }) => {
        if (!active) return;
        if (fetchError) setError(fetchError.message);
        else
          setPlans(
            (data || []).map((p) => ({
              ...p,
              ...PLAN_COPY[p.id],
              period: periodLabel(p.period_months),
            })),
          );
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return { plans, loading, error };
}
```

- [ ] **Step 3: Verificar que nada quedó importando lo borrado**

Run: `npm run lint`
Expected: los errores señalan `PLANS`/`REPORT_PRICE_PEN` en `Planes.jsx` y `Cuenta.jsx`. Es lo esperado: se arreglan en Tasks 8 y 9. **No commitees todavía** — este task queda abierto hasta esos dos.

- [ ] **Step 4: Verificar el hook contra la BD real**

Con `execute_sql`, confirma que el hook va a recibir lo que espera:

```sql
select id, name, price_pen, period_months from public.plans order by period_months;
```

Debe devolver `monthly, Premium Mensual, 249.00, 1` y `annual, Premium Anual, 2390.00, 12`.

---

### Task 6: `auth.jsx` — derechos reales, bandera y sesión zombi

**Files:**
- Modify: `web/app/src/lib/auth.jsx` (cabecera 4-11; `ensureProfile` 36-61; `fetchRealEntitlements` 68-75; `buildUser` 95-116; `subscribe`/`cancelSubscription`/`purchaseReport` 172-197; `hasAccess` 209-216)
- Test: `web/app/src/lib/auth.test.js`
- Modify: `web/app/vite.config.js` (env para los tests)

**Interfaces:**
- Consumes: `DEMO_MODE` (Task 4), `fetchOrders` (Task 4).
- Produces:
  - `user.subscription = { plan, status, currentPeriodEnd }` (o `null`)
  - `user.orders = order[]` — pendientes y rechazados
  - `isSubscriptionActive(subscription) → boolean` (export nuevo)
  - `hasAccess(user, report) → boolean` con vencimiento
  - `createOrder` expuesto en el contexto de `useAuth()`
  - `refreshUser() → Promise<void>` para releer tras crear un pedido

- [ ] **Step 1: Permitir que los tests importen `supabaseClient.js`**

`supabaseClient.js` lanza si faltan las env vars, así que sin esto el test no puede ni importar `auth.jsx`. En `web/app/vite.config.js`, dentro de `test`, agrega:

```js
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{js,jsx}'],
    // supabaseClient.js lanza al importarse si faltan. El cliente se construye
    // pero estos tests no hacen red.
    env: {
      VITE_SUPABASE_URL: 'http://localhost:54321',
      VITE_SUPABASE_ANON_KEY: 'anon-de-prueba',
    },
  },
```

- [ ] **Step 2: Escribir el test que falla**

Crea `web/app/src/lib/auth.test.js`:

```js
import { describe, expect, it } from 'vitest';
import { hasAccess, isSubscriptionActive } from './auth.jsx';

const PREMIUM = { id: 'r-premium', tier: 'premium' };
const GRATIS = { id: 'r-free', tier: 'free' };

const enUnMes = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
const haceUnMes = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();

describe('isSubscriptionActive', () => {
  it('acepta una suscripción activa cuyo periodo no venció', () => {
    expect(isSubscriptionActive({ status: 'active', currentPeriodEnd: enUnMes })).toBe(true);
  });

  it('rechaza una suscripción activa cuyo periodo ya venció', () => {
    expect(isSubscriptionActive({ status: 'active', currentPeriodEnd: haceUnMes })).toBe(false);
  });

  it('rechaza una suscripción cancelada aunque el periodo siga vigente', () => {
    expect(isSubscriptionActive({ status: 'canceled', currentPeriodEnd: enUnMes })).toBe(false);
  });

  it('rechaza la ausencia de suscripción', () => {
    expect(isSubscriptionActive(null)).toBe(false);
  });
});

describe('hasAccess', () => {
  it('deja pasar los reportes gratuitos sin sesión', () => {
    expect(hasAccess(null, GRATIS)).toBe(true);
  });

  it('bloquea premium sin sesión', () => {
    expect(hasAccess(null, PREMIUM)).toBe(false);
  });

  it('deja pasar premium con compra directa', () => {
    expect(hasAccess({ purchases: ['r-premium'], subscription: null }, PREMIUM)).toBe(true);
  });

  // Espeja la rama de suscripción de has_access() en 0004: sin esto, un pago
  // manual otorgaría acceso permanente.
  it('bloquea premium cuando la suscripción venció', () => {
    const user = { purchases: [], subscription: { plan: 'monthly', status: 'active', currentPeriodEnd: haceUnMes } };
    expect(hasAccess(user, PREMIUM)).toBe(false);
  });

  it('deja pasar premium con suscripción vigente', () => {
    const user = { purchases: [], subscription: { plan: 'monthly', status: 'active', currentPeriodEnd: enUnMes } };
    expect(hasAccess(user, PREMIUM)).toBe(true);
  });
});
```

- [ ] **Step 3: Correr el test para verificar que falla**

Run: `npm test`
Expected: FAIL — `isSubscriptionActive is not a function` y la suscripción vencida devolviendo `true`.

- [ ] **Step 4: Reescribir la cabecera del archivo**

Reemplaza el comentario de las líneas 4-11 por:

```jsx
// Identidad, derechos y pedidos REALES. El pago es por depósito bancario con
// verificación humana: el cliente crea un pedido (tabla `orders`, ver
// lib/orders.js) y el dueño lo aprueba con approve_order() desde el SQL Editor,
// que es lo único que escribe `subscriptions`/`purchases`. Nunca escribas esas
// tablas desde acá.
//
// Con DEMO_MODE=true revive el checkout simulado que escribe en localStorage,
// para mostrar el flujo sin que nadie deposite. Con la bandera apagada —el
// default— el mock está COMPLETAMENTE fuera: sin unión mock∪real, que es lo que
// antes hacía imposible saber qué acceso era de verdad.
```

- [ ] **Step 5: Agregar el import de la bandera y de los pedidos**

Después de la línea 2 (`import { supabase } …`):

```jsx
import { DEMO_MODE } from './demoMode.js';
import { fetchOrders } from './orders.js';
```

- [ ] **Step 6: Manejar la sesión zombi en `ensureProfile`**

`ensureProfile` pasa a devolver un booleano ("la sesión sirve"). Reemplaza el cuerpo entre las líneas 36-61 por:

```jsx
// Crea profile/organization desde la metadata de registro la primera vez que
// hay sesión. Devuelve false si la sesión resultó ser basura (ver el 42501).
async function ensureProfile(sessionUser) {
  const { data: existing } = await supabase.from('profiles').select('id').eq('id', sessionUser.id).maybeSingle();
  if (existing) return true;

  const meta = sessionUser.user_metadata || {};
  if (!meta.full_name) return true; // nada que crear — sin metadata de registro

  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .insert({
      billing_type: meta.billing_type || 'persona_natural',
      legal_name: meta.full_name,
      tax_id: meta.tax_id || null,
      billing_email: sessionUser.email,
    })
    .select()
    .single();

  if (orgError) {
    // 42501 = RLS rechazó el insert. Para una sesión supuestamente
    // autenticada eso significa que Postgres nos vio como `anon`: el usuario
    // de la sesión guardada ya no existe (usuario borrado, o proyecto
    // reconstruido). Eso es basura, no un fallo transitorio — reintentarlo en
    // cada getSession y cada cambio de visibilidad solo inunda la consola.
    if (orgError.code === '42501') {
      await supabase.auth.signOut();
      return false;
    }
    console.error('Failed to create organization on first login:', orgError);
    return true;
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .insert({ id: sessionUser.id, organization_id: org.id, full_name: meta.full_name });
  if (profileError) console.error('Failed to create profile on first login:', profileError);
  return true;
}
```

- [ ] **Step 7: Leer el vencimiento en `fetchRealEntitlements`**

Reemplaza las líneas 68-75:

```jsx
// Lecturas reales vía RLS (*_select_own en 0001_init.sql). Los writes son
// exclusivos de approve_order(). current_period_end es obligatorio acá: es lo
// que distingue una suscripción vigente de una vencida, y has_access() lo
// exige del lado del servidor.
async function fetchRealEntitlements(userId) {
  const [{ data: subs }, { data: purchases }] = await Promise.all([
    supabase.from('subscriptions').select('plan, status, current_period_end').eq('user_id', userId).limit(1),
    supabase.from('purchases').select('report_id').eq('user_id', userId).eq('status', 'paid'),
  ]);
  const sub = subs?.[0];
  return {
    subscription: sub ? { plan: sub.plan, status: sub.status, currentPeriodEnd: sub.current_period_end } : null,
    purchases: (purchases || []).map((p) => p.report_id),
  };
}
```

Nota: se quitó el `.eq('status', 'active')` a propósito — `/cuenta` necesita poder mostrar "vencida el X", y con el filtro la fila desaparecía y el usuario no veía nada que renovar.

- [ ] **Step 8: Apagar el mock en `buildUser`**

Reemplaza las líneas 95-116:

```jsx
async function buildUser(sessionUser) {
  const sessionValid = await ensureProfile(sessionUser);
  if (!sessionValid) return null; // sesión zombi: ya cerramos sesión

  const profileFields = await fetchProfileFields(sessionUser.id);
  const real = await fetchRealEntitlements(sessionUser.id);
  const orders = await fetchOrders(sessionUser.id).catch(() => []);

  // Con la bandera apagada el mock no participa: una sola fuente de verdad.
  const mockState = DEMO_MODE ? loadMockState(sessionUser.id) : { subscription: null, purchases: [] };
  const subscription = real.subscription ?? mockState.subscription;
  const purchases = Array.from(new Set([...(mockState.purchases || []), ...real.purchases]));

  return {
    id: sessionUser.id,
    email: sessionUser.email,
    ...profileFields,
    subscription,
    purchases,
    orders,
  };
}
```

- [ ] **Step 9: Blindar las funciones mock y exponer `createOrder`/`refreshUser`**

Reemplaza las líneas 172-197 (`subscribe`, `cancelSubscription`, `purchaseReport`):

```jsx
  // Estas tres son SOLO del modo demo. Si alguien las cablea en producción,
  // revienta en desarrollo en vez de conceder acceso falso en silencio.
  function assertDemo(name) {
    if (!DEMO_MODE) {
      throw new Error(`${name}() es solo del modo demo. En producción el acceso lo crea approve_order() tras verificar el depósito.`);
    }
  }

  const subscribe = useCallback((plan) => {
    assertDemo('subscribe');
    setUser((u) => {
      if (!u) return u;
      const subscription = { plan, status: 'active', currentPeriodEnd: null };
      saveMockState(u.id, { subscription, purchases: u.purchases });
      return { ...u, subscription };
    });
  }, []);

  const cancelSubscription = useCallback(() => {
    assertDemo('cancelSubscription');
    setUser((u) => {
      if (!u) return u;
      const subscription = { ...u.subscription, status: 'canceled' };
      saveMockState(u.id, { subscription, purchases: u.purchases });
      return { ...u, subscription };
    });
  }, []);

  const purchaseReport = useCallback((reportId) => {
    assertDemo('purchaseReport');
    setUser((u) => {
      if (!u || u.purchases.includes(reportId)) return u;
      const purchases = [...u.purchases, reportId];
      saveMockState(u.id, { subscription: u.subscription, purchases });
      return { ...u, purchases };
    });
  }, []);

  // Tras crear un pedido, /cuenta tiene que poder mostrarlo sin recargar.
  const refreshUser = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    setUser(session?.user ? await buildUser(session.user) : null);
  }, []);
```

Y en la línea del `value` (199), agrega `refreshUser`:

```jsx
  const value = { user, loading, signup, login, logout, subscribe, cancelSubscription, purchaseReport, refreshUser };
```

- [ ] **Step 10: Corregir `hasAccess` y exportar `isSubscriptionActive`**

Reemplaza las líneas 209-216:

```jsx
// Espeja has_access() en supabase/migrations/0004_approve_orders.sql —
// mantenlos sincronizados. Este es el gate de UI; el gate real es la Edge
// Function, que reconsulta has_access() del lado del servidor.
export function isSubscriptionActive(subscription) {
  if (!subscription || subscription.status !== 'active') return false;
  // Sin periodo solo puede ser una suscripción del modo demo, que nunca toca la
  // BD y por lo tanto no puede desbloquear una descarga real.
  if (!subscription.currentPeriodEnd) return DEMO_MODE;
  return new Date(subscription.currentPeriodEnd).getTime() > Date.now();
}

export function hasAccess(user, report) {
  if (report.tier === 'free') return true;
  if (!user) return false;
  if (user.purchases?.includes(report.id)) return true;
  return isSubscriptionActive(user.subscription);
}
```

- [ ] **Step 11: Correr los tests**

Run: `npm test`
Expected: PASS — 10 tests nuevos de `auth`, más los de `orders` y `useReveal`.

- [ ] **Step 12: Commit**

```bash
npm run format
git add web/app/src/lib/auth.jsx web/app/src/lib/auth.test.js web/app/vite.config.js
git commit -m "feat: real entitlements with expiry, demo flag gating, zombie-session recovery"
```

---

### Task 7: `CheckoutModal` — flujo de depósito en dos pasos

**Files:**
- Modify: `web/app/src/components/CheckoutModal.jsx` (reescritura completa)

**Interfaces:**
- Consumes: `createOrder`, `ORDER_METHODS` (Task 4); `BANK_ACCOUNT`, `YAPE_PLIN`, `VERIFICATION_SLA` (Task 4); `DEMO_MODE` (Task 4); `waVoucherMessage`, `waLink` (Task 5); `refreshUser` (Task 6).
- Produces: `<CheckoutModal kind={'report'|'subscription'} item={row} onClose={fn} />` donde `item` trae `price_pen` en ambos casos.

- [ ] **Step 1: Reescribir el componente**

Reemplaza el contenido completo de `web/app/src/components/CheckoutModal.jsx`. Conserva el botón de cerrar y el contenedor del diálogo tal como están hoy (líneas 31-66) y cambia el cuerpo:

```jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useOverlay from '../hooks/useOverlay.js';
import { useAuth } from '../lib/auth.jsx';
import { DEMO_MODE } from '../lib/demoMode.js';
import { createOrder, ORDER_METHODS } from '../lib/orders.js';
import { BANK_ACCOUNT, VERIFICATION_SLA, YAPE_PLIN } from '../data/bankDetails.js';
import { waLink, waVoucherMessage } from '../data/content.js';

// `kind`: 'report' | 'subscription'. `item` es una fila de `reports` o de
// `plans`; ambas traen el precio en `price_pen`.
export default function CheckoutModal({ kind, item, onClose }) {
  const { user, subscribe, purchaseReport, refreshUser } = useAuth();
  const navigate = useNavigate();
  const modalRef = useOverlay(true, onClose);
  const [step, setStep] = useState('form'); // 'form' | 'instructions' | 'demo-success'
  const [method, setMethod] = useState(ORDER_METHODS.DEPOSIT);
  const [order, setOrder] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const price = item.price_pen;
  const periodSuffix = kind === 'subscription' ? ` / ${item.period}` : '';
  const title = kind === 'subscription' ? item.name : item.title;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user) {
      onClose();
      navigate('/registro', { state: { redirectTo: window.location.pathname } });
      return;
    }

    if (DEMO_MODE) {
      if (kind === 'subscription') subscribe(item.id);
      else purchaseReport(item.id);
      setStep('demo-success');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      const created = await createOrder({ kind, itemId: item.id, method });
      setOrder(created);
      await refreshUser();
      setStep('instructions');
    } catch (err) {
      // Se queda en 'form' a propósito: nunca entregues datos bancarios por un
      // pedido que no quedó registrado.
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const labelStyle = { fontSize: 11, letterSpacing: 1.5, color: 'var(--terracotta)', fontWeight: 600, marginBottom: 10 };
  const titleStyle = { fontFamily: "'Spectral',serif", fontWeight: 600, fontSize: 22, marginBottom: 6, lineHeight: 1.3 };
  const buttonStyle = {
    background: 'var(--terracotta)',
    color: 'var(--bg)',
    textAlign: 'center',
    borderRadius: 3,
    padding: 14,
    fontSize: 14,
    fontWeight: 600,
    fontFamily: "'IBM Plex Sans',sans-serif",
    cursor: 'pointer',
    width: '100%',
    border: 'none',
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(36,26,18,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        style={{ background: 'var(--bg)', borderRadius: 4, maxWidth: 440, width: '100%', padding: 40, position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="icon-btn-hover"
          style={{ position: 'absolute', top: 8, right: 8, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
        >
          <span style={{ position: 'relative', width: 14, height: 14 }}>
            <div style={{ width: 16, height: 2, background: 'var(--ink)', transform: 'rotate(45deg)', position: 'absolute', top: 6 }} />
            <div style={{ width: 16, height: 2, background: 'var(--ink)', transform: 'rotate(-45deg)', position: 'absolute', top: 6 }} />
          </span>
        </button>

        <div style={{ background: 'var(--cream2)', borderRadius: 3, padding: '8px 12px', fontSize: 11, letterSpacing: 0.5, color: 'var(--muted)', marginBottom: 20 }}>
          {DEMO_MODE
            ? 'Vista previa de producto — este pago es una simulación, no se cobra nada.'
            : `Activación manual: verificamos tu depósito y habilitamos el acceso en ${VERIFICATION_SLA}.`}
        </div>

        {step === 'demo-success' && (
          <>
            <div style={{ width: 14, height: 14, background: 'var(--green)', transform: 'rotate(45deg)', marginBottom: 20 }} />
            <div style={titleStyle}>Listo (simulado).</div>
            <div style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 24 }}>
              {kind === 'subscription'
                ? `Tu cuenta de vista previa ahora tiene acceso premium (${item.name}).`
                : `"${item.title}" se agregó a tus reportes en esta vista previa.`}
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate('/cuenta');
              }}
              className="btn-hover"
              style={buttonStyle}
            >
              Ver mi cuenta
            </button>
          </>
        )}

        {step === 'instructions' && order && (
          <>
            <div style={labelStyle}>PEDIDO GENERADO</div>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontWeight: 500, fontSize: 26, marginBottom: 6 }}>{order.code}</div>
            <div style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 24 }}>
              Deposita <strong style={{ color: 'var(--ink)' }}>S/ {order.amount_pen}</strong> y pon el código{' '}
              <strong style={{ color: 'var(--ink)' }}>{order.code}</strong> en el concepto. Es lo que nos permite reconocer tu pago.
            </div>

            {method === ORDER_METHODS.DEPOSIT ? (
              <dl style={{ margin: '0 0 24px', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '10px 16px', fontSize: 13 }}>
                <dt style={{ color: 'var(--muted)' }}>Banco</dt>
                <dd style={{ margin: 0, fontWeight: 600 }}>{BANK_ACCOUNT.bank}</dd>
                <dt style={{ color: 'var(--muted)' }}>Tipo</dt>
                <dd style={{ margin: 0 }}>{BANK_ACCOUNT.accountType}</dd>
                <dt style={{ color: 'var(--muted)' }}>Número</dt>
                <dd style={{ margin: 0, fontFamily: "'IBM Plex Mono',monospace" }}>{BANK_ACCOUNT.number}</dd>
                <dt style={{ color: 'var(--muted)' }}>CCI</dt>
                <dd style={{ margin: 0, fontFamily: "'IBM Plex Mono',monospace" }}>{BANK_ACCOUNT.cci}</dd>
                <dt style={{ color: 'var(--muted)' }}>Titular</dt>
                <dd style={{ margin: 0 }}>{BANK_ACCOUNT.holder}</dd>
                <dt style={{ color: 'var(--muted)' }}>RUC</dt>
                <dd style={{ margin: 0, fontFamily: "'IBM Plex Mono',monospace" }}>{BANK_ACCOUNT.taxId}</dd>
              </dl>
            ) : (
              <dl style={{ margin: '0 0 24px', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '10px 16px', fontSize: 13 }}>
                <dt style={{ color: 'var(--muted)' }}>Yape / Plin</dt>
                <dd style={{ margin: 0, fontFamily: "'IBM Plex Mono',monospace", fontWeight: 600 }}>{YAPE_PLIN.phone}</dd>
                <dt style={{ color: 'var(--muted)' }}>A nombre de</dt>
                <dd style={{ margin: 0 }}>{YAPE_PLIN.holder}</dd>
              </dl>
            )}

            <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 16 }}>
              Ya depositaste? Mándanos la constancia por WhatsApp — el mensaje va listo con tu código, solo <strong>adjunta la foto</strong>.
            </div>
            <a href={waLink(waVoucherMessage(order))} target="_blank" rel="noreferrer" className="btn-hover" style={{ ...buttonStyle, display: 'block' }}>
              Enviar constancia por WhatsApp
            </a>
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate('/cuenta');
              }}
              className="btn-outline-hover"
              style={{ ...buttonStyle, background: 'none', border: '1px solid var(--border)', color: 'var(--ink)', marginTop: 12 }}
            >
              Ver el estado en mi cuenta
            </button>
          </>
        )}

        {step === 'form' && (
          <form onSubmit={handleSubmit}>
            <div style={labelStyle}>{kind === 'subscription' ? 'SUSCRIPCIÓN' : 'COMPRA DE REPORTE'}</div>
            <div style={titleStyle}>{title}</div>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 15, color: 'var(--muted)', marginBottom: 24 }}>
              S/ {price}
              <span style={{ fontSize: 12 }}>{periodSuffix}</span>
            </div>

            {!user && (
              <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16, lineHeight: 1.6 }}>
                Necesitas una cuenta para continuar — te llevamos a registrarte.
              </div>
            )}

            {user && !DEMO_MODE && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Cómo vas a pagar</div>
                {[
                  { value: ORDER_METHODS.DEPOSIT, label: 'Depósito o transferencia bancaria' },
                  { value: ORDER_METHODS.YAPE_PLIN, label: 'Yape o Plin' },
                ].map((option) => (
                  <label
                    key={option.value}
                    className="row-hover"
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 3, marginBottom: 8, fontSize: 14, cursor: 'pointer' }}
                  >
                    <input type="radio" name="metodo" value={option.value} checked={method === option.value} onChange={() => setMethod(option.value)} />
                    {option.label}
                  </label>
                ))}
              </div>
            )}

            {error && <div style={{ fontSize: 13, color: 'var(--terracotta)', marginBottom: 16, lineHeight: 1.6 }}>{error}</div>}

            <button type="submit" disabled={submitting} className="btn-hover" style={{ ...buttonStyle, cursor: submitting ? 'wait' : 'pointer', opacity: submitting ? 0.7 : 1 }}>
              {!user ? 'Crear cuenta para continuar' : submitting ? 'Generando pedido…' : DEMO_MODE ? 'Confirmar (simulado)' : 'Generar pedido'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verificar que compila**

Run: `npm run build`
Expected: éxito. Si falla por `PLANS`, es Task 9 que falta — anótalo y sigue.

- [ ] **Step 3: Commit**

```bash
npm run format
git add web/app/src/components/CheckoutModal.jsx
git commit -m "feat: replace simulated card checkout with bank-deposit order flow"
```

---

### Task 8: `Cuenta.jsx` — pedidos, vencimiento y renovación

**Files:**
- Modify: `web/app/src/pages/Cuenta.jsx`

**Interfaces:**
- Consumes: `user.orders`, `user.subscription.currentPeriodEnd`, `isSubscriptionActive` (Task 6); `usePlans` (Task 5); `DEMO_MODE` (Task 4); `waVoucherMessage` (Task 5).
- Produces: nada que consuman otros tasks.

- [ ] **Step 1: Cambiar los imports y el banner**

Línea 8: `import { PLANS } from '../data/content.js';` → `import { waLink, waVoucherMessage } from '../data/content.js';`

Agrega:

```jsx
import usePlans from '../hooks/usePlans.js';
import CheckoutModal from '../components/CheckoutModal.jsx';
import { DEMO_MODE } from '../lib/demoMode.js';
import { isSubscriptionActive } from '../lib/auth.jsx';
```

Línea 12 → `const { user, logout, cancelSubscription } = useAuth();` se queda igual.

Línea 13, agrega debajo: `const { plans } = usePlans();`

Reemplaza el texto del banner (línea 46):

```jsx
          {DEMO_MODE
            ? 'Modo demo — tu suscripción y compras acá son simuladas, no se cobró nada.'
            : 'Los pedidos se activan a mano tras verificar el depósito.'}
```

- [ ] **Step 2: Reemplazar el cálculo del plan y agregar el estado del modal**

Línea 34: `const plan = PLANS.find((p) => p.id === user.subscription?.plan);` →

```jsx
  const plan = plans.find((p) => p.id === user.subscription?.plan);
  const subActiva = isSubscriptionActive(user.subscription);
  const vence = user.subscription?.currentPeriodEnd ? new Date(user.subscription.currentPeriodEnd) : null;
  const venceTexto = vence
    ? vence.toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;
  const [renovando, setRenovando] = useState(null);
```

- [ ] **Step 3: Reescribir el bloque de suscripción**

Reemplaza el `if` de las líneas 63-91 (`user.subscription?.status === 'active' ? … : …`) por:

```jsx
          {subActiva ? (
            <div style={{ border: '1px solid var(--border)', borderRadius: 4, padding: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <div style={{ fontFamily: "'Spectral',serif", fontWeight: 600, fontSize: 18, marginBottom: 4 }}>{plan?.name ?? user.subscription.plan}</div>
                <div style={{ fontSize: 13, color: 'var(--green)', fontWeight: 600 }}>Activa</div>
                {venceTexto && <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>Vence el {venceTexto}</div>}
              </div>
              {/* Con periodos prepagados no hay nada que cancelar: el acceso
                  vence solo. Cancelar solo existe en el modo demo. */}
              {DEMO_MODE ? (
                <button
                  type="button"
                  onClick={cancelSubscription}
                  className="btn-outline-hover"
                  style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: 3, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'IBM Plex Sans',sans-serif" }}
                >
                  Cancelar suscripción
                </button>
              ) : (
                plan && (
                  <button
                    type="button"
                    onClick={() => setRenovando(plan)}
                    className="btn-outline-hover"
                    style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--ink)', borderRadius: 3, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'IBM Plex Sans',sans-serif" }}
                  >
                    Renovar por depósito
                  </button>
                )
              )}
            </div>
          ) : (
            <div style={{ border: '1px solid var(--border)', borderRadius: 4, padding: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
              <div style={{ fontSize: 14, color: 'var(--muted)' }}>
                {venceTexto ? `Tu suscripción venció el ${venceTexto}.` : 'No tienes una suscripción activa.'}
              </div>
              {venceTexto && plan ? (
                <button
                  type="button"
                  onClick={() => setRenovando(plan)}
                  className="btn-hover"
                  style={{ background: 'var(--terracotta)', color: 'var(--bg)', border: 'none', borderRadius: 3, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'IBM Plex Sans',sans-serif" }}
                >
                  Renovar por depósito
                </button>
              ) : (
                <Link to="/planes" className="btn-hover" style={{ background: 'var(--terracotta)', color: 'var(--bg)', borderRadius: 3, padding: '10px 20px', fontSize: 13, fontWeight: 600 }}>
                  Ver planes
                </Link>
              )}
            </div>
          )}
```

- [ ] **Step 4: Agregar la sección de pedidos**

Insértala justo antes del bloque "Reportes comprados" (antes de la línea 94, `<div>`):

```jsx
        {user.orders?.length > 0 && (
          <div style={{ marginBottom: 48 }}>
            <div style={{ fontFamily: "'Spectral',serif", fontWeight: 600, fontSize: 22, marginBottom: 16 }}>Pedidos</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--border)' }}>
              {user.orders.map((o) => {
                const item = o.kind === 'subscription' ? plans.find((p) => p.id === o.plan)?.name : reports.find((r) => r.id === o.report_id)?.title;
                const rechazado = o.status === 'rejected';
                return (
                  <div key={o.id} style={{ background: 'var(--bg)', padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 13, fontWeight: 500 }}>{o.code}</div>
                      <div style={{ fontFamily: "'Spectral',serif", fontWeight: 600, fontSize: 15, marginTop: 2 }}>{item ?? '—'}</div>
                      <div style={{ fontSize: 12, color: rechazado ? 'var(--terracotta)' : 'var(--muted)', marginTop: 4 }}>
                        {rechazado ? `Rechazado: ${o.notes || 'sin motivo registrado'}` : `S/ ${o.amount_pen} · esperando verificación de tu depósito`}
                      </div>
                    </div>
                    {!rechazado && (
                      <a
                        href={waLink(waVoucherMessage(o))}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-outline-hover"
                        style={{ border: '1px solid var(--border)', color: 'var(--ink)', borderRadius: 3, padding: '8px 16px', fontSize: 13, fontWeight: 600, flexShrink: 0 }}
                      >
                        Enviar constancia
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
```

- [ ] **Step 5: Montar el modal de renovación**

Antes de `<Footer borderTop />` (línea 130):

```jsx
      {renovando && <CheckoutModal kind="subscription" item={renovando} onClose={() => setRenovando(null)} />}
```

- [ ] **Step 6: Traducir el error de descarga a algo que el cliente entienda**

Hoy los 7 reportes tienen `file_path` nulo, así que un pedido aprobado igual devuelve `Report file not available yet`. El cliente pagó: no puede recibir un mensaje técnico en inglés.

Agrega esta función arriba del componente, después de los imports:

```jsx
// La Edge Function responde en inglés y con vocabulario de sistema. Quien lee
// esto ya pagó, así que se traduce a algo accionable. El resto de mensajes se
// deja pasar tal cual: son casos raros y el texto original ayuda a depurar.
function mensajeDeDescarga(mensajeCrudo) {
  if (mensajeCrudo.includes('not available yet')) {
    return 'Este reporte todavía no tiene el archivo cargado. Escríbenos por WhatsApp y te lo enviamos.';
  }
  if (mensajeCrudo.includes('Not entitled')) {
    return 'Tu acceso a este reporte no está activo. Si ya depositaste, mándanos la constancia.';
  }
  return mensajeCrudo;
}
```

Y en el `catch` de `handleDownload` (línea 28), envuelve el mensaje:

```jsx
      setDownloadError({ id: reportId, message: mensajeDeDescarga(err.message) });
```

- [ ] **Step 7: Verificar**

Run: `npm run lint; npm run build`
Expected: sin errores nuevos.

- [ ] **Step 8: Commit**

```bash
npm run format
git add web/app/src/pages/Cuenta.jsx
git commit -m "feat: show pending orders, expiry date and renewal in account page"
```

---

### Task 9: `Planes.jsx` y `Reportes.jsx` — precios de la BD y copy honesto

**Files:**
- Modify: `web/app/src/pages/Planes.jsx:9,18-21,65-121,124-130,137`
- Modify: `web/app/src/pages/Reportes.jsx:158-182,203`

**Interfaces:**
- Consumes: `usePlans` (Task 5), `useReports`, `isSubscriptionActive` (Task 6).
- Produces: cierra los errores de lint que Task 5 dejó abiertos.

- [ ] **Step 1: `Planes.jsx` — imports y datos**

Línea 9: `import { PLANS, REPORT_PRICE_PEN } from '../data/content.js';` → bórrala.

Agrega:

```jsx
import usePlans from '../hooks/usePlans.js';
import useReports from '../hooks/useReports.js';
import { isSubscriptionActive } from '../lib/auth.jsx';
```

Reemplaza las líneas 18-21:

```jsx
  const { user } = useAuth();
  const { plans } = usePlans();
  const { reports } = useReports();
  const [checkoutPlan, setCheckoutPlan] = useState(null);

  const isActiveSubscriber = isSubscriptionActive(user?.subscription);

  // "desde S/ X" sale del mínimo real de la BD, que es lo que el trigger de
  // pedidos va a cobrar. Un número hardcodeado acá podría discrepar.
  const premiumPrices = reports.filter((r) => r.tier === 'premium' && r.price_pen).map((r) => Number(r.price_pen));
  const desdePrecio = premiumPrices.length ? Math.min(...premiumPrices) : null;
```

- [ ] **Step 2: `Planes.jsx` — usar `plans` y `price_pen`**

Línea 65: `{PLANS.map((plan) => {` → `{plans.map((plan) => {`

Línea 88: `S/ {plan.price}` → `S/ {plan.price_pen}`

- [ ] **Step 3: `Planes.jsx` — el texto de "desde"**

Reemplaza las líneas 124-130:

```jsx
        {desdePrecio !== null && (
          <div data-reveal="" style={{ textAlign: 'center', marginTop: 48, fontSize: 14, color: 'var(--muted)' }}>
            ¿Prefieres no suscribirte? Los reportes premium también se pueden comprar individualmente desde S/ {desdePrecio} en la{' '}
            <Link to="/reportes" className="link-hover" style={{ fontWeight: 600 }}>
              página de Reportes
            </Link>
            .
          </div>
        )}
```

- [ ] **Step 4: `Planes.jsx` — el `kind` del modal**

Línea 137: `kind="plan"` → `kind="subscription"`

- [ ] **Step 5: `Reportes.jsx` — corregir el caption obsoleto**

Las líneas 158-182 muestran un botón `disabled` con "Descarga disponible cuando el backend esté conectado" a usuarios que **sí** tienen acceso. Es falso desde B3. Reemplaza ese bloque `entitled ? (…)` por un enlace real a la cuenta:

```jsx
                  {entitled ? (
                    <Link
                      to="/cuenta"
                      className="link-hover"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: 'var(--green)' }}
                    >
                      <div style={{ width: 7, height: 7, background: 'var(--green)', transform: 'rotate(45deg)' }} />
                      Incluido — descargar en mi cuenta
                    </Link>
                  ) : (
```

- [ ] **Step 6: `Reportes.jsx` — copy del botón de compra**

Línea 203: `Comprar — S/ {r.price_pen}` → `Comprar por depósito — S/ {r.price_pen}`

- [ ] **Step 7: Verificar**

Run: `npm test; npm run lint; npm run build`
Expected: tests en verde, lint sin errores (los 2 warnings de `react-refresh` en `auth.jsx` son preexistentes), build limpio.

- [ ] **Step 8: Commit**

```bash
npm run format
git add web/app/src/pages/Planes.jsx web/app/src/pages/Reportes.jsx web/app/src/data/content.js web/app/src/hooks/usePlans.js
git commit -m "feat: read plan and report prices from the database, fix stale download caption"
```

---

### Task 10: Verificación de seguridad end-to-end y documentación

**Files:**
- Create: `web/app/scripts/verify-deposit-flow.mjs`
- Modify: `web/app/CLAUDE.md` (secciones "SaaS layer", "Backend connection plan", "Working queue")

**Interfaces:**
- Consumes: todo lo anterior. Requiere el usuario de prueba de Task 3.
- Produces: nada de código.

- [ ] **Step 1: Escribir el script de verificación**

Crea `web/app/scripts/verify-deposit-flow.mjs`. Corre con la **anon key**, o sea desde la posición de un atacante, no de un administrador:

```js
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
check(Number(order?.amount_pen) === Number(premium.price_pen), 'el trigger ignoró el monto falso del cliente', `amount_pen = ${order?.amount_pen}`);

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
const { error: purchaseError } = await supabase.from('purchases').insert({ user_id: auth.user.id, report_id: premium.id, amount_pen: 1, status: 'paid' });
check(!!purchaseError, 'el cliente NO puede insertar en purchases', purchaseError?.message);

console.log();
console.log(failed ? 'RESULTADO: revisa los ✗ de arriba.' : 'RESULTADO: el modelo de seguridad se sostiene.');
console.log(`\nPedido de prueba creado: ${order?.code} — apruébalo con: select approve_order('${order?.code}');`);
process.exit(failed ? 1 : 0);
```

- [ ] **Step 2: Correr el script**

Run: `node scripts/verify-deposit-flow.mjs <email> <password>` con las credenciales de Task 3.
Expected: los 8 checks en `✓`. Cualquier `✗` es un agujero real — párate y arréglalo antes de seguir.

- [ ] **Step 3: Aprobar el pedido y verificar que la descarga se habilita**

Con `execute_sql`, usando el código que imprimió el script:

```sql
select approve_order('<CODIGO>');
```

Debe devolver una línea `OK — INM-… : <email> (S/ 180.00). Acceso: reporte "…"`.

Luego: `node scripts/test-download-url.mjs <email> <password> seguimiento-trimestral-educacion`
Expected: **200** con una URL firmada. Esto cierra la rama de *compra* de `has_access()`.

- [ ] **Step 4: Cerrar la rama de suscripción, que nunca se probó**

Crea y aprueba un pedido de suscripción:

```sql
insert into public.orders (user_id, kind, plan, method)
values ('<USER_ID>', 'subscription', 'monthly', 'deposit')
returning code;
```

```sql
select approve_order('<CODIGO>');
-- Debe decir: Acceso: plan monthly hasta <fecha a un mes>
select user_id, plan, status, current_period_end from public.subscriptions;
```

Ahora prueba el **otro** reporte premium, del que no hay compra directa:
`node scripts/test-download-url.mjs <email> <password> radiografia-contratistas-infraestructura`
Expected: **404** (`Report file not available yet`) — la suscripción **sí** otorgó el derecho, y el 404 es porque ese reporte no tiene `file_path`. Un **403** significaría que la rama de suscripción no funciona.

- [ ] **Step 5: Verificar que el vencimiento realmente vence**

Esta es la aserción que justifica todo el cambio en `has_access()`:

```sql
update public.subscriptions set current_period_end = now() - interval '1 day' where user_id = '<USER_ID>';
select has_access('<USER_ID>', (select id from public.reports where slug = 'radiografia-contratistas-infraestructura')) as debe_ser_false;
-- Restaura:
update public.subscriptions set current_period_end = now() + interval '1 month' where user_id = '<USER_ID>';
```

`debe_ser_false` tiene que ser `f`. Si es `t`, el `current_period_end > now()` no quedó aplicado.

- [ ] **Step 6: Actualizar `CLAUDE.md`**

Tres cambios, sin borrar el historial de fases:

1. En el encabezado de la sección SaaS, cambia "only payments (Culqi) still mocked" por: `pagos por depósito bancario con activación manual — REAL. Culqi descartado (2026-08-04): su área comercial no aprobó la cuenta.`
2. Reemplaza el bloque de **Fase B4** por una entrada nueva **Fase B4' — Pago por depósito**, con: la referencia al spec `docs/superpowers/specs/2026-08-04-pago-deposito-bancario-design.md`, las migraciones `0003`/`0004`, el comando de aprobación `select approve_order('INM-…');`, y la advertencia de que `has_access()` ahora exige `current_period_end`.
3. En la **Working queue**, marca como hecho el ítem de la rama de suscripción, y agrega: `[ ] Completar bankDetails.js con la cuenta real, el CCI, el RUC y el número de Yape — bloquea el primer pedido real.`

- [ ] **Step 7: Commit**

```bash
npm run format
git add web/app/scripts/verify-deposit-flow.mjs web/app/CLAUDE.md
git commit -m "test: verify the deposit flow cannot be subverted from the client"
```

---

## Notas de verificación final

Antes de dar el trabajo por terminado, corre y **lee la salida** de:

```
npm test
npm run lint
npm run build
node scripts/verify-supabase.mjs
node scripts/verify-deposit-flow.mjs <email> <password>
```

Y en el navegador, con el dev server arriba: `/planes` muestra los precios de la BD; `/reportes` muestra el catálogo (las tarjetas se revelan al hacer scroll); generar un pedido muestra código + datos bancarios; `/cuenta` lista el pedido pendiente.

**Recordatorio sobre `bankDetails.js`:** mientras diga `FALTA CONFIGURAR`, el flujo funciona técnicamente pero es inservible para un cliente real. Ese archivo es el último bloqueador antes de cobrar de verdad.
