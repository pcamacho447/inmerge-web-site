import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient.js';

/**
 * Hook reactivo para el Panel de Consultores & Equipo Técnico (/equipo).
 * Escucha cambios en tiempo real en leads_tdr, client_projects, project_deliverables y team_activity_logs.
 */
export default function useRealtimeTeam({ onDataRefresh, enabled = true } = {}) {
  const [toast, setToast] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('CONNECTING');
  const onDataRefreshRef = useRef(onDataRefresh);

  useEffect(() => {
    onDataRefreshRef.current = onDataRefresh;
  }, [onDataRefresh]);

  useEffect(() => {
    if (!enabled || !supabase?.channel) return;

    const channel = supabase.channel('realtime-team-consultancy');

    channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads_tdr',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const lead = payload.new || payload.record || {};
            const companyOrName = lead.company || lead.full_name || lead.email || 'Nuevo Prospecto';
            setToast({
              type: 'lead',
              title: 'Nuevo Lead TDR Recibido',
              message: `${companyOrName} ha enviado una solicitud (${lead.pillar || 'General'}).`,
            });
          } else if (payload.eventType === 'UPDATE') {
            const lead = payload.new || payload.record || {};
            const name = lead.company || lead.full_name || 'Prospecto';
            setToast({
              type: 'lead',
              title: 'Estado de Lead Actualizado',
              message: `El lead de ${name} cambió a estado "${lead.status || 'Actualizado'}".`,
            });
          }
          onDataRefreshRef.current?.();
        },
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'client_projects',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const proj = payload.new || payload.record || {};
            setToast({
              type: 'project',
              title: 'Nuevo Proyecto Activo',
              message: `Se registró el proyecto "${proj.title || 'Proyecto Inmerge'}".`,
            });
          }
          onDataRefreshRef.current?.();
        },
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_deliverables',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const deliv = payload.new || payload.record || {};
            const title = deliv.title || deliv.name || (deliv.file_type ? `Documento ${deliv.file_type}` : 'Entregable Técnico');
            setToast({
              type: 'deliverable',
              title: 'Entregable Publicado',
              message: `Nuevo entregable publicado: "${title}".`,
            });
          }
          onDataRefreshRef.current?.();
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'team_activity_logs',
        },
        (payload) => {
          const log = payload.new || payload.record || {};
          if (log?.action === 'DELIVERABLE_DOWNLOADED') {
            setToast({
              type: 'info',
              title: 'Descarga Segura Auditada',
              message: `Un cliente descargó un entregable confidencial (Trazabilidad registrada).`,
            });
          }
          onDataRefreshRef.current?.();
        },
      )
      .subscribe((status, err) => {
        if (status) {
          setConnectionStatus(status);
        }
        if (status === 'CHANNEL_ERROR') {
          console.warn('[useRealtimeTeam] Advertencia de conectividad Realtime:', err);
        }
      });

    return () => {
      if (supabase && typeof supabase.removeChannel === 'function') {
        supabase.removeChannel(channel);
      }
    };
  }, [enabled]);

  return {
    toast,
    dismissToast: () => setToast(null),
    showToast: (customToast) => setToast(customToast),
    connectionStatus,
    isOnline: connectionStatus === 'SUBSCRIBED',
  };
}
