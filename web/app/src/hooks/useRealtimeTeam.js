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
 * Determina si un payload delta en tiempo real debe ser despachado según el alcance (viewScope)
 * y el correo electrónico del usuario activo.
 *
 * Reglas de filtrado contextual:
 * - Si no se solicita filtrado por alcance (viewScope !== 'ASSIGNED') o no se especifica usuario, despachar todo.
 * - Para tablas que no sean tareas ni entregables (leads_tdr, client_projects, project_milestones, project_risks, etc.), despachar todo.
 * - Para project_tasks o project_deliverables:
 *   - Si viewScope === 'ASSIGNED', ignorar deltas de tareas o entregables asignados/autorizados para otro correo.
 *   - Si no tienen correo asignado/autor (sin asignar), o si coinciden con el correo del usuario (case-insensitive), despachar.
 *
 * @param {Object} payload - Evento delta de Supabase postgres_changes.
 * @param {Object} [options]
 * @param {string} [options.userEmail] - Correo electrónico del usuario activo.
 * @param {string} [options.viewScope] - Alcance de visualización ('ALL' | 'ASSIGNED').
 * @returns {boolean} True si el delta debe ser despachado; false si debe ser ignorado.
 */
export function shouldDispatchDelta(payload, { userEmail, viewScope } = {}) {
  if (!payload || typeof payload !== 'object') {
    return false;
  }

  if (viewScope !== 'ASSIGNED' || !userEmail || typeof userEmail !== 'string') {
    return true;
  }

  const normalizedUserEmail = userEmail.trim().toLowerCase();
  if (!normalizedUserEmail) {
    return true;
  }

  const table = payload.table;
  const isTaskOrDeliverable =
    table === 'project_tasks' || table === 'tasks' || table === 'project_deliverables' || table === 'deliverables';

  if (!isTaskOrDeliverable) {
    return true;
  }

  const extractField = (key1, key2) => {
    for (const src of [payload.new, payload.record, payload.old]) {
      if (src && typeof src === 'object') {
        if (key1 in src) return src[key1];
        if (key2 in src) return src[key2];
      }
    }
    return null;
  };

  const assignedEmail = extractField('assigned_to_email', 'assignedToEmail');
  const authorEmail = extractField('author_email', 'authorEmail');

  // Si no está asignado ni tiene autor registrado, no está asignado a otra persona
  if (!assignedEmail && !authorEmail) {
    return true;
  }

  const normalizedAssigned = assignedEmail ? String(assignedEmail).trim().toLowerCase() : null;
  const normalizedAuthor = authorEmail ? String(authorEmail).trim().toLowerCase() : null;

  const matchesUser =
    (normalizedAssigned && normalizedAssigned === normalizedUserEmail) || (normalizedAuthor && normalizedAuthor === normalizedUserEmail);

  return Boolean(matchesUser);
}

/**
 * Hook reactivo para el Panel de Consultores & Equipo Técnico (/equipo).
 * Escucha cambios en tiempo real en leads_tdr, client_projects, project_deliverables, project_milestones, project_tasks, project_risks, project_findings y team_activity_logs.
 */
export default function useRealtimeTeam({
  onDataRefresh,
  onDeltaPatch,
  enabled = true,
  coalesce = false,
  coalesceWindowMs = 100,
  userEmail,
  viewScope,
} = {}) {
  const [toast, setToast] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('CONNECTING');
  const onDataRefreshRef = useRef(onDataRefresh);
  const onDeltaPatchRef = useRef(onDeltaPatch);
  const userEmailRef = useRef(userEmail);
  const viewScopeRef = useRef(viewScope);
  const debounceTimerRef = useRef(null);
  const eventQueueRef = useRef([]);
  const coalesceTimerRef = useRef(null);
  const prevStatusRef = useRef(null);

  useEffect(() => {
    onDataRefreshRef.current = onDataRefresh;
  }, [onDataRefresh]);

  useEffect(() => {
    onDeltaPatchRef.current = onDeltaPatch;
  }, [onDeltaPatch]);

  useEffect(() => {
    userEmailRef.current = userEmail;
  }, [userEmail]);

  useEffect(() => {
    viewScopeRef.current = viewScope;
  }, [viewScope]);

  useEffect(() => {
    if (!enabled || !supabase?.channel) return;
    prevStatusRef.current = null;

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
      const deltaWithTable = { ...payload, table: payload.table };
      if (
        !shouldDispatchDelta(deltaWithTable, {
          userEmail: userEmailRef.current,
          viewScope: viewScopeRef.current,
        })
      ) {
        return;
      }

      clearTeamDataCache();
      if (typeof onDeltaPatchRef.current === 'function') {
        if (coalesce) {
          eventQueueRef.current.push({
            ...deltaWithTable,
            timestamp: typeof deltaWithTable.timestamp === 'number' ? deltaWithTable.timestamp : Date.now(),
          });
          if (!coalesceTimerRef.current) {
            coalesceTimerRef.current = setTimeout(flushEventQueue, coalesceWindowMs);
          }
        } else {
          onDeltaPatchRef.current(deltaWithTable);
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
          const deltaPayload = { ...payload, table: payload.table || 'project_deliverables' };
          if (
            !shouldDispatchDelta(deltaPayload, {
              userEmail: userEmailRef.current,
              viewScope: viewScopeRef.current,
            })
          ) {
            return;
          }
          if (payload.eventType === 'INSERT') {
            const deliv = payload.new || payload.record || {};
            const title = deliv.title || deliv.name || (deliv.file_type ? `Documento ${deliv.file_type}` : 'Entregable Técnico');
            setToast({
              type: 'deliverable',
              title: 'Entregable Publicado',
              message: `Nuevo entregable publicado: "${title}".`,
            });
          }
          dispatchChange(deltaPayload);
        },
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_milestones',
        },
        (payload) => {
          dispatchChange({ ...payload, table: payload.table || 'project_milestones' });
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
          table: 'project_risks',
        },
        (payload) => {
          dispatchChange({ ...payload, table: payload.table || 'project_risks' });
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
          const wasDisconnected =
            prevStatusRef.current === 'CHANNEL_ERROR' || prevStatusRef.current === 'TIMED_OUT' || prevStatusRef.current === 'CLOSED';

          if (wasDisconnected && status === 'SUBSCRIBED') {
            if (debounceTimerRef.current) {
              clearTimeout(debounceTimerRef.current);
              debounceTimerRef.current = null;
            }
            clearTeamDataCache();
            if (typeof onDataRefreshRef.current === 'function') {
              onDataRefreshRef.current({ forceRefresh: true });
            }
          }

          prevStatusRef.current = status;
          setConnectionStatus(status);
        }
        if (status === 'CHANNEL_ERROR') {
          console.warn('[useRealtimeTeam] Advertencia de conectividad Realtime:', err);
        }
      });

    return () => {
      prevStatusRef.current = null;
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
