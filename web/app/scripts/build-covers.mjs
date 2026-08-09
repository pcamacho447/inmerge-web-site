// Genera una portada PNG de 1200x630 por reporte publicado.
//
// La misma imagen cumple dos funciones: portada en el catálogo y og:image al
// compartir por WhatsApp. Se construye una vez y se usa en los dos lugares —
// duplicar la pieza sería garantizar que se desvíen.
//
// Uso: node scripts/build-covers.mjs
// Lee el catálogo con la anon key (solo SELECT de filas publicadas, que es lo
// que la RLS permite). No necesita service_role.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { chromium } from 'playwright';
import { coverPage } from './lib/brandPage.mjs';

const HERE = resolve(fileURLToPath(new URL('.', import.meta.url)));
const OUT_DIR = join(HERE, '../public/covers');

// No hay nada en este entorno que cargue .env.local en process.env (esto no
// es Vite ni Next): se lee a mano, igual que scripts/verify-supabase.mjs.
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '..', '.env.local');

if (!existsSync(envPath)) {
  console.error('Falta .env.local en la raíz del proyecto. Copia .env.example y completa las claves de Supabase.');
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
const ANON = env.VITE_SUPABASE_ANON_KEY;
if (!URL_ || !ANON) {
  console.error('Faltan VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY en .env.local.');
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

  // La Tarea 4 encontró que page.setContent() con una fuente de Google Fonts
  // puede fallar en silencio: la petición de red no se resuelve (o no hay
  // conexión) y Chromium cae a la serif del sistema sin lanzar ningún error ni
  // evento — el archivo sale, con las dimensiones correctas, pero con la
  // tipografía equivocada. `waitUntil: 'networkidle'` no lo garantiza porque
  // la fuente puede llegar a tiempo para la red pero no para el layout, o
  // viceversa. La verdad de fondo es document.fonts: si Spectral e IBM Plex
  // Sans no están en el set de fuentes cargadas, la portada no es válida,
  // aunque el PNG exista.
  const fontFailures = [];

  for (const r of reports) {
    // La bajada del catálogo es larga para la portada; la primera oración es la
    // que funciona a ese tamaño.
    const subtitle = (r.summary || '').split(/(?<=\.)\s/)[0] || '';
    await page.setContent(coverPage({ title: r.title, subtitle, keyFigure: r.key_figure }), { waitUntil: 'networkidle' });

    const fontsOk = await page.evaluate(async () => {
      await document.fonts.ready;
      return document.fonts.check('700 64px Spectral') && document.fonts.check('400 21px "IBM Plex Sans"');
    });
    if (!fontsOk) {
      fontFailures.push(r.slug);
    }

    const out = join(OUT_DIR, `${r.slug}.png`);
    writeFileSync(out, await page.screenshot({ type: 'png' }));
    console.log(`✓ ${r.slug}.png`);
  }

  await browser.close();
  console.log(`\n${reports.length} portada(s) en public/covers/`);

  if (fontFailures.length) {
    console.error(`\n✗ Google Fonts no cargó (título en la serif del sistema, no Spectral) en: ${fontFailures.join(', ')}`);
    console.error('  Los PNG se generaron igual, pero con la tipografía equivocada: no los publiques así.');
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
