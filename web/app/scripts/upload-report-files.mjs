// Sube los cinco PDFs al bucket privado `report-files` y escribe reports.file_path.
//
// Uso:
//   node scripts/upload-report-files.mjs
//
// Las credenciales se leen de .env.local (mismo patrón que scripts/verify-supabase.mjs
// y scripts/test-download-url.mjs), NO de variables de entorno del shell: nada en este
// repo las exporta al entorno, y pedirle al operador que las pegue en la terminal es
// justo la clase de paso manual que termina con una key en una transcripción.
//
// La SUPABASE_SERVICE_ROLE_KEY NUNCA se imprime. Si la ves en la salida de este
// script, es un bug: arréglalo antes de seguir.
//
// El bucket es privado: la descarga siempre pasa por la Edge Function
// get-report-download-url, que consulta has_access() y firma una URL de 5
// minutos. Subir acá no expone nada públicamente.

import { readFileSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const HERE = resolve(__dirname);
const REPO = resolve(HERE, '../../..');

const envPath = join(__dirname, '..', '.env.local');
if (!existsSync(envPath)) {
  console.error('Missing .env.local en web/app/.');
  process.exit(1);
}
const env = Object.fromEntries(
  readFileSync(envPath, 'utf-8')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => {
      const idx = line.indexOf('=');
      return [line.slice(0, idx), line.slice(idx + 1)];
    }),
);

const URL_ = env.VITE_SUPABASE_URL;
const KEY = env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL_ || !KEY) {
  console.error('Faltan VITE_SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY en .env.local.');
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

    const { data, error: dbErr } = await supabase.from('reports').update({ file_path: objectName }).eq('slug', f.slug).select('slug');
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
