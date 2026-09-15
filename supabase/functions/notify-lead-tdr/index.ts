import { corsHeaders } from '../_shared/cors.ts';

const ALERT_WEBHOOK_URL =
  Deno.env.get('ALERT_WEBHOOK_URL') ||
  Deno.env.get('SLACK_WEBHOOK_URL') ||
  Deno.env.get('DISCORD_WEBHOOK_URL');

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const CONSULTING_INBOX = Deno.env.get('CONSULTING_INBOX') || 'inmerge3@gmail.com';
const RESEND_FROM = Deno.env.get('RESEND_FROM') || 'Inmerge <onboarding@resend.dev>';

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
    let internalEmailDelivered = false;
    let clientAutoresponderDelivered = false;

    console.log(`[notify-lead-tdr] Processing new lead from ${clientName} (${lead.email})`);
    console.log(`[notify-lead-tdr] Env status — Webhook: ${ALERT_WEBHOOK_URL ? 'CONFIGURED' : 'MISSING'} | Resend: ${RESEND_API_KEY ? 'CONFIGURED' : 'MISSING'} | Inbox: ${CONSULTING_INBOX}`);

    // 1. Dispatch Webhook Notification (Slack / Discord / n8n / Zapier)
    if (ALERT_WEBHOOK_URL) {
      try {
        const webhookPayload = {
          content: `🔔 **Nuevo Lead TDR Recibido en Inmerge**\n👤 **Solicitante:** ${clientName}${company}\n📧 **Email:** ${lead.email} | 📞 **Tel:** ${lead.phone || 'N/A'}\n🏛️ **Pilar:** ${pillarName}\n⏱️ **Plazo:** ${lead.timeline || 'A coordinar'}\n📝 **Requerimiento:**\n> ${lead.message || 'Sin mensaje adicional'}`,
          text: `🔔 *Nuevo Lead TDR Recibido en Inmerge*\n*👤 Solicitante:* ${clientName}${company}\n*📧 Email:* ${lead.email} | *📞 Tel:* ${lead.phone || 'N/A'}\n*🏛️ Pilar:* ${pillarName}\n*⏱️ Plazo:* ${lead.timeline || 'A coordinar'}\n*📝 Requerimiento:*\n>${lead.message || 'Sin mensaje adicional'}`,
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
        
        const whStatusText = await whRes.text();
        console.log(`[notify-lead-tdr] Webhook response: ${whRes.status} -> ${whStatusText}`);
        webhookDelivered = whRes.ok;
      } catch (whErr) {
        console.error('[notify-lead-tdr] Error dispatching alert webhook:', whErr);
      }
    } else {
      console.warn('[notify-lead-tdr] Webhook skipped: ALERT_WEBHOOK_URL is not set.');
    }

    // 2. Dispatch Internal Notification Email via Resend if API key present
    if (RESEND_API_KEY) {
      const internalEmailHtml = `
        <div style="font-family: 'IBM Plex Sans', sans-serif, -apple-system; max-width: 600px; margin: 0 auto; color: #241A12; line-height: 1.6; background-color: #F3EADA;">
          <div style="background: #241A12; color: #F3EADA; padding: 24px; text-align: center; border-bottom: 3px solid #D8A84E;">
            <h2 style="margin: 0; font-family: 'Spectral', Georgia, serif; font-size: 22px; letter-spacing: 1px;">INMERGE — NUEVA SOLICITUD TDR</h2>
            <p style="margin: 6px 0 0; font-size: 13px; color: #D8A84E; font-family: 'IBM Plex Mono', monospace;">CONSULTORÍA EN AUDITORÍA, CLOUD & IA</p>
          </div>
          <div style="padding: 28px; border: 1px solid #EBDFC9; background-color: #F3EADA;">
            <p style="font-size: 16px; margin-top: 0;"><strong>Se ha recibido una nueva solicitud de consultoría:</strong></p>
            <ul style="list-style: none; padding: 0; margin: 16px 0; background: #EBDFC9; padding: 16px; border-radius: 4px;">
              <li style="margin-bottom: 8px;"><strong>👤 Solicitante:</strong> ${clientName}</li>
              <li style="margin-bottom: 8px;"><strong>🏢 Empresa:</strong> ${lead.company || 'No especificada'}</li>
              <li style="margin-bottom: 8px;"><strong>📧 Email:</strong> <a href="mailto:${lead.email}" style="color: #A8472B;">${lead.email}</a></li>
              <li style="margin-bottom: 8px;"><strong>📞 Teléfono:</strong> ${lead.phone || 'No especificado'}</li>
              <li style="margin-bottom: 8px;"><strong>🏛️ Pilar Requerido:</strong> ${pillarName}</li>
              <li><strong>⏱️ Plazo Estimado:</strong> ${lead.timeline || 'A coordinar'}</li>
            </ul>
            <div style="background: #fff; padding: 18px; border-left: 4px solid #A8472B; margin: 20px 0; border-radius: 2px;">
              <strong style="color: #241A12; font-size: 14px;">Alcance del Requerimiento / TDR:</strong>
              <p style="margin: 8px 0 0; white-space: pre-line; font-size: 14px; color: #333;">${lead.message || 'Sin mensaje'}</p>
            </div>
            <div style="text-align: center; margin-top: 24px;">
              <a href="https://inmerge.pe/equipo" style="background: #A8472B; color: #F3EADA; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 4px; display: inline-block; font-size: 14px;">
                Gestionar en Panel de Consultores (/equipo) →
              </a>
            </div>
          </div>
        </div>
      `;

      async function sendResendEmail(fromAddress: string, toAddress: string, subject: string, html: string) {
        return await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromAddress,
            to: [toAddress],
            subject,
            html,
          }),
        });
      }

      try {
        console.log(`[notify-lead-tdr] Sending notification to ${CONSULTING_INBOX} from ${RESEND_FROM}...`);
        let internalEmailRes = await sendResendEmail(
          RESEND_FROM,
          CONSULTING_INBOX,
          `[Nuevo Lead TDR] ${clientName}${company} — ${pillarName}`,
          internalEmailHtml
        );

        let resText = await internalEmailRes.text();
        console.log(`[notify-lead-tdr] Resend internal response: ${internalEmailRes.status} -> ${resText}`);

        if (!internalEmailRes.ok && (resText.includes('domain is not verified') || resText.includes('testing'))) {
          console.log('[notify-lead-tdr] Retrying with onboarding@resend.dev...');
          internalEmailRes = await sendResendEmail(
            'Inmerge <onboarding@resend.dev>',
            CONSULTING_INBOX,
            `[Nuevo Lead TDR] ${clientName}${company} — ${pillarName}`,
            internalEmailHtml
          );
          resText = await internalEmailRes.text();
          console.log(`[notify-lead-tdr] Resend retry response: ${internalEmailRes.status} -> ${resText}`);
        }

        internalEmailDelivered = internalEmailRes.ok;
      } catch (mailErr) {
        console.error('[notify-lead-tdr] Error sending internal email:', mailErr);
      }

      // 3. Dispatch Autoresponder Confirmation to Client/Prospect
      try {
        const clientEmailHtml = `
          <div style="font-family: 'IBM Plex Sans', sans-serif, -apple-system; max-width: 600px; margin: 0 auto; color: #241A12; line-height: 1.6; background-color: #F3EADA;">
            <div style="background: #241A12; color: #F3EADA; padding: 28px; text-align: center; border-bottom: 3px solid #D8A84E;">
              <h1 style="margin: 0; font-family: 'Spectral', Georgia, serif; font-size: 24px; letter-spacing: 0.5px;">INMERGE</h1>
              <p style="margin: 6px 0 0; font-size: 13px; color: #D8A84E; font-family: 'IBM Plex Mono', monospace;">AUDITORÍA TÉCNICA · DESARROLLO CLOUD · CIENCIA DE DATOS</p>
            </div>
            <div style="padding: 32px; background-color: #F3EADA; border: 1px solid #EBDFC9;">
              <p style="font-size: 16px; margin-top: 0;">Estimado(a) <strong>${clientName}</strong>,</p>
              <p style="font-size: 15px; color: #333;">
                Confirmamos la recepción de tu solicitud de términos de referencia (TDR) y requerimiento de consultoría técnica.
              </p>
              
              <div style="background: #EBDFC9; padding: 20px; border-radius: 4px; margin: 20px 0; border: 1px solid #D8A84E;">
                <h3 style="margin: 0 0 10px; font-family: 'Spectral', Georgia, serif; color: #241A12; font-size: 18px;">Detalles de la Solicitud Registrada</h3>
                <p style="margin: 4px 0; font-size: 14px;"><strong>Pilar Estratégico:</strong> ${pillarName}</p>
                <p style="margin: 4px 0; font-size: 14px;"><strong>Plazo Objetivo:</strong> ${lead.timeline || 'Por coordinar'}</p>
                ${lead.company ? `<p style="margin: 4px 0; font-size: 14px;"><strong>Organización:</strong> ${lead.company}</p>` : ''}
              </div>

              <h4 style="font-family: 'Spectral', Georgia, serif; color: #A8472B; margin-top: 24px; font-size: 17px;">Próximos Pasos en el Método Inmerge:</h4>
              <ol style="padding-left: 20px; font-size: 14px; color: #444; line-height: 1.8;">
                <li><strong>Diagnóstico & Evaluación:</strong> Uno de nuestros Lead Engineers o Auditores Senior evaluará la viabilidad de tu arquitectura y requerimientos.</li>
                <li><strong>Contacto Técnico:</strong> Nos comunicaremos en menos de 24 horas hábiles para acordar una sesión de dimensionamiento o presentar la propuesta formal.</li>
              </ol>

              <p style="font-size: 14px; color: #555; margin-top: 28px;">
                Si requieres adjuntar documentación técnica adicional o coordinar directamente por WhatsApp, puedes responder a este correo o escribirnos a <a href="mailto:inmerge3@gmail.com" style="color: #A8472B; font-weight: bold;">inmerge3@gmail.com</a>.
              </p>
              
              <hr style="border: none; border-top: 1px solid #EBDFC9; margin: 24px 0;" />
              <p style="font-size: 12px; color: #777; margin: 0; text-align: center;">
                Inmerge — Consultoría en Ingeniería de Software, Auditoría de Sistemas y Ciencia de Datos.<br />Lima, Perú · <a href="https://inmerge.pe" style="color: #A8472B;">inmerge.pe</a>
              </p>
            </div>
          </div>
        `;

        let clientEmailRes = await sendResendEmail(
          'Inmerge <onboarding@resend.dev>',
          lead.email,
          `Hemos recibido tu solicitud de consultoría — Inmerge`,
          clientEmailHtml
        );

        let cText = await clientEmailRes.text();
        console.log(`[notify-lead-tdr] Resend client autoresponder response: ${clientEmailRes.status} -> ${cText}`);
        clientAutoresponderDelivered = clientEmailRes.ok;
      } catch (clientMailErr) {
        console.error('[notify-lead-tdr] Error sending client autoresponder:', clientMailErr);
      }
    } else {
      console.warn('[notify-lead-tdr] Email skipped: RESEND_API_KEY is not set.');
    }

    console.log(`[notify-lead-tdr] Result: Webhook=${webhookDelivered} | InternalEmail=${internalEmailDelivered} | ClientEmail=${clientAutoresponderDelivered}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Lead notification processed successfully',
        delivered: {
          webhook: webhookDelivered,
          internalEmail: internalEmailDelivered,
          clientEmail: clientAutoresponderDelivered,
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
