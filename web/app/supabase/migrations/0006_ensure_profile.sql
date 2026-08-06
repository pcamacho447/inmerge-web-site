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
