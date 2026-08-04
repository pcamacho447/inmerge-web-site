# Endurecimiento del flujo de pago por depósito — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cerrar los hallazgos de las dos auditorías del flujo de pago por depósito, de modo que el sistema no pueda aceptar dinero y producir el resultado equivocado.

**Architecture:** Tres migraciones SQL que mueven las garantías desde "política" hacia "permisos" (revocar INSERT por columna, en vez de confiar en que un trigger corrija), más la corrección de concurrencia en `approve_order()` que la futura pasarela va a necesitar, más arreglos de front-end y una batería de tests que convierte cada garantía en una aserción automática.

**Tech Stack:** Supabase Postgres 17 + RLS, Deno Edge Functions, React 18, Vite 5, vitest 4 + jsdom, `@supabase/supabase-js` 2.

**Spec:** `docs/superpowers/specs/2026-08-04-endurecimiento-pagos-deposito-design.md`

## Global Constraints

- **Proyecto Supabase:** `zboxdsiejvmjupdawgax`. Es el único vivo.
- **Directorio de trabajo:** todos los comandos se corren desde `web/app/`.
- **Shell:** PowerShell en Windows. Encadena con `;`, **nunca** con `&&`.
- **Migraciones:** se aplican con `npx supabase@latest db push --include-all --linked`. El MCP de Supabase devuelve 401 en este entorno; usa el CLI. Consultas de lectura: `npx supabase@latest db query --linked "..."`.
- **`pgcrypto` vive en el esquema `extensions`, no en `public`.** Como las funciones fijan `set search_path = public`, toda llamada a `gen_random_bytes` debe escribirse **`extensions.gen_random_bytes(...)`** o falla en tiempo de ejecución.
- **Estilos:** objetos `style={{}}` inline referenciando CSS vars (`var(--terracotta)`). Sin Tailwind. Los `:hover`/`:active` solo vía las clases utilitarias existentes (`btn-hover`, `btn-outline-hover`, `card-hover`, `row-hover`, `link-hover`, `icon-btn-hover`).
- **Nunca** uses el shorthand `font` después de `fontSize`/`fontWeight` en el mismo objeto de estilo: los resetea en silencio.
- **Prettier:** 140 caracteres de ancho. Corre `npm run format` antes de cada commit.
- **Copy:** todo el texto visible en español, tono del sitio (directo, sin signos de admiración).
- **Si redespliegas cualquier Edge Function:** obligatorio `--no-verify-jwt`, o el gateway devuelve `401 INVALID_CREDENTIALS` antes de que corra tu código. Para comprobar que el flag aplicó, lee el **body**: `{"error":"Missing Authorization header"}` = correcto; `{"code":"INVALID_CREDENTIALS"}` = no aplicó.
- **Orden obligatorio:** Task 1 antes de Task 3. Task 3 cambia la firma de `approve_order()`, lo que exige `DROP FUNCTION`, y Supabase reconcede EXECUTE a `anon`/`authenticated` en funciones nuevas de `public`. Task 1 desactiva ese comportamiento. Invertir el orden abre una ventana de autoaprobación.

---

### Task 1: Migración `0005` — permisos por columna y default privileges

**Files:**
- Create: `web/app/supabase/migrations/0005_column_grants.sql`

**Interfaces:**
- Consumes: `public.orders` (0003).
- Produces: `orders` con INSERT restringido a `(user_id, kind, report_id, plan, method)`; default privileges de `public` sin EXECUTE para `anon`/`authenticated`.
- **Nota de alcance:** este task NO toca `orders_set_amount()`. El cuerpo del trigger se define una sola vez, en Task 3 — `create or replace` exige el cuerpo completo, y redefinirlo en dos tasks duplicaría ~25 líneas. Lo que cierra C1 acá es el `revoke`: aunque el `default` de la columna siga generando códigos secuenciales hasta Task 3, el cliente ya no puede escribir `code`.

- [ ] **Step 1: Escribir la migración**

Crea `web/app/supabase/migrations/0005_column_grants.sql`:

```sql
-- Cierra C1/I4: RLS no tiene granularidad de columna, así que el trigger que
-- corregía amount_pen/status/approved_at dejaba libres `code`, `notes` y
-- `created_at`. `code` era el peligroso: vive en un espacio único global del
-- que depende todo el checkout, así que un usuario registrado podía insertar
-- pedidos con códigos futuros y hacer que cada cliente real chocara contra el
-- índice único.
--
-- REGLA GENERAL: donde un trigger "corrige" una columna, revisa qué OTRAS
-- columnas puede escribir el cliente. La policy no las cubre.

revoke insert, update, delete on public.orders from anon, authenticated;
grant insert (user_id, kind, report_id, plan, method) on public.orders to authenticated;

-- Cierra I3: Supabase trae `alter default privileges ... grant execute on
-- functions to anon, authenticated` para el esquema public. `create or replace`
-- conserva el ACL, pero cambiar una firma obliga a DROP + CREATE, y la función
-- nueva nacería EJECUTABLE POR CUALQUIER USUARIO LOGUEADO. Task 3 hace
-- exactamente ese cambio de firma.
alter default privileges in schema public revoke execute on functions from anon, authenticated;
alter default privileges for role postgres in schema public revoke execute on functions from anon, authenticated;
```

- [ ] **Step 2: Aplicar la migración**

Run: `npx supabase@latest db push --include-all --linked`
Expected: `Applying migration 0005_column_grants.sql...` sin errores.

- [ ] **Step 3: Verificar que las columnas quedaron cerradas**

Corre con `db query --linked`. Las tres columnas deben devolver `f`:

```sql
select
  has_column_privilege('authenticated', 'public.orders', 'code', 'insert') as puede_code,
  has_column_privilege('authenticated', 'public.orders', 'notes', 'insert') as puede_notes,
  has_column_privilege('authenticated', 'public.orders', 'created_at', 'insert') as puede_created,
  has_column_privilege('authenticated', 'public.orders', 'method', 'insert') as puede_method;
```

`puede_code`, `puede_notes` y `puede_created` deben ser `false`. `puede_method` debe ser `true` — si es `false`, el grant de columnas quedó mal y los clientes no podrán crear pedidos.

- [ ] **Step 4: Verificar que un pedido normal todavía se puede crear**

El riesgo de revocar permisos es pasarse de largo y romper el checkout. Confirma que el camino legítimo sigue vivo:

```sql
insert into public.orders (user_id, kind, report_id, method)
select (select id from auth.users limit 1), 'report', id, 'deposit'
from public.reports where slug = 'radiografia-contratistas-infraestructura'
returning code, amount_pen;
```

Debe insertar sin error, con `amount_pen = 180.00`. Después bórralo:
`delete from public.orders where code = '<CODIGO_DEVUELTO>';`

- [ ] **Step 5: Commit**

```bash
git add web/app/supabase/migrations/0005_column_grants.sql
git commit -m "feat(db): restrict client INSERT on orders to intent columns only"
```

---

### Task 2: Migración `0006` — `ensure_profile()` server-side

**Files:**
- Create: `web/app/supabase/migrations/0006_ensure_profile.sql`
- Modify: `web/app/src/lib/auth.jsx` (reemplazar `ensureProfile`, líneas ~36-75)

**Interfaces:**
- Consumes: `public.profiles`, `public.organizations` (0001).
- Produces: `public.ensure_profile() returns boolean` (ejecutable por `authenticated`); `organizations`/`profiles` sin INSERT para el cliente; `auth.jsx` sin creación de filas.

- [ ] **Step 1: Escribir la migración**

Crea `web/app/supabase/migrations/0006_ensure_profile.sql`:

```sql
-- Un solo cambio que elimina TRES hallazgos:
--  1. La carrera que duplica organizaciones. `login()` llamaba a buildUser y
--     signInWithPassword además disparaba SIGNED_IN al listener, así que en un
--     primer login ambos veían "no hay profile" y ambos insertaban una
--     organización.
--  2. El huevo-y-gallina de RLS: organizations_select_own exige un `profiles`
--     que apunte a la organización, y ese profile es justo el que se está
--     creando, así que `insert ... returning` nunca podía pasar el SELECT.
--     Se había parcheado generando el UUID en el cliente; ya no hace falta.
--  3. La escritura ilimitada: organizations_insert_authenticated dejaba a
--     cualquier usuario logueado insertar organizaciones arbitrarias sin
--     vínculo con él.
--
-- security definer + una sola transacción + idempotente. El cliente ya no
-- escribe ninguna de las dos tablas.
create or replace function public.ensure_profile()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_meta jsonb;
  v_email text;
  v_full_name text;
  v_org_id uuid;
begin
  if v_uid is null then
    raise exception 'ensure_profile() requiere una sesión';
  end if;

  if exists (select 1 from public.profiles where id = v_uid) then
    return false; -- ya existía, no se creó nada
  end if;

  select raw_user_meta_data, email into v_meta, v_email from auth.users where id = v_uid;
  v_full_name := coalesce(v_meta ->> 'full_name', '');

  if v_full_name = '' then
    return false; -- sin metadata de registro no hay nada que crear
  end if;

  insert into public.organizations (billing_type, legal_name, tax_id, billing_email)
  values (
    coalesce(v_meta ->> 'billing_type', 'persona_natural'),
    v_full_name,
    nullif(v_meta ->> 'tax_id', ''),
    v_email
  )
  returning id into v_org_id;

  -- on conflict: si dos llamadas concurrentes llegan hasta acá, la segunda no
  -- revienta. La organización huérfana que deja es preferible a un 23505 en
  -- la cara del usuario durante su primer login.
  insert into public.profiles (id, organization_id, full_name)
  values (v_uid, v_org_id, v_full_name)
  on conflict (id) do nothing;

  return true;
end;
$$;

revoke execute on function public.ensure_profile() from public, anon;
grant execute on function public.ensure_profile() to authenticated;

-- El cliente ya no necesita escribir estas tablas: ensure_profile() lo hace.
revoke insert on public.organizations from anon, authenticated;
revoke insert on public.profiles from anon, authenticated;
drop policy if exists "organizations_insert_authenticated" on public.organizations;
drop policy if exists "profiles_insert_own" on public.profiles;
```

- [ ] **Step 2: Aplicar la migración**

Run: `npx supabase@latest db push --include-all --linked`

- [ ] **Step 3: Reemplazar `ensureProfile` en `auth.jsx`**

Borra la función `ensureProfile` completa (desde el comentario `// Crea profile/organization…` hasta su llave de cierre) y pon:

```jsx
// La creación de profile/organization vive en la BD (ensure_profile(),
// migración 0006): es security definer, atómica e idempotente, así que dos
// llamadas concurrentes no pueden duplicar la organización. Devuelve false si
// la sesión es basura (usuario borrado o proyecto reconstruido), y en ese caso
// cerramos sesión en vez de reintentar en cada getSession.
async function ensureProfile() {
  const { error } = await supabase.rpc('ensure_profile');
  if (!error) return true;

  // 42501 = RLS/permisos rechazaron la llamada para una sesión supuestamente
  // autenticada: Postgres nos vio como `anon`. Eso es una sesión zombi.
  if (error.code === '42501' || error.code === 'PGRST301') {
    await supabase.auth.signOut();
    return false;
  }
  console.error('ensure_profile failed:', error);
  return true;
}
```

- [ ] **Step 4: Ajustar la llamada en `buildUser`**

`ensureProfile` ya no recibe argumentos. En `buildUser`, cambia:

```jsx
  const sessionValid = await ensureProfile(sessionUser);
```

por:

```jsx
  const sessionValid = await ensureProfile();
```

- [ ] **Step 5: Eliminar la doble ejecución de `buildUser` por login**

`login()` y `signup()` llaman a `buildUser` **y además** `onAuthStateChange` dispara con `SIGNED_IN`, así que todo corre dos veces. Deja al listener como único escritor. En `login`, reemplaza:

```jsx
  const login = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    setUser(await buildUser(data.user));
  }, []);
```

por:

```jsx
  // No llamamos a buildUser acá: signInWithPassword dispara SIGNED_IN y el
  // listener de onAuthStateChange ya reconstruye el usuario. Hacerlo en los dos
  // lados ejecutaba todo el arranque dos veces por login.
  const login = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);
```

Y en `signup`, reemplaza `setUser(await buildUser(data.session.user));` por un comentario equivalente:

```jsx
    // Igual que en login(): el listener de onAuthStateChange se encarga.
```

- [ ] **Step 6: Verificar que compila y los tests siguen verdes**

Run: `npm test; npm run lint; npm run build`
Expected: 16 tests en verde, lint sin errores nuevos, build limpio.

- [ ] **Step 7: Verificar el alta de un usuario NUEVO end-to-end**

Esto es obligatorio: revocamos INSERT en `organizations`/`profiles`, así que si `ensure_profile()` falla, **el registro queda roto** y probar solo con un usuario existente no lo detecta.

Crea un usuario nuevo desde el Dashboard (Authentication → Users → Add user, con **Auto Confirm**), inicia sesión con él en `npm run dev`, y confirma:

```sql
select
  (select count(*) from public.profiles) as perfiles,
  (select count(*) from public.organizations) as organizaciones;
```

Deben subir exactamente **+1 cada uno**, no +2. Después cierra sesión y vuelve a entrar: los números **no** deben cambiar.

- [ ] **Step 8: Commit**

```bash
npm run format
git add web/app/supabase/migrations/0006_ensure_profile.sql web/app/src/lib/auth.jsx
git commit -m "feat(db): create profile and organization server-side, atomically and idempotently"
```

---

### Task 3: Migración `0007` — invariantes de dinero

**Files:**
- Create: `web/app/supabase/migrations/0007_money_invariants.sql`

**Interfaces:**
- Consumes: `public.orders`, `public.purchases`, `public.subscriptions`, `public.plans`.
- Produces: `orders.expires_at`; índice `orders_one_pending_per_item`; `approve_order(text, numeric)`; `preview_order(text)`; `revoke_order(text, text)`.

- [ ] **Step 1: Escribir la migración**

Crea `web/app/supabase/migrations/0007_money_invariants.sql`:

```sql
-- Los pedidos caducan. Sin esto, un pedido creado hoy es redimible para
-- siempre al precio congelado de hoy, y el estado 'expired' que 0003 declaró
-- no lo usaba nada.
alter table public.orders add column if not exists expires_at timestamptz;

-- Un solo pedido pendiente por (usuario, ítem). La reutilización que hace
-- createOrder era check-then-insert: dos pestañas simultáneas generaban dos
-- códigos para el mismo ítem, que es justo lo que la reutilización existe para
-- evitar.
create unique index if not exists orders_one_pending_per_item
  on public.orders (user_id, kind, coalesce(report_id::text, plan))
  where status = 'pending';

-- Bloquear el pedido duplicado ANTES de que el cliente pague. Se hace en el
-- servidor, no en el front: "bloquear antes de pagar" solo vale si no se puede
-- esquivar con un POST directo a PostgREST.
-- Para suscripción NO se bloquea: renovar estando activo es legítimo y extiende
-- el periodo.
create or replace function public.orders_set_amount()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_price numeric(10, 2);
  v_tier text;
  v_code text;
  v_try int := 0;
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
    if exists (
      select 1 from public.purchases
      where user_id = new.user_id and report_id = new.report_id and status = 'paid'
    ) then
      raise exception 'Ya compraste este reporte: lo encuentras en tu cuenta.';
    end if;
  else
    select price_pen into v_price from public.plans where id = new.plan;
    if v_price is null then
      raise exception 'El plan % no existe', new.plan;
    end if;
  end if;

  loop
    v_try := v_try + 1;
    v_code := 'INM-' || to_char(now(), 'YY') || '-' || upper(substr(encode(extensions.gen_random_bytes(4), 'hex'), 1, 6));
    exit when not exists (select 1 from public.orders where code = v_code);
    if v_try >= 10 then
      raise exception 'No se pudo generar un código de pedido único';
    end if;
  end loop;

  new.code := v_code;
  new.amount_pen := v_price;
  new.status := 'pending';
  new.approved_at := null;
  new.expires_at := now() + interval '7 days';
  return new;
end;
$$;

-- Sin previsualización, el operador teclea un código contra una captura de
-- WhatsApp y no puede confirmar nada antes de otorgar acceso.
create or replace function public.preview_order(p_code text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  o public.orders;
  v_email text;
  v_item text;
begin
  select * into o from public.orders where code = upper(trim(p_code));
  if not found then
    raise exception 'El pedido % no existe', p_code;
  end if;
  select email into v_email from auth.users where id = o.user_id;
  if o.kind = 'report' then
    select title into v_item from public.reports where id = o.report_id;
  else
    select name into v_item from public.plans where id = o.plan;
  end if;
  return format(
    '%s | %s | %s | S/ %s | estado: %s | vence: %s',
    o.code, v_email, coalesce(v_item, '?'), o.amount_pen, o.status,
    coalesce(to_char(o.expires_at, 'DD/MM/YYYY'), 'sin vencimiento')
  );
end;
$$;

-- Cambia la firma: exige el monto recibido. Con tres precios distintos
-- (180 / 249 / 2390), un código mal tecleado casi siempre trae otro monto, así
-- que el dedazo pasa a fallar CERRADO en vez de regalarle acceso a un tercero.
-- DROP + CREATE es seguro únicamente porque 0005 revocó los default privileges.
drop function if exists public.approve_order(text);

create or replace function public.approve_order(p_code text, p_amount_received numeric)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  o public.orders;
  v_period_months int;
  v_new_end timestamptz;
  v_email text;
  v_label text;
  v_rows int;
begin
  select * into o from public.orders where code = upper(trim(p_code)) for update;
  if not found then
    raise exception 'El pedido % no existe', p_code;
  end if;
  if o.status <> 'pending' then
    raise exception 'El pedido % ya está en estado "%"', o.code, o.status;
  end if;
  if o.expires_at is not null and o.expires_at < now() then
    raise exception 'El pedido % venció el %. Pídele al cliente uno nuevo.', o.code, to_char(o.expires_at, 'DD/MM/YYYY');
  end if;
  if p_amount_received is distinct from o.amount_pen then
    raise exception 'MONTO NO COINCIDE: el pedido % es por S/ % y recibiste S/ %. Verifica que el código sea el correcto.',
      o.code, o.amount_pen, p_amount_received;
  end if;

  select email into v_email from auth.users where id = o.user_id;

  if o.kind = 'report' then
    -- Conflicto DIRIGIDO al índice parcial. Antes era `on conflict do nothing`
    -- sin destino, así que un pago duplicado se tragaba el insert, la función
    -- seguía y retornaba OK: la plata entraba y no quedaba rastro.
    insert into public.purchases (user_id, report_id, amount_pen, status)
    values (o.user_id, o.report_id, o.amount_pen, 'paid')
    on conflict (user_id, report_id) where status = 'paid' do nothing;

    get diagnostics v_rows = row_count;
    if v_rows = 0 then
      raise exception 'PEDIDO DUPLICADO: % ya tenía ese reporte pagado. Devuelve el dinero o usa reject_order().', v_email;
    end if;

    select title into v_label from public.reports where id = o.report_id;
    v_label := format('reporte "%s"', v_label);
  else
    select period_months into v_period_months from public.plans where id = o.plan;

    -- El vencimiento se calcula DENTRO del upsert, leyendo la fila ya
    -- bloqueada. Antes se leía a un v_base sin lock y dos aprobaciones
    -- concurrentes para el mismo usuario se pisaban: aprobar anual y mensual a
    -- la vez le borraba 11 meses pagados al cliente, en silencio.
    insert into public.subscriptions (user_id, plan, status, current_period_start, current_period_end)
    values (o.user_id, o.plan, 'active', now(), now() + (v_period_months * interval '1 month'))
    on conflict (user_id) do update
      set plan = excluded.plan,
          status = 'active',
          current_period_start = now(),
          current_period_end = greatest(subscriptions.current_period_end, now()) + (v_period_months * interval '1 month'),
          updated_at = now()
    returning current_period_end into v_new_end;

    v_label := format('plan %s hasta %s', o.plan, to_char(v_new_end, 'DD/MM/YYYY'));
  end if;

  update public.orders set status = 'approved', approved_at = now() where id = o.id;

  return format('OK — %s: %s (S/ %s). Acceso: %s', o.code, v_email, o.amount_pen, v_label);
end;
$$;

-- Deshacer una aprobación equivocada. Hoy no existe: revertir un dedazo exige
-- UPDATE a mano como service_role, sin rastro.
create or replace function public.revoke_order(p_code text, p_reason text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  o public.orders;
  v_period_months int;
begin
  select * into o from public.orders where code = upper(trim(p_code)) for update;
  if not found then
    raise exception 'El pedido % no existe', p_code;
  end if;
  if o.status <> 'approved' then
    raise exception 'El pedido % no está aprobado (está en "%")', o.code, o.status;
  end if;

  if o.kind = 'report' then
    -- 'refunded' ya está permitido por purchases_status_check.
    update public.purchases set status = 'refunded'
    where user_id = o.user_id and report_id = o.report_id and status = 'paid';
  else
    -- subscriptions_status_check NO admite 'refunded', así que el retroceso es
    -- por fecha: se resta el periodo que esta aprobación había otorgado.
    select period_months into v_period_months from public.plans where id = o.plan;
    update public.subscriptions
    set current_period_end = current_period_end - (v_period_months * interval '1 month'),
        updated_at = now()
    where user_id = o.user_id;
  end if;

  update public.orders set status = 'rejected', notes = p_reason, approved_at = null where id = o.id;
  return format('Revertido — %s: %s', o.code, p_reason);
end;
$$;

revoke execute on function public.approve_order(text, numeric) from public, anon, authenticated;
revoke execute on function public.preview_order(text) from public, anon, authenticated;
revoke execute on function public.revoke_order(text, text) from public, anon, authenticated;
grant execute on function public.approve_order(text, numeric) to service_role;
grant execute on function public.preview_order(text) to service_role;
grant execute on function public.revoke_order(text, text) to service_role;
```

- [ ] **Step 2: Aplicar la migración**

Run: `npx supabase@latest db push --include-all --linked`

- [ ] **Step 3: Verificar los ACL después del cambio de firma**

Este es el paso que comprueba que Task 1 funcionó. Las cuatro funciones deben dar `false` para `anon` y `authenticated`:

```sql
select p.proname,
       has_function_privilege('anon', p.oid, 'execute') as anon_puede,
       has_function_privilege('authenticated', p.oid, 'execute') as auth_puede,
       has_function_privilege('service_role', p.oid, 'execute') as service_puede
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.proname in ('approve_order','reject_order','revoke_order','preview_order','has_access')
order by p.proname;
```

Si `auth_puede` sale `true` en alguna, **detente**: la migración 0005 no aplicó y hay una ventana de autoaprobación abierta.

- [ ] **Step 4: Verificar el rechazo por monto**

Crea un pedido de suscripción y trata de aprobarlo con el monto equivocado:

```sql
insert into public.orders (user_id, kind, plan, method)
values ((select id from auth.users limit 1), 'subscription', 'monthly', 'deposit')
returning code;
```

Con el código devuelto: `select approve_order('<CODIGO>', 100);`
Expected: excepción `MONTO NO COINCIDE`.
Luego: `select approve_order('<CODIGO>', 249);` → debe devolver `OK — …`.

- [ ] **Step 5: Verificar que la extensión suma en vez de pisar**

```sql
select current_period_end from public.subscriptions where user_id = (select id from auth.users limit 1);
```

Anota la fecha. Crea y aprueba **otro** pedido mensual; la fecha nueva debe ser **un mes mayor** que la anterior, no un mes desde hoy.

- [ ] **Step 6: Verificar el bloqueo de duplicado y el revoke**

```sql
-- Debe fallar con 'Ya compraste este reporte' si el usuario ya tiene la compra.
-- (Usa un reporte que el usuario ya haya comprado.)
insert into public.orders (user_id, kind, report_id, method)
select (select id from auth.users limit 1), 'report', id, 'deposit'
from public.reports where slug = 'seguimiento-trimestral-educacion';
```

Y revierte la suscripción aprobada en el Step 4: `select revoke_order('<CODIGO>', 'prueba');` — `current_period_end` debe retroceder un mes y el pedido quedar en `rejected`.

- [ ] **Step 7: Commit**

```bash
git add web/app/supabase/migrations/0007_money_invariants.sql
git commit -m "feat(db): block duplicate orders, verify amount on approval, fix subscription extension race"
```

---

### Task 4: Migración `0008` — publicación y fuga de `file_path`

**Files:**
- Create: `web/app/supabase/migrations/0008_published_and_file_path.sql`
- Modify: `web/app/src/hooks/useReports.js:15-18`

**Interfaces:**
- Consumes: `public.reports`, `public.has_access`.
- Produces: `has_access()` que respeta `published_at`; `reports` sin `file_path` legible por el cliente.

- [ ] **Step 1: Escribir la migración**

**Atención:** hoy los 7 reportes tienen `published_at = NULL`. El backfill del primer statement es obligatorio; sin él, el filtro deja el catálogo vacío y **nadie puede descargar nada**.

Crea `web/app/supabase/migrations/0008_published_and_file_path.sql`:

```sql
-- BACKFILL PRIMERO. Los 7 reportes existentes tienen published_at NULL; sin
-- esto, el filtro de abajo vacía el catálogo y rompe todas las descargas.
update public.reports set published_at = created_at where published_at is null;

-- has_access() nunca miraba el p_report_id en la rama de suscripción: bastaba
-- con tener una suscripción activa para bajar CUALQUIER reporte con archivo,
-- incluido un borrador subido para revisión. Ahora el reporte tiene que existir
-- y estar publicado, sea cual sea la vía de acceso.
create or replace function public.has_access(p_user_id uuid, p_report_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.reports r
    where r.id = p_report_id
      and r.published_at is not null
      and r.published_at <= now()
      and (
        r.tier = 'free'
        or exists (
          select 1 from public.purchases pu
          where pu.user_id = p_user_id and pu.report_id = r.id and pu.status = 'paid'
        )
        or exists (
          select 1 from public.subscriptions s
          where s.user_id = p_user_id and s.status = 'active' and s.current_period_end > now()
        )
      )
  );
$$;

revoke execute on function public.has_access(uuid, uuid) from public, anon, authenticated;
grant execute on function public.has_access(uuid, uuid) to service_role;

-- `file_path` es la ruta interna del PDF dentro del bucket privado y viajaba en
-- la respuesta pública de /rest/v1/reports. El front no la usa; la Edge
-- Function la lee con service_role. Se revoca el SELECT de tabla y se
-- reconcede columna por columna.
revoke select on public.reports from anon, authenticated;
grant select (id, slug, tag, title, summary, tier, price_pen, cover_image_path, published_at, created_at)
  on public.reports to anon, authenticated;
```

- [ ] **Step 2: Aplicar la migración**

Run: `npx supabase@latest db push --include-all --linked`

- [ ] **Step 3: Verificar que el catálogo NO quedó vacío**

```sql
select count(*) as publicados from public.reports where published_at is not null and published_at <= now();
```

Expected: **7**. Si sale 0, el backfill no corrió y las descargas están rotas.

- [ ] **Step 4: Verificar que `file_path` dejó de ser legible**

```sql
select has_column_privilege('authenticated', 'public.reports', 'file_path', 'select') as puede_file_path,
       has_column_privilege('authenticated', 'public.reports', 'title', 'select') as puede_title;
```

`puede_file_path` debe ser `false`; `puede_title` debe ser `true`.

- [ ] **Step 5: Filtrar por publicación en `useReports.js`**

En `web/app/src/hooks/useReports.js`, reemplaza el encadenado del `select` (líneas 15-18) por:

```js
    supabase
      .from('reports')
      .select('id, slug, tag, title, summary, tier, price_pen, cover_image_path, published_at')
      // Se seleccionaba published_at pero nunca se filtraba, así que un
      // borrador aparecía en el catálogo público apenas se insertaba.
      .not('published_at', 'is', null)
      .lte('published_at', new Date().toISOString())
      .order('created_at')
```

- [ ] **Step 6: Verificar**

Run: `npm test; npm run lint; npm run build`
Expected: todo en verde. Levanta `npm run dev` y confirma que `/reportes` sigue mostrando los 7 reportes.

- [ ] **Step 7: Commit**

```bash
npm run format
git add web/app/supabase/migrations/0008_published_and_file_path.sql web/app/src/hooks/useReports.js
git commit -m "feat(db): gate access on published_at and stop exposing file_path to clients"
```

---

### Task 5: Endurecer la Edge Function

**Files:**
- Modify: `web/app/supabase/functions/get-report-download-url/index.ts:15-18,48`

**Interfaces:**
- Consumes: `has_access()` (Task 4).
- Produces: la misma función, sin 500 sin CORS y con origen fijado.

- [ ] **Step 1: Fijar el origen CORS**

Reemplaza las líneas 15-18:

```ts
// El origen va fijado, no en '*': la función se despliega con --no-verify-jwt,
// así que es accesible desde cualquier lado y el CORS es la única barrera de
// navegador que queda. Agrega acá el dominio real cuando exista.
const ALLOWED_ORIGINS = ['http://localhost:5173', 'https://inmerge.pe'];

function corsFor(req: Request) {
  const origin = req.headers.get('Origin') ?? '';
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    Vary: 'Origin',
  };
}
```

- [ ] **Step 2: Calcular las cabeceras por petición**

El paso 1 eliminó la constante global `corsHeaders` y la reemplazó por la función `corsFor(req)`. Ahora hay que declarar `corsHeaders` **dentro** del handler, para que las ~7 apariciones de `...corsHeaders` que ya existen en el archivo sigan resolviendo sin tocarlas.

Reemplaza la línea 25 original:

```ts
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
```

por:

```ts
  const corsHeaders = corsFor(req);
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
```

No hay que modificar ninguna otra respuesta del archivo: todas usan `...corsHeaders` y ahora leen la constante local.

- [ ] **Step 3: Envolver el parseo de JSON**

Reemplaza la línea 48 (`const { report_id } = await req.json();`) por:

```ts
  // Sin esto, un cuerpo que no sea JSON lanza y el runtime emite un 500 SIN
  // cabeceras CORS, así que el navegador reporta un error de CORS en vez del
  // problema real.
  let report_id: string | undefined;
  try {
    ({ report_id } = await req.json());
  } catch {
    return new Response(JSON.stringify({ error: 'Cuerpo inválido: se esperaba JSON' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
```

- [ ] **Step 4: Desplegar**

Run: `npx supabase@latest functions deploy get-report-download-url --project-ref zboxdsiejvmjupdawgax --no-verify-jwt`

- [ ] **Step 5: Verificar que `--no-verify-jwt` aplicó**

El status es 401 en ambos casos, así que **lee el body**:

Run: `curl -s -X POST https://zboxdsiejvmjupdawgax.supabase.co/functions/v1/get-report-download-url`
Expected: `{"error":"Missing Authorization header"}` — nuestro código corrió.
Si sale `{"code":"INVALID_CREDENTIALS"}`, el flag no aplicó: repite el deploy.

- [ ] **Step 6: Verificar la descarga real**

Run: `node scripts/test-download-url.mjs <email> <password> seguimiento-trimestral-educacion`
Expected: **200** con URL firmada.

- [ ] **Step 7: Commit**

```bash
git add web/app/supabase/functions/get-report-download-url/index.ts
git commit -m "fix(edge): pin CORS origin and return 400 with CORS headers on malformed body"
```

---

### Task 6: Correcciones de front-end

**Files:**
- Modify: `web/app/src/lib/auth.jsx` (`fetchOrders`, `buildUser`)
- Modify: `web/app/src/components/CheckoutModal.jsx` (método mostrado)
- Modify: `web/app/src/pages/Cuenta.jsx` (imports, estado de error)
- Create: `web/app/src/lib/formatPEN.js`

**Interfaces:**
- Consumes: `fetchOrders` (0004 del plan anterior).
- Produces: `formatPEN(valor) → string`; `user.ordersError: boolean`.

- [ ] **Step 1: Crear el helper de moneda**

Crea `web/app/src/lib/formatPEN.js`:

```js
// PostgREST serializa `numeric` sin comillas, así que 2390.00 llega como el
// número 2390 y se renderizaba "S/ 2390" mientras el copy del sitio dice
// "S/ 2,390". Un solo helper para que no vuelva a divergir.
export function formatPEN(valor) {
  const n = Number(valor);
  if (!Number.isFinite(n)) return '—';
  return n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
```

- [ ] **Step 2: Dejar de tragarse el error de `fetchOrders`**

En `auth.jsx`, dentro de `buildUser`, reemplaza:

```jsx
  const orders = await fetchOrders(sessionUser.id).catch(() => []);
```

por:

```jsx
  // Antes esto era `.catch(() => [])`, y una falla de carga se veía IDÉNTICA a
  // "no tienes pedidos" — justo en la página que existe para tranquilizar a
  // alguien que acaba de depositar. Ahora se distingue.
  let orders = [];
  let ordersError = false;
  try {
    orders = await fetchOrders(sessionUser.id);
  } catch (err) {
    console.error('No se pudieron cargar los pedidos:', err);
    ordersError = true;
  }
```

Y agrega `ordersError` al objeto que devuelve `buildUser`, junto a `orders`.

- [ ] **Step 3: Paralelizar las tres lecturas independientes**

En `buildUser`, `fetchProfileFields` y `fetchRealEntitlements` son independientes entre sí. Reemplaza las dos líneas secuenciales:

```jsx
  const profileFields = await fetchProfileFields(sessionUser.id);
  const real = await fetchRealEntitlements(sessionUser.id);
```

por:

```jsx
  const [profileFields, real] = await Promise.all([fetchProfileFields(sessionUser.id), fetchRealEntitlements(sessionUser.id)]);
```

- [ ] **Step 4: Mostrar el método persistido en el modal**

En `CheckoutModal.jsx`, agrega justo antes del `return`:

```jsx
  // Se muestra el método de la FILA, no el del estado local. createOrder
  // reutiliza un pedido pendiente del mismo ítem sin importar el método, así
  // que elegir Yape sobre un pedido creado como depósito mostraba
  // instrucciones que contradicen lo guardado — y como `orders` no tiene policy
  // de UPDATE, eso es incorregible después.
  const shownMethod = order?.method ?? method;
```

y en el bloque de instrucciones, cambia `{method === ORDER_METHODS.DEPOSIT ? (` por `{shownMethod === ORDER_METHODS.DEPOSIT ? (`.

- [ ] **Step 5: Avisar en `/cuenta` cuando la carga falló**

En `Cuenta.jsx`, unifica primero los dos imports de `auth.jsx` en uno:

```jsx
import { useAuth, isSubscriptionActive } from '../lib/auth.jsx';
```

(borra la línea `import { isSubscriptionActive } from '../lib/auth.jsx';`)

Y justo antes del bloque `{user.orders?.length > 0 && (`, agrega:

```jsx
        {user.ordersError && (
          <div style={{ marginBottom: 48, border: '1px solid var(--terracotta)', borderRadius: 4, padding: 20, fontSize: 14, color: 'var(--muted)', lineHeight: 1.6 }}>
            No pudimos cargar tus pedidos. Recarga la página; si ya depositaste y sigue sin aparecer, escríbenos por WhatsApp.
          </div>
        )}
```

- [ ] **Step 6: Usar `formatPEN` donde se muestra dinero**

Importa `formatPEN` en `CheckoutModal.jsx`, `Cuenta.jsx` y `Planes.jsx`, y reemplaza:
- `CheckoutModal.jsx`: `S/ {order.amount_pen}` → `S/ {formatPEN(order.amount_pen)}`, y `S/ {price}` → `S/ {formatPEN(price)}`
- `Cuenta.jsx`: `S/ ${o.amount_pen}` → `S/ ${formatPEN(o.amount_pen)}`
- `Planes.jsx`: `S/ {plan.price_pen}` → `S/ {formatPEN(plan.price_pen)}`

En `content.js`, dentro de `waVoucherMessage`, importa el helper y usa `formatPEN(order.amount_pen)`.

- [ ] **Step 7: Verificar**

Run: `npm test; npm run lint; npm run build`
Expected: todo en verde.

- [ ] **Step 8: Commit**

```bash
npm run format
git add web/app/src/lib/formatPEN.js web/app/src/lib/auth.jsx web/app/src/components/CheckoutModal.jsx web/app/src/pages/Cuenta.jsx web/app/src/pages/Planes.jsx web/app/src/data/content.js
git commit -m "fix: surface order-load failures, show persisted payment method, format currency consistently"
```

---

### Task 7: Accesibilidad y copiado en el modal

**Files:**
- Modify: `web/app/src/components/CheckoutModal.jsx`

**Interfaces:**
- Consumes: nada nuevo.
- Produces: `<CopyRow label value mono />` interno al archivo.

- [ ] **Step 1: Agregar el componente de fila copiable**

En `CheckoutModal.jsx`, arriba del componente principal:

```jsx
// El CCI son 20 dígitos y quien los lee está en un celular: es el paso con más
// probabilidad de error de todo el flujo, y un CCI mal tecleado es una
// transferencia fallida que hay que desenredar a mano.
function CopyRow({ label, value, mono }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(value);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1800);
    } catch {
      setCopiado(false); // navegador sin permiso de portapapeles: el texto sigue visible
    }
  }

  return (
    <>
      <dt style={{ color: 'var(--muted)' }}>{label}</dt>
      <dd style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: mono ? "'IBM Plex Mono',monospace" : undefined }}>{value}</span>
        <button
          type="button"
          onClick={copiar}
          aria-label={`Copiar ${label}`}
          className="btn-outline-hover"
          style={{ border: '1px solid var(--border)', background: 'none', color: 'var(--muted)', borderRadius: 3, padding: '2px 8px', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: "'IBM Plex Sans',sans-serif" }}
        >
          {copiado ? 'copiado' : 'copiar'}
        </button>
      </dd>
    </>
  );
}
```

- [ ] **Step 2: Usarlo en las filas que se copian**

En el bloque de depósito, reemplaza las filas de Número y CCI por:

```jsx
                <CopyRow label="Número" value={BANK_ACCOUNT.number} mono />
                <CopyRow label="CCI" value={BANK_ACCOUNT.cci} mono />
```

y en el bloque de Yape, la del teléfono:

```jsx
                <CopyRow label="Yape / Plin" value={YAPE_PLIN.phone} mono />
```

- [ ] **Step 3: Devolver el foco al diálogo al cambiar de paso**

Agrega dentro del componente, después de los `useState`:

```jsx
  // Al cambiar de paso, el botón que tenía el foco se desmonta y el foco cae al
  // <body>. La trampa de foco de useOverlay solo intercepta Tab cuando el
  // elemento activo es el primero o el último del diálogo, así que con el foco
  // en body ninguna rama aplica y Tab se escapa a la página de atrás.
  useEffect(() => {
    modalRef.current?.focus();
  }, [step, modalRef]);
```

y agrega `useEffect` al import de React: `import { useEffect, useState } from 'react';`

- [ ] **Step 4: Anunciar el error a lectores de pantalla**

En el `div` del mensaje de error, agrega `role="alert"`:

```jsx
            {error && (
              <div role="alert" style={{ fontSize: 13, color: 'var(--terracotta)', marginBottom: 16, lineHeight: 1.6 }}>
                {error}
              </div>
            )}
```

- [ ] **Step 5: Agrupar los radios semánticamente**

Reemplaza el `<div>` que envuelve "Cómo vas a pagar" y sus radios por un `<fieldset>` sin borde y un `<legend>`:

```jsx
              <fieldset style={{ marginBottom: 20, border: 'none', padding: 0, margin: '0 0 20px' }}>
                <legend style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, padding: 0 }}>Cómo vas a pagar</legend>
```

cerrando con `</fieldset>` en vez de `</div>`, y borrando el `<div>` interno que tenía el texto "Cómo vas a pagar".

- [ ] **Step 6: Verificar**

Run: `npm test; npm run lint; npm run build`

Levanta `npm run dev`, abre el modal, genera un pedido y comprueba a mano: el botón "copiar" del CCI copia los 20 dígitos, y al llegar al paso de instrucciones la tecla Tab **no** sale del diálogo.

- [ ] **Step 7: Commit**

```bash
npm run format
git add web/app/src/components/CheckoutModal.jsx
git commit -m "feat: add copy buttons for account details, fix focus escape and radio group semantics"
```

---

### Task 8: Tests unitarios que verifiquen de verdad

**Files:**
- Modify: `web/app/src/lib/orders.test.js` (reescritura del mock)
- Create: `web/app/src/components/CheckoutModal.test.jsx`
- Modify: `web/app/package.json` (dependencia de testing-library)

**Interfaces:**
- Consumes: `createOrder` (de `lib/orders.js`); `CheckoutModal` **ya con los cambios de Task 6 y Task 7** — el test busca `findByRole('alert')`, que solo existe después de que Task 7 agregue `role="alert"`, y afirma el método persistido, que solo existe después de Task 6. **Este task debe ir después de esos dos.**
- Produces: nada que consuman otros tasks.

- [ ] **Step 1: Instalar testing-library**

Run: `npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event`

- [ ] **Step 2: Hacer que el mock registre los filtros**

El mock actual devuelve `this` en todo e **ignora los argumentos**, así que `createOrder` podría filtrar por el usuario equivocado y los tests seguirían pasando. En `orders.test.js`, reemplaza el `vi.mock` por:

```js
vi.mock('./supabaseClient.js', () => ({
  supabase: {
    auth: { getUser: async () => ({ data: { user: { id: 'u-1' } }, error: null }) },
    from(tabla) {
      mockState.tablasConsultadas.push(tabla);
      return {
        // Cada filtro se registra para poder afirmarlo. Un mock que devuelve
        // `this` sin mirar los argumentos no prueba nada.
        select() {
          return this;
        },
        eq(col, val) {
          mockState.filtros.push([col, val]);
          return this;
        },
        in(col, vals) {
          mockState.filtros.push([col, vals]);
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
      };
    },
  },
}));
```

y en `vi.hoisted`, agrega los campos nuevos:

```js
const mockState = vi.hoisted(() => ({
  pendingRows: [],
  insertedRows: [],
  filtros: [],
  tablasConsultadas: [],
  insertResult: { data: { id: 'o-nuevo', code: 'INM-26-A1B2C3' }, error: null },
}));
```

Resetea los dos campos nuevos en el `beforeEach`.

- [ ] **Step 3: Agregar los tests que el mock viejo no podía expresar**

Agrega dentro del `describe('createOrder')`:

```js
  it('busca el pendiente filtrando por usuario, tipo, ítem y estado', async () => {
    await createOrder({ kind: 'report', itemId: 'r-1', method: 'deposit' });

    expect(mockState.filtros).toEqual([
      ['user_id', 'u-1'],
      ['kind', 'report'],
      ['report_id', 'r-1'],
      ['status', 'pending'],
    ]);
  });

  it('consulta la tabla orders y ninguna otra', async () => {
    await createOrder({ kind: 'report', itemId: 'r-1', method: 'deposit' });

    expect(new Set(mockState.tablasConsultadas)).toEqual(new Set(['orders']));
  });

  it('propaga el error del insert en vez de devolver un pedido inválido', async () => {
    mockState.insertResult = { data: null, error: { message: 'boom' } };

    await expect(createOrder({ kind: 'report', itemId: 'r-1', method: 'deposit' })).rejects.toThrow('boom');
  });
```

Restaura `mockState.insertResult` en el `beforeEach` para que el último test no contamine a los demás.

- [ ] **Step 4: Correr los tests**

Run: `npm test`
Expected: los tres nuevos pasan. Si "busca el pendiente filtrando…" falla, es un hallazgo real, no un test mal escrito: compara el orden de los `.eq()` en `orders.js`.

- [ ] **Step 5: Escribir el test del modal**

Crea `web/app/src/components/CheckoutModal.test.jsx`:

```jsx
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const mockState = vi.hoisted(() => ({ createOrderImpl: null }));

vi.mock('../lib/orders.js', () => ({
  ORDER_METHODS: { DEPOSIT: 'deposit', YAPE_PLIN: 'yape_plin' },
  createOrder: (...args) => mockState.createOrderImpl(...args),
}));

vi.mock('../lib/auth.jsx', () => ({
  useAuth: () => ({ user: { id: 'u-1' }, subscribe: vi.fn(), purchaseReport: vi.fn(), refreshUser: vi.fn() }),
}));

const CheckoutModal = (await import('./CheckoutModal.jsx')).default;

const PLAN = { id: 'monthly', name: 'Premium Mensual', price_pen: 249, period: 'mes' };

function montar() {
  return render(
    <MemoryRouter>
      <CheckoutModal kind="subscription" item={PLAN} onClose={vi.fn()} />
    </MemoryRouter>,
  );
}

describe('CheckoutModal', () => {
  beforeEach(() => {
    mockState.createOrderImpl = null;
  });

  // Esta es la garantía más fuerte del spec original, y hasta ahora estaba
  // sostenida solo por un comentario en el código.
  it('no entrega datos bancarios si el pedido no se pudo registrar', async () => {
    mockState.createOrderImpl = () => Promise.reject(new Error('no se pudo guardar'));
    montar();

    await userEvent.click(screen.getByRole('button', { name: /generar pedido/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('no se pudo guardar');
    expect(screen.queryByText(/CCI/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /generar pedido/i })).toBeInTheDocument();
  });

  it('muestra el método guardado en el pedido, no el elegido en el formulario', async () => {
    // El usuario elige Yape, pero createOrder reutiliza un pendiente de depósito.
    mockState.createOrderImpl = () => Promise.resolve({ id: 'o-1', code: 'INM-26-A1B2C3', amount_pen: 249, method: 'deposit' });
    montar();

    await userEvent.click(screen.getByRole('radio', { name: /yape/i }));
    await userEvent.click(screen.getByRole('button', { name: /generar pedido/i }));

    expect(await screen.findByText('INM-26-A1B2C3')).toBeInTheDocument();
    expect(screen.getByText('CCI')).toBeInTheDocument(); // datos de depósito, no de Yape
  });
});
```

- [ ] **Step 6: Habilitar los matchers de jest-dom**

En `web/app/vite.config.js`, dentro de `test`, agrega `setupFiles`:

```js
    setupFiles: ['./src/test-setup.js'],
```

y crea `web/app/src/test-setup.js`:

```js
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 7: Correr todo**

Run: `npm test`
Expected: los 2 tests del modal pasan, más los de `orders`, `auth` y `useReveal`.

- [ ] **Step 8: Commit**

```bash
npm run format
git add web/app/src/lib/orders.test.js web/app/src/components/CheckoutModal.test.jsx web/app/src/test-setup.js web/app/vite.config.js web/app/package.json web/app/package-lock.json
git commit -m "test: assert PostgREST filters and pin the modal's no-bank-details-without-order guarantee"
```

---

### Task 9: Ampliar el script de verificación adversarial

**Files:**
- Modify: `web/app/scripts/verify-deposit-flow.mjs`

**Interfaces:**
- Consumes: todo lo anterior. Requiere **dos** usuarios de prueba.
- Produces: nada de código.

- [ ] **Step 1: Aceptar un segundo usuario**

Las lecturas cruzadas entre usuarios no tienen ninguna cobertura hoy porque el script solo conoce una cuenta. Cambia la cabecera de argumentos:

```js
const [email, password, email2, password2] = process.argv.slice(2);
if (!email || !password) {
  console.error('Uso: node scripts/verify-deposit-flow.mjs <email> <password> [<email2> <password2>]');
  console.error('  Sin el segundo usuario se saltan las pruebas de lectura cruzada.');
  process.exit(1);
}
```

- [ ] **Step 2: Probar las columnas que el script nunca intentó escribir**

Agrega después del check del monto falso:

```js
// C1: el trigger corrige amount_pen, pero `code` vive en un espacio único
// global del que depende todo el checkout. Una línea habría delatado el
// agujero.
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
```

- [ ] **Step 3: Probar el upsert como vector de UPDATE**

```js
// PostgREST convierte un insert en UPDATE con Prefer: resolution=merge-duplicates.
// Es la forma natural de atacar una tabla sin policy de UPDATE.
const { data: upserted } = await supabase.from('orders').upsert({ id: order.id, status: 'approved' }, { onConflict: 'id' }).select();
check(!upserted || upserted.length === 0, 'el cliente NO puede aprobar su pedido vía upsert');
```

- [ ] **Step 4: Probar las tablas de dinero que faltaban**

```js
const { error: errSub } = await supabase
  .from('subscriptions')
  .insert({ user_id: auth.user.id, plan: 'annual', status: 'active', current_period_end: '2099-01-01' });
check(!!errSub, 'el cliente NO puede insertar en subscriptions', errSub?.message);

const { data: precioEditado } = await supabase.from('reports').update({ price_pen: 1 }).eq('id', premium.id).select();
check(!precioEditado || precioEditado.length === 0, 'el cliente NO puede editar el precio de un reporte');

const { data: planEditado } = await supabase.from('plans').update({ price_pen: 1 }).eq('id', 'monthly').select();
check(!planEditado || planEditado.length === 0, 'el cliente NO puede editar el precio de un plan');

const { data: fileLeak } = await supabase.from('reports').select('file_path').limit(1);
check(!!fileLeak?.[0] === false || fileLeak?.[0]?.file_path === undefined, 'el cliente NO puede leer file_path');
```

- [ ] **Step 5: Probar las funciones nuevas y la lectura cruzada**

```js
for (const fn of ['approve_order', 'preview_order', 'revoke_order', 'has_access', 'reject_order']) {
  const { error } = await supabase.rpc(fn, {});
  check(!!error, `el cliente NO puede ejecutar ${fn}`, error?.message);
}

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
}
```

- [ ] **Step 6: Limpiar el pedido de prueba**

El script dejaba un pedido pendiente vivo en cada corrida, ensuciando la cola de aprobación. Reemplaza el mensaje final por una limpieza real usando la service key si está disponible, o instrucciones claras:

```js
console.log();
console.log(failed ? 'RESULTADO: revisa los ✗ de arriba.' : 'RESULTADO: el modelo de seguridad se sostiene.');
console.log(`\nLimpieza: el pedido de prueba ${order?.code} quedó pendiente. Bórralo con:`);
console.log(`  delete from public.orders where code = '${order?.code}';`);
process.exit(failed ? 1 : 0);
```

- [ ] **Step 7: Correr el script completo**

Run: `node scripts/verify-deposit-flow.mjs <email1> <pass1> <email2> <pass2>`
Expected: **todos** en `✓`. Cualquier `✗` es un agujero real — párate y arréglalo.

- [ ] **Step 8: Commit**

```bash
npm run format
git add web/app/scripts/verify-deposit-flow.mjs
git commit -m "test: cover column writes, upsert vector, cross-user reads and the new functions"
```

---

### Task 10: Reconciliar `CLAUDE.md`

**Files:**
- Modify: `web/app/CLAUDE.md`

**Interfaces:**
- Consumes: todo lo anterior.
- Produces: nada de código.

- [ ] **Step 1: Corregir las contradicciones**

`CLAUDE.md` está declarado fuente de verdad sobre qué es real y qué está simulado, y hoy afirma las dos cosas. Tres correcciones:

1. En la sección B3 ("Current reality"), el párrafo que dice *"The **only** simulated piece left is the payment write… don't remove them until B4 wires real Culqi payments"* está obsoleto: el pago por depósito es real y Culqi está descartado. Reemplázalo por una nota que apunte a la fase B4' y al spec de endurecimiento.
2. En la sección "Routes / pages", la lista de contenidos de `content.js` menciona `REPORTS`, `PLANS` y "pricing constants" — los tres fueron eliminados. Deja `WA_LINK`/`waLink`, `SITE_URL`, `PLAN_COPY`, `periodLabel` y `waVoucherMessage`.
3. En la tabla de rutas, `/login`, `/registro` y `/cuenta` siguen marcados "(mock)". Auth es real desde B1 y los pagos desde B4'. Quita esas marcas.

- [ ] **Step 2: Documentar el procedimiento de aprobación nuevo**

En la entrada de la fase B4', reemplaza la línea del comando de aprobación por el procedimiento de tres pasos, que ahora exige el monto:

```markdown
**Aprobar un pedido** (desde el SQL Editor, como service_role):
1. `select preview_order('INM-26-A1B2C3');` — confirma email, ítem y monto antes de otorgar nada.
2. `select approve_order('INM-26-A1B2C3', 249);` — el segundo argumento es el monto **recibido**; si no coincide con el del pedido, falla. Eso es lo que hace que un código mal tecleado falle cerrado.
3. Si te equivocaste: `select revoke_order('INM-26-A1B2C3', 'motivo');`

Los pedidos vencen a los 7 días. Los códigos son aleatorios (`INM-AA-XXXXXX`), no secuenciales.
```

- [ ] **Step 3: Agregar la regla que generalizó la auditoría**

En la sección de la fase B4', agrega:

```markdown
**Regla aprendida (auditoría 2026-08-04):** en este proyecto RLS es lo único que
limita las escrituras del cliente, y **RLS no tiene granularidad de columna**.
Donde un trigger "corrige" una columna, revisa qué OTRAS columnas puede escribir
el cliente — así se escapó `orders.code`, que permitía dejar el checkout
inoperativo. Las columnas escribibles se controlan con `grant insert (col, ...)`,
no con políticas.
```

- [ ] **Step 4: Actualizar la cola de trabajo**

Marca como hechos los ítems cerrados por este plan y deja los que siguen abiertos: revocar el PAT de Supabase, subir los PDFs premium reales, reemplazar los 2 reportes de ejemplo, el runbook de facturación manual, y la consulta al contador sobre cobrar a cuenta personal facturando como SAC.

- [ ] **Step 5: Commit**

```bash
npm run format
git add web/app/CLAUDE.md
git commit -m "docs: reconcile CLAUDE.md with the real payment state and the new approval procedure"
```

---

## Notas de verificación final

Antes de dar el trabajo por terminado, corre y **lee la salida** de:

```
npm test
npm run lint
npm run build
node scripts/verify-supabase.mjs
node scripts/verify-deposit-flow.mjs <email1> <pass1> <email2> <pass2>
node scripts/test-download-url.mjs <email1> <pass1> seguimiento-trimestral-educacion
```

Y comprueba a mano estas cinco, que son los criterios de éxito del spec:

1. Un intento de insertar un `code` elegido por el cliente es rechazado.
2. Aprobar dos veces el mismo pedido falla; aprobar con el monto equivocado falla.
3. Aprobar anual y mensual para el mismo usuario **suma** ambos periodos.
4. Un reporte con `published_at = null` no se puede descargar ni siendo suscriptor activo.
5. El registro de un usuario **nuevo** crea exactamente una organización y un perfil.

**Recordatorio:** la cuestión abierta no técnica sigue viva — la cuenta bancaria está a nombre de una persona natural y la factura la emite Servicios Inmerge SAC. Consultar con el contador.
