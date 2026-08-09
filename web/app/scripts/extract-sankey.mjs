// Extrae el payload de datos de los tres anexos Sankey.
//
// Cada HTML pesa 4.64 MB, de los cuales los datos son 8.5-12.4 KB: el resto es
// Plotly empaquetado, repetido tres veces. Servirlos por iframe mandaría 14 MB
// para mostrar 30 KB. Acá se saca el JSON y el visor carga UNA sola copia de la
// librería, compartida por los tres.
//
// Uso: node scripts/extract-sankey.mjs

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// `new URL('.', import.meta.url)` se rompe bajo el entorno jsdom de vitest: el
// `URL` global de jsdom ignora la base `file:` que se le pasa y resuelve contra
// `http://localhost:3000/` en su lugar. `fileURLToPath` sobre el string crudo
// no pasa por ese `URL` parcheado, así que se usa `dirname` en vez de una
// segunda URL relativa.
const HERE = dirname(fileURLToPath(import.meta.url));
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
