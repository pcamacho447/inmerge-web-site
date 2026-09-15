import { corsHeaders } from '../_shared/cors.ts';

const ALERT_WEBHOOK_URL =
  Deno.env.get('ALERT_WEBHOOK_URL') ||
  Deno.env.get('SLACK_WEBHOOK_URL') ||
  Deno.env.get('DISCORD_WEBHOOK_URL');

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const RESEND_FROM = Deno.env.get('RESEND_FROM') || 'Inmerge <onboarding@resend.dev>';
const CONSULTING_INBOX = Deno.env.get('CONSULTING_INBOX') || 'inmerge3@gmail.com';

const STATUS_DETAILS: Record<
  string,
  { title: string; summary: string; nextSteps: string; color: string; badge: string }
> = {
  EN_PLANIFICACION: {
    title: 'Fase 01 — Planificación & Definición de Alcance',
    summary:
      'Tu equipo técnico está estructurando la arquitectura, objetivos específicos y el cronograma de hitos para la ejecución del proyecto.',
    nextSteps: 'Revisión técnica preliminar y asignación de pipelines y recursos cloud.',
    color: '#D8A84E',
    badge: 'PLANIFICACIÓN',
  },
  EN_AUDITORIA: {
    title: 'Fase 02 — Diagnóstico & Auditoría Forense en Ejecución',
    summary:
      'Inmerge se encuentra evaluando la calidad e integridad de tus bases de datos, consistencia de esquemas y configuración cloud.',
    nextSteps: 'Consolidación de matriz de hallazgos técnicos y recomendaciones de ingeniería.',
    color: '#A8472B',
    badge: 'AUDITORÍA ACTIVA',
  },
  EN_DESARROLLO: {
    title: 'Fase 03 — Desarrollo Tecnológico & Despliegue Cloud',
    summary:
      'Iniciamos la fase de construcción de pipelines de datos, microservicios, APIs y modernización de infraestructura.',
    nextSteps: 'Despliegues en entornos de pruebas y verificación de rendimiento continuo.',
    color: '#345995',
    badge: 'DESARROLLO',
  },
  EN_VALIDACION: {
    title: 'Fase 04 — Aseguramiento de Calidad & Quality Gate',
    summary:
      'Ejecutando pruebas de estrés, validación de reglas de negocio, benchmarking y análisis de seguridad.',
    nextSteps: 'Aprobación del Quality Gate y preparación de informes técnicos finales.',
    color: '#C68A3D',
    badge: 'VALIDACIÓN',
  },
  ENTREGADO: {
    title: 'Fase 05 — Proyecto Entregado & Entregables Listos',
    summary:
      'Tu proyecto ha alcanzado la etapa de entrega. Los informes técnicos, PDFs y recursos han sido publicados en tu portal.',
    nextSteps: 'Descarga segura de documentos desde tu Portal de Clientes y sesión técnica de cierre.',
    color: '#2E7559',
    badge: 'ENTREGADO',
  },
  FINALIZADO: {
    title: 'Proyecto Concluido con Éxito',
    summary:
      'El servicio de consultoría e ingeniería ha culminado formalmente cumpliendo todos los requerimientos y estándares de calidad.',
    nextSteps: 'Disponibilidad de histórico y soporte post-entrega según acuerdo de servicio.',
    color: '#241A12',
    badge: 'FINALIZADO',
  },
};

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
    // Support direct invocation { project, newStatus, previousStatus, ... } or database webhook { record, old_record }
    const project = payload.project || payload.record || payload;
    const newStatus = payload.newStatus || project.status || 'EN_PLANIFICACION';
    const previousStatus = payload.previousStatus || payload.old_record?.status || 'N/A';
    const clientEmail = payload.clientEmail || project.client_email;
    const clientName = payload.clientName || project.client_name || 'Cliente Inmerge';
    const notes = payload.notes || project.status_notes || '';

    if (!project || !project.title) {
      return new Response(JSON.stringify({ error: 'Payload must contain project details' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const statusInfo = STATUS_DETAILS[newStatus] || {
      title: `Estado Actualizado: ${newStatus}`,
      summary: `El proyecto se encuentra ahora en estado "${newStatus}".`,
      nextSteps: 'Consulta el avance en tu portal o contacta a tu Tech Lead.',
      color: '#A8472B',
      badge: newStatus,
    };

    const pillarName = PILLAR_NAMES[project.pillar] || project.pillar || 'Consultoría';

    let emailDelivered = false;
    let webhookDelivered = false;

    console.log(
      `[notify-project-status] Project: "${project.title}" transitioned from ${previousStatus} to ${newStatus}`,
    );

    // 1. Dispatch Email to Client via Resend
    if (RESEND_API_KEY && clientEmail) {
      try {
        const emailRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: RESEND_FROM,
            to: [clientEmail],
            reply_to: CONSULTING_INBOX,
            subject: `[Actualización de Proyecto] ${project.title} — ${statusInfo.badge}`,
            html: `
              <!DOCTYPE html>
              <html lang="es">
              <head>
                <meta charset="utf-8">
                <style>
                  body { margin:0; padding:0; background:#F3EADA; font-family:'IBM Plex Sans',-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif; color:#241A12; }
                </style>
              </head>
              <body style="background:#F3EADA; padding:24px 12px; margin:0;">
                <div style="max-width:600px; margin:0 auto; background:#F3EADA; border:1px solid #DDCBAE; border-radius:6px; overflow:hidden; box-shadow:0 8px 24px rgba(36,26,18,0.08);">
                  
                  <!-- Header -->
                  <div style="background:#241A12; padding:24px; text-align:center; border-bottom:3px solid ${statusInfo.color};">
                    <div style="color:#D8A84E; font-size:12px; letter-spacing:3px; font-weight:700; margin-bottom:4px;">INMERGE CONSULTORÍA & TECNOLOGÍA</div>
                    <h1 style="color:#F3EADA; font-family:'Spectral',serif,Georgia; font-size:22px; margin:0; font-weight:600;">Actualización de Estado de Proyecto</h1>
                  </div>

                  <!-- Body -->
                  <div style="padding:32px 28px;">
                    <p style="font-size:16px; margin:0 0 16px;">Estimado(a) <strong>${clientName}</strong>,</p>
                    <p style="font-size:14px; line-height:1.6; color:#4A3826; margin:0 0 20px;">
                      Tu equipo de ingeniería ha registrado un avance significativo en tu proyecto. A continuación el detalle del nuevo estado:
                    </p>

                    <!-- Status Card -->
                    <div style="background:#FFFFFF; border:1px solid #EBDFC9; border-left:4px solid ${statusInfo.color}; border-radius:4px; padding:20px; margin-bottom:24px;">
                      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                        <span style="font-size:11px; font-weight:700; color:${statusInfo.color}; letter-spacing:1.5px; text-transform:uppercase;">
                          ${statusInfo.badge}
                        </span>
                        <span style="font-size:12px; color:#7A6B58;">Pilar: ${pillarName}</span>
                      </div>
                      <h2 style="font-family:'Spectral',serif,Georgia; font-size:19px; color:#241A12; margin:0 0 10px;">
                        ${project.title}
                      </h2>
                      <p style="font-size:14px; line-height:1.6; color:#3A2B1C; margin:0 0 12px;">
                        ${statusInfo.summary}
                      </p>
                      ${
                        notes
                          ? `<div style="background:#FAF6EF; padding:10px 14px; border-radius:4px; font-size:13px; color:#4A3826; margin-top:8px;"><strong>Nota del Tech Lead:</strong> ${notes}</div>`
                          : ''
                      }
                    </div>

                    <!-- Next Steps -->
                    <div style="background:#EBDFC9; border-radius:4px; padding:16px 20px; margin-bottom:28px;">
                      <div style="font-size:12px; font-weight:700; color:#A8472B; letter-spacing:1px; margin-bottom:6px; text-transform:uppercase;">
                        Próximos Pasos:
                      </div>
                      <div style="font-size:13px; line-height:1.6; color:#241A12;">
                        ${statusInfo.nextSteps}
                      </div>
                    </div>

                    <!-- CTA Button -->
                    <div style="text-align:center; margin:32px 0 24px;">
                      <a href="https://inmerge.pe/cuenta" style="background:#A8472B; color:#F3EADA; text-decoration:none; font-weight:700; font-size:14px; padding:14px 32px; border-radius:30px; display:inline-block; box-shadow:0 4px 12px rgba(168,71,43,0.3);">
                        Ver Proyecto en mi Portal de Clientes →
                      </a>
                    </div>

                    <!-- Tech Lead Info -->
                    <div style="border-top:1px solid #DDCBAE; padding-top:16px; font-size:12px; color:#7A6B58; line-height:1.6;">
                      <div><strong>Tech Lead Asignado:</strong> ${project.tech_lead_name || 'Inmerge Technical Lead'}</div>
                      <div><strong>Contacto Directo:</strong> ${project.tech_lead_contact || CONSULTING_INBOX}</div>
                    </div>
                  </div>

                  <!-- Footer -->
                  <div style="background:#241A12; padding:16px; text-align:center; font-size:12px; color:#C9B79C;">
                    Inmerge Consultoría en Datos & Ingeniería Cloud · Lima, Perú
                  </div>
                </div>
              </body>
              </html>
            `,
          }),
        });

        if (emailRes.ok) {
          emailDelivered = true;
          console.log(`[notify-project-status] Email delivered successfully to ${clientEmail}`);
        } else {
          const errBody = await emailRes.text();
          console.warn(`[notify-project-status] Resend response error: ${errBody}`);
        }
      } catch (mailErr) {
        console.error('[notify-project-status] Network error sending client email:', mailErr);
      }
    }

    // 2. Dispatch Slack / Internal Webhook Notification
    if (ALERT_WEBHOOK_URL) {
      try {
        const webhookPayload = {
          content: `📊 **Actualización de Proyecto Inmerge**\n📁 **Proyecto:** ${project.title}\n🔄 **Transición:** \`${previousStatus}\` ➔ \`${newStatus}\`\n👤 **Cliente:** ${clientName} (${clientEmail || 'N/A'})\n🏛️ **Pilar:** ${pillarName}\n📝 **Detalle:** ${statusInfo.summary}`,
          text: `📊 *Actualización de Proyecto Inmerge*\n*📁 Proyecto:* ${project.title}\n*🔄 Transición:* \`${previousStatus}\` ➔ \`${newStatus}\`\n*👤 Cliente:* ${clientName} (${clientEmail || 'N/A'})\n*🏛️ Pilar:* ${pillarName}\n*📝 Detalle:* ${statusInfo.summary}`,
          attachments: [
            {
              color: statusInfo.color,
              title: `Estado del Proyecto: ${statusInfo.badge}`,
              fields: [
                { title: 'Proyecto', value: project.title, short: false },
                { title: 'Transición de Estado', value: `${previousStatus} ➔ ${newStatus}`, short: true },
                { title: 'Cliente', value: `${clientName} (${clientEmail || 'N/A'})`, short: true },
                { title: 'Tech Lead', value: project.tech_lead_name || 'Inmerge Lead', short: true },
                { title: 'Pilar', value: pillarName, short: true },
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
        console.error('[notify-project-status] Webhook dispatch error:', whErr);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        project: project.id,
        newStatus,
        emailDelivered,
        webhookDelivered,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Internal Server Error';
    console.error('[notify-project-status] Unexpected error:', errorMsg);
    return new Response(JSON.stringify({ error: errorMsg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
