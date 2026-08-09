# Plan B — Los reportes como portafolio (Fase 2 del rediseño)

> **Para agentes:** SUB-SKILL REQUERIDA: usa superpowers:subagent-driven-development (recomendado) o superpowers:executing-plans para implementar este plan tarea por tarea. Los pasos usan casillas (`- [ ]`) para llevar la cuenta.

**Meta:** Reemplazar el catálogo inventado por los cinco informes que existen de verdad, darle a cada uno una página propia e indexable con su cifra clave y sus fuentes a la vista, y publicar los tres diagramas Sankey sin exigir cuenta.

**Arquitectura:** Tres piezas nuevas y separadas. (1) Un *pipeline de build en Node* (`web/app/scripts/`) que convierte Markdown a PDF de marca, genera portadas PNG y extrae los datos de los Sankey — todo se ejecuta a mano antes del build de Vite y deja artefactos estáticos en `public/`. (2) Dos migraciones que agregan las columnas de la cifra clave y sustituyen las siete filas falsas por las cinco reales. (3) Una ruta nueva `/reportes/:slug` con su página, más el índice reconvertido en portafolio. Nada depende de la plataforma de hosting: el build produce estáticos que funcionan igual en S3, Vercel o cualquier CDN.

**Stack:** React 18, Vite 5, react-router-dom 6, Supabase (Postgres + Storage), Vitest 4 + jsdom, Playwright (nueva devDependency, solo para el pipeline), Plotly (nueva dependencia de runtime, solo para los Sankey).

---

## Contexto que el spec no tiene, verificado contra el disco el 2026-08-08

El spec `docs/superpowers/specs/2026-08-06-rediseno-portafolio-consultoria-design.md` es la fuente de la intención. Estos cinco hechos lo corrigen o lo completan; están comprobados, no supuestos.

1. **El spec se equivoca sobre el navegador headless.** Dice convertir los Markdown "con el navegador headless que el proyecto ya usa para verificación". **El proyecto no tiene ninguno.** Eso era el MCP de Playwright, una herramienta del asistente, no una dependencia del repo. Este plan instala Playwright como devDependency (Tarea 3).

2. **Las rutas de las figuras se reescriben con una regla trivial.** El spec advierte que `../../../figuras/…` no sobrevive al traslado. Verificado: hay **dos** convenciones (`../../../figuras/eda/` en 12 referencias, `../imagenes/` en 9) y **ninguna resuelve** desde `reportes/`. Pero **las 21 figuras existen todas en una sola carpeta plana**: `C:/papx/mef2026/mef_2026/deliverables/figuras/eda/`. Regla: descartar el directorio, quedarse con el nombre del archivo, resolver contra esa carpeta. Comprobado uno por uno: 21 de 21 existen.

3. **La extracción de los Sankey es viable y el ahorro es el prometido.** Cada HTML pesa 4.64 MB y su bloque `Plotly.newPlot(...)` mide **12.4 KB, 9.1 KB y 8.5 KB** respectivamente. Los tres juntos son ~30 KB frente a 14 MB.

4. **Los tres PDFs existentes ya están maquetados en la marca.** Tienen encabezado corrido con el título en versalitas + "REPORTE INMERGE", el rombo terracota junto al logotipo, "Consultoría en datos y estrategia / Lima, Perú" alineado a la derecha, una línea kicker en versalitas terracota, el título en Spectral, secciones numeradas en terracota con filete, cuerpo justificado en IBM Plex, y pie "Inmerge · El dato, a la vista." / "inmerge.pe". **Los dos PDFs convertidos deben reproducir ese layout**, no inventar uno. Es la referencia visual concreta que el spec pedía y no tenía.

5. **El catálogo vivo son 7 filas inventadas.** Verificado con `node scripts/verify-supabase.mjs`: ninguna corresponde a un informe en disco y ninguna tiene `file_path`. Como el Plan A hizo descargable todo reporte publicado, hoy `master` ofrece siete descargas que fallarían. No está desplegado, así que no le miente a nadie todavía.

## Los cinco informes reales

Esta tabla es la fuente de verdad del catálogo. Los títulos salen de la portada de cada PDF (**no** del nombre del archivo, que difiere), y las cifras clave están tomadas **literalmente** de los documentos — cada una es verificable buscándola en el texto.

| Slug | Título | Bajada | Origen | Sankey |
|---|---|---|---|---|
| `un-estado-tres-oficios` | Un Estado, tres oficios | El gasto público peruano por nivel de gobierno (2018-2025) | `informe_estructura_gasto_niveles_gobierno_2018_2025.pdf` | `anexo_interactivo_sankey_3niveles.html` |
| `de-donde-viene-la-plata` | De dónde viene la plata | La recaudación propia del Estado peruano (2018-2025) | `informe_recaudacion_propia_2018_2025.pdf` | `anexo_interactivo_sankey_ingreso.html` |
| `en-que-gasta-el-estado-central` | En qué gasta el Estado central | La estructura del gasto por ministerio (Gobierno Nacional, 2018-2025) | `informe_estructura_gasto_ministerial_2018_2025.pdf` | `anexo_interactivo_sankey.html` |
| `en-que-gasta-la-lima-municipal` | En qué gasta la Lima municipal | La estructura del gasto de sus gobiernos distritales (2018-2025) | `informe_estructura_gasto_lima_distrital_2018_2025.md` → PDF | — |
| `tres-limas-fiscales` | Tres Limas fiscales | Gasto e ingreso municipal de Lima Metropolitana y Callao (2018-2025) | `informe_fiscal_lima_distrital_2018_2025.md` → PDF | — |

**Cifras clave** (`key_figure` / `key_figure_label`), todas verbatim del documento:

| Slug | `key_figure` | `key_figure_label` |
|---|---|---|
| `un-estado-tres-oficios` | `50.5%` | `del gasto de los gobiernos locales es inversión: la mitad de cada sol municipal se va a obra.` |
| `de-donde-viene-la-plata` | `34.9%` | `de los recursos propios del Estado son deuda, no impuestos ni canon.` |
| `en-que-gasta-el-estado-central` | `97 de cada 100` | `soles que el Ministerio del Interior destina a gasto corriente. Transportes destina 36.` |
| `en-que-gasta-la-lima-municipal` | `82.6%` | `del gasto de los municipios distritales de Lima es corriente. Solo el 17% es inversión.` |
| `tres-limas-fiscales` | `S/ 620` | `gasta al año por habitante el distrito típico de Lima y Callao, no los S/ 1,077 del promedio.` |

**Quedan fuera, a propósito:**
- `REPORTE_SSIV.md` — decisión del dueño, no es prioritario.
- `anexo_tecnico_estructura_gasto_lima_distrital.md` — es **complemento** de `en-que-gasta-la-lima-municipal` (el propio informe lo anuncia en su cierre), no una entrada aparte.

## Estructura de archivos

**Se crean:**

| Archivo | Responsabilidad |
|---|---|
| `web/app/supabase/migrations/0014_key_figure_and_sources.sql` | Columnas `key_figure`, `key_figure_label`, `sources` |
| `web/app/supabase/migrations/0015_real_catalogue.sql` | Borra las 7 filas falsas, inserta las 5 reales **despublicadas** |
| `web/app/supabase/migrations/0016_publish_catalogue.sql` | Publica las entradas cuyo `file_path` ya está puesto |
| `web/app/scripts/lib/brandPage.mjs` | Envuelve HTML en el layout de marca. **Lo comparten el conversor de PDFs y el generador de portadas** |
| `web/app/scripts/build-report-pdfs.mjs` | Markdown → HTML de marca → PDF (Playwright) |
| `web/app/scripts/build-covers.mjs` | Portada/`og:image` PNG 1200×630 por slug → `public/covers/` |
| `web/app/scripts/extract-sankey.mjs` | Extrae el payload de `Plotly.newPlot` → `public/sankey/*.json` |
| `web/app/scripts/upload-report-files.mjs` | Sube los 5 PDFs a Storage y escribe `file_path` |
| `web/app/src/pages/Reporte.jsx` | La página `/reportes/:slug` |
| `web/app/src/components/SankeyChart.jsx` | Visor Plotly responsivo, una sola copia de la librería |
| `web/app/src/hooks/useReport.js` | Trae un reporte por slug |
| `web/app/src/components/KeyFigure.jsx` | La cifra clave tipográfica |
| `web/app/src/components/SourceList.jsx` | Las fuentes con su enlace |

**Se modifican:** `web/app/src/App.jsx` (ruta nueva), `web/app/src/pages/Reportes.jsx` (índice de portafolio), `web/app/src/hooks/useReports.js` (columnas nuevas), `web/app/index.html` (`og:image` por defecto), `web/app/package.json` (Playwright, Plotly, scripts), `web/app/CLAUDE.md`.

---

## Global Constraints

Todo esto vincula a **todas** las tareas. Copiado literal del spec y de `CLAUDE.md`.

- **Prettier a 140 columnas.** `npm run format` antes de cada commit; `npm run format:check` tiene que pasar.
- **Estilos inline `style={{}}` con variables CSS.** Nada de Tailwind, nada de CSS-in-JS. No pongas un hex donde exista una variable.
- **Paleta:** `--bg` #F3EADA · `--ink` #241A12 · `--ochre` #C68A3D · `--terracotta` #A8472B · `--gold` #D8A84E · `--muted` #7A6B58 · `--tan-text` #C9B79C · `--border` #DDCBAE · `--cream2` #EBDFC9.
- **Tipografía:** Spectral (serif, titulares) + IBM Plex Sans (cuerpo/UI) + IBM Plex Mono (cifras tabulares).
- **`:hover`/`:active` solo con las clases utilitarias existentes:** `btn-hover`, `btn-outline-hover`, `card-hover`, `row-hover`, `link-hover`, `icon-btn-hover`. Una regla `:hover` de hoja de estilos **nunca** gana contra un estilo inline que fije la misma propiedad.
- **Nunca el atajo CSS `font` después de `fontSize`/`fontWeight`** en el mismo objeto de estilo: los resetea en silencio. Ya pasó dos veces en este proyecto.
- **Copy en español, tono directo, sin signos de exclamación.**
- **Contraste:** Ocre sobre Arena es 3.1:1 — válido solo para texto ≥18px. Terracota sobre Arena es 4.6:1 (seguro para cuerpo). Calcula el ratio, no lo estimes.
- **El código de pagos sigue dormido, no se borra.** Migraciones `0003`-`0012`, `approve_order()`, `src/lib/orders.js`, `src/components/CheckoutModal.jsx`, `src/data/bankDetails.js`. No los toques.
- **Nada puede depender de una plataforma de hosting.** El build produce estáticos. Sin `@vercel/og`, sin funciones de plataforma, sin adaptadores.
- **Todo debe verse digno con cero, uno o cinco reportes publicados.** Nada puede depender de tener la biblioteca llena.
- **Nunca imprimas la `service_role` key ni ningún JWT** en la salida, en un reporte o en un archivo. Nunca leas en voz alta ni commitees `.env.local`.
- **El proyecto Supabase vivo es `zboxdsiejvmjupdawgax`.** El MCP de Supabase da 401 en este entorno — usa la CLI (`npx supabase@latest ... --linked`).

---

## Tarea 1: Migración — la cifra clave y las fuentes

**Archivos:**
- Crear: `web/app/supabase/migrations/0014_key_figure_and_sources.sql`

**Interfaces:**
- Produce: tres columnas anulables en `public.reports` — `key_figure text`, `key_figure_label text`, `sources jsonb`. Las tareas 7, 9 y 10 las leen.

- [ ] **Paso 1: Escribir la migración**

```sql
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
```

- [ ] **Paso 2: Aplicar y verificar contra la base viva**

```bash
cd web/app
npx supabase@latest db push --include-all --linked
```

Verifica que las columnas existan **en la base**, no en el archivo:

```bash
npx supabase@latest db query --linked "select column_name, data_type, is_nullable from information_schema.columns where table_name='reports' and column_name in ('key_figure','key_figure_label','sources') order by column_name;"
```

Esperado: tres filas, las tres `YES` en `is_nullable`, `sources` de tipo `jsonb`.

- [ ] **Paso 3: Comprobar que la restricción muerde**

```bash
npx supabase@latest db query --linked "update public.reports set sources = '{\"nombre\":\"x\"}'::jsonb where slug = (select slug from public.reports limit 1);"
```

Esperado: **falla** con `violates check constraint "reports_sources_is_array"`. Si pasa, la restricción no se aplicó. (No hace falta deshacer nada: la sentencia no llegó a escribir.)

- [ ] **Paso 4: Commit**

```bash
git add web/app/supabase/migrations/0014_key_figure_and_sources.sql
git commit -m "feat(db): add key figure and sources columns to reports"
```

---

## Tarea 2: Sustituir el catálogo inventado por el real

**Archivos:**
- Crear: `web/app/supabase/migrations/0015_real_catalogue.sql`

**Interfaces:**
- Consume: las columnas de la Tarea 1.
- Produce: cinco filas en `public.reports` con los slugs de la tabla de arriba, **todas con `published_at = null`**. La Tarea 5 las publica.

**Por qué se insertan despublicadas.** Publicar antes de que exista el archivo dejaría cinco botones "Descargar" que fallan con 404 — exactamente la deshonestidad que este plan viene a arreglar, solo que con nombres reales. `published_at` se pone en la Tarea 5, después de que `file_path` apunte a un PDF que existe. El spec ya lo dice para el caso de Lima: "es mejor dejar esas dos entradas despublicadas que degradar contenido bueno".

- [ ] **Paso 1: Verificar las fuentes antes de sembrarlas**

Las fuentes son el argumento entero de la página. Un enlace roto en la sección "compruébalo" es peor que no poner enlace. Comprueba cada URL antes de escribirla:

```bash
for u in "https://www.mef.gob.pe/es/portal-de-transparencia-economica" "https://apps5.mineco.gob.pe/transparencia/Navegador/default.aspx" "https://www.inei.gob.pe/"; do echo -n "$u -> "; curl -s -o /dev/null -w "%{http_code}\n" -L --max-time 20 "$u"; done
```

Cualquiera que no devuelva `200`: **pon `"url": null` para esa fuente en vez de escribir un enlace roto.** El nombre de la fuente se conserva siempre; el enlace es opcional por diseño.

- [ ] **Paso 2: Escribir la migración**

Usa los valores de la tabla "Los cinco informes reales" y de la tabla de cifras clave, literalmente. Sustituye las tres URLs por lo que haya dado el Paso 1.

```sql
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
  );

commit;
```

**Nota sobre `tier`:** las cinco van como `'free'`. La columna se conserva (permite volver a distinguir sin migración de datos) pero desde `0013` no gatea nada — el acceso es publicación + sesión.

- [ ] **Paso 3: Aplicar y verificar**

```bash
cd web/app
npx supabase@latest db push --include-all --linked
npx supabase@latest db query --linked "select slug, title, key_figure, published_at, jsonb_array_length(sources) as n_fuentes from public.reports order by slug;"
```

Esperado: exactamente **5 filas**, todas con `published_at` nulo, todas con `key_figure` no nulo, `n_fuentes` ≥ 1. Ninguno de los 7 slugs viejos.

- [ ] **Paso 4: Comprobar que el sitio no muestra nada roto**

```bash
node scripts/verify-supabase.mjs
```

El catálogo público debe salir **vacío** (RLS `0011` filtra por `published_at`). Eso es correcto y temporal: es el estado "cero reportes publicados" que el spec exige que se vea digno. Si `/reportes` con cero filas se ve roto, **anótalo en el reporte** — lo arregla la Tarea 10.

- [ ] **Paso 5: Commit**

```bash
git add web/app/supabase/migrations/0015_real_catalogue.sql
git commit -m "feat(db): replace the invented catalogue with the five real reports"
```

---

## Tarea 3: Playwright y el maquetador de marca compartido

**Archivos:**
- Crear: `web/app/scripts/lib/brandPage.mjs`
- Crear: `web/app/scripts/lib/brandPage.test.mjs`
- Modificar: `web/app/package.json`

**Interfaces:**
- Produce:
  - `brandPage({ title, kicker, runningHead, bodyHtml })` → `string` (documento HTML completo, listo para imprimir).
  - `coverPage({ title, subtitle, keyFigure })` → `string` (documento HTML de 1200×630 px).
  - `PALETTE` → objeto con los hex de la paleta, para que ningún script los reescriba a mano.
  - Las tareas 4 y 6 consumen las tres.

**Por qué una pieza compartida.** El conversor de PDFs y el generador de portadas necesitan exactamente el mismo sistema de marca. Si cada uno se lo escribe por su lado, se desvían — y el día que alguien cambie un color, uno de los dos se queda atrás sin que nadie lo note. Una sola pieza, dos consumidores.

- [ ] **Paso 1: Instalar Playwright**

```bash
cd web/app
npm install -D playwright
npx playwright install chromium
```

`playwright install chromium` descarga ~150 MB la primera vez. Es solo Chromium, no los tres navegadores.

- [ ] **Paso 2: Escribir el test que falla**

Crear `web/app/scripts/lib/brandPage.test.mjs`:

```js
import { describe, expect, it } from 'vitest';
import { PALETTE, brandPage, coverPage } from './brandPage.mjs';

describe('brandPage', () => {
  it('pone el título en el encabezado corrido y en el cuerpo', () => {
    const html = brandPage({ title: 'Tres Limas fiscales', kicker: 'INVESTIGACIÓN', runningHead: 'TRES LIMAS', bodyHtml: '<p>hola</p>' });
    expect(html).toContain('Tres Limas fiscales');
    expect(html).toContain('TRES LIMAS');
    expect(html).toContain('<p>hola</p>');
  });

  it('cierra el documento y declara UTF-8, porque el copy lleva tildes', () => {
    const html = brandPage({ title: 'Ó', kicker: 'K', runningHead: 'R', bodyHtml: '' });
    expect(html).toMatch(/^<!doctype html>/i);
    expect(html).toContain('charset="utf-8"');
    expect(html.trimEnd()).toMatch(/<\/html>$/);
  });

  it('escapa el HTML del título para que un & no rompa el documento', () => {
    const html = brandPage({ title: 'Gasto & deuda', kicker: 'K', runningHead: 'R', bodyHtml: '' });
    expect(html).toContain('Gasto &amp; deuda');
    expect(html).not.toContain('Gasto & deuda');
  });

  it('no escapa el cuerpo, que ya viene como HTML', () => {
    const html = brandPage({ title: 'T', kicker: 'K', runningHead: 'R', bodyHtml: '<strong>82.6%</strong>' });
    expect(html).toContain('<strong>82.6%</strong>');
  });

  it('usa la paleta y no hex sueltos', () => {
    expect(PALETTE.terracotta).toBe('#A8472B');
    expect(PALETTE.bg).toBe('#F3EADA');
    expect(brandPage({ title: 'T', kicker: 'K', runningHead: 'R', bodyHtml: '' })).toContain('#A8472B');
  });

  it('la portada mide 1200x630, que es lo que exige og:image', () => {
    const html = coverPage({ title: 'De dónde viene la plata', subtitle: 'La recaudación propia', keyFigure: '34.9%' });
    expect(html).toContain('1200px');
    expect(html).toContain('630px');
    expect(html).toContain('34.9%');
  });

  it('la portada se sostiene sin cifra clave', () => {
    const html = coverPage({ title: 'Un informe sin cifra', subtitle: 'Bajada', keyFigure: null });
    expect(html).toContain('Un informe sin cifra');
    expect(html).not.toContain('null');
  });
});
```

- [ ] **Paso 3: Correr el test y verlo fallar**

```bash
cd web/app
npx vitest run scripts/lib/brandPage.test.mjs
```

Esperado: FALLA con `Failed to resolve import "./brandPage.mjs"`.

- [ ] **Paso 4: Escribir `brandPage.mjs`**

Crear `web/app/scripts/lib/brandPage.mjs`. El layout replica el de los tres PDFs existentes (ver el hecho 4 del contexto). Ábrelos antes de escribir esto: `reportes/informe_recaudacion_propia_2018_2025.pdf`.

```js
// El sistema de marca para todo lo que se genera fuera del navegador: los PDFs
// convertidos (build-report-pdfs.mjs) y las portadas (build-covers.mjs).
//
// El layout NO se inventa acá: reproduce el de los tres PDFs que ya existen en
// reportes/, maquetados a mano. Encabezado corrido en versalitas, rombo
// terracota junto al logotipo, kicker en versalitas terracota, título en
// Spectral, cuerpo justificado en IBM Plex, pie "El dato, a la vista.".
// Si cambias algo acá, compáralo contra esos PDFs antes de dar por bueno el
// resultado — son la referencia, no este archivo.

export const PALETTE = {
  bg: '#F3EADA',
  ink: '#241A12',
  ochre: '#C68A3D',
  terracotta: '#A8472B',
  gold: '#D8A84E',
  muted: '#7A6B58',
  tanText: '#C9B79C',
  border: '#DDCBAE',
  cream2: '#EBDFC9',
};

const FONTS = 'https://fonts.googleapis.com/css2?family=Spectral:wght@500;600;700;800&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap';

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// El rombo del logo, como SVG inline: no depende de ningún archivo en disco,
// así que el HTML generado es autocontenido y Playwright no necesita servirlo.
function diamond(size = 14, color = PALETTE.terracotta) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 10 10" aria-hidden="true"><rect x="1.5" y="1.5" width="7" height="7" transform="rotate(45 5 5)" fill="${color}"/></svg>`;
}

export function brandPage({ title, kicker, runningHead, bodyHtml }) {
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>${esc(title)}</title>
<!-- El encabezado corrido lo dibuja Playwright con headerTemplate, no este
     documento: en una impresión, el header se repite por página y eso solo
     lo puede hacer el motor de impresión. Se declara acá igual para que el
     HTML sea autodescriptivo y quien lo abra suelto sepa de qué informe es. -->
<meta name="inmerge-running-head" content="${esc(runningHead)}">
<link rel="stylesheet" href="${FONTS}">
<style>
  @page { size: A4; margin: 22mm 18mm 20mm; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: 'IBM Plex Sans', sans-serif; font-size: 10.5pt; line-height: 1.65; color: ${PALETTE.ink}; text-align: justify; }
  .masthead { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 26pt; }
  .wordmark { display: flex; align-items: center; gap: 7pt; font-family: 'IBM Plex Sans', sans-serif; font-weight: 600; font-size: 13pt; letter-spacing: 1.6pt; }
  .whereabouts { text-align: right; font-size: 8pt; color: ${PALETTE.muted}; line-height: 1.5; }
  .kicker { text-align: center; font-size: 7.5pt; font-weight: 600; letter-spacing: 1.6pt; color: ${PALETTE.terracotta}; margin-bottom: 10pt; }
  h1 { font-family: 'Spectral', serif; font-weight: 700; font-size: 26pt; text-align: center; margin: 0 0 22pt; line-height: 1.2; }
  h2 { font-family: 'Spectral', serif; font-weight: 600; font-size: 14pt; color: ${PALETTE.terracotta}; margin: 22pt 0 8pt; padding-bottom: 5pt; border-bottom: 0.6pt solid ${PALETTE.border}; text-align: left; }
  h3 { font-family: 'Spectral', serif; font-weight: 600; font-size: 11.5pt; margin: 16pt 0 6pt; text-align: left; }
  p { margin: 0 0 9pt; }
  strong { font-weight: 600; }
  img { max-width: 100%; height: auto; display: block; margin: 12pt auto; }
  figcaption, .caption { font-size: 8pt; font-style: italic; color: ${PALETTE.muted}; text-align: center; margin-top: -6pt; margin-bottom: 12pt; }
  blockquote { margin: 12pt 0; padding-left: 12pt; border-left: 2pt solid ${PALETTE.gold}; color: ${PALETTE.muted}; font-style: italic; text-align: left; }
  table { width: 100%; border-collapse: collapse; margin: 12pt 0; font-size: 8.5pt; text-align: left; }
  th { background: ${PALETTE.cream2}; font-weight: 600; }
  th, td { border: 0.5pt solid ${PALETTE.border}; padding: 5pt 7pt; }
  code { font-family: 'IBM Plex Mono', monospace; font-size: 9pt; }
  hr { border: none; border-top: 0.6pt solid ${PALETTE.border}; margin: 18pt 0; }
  h1, h2, h3 { break-after: avoid; }
  img, table, figure { break-inside: avoid; }
</style>
</head>
<body>
  <div class="masthead">
    <div class="wordmark">${diamond()}<span>INMERGE</span></div>
    <div class="whereabouts">Consultoría en datos y estrategia<br>Lima, Perú</div>
  </div>
  <div class="kicker">${esc(kicker)}</div>
  <h1>${esc(title)}</h1>
  ${bodyHtml}
</body>
</html>
`;
}

export function coverPage({ title, subtitle, keyFigure }) {
  // 1200x630 es la proporción que exigen WhatsApp, Facebook y X para la imagen
  // social. La misma pieza sirve de portada en el catálogo, así que se genera
  // una sola vez y se usa en los dos lugares.
  const figureBlock = keyFigure
    ? `<div class="figure">${esc(keyFigure)}</div>`
    : '';
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>${esc(title)}</title>
<link rel="stylesheet" href="${FONTS}">
<style>
  * { box-sizing: border-box; }
  body { margin: 0; width: 1200px; height: 630px; background: ${PALETTE.bg}; color: ${PALETTE.ink}; font-family: 'IBM Plex Sans', sans-serif; display: flex; flex-direction: column; justify-content: space-between; padding: 64px 72px; overflow: hidden; }
  .top { display: flex; align-items: center; gap: 12px; font-weight: 600; font-size: 20px; letter-spacing: 2.4px; }
  h1 { font-family: 'Spectral', serif; font-weight: 700; font-size: 64px; line-height: 1.12; margin: 0 0 18px; max-width: 15ch; }
  .subtitle { font-size: 21px; color: ${PALETTE.muted}; line-height: 1.5; max-width: 44ch; }
  .figure { font-family: 'Spectral', serif; font-weight: 700; font-size: 96px; color: ${PALETTE.terracotta}; line-height: 1; }
  .bottom { display: flex; align-items: flex-end; justify-content: space-between; gap: 40px; }
  .rule { height: 4px; background: ${PALETTE.gold}; width: 96px; margin-bottom: 26px; }
</style>
</head>
<body>
  <div class="top">${diamond(22)}<span>INMERGE</span></div>
  <div>
    <div class="rule"></div>
    <h1>${esc(title)}</h1>
    <div class="subtitle">${esc(subtitle)}</div>
  </div>
  <div class="bottom">
    <div style="font-size:18px;color:${PALETTE.muted}">inmerge.pe · El dato, a la vista.</div>
    ${figureBlock}
  </div>
</body>
</html>
`;
}
```

- [ ] **Paso 5: Correr el test y verlo pasar**

```bash
cd web/app
npx vitest run scripts/lib/brandPage.test.mjs
```

Esperado: 7 tests en verde.

- [ ] **Paso 6: Asegurar que vitest recoge los tests de `scripts/`**

Abre `web/app/vite.config.js` y mira el `test.include`. Si está acotado a `src/`, agrégale `scripts/**/*.test.mjs`. Después corre la suite entera:

```bash
npm test
```

Esperado: los 19 tests que ya había **más** los 7 nuevos = 26. Si siguen saliendo 19, `include` no los recogió y el test no está corriendo — arréglalo antes de seguir.

- [ ] **Paso 7: Commit**

```bash
npm run format
git add web/app/scripts/lib/ web/app/package.json web/app/package-lock.json web/app/vite.config.js
git commit -m "feat(build): add the shared brand layout for generated PDFs and covers"
```

---

## Tarea 4: Convertir los dos informes de Lima a PDF

**Archivos:**
- Crear: `web/app/scripts/build-report-pdfs.mjs`
- Modificar: `web/app/package.json` (script `build:pdfs`)

**Interfaces:**
- Consume: `brandPage()` y `PALETTE` de la Tarea 3.
- Produce: `reportes/generado/en-que-gasta-la-lima-municipal.pdf` y `reportes/generado/tres-limas-fiscales.pdf`. La Tarea 5 los sube.

**El problema de las figuras, ya resuelto.** Los Markdown referencian imágenes con **dos** convenciones (`../../../figuras/eda/…` y `../imagenes/…`) y **ninguna resuelve** desde `reportes/`. Pero las 21 figuras existen en una sola carpeta plana. La regla es: **descartar el directorio, quedarse con el nombre del archivo, resolver contra `FIGURES_DIR`.** Verificado: 21 de 21 existen ahí.

- [ ] **Paso 1: Instalar el conversor de Markdown**

```bash
cd web/app
npm install -D marked
```

- [ ] **Paso 2: Escribir el script**

Crear `web/app/scripts/build-report-pdfs.mjs`:

```js
// Convierte a PDF los dos informes de Lima, que solo existen en Markdown.
// Los otros tres reportes YA son PDFs maquetados a mano y no se tocan.
//
// Uso: node scripts/build-report-pdfs.mjs
//
// El resultado NO va a ser idéntico a los tres hechos a mano, y eso está
// asumido en el spec. Lo que sí es obligatorio antes de publicar: abrirlos
// lado a lado contra reportes/informe_recaudacion_propia_2018_2025.pdf. Si el
// convertido desmerece al original, es mejor dejar esas dos entradas
// despublicadas que degradar contenido bueno.

import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';
import { chromium } from 'playwright';
import { brandPage } from './lib/brandPage.mjs';

const HERE = resolve(fileURLToPath(new URL('.', import.meta.url)));
const REPO = resolve(HERE, '../../..');
const SOURCE_DIR = join(REPO, 'reportes');
const OUT_DIR = join(SOURCE_DIR, 'generado');

// Las 181 figuras viven fuera del repositorio, en el proyecto de análisis.
// Se puede sobreescribir con INMERGE_FIGURES_DIR para no atar el script a una
// máquina concreta.
const FIGURES_DIR = process.env.INMERGE_FIGURES_DIR || 'C:/papx/mef2026/mef_2026/deliverables/figuras/eda';

const REPORTS = [
  {
    slug: 'en-que-gasta-la-lima-municipal',
    file: 'informe_estructura_gasto_lima_distrital_2018_2025.md',
    kicker: 'INVESTIGACIÓN · ESTRUCTURA DEL GASTO MUNICIPAL · LIMA Y CALLAO',
    runningHead: 'EN QUÉ GASTA LA LIMA MUNICIPAL (2018-2025)',
  },
  {
    slug: 'tres-limas-fiscales',
    file: 'informe_fiscal_lima_distrital_2018_2025.md',
    kicker: 'INVESTIGACIÓN · FISCALIDAD MUNICIPAL · LIMA Y CALLAO',
    runningHead: 'TRES LIMAS FISCALES (2018-2025)',
  },
];

// El markdown trae dos convenciones de ruta y ninguna resuelve desde acá. Las
// 21 figuras están en una sola carpeta plana, así que el nombre del archivo
// alcanza para encontrarlas todas.
export function resolveFigure(mdPath, figuresDir = FIGURES_DIR) {
  return join(figuresDir, basename(mdPath));
}

function toFileUrl(p) {
  return 'file:///' + resolve(p).replace(/\\/g, '/');
}

function renderMarkdown(md) {
  const missing = [];
  const renderer = new marked.Renderer();
  renderer.image = (href, _title, text) => {
    const disk = resolveFigure(href);
    if (!existsSync(disk)) {
      missing.push(href);
      return `<p class="caption">[falta la figura: ${basename(href)}]</p>`;
    }
    return `<img src="${toFileUrl(disk)}" alt="${text || ''}"><div class="caption">${text || ''}</div>`;
  };
  // El primer <h1> del markdown es el título, y brandPage() ya lo pone arriba.
  // Dejarlo en el cuerpo lo duplicaría en la primera página.
  let seenH1 = false;
  renderer.heading = (textHtml, level) => {
    if (level === 1 && !seenH1) {
      seenH1 = true;
      return '';
    }
    return `<h${level}>${textHtml}</h${level}>`;
  };
  const html = marked.parse(md, { renderer });
  return { html, missing };
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const browser = await chromium.launch();
  let failed = false;

  for (const r of REPORTS) {
    const md = readFileSync(join(SOURCE_DIR, r.file), 'utf8');
    // El BOM del archivo se cuela como carácter invisible en el primer título.
    const { html, missing } = renderMarkdown(md.replace(/^\uFEFF/, ''));

    if (missing.length) {
      failed = true;
      console.error(`✗ ${r.slug}: faltan ${missing.length} figura(s):`);
      for (const m of missing) console.error(`    ${m}`);
    }

    // El primer <h1> del markdown lleva el título completo con su subtítulo;
    // el título corto de la portada es el que está en el catálogo.
    const title = (md.match(/^\uFEFF?#\s+(.+)$/m) || [, r.slug])[1].trim();

    const page = await browser.newPage();
    await page.setContent(brandPage({ title, kicker: r.kicker, runningHead: r.runningHead, bodyHtml: html }), {
      waitUntil: 'networkidle',
    });
    const out = join(OUT_DIR, `${r.slug}.pdf`);
    await page.pdf({
      path: out,
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: `<div style="font-family:'IBM Plex Sans',sans-serif;font-size:7pt;letter-spacing:1.2pt;color:#7A6B58;width:100%;padding:0 18mm;">${r.runningHead} · REPORTE INMERGE</div>`,
      footerTemplate: `<div style="font-family:'IBM Plex Sans',sans-serif;font-size:7.5pt;color:#7A6B58;width:100%;padding:0 18mm;display:flex;justify-content:space-between;"><span>Inmerge · El dato, a la vista.</span><span>inmerge.pe</span></div>`,
      margin: { top: '22mm', bottom: '20mm', left: '18mm', right: '18mm' },
    });
    await page.close();
    console.log(`✓ ${out}`);
  }

  await browser.close();
  if (failed) {
    console.error('\nHubo figuras faltantes. Los PDFs se generaron igual, pero con huecos: no los publiques así.');
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

- [ ] **Paso 3: Agregar el script a `package.json`**

```json
"build:pdfs": "node scripts/build-report-pdfs.mjs",
```

- [ ] **Paso 4: Correrlo y verificar que no falta ninguna figura**

```bash
cd web/app
npm run build:pdfs
```

Esperado: dos líneas `✓` y **salida cero**. Si sale `1` con figuras faltantes, la carpeta de figuras no es la correcta o un nombre cambió — arréglalo antes de seguir, no publiques PDFs con huecos.

- [ ] **Paso 5: Comprobar que los PDFs tienen contenido de verdad**

```bash
node -e "const s=require('fs').statSync('../../reportes/generado/tres-limas-fiscales.pdf');console.log('bytes:',s.size)"
node -e "const s=require('fs').statSync('../../reportes/generado/en-que-gasta-la-lima-municipal.pdf');console.log('bytes:',s.size)"
```

Esperado: **más de 300 KB cada uno**. Los originales de referencia pesan entre 566 KB y 1.18 MB con sus figuras incrustadas; un PDF de 30 KB significa que las imágenes no entraron.

- [ ] **Paso 6: Comparación lado a lado — es parte del trabajo, no un extra**

El spec lo exige explícitamente. Abre los dos generados junto a `reportes/informe_recaudacion_propia_2018_2025.pdf` y compara: encabezado corrido, rombo y logotipo, kicker, título en Spectral, secciones en terracota con filete, cuerpo justificado, pie.

**En tu reporte, escribe qué diferencias encontraste y si el resultado desmerece o no al original.** Si desmerece, dilo: esas dos entradas se quedan despublicadas y no pasa nada — es mejor que degradar contenido bueno. No lo declares aceptable sin haberlos abierto.

- [ ] **Paso 7: No commitear los PDFs generados**

Agrega a `.gitignore` de la raíz del repo:

```
reportes/generado/
```

Son artefactos de build de decenas de MB; viven en Storage, no en git.

- [ ] **Paso 8: Commit**

```bash
npm run format
git add web/app/scripts/build-report-pdfs.mjs web/app/package.json web/app/package-lock.json ../../.gitignore
git commit -m "feat(build): convert the two Lima markdown reports to branded PDFs"
```

---

## Tarea 5: Subir los cinco PDFs a Storage y publicar el catálogo

**Archivos:**
- Crear: `web/app/scripts/upload-report-files.mjs`
- Crear: `web/app/supabase/migrations/0016_publish_catalogue.sql`

**Interfaces:**
- Consume: los PDFs de la Tarea 4 y las filas de la Tarea 2.
- Produce: `reports.file_path` puesto en las 5 filas y `published_at` puesto **solo** en las que tienen archivo.

**Sobre la clave.** Este script necesita la `service_role` key porque escribe en un bucket privado. **Nunca la imprimas, nunca la escribas en un archivo del repo, nunca la pegues en un reporte.** Se pasa por variable de entorno en el momento de correr el script y nada más.

- [ ] **Paso 1: Escribir el script**

Crear `web/app/scripts/upload-report-files.mjs`:

```js
// Sube los cinco PDFs al bucket privado `report-files` y escribe reports.file_path.
//
// Uso (PowerShell):
//   $env:SUPABASE_SERVICE_ROLE_KEY = "..."; node scripts/upload-report-files.mjs
//
// La key se lee del entorno y NUNCA se imprime. Si la ves en la salida de este
// script, es un bug: arréglalo antes de seguir.
//
// El bucket es privado: la descarga siempre pasa por la Edge Function
// get-report-download-url, que consulta has_access() y firma una URL de 5
// minutos. Subir acá no expone nada públicamente.

import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const HERE = resolve(fileURLToPath(new URL('.', import.meta.url)));
const REPO = resolve(HERE, '../../..');

const URL_ = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL_ || !KEY) {
  console.error('Faltan VITE_SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY en el entorno.');
  process.exit(1);
}

const FILES = [
  { slug: 'un-estado-tres-oficios', path: 'reportes/informe_estructura_gasto_niveles_gobierno_2018_2025.pdf' },
  { slug: 'de-donde-viene-la-plata', path: 'reportes/informe_recaudacion_propia_2018_2025.pdf' },
  { slug: 'en-que-gasta-el-estado-central', path: 'reportes/informe_estructura_gasto_ministerial_2018_2025.pdf' },
  { slug: 'en-que-gasta-la-lima-municipal', path: 'reportes/generado/en-que-gasta-la-lima-municipal.pdf' },
  { slug: 'tres-limas-fiscales', path: 'reportes/generado/tres-limas-fiscales.pdf' },
];

const supabase = createClient(URL_, KEY, { auth: { persistSession: false } });

async function main() {
  let failed = false;
  for (const f of FILES) {
    const objectName = `${f.slug}.pdf`;
    let bytes;
    try {
      bytes = readFileSync(join(REPO, f.path));
    } catch {
      console.error(`✗ ${f.slug}: no existe ${f.path}`);
      failed = true;
      continue;
    }

    const { error: upErr } = await supabase.storage
      .from('report-files')
      .upload(objectName, bytes, { contentType: 'application/pdf', upsert: true });
    if (upErr) {
      console.error(`✗ ${f.slug}: subida falló — ${upErr.message}`);
      failed = true;
      continue;
    }

    const { data, error: dbErr } = await supabase
      .from('reports')
      .update({ file_path: objectName })
      .eq('slug', f.slug)
      .select('slug');
    if (dbErr) {
      console.error(`✗ ${f.slug}: update falló — ${dbErr.message}`);
      failed = true;
      continue;
    }
    if (!data || data.length === 0) {
      // Sin esta comprobación, un slug mal escrito actualizaría cero filas y el
      // script diría "listo" con el catálogo intacto y el archivo huérfano.
      console.error(`✗ ${f.slug}: la subida funcionó pero NINGUNA fila tiene ese slug.`);
      failed = true;
      continue;
    }
    console.log(`✓ ${f.slug} → ${objectName} (${(bytes.length / 1024).toFixed(0)} KB)`);
  }
  if (failed) process.exit(1);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
```

- [ ] **Paso 2: Correrlo**

```bash
cd web/app
node scripts/upload-report-files.mjs
```

Esperado: cinco líneas `✓`, salida cero, y **ninguna clave visible en la salida**.

- [ ] **Paso 3: Verificar contra la base que los cinco tienen archivo**

```bash
npx supabase@latest db query --linked "select slug, file_path, published_at from public.reports order by slug;"
```

Esperado: los 5 con `file_path` no nulo, los 5 todavía con `published_at` nulo.

- [ ] **Paso 4: Escribir la migración de publicación**

Crear `web/app/supabase/migrations/0016_publish_catalogue.sql`:

```sql
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
```

- [ ] **Paso 5: Aplicar y verificar**

```bash
npx supabase@latest db push --include-all --linked
npx supabase@latest db query --linked "select count(*) filter (where published_at is not null) as publicados, count(*) filter (where file_path is null) as sin_archivo from public.reports;"
```

Esperado: `publicados = 5`, `sin_archivo = 0`. Si `publicados` es menor, mira cuáles quedaron fuera y por qué — no fuerces la publicación.

- [ ] **Paso 6: Probar una descarga real de punta a punta**

Es la prueba que de verdad importa: la cadena Edge Function → `has_access()` → Storage.

```bash
node scripts/test-download-url.mjs <correo-de-prueba> <contraseña> de-donde-viene-la-plata
```

Esperado: **200 con una URL firmada**. Si da 403, `has_access()` está negando (revisa `published_at`); si da 404, el `file_path` no coincide con el objeto en el bucket.

- [ ] **Paso 7: Commit**

```bash
npm run format
git add web/app/scripts/upload-report-files.mjs web/app/supabase/migrations/0016_publish_catalogue.sql
git commit -m "feat: upload the real report PDFs and publish the catalogue"
```

---

## Tarea 6: Portadas y og:image generadas en build

**Archivos:**
- Crear: `web/app/scripts/build-covers.mjs`
- Modificar: `web/app/package.json`, `web/app/.gitignore`

**Interfaces:**
- Consume: `coverPage()` de la Tarea 3, y el catálogo de la Tarea 2.
- Produce: `web/app/public/covers/<slug>.png` (1200×630) por cada reporte publicado. Las tareas 9 y 10 los consumen por URL: `/covers/<slug>.png`.

**Por qué en build y no bajo demanda.** El hosting es S3 + CloudFront, no Vercel — `@vercel/og` no existe ahí. Y aunque existiera: las portadas de un catálogo estático no cambian entre visitas, así que generarlas por petición es más lento, más caro y con arranque en frío, sin ninguna ventaja. Generar en build funciona en cualquier CDN.

- [ ] **Paso 1: Escribir el script**

Crear `web/app/scripts/build-covers.mjs`:

```js
// Genera una portada PNG de 1200x630 por reporte publicado.
//
// La misma imagen cumple dos funciones: portada en el catálogo y og:image al
// compartir por WhatsApp. Se construye una vez y se usa en los dos lugares —
// duplicar la pieza sería garantizar que se desvíen.
//
// Uso: node scripts/build-covers.mjs
// Lee el catálogo con la anon key (solo SELECT de filas publicadas, que es lo
// que la RLS permite). No necesita service_role.

import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import { chromium } from 'playwright';
import { coverPage } from './lib/brandPage.mjs';

const HERE = resolve(fileURLToPath(new URL('.', import.meta.url)));
const OUT_DIR = join(HERE, '../public/covers');

const URL_ = process.env.VITE_SUPABASE_URL;
const ANON = process.env.VITE_SUPABASE_ANON_KEY;
if (!URL_ || !ANON) {
  console.error('Faltan VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Cárgalos desde .env.local.');
  process.exit(1);
}

async function main() {
  const supabase = createClient(URL_, ANON, { auth: { persistSession: false } });
  const { data: reports, error } = await supabase.from('reports').select('slug, title, summary, key_figure').order('slug');
  if (error) {
    console.error('No se pudo leer el catálogo:', error.message);
    process.exit(1);
  }

  mkdirSync(OUT_DIR, { recursive: true });

  // Cero reportes publicados es un estado válido del sitio, no un error: el
  // spec exige que todo se vea digno con cero. El script lo dice y sale bien.
  if (!reports.length) {
    console.log('No hay reportes publicados. No hay portadas que generar.');
    return;
  }

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });

  for (const r of reports) {
    // La bajada del catálogo es larga para la portada; la primera oración es la
    // que funciona a ese tamaño.
    const subtitle = (r.summary || '').split(/(?<=\.)\s/)[0] || '';
    await page.setContent(coverPage({ title: r.title, subtitle, keyFigure: r.key_figure }), { waitUntil: 'networkidle' });
    const out = join(OUT_DIR, `${r.slug}.png`);
    writeFileSync(out, await page.screenshot({ type: 'png' }));
    console.log(`✓ ${r.slug}.png`);
  }

  await browser.close();
  console.log(`\n${reports.length} portada(s) en public/covers/`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

- [ ] **Paso 2: Agregar el script a `package.json`**

```json
"build:covers": "node scripts/build-covers.mjs",
```

- [ ] **Paso 3: Correrlo**

```bash
cd web/app
npm run build:covers
```

Esperado: cinco líneas `✓`.

- [ ] **Paso 4: Verificar las dimensiones, que es lo que exige og:image**

```bash
node -e "
const b=require('fs').readFileSync('public/covers/de-donde-viene-la-plata.png');
console.log('firma PNG:', b.subarray(1,4).toString()==='PNG');
console.log('ancho:', b.readUInt32BE(16), 'alto:', b.readUInt32BE(20));
console.log('KB:', (b.length/1024).toFixed(0));
"
```

Esperado: `firma PNG: true`, `ancho: 1200`, `alto: 630`. Un tamaño distinto significa que el viewport no se aplicó y WhatsApp recortará mal la imagen.

- [ ] **Paso 5: Mirar una portada con tus propios ojos**

Abre `web/app/public/covers/de-donde-viene-la-plata.png`. Comprueba que el título no se desborde ni se corte, que la cifra `34.9%` se lea, y que las tipografías sean Spectral e IBM Plex y no la serif por defecto del sistema (síntoma de que Google Fonts no cargó y `waitUntil: 'networkidle'` no alcanzó).

**Si no puedes abrirla, dilo en el reporte.** No declares que se ve bien sin haberla visto.

- [ ] **Paso 6: Sí commitear las portadas**

A diferencia de los PDFs, las portadas son pequeñas (~50-150 KB), forman parte del sitio estático y CloudFront las sirve. **Van al repositorio.** No las ignores.

- [ ] **Paso 7: Commit**

```bash
npm run format
git add web/app/scripts/build-covers.mjs web/app/public/covers/ web/app/package.json
git commit -m "feat(build): generate report covers and social images at build time"
```

---

## Tarea 7: Extraer los datos de los tres Sankey

**Archivos:**
- Crear: `web/app/scripts/extract-sankey.mjs`
- Crear: `web/app/scripts/extract-sankey.test.mjs`
- Modificar: `web/app/package.json`

**Interfaces:**
- Produce: `web/app/public/sankey/<slug>.json`, con la forma `{ "data": [...], "layout": {...} }`. La Tarea 8 los consume.

**El problema, con las cifras verificadas.** Cada anexo pesa **4.64 MB**, de los cuales el bloque `Plotly.newPlot(...)` mide **12.4 KB, 9.1 KB y 8.5 KB**. El resto es la librería Plotly empaquetada, repetida en los tres archivos. Incrustarlos por `iframe` mandaría 14 MB para mostrar 30 KB de información, y además tienen lienzo fijo de 1450×900px — inservibles en el teléfono, donde estará la mayoría del tráfico.

- [ ] **Paso 1: Escribir el test que falla**

Crear `web/app/scripts/extract-sankey.test.mjs`:

```js
import { describe, expect, it } from 'vitest';
import { extractPlotlyPayload } from './extract-sankey.mjs';

const HTML = `
<html><body><div id="abc"></div>
<script>
  window.PLOTLYENV = {};
  Plotly.newPlot(                        "abc-123",                        [{"type":"sankey","node":{"label":["A","B"]}}],                        {"title":{"text":"Flujo"},"width":1450,"height":900},                        {"responsive": true}                    )
</script></body></html>`;

describe('extractPlotlyPayload', () => {
  it('saca data y layout de la llamada a newPlot', () => {
    const { data, layout } = extractPlotlyPayload(HTML);
    expect(data[0].type).toBe('sankey');
    expect(data[0].node.label).toEqual(['A', 'B']);
    expect(layout.title.text).toBe('Flujo');
  });

  it('quita el ancho y el alto fijos, que es lo que impide que sea responsivo', () => {
    const { layout } = extractPlotlyPayload(HTML);
    expect(layout.width).toBeUndefined();
    expect(layout.height).toBeUndefined();
  });

  it('falla ruidosamente si el HTML no tiene newPlot, en vez de devolver vacío', () => {
    expect(() => extractPlotlyPayload('<html><body>nada</body></html>')).toThrow(/newPlot/i);
  });
});
```

- [ ] **Paso 2: Correr el test y verlo fallar**

```bash
cd web/app
npx vitest run scripts/extract-sankey.test.mjs
```

Esperado: FALLA, `extractPlotlyPayload` no existe.

- [ ] **Paso 3: Escribir el script**

Crear `web/app/scripts/extract-sankey.mjs`:

```js
// Extrae el payload de datos de los tres anexos Sankey.
//
// Cada HTML pesa 4.64 MB, de los cuales los datos son 8.5-12.4 KB: el resto es
// Plotly empaquetado, repetido tres veces. Servirlos por iframe mandaría 14 MB
// para mostrar 30 KB. Acá se saca el JSON y el visor carga UNA sola copia de la
// librería, compartida por los tres.
//
// Uso: node scripts/extract-sankey.mjs

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = resolve(fileURLToPath(new URL('.', import.meta.url)));
const REPO = resolve(HERE, '../../..');
const SOURCE_DIR = join(REPO, 'reportes');
const OUT_DIR = join(HERE, '../public/sankey');

// Qué anexo va con qué reporte, según el nombre del archivo.
const ANNEXES = [
  { slug: 'en-que-gasta-el-estado-central', file: 'anexo_interactivo_sankey.html' },
  { slug: 'un-estado-tres-oficios', file: 'anexo_interactivo_sankey_3niveles.html' },
  { slug: 'de-donde-viene-la-plata', file: 'anexo_interactivo_sankey_ingreso.html' },
];

// Plotly exporta `Plotly.newPlot("<uuid>", [data], {layout}, {config})`. Se
// recorre desde el primer `[` contando corchetes y llaves, respetando cadenas y
// escapes: una expresión regular no sirve porque el JSON anida sin límite.
function readBalanced(s, start) {
  const open = s[start];
  const close = open === '[' ? ']' : '}';
  let depth = 0;
  let inStr = false;
  let escaped = false;
  for (let i = start; i < s.length; i++) {
    const c = s[i];
    if (inStr) {
      if (escaped) escaped = false;
      else if (c === '\\') escaped = true;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') inStr = true;
    else if (c === open) depth++;
    else if (c === close) {
      depth--;
      if (depth === 0) return { text: s.slice(start, i + 1), end: i + 1 };
    }
  }
  throw new Error('No se cerró el bloque JSON que empieza en ' + start);
}

export function extractPlotlyPayload(html) {
  // La primera aparición es la definición de la librería (`Plotly.newPlot(gd,`);
  // la que trae los datos es la que abre con un id entre comillas.
  const call = html.search(/Plotly\.newPlot\(\s*"/);
  if (call === -1) throw new Error('No se encontró una llamada a Plotly.newPlot con datos en este HTML.');

  const dataStart = html.indexOf('[', call);
  if (dataStart === -1) throw new Error('newPlot sin arreglo de datos.');
  const dataBlock = readBalanced(html, dataStart);

  const layoutStart = html.indexOf('{', dataBlock.end);
  if (layoutStart === -1) throw new Error('newPlot sin objeto de layout.');
  const layoutBlock = readBalanced(html, layoutStart);

  const data = JSON.parse(dataBlock.text);
  const layout = JSON.parse(layoutBlock.text);

  // El lienzo fijo de 1450x900 es lo que vuelve inservibles estos diagramas en
  // un teléfono. Se quita acá para que el contenedor mande.
  delete layout.width;
  delete layout.height;
  delete layout.autosize;

  return { data, layout };
}

function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  for (const a of ANNEXES) {
    const html = readFileSync(join(SOURCE_DIR, a.file), 'utf8');
    const payload = extractPlotlyPayload(html);
    const out = join(OUT_DIR, `${a.slug}.json`);
    const json = JSON.stringify(payload);
    writeFileSync(out, json);
    const before = (Buffer.byteLength(html) / 1048576).toFixed(2);
    const after = (Buffer.byteLength(json) / 1024).toFixed(1);
    console.log(`✓ ${a.slug}.json — ${before} MB → ${after} KB`);
  }
}

// Solo corre cuando se invoca directamente, para que el test pueda importar
// extractPlotlyPayload sin escribir archivos.
if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  main();
}
```

- [ ] **Paso 4: Correr el test y verlo pasar**

```bash
npx vitest run scripts/extract-sankey.test.mjs
```

Esperado: 3 tests en verde.

- [ ] **Paso 5: Extraer de verdad y comprobar el ahorro**

```json
"build:sankey": "node scripts/extract-sankey.mjs",
```

```bash
npm run build:sankey
```

Esperado: tres líneas mostrando `4.64 MB → ~8-13 KB`. Si alguna sale con más de 100 KB, el balanceo se tragó la librería — investígalo, no lo publiques.

- [ ] **Paso 6: Comprobar que el JSON es un Sankey de verdad**

```bash
node -e "
const p=require('./public/sankey/de-donde-viene-la-plata.json');
console.log('trazas:', p.data.length, '| tipo:', p.data[0].type);
console.log('nodos:', p.data[0].node.label.length);
console.log('width/height en layout:', p.layout.width, p.layout.height);
"
```

Esperado: `tipo: sankey`, un número de nodos mayor que cero, y `undefined undefined` en width/height.

- [ ] **Paso 7: Commit**

```bash
npm run format
git add web/app/scripts/extract-sankey.mjs web/app/scripts/extract-sankey.test.mjs web/app/public/sankey/ web/app/package.json
git commit -m "feat(build): extract sankey data from the 4.6MB annexes into ~10KB JSON"
```

---

## Tarea 8: El visor de Sankey

**Archivos:**
- Crear: `web/app/src/components/SankeyChart.jsx`
- Crear: `web/app/src/components/SankeyChart.test.jsx`
- Modificar: `web/app/package.json`

**Interfaces:**
- Consume: `/sankey/<slug>.json` de la Tarea 7.
- Produce: `<SankeyChart slug="de-donde-viene-la-plata" title="..." />`. La Tarea 9 lo monta.

**Los Sankey se ven sin cuenta.** Es deliberado y es lo más diferenciador del sitio: el diagrama demuestra capacidad de un vistazo y no revela el razonamiento, así que la cuenta sigue siendo un intercambio real por el informe escrito.

- [ ] **Paso 1: Instalar Plotly**

```bash
cd web/app
npm install plotly.js-dist-min
```

`plotly.js-dist-min` es el bundle ya construido y minificado — no requiere configuración de Vite, a diferencia de `plotly.js`.

- [ ] **Paso 2: Escribir el test que falla**

Crear `web/app/src/components/SankeyChart.test.jsx`:

```jsx
import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import SankeyChart from './SankeyChart.jsx';

const newPlot = vi.fn(() => Promise.resolve());
vi.mock('plotly.js-dist-min', () => ({ default: { newPlot: (...a) => newPlot(...a), Plots: { resize: vi.fn() }, purge: vi.fn() } }));

afterEach(() => {
  vi.restoreAllMocks();
  newPlot.mockClear();
});

describe('SankeyChart', () => {
  it('dibuja con los datos que trae del JSON', async () => {
    global.fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ data: [{ type: 'sankey' }], layout: {} }) }));
    render(<SankeyChart slug="x" title="Flujo del gasto" />);
    await waitFor(() => expect(newPlot).toHaveBeenCalled());
  });

  it('dice que no se pudo cargar en vez de quedarse en blanco', async () => {
    global.fetch = vi.fn(() => Promise.resolve({ ok: false, status: 404 }));
    render(<SankeyChart slug="x" title="Flujo del gasto" />);
    expect(await screen.findByText(/no se pudo cargar/i)).toBeInTheDocument();
  });

  it('no revienta si la red falla del todo', async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error('offline')));
    render(<SankeyChart slug="x" title="Flujo del gasto" />);
    expect(await screen.findByText(/no se pudo cargar/i)).toBeInTheDocument();
  });

  it('anuncia el diagrama con un título accesible', async () => {
    global.fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ data: [{ type: 'sankey' }], layout: {} }) }));
    render(<SankeyChart slug="x" title="Flujo del gasto" />);
    expect(await screen.findByRole('img', { name: /flujo del gasto/i })).toBeInTheDocument();
  });
});
```

- [ ] **Paso 3: Correr el test y verlo fallar**

```bash
npx vitest run src/components/SankeyChart.test.jsx
```

Esperado: FALLA, no existe `SankeyChart.jsx`.

- [ ] **Paso 4: Escribir el componente**

Crear `web/app/src/components/SankeyChart.jsx`:

```jsx
import { useEffect, useRef, useState } from 'react';

// Visor de los anexos Sankey. Carga /sankey/<slug>.json (~10 KB, generado por
// scripts/extract-sankey.mjs) y lo dibuja con Plotly.
//
// Plotly se importa de forma diferida, DENTRO del efecto: es una librería
// grande y solo la necesitan las páginas de reporte que tienen anexo. Cargarla
// arriba la metería en el bundle principal, que pagarían también las páginas
// que no la usan.
//
// El lienzo es responsivo a propósito: los HTML originales venían con 1450x900
// fijos, o sea inservibles en un teléfono, que es donde va a estar la mayoría
// del tráfico. extract-sankey.mjs borra width/height del layout y acá manda el
// contenedor.
//
// Esto NO exige cuenta, a diferencia del PDF. El diagrama demuestra capacidad
// sin entregar el razonamiento escrito, así que la cuenta sigue siendo un
// intercambio real por el informe.

export default function SankeyChart({ slug, title }) {
  const holder = useRef(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    let plotly = null;
    const node = holder.current;

    async function draw() {
      try {
        const [{ default: Plotly }, res] = await Promise.all([import('plotly.js-dist-min'), fetch(`/sankey/${slug}.json`)]);
        if (!alive) return;
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const { data, layout } = await res.json();
        if (!alive || !node) return;
        plotly = Plotly;
        await Plotly.newPlot(
          node,
          data,
          {
            ...layout,
            margin: { l: 8, r: 8, t: 8, b: 8 },
            paper_bgcolor: 'transparent',
            plot_bgcolor: 'transparent',
            font: { family: "'IBM Plex Sans', sans-serif", size: 11, color: '#241A12' },
          },
          { responsive: true, displaylogo: false, modeBarButtonsToRemove: ['lasso2d', 'select2d'] }
        );
      } catch {
        if (alive) setFailed(true);
      }
    }
    draw();

    return () => {
      alive = false;
      // Sin purge, Plotly deja detectores de resize colgados del nodo y cambiar
      // de reporte va acumulando uno por visita.
      if (plotly && node) plotly.purge(node);
    };
  }, [slug]);

  if (failed) {
    return (
      <div style={{ border: '1px solid var(--border)', borderRadius: 3, padding: 24, fontSize: 14, color: 'var(--muted)' }}>
        No se pudo cargar el diagrama interactivo. El análisis completo está en el PDF.
      </div>
    );
  }

  return (
    <div
      ref={holder}
      role="img"
      aria-label={title}
      style={{ width: '100%', minHeight: 'clamp(320px, 60vh, 620px)', border: '1px solid var(--border)', borderRadius: 3, background: 'var(--cream2)' }}
    />
  );
}
```

- [ ] **Paso 5: Correr los tests y verlos pasar**

```bash
npx vitest run src/components/SankeyChart.test.jsx
npm test
```

Esperado: los 4 nuevos en verde y la suite entera sin regresiones.

- [ ] **Paso 6: Comprobar que Plotly NO entró al bundle principal**

```bash
npm run build
```

Mira la salida. Debe aparecer un *chunk* aparte para Plotly (varios cientos de KB) **además** del `index-*.js`. Si el `index-*.js` saltó de ~445 KB a más de 1 MB, la importación diferida no funcionó y todas las páginas están pagando la librería.

- [ ] **Paso 7: Commit**

```bash
npm run format
git add web/app/src/components/SankeyChart.jsx web/app/src/components/SankeyChart.test.jsx web/app/package.json web/app/package-lock.json
git commit -m "feat: responsive sankey viewer with a single lazily loaded Plotly"
```

---

## Tarea 9: La página `/reportes/:slug`

**Archivos:**
- Crear: `web/app/src/hooks/useReport.js`
- Crear: `web/app/src/components/KeyFigure.jsx`
- Crear: `web/app/src/components/SourceList.jsx`
- Crear: `web/app/src/pages/Reporte.jsx`
- Crear: `web/app/src/pages/Reporte.test.jsx`
- Modificar: `web/app/src/App.jsx`

**Interfaces:**
- Consume: `useReportDownload()` (existente, expone `{ downloadingId, downloadError, handleDownload }`), `useAuth()`, `useDocumentHead()`, `SankeyChart` de la Tarea 8, las columnas de la Tarea 1.
- Produce: la ruta `/reportes/:slug`.

**La página es pública y el archivo no.** Sin sesión se ve todo —título, bajada, cifra clave, fuentes, Sankey— y el botón invita a crear cuenta. Con sesión, descarga directa. Es lo que la hace indexable: Googlebot ve la página entera.

- [ ] **Paso 1: Escribir el hook**

Crear `web/app/src/hooks/useReport.js`:

```js
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';

// Trae un reporte por slug. La RLS (0011) solo devuelve publicados, así que un
// slug despublicado o inexistente se ven igual desde acá: `notFound`. Es lo
// correcto — un 404 no debe revelar que existe un borrador con ese nombre.
export default function useReport(slug) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setNotFound(false);
    setError('');

    supabase
      .from('reports')
      .select('id, slug, title, summary, key_figure, key_figure_label, sources')
      .eq('slug', slug)
      .maybeSingle()
      .then(({ data, error: err }) => {
        if (!alive) return;
        if (err) setError('No se pudo cargar el reporte.');
        else if (!data) setNotFound(true);
        else setReport(data);
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [slug]);

  return { report, loading, notFound, error };
}
```

- [ ] **Paso 2: Escribir los dos componentes de presentación**

Crear `web/app/src/components/KeyFigure.jsx`:

```jsx
// La cifra clave: un número grande en Spectral con su explicación debajo.
// Es la expresión más directa de "cada cifra, con su fuente a la vista", y la
// pieza principal de la página de reporte.
//
// Devuelve null si no hay cifra. Ningún reporte queda roto por no tenerla —
// la sección simplemente no se renderiza.
export default function KeyFigure({ figure, label }) {
  if (!figure) return null;
  return (
    <div style={{ borderTop: '2px solid var(--gold)', paddingTop: 28, marginBottom: 48 }}>
      <div
        style={{
          fontFamily: "'Spectral',serif",
          fontWeight: 700,
          fontSize: 'clamp(56px,11vw,104px)',
          lineHeight: 1,
          color: 'var(--terracotta)',
          marginBottom: 16,
        }}
      >
        {figure}
      </div>
      {label && <div style={{ fontSize: 'clamp(16px,2.2vw,20px)', lineHeight: 1.5, color: 'var(--ink)', maxWidth: '46ch' }}>{label}</div>}
    </div>
  );
}
```

Crear `web/app/src/components/SourceList.jsx`:

```jsx
// Las fuentes, con enlace donde exista. Es lo que separa "confía en mí" de
// "compruébalo", así que una fuente sin enlace se muestra igual: el nombre
// siempre, el enlace cuando lo hay.
export default function SourceList({ sources }) {
  if (!Array.isArray(sources) || sources.length === 0) return null;
  return (
    <div style={{ borderTop: '1px solid var(--border)', paddingTop: 24, marginTop: 48 }}>
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1.4, color: 'var(--muted)', marginBottom: 12 }}>FUENTES</div>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {sources.map((s, i) => (
          <li key={i} style={{ fontSize: 14, lineHeight: 1.6 }}>
            {s.url ? (
              <a href={s.url} target="_blank" rel="noopener noreferrer" className="link-hover" style={{ color: 'var(--terracotta)', fontWeight: 500 }}>
                {s.nombre}
              </a>
            ) : (
              <span style={{ color: 'var(--ink)' }}>{s.nombre}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Paso 3: Escribir el test que falla**

Crear `web/app/src/pages/Reporte.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import Reporte from './Reporte.jsx';

vi.mock('../components/SankeyChart.jsx', () => ({ default: () => <div data-testid="sankey" /> }));
vi.mock('../hooks/useReportDownload.js', () => ({ default: () => ({ downloadingId: null, downloadError: '', handleDownload: vi.fn() }) }));

const REPORT = {
  id: 'r1',
  slug: 'de-donde-viene-la-plata',
  title: 'De dónde viene la plata',
  summary: 'La recaudación propia del Estado peruano.',
  key_figure: '34.9%',
  key_figure_label: 'de los recursos propios del Estado son deuda.',
  sources: [{ nombre: 'SIAF-SP, MEF', url: 'https://www.mef.gob.pe/' }],
};

let mockState = { report: REPORT, loading: false, notFound: false, error: '' };
let mockUser = null;
vi.mock('../hooks/useReport.js', () => ({ default: () => mockState }));
vi.mock('../lib/auth.jsx', () => ({ useAuth: () => ({ user: mockUser }) }));

function show() {
  return render(
    <MemoryRouter initialEntries={['/reportes/de-donde-viene-la-plata']}>
      <Routes>
        <Route path="/reportes/:slug" element={<Reporte />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Reporte', () => {
  it('muestra la cifra clave y su explicación', () => {
    mockState = { report: REPORT, loading: false, notFound: false, error: '' };
    show();
    expect(screen.getByText('34.9%')).toBeInTheDocument();
    expect(screen.getByText(/son deuda/i)).toBeInTheDocument();
  });

  it('muestra las fuentes con su enlace', () => {
    mockState = { report: REPORT, loading: false, notFound: false, error: '' };
    show();
    expect(screen.getByRole('link', { name: /SIAF-SP, MEF/i })).toHaveAttribute('href', 'https://www.mef.gob.pe/');
  });

  it('sin sesión invita a crear cuenta, no a comprar', () => {
    mockUser = null;
    mockState = { report: REPORT, loading: false, notFound: false, error: '' };
    show();
    expect(screen.getByText(/crear cuenta/i)).toBeInTheDocument();
    expect(screen.queryByText(/comprar|precio|S\/ ?\d/i)).not.toBeInTheDocument();
  });

  it('con sesión ofrece descargar', () => {
    mockUser = { id: 'u1', email: 'a@b.pe' };
    mockState = { report: REPORT, loading: false, notFound: false, error: '' };
    show();
    expect(screen.getByRole('button', { name: /descargar/i })).toBeInTheDocument();
  });

  it('un reporte sin cifra clave no rompe la página', () => {
    mockState = { report: { ...REPORT, key_figure: null, key_figure_label: null }, loading: false, notFound: false, error: '' };
    show();
    expect(screen.getByText('De dónde viene la plata')).toBeInTheDocument();
    expect(screen.queryByText('34.9%')).not.toBeInTheDocument();
  });

  it('un slug inexistente dice que no existe, no se queda cargando', () => {
    mockState = { report: null, loading: false, notFound: true, error: '' };
    show();
    expect(screen.getByText(/no encontramos/i)).toBeInTheDocument();
  });
});
```

- [ ] **Paso 4: Correr el test y verlo fallar**

```bash
npx vitest run src/pages/Reporte.test.jsx
```

Esperado: FALLA, no existe `Reporte.jsx`.

- [ ] **Paso 5: Escribir la página**

Crear `web/app/src/pages/Reporte.jsx`. Los tres slugs con anexo Sankey están en la constante `SANKEY_SLUGS`; el resto no monta el visor.

```jsx
import { Link, useParams } from 'react-router-dom';
import Footer from '../components/Footer.jsx';
import KeyFigure from '../components/KeyFigure.jsx';
import SankeyChart from '../components/SankeyChart.jsx';
import SourceList from '../components/SourceList.jsx';
import useDocumentHead from '../hooks/useDocumentHead.js';
import useReport from '../hooks/useReport.js';
import useReportDownload from '../hooks/useReportDownload.js';
import { useAuth } from '../lib/auth.jsx';

// Qué reportes tienen anexo interactivo. Se mantiene sincronizado con la
// constante ANNEXES de scripts/extract-sankey.mjs — si agregas uno allá,
// agrégalo acá.
const SANKEY_SLUGS = new Set(['en-que-gasta-el-estado-central', 'un-estado-tres-oficios', 'de-donde-viene-la-plata']);

const WRAP = { maxWidth: 760, margin: '0 auto', padding: '140px clamp(20px,5vw,40px) 0' };

export default function Reporte() {
  const { slug } = useParams();
  const { report, loading, notFound, error } = useReport(slug);
  const { user } = useAuth();
  const { downloadingId, downloadError, handleDownload } = useReportDownload();

  useDocumentHead({
    title: report ? `${report.title} — Inmerge` : 'Reporte — Inmerge',
    description: report?.summary || '',
    path: `/reportes/${slug}`,
    image: report ? `/covers/${report.slug}.png` : undefined,
    noIndex: notFound,
  });

  if (loading) {
    return (
      <>
        <div style={{ ...WRAP, paddingBottom: 120, color: 'var(--muted)', fontSize: 14 }}>Cargando…</div>
        <Footer borderTop />
      </>
    );
  }

  if (notFound || error) {
    return (
      <>
        <div style={{ ...WRAP, paddingBottom: 120 }}>
          <div style={{ fontFamily: "'Spectral',serif", fontWeight: 700, fontSize: 'clamp(28px,5vw,40px)', marginBottom: 16 }}>
            {notFound ? 'No encontramos ese reporte.' : 'No se pudo cargar el reporte.'}
          </div>
          <Link to="/reportes" className="link-hover" style={{ fontSize: 15, fontWeight: 600, color: 'var(--terracotta)' }}>
            Ver todos los reportes
          </Link>
        </div>
        <Footer borderTop />
      </>
    );
  }

  const busy = downloadingId === report.id;

  return (
    <>
      <div style={{ ...WRAP, paddingBottom: 80 }}>
        <Link to="/reportes" className="link-hover" style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1.2, color: 'var(--muted)' }}>
          ← REPORTES
        </Link>

        <h1
          style={{
            fontFamily: "'Spectral',serif",
            fontWeight: 700,
            fontSize: 'clamp(36px,6vw,60px)',
            lineHeight: 1.15,
            margin: '24px 0 20px',
          }}
        >
          {report.title}
        </h1>

        {report.summary && (
          <p style={{ fontSize: 'clamp(16px,2.2vw,19px)', lineHeight: 1.65, color: 'var(--muted)', marginBottom: 48, maxWidth: '58ch' }}>
            {report.summary}
          </p>
        )}

        <KeyFigure figure={report.key_figure} label={report.key_figure_label} />

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 32 }}>
          {user ? (
            <>
              <button
                type="button"
                onClick={() => handleDownload(report)}
                disabled={busy}
                className="btn-hover"
                style={{
                  background: 'var(--terracotta)',
                  color: 'var(--bg)',
                  border: 'none',
                  borderRadius: 3,
                  padding: '16px 28px',
                  fontSize: 15,
                  fontWeight: 600,
                  fontFamily: "'IBM Plex Sans',sans-serif",
                  cursor: busy ? 'default' : 'pointer',
                  opacity: busy ? 0.7 : 1,
                }}
              >
                {busy ? 'Preparando…' : 'Descargar el informe (PDF)'}
              </button>
              {downloadError && <div style={{ fontSize: 13, color: 'var(--rose)', marginTop: 12 }}>{downloadError}</div>}
            </>
          ) : (
            <>
              <Link
                to="/registro"
                state={{ redirectTo: `/reportes/${report.slug}` }}
                className="btn-hover"
                style={{
                  display: 'inline-block',
                  background: 'var(--terracotta)',
                  color: 'var(--bg)',
                  borderRadius: 3,
                  padding: '16px 28px',
                  fontSize: 15,
                  fontWeight: 600,
                }}
              >
                Crear cuenta para descargar
              </Link>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 12 }}>
                Es gratis. La cuenta se crea al instante y te da acceso a todos los reportes.
              </div>
            </>
          )}
        </div>

        <SourceList sources={report.sources} />
      </div>

      {SANKEY_SLUGS.has(report.slug) && (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '72px clamp(20px,5vw,40px) 0' }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1.4, color: 'var(--muted)', marginBottom: 8 }}>ANEXO INTERACTIVO</div>
          <div style={{ fontFamily: "'Spectral',serif", fontWeight: 600, fontSize: 'clamp(22px,3.5vw,30px)', marginBottom: 20 }}>
            El flujo, de punta a punta
          </div>
          <SankeyChart slug={report.slug} title={`Diagrama de flujo: ${report.title}`} />
          <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 12, marginBottom: 96 }}>
            Este diagrama es público, sin cuenta. El análisis completo está en el PDF.
          </div>
        </div>
      )}

      <Footer borderTop />
    </>
  );
}
```

- [ ] **Paso 6: Comprobar que `useDocumentHead` acepta `image`**

Abre `web/app/src/hooks/useDocumentHead.js`. Si no maneja un parámetro `image`, agrégaselo: debe escribir `og:image` y `twitter:image` con la URL absoluta (`SITE_URL` + la ruta). Sin eso, la Tarea 11 no tiene dónde engancharse y el `og:image` de la página de reporte no existe.

- [ ] **Paso 7: Registrar la ruta**

En `web/app/src/App.jsx`, junto a la ruta `/reportes`:

```jsx
<Route path="/reportes/:slug" element={<Reporte />} />
```

Importa `Reporte` como las demás páginas del archivo. **Ojo con el orden:** en react-router-dom 6 el orden no importa (gana la más específica), pero `/reportes/:slug` no debe quedar dentro de un `<Route path="/reportes">` con `<Outlet/>` a menos que lo montes bien anidado.

- [ ] **Paso 8: Correr los tests y verlos pasar**

```bash
npx vitest run src/pages/Reporte.test.jsx
npm test
npm run lint
npm run build
```

Esperado: los 6 nuevos en verde, la suite entera sin regresiones, lint sin errores nuevos, build limpio.

- [ ] **Paso 9: Commit**

```bash
npm run format
git add web/app/src/pages/Reporte.jsx web/app/src/pages/Reporte.test.jsx web/app/src/hooks/useReport.js web/app/src/components/KeyFigure.jsx web/app/src/components/SourceList.jsx web/app/src/App.jsx web/app/src/hooks/useDocumentHead.js
git commit -m "feat: a page per report at /reportes/:slug with its key figure and sources"
```

---

## Tarea 10: `/reportes` como índice de portafolio

**Archivos:**
- Modificar: `web/app/src/pages/Reportes.jsx`
- Modificar: `web/app/src/hooks/useReports.js`

**Interfaces:**
- Consume: las columnas de la Tarea 1, las portadas de la Tarea 6, la ruta de la Tarea 9.

**Tres problemas a la vez.** Hoy `/reportes` usa `ImagePlaceholder` (rectángulos rayados), no muestra la cifra clave, y con 5 elementos en 4 columnas deja uno solo con tres huecos al lado.

- [ ] **Paso 1: Ampliar el hook**

En `web/app/src/hooks/useReports.js`, agrega `key_figure` y `key_figure_label` al `select`. Deja el resto igual.

- [ ] **Paso 2: Reemplazar `ImagePlaceholder` por la portada real**

En cada tarjeta de `Reportes.jsx`, en lugar del placeholder:

```jsx
<img
  src={`/covers/${r.slug}.png`}
  alt=""
  loading="lazy"
  width={1200}
  height={630}
  style={{ width: '100%', height: 'auto', display: 'block', borderBottom: '1px solid var(--border)' }}
/>
```

`alt=""` a propósito: la portada repite el título que ya está en el texto de la tarjeta, así que para un lector de pantalla es decorativa y anunciarla dos veces estorba. `width`/`height` explícitos reservan el espacio y evitan que la grilla salte al cargar.

- [ ] **Paso 3: Que la tarjeta entera lleve a la página del reporte**

Envuelve el contenido de cada tarjeta en `<Link to={'/reportes/' + r.slug}>` con `className="card-hover"`. La acción de la tarjeta pasa a ser **entrar al reporte**, no descargar: la descarga vive en la página. Quita de la tarjeta el botón de descarga y su estado.

- [ ] **Paso 4: Asomar la cifra clave en la tarjeta**

Debajo del título, cuando exista:

```jsx
{r.key_figure && (
  <div style={{ fontFamily: "'Spectral',serif", fontWeight: 700, fontSize: 32, color: 'var(--terracotta)', lineHeight: 1, marginBottom: 8 }}>
    {r.key_figure}
  </div>
)}
```

- [ ] **Paso 5: Arreglar la grilla huérfana**

El problema es una grilla de ancho fijo que deja el último elemento solo. Cámbiala por una que reparta el espacio sobrante:

```jsx
style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32 }}
```

`auto-fit` (no `auto-fill`) colapsa las pistas vacías y estira las que quedan, así que 5 elementos nunca dejan tres huecos al lado del último. Compruébalo con **1, 2, 3, 4 y 5** reportes, no solo con 5.

- [ ] **Paso 6: Que el estado vacío se vea digno**

Con cero reportes publicados, `/reportes` no puede quedar en blanco — el spec lo exige explícitamente. Si no hay filas, muestra:

```jsx
<div style={{ border: '1px solid var(--border)', borderRadius: 3, padding: 'clamp(32px,6vw,56px)', textAlign: 'center' }}>
  <div style={{ fontFamily: "'Spectral',serif", fontWeight: 600, fontSize: 'clamp(20px,3vw,26px)', marginBottom: 12 }}>
    Estamos preparando la biblioteca.
  </div>
  <div style={{ fontSize: 15, color: 'var(--muted)', lineHeight: 1.6, maxWidth: '48ch', margin: '0 auto 24px' }}>
    Los primeros informes sobre gasto público peruano se publican en las próximas semanas. Mientras tanto, podemos conversar sobre tus datos.
  </div>
  <Link to="/contacto" className="btn-hover" style={{ display: 'inline-block', background: 'var(--terracotta)', color: 'var(--bg)', borderRadius: 3, padding: '14px 24px', fontSize: 15, fontWeight: 600 }}>
    Conversemos
  </Link>
</div>
```

- [ ] **Paso 7: Correr todo**

```bash
npm test
npm run lint
npm run build
```

- [ ] **Paso 8: Mirarlo en el navegador**

```bash
npm run dev
```

Comprueba en `http://localhost:5173/reportes`: las cinco portadas cargan, la cifra clave se lee, la tarjeta entera es clicable, y **no hay huecos al costado de ninguna fila**. Redimensiona la ventana hasta el ancho de un teléfono.

**Si no puedes abrir un navegador, dilo en el reporte** y no declares verificado lo que solo leíste en el código.

- [ ] **Paso 9: Commit**

```bash
npm run format
git add web/app/src/pages/Reportes.jsx web/app/src/hooks/useReports.js
git commit -m "feat: turn the report index into a portfolio with real covers and key figures"
```

---

## Tarea 11: Imagen social por defecto y reconciliar `CLAUDE.md`

**Archivos:**
- Modificar: `web/app/index.html`
- Modificar: `web/app/CLAUDE.md`

**Interfaces:**
- Consume: las portadas de la Tarea 6.

**Por qué importa.** WhatsApp es el canal principal del negocio y **no ejecuta JavaScript**: siempre lee las etiquetas estáticas de `index.html`, sin importar qué ruta se compartió. Así que `useDocumentHead` (Tarea 9) sirve para Googlebot pero no para WhatsApp. Hasta que haya prerenderizado, lo honesto es una imagen por defecto decente para todo el sitio.

- [ ] **Paso 1: Generar la imagen social del sitio**

Reutiliza el generador. Agrega al final de `scripts/build-covers.mjs`, antes de cerrar el navegador:

```js
  // La imagen por defecto del sitio: es la que ve WhatsApp para CUALQUIER ruta,
  // porque no ejecuta JS y nunca ve lo que escribe useDocumentHead.
  await page.setContent(
    coverPage({ title: 'Inmerge', subtitle: 'Consultoría en datos y estrategia. Análisis del gasto público peruano, con cada cifra a la vista.', keyFigure: null }),
    { waitUntil: 'networkidle' }
  );
  writeFileSync(join(HERE, '../public/og-default.png'), await page.screenshot({ type: 'png' }));
  console.log('✓ og-default.png');
```

```bash
npm run build:covers
```

- [ ] **Paso 2: Enlazarla en `index.html`**

En el `<head>`, junto a las demás etiquetas OG:

```html
<meta property="og:image" content="https://inmerge.pe/og-default.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
```

**La URL tiene que ser absoluta.** Una ruta relativa no funciona: el crawler no tiene una base contra la cual resolverla.

- [ ] **Paso 3: Reconciliar `CLAUDE.md`**

`CLAUDE.md` describe hoy un catálogo de 7 filas inventadas y no sabe nada de las páginas por reporte. Actualiza:

- **La tabla de rutas:** agrega `/reportes/:slug` → `Reporte.jsx`, pública e indexable, con la descarga tras cuenta.
- **El catálogo:** las 7 filas falsas se reemplazaron por 5 reales (migración `0015`), publicadas por `0016` solo después de que su `file_path` apunte a un PDF que existe. Lista los cinco slugs.
- **El pipeline de build:** `build:pdfs`, `build:covers`, `build:sankey` son **manuales, no parte de `npm run build`**. Deja escrito cuándo hay que correrlos: los PDFs cuando cambie un Markdown de Lima, las portadas cuando cambie un título o una cifra clave, los Sankey cuando llegue un anexo nuevo.
- **La trampa de las figuras:** los Markdown traen dos convenciones de ruta y ninguna resuelve; las 21 figuras viven planas en `figuras/eda/` y se resuelven por nombre de archivo. Documenta `INMERGE_FIGURES_DIR`.
- **Las dependencias nuevas:** Playwright (devDependency, solo pipeline) y `plotly.js-dist-min` (runtime, importado de forma diferida solo en las páginas con anexo).
- **Lo que sigue faltando:** la Fase 3 del spec (camino de cotización, `/servicios`, muestra de entregable) es el **Plan C**, no está hecha.
- **La nota de CloudFront ya está** en la sección de rutas desde el Plan A. Verifica que siga ahí y que ahora mencione que `/reportes/:slug` **ya existe**, así que la configuración de 403/404 → `index.html` pasó de precaución futura a **requisito del despliegue**.

- [ ] **Paso 4: Leer `CLAUDE.md` entero de corrido**

No lo revises por secciones. Léelo completo y busca contradicciones: ¿hay algún punto donde todavía diga que el catálogo tiene 7 filas, o que no hay páginas por reporte? Un documento parcheado sección por sección falla afirmando lo nuevo arriba y lo viejo tres pantallas abajo.

- [ ] **Paso 5: Verificar**

```bash
npm run format:check
npm test
npm run build
```

- [ ] **Paso 6: Commit**

```bash
npm run format
git add web/app/index.html web/app/CLAUDE.md web/app/scripts/build-covers.mjs web/app/public/og-default.png
git commit -m "feat: default social image, and record the new catalogue and build pipeline"
```

---

## Notas de verificación final

Antes de dar el plan por terminado, corre y **lee la salida** de:

```bash
cd web/app
npm test
npm run lint
npm run build
node scripts/verify-supabase.mjs
```

Y comprueba en el navegador:

1. `/reportes` muestra las **cinco** portadas reales, sin rectángulos de relleno y sin huecos al costado de ninguna fila.
2. Cada tarjeta lleva a su `/reportes/:slug`, y esa página muestra cifra clave, fuentes con enlace, y la descarga.
3. **Sin sesión**, la página de reporte se ve entera e invita a crear cuenta; **con sesión**, descarga el PDF de verdad.
4. Los tres reportes con anexo muestran el Sankey, **sin exigir cuenta**, y se navega en el ancho de un teléfono.
5. Un slug inventado (`/reportes/no-existe`) dice que no existe, no se queda cargando.
6. Los dos PDFs convertidos, abiertos junto a `informe_recaudacion_propia_2018_2025.pdf`, no desmerecen.
7. Con JavaScript desactivado la página sigue mostrando su contenido (el `<noscript>` del Plan A).

**Lo que este plan deliberadamente NO hace:**

- **La Fase 3 completa** (invitación a cotizar al final de cada reporte, `/servicios` escaneable, muestra de entregable, formulario de cotización con contexto). Es el **Plan C**.
- **La analítica** (Fase 4.6): no se puede instalar en un sitio que no está desplegado, y debe funcionar sobre hosting estático.
- **El prerenderizado** que haría que WhatsApp viera la imagen correcta por ruta. Hoy se resuelve con una imagen por defecto decente.
- **Configurar CloudFront.** Es trabajo de infraestructura del dueño. Pero con `/reportes/:slug` en producción, la regla 403/404 → `index.html` deja de ser precaución y pasa a ser **requisito**: sin ella, todo enlace profundo a un reporte devuelve 403.

**Pendiente del dueño, no del código:** rotar la `service_role` key de Supabase, comprar y configurar el dominio, y revisar los textos del catálogo (son un primer borrador derivado de los propios informes, escritos para ser editados).
