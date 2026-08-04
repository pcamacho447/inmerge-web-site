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
