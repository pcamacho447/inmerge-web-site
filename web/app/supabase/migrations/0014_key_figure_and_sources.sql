-- 0014: la cifra clave y las fuentes de cada reporte.
--
-- Las tres son ANULABLES a propósito: un reporte sin cifra clave sigue siendo
-- un reporte válido, y la página simplemente no renderiza esa sección. Nada se
-- rompe por no tenerla.
--
-- `sources` es jsonb y no dos arreglos paralelos (nombres[] + urls[]) para que
-- el nombre y su enlace no puedan desalinearse: un desfase de un elemento
-- atribuiría cada cifra a la fuente equivocada, que en un sitio cuyo argumento
-- entero es "compruébalo" es peor que no tener fuentes.
-- Forma: [{"nombre": "...", "url": "..."}] — `url` puede ser null.

alter table public.reports
  add column if not exists key_figure text,
  add column if not exists key_figure_label text,
  add column if not exists sources jsonb;

-- Un arreglo o nada. Un objeto suelto o una cadena harían que SourceList.jsx
-- iterara sobre las claves y renderizara basura en vez de fallar.
alter table public.reports
  drop constraint if exists reports_sources_is_array;
alter table public.reports
  add constraint reports_sources_is_array
  check (sources is null or jsonb_typeof(sources) = 'array');

comment on column public.reports.key_figure is
  'La cifra tal como se muestra, ya formateada: "34.9%", "S/ 620", "97 de cada 100".';
comment on column public.reports.key_figure_label is
  'Qué es esa cifra, en una frase que se lee debajo del número.';
comment on column public.reports.sources is
  'Arreglo [{nombre, url}]. url puede ser null cuando la fuente no tiene enlace público.';
