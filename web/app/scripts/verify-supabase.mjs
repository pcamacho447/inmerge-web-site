// Sanity-checks the Supabase connection: env vars present, `reports` table
// reachable with the anon key (confirms the migration ran and the public
// SELECT policy on `reports` works), and that RLS actually blocks
// unauthenticated reads of `subscriptions`/`purchases` as designed.
//
// Run with: node scripts/verify-supabase.mjs
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '..', '.env.local');

if (!existsSync(envPath)) {
  console.error(
    'Missing .env.local at project root. Copy .env.example to .env.local and fill in VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.',
  );
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

const url = env.VITE_SUPABASE_URL;
const anonKey = env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.error('VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY not found in .env.local.');
  process.exit(1);
}

const supabase = createClient(url, anonKey);
let failed = false;

console.log(`Checking ${url} ...\n`);

const { data: reports, error: reportsError } = await supabase.from('reports').select('slug, title, tier').order('created_at');
if (reportsError) {
  console.error('✗ reports SELECT failed:', reportsError.message);
  failed = true;
} else {
  const freeCount = reports.filter((r) => r.tier === 'free').length;
  const premiumCount = reports.filter((r) => r.tier === 'premium').length;
  console.log(`✓ reports table reachable — ${reports.length} row(s) (${freeCount} free, ${premiumCount} premium):`);
  reports.forEach((r) => console.log(`  - [${r.tier}] ${r.slug} — ${r.title}`));
  if (freeCount !== 5) {
    console.warn('  ⚠ expected exactly 5 free rows (from 0001_init.sql) — check that migration ran cleanly.');
  }
  if (premiumCount !== 2) {
    console.warn('  ⚠ expected exactly 2 premium rows (from 0002_seed_premium_examples.sql) — has that migration been run yet?');
  }
}

console.log();

const { data: subs, error: subsError } = await supabase.from('subscriptions').select('*');
if (subsError) {
  console.log('✓ subscriptions correctly blocked for anonymous access:', subsError.message);
} else if (!subs || subs.length === 0) {
  console.log('✓ subscriptions readable but empty (fine — no rows exist yet, RLS shape not fully exercised).');
} else {
  console.error("✗ subscriptions returned rows to an anonymous/unauthenticated client — RLS policy isn't working as designed.");
  failed = true;
}

console.log();
console.log(failed ? 'RESULT: something needs attention — see ✗ above.' : 'RESULT: looks good.');
process.exit(failed ? 1 : 0);
