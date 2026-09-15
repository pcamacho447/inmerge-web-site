import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No autorizado: Cabecera Authorization ausente.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 1. Validar identidad del usuario mediante el token JWT
    const supabaseUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userErr,
    } = await supabaseUser.auth.getUser();

    if (userErr || !user) {
      return new Response(JSON.stringify({ error: 'Token de sesión inválido o expirado.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const payload = await req.json();
    const { deliverableId, filePath: requestedFilePath, expiresIn = 900 } = payload;

    if (!deliverableId && !requestedFilePath) {
      return new Response(JSON.stringify({ error: 'Se requiere deliverableId o filePath para generar la descarga.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Cliente administrativo con service role para validación forense y firma
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY);

    // 2. Obtener datos del perfil del usuario (para verificar si es staff)
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id, role, email, full_name')
      .eq('id', user.id)
      .single();

    const isStaff = profile && ['admin', 'auditor', 'engineer'].includes(profile.role);

    // 3. Consultar el entregable y validar la pertenencia al proyecto
    let deliverableQuery = supabaseAdmin
      .from('project_deliverables')
      .select(`
        id,
        title,
        file_type,
        file_path,
        external_url,
        version,
        sha256_checksum,
        file_size_bytes,
        project_id,
        project:project_id (
          id,
          title,
          client_id
        )
      `);

    if (deliverableId) {
      deliverableQuery = deliverableQuery.eq('id', deliverableId);
    } else if (requestedFilePath) {
      deliverableQuery = deliverableQuery.eq('file_path', requestedFilePath);
    }

    const { data: deliverable, error: delivErr } = await deliverableQuery.single();

    if (delivErr || !deliverable) {
      return new Response(JSON.stringify({ error: 'El entregable solicitado no existe o no se pudo encontrar.' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 4. Control estricto de acceso (RLS Check)
    const projectClientId = (deliverable.project as { client_id?: string })?.client_id;
    const isOwner = projectClientId === user.id;

    if (!isOwner && !isStaff) {
      return new Response(
        JSON.stringify({ error: 'Acceso denegado: No tienes permisos para descargar este entregable confidencial.' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const targetFilePath = deliverable.file_path || requestedFilePath;
    if (!targetFilePath) {
      return new Response(JSON.stringify({ error: 'Este entregable no posee un archivo binario almacenado.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 5. Capturar metadatos forenses de red y dispositivo
    const clientIp =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('cf-connecting-ip') ||
      req.headers.get('x-real-ip') ||
      'Desconocida';

    const userAgent = req.headers.get('user-agent') || 'Desconocido';

    // 6. Registrar evento inmutable de descarga en bitácora de auditoría y verificar anomalías
    try {
      await supabaseAdmin.from('team_activity_logs').insert({
        user_id: user.id,
        action: 'DELIVERABLE_DOWNLOADED',
        entity_type: 'deliverable',
        entity_id: deliverable.id,
        details: {
          deliverable_title: deliverable.title,
          file_type: deliverable.file_type,
          version: deliverable.version,
          sha256_checksum: deliverable.sha256_checksum,
          project_id: deliverable.project_id,
          project_title: (deliverable.project as { title?: string })?.title || 'N/A',
          file_path: targetFilePath,
          ip: clientIp,
          user_agent: userAgent,
          expires_in: expiresIn,
          user_email: user.email,
          user_role: profile?.role || 'client',
        },
      });

      // Verificación de ráfaga anómala de descargas
      await supabaseAdmin.rpc('detect_download_anomaly', {
        p_user_id: user.id,
        p_window_seconds: 60,
        p_max_downloads: 12,
      });
    } catch (logErr) {
      console.warn('[secure-download] Error al registrar log forense:', logErr);
    }

    // 7. Generar URL firmada de Storage con vigencia estricta (15 minutos)
    const { data: signedData, error: signErr } = await supabaseAdmin.storage
      .from('project-deliverables')
      .createSignedUrl(targetFilePath, expiresIn);

    if (signErr || !signedData?.signedUrl) {
      console.error('[secure-download] Error al firmar URL en Storage:', signErr);
      return new Response(JSON.stringify({ error: 'No se pudo generar la URL firmada de descarga.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(
      `[secure-download] Descarga autorizada: ${deliverable.title} (${deliverable.id}) para ${user.email} [IP: ${clientIp}]`
    );

    return new Response(
      JSON.stringify({
        success: true,
        signedUrl: signedData.signedUrl,
        expiresIn,
        deliverable: {
          id: deliverable.id,
          title: deliverable.title,
          file_type: deliverable.file_type,
          version: deliverable.version,
          sha256_checksum: deliverable.sha256_checksum || null,
          file_size_bytes: deliverable.file_size_bytes || null,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[secure-download] Error procesando solicitud:', error);
    return new Response(JSON.stringify({ error: (error as Error).message || 'Error interno del servidor' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
