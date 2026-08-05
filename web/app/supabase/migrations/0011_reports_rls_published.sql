-- 0009 filtró por published_at solo en useReports.js (cliente) y revocó el
-- SELECT de tabla de `file_path` columna por columna. Pero la RLS policy
-- original de 0001 ("reports_select_all" using (true)) seguía abierta para
-- TODAS las demás columnas: title, summary, tag, price_pen, cover_image_path,
-- published_at. Un POST directo a /rest/v1/reports con el anon key — que ya
-- viaja en el bundle del front — se salta el filtro de useReports.js sin
-- esfuerzo y ve un borrador o un reporte con fecha futura igual. "Ocultarlo en
-- el componente" no es lo mismo que "no servirlo si lo piden": se mueve el
-- filtro a la policy, que ninguna vía de acceso puede esquivar.
drop policy if exists "reports_select_all" on public.reports;

create policy "reports_select_all" on public.reports for select
  using (published_at is not null and published_at <= now());
