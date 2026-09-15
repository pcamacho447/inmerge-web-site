import { corsHeaders } from '../_shared/cors.ts';

const ALERT_WEBHOOK_URL = Deno.env.get('ALERT_WEBHOOK_URL') || Deno.env.get('SLACK_WEBHOOK_URL') || Deno.env.get('DISCORD_WEBHOOK_URL');
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    const { deliverable, project, clientEmail, clientName } = payload;

    if (!deliverable || !deliverable.title) {
      return new Response(JSON.stringify({ error: 'Payload must contain deliverable details' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let webhookDelivered = false;
    let emailDelivered = false;

    // 1. Notify Client via Email if client email and Resend are available
    if (RESEND_API_KEY && clientEmail) {
      try {
        const emailRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Inmerge Informes <informes@inmerge.pe>',
            to: [clientEmail],
            subject: `[Nuevo Entregable Disponible] ${deliverable.title} — ${project?.title || 'Proyecto Inmerge'}`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #241A12; line-height: 1.6;">
                <div style="background: #241A12; color: #F3EADA; padding: 20px; text-align: center;">
                  <h2 style="margin: 0; font-size: 20px; letter-spacing: 1px;">INMERGE — ENTREGABLE PUBLICADO</h2>
                </div>
                <div style="background: #F3EADA; padding: 24px; border: 1px solid #D8A84E;">
                  <p style="font-size: 16px; margin-top: 0;">Estimado(a) <strong>${clientName || 'Cliente'}</strong>,</p>
                  <p>Te informamos que tu equipo técnico ha publicado un nuevo entregable correspondiente a tu proyecto:</p>
                  <div style="background: #fff; padding: 18px; border-radius: 6px; border: 1px solid #EBDFC9; margin: 16px 0;">
                    <h3 style="margin: 0 0 8px; color: #A8472B; font-size: 18px;">${deliverable.title}</h3>
                    <p style="margin: 4px 0; font-size: 14px;"><strong>Tipo de Documento:</strong> ${deliverable.file_type || 'PDF'}</p>
                    <p style="margin: 4px 0; font-size: 14px;"><strong>Versión:</strong> ${deliverable.version || 'v1.0'}</p>
                    ${deliverable.notes ? `<p style="margin: 8px 0 0; font-size: 13px; color: #555;"><strong>Notas:</strong> ${deliverable.notes}</p>` : ''}
                  </div>
                  <div style="text-align: center; margin: 28px 0;">
                    <a href="https://inmerge.pe/cuenta" style="background: #A8472B; color: #F3EADA; padding: 12px 28px; text-decoration: none; font-weight: bold; border-radius: 24px; font-size: 14px; display: inline-block;">
                      Acceder a mi Portal de Clientes →
                    </a>
                  </div>
                  <p style="font-size: 13px; color: #666; margin-bottom: 0;">Si tienes alguna duda técnica o consulta sobre los resultados, puedes escribir directamente a tu Tech Lead desde tu panel.</p>
                </div>
              </div>
            `,
          }),
        });
        emailDelivered = emailRes.ok;
      } catch (mailErr) {
        console.error('Error sending deliverable email:', mailErr);
      }
    }

    // 2. Dispatch internal Webhook if configured
    if (ALERT_WEBHOOK_URL) {
      try {
        const whRes = await fetch(ALERT_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: `📦 **Nuevo Entregable Publicado**\n📁 **Documento:** ${deliverable.title} (${deliverable.file_type || 'PDF'} ${deliverable.version || 'v1.0'})\n🎯 **Proyecto:** ${project?.title || 'N/A'}\n👤 **Cliente:** ${clientName || 'N/A'} (${clientEmail || 'N/A'})`,
          }),
        });
        webhookDelivered = whRes.ok;
      } catch (whErr) {
        console.error('Error dispatching deliverable alert webhook:', whErr);
      }
    }

    console.log(`[notify-deliverable] Processed deliverable ${deliverable.id || deliverable.title} | Webhook: ${webhookDelivered} | Email: ${emailDelivered}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Deliverable notification processed successfully',
        delivered: {
          webhook: webhookDelivered,
          email: emailDelivered,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[notify-deliverable] Error processing request:', error);
    return new Response(JSON.stringify({ error: (error as Error).message || 'Internal Server Error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
