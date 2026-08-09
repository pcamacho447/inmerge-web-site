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
-- Dos de las siete filas viejas ('seguimiento-trimestral-educacion' y
-- 'radiografia-contratistas-infraestructura') tienen filas de PRUEBA en
-- `purchases` (0001) y `orders` (0003) que referencian su id sin ON DELETE
-- CASCADE. Este plan no toca la capa de pago dormida, así que en vez de
-- borrar esas dos filas se las UPDATEa en el sitio: mismo id, contenido
-- nuevo. La referencia de la fila de prueba sigue siendo válida (apunta a un
-- reporte que existe), y ni `purchases` ni `orders` se tocan. Las otras
-- cinco filas viejas no tienen referencias y se borran normalmente.

begin;

-- Las dos filas con referencias de prueba se reescriben en el sitio en vez
-- de borrarse: mismo id, contenido del catálogo real.
update public.reports set
  slug = 'un-estado-tres-oficios',
  title = 'Un Estado, tres oficios',
  summary = 'El gasto público peruano por nivel de gobierno (2018-2025). El Gobierno Nacional administra la deuda, los regionales son la planilla del Estado, y los locales son el constructor: la mitad de cada sol municipal se va a obra.',
  tier = 'free',
  price_pen = null,
  file_path = null,
  published_at = null,
  key_figure = '50.5%',
  key_figure_label = 'del gasto de los gobiernos locales es inversión: la mitad de cada sol municipal se va a obra.',
  sources = '[{"nombre": "SIAF-SP, Ministerio de Economía y Finanzas", "url": "https://www.mef.gob.pe/es/portal-de-transparencia-economica"}]'::jsonb
where id = '90bad7bc-093a-469f-b4b5-a4fb081d4f9f'; -- era 'seguimiento-trimestral-educacion'

update public.reports set
  slug = 'de-donde-viene-la-plata',
  title = 'De dónde viene la plata',
  summary = 'La recaudación propia del Estado peruano (2018-2025). Fuera de los impuestos que recauda la SUNAT, el mayor recurso propio del Estado no es un impuesto ni una renta: es deuda.',
  tier = 'free',
  price_pen = null,
  file_path = null,
  published_at = null,
  key_figure = '34.9%',
  key_figure_label = 'de los recursos propios del Estado son deuda, no impuestos ni canon.',
  sources = '[{"nombre": "SIAF-SP, Ministerio de Economía y Finanzas", "url": "https://www.mef.gob.pe/es/portal-de-transparencia-economica"}]'::jsonb
where id = '0b0f0112-32b3-4ebd-a013-9e3bc01dfb43'; -- era 'radiografia-contratistas-infraestructura'

-- Las cinco filas viejas sin referencias se borran normalmente.
delete from public.reports
where slug in (
  'ejecucion-presupuestal-regional-2025',
  'gasto-publico-la-libertad',
  'gobiernos-provinciales-distritales',
  'gasto-ministerio-defensa',
  'proyectos-inversion-publica-estancados'
);

-- Las tres entradas restantes del catálogo real se insertan de cero.
insert into public.reports (slug, title, summary, tier, key_figure, key_figure_label, sources, published_at)
values
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
  );

commit;
