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
