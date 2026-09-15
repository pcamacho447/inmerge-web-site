import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient.js';

/**
 * Hook reactivo para el Panel de Consultores & Equipo Técnico (/equipo).
 * Escucha cambios en tiempo real en leads_tdr, client_projects, project_deliverables y team_activity_logs.
 */
export default function useRealtimeTeam({ onDataRefresh, enabled = true } = {}) {
  const [toast, setToast] = useState(null);

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
            const lead = payload.new;
            const companyOrName = lead.company || lead.full_name || lead.email;
            setToast({
              type: 'lead',
              title: 'Nuevo Lead TDR Recibido',
              message: `${companyOrName} ha enviado una solicitud (${lead.pillar || 'General'}).`,
            });
          } else if (payload.eventType === 'UPDATE') {
            const lead = payload.new;
            setToast({
              type: 'lead',
              title: 'Estado de Lead Actualizado',
              message: `El lead de ${lead.company || lead.full_name} cambió a estado "${lead.status}".`,
            });
          }
          onDataRefresh?.();
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
            setToast({
              type: 'project',
              title: 'Nuevo Proyecto Activo',
              message: `Se registró el proyecto "${payload.new.title}".`,
            });
          }
          onDataRefresh?.();
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
            setToast({
              type: 'deliverable',
              title: 'Entregable Publicado',
              message: `Nuevo entregable publicado: "${payload.new.title}".`,
            });
          }
          onDataRefresh?.();
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
          const log = payload.new;
          if (log?.action === 'DELIVERABLE_DOWNLOADED') {
            setToast({
              type: 'info',
              title: 'Descarga Segura Auditada',
              message: `Un cliente descargó un entregable confidencial (Trazabilidad registrada).`,
            });
          }
          onDataRefresh?.();
        },
      )
      .subscribe();

    return () => {
      if (supabase && typeof supabase.removeChannel === 'function') {
        supabase.removeChannel(channel);
      }
    };
  }, [enabled, onDataRefresh]);

  return {
    toast,
    dismissToast: () => setToast(null),
    showToast: (customToast) => setToast(customToast),
  };
}
