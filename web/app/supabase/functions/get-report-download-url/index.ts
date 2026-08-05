// Checks entitlement via has_access() and, if authorized, returns a
// short-lived signed URL into the private `report-files` Storage bucket.
// This is the single choke point for report delivery — the frontend never
// talks to Storage directly, so file paths are never public/guessable.
//
// Request body: { report_id: string }
//
// CORS headers are inlined (not imported from ../_shared/cors.ts) so this
// file can be deployed by pasting it directly into the Supabase Dashboard's
// Edge Function editor, which doesn't resolve relative imports across
// files. If this ever moves to CLI-based deployment, it's fine to switch
// back to the shared import for consistency with the other 3 functions.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// El origen va fijado, no en '*': la función se despliega con --no-verify-jwt,
// así que es accesible desde cualquier lado y el CORS es la única barrera de
// navegador que queda. Agrega acá el dominio real cuando exista.
const ALLOWED_ORIGINS = ['http://localhost:5173', 'https://inmerge.pe'];

function corsFor(req: Request) {
  const origin = req.headers.get('Origin') ?? '';
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    Vary: 'Origin',
  };
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const SIGNED_URL_TTL_SECONDS = 300;

Deno.serve(async (req) => {
  const corsHeaders = corsFor(req);
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
  if (userError || !user) {
    return new Response(JSON.stringify({ error: 'Invalid session' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Sin esto, un cuerpo que no sea JSON lanza y el runtime emite un 500 SIN
  // cabeceras CORS, así que el navegador reporta un error de CORS en vez del
  // problema real.
  let report_id: string | undefined;
  try {
    ({ report_id } = await req.json());
  } catch {
    return new Response(JSON.stringify({ error: 'Cuerpo inválido: se esperaba JSON' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  if (!report_id) {
    return new Response(JSON.stringify({ error: 'report_id is required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { data: allowed, error: accessError } = await supabase.rpc('has_access', {
    p_user_id: user.id,
    p_report_id: report_id,
  });
  if (accessError || !allowed) {
    return new Response(JSON.stringify({ error: 'Not entitled to this report' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { data: report, error: reportError } = await supabase
    .from('reports')
    .select('file_path')
    .eq('id', report_id)
    .single();
  if (reportError || !report?.file_path) {
    return new Response(JSON.stringify({ error: 'Report file not available yet' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { data: signed, error: signError } = await supabase.storage
    .from('report-files')
    .createSignedUrl(report.file_path, SIGNED_URL_TTL_SECONDS);
  if (signError || !signed) {
    return new Response(JSON.stringify({ error: 'Could not generate download link' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ url: signed.signedUrl, expires_in: SIGNED_URL_TTL_SECONDS }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
