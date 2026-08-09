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

import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
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
// figuras están en una sola carpeta plana, así que el nombre del archivo
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
  // marked 18 le pasa a los métodos del renderer un solo objeto-token
  // (href/title/text/tokens), no argumentos posicionales como en versiones
  // viejas de la librería. Se adapta acá, no en el token en sí.
  renderer.image = ({ href, text }) => {
    const disk = resolveFigure(href);
    if (!existsSync(disk)) {
      missing.push(href);
      return `<p class="caption">[falta la figura: ${basename(href)}]</p>`;
    }
    // alt="" a propósito: el <div class="caption"> que sigue ya repite el
    // mismo texto de forma visible. Ponerlo también en alt hace que un
    // lector de pantalla lo diga dos veces; alt vacío marca la imagen como
    // decorativa y deja que el caption sea la única descripción leída.
    return `<img src="${toFileUrl(disk)}" alt=""><div class="caption">${text || ''}</div>`;
  };
  // El primer <h1> del markdown es el título, y brandPage() ya lo pone arriba.
  // Dejarlo en el cuerpo lo duplicaría en la primera página.
  let seenH1 = false;
  renderer.heading = ({ tokens, depth }) => {
    const textHtml = renderer.parser.parseInline(tokens);
    if (depth === 1 && !seenH1) {
      seenH1 = true;
      return '';
    }
    return `<h${depth}>${textHtml}</h${depth}>`;
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

    // page.setContent() deja el documento con origen opaco, y Chromium
    // bloquea ahí la carga de recursos file:// ("Not allowed to load local
    // resource"): las imágenes de las figuras nunca llegaban a pintarse, y el
    // PDF salía chico y sin ellas. Escribir el HTML a disco y navegar con
    // goto() le da al documento un origen file:// real, que sí puede cargar
    // imágenes file:// vecinas.
    //
    // El nombre lleva el pid: dos corridas concurrentes del script no deben
    // pisarse el mismo archivo temporal (una podría leer lo que la otra
    // todavía está escribiendo).
    const out = join(OUT_DIR, `${r.slug}.pdf`);
    const tmpHtml = join(OUT_DIR, `.tmp-${r.slug}-${process.pid}.html`);
    writeFileSync(tmpHtml, brandPage({ title, kicker: r.kicker, runningHead: r.runningHead, bodyHtml: html }));

    const page = await browser.newPage();
    // El bug de arriba (setContent + file://) ya nos mordió una vez y era
    // invisible: exit 0, PDF "generado", figuras rotas por dentro. Esto lo
    // convierte en una comprobación automática: si Chromium rechaza cargar
    // alguna imagen local durante el render, no hay que confiar en que
    // alguien abra el PDF a mano para notarlo. Se filtra a file:// nada más
    // porque el <link> de Google Fonts es una petición de red aparte que
    // puede fallar sin conexión sin que eso sea este problema — y si falla,
    // el PDF sale igual, solo con la tipografía de reserva del sistema.
    const resourceFailures = [];
    page.on('requestfailed', (req) => {
      if (req.url().startsWith('file://')) {
        resourceFailures.push(`${req.url()} — ${req.failure()?.errorText ?? 'sin detalle'}`);
      }
    });

    try {
      await page.goto(toFileUrl(tmpHtml), { waitUntil: 'networkidle' });
      // requestfailed no alcanza solo: se probó a propósito apuntando una
      // figura a una ruta que existe pero no es una imagen cargable (una
      // carpeta con el mismo nombre), y Chromium respondió con status 0 en
      // vez de disparar requestfailed — el <img> queda ahí, mudo, sin pintar
      // nada. La verdad de fondo es el DOM: si naturalWidth quedó en 0, la
      // figura no se ve, sea cual sea el mecanismo interno del fallo.
      const brokenImages = await page.evaluate(() =>
        Array.from(document.querySelectorAll('img'))
          .filter((img) => img.naturalWidth === 0)
          .map((img) => img.getAttribute('src')),
      );
      for (const src of brokenImages) {
        resourceFailures.push(`${src} — la imagen no pintó ningún píxel (naturalWidth 0)`);
      }
      await page.pdf({
        path: out,
        format: 'A4',
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate: `<div style="font-family:'IBM Plex Sans',sans-serif;font-size:7pt;letter-spacing:1.2pt;color:#7A6B58;width:100%;padding:0 18mm;">${r.runningHead} · REPORTE INMERGE</div>`,
        footerTemplate: `<div style="font-family:'IBM Plex Sans',sans-serif;font-size:7.5pt;color:#7A6B58;width:100%;padding:0 18mm;display:flex;justify-content:space-between;"><span>Inmerge · El dato, a la vista.</span><span>inmerge.pe</span></div>`,
        margin: { top: '22mm', bottom: '20mm', left: '18mm', right: '18mm' },
      });
    } finally {
      // Pase lo que pase (éxito, goto roto, pdf roto), no dejar el archivo
      // temporal tirado ni la página del navegador abierta.
      await page.close();
      rmSync(tmpHtml);
    }

    if (resourceFailures.length) {
      failed = true;
      console.error(`✗ ${r.slug}: Chromium rechazó ${resourceFailures.length} recurso(s) local(es) al renderizar:`);
      for (const f of resourceFailures) console.error(`    ${f}`);
      console.error('  El PDF se generó igual, pero con huecos: no lo publiques así.');
    } else {
      console.log(`✓ ${out}`);
    }
  }

  await browser.close();
  if (failed) {
    console.error(
      '\nHubo figuras faltantes o recursos locales rechazados por Chromium. Los PDFs se generaron igual, pero con huecos: no los publiques así.',
    );
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
