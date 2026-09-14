import { corsHeaders } from '../_shared/cors.ts';

const ALERT_WEBHOOK_URL = Deno.env.get('ALERT_WEBHOOK_URL') || Deno.env.get('SLACK_WEBHOOK_URL') || Deno.env.get('DISCORD_WEBHOOK_URL');
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const CONSULTING_INBOX = Deno.env.get('CONSULTING_INBOX') || 'contacto@inmerge.pe';

const PILLAR_NAMES: Record<string, string> = {
  auditoria: '01. Auditoría Técnica & Datos',
  desarrollo: '02. Desarrollo Cloud & AWS',
  datos: '03. Datos & Inteligencia Artificial',
  integral: 'Solución Integral Multi-Pilar',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    // Support either direct payload { lead } or Supabase database webhook record { record }
    const lead = payload.record || payload.lead || payload;

    if (!lead || !lead.email) {
      return new Response(JSON.stringify({ error: 'Payload must contain lead details and email' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const pillarName = PILLAR_NAMES[lead.pillar] || lead.pillar || 'No especificado';
    const clientName = lead.full_name || 'Prospecto';
    const company = lead.company ? ` en ${lead.company}` : '';

    let webhookDelivered = false;
    let emailDelivered = false;

    // 1. Dispatch Webhook Notification (Slack / Discord / n8n / Zapier)
    if (ALERT_WEBHOOK_URL) {
      try {
        const webhookPayload = {
          content: `🔔 **Nuevo Lead TDR Recibido en Inmerge**\n👤 **Solicitante:** ${clientName}${company}\n📧 **Email:** ${lead.email} | 📞 **Tel:** ${lead.phone || 'N/A'}\n🏛️ **Pilar:** ${pillarName}\n⏱️ **Plazo:** ${lead.timeline || 'A coordinar'}\n📝 **Requerimiento:**\n> ${lead.message || 'Sin mensaje adicional'}`,
          text: `Nuevo Lead TDR Recibido: ${clientName} (${pillarName})`,
          attachments: [
            {
              color: '#A8472B', // Inmerge Terracotta
              title: `Solicitud de Cotización TDR — ${clientName}${company}`,
              fields: [
                { title: 'Pilar', value: pillarName, short: true },
                { title: 'Email', value: lead.email, short: true },
                { title: 'Teléfono', value: lead.phone || 'N/A', short: true },
                { title: 'Plazo', value: lead.timeline || 'A coordinar', short: true },
                { title: 'Descripción', value: lead.message || 'N/A', short: false },
              ],
            },
          ],
        };

        const whRes = await fetch(ALERT_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(webhookPayload),
        });
        webhookDelivered = whRes.ok;
      } catch (whErr) {
        console.error('Error dispatching alert webhook:', whErr);
      }
    }

    // 2. Dispatch Email via Resend if API key present
    if (RESEND_API_KEY) {
      try {
        const emailRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Inmerge Notificaciones <notificaciones@inmerge.pe>',
            to: [CONSULTING_INBOX],
            subject: `[Nuevo Lead TDR] ${clientName}${company} — ${pillarName}`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #241A12; line-height: 1.6;">
                <div style="background: #241A12; color: #F3EADA; padding: 20px; text-align: center;">
                  <h2 style="margin: 0; font-size: 20px; letter-spacing: 1px;">INMERGE — NUEVA SOLICITUD TDR</h2>
                </div>
                <div style="background: #F3EADA; padding: 24px; border: 1px solid #D8A84E;">
                  <p style="font-size: 16px; margin-top: 0;"><strong>Se ha recibido una nueva solicitud de consultoría:</strong></p>
                  <ul style="list-style: none; padding: 0;">
                    <li><strong>Solicitante:</strong> ${clientName}</li>
                    <li><strong>Empresa:</strong> ${lead.company || 'N/A'}</li>
                    <li><strong>Email:</strong> <a href="mailto:${lead.email}">${lead.email}</a></li>
                    <li><strong>Teléfono:</strong> ${lead.phone || 'N/A'}</li>
                    <li><strong>Pilar Requerido:</strong> ${pillarName}</li>
                    <li><strong>Plazo Estimado:</strong> ${lead.timeline || 'A coordinar'}</li>
                  </ul>
                  <div style="background: #fff; padding: 16px; border-left: 4px solid #A8472B; margin: 20px 0;">
                    <strong>Alcance del Requerimiento / TDR:</strong>
                    <p style="margin: 8px 0 0; white-space: pre-line;">${lead.message || 'Sin mensaje'}</p>
                  </div>
                  <p style="font-size: 13px; color: #666;">Puedes gestionar y cotizar esta solicitud directamente desde el <a href="https://inmerge.pe/equipo" style="color: #A8472B; font-weight: bold;">Panel de Equipo (/equipo)</a>.</p>
                </div>
              </div>
            `,
          }),
        });
        emailDelivered = emailRes.ok;
      } catch (mailErr) {
        console.error('Error sending notification email:', mailErr);
      }
    }

    console.log(`[notify-lead-tdr] Processed lead: ${lead.id || lead.email} | Webhook: ${webhookDelivered} | Email: ${emailDelivered}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Lead notification processed successfully',
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
    console.error('[notify-lead-tdr] Error processing request:', error);
    return new Response(JSON.stringify({ error: (error as Error).message || 'Internal Server Error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
