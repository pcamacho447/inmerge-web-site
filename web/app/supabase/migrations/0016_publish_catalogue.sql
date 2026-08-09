-- 0016: publicar el catálogo.
--
-- Se ejecuta DESPUÉS de scripts/upload-report-files.mjs, a propósito: publicar
-- una entrada sin archivo deja un botón "Descargar" que falla con 404, que es
-- exactamente la deshonestidad que este plan viene a arreglar.
--
-- La condición `file_path is not null` no es decorativa: si la subida de algún
-- PDF falló, esa entrada NO se publica y el resto sí. El catálogo queda más
-- corto pero íntegro, en vez de completo y roto.

update public.reports
set published_at = now()
where published_at is null
  and file_path is not null;
