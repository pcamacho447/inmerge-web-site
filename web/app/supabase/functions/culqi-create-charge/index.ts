// Creates a one-off Culqi charge for a single premium report purchase, and
// records it in `purchases` on success.
//
// Request body: { report_id: string, culqi_token: string }
// `culqi_token` comes from the frontend tokenizing the card with Culqi.js —
// raw card numbers must never reach this function or any of our servers.
//
// Culqi Charges API fields (amount/currency_code/source_id/email/capture/
// description) verified against Culqi's own SDK docs as of this writing.
// Re-check https://docs.culqi.com before relying on this in production —
// this was written from search-indexed doc snippets, not a full fetch of
// the live reference.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const CULQI_SECRET_KEY = Deno.env.get('CULQI_SECRET_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

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

  const { report_id, culqi_token } = await req.json();
  if (!report_id || !culqi_token) {
    return new Response(JSON.stringify({ error: 'report_id and culqi_token are required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { data: report, error: reportError } = await supabase
    .from('reports')
    .select('id, tier, price_pen, title')
    .eq('id', report_id)
    .single();

  if (reportError || !report) {
    return new Response(JSON.stringify({ error: 'Report not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  if (report.tier !== 'premium' || !report.price_pen) {
    return new Response(JSON.stringify({ error: 'This report is not purchasable' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Culqi amounts are integers with no decimal point (i.e. cents of PEN).
  const amountInCents = Math.round(Number(report.price_pen) * 100);

  const culqiResponse = await fetch('https://api.culqi.com/v2/charges', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${CULQI_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: amountInCents,
      currency_code: 'PEN',
      email: user.email,
      source_id: culqi_token,
      capture: true,
      description: `Inmerge — ${report.title}`,
    }),
  });

  const charge = await culqiResponse.json();

  if (!culqiResponse.ok) {
    return new Response(JSON.stringify({ error: 'Payment failed', detail: charge }), {
      status: 402,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { error: insertError } = await supabase.from('purchases').insert({
    user_id: user.id,
    report_id: report.id,
    amount_pen: report.price_pen,
    culqi_charge_id: charge.id,
    status: 'paid',
  });

  if (insertError) {
    // The charge succeeded but we failed to record it — this needs manual
    // reconciliation against the Culqi dashboard using charge.id, not a
    // silent failure to the user who was already billed.
    return new Response(
      JSON.stringify({ error: 'Payment succeeded but recording it failed — contact support', culqi_charge_id: charge.id }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  return new Response(JSON.stringify({ success: true, report_id: report.id }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
