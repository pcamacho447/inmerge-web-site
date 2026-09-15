drop extension if exists "pg_net";

create sequence "public"."orders_code_seq";

revoke insert on table "public"."profiles" from "anon";

revoke insert on table "public"."profiles" from "authenticated";


  create table "public"."orders" (
    "id" uuid not null default gen_random_uuid(),
    "code" text not null default ((('INM-'::text || to_char(now(), 'YYYY'::text)) || '-'::text) || lpad((nextval('public.orders_code_seq'::regclass))::text, 4, '0'::text)),
    "user_id" uuid not null,
    "kind" text not null,
    "report_id" uuid,
    "plan" text,
    "amount_pen" numeric(10,2) not null default 0,
    "method" text not null,
    "status" text not null default 'pending'::text,
    "notes" text,
    "approved_at" timestamp with time zone,
    "created_at" timestamp with time zone not null default now(),
    "expires_at" timestamp with time zone
      );


alter table "public"."orders" enable row level security;


  create table "public"."organizations" (
    "id" uuid not null default gen_random_uuid(),
    "billing_type" text not null,
    "legal_name" text not null,
    "tax_id" text,
    "billing_email" text not null,
    "billing_address" text,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."organizations" enable row level security;


  create table "public"."plans" (
    "id" text not null,
    "name" text not null,
    "price_pen" numeric(10,2) not null,
    "period_months" integer not null
      );


alter table "public"."plans" enable row level security;


  create table "public"."purchases" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "report_id" uuid not null,
    "amount_pen" numeric(10,2) not null,
    "culqi_charge_id" text,
    "status" text not null,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."purchases" enable row level security;


  create table "public"."reports" (
    "id" uuid not null default gen_random_uuid(),
    "slug" text not null,
    "tag" text,
    "title" text not null,
    "summary" text,
    "tier" text not null default 'free'::text,
    "price_pen" numeric(10,2),
    "cover_image_path" text,
    "file_path" text,
    "published_at" timestamp with time zone,
    "created_at" timestamp with time zone not null default now(),
    "key_figure" text,
    "key_figure_label" text,
    "sources" jsonb
      );


alter table "public"."reports" enable row level security;


  create table "public"."subscriptions" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "plan" text not null,
    "status" text not null,
    "culqi_subscription_id" text,
    "current_period_start" timestamp with time zone,
    "current_period_end" timestamp with time zone,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."subscriptions" enable row level security;

alter table "public"."profiles" add column "organization_id" uuid;

CREATE UNIQUE INDEX orders_code_key ON public.orders USING btree (code);

CREATE UNIQUE INDEX orders_one_pending_per_item ON public.orders USING btree (user_id, kind, COALESCE((report_id)::text, plan)) WHERE (status = 'pending'::text);

CREATE UNIQUE INDEX orders_pkey ON public.orders USING btree (id);

CREATE INDEX orders_status_idx ON public.orders USING btree (status);

CREATE INDEX orders_user_id_idx ON public.orders USING btree (user_id);

CREATE UNIQUE INDEX organizations_pkey ON public.organizations USING btree (id);

CREATE UNIQUE INDEX plans_pkey ON public.plans USING btree (id);

CREATE UNIQUE INDEX purchases_culqi_charge_id_key ON public.purchases USING btree (culqi_charge_id);

CREATE UNIQUE INDEX purchases_pkey ON public.purchases USING btree (id);

CREATE INDEX purchases_report_id_idx ON public.purchases USING btree (report_id);

CREATE INDEX purchases_user_id_idx ON public.purchases USING btree (user_id);

CREATE UNIQUE INDEX purchases_user_report_paid ON public.purchases USING btree (user_id, report_id) WHERE (status = 'paid'::text);

CREATE UNIQUE INDEX reports_pkey ON public.reports USING btree (id);

CREATE UNIQUE INDEX reports_slug_key ON public.reports USING btree (slug);

CREATE UNIQUE INDEX subscriptions_culqi_subscription_id_key ON public.subscriptions USING btree (culqi_subscription_id);

CREATE UNIQUE INDEX subscriptions_pkey ON public.subscriptions USING btree (id);

CREATE INDEX subscriptions_user_id_idx ON public.subscriptions USING btree (user_id);

CREATE UNIQUE INDEX subscriptions_user_unique ON public.subscriptions USING btree (user_id);

alter table "public"."orders" add constraint "orders_pkey" PRIMARY KEY using index "orders_pkey";

alter table "public"."organizations" add constraint "organizations_pkey" PRIMARY KEY using index "organizations_pkey";

alter table "public"."plans" add constraint "plans_pkey" PRIMARY KEY using index "plans_pkey";

alter table "public"."purchases" add constraint "purchases_pkey" PRIMARY KEY using index "purchases_pkey";

alter table "public"."reports" add constraint "reports_pkey" PRIMARY KEY using index "reports_pkey";

alter table "public"."subscriptions" add constraint "subscriptions_pkey" PRIMARY KEY using index "subscriptions_pkey";

alter table "public"."orders" add constraint "orders_code_key" UNIQUE using index "orders_code_key";

alter table "public"."orders" add constraint "orders_kind_check" CHECK ((kind = ANY (ARRAY['report'::text, 'subscription'::text]))) not valid;

alter table "public"."orders" validate constraint "orders_kind_check";

alter table "public"."orders" add constraint "orders_kind_target" CHECK ((((kind = 'report'::text) AND (report_id IS NOT NULL) AND (plan IS NULL)) OR ((kind = 'subscription'::text) AND (plan IS NOT NULL) AND (report_id IS NULL)))) not valid;

alter table "public"."orders" validate constraint "orders_kind_target";

alter table "public"."orders" add constraint "orders_method_check" CHECK ((method = ANY (ARRAY['deposit'::text, 'yape_plin'::text]))) not valid;

alter table "public"."orders" validate constraint "orders_method_check";

alter table "public"."orders" add constraint "orders_plan_fkey" FOREIGN KEY (plan) REFERENCES public.plans(id) not valid;

alter table "public"."orders" validate constraint "orders_plan_fkey";

alter table "public"."orders" add constraint "orders_report_id_fkey" FOREIGN KEY (report_id) REFERENCES public.reports(id) not valid;

alter table "public"."orders" validate constraint "orders_report_id_fkey";

alter table "public"."orders" add constraint "orders_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'expired'::text]))) not valid;

alter table "public"."orders" validate constraint "orders_status_check";

alter table "public"."orders" add constraint "orders_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."orders" validate constraint "orders_user_id_fkey";

alter table "public"."organizations" add constraint "organizations_billing_type_check" CHECK ((billing_type = ANY (ARRAY['persona_natural'::text, 'empresa'::text]))) not valid;

alter table "public"."organizations" validate constraint "organizations_billing_type_check";

alter table "public"."plans" add constraint "plans_id_check" CHECK ((id = ANY (ARRAY['monthly'::text, 'annual'::text]))) not valid;

alter table "public"."plans" validate constraint "plans_id_check";

alter table "public"."plans" add constraint "plans_period_months_check" CHECK ((period_months > 0)) not valid;

alter table "public"."plans" validate constraint "plans_period_months_check";

alter table "public"."profiles" add constraint "profiles_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.organizations(id) not valid;

alter table "public"."profiles" validate constraint "profiles_organization_id_fkey";

alter table "public"."purchases" add constraint "purchases_culqi_charge_id_key" UNIQUE using index "purchases_culqi_charge_id_key";

alter table "public"."purchases" add constraint "purchases_report_id_fkey" FOREIGN KEY (report_id) REFERENCES public.reports(id) not valid;

alter table "public"."purchases" validate constraint "purchases_report_id_fkey";

alter table "public"."purchases" add constraint "purchases_status_check" CHECK ((status = ANY (ARRAY['paid'::text, 'refunded'::text, 'failed'::text]))) not valid;

alter table "public"."purchases" validate constraint "purchases_status_check";

alter table "public"."purchases" add constraint "purchases_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."purchases" validate constraint "purchases_user_id_fkey";

alter table "public"."reports" add constraint "reports_slug_key" UNIQUE using index "reports_slug_key";

alter table "public"."reports" add constraint "reports_sources_is_array" CHECK (((sources IS NULL) OR (jsonb_typeof(sources) = 'array'::text))) not valid;

alter table "public"."reports" validate constraint "reports_sources_is_array";

alter table "public"."reports" add constraint "reports_tier_check" CHECK ((tier = ANY (ARRAY['free'::text, 'premium'::text]))) not valid;

alter table "public"."reports" validate constraint "reports_tier_check";

alter table "public"."subscriptions" add constraint "subscriptions_culqi_subscription_id_key" UNIQUE using index "subscriptions_culqi_subscription_id_key";

alter table "public"."subscriptions" add constraint "subscriptions_plan_check" CHECK ((plan = ANY (ARRAY['monthly'::text, 'annual'::text]))) not valid;

alter table "public"."subscriptions" validate constraint "subscriptions_plan_check";

alter table "public"."subscriptions" add constraint "subscriptions_status_check" CHECK ((status = ANY (ARRAY['active'::text, 'past_due'::text, 'canceled'::text, 'incomplete'::text]))) not valid;

alter table "public"."subscriptions" validate constraint "subscriptions_status_check";

alter table "public"."subscriptions" add constraint "subscriptions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."subscriptions" validate constraint "subscriptions_user_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.approve_order(p_code text, p_amount_received numeric)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.ensure_profile()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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

  -- INTO STRICT: sin fila en auth.users para v_uid, Postgres levanta P0002
  -- (no_data_found) en vez de seguir con v_meta/v_email en null. Esa es la
  -- sesión zombi real (usuario borrado o proyecto reconstruido).
  select raw_user_meta_data, email into strict v_meta, v_email from auth.users where id = v_uid;
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
$function$
;

CREATE OR REPLACE FUNCTION public.expire_own_stale_orders()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.has_access(p_user_id uuid, p_report_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select p_user_id is not null
    and exists (
      select 1
      from public.reports r
      where r.id = p_report_id
        and r.published_at is not null
        and r.published_at <= now()
    );
$function$
;

CREATE OR REPLACE FUNCTION public.orders_set_amount()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.preview_order(p_code text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.reject_order(p_code text, p_reason text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.revoke_order(p_code text, p_reason text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.audit_team_activity_trigger()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_action TEXT;
  v_entity_type TEXT := TG_TABLE_NAME;
  v_entity_id UUID;
  v_details JSONB := '{}'::jsonb;
  v_user_id UUID := auth.uid();
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_action := UPPER(TG_TABLE_NAME) || '_INSERTED';
    v_entity_id := NEW.id;
    v_details := jsonb_build_object(
      'op', 'INSERT',
      'new', to_jsonb(NEW) - 'encrypted_password'
    );
  ELSIF TG_OP = 'UPDATE' THEN
    v_action := UPPER(TG_TABLE_NAME) || '_UPDATED';
    v_entity_id := NEW.id;
    v_details := jsonb_build_object(
      'op', 'UPDATE',
      'old', to_jsonb(OLD) - 'encrypted_password',
      'new', to_jsonb(NEW) - 'encrypted_password'
    );
  ELSIF TG_OP = 'DELETE' THEN
    v_action := UPPER(TG_TABLE_NAME) || '_DELETED';
    v_entity_id := OLD.id;
    v_details := jsonb_build_object(
      'op', 'DELETE',
      'old', to_jsonb(OLD) - 'encrypted_password'
    );
  END IF;

  INSERT INTO public.team_activity_logs (user_id, action, entity_type, entity_id, details)
  VALUES (v_user_id, v_action, v_entity_type, v_entity_id, v_details);

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.check_profile_role_update()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Si el rol está cambiando y el usuario actual NO es admin ni el trigger del sistema
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF NOT public.is_admin() THEN
      RAISE EXCEPTION 'Operación denegada: Solo los administradores pueden modificar roles de usuario.';
    END IF;
  END IF;

  NEW.updated_at = now();
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_staff_member(p_email text, p_password text, p_full_name text, p_role text DEFAULT 'auditor'::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth', 'extensions'
AS $function$
DECLARE
  v_user_id UUID := gen_random_uuid();
BEGIN
  -- Verificar que el invocador sea administrador autenticado
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Acceso denegado: Se requiere rol de administrador para dar de alta miembros del equipo.';
  END IF;

  IF p_role NOT IN ('admin', 'auditor', 'engineer') THEN
    RAISE EXCEPTION 'Rol inválido para miembro de equipo. Debe ser admin, auditor o engineer.';
  END IF;

  -- Si el usuario ya existe en auth.users, actualizamos su rol y perfil
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = p_email) THEN
    SELECT id INTO v_user_id FROM auth.users WHERE email = p_email;
    UPDATE public.profiles
    SET role = p_role, full_name = p_full_name, updated_at = now()
    WHERE id = v_user_id;

    -- Registrar auditoría
    INSERT INTO public.team_activity_logs (user_id, action, entity_type, entity_id, details)
    VALUES (
      auth.uid(),
      'STAFF_ROLE_UPDATED',
      'profile',
      v_user_id,
      jsonb_build_object('email', p_email, 'full_name', p_full_name, 'role', p_role)
    );

    RETURN v_user_id;
  END IF;

  -- Insertar usuario nuevo en auth.users compatible con GoTrue
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    role,
    aud,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    p_email,
    crypt(p_password, gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', p_full_name, 'role', p_role),
    now(),
    now(),
    'authenticated',
    'authenticated',
    '',
    '',
    '',
    ''
  );

  -- Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (v_user_id, p_email, p_full_name, p_role)
  ON CONFLICT (id) DO UPDATE
  SET role = p_role, full_name = p_full_name, updated_at = now();

  -- Registrar en bitácora de auditoría
  INSERT INTO public.team_activity_logs (user_id, action, entity_type, entity_id, details)
  VALUES (
    auth.uid(),
    'STAFF_MEMBER_CREATED',
    'profile',
    v_user_id,
    jsonb_build_object('email', p_email, 'full_name', p_full_name, 'role', p_role)
  );

  RETURN v_user_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
      new.id,
      new.email,
      COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
      COALESCE(new.raw_user_meta_data->>'role', 'client')
    )
    ON CONFLICT (id) DO UPDATE
    SET
      email = EXCLUDED.email,
      updated_at = now();
    RETURN NEW;
  END;
  $function$
;

CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
    SELECT EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    );
  $function$
;

CREATE OR REPLACE FUNCTION public.is_staff()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
    SELECT EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'auditor', 'engineer')
    );
  $function$
;

grant references on table "public"."orders" to "anon";

grant select on table "public"."orders" to "anon";

grant trigger on table "public"."orders" to "anon";

grant references on table "public"."orders" to "authenticated";

grant select on table "public"."orders" to "authenticated";

grant trigger on table "public"."orders" to "authenticated";

grant delete on table "public"."orders" to "service_role";

grant insert on table "public"."orders" to "service_role";

grant references on table "public"."orders" to "service_role";

grant select on table "public"."orders" to "service_role";

grant trigger on table "public"."orders" to "service_role";

grant truncate on table "public"."orders" to "service_role";

grant update on table "public"."orders" to "service_role";

grant delete on table "public"."organizations" to "anon";

grant references on table "public"."organizations" to "anon";

grant select on table "public"."organizations" to "anon";

grant trigger on table "public"."organizations" to "anon";

grant truncate on table "public"."organizations" to "anon";

grant update on table "public"."organizations" to "anon";

grant delete on table "public"."organizations" to "authenticated";

grant references on table "public"."organizations" to "authenticated";

grant select on table "public"."organizations" to "authenticated";

grant trigger on table "public"."organizations" to "authenticated";

grant truncate on table "public"."organizations" to "authenticated";

grant update on table "public"."organizations" to "authenticated";

grant delete on table "public"."organizations" to "service_role";

grant insert on table "public"."organizations" to "service_role";

grant references on table "public"."organizations" to "service_role";

grant select on table "public"."organizations" to "service_role";

grant trigger on table "public"."organizations" to "service_role";

grant truncate on table "public"."organizations" to "service_role";

grant update on table "public"."organizations" to "service_role";

grant references on table "public"."plans" to "anon";

grant select on table "public"."plans" to "anon";

grant trigger on table "public"."plans" to "anon";

grant references on table "public"."plans" to "authenticated";

grant select on table "public"."plans" to "authenticated";

grant trigger on table "public"."plans" to "authenticated";

grant delete on table "public"."plans" to "service_role";

grant insert on table "public"."plans" to "service_role";

grant references on table "public"."plans" to "service_role";

grant select on table "public"."plans" to "service_role";

grant trigger on table "public"."plans" to "service_role";

grant truncate on table "public"."plans" to "service_role";

grant update on table "public"."plans" to "service_role";

grant references on table "public"."purchases" to "anon";

grant select on table "public"."purchases" to "anon";

grant trigger on table "public"."purchases" to "anon";

grant references on table "public"."purchases" to "authenticated";

grant select on table "public"."purchases" to "authenticated";

grant trigger on table "public"."purchases" to "authenticated";

grant delete on table "public"."purchases" to "service_role";

grant insert on table "public"."purchases" to "service_role";

grant references on table "public"."purchases" to "service_role";

grant select on table "public"."purchases" to "service_role";

grant trigger on table "public"."purchases" to "service_role";

grant truncate on table "public"."purchases" to "service_role";

grant update on table "public"."purchases" to "service_role";

grant references on table "public"."reports" to "anon";

grant trigger on table "public"."reports" to "anon";

grant references on table "public"."reports" to "authenticated";

grant trigger on table "public"."reports" to "authenticated";

grant delete on table "public"."reports" to "service_role";

grant insert on table "public"."reports" to "service_role";

grant references on table "public"."reports" to "service_role";

grant select on table "public"."reports" to "service_role";

grant trigger on table "public"."reports" to "service_role";

grant truncate on table "public"."reports" to "service_role";

grant update on table "public"."reports" to "service_role";

grant references on table "public"."subscriptions" to "anon";

grant select on table "public"."subscriptions" to "anon";

grant trigger on table "public"."subscriptions" to "anon";

grant references on table "public"."subscriptions" to "authenticated";

grant select on table "public"."subscriptions" to "authenticated";

grant trigger on table "public"."subscriptions" to "authenticated";

grant delete on table "public"."subscriptions" to "service_role";

grant insert on table "public"."subscriptions" to "service_role";

grant references on table "public"."subscriptions" to "service_role";

grant select on table "public"."subscriptions" to "service_role";

grant trigger on table "public"."subscriptions" to "service_role";

grant truncate on table "public"."subscriptions" to "service_role";

grant update on table "public"."subscriptions" to "service_role";


  create policy "orders_insert_own"
  on "public"."orders"
  as permissive
  for insert
  to public
with check (((auth.uid() = user_id) AND (status = 'pending'::text)));



  create policy "orders_select_own"
  on "public"."orders"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));



  create policy "organizations_select_own"
  on "public"."organizations"
  as permissive
  for select
  to public
using ((id IN ( SELECT profiles.organization_id
   FROM public.profiles
  WHERE (profiles.id = auth.uid()))));



  create policy "organizations_update_own"
  on "public"."organizations"
  as permissive
  for update
  to public
using ((id IN ( SELECT profiles.organization_id
   FROM public.profiles
  WHERE (profiles.id = auth.uid()))));



  create policy "plans_select_all"
  on "public"."plans"
  as permissive
  for select
  to public
using (true);



  create policy "purchases_select_own"
  on "public"."purchases"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));



  create policy "reports_select_all"
  on "public"."reports"
  as permissive
  for select
  to public
using (((published_at IS NOT NULL) AND (published_at <= now())));



  create policy "subscriptions_select_own"
  on "public"."subscriptions"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));


CREATE TRIGGER orders_set_amount_before_insert BEFORE INSERT ON public.orders FOR EACH ROW EXECUTE FUNCTION public.orders_set_amount();


