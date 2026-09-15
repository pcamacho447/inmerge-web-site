// Shared CORS headers for browser-invoked Edge Functions (culqi-webhook is
// server-to-server from Culqi and doesn't need this, but including it is
// harmless).
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // tighten to your real domain once deployed
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
