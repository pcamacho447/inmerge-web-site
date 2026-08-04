import { supabase } from './supabaseClient.js';

// PHASE B3 — report delivery. Calls the get-report-download-url Edge Function,
// which verifies entitlement server-side via has_access() and returns a
// short-lived signed URL into the private `report-files` bucket. functions.invoke
// attaches the current session's Authorization header automatically, so the
// user identity the function checks is the real signed-in user. Returns the
// signed URL on success; throws with a user-facing (Spanish) message on failure.
export async function getReportDownloadUrl(reportId) {
  const { data, error } = await supabase.functions.invoke('get-report-download-url', {
    body: { report_id: reportId },
  });

  if (error) {
    // A non-2xx lands here as a FunctionsHttpError, with the Response in
    // error.context. Surface its real reason: our function returns { error },
    // but the Supabase gateway (Verify JWT) returns { message } — read either.
    // clone() so the body can still be read if something else needs it.
    let message = 'No se pudo generar el enlace de descarga. Intenta de nuevo.';
    const status = error.context?.status;
    try {
      const body = await error.context?.clone().json();
      if (body?.error || body?.message) message = body.error || body.message;
    } catch {
      /* non-JSON / network error (FunctionsFetchError has no context) — keep default */
    }
    console.error('[download] get-report-download-url failed', { status, error });
    throw new Error(status ? `${message} (HTTP ${status})` : message);
  }

  if (!data?.url) throw new Error('Respuesta inesperada del servidor.');
  return data.url;
}
