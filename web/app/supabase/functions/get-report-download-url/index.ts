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

const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // tighten to your real domain once deployed
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const SIGNED_URL_TTL_SECONDS = 300;

Deno.serve(async (req) => {
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

  const { report_id } = await req.json();
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
