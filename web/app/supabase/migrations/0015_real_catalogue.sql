-- 0015: el catálogo real.
--
-- Las 7 filas que había eran inventadas ("Ejecución presupuestal regional
-- 2025", "La Libertad", "Ministerio de Defensa"): ninguna correspondía a un
-- informe existente y ninguna tenía file_path. No se preservan sus slugs — no
-- se publicaron nunca en ninguna parte, así que no hay enlace que romper.
--
-- Las cinco entradas nuevas nacen DESPUBLICADAS (published_at null). La
-- migración 0016 las publica, una por una, solo después de que su file_path
-- apunte a un PDF que existe en Storage. has_access() (0013) exige publicación,
-- así que una entrada despublicada no es descargable ni por un usuario con
-- sesión — que es justo lo que queremos mientras no haya archivo.
--
-- Nota de historial: la primera versión de esta migración (aplicada tal
-- cual a esta base de datos) no podía hacer el DELETE simple de abajo,
-- porque dos de las siete filas viejas tenían filas de PRUEBA en
-- `purchases`/`orders` referenciando su id sin ON DELETE CASCADE, y esa
-- versión las esquivó con un UPDATE en el sitio. Esas filas de prueba se
-- limpiaron por separado (autorizado por el dueño del proyecto — eran
-- artefactos de la verificación de pago B3/B4, sin dinero real), lo que deja
-- este DELETE simple como la migración correcta para cualquier base nueva:
-- en una base fresca no existen esas filas de prueba (0001/0002 no las
-- siembran), así que el DELETE de las 7 filas nunca choca con una FK.

begin;

delete from public.reports
where slug in (
  'ejecucion-presupuestal-regional-2025',
  'gasto-publico-la-libertad',
  'gobiernos-provinciales-distritales',
  'gasto-ministerio-defensa',
  'proyectos-inversion-publica-estancados',
  'radiografia-contratistas-infraestructura',
  'seguimiento-trimestral-educacion'
);

-- `on conflict (slug) do nothing`: si esta migración se corriera dos veces
-- sobre la misma base (por ejemplo, un re-run manual accidental), el
-- segundo INSERT no debe reventar por la unicidad de slug. El DELETE de
-- arriba ya es idempotente por sí mismo (borra si existe, no hace nada si
-- no); esto solo iguala esa propiedad en el INSERT.
insert into public.reports (slug, title, summary, tier, key_figure, key_figure_label, sources, published_at)
values
  (
    'un-estado-tres-oficios',
    'Un Estado, tres oficios',
    'El gasto público peruano por nivel de gobierno (2018-2025). El Gobierno Nacional administra la deuda, los regionales son la planilla del Estado, y los locales son el constructor: la mitad de cada sol municipal se va a obra.',
    'free',
    '50.5%',
    'del gasto de los gobiernos locales es inversión: la mitad de cada sol municipal se va a obra.',
    '[{"nombre": "SIAF-SP, Ministerio de Economía y Finanzas", "url": "https://www.mef.gob.pe/es/portal-de-transparencia-economica"}]'::jsonb,
    null
  ),
  (
    'de-donde-viene-la-plata',
    'De dónde viene la plata',
    'La recaudación propia del Estado peruano (2018-2025). Fuera de los impuestos que recauda la SUNAT, el mayor recurso propio del Estado no es un impuesto ni una renta: es deuda.',
    'free',
    '34.9%',
    'de los recursos propios del Estado son deuda, no impuestos ni canon.',
    '[{"nombre": "SIAF-SP, Ministerio de Economía y Finanzas", "url": "https://www.mef.gob.pe/es/portal-de-transparencia-economica"}]'::jsonb,
    null
  ),
  (
    'en-que-gasta-el-estado-central',
    'En qué gasta el Estado central',
    'La estructura del gasto por ministerio (Gobierno Nacional, 2018-2025). No hay dos ministerios que gasten igual: clasificados por su componente económico dominante, los 19 pliegos forman cinco personalidades fiscales.',
    'free',
    '97 de cada 100',
    'soles que el Ministerio del Interior destina a gasto corriente. Transportes destina 36.',
    '[{"nombre": "SIAF-SP, Ministerio de Economía y Finanzas", "url": "https://www.mef.gob.pe/es/portal-de-transparencia-economica"}]'::jsonb,
    null
  ),
  (
    'en-que-gasta-la-lima-municipal',
    'En qué gasta la Lima municipal',
    'La estructura del gasto de sus gobiernos distritales (2018-2025). Los 48 municipios distritales de Lima y Callao devengaron S/ 34,921 millones, y esa masa no se reparte al azar: su estructura sigue al dinero que reciben.',
    'free',
    '82.6%',
    'del gasto de los municipios distritales de Lima es corriente. Solo el 17% es inversión.',
    '[{"nombre": "SIAF-SP, Ministerio de Economía y Finanzas", "url": "https://www.mef.gob.pe/es/portal-de-transparencia-economica"}]'::jsonb,
    null
  ),
  (
    'tres-limas-fiscales',
    'Tres Limas fiscales',
    'Gasto e ingreso municipal de Lima Metropolitana y Callao (2018-2025). Lima no tiene una fiscalidad municipal, tiene tres: un centro que vive de su predial, una periferia que depende del FONCOMUN, y un Callao que vive de la renta del puerto.',
    'free',
    'S/ 620',
    'gasta al año por habitante el distrito típico de Lima y Callao, no los S/ 1,077 del promedio.',
    '[{"nombre": "SIAF-SP, Ministerio de Economía y Finanzas", "url": "https://www.mef.gob.pe/es/portal-de-transparencia-economica"}, {"nombre": "Población proyectada 2018-2026, INEI", "url": "https://www.inei.gob.pe/"}]'::jsonb,
    null
  )
on conflict (slug) do nothing;

commit;
