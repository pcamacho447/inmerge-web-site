import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient.js';
import { clearTeamDataCache } from '../lib/team.js';

/**
 * Extrae el identificador de la entidad a partir del payload de Supabase.
 */
export function getEntityId(payload) {
  if (!payload || typeof payload !== 'object') return null;
  return payload.new?.id ?? payload.record?.id ?? payload.old?.id ?? payload.id ?? null;
}

/**
 * Consolidador y agrupador de eventos delta en tiempo real.
 * Deduplica eventos consecutivos UPDATE para una misma entidad dentro de una ventana de tiempo (windowMs).
 * Preserva orden y eventos de tipos mixtos (INSERT, UPDATE, DELETE) en diferentes tablas.
 *
 * @param {Array} eventQueue - Lista de eventos Realtime a consolidar.
 * @param {number} windowMs - Ventana de tiempo en milisegundos para coalescing (default: 100ms).
 * @returns {Array} Lista de eventos consolidados.
 */
export function coalesceDeltaPayloads(eventQueue = [], windowMs = 100) {
  if (!Array.isArray(eventQueue) || eventQueue.length === 0) {
    return [];
  }

  const result = [];

  for (const event of eventQueue) {
    if (!event || typeof event !== 'object') continue;

    const table = event.table;
    const eventType = event.eventType;
    const entityId = getEntityId(event);
    const timestamp =
      typeof event.timestamp === 'number' ? event.timestamp : typeof event.receivedAt === 'number' ? event.receivedAt : null;

    if (!entityId || !table || eventType !== 'UPDATE') {
      result.push(event);
      continue;
    }

    let prevIndex = -1;
    for (let i = result.length - 1; i >= 0; i--) {
      const prev = result[i];
      if (prev.table === table && getEntityId(prev) === entityId) {
        prevIndex = i;
        break;
      }
    }

    if (prevIndex !== -1) {
      const prevEvent = result[prevIndex];
      if (prevEvent.eventType === 'UPDATE') {
        const prevTimestamp =
          typeof prevEvent.timestamp === 'number'
            ? prevEvent.timestamp
            : typeof prevEvent.receivedAt === 'number'
              ? prevEvent.receivedAt
              : null;

        const isWithinWindow = timestamp === null || prevTimestamp === null || Math.abs(timestamp - prevTimestamp) <= windowMs;

        if (isWithinWindow) {
          const coalescedEvent = {
            ...event,
            old: prevEvent.old || event.old,
          };
          if (prevEvent.new && event.new) {
            coalescedEvent.new = { ...prevEvent.new, ...event.new };
          }
          result[prevIndex] = coalescedEvent;
          continue;
        }
      }
    }

    result.push(event);
  }

  return result;
}

/**
 * Hook reactivo para el Panel de Consultores & Equipo Técnico (/equipo).
 * Escucha cambios en tiempo real en leads_tdr, client_projects, project_deliverables y team_activity_logs.
 */
export default function useRealtimeTeam({ onDataRefresh, onDeltaPatch, enabled = true, coalesce = false, coalesceWindowMs = 100 } = {}) {
  const [toast, setToast] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('CONNECTING');
  const onDataRefreshRef = useRef(onDataRefresh);
  const onDeltaPatchRef = useRef(onDeltaPatch);
  const debounceTimerRef = useRef(null);
  const eventQueueRef = useRef([]);
  const coalesceTimerRef = useRef(null);

  useEffect(() => {
    onDataRefreshRef.current = onDataRefresh;
  }, [onDataRefresh]);

  useEffect(() => {
    onDeltaPatchRef.current = onDeltaPatch;
  }, [onDeltaPatch]);

  useEffect(() => {
    if (!enabled || !supabase?.channel) return;

    const flushEventQueue = () => {
      if (eventQueueRef.current.length === 0) return;
      const coalesced = coalesceDeltaPayloads(eventQueueRef.current, coalesceWindowMs);
      eventQueueRef.current = [];
      coalesceTimerRef.current = null;
      for (const item of coalesced) {
        if (typeof onDeltaPatchRef.current === 'function') {
          onDeltaPatchRef.current(item);
        }
      }
    };

    const dispatchChange = (payload) => {
      clearTeamDataCache();
      if (typeof onDeltaPatchRef.current === 'function') {
        if (coalesce) {
          eventQueueRef.current.push({
            ...payload,
            timestamp: typeof payload.timestamp === 'number' ? payload.timestamp : Date.now(),
          });
          if (!coalesceTimerRef.current) {
            coalesceTimerRef.current = setTimeout(flushEventQueue, coalesceWindowMs);
          }
        } else {
          onDeltaPatchRef.current(payload);
        }
      } else {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = setTimeout(() => {
          onDataRefreshRef.current?.({ forceRefresh: true });
        }, 300);
      }
    };

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
          dispatchChange({ ...payload, table: payload.table || 'leads_tdr' });
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
          dispatchChange({ ...payload, table: payload.table || 'client_projects' });
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
          dispatchChange({ ...payload, table: payload.table || 'project_deliverables' });
        },
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_tasks',
        },
        (payload) => {
          dispatchChange({ ...payload, table: payload.table || 'project_tasks' });
        },
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_findings',
        },
        (payload) => {
          dispatchChange({ ...payload, table: payload.table || 'project_findings' });
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
          dispatchChange({ ...payload, table: payload.table || 'team_activity_logs' });
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
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (coalesceTimerRef.current) {
        clearTimeout(coalesceTimerRef.current);
        coalesceTimerRef.current = null;
      }
      eventQueueRef.current = [];
      if (supabase && typeof supabase.removeChannel === 'function') {
        supabase.removeChannel(channel);
      }
    };
  }, [enabled, coalesce, coalesceWindowMs]);

  return {
    toast,
    dismissToast: () => setToast(null),
    showToast: (customToast) => setToast(customToast),
    connectionStatus,
    isOnline: connectionStatus === 'SUBSCRIBED',
  };
}
