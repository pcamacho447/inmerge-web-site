// Receives Culqi webhook events and syncs `subscriptions`/`purchases` —
// this is the source of truth for renewals, failed charges, and
// cancellations, since those happen asynchronously on Culqi's side and
// can't be caught by the synchronous create-charge/create-subscription
// responses alone.
//
// !! NOT PRODUCTION-READY AS-IS — TWO THINGS NEED CONFIRMING AGAINST LIVE
// CULQI DOCS BEFORE DEPLOYING (I could ground the charges/plans/
// subscriptions request shapes in culqi-create-charge and
// culqi-create-subscription against real doc snippets, but not the webhook
// envelope — don't have a sourced answer for these two, so don't trust the
// guesses below):
//   1. The exact JSON shape of a webhook event (event type field name and
//      where the charge/subscription id lives in the payload) — the field
//      names used below (`event.type`, `event.data.id`) are a plausible
//      guess based on common webhook conventions, not a verified Culqi
//      contract.
//   2. How to verify the request actually came from Culqi (signature
//      header + algorithm, or an IP allowlist). Shipping this without that
//      check means anyone who finds this URL could POST fake "payment
//      succeeded" events. Do not go live without adding it.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req) => {
  // TODO: verify the request's authenticity (signature/secret) before
  // trusting anything in the body. See file header.

  const event = await req.json();
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  switch (event.type) {
    case 'charge.succeeded': {
      await supabase.from('purchases').update({ status: 'paid' }).eq('culqi_charge_id', event.data.id);
      break;
    }
    case 'charge.failed': {
      await supabase.from('purchases').update({ status: 'failed' }).eq('culqi_charge_id', event.data.id);
      break;
    }
    case 'subscription.renewed': {
      await supabase
        .from('subscriptions')
        .update({
          status: 'active',
          current_period_start: event.data.current_period_start ?? new Date().toISOString(),
          current_period_end: event.data.current_period_end ?? null,
          updated_at: new Date().toISOString(),
        })
        .eq('culqi_subscription_id', event.data.id);
      break;
    }
    case 'subscription.payment_failed': {
      await supabase
        .from('subscriptions')
        .update({ status: 'past_due', updated_at: new Date().toISOString() })
        .eq('culqi_subscription_id', event.data.id);
      break;
    }
    case 'subscription.canceled': {
      await supabase
        .from('subscriptions')
        .update({ status: 'canceled', updated_at: new Date().toISOString() })
        .eq('culqi_subscription_id', event.data.id);
      break;
    }
    default:
      // Unhandled event types are logged, not errored — Culqi may add new
      // event types over time and a 500 here could trigger retry storms.
      console.log('Unhandled Culqi webhook event type:', event.type);
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
