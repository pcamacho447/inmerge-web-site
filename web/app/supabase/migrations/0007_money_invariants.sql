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
