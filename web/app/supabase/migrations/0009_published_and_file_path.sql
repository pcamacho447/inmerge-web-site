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
