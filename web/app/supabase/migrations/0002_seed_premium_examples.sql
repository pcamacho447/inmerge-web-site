-- Illustrative premium report examples — placeholder content until the real
-- premium editorial line is decided (see CLAUDE.md "Business model"). These
-- previously lived only in src/data/content.js, which defeated the point of
-- moving the catalog to Supabase (Phase B2) — now Supabase is genuinely the
-- only source. Swap titles/summaries/price freely once real content exists.
insert into public.reports (slug, tag, title, summary, tier, price_pen) values
  ('seguimiento-trimestral-educacion', 'SERIE EJECUTIVA', 'Seguimiento trimestral: gasto en Educación por región', 'Tracker actualizado cada trimestre — la misma metodología de los reportes públicos, con la cadencia de una suscripción.', 'premium', 180),
  ('radiografia-contratistas-infraestructura', 'CONTRATISTAS', 'Radiografía de contratistas: quién gana las licitaciones de infraestructura', 'Análisis a nivel de contratista y entidad ejecutora — más granular que el corte regional de los reportes públicos.', 'premium', 180);
