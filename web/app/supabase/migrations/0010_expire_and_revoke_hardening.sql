-- Fix round 1 sobre 0007: dos hallazgos "Important" de revisión.

-- HALLAZGO 1: un pedido que vence estando 'pending' se vuelve una trampa de
-- plata. 0007 agregó expires_at, el rechazo por vencimiento en approve_order()
-- y el índice orders_one_pending_per_item — pero nada pasa un pedido vencido
-- de 'pending' a 'expired'. createOrder() (src/lib/orders.js) reutiliza
-- cualquier fila 'pending' sin filtrar por vencimiento, así que le sigue
-- devolviendo al cliente el mismo código muerto (con los datos bancarios) día
-- 12, día 20, etc. Si deposita, approve_order() rechaza por vencido, y un
-- insert directo de un pedido nuevo choca contra orders_one_pending_per_item:
-- el cliente queda sin salida sin que el operador intervenga.
--
-- Arreglo: una función SECURITY DEFINER que el propio cliente puede llamar,
-- acotada a auth.uid() — solo pasa a 'expired' pedidos PENDING Y VENCIDOS del
-- usuario que la invoca. El cliente no tiene grant de UPDATE sobre `orders`
-- (0005 lo revocó), pero esta función sí puede escribir porque corre con los
-- privilegios de su dueño, no los del invocador; y como solo toca
-- `user_id = auth.uid()` y solo pedidos ya vencidos, no hay forma de que un
-- usuario expire pedidos ajenos ni pedidos todavía vigentes.
create or replace function public.expire_own_stale_orders()
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_rows int;
begin
  if v_uid is null then
    raise exception 'expire_own_stale_orders() requiere una sesión';
  end if;

  update public.orders
  set status = 'expired'
  where user_id = v_uid
    and status = 'pending'
    and expires_at is not null
    and expires_at < now();

  get diagnostics v_rows = row_count;
  return v_rows;
end;
$$;

revoke execute on function public.expire_own_stale_orders() from public, anon;
grant execute on function public.expire_own_stale_orders() to authenticated;

-- HALLAZGO 2: revoke_order() (0007) hacía el UPDATE de purchases/subscriptions
-- sin comprobar cuántas filas tocó, a diferencia de approve_order() ocho
-- líneas antes, que sí lo hace con `get diagnostics`. Si la fila no existe (la
-- suscripción nunca se creó, o la compra ya estaba 'refunded' a mano), el
-- UPDATE toca cero filas, el pedido igual pasa a 'rejected', y la función
-- devuelve "Revertido — …" como si de verdad hubiera revertido algo. Es el
-- mismo patrón del defecto de auditoría original (OK alegre, nada escrito),
-- reintroducido en el camino de deshacer.
create or replace function public.revoke_order(p_code text, p_reason text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  o public.orders;
  v_period_months int;
  v_email text;
  v_rows int;
begin
  select * into o from public.orders where code = upper(trim(p_code)) for update;
  if not found then
    raise exception 'El pedido % no existe', p_code;
  end if;
  if o.status <> 'approved' then
    raise exception 'El pedido % no está aprobado (está en "%")', o.code, o.status;
  end if;

  select email into v_email from auth.users where id = o.user_id;

  if o.kind = 'report' then
    -- 'refunded' ya está permitido por purchases_status_check.
    update public.purchases set status = 'refunded'
    where user_id = o.user_id and report_id = o.report_id and status = 'paid';

    get diagnostics v_rows = row_count;
    if v_rows = 0 then
      raise exception 'No se encontró una compra pagada de % para revertir en el pedido %. Revísalo a mano antes de continuar.', v_email, o.code;
    end if;
  else
    -- subscriptions_status_check NO admite 'refunded', así que el retroceso es
    -- por fecha: se resta el periodo que esta aprobación había otorgado.
    select period_months into v_period_months from public.plans where id = o.plan;
    update public.subscriptions
    set current_period_end = current_period_end - (v_period_months * interval '1 month'),
        updated_at = now()
    where user_id = o.user_id;

    get diagnostics v_rows = row_count;
    if v_rows = 0 then
      raise exception 'No se encontró una suscripción de % para revertir en el pedido %. Revísalo a mano antes de continuar.', v_email, o.code;
    end if;
  end if;

  update public.orders set status = 'rejected', notes = p_reason, approved_at = null where id = o.id;
  return format('Revertido — %s: %s', o.code, p_reason);
end;
$$;

-- create or replace conserva el ACL: la firma no cambió (text, text), así que
-- no hace falta el DROP + re-grant que sí necesitó approve_order en 0007.
revoke execute on function public.revoke_order(text, text) from public, anon, authenticated;
grant execute on function public.revoke_order(text, text) to service_role;
