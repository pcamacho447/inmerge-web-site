// Creates a Culqi subscription against a pre-existing Culqi Plan (monthly or
// annual — these Plans must be created once, manually, in the Culqi
// dashboard or via their /plans endpoint; their IDs go in the
// CULQI_PLAN_ID_MONTHLY / CULQI_PLAN_ID_ANNUAL env vars below, they are not
// created by this function).
//
// Request body: { plan: 'monthly' | 'annual', culqi_card_id: string }
// `culqi_card_id` is a Culqi Card object id (not a raw one-time token) —
// per Culqi's subscriptions API, which takes card_id + plan_id + tyc.
// The frontend must tokenize the card and create the Card object via
// Culqi.js first.
//
// Field names verified against Culqi's own SDK docs as of this writing.
// Re-check https://docs.culqi.com before relying on this in production —
// written from search-indexed doc snippets, not a full fetch of the live
// reference.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const CULQI_SECRET_KEY = Deno.env.get('CULQI_SECRET_KEY')!;
const CULQI_PLAN_ID_MONTHLY = Deno.env.get('CULQI_PLAN_ID_MONTHLY')!;
const CULQI_PLAN_ID_ANNUAL = Deno.env.get('CULQI_PLAN_ID_ANNUAL')!;
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

  const { plan, culqi_card_id } = await req.json();
  if (plan !== 'monthly' && plan !== 'annual') {
    return new Response(JSON.stringify({ error: "plan must be 'monthly' or 'annual'" }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  if (!culqi_card_id) {
    return new Response(JSON.stringify({ error: 'culqi_card_id is required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const planId = plan === 'monthly' ? CULQI_PLAN_ID_MONTHLY : CULQI_PLAN_ID_ANNUAL;

  const culqiResponse = await fetch('https://api.culqi.com/v2/subscriptions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${CULQI_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      card_id: culqi_card_id,
      plan_id: planId,
      tyc: true,
      metadata: { supabase_user_id: user.id },
    }),
  });

  const subscription = await culqiResponse.json();

  if (!culqiResponse.ok) {
    return new Response(JSON.stringify({ error: 'Subscription creation failed', detail: subscription }), {
      status: 402,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Recorded optimistically as 'active' — culqi-webhook is the source of
  // truth for subsequent renewals, failed charges, and cancellations, and
  // will overwrite this row's status/period fields as events arrive.
  const { error: insertError } = await supabase.from('subscriptions').insert({
    user_id: user.id,
    plan,
    status: 'active',
    culqi_subscription_id: subscription.id,
    current_period_start: new Date().toISOString(),
  });

  if (insertError) {
    return new Response(
      JSON.stringify({
        error: 'Subscription created in Culqi but failed to record it — contact support',
        culqi_subscription_id: subscription.id,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
