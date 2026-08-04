// Tests the deployed get-report-download-url Edge Function end-to-end
// against a real signed-in user. Run this YOURSELF — your password stays
// on your machine, it's never sent to anyone but your own Supabase project.
//
// Usage: node scripts/test-download-url.mjs <email> <password> <report-slug>
// Example: node scripts/test-download-url.mjs you@example.com yourpassword seguimiento-trimestral-educacion
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createClient } from '@supabase/supabase-js';

const [, , email, password, slug] = process.argv;
if (!email || !password || !slug) {
  console.error('Usage: node scripts/test-download-url.mjs <email> <password> <report-slug>');
  process.exit(1);
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '..', '.env.local');
if (!existsSync(envPath)) {
  console.error('Missing .env.local.');
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

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

const { data: signIn, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
if (signInError) {
  console.error('✗ Sign-in failed:', signInError.message);
  process.exit(1);
}
console.log(`✓ Signed in as ${email} (user id: ${signIn.user.id})`);

const { data: report, error: reportError } = await supabase.from('reports').select('id, title').eq('slug', slug).single();
if (reportError || !report) {
  console.error(`✗ No report found with slug "${slug}"`);
  process.exit(1);
}
console.log(`  Testing against report: ${report.title} (${report.id})`);

const functionUrl = `${env.VITE_SUPABASE_URL}/functions/v1/get-report-download-url`;
const res = await fetch(functionUrl, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${signIn.session.access_token}`,
    'Content-Type': 'application/json',
    apikey: env.VITE_SUPABASE_ANON_KEY,
  },
  body: JSON.stringify({ report_id: report.id }),
});
const body = await res.json();

console.log(`\nResponse (${res.status}):`, body);

if (res.status === 403)
  console.log(
    '\n→ Correctly blocked — this user has no purchase/subscription for this report. Expected if you have not inserted a test purchase yet.',
  );
else if (res.status === 404)
  console.log('\n→ Entitlement check passed, but no file is uploaded for this report yet — expected, no real report files exist yet.');
else if (res.status === 200) console.log('\n→ Full success — entitled, and got a real signed download URL.');
else console.log('\n→ Unexpected status — see the response body above.');
