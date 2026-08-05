-- Corrige un hallazgo de code review sobre la migración 0006 (ya aplicada, no
-- se edita en el lugar): el chequeo de sesión zombi del lado del cliente
-- (auth.jsx) esperaba error.code === '42501', pero ensure_profile() nunca
-- produce ese código. auth.uid() lee el `sub` del JWT directamente, sin
-- consultar ninguna tabla, así que un usuario borrado (o un proyecto
-- reconstruido) que todavía tiene un JWT sin expirar pasa el
-- `if v_uid is null` sin problema: v_uid no es null, solo no tiene fila en
-- auth.users. La función entonces encontraba v_meta = null, v_full_name = '',
-- y hacía `return false` sin levantar ningún error — la detección de sesión
-- zombi era código muerto: el cliente veía éxito (sin error) y trataba la
-- sesión como válida.
--
-- Fix: `select ... into strict ...` hace que Postgres levante P0002
-- (no_data_found) automáticamente cuando auth.users no tiene fila para
-- v_uid. Esa sí es una señal real y distinguible — el cliente (auth.jsx)
-- ahora revisa error.code === 'P0002' y cierra la sesión cuando la ve.
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
$$;
