-- Los reportes dejan de venderse: son gratuitos a cambio de crear una cuenta,
-- y el ingreso viene de cotizaciones de consultoría. El modelo de derechos se
-- colapsa en consecuencia.
--
-- Antes había tres vías: reporte gratuito, compra individual, o suscripción
-- vigente. Ahora hay una sola pregunta: ¿hay sesión y el reporte está publicado?
--
-- Esto NO es cosmético. get-report-download-url llama a has_access() para
-- decidir si entrega el archivo, así que sin este cambio los reportes marcados
-- `tier = 'premium'` seguirían negando la descarga aunque ya no cuesten nada.
--
-- `p_user_id is not null` es la comprobación de sesión: la Edge Function solo
-- llega hasta acá después de validar el token y pasa el id del usuario real.
--
-- Las ramas de compra y suscripción se ELIMINAN en vez de dejarse escritas e
-- inalcanzables. Una rama muerta que nadie puede alcanzar miente sobre lo que
-- el sistema hace; si algún día se vuelve a cobrar, la versión anterior está
-- en 0009_published_and_file_path.sql y en el historial de git.
--
-- La columna `reports.tier` se conserva: permite volver a distinguir sin una
-- migración de datos, pero deja de gatear el acceso.
create or replace function public.has_access(p_user_id uuid, p_report_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select p_user_id is not null
    and exists (
      select 1
      from public.reports r
      where r.id = p_report_id
        and r.published_at is not null
        and r.published_at <= now()
    );
$$;

revoke execute on function public.has_access(uuid, uuid) from public, anon, authenticated;
grant execute on function public.has_access(uuid, uuid) to service_role;
