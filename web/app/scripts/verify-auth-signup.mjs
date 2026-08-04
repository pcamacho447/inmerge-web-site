// One-off check: exercises a real supabase.auth.signUp() call to confirm
// (a) the API call itself succeeds against this project, and (b) whether
// email confirmation is on (determines which code path auth.jsx's signup()
// takes in practice). Creates one disposable test user in auth.users —
// safe to delete afterward from Supabase Dashboard > Authentication > Users.
//
// Run with: node scripts/verify-auth-signup.mjs
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createClient } from '@supabase/supabase-js';

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

const testEmail = `verify-auth-${Date.now()}@gmail.com`;
const testPassword = 'verify-test-password-123';

console.log(`Signing up ${testEmail} ...\n`);

const { data, error } = await supabase.auth.signUp({
  email: testEmail,
  password: testPassword,
  options: { data: { full_name: 'Verify Script', billing_type: 'persona_natural', tax_id: null } },
});

if (error) {
  console.error('✗ signUp failed:', error.message);
  process.exit(1);
}

console.log('✓ signUp call succeeded.');
console.log(`  auth user id: ${data.user?.id}`);

if (data.session) {
  console.log('  Session returned immediately — email confirmation is OFF for this project.');
  console.log('  (auth.jsx will create profile/organization rows right away on signup.)');
} else {
  console.log('  No session returned — email confirmation is ON for this project.');
  console.log('  (auth.jsx will show "check your email"; profile/org rows get created on first login after confirming.)');
}

console.log(
  `\nTest user created: ${testEmail} — safe to delete from Supabase Dashboard > Authentication > Users if you want to clean it up.`,
);
