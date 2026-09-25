import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useRealtimeTeam, { coalesceDeltaPayloads, shouldDispatchDelta } from './useRealtimeTeam.js';
import { supabase } from '../lib/supabaseClient.js';
import { clearTeamDataCache } from '../lib/team.js';

vi.mock('../lib/supabaseClient.js', () => ({
  supabase: {
    channel: vi.fn(),
    removeChannel: vi.fn(),
  },
}));

vi.mock('../lib/team.js', () => ({
  clearTeamDataCache: vi.fn(),
}));

describe('useRealtimeTeam', () => {
  let mockChannel;
  let eventCallbacks;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    eventCallbacks = {};

    mockChannel = {
      on: vi.fn().mockImplementation((event, filter, callback) => {
        const table = filter.table;
        eventCallbacks[table] = callback;
        return mockChannel;
      }),
      subscribe: vi.fn().mockImplementation((cb) => {
        if (cb) cb('SUBSCRIBED');
        return mockChannel;
      }),
    };

    supabase.channel.mockReturnValue(mockChannel);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('subscribes to realtime-team-consultancy channel when enabled', () => {
    const onDataRefresh = vi.fn();
    const { result } = renderHook(() => useRealtimeTeam({ onDataRefresh, enabled: true }));

    expect(supabase.channel).toHaveBeenCalledWith('realtime-team-consultancy');
    expect(mockChannel.subscribe).toHaveBeenCalled();
    expect(result.current.connectionStatus).toBe('SUBSCRIBED');
    expect(result.current.isOnline).toBe(true);
  });

  it('tracks connectionStatus and handles CHANNEL_ERROR gracefully', () => {
    let statusCallback;
    mockChannel.subscribe = vi.fn().mockImplementation((cb) => {
      statusCallback = cb;
      return mockChannel;
    });

    const { result } = renderHook(() => useRealtimeTeam({ enabled: true }));
    expect(result.current.connectionStatus).toBe('CONNECTING');
    expect(result.current.isOnline).toBe(false);

    act(() => {
      statusCallback?.('CHANNEL_ERROR', new Error('Network timeout'));
    });
    expect(result.current.connectionStatus).toBe('CHANNEL_ERROR');
    expect(result.current.isOnline).toBe(false);
  });

  it('invalidates cache and invokes onDeltaPatch immediately on INSERT, UPDATE, and DELETE events without calling onDataRefresh', () => {
    const onDataRefresh = vi.fn();
    const onDeltaPatch = vi.fn();
    renderHook(() => useRealtimeTeam({ onDataRefresh, onDeltaPatch, enabled: true }));

    const insertPayload = {
      eventType: 'INSERT',
      new: { id: 'p1', title: 'Nuevo Proyecto Cloud' },
      table: 'client_projects',
    };
    const updatePayload = {
      eventType: 'UPDATE',
      new: { id: 'p1', title: 'Proyecto Cloud Renombrado' },
      old: { id: 'p1', title: 'Nuevo Proyecto Cloud' },
      table: 'client_projects',
    };
    const deletePayload = {
      eventType: 'DELETE',
      old: { id: 'p1' },
      table: 'client_projects',
    };

    act(() => {
      eventCallbacks['client_projects'](insertPayload);
    });

    expect(clearTeamDataCache).toHaveBeenCalledTimes(1);
    expect(onDeltaPatch).toHaveBeenCalledWith(insertPayload);
    expect(onDataRefresh).not.toHaveBeenCalled();

    act(() => {
      eventCallbacks['client_projects'](updatePayload);
    });

    expect(clearTeamDataCache).toHaveBeenCalledTimes(2);
    expect(onDeltaPatch).toHaveBeenCalledWith(updatePayload);
    expect(onDataRefresh).not.toHaveBeenCalled();

    act(() => {
      eventCallbacks['client_projects'](deletePayload);
    });

    expect(clearTeamDataCache).toHaveBeenCalledTimes(3);
    expect(onDeltaPatch).toHaveBeenCalledWith(deletePayload);
    expect(onDataRefresh).not.toHaveBeenCalled();

    // Even if time advances, onDataRefresh shouldn't be called because onDeltaPatch handled it
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(onDataRefresh).not.toHaveBeenCalled();
  });

  it('debounces onDataRefresh by 300ms with { forceRefresh: true } when onDeltaPatch is not provided', () => {
    const onDataRefresh = vi.fn();
    renderHook(() => useRealtimeTeam({ onDataRefresh, enabled: true }));

    act(() => {
      eventCallbacks['leads_tdr']({
        eventType: 'INSERT',
        new: { company: 'FinTech Corp', pillar: 'software' },
      });
      eventCallbacks['leads_tdr']({
        eventType: 'UPDATE',
        new: { company: 'FinTech Corp', status: 'CALIFICADO' },
      });
      eventCallbacks['client_projects']({
        eventType: 'INSERT',
        new: { id: 'p2', title: 'Portal Web' },
      });
    });

    expect(clearTeamDataCache).toHaveBeenCalledTimes(3);
    // Not called immediately because of debounce
    expect(onDataRefresh).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(onDataRefresh).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(onDataRefresh).toHaveBeenCalledTimes(1);
    expect(onDataRefresh).toHaveBeenCalledWith({ forceRefresh: true });
  });

  it('handles new lead TDR INSERT event and sets toast notification', () => {
    const onDataRefresh = vi.fn();
    const { result } = renderHook(() => useRealtimeTeam({ onDataRefresh, enabled: true }));

    act(() => {
      if (eventCallbacks['leads_tdr']) {
        eventCallbacks['leads_tdr']({
          eventType: 'INSERT',
          new: {
            company: 'Banco Central',
            full_name: 'Carlos Ruiz',
            pillar: 'auditoria',
          },
        });
      }
    });

    expect(result.current.toast).toEqual({
      type: 'lead',
      title: 'Nuevo Lead TDR Recibido',
      message: 'Banco Central ha enviado una solicitud (auditoria).',
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(onDataRefresh).toHaveBeenCalledWith({ forceRefresh: true });
  });

  it('handles deliverable download audit log event', () => {
    const onDataRefresh = vi.fn();
    const { result } = renderHook(() => useRealtimeTeam({ onDataRefresh, enabled: true }));

    act(() => {
      if (eventCallbacks['team_activity_logs']) {
        eventCallbacks['team_activity_logs']({
          eventType: 'INSERT',
          new: {
            action: 'DELIVERABLE_DOWNLOADED',
          },
        });
      }
    });

    expect(result.current.toast).toEqual({
      type: 'info',
      title: 'Descarga Segura Auditada',
      message: 'Un cliente descargó un entregable confidencial (Trazabilidad registrada).',
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(onDataRefresh).toHaveBeenCalledWith({ forceRefresh: true });
  });

  it('unsubscribes and cleans up channel and debounce timer on unmount', () => {
    const onDataRefresh = vi.fn();
    const { unmount } = renderHook(() => useRealtimeTeam({ onDataRefresh, enabled: true }));

    act(() => {
      eventCallbacks['client_projects']({
        eventType: 'INSERT',
        new: { id: 'p3', title: 'Pending Debounce' },
      });
    });

    unmount();

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(onDataRefresh).not.toHaveBeenCalled();
    expect(supabase.removeChannel).toHaveBeenCalledWith(mockChannel);
  });

  it('subscribes to postgres changes on project_milestones and project_risks tables', () => {
    renderHook(() => useRealtimeTeam({ enabled: true }));

    expect(mockChannel.on).toHaveBeenCalledWith(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'project_milestones',
      },
      expect.any(Function),
    );

    expect(mockChannel.on).toHaveBeenCalledWith(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'project_risks',
      },
      expect.any(Function),
    );

    expect(eventCallbacks['project_milestones']).toBeDefined();
    expect(eventCallbacks['project_risks']).toBeDefined();
  });

  it('handles postgres change events on project_milestones table, invalidating cache and calling onDeltaPatch', () => {
    const onDeltaPatch = vi.fn();
    renderHook(() => useRealtimeTeam({ onDeltaPatch, enabled: true }));

    const insertPayload = {
      eventType: 'INSERT',
      new: { id: 'm1', project_id: 'proj-1', title: 'Hito 1: Auditoría Inicial', status: 'PENDIENTE' },
    };
    const updatePayload = {
      eventType: 'UPDATE',
      new: { id: 'm1', project_id: 'proj-1', title: 'Hito 1: Auditoría Inicial', status: 'COMPLETADO' },
      old: { id: 'm1', project_id: 'proj-1', status: 'PENDIENTE' },
    };
    const deletePayload = {
      eventType: 'DELETE',
      old: { id: 'm1', project_id: 'proj-1' },
    };

    act(() => {
      eventCallbacks['project_milestones'](insertPayload);
    });

    expect(clearTeamDataCache).toHaveBeenCalledTimes(1);
    expect(onDeltaPatch).toHaveBeenCalledWith({
      ...insertPayload,
      table: 'project_milestones',
    });

    act(() => {
      eventCallbacks['project_milestones'](updatePayload);
    });

    expect(clearTeamDataCache).toHaveBeenCalledTimes(2);
    expect(onDeltaPatch).toHaveBeenCalledWith({
      ...updatePayload,
      table: 'project_milestones',
    });

    act(() => {
      eventCallbacks['project_milestones'](deletePayload);
    });

    expect(clearTeamDataCache).toHaveBeenCalledTimes(3);
    expect(onDeltaPatch).toHaveBeenCalledWith({
      ...deletePayload,
      table: 'project_milestones',
    });
  });

  it('handles postgres change events on project_risks table, invalidating cache and calling onDeltaPatch', () => {
    const onDeltaPatch = vi.fn();
    renderHook(() => useRealtimeTeam({ onDeltaPatch, enabled: true }));

    const insertPayload = {
      eventType: 'INSERT',
      new: { id: 'r1', project_id: 'proj-1', description: 'Riesgo de cuota API excedida', severity: 'ALTA' },
    };
    const updatePayload = {
      eventType: 'UPDATE',
      new: { id: 'r1', project_id: 'proj-1', description: 'Riesgo de cuota API excedida', status: 'RESUELTO' },
      old: { id: 'r1', project_id: 'proj-1', status: 'IDENTIFICADO' },
    };
    const deletePayload = {
      eventType: 'DELETE',
      old: { id: 'r1', project_id: 'proj-1' },
    };

    act(() => {
      eventCallbacks['project_risks'](insertPayload);
    });

    expect(clearTeamDataCache).toHaveBeenCalledTimes(1);
    expect(onDeltaPatch).toHaveBeenCalledWith({
      ...insertPayload,
      table: 'project_risks',
    });

    act(() => {
      eventCallbacks['project_risks'](updatePayload);
    });

    expect(clearTeamDataCache).toHaveBeenCalledTimes(2);
    expect(onDeltaPatch).toHaveBeenCalledWith({
      ...updatePayload,
      table: 'project_risks',
    });

    act(() => {
      eventCallbacks['project_risks'](deletePayload);
    });

    expect(clearTeamDataCache).toHaveBeenCalledTimes(3);
    expect(onDeltaPatch).toHaveBeenCalledWith({
      ...deletePayload,
      table: 'project_risks',
    });
  });

  it('debounces onDataRefresh when milestone or risk change events occur without onDeltaPatch', () => {
    const onDataRefresh = vi.fn();
    renderHook(() => useRealtimeTeam({ onDataRefresh, enabled: true }));

    act(() => {
      eventCallbacks['project_milestones']({
        eventType: 'UPDATE',
        new: { id: 'm1', status: 'COMPLETED' },
      });
      eventCallbacks['project_risks']({
        eventType: 'INSERT',
        new: { id: 'r2', description: 'Nuevo bloqueo técnico' },
      });
    });

    expect(clearTeamDataCache).toHaveBeenCalledTimes(2);
    expect(onDataRefresh).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(onDataRefresh).toHaveBeenCalledTimes(1);
    expect(onDataRefresh).toHaveBeenCalledWith({ forceRefresh: true });
  });

  describe('coalesceDeltaPayloads', () => {
    it('returns empty array when queue is null, undefined, or empty', () => {
      expect(coalesceDeltaPayloads()).toEqual([]);
      expect(coalesceDeltaPayloads(null)).toEqual([]);
      expect(coalesceDeltaPayloads([])).toEqual([]);
    });

    it('deduplicates rapid consecutive UPDATE events for the same entity ID within a 100ms window retaining the latest payload', () => {
      const eventQueue = [
        {
          table: 'client_projects',
          eventType: 'UPDATE',
          old: { id: 'p1', title: 'Init', progress: 10 },
          new: { id: 'p1', title: 'Init', progress: 10 },
          timestamp: 1000,
        },
        {
          table: 'client_projects',
          eventType: 'UPDATE',
          old: { id: 'p1', title: 'Init', progress: 10 },
          new: { id: 'p1', title: 'Draft v1', progress: 20 },
          timestamp: 1040,
        },
        {
          table: 'client_projects',
          eventType: 'UPDATE',
          old: { id: 'p1', title: 'Draft v1', progress: 20 },
          new: { id: 'p1', title: 'Final Production', progress: 50 },
          timestamp: 1080,
        },
      ];

      const coalesced = coalesceDeltaPayloads(eventQueue, 100);

      expect(coalesced).toHaveLength(1);
      expect(coalesced[0]).toEqual({
        table: 'client_projects',
        eventType: 'UPDATE',
        old: { id: 'p1', title: 'Init', progress: 10 },
        new: { id: 'p1', title: 'Final Production', progress: 50 },
        timestamp: 1080,
      });
    });

    it('retains UPDATE events when time delta exceeds the windowMs threshold', () => {
      const eventQueue = [
        {
          table: 'client_projects',
          eventType: 'UPDATE',
          new: { id: 'p1', title: 'Batch 1 Update' },
          timestamp: 1000,
        },
        {
          table: 'client_projects',
          eventType: 'UPDATE',
          new: { id: 'p1', title: 'Batch 2 Update' },
          timestamp: 1150, // 150ms later (> 100ms window)
        },
      ];

      const coalesced = coalesceDeltaPayloads(eventQueue, 100);
      expect(coalesced).toHaveLength(2);
      expect(coalesced[0].new.title).toBe('Batch 1 Update');
      expect(coalesced[1].new.title).toBe('Batch 2 Update');
    });

    it('coalesces consecutive UPDATE events when timestamps are omitted', () => {
      const eventQueue = [
        {
          table: 'client_projects',
          eventType: 'UPDATE',
          new: { id: 'p2', status: 'PLANNING' },
        },
        {
          table: 'client_projects',
          eventType: 'UPDATE',
          new: { id: 'p2', status: 'IN_PROGRESS' },
        },
      ];

      const coalesced = coalesceDeltaPayloads(eventQueue);
      expect(coalesced).toHaveLength(1);
      expect(coalesced[0].new).toEqual({ id: 'p2', status: 'IN_PROGRESS' });
    });

    it('properly handles mixed event queues (INSERT, UPDATE, DELETE) across different tables', () => {
      const mixedQueue = [
        {
          table: 'leads_tdr',
          eventType: 'INSERT',
          new: { id: 'lead-1', company: 'FinTech Corp', pillar: 'software' },
          timestamp: 1000,
        },
        {
          table: 'client_projects',
          eventType: 'UPDATE',
          old: { id: 'proj-1', title: 'Legacy Project' },
          new: { id: 'proj-1', title: 'Cloud Modernization v1' },
          timestamp: 1010,
        },
        {
          table: 'client_projects',
          eventType: 'UPDATE',
          old: { id: 'proj-1', title: 'Cloud Modernization v1' },
          new: { id: 'proj-1', title: 'Cloud Modernization v2' },
          timestamp: 1045,
        },
        {
          table: 'project_deliverables',
          eventType: 'DELETE',
          old: { id: 'deliv-99' },
          timestamp: 1060,
        },
        {
          table: 'leads_tdr',
          eventType: 'UPDATE',
          new: { id: 'lead-1', status: 'CALIFICADO' },
          timestamp: 1070,
        },
      ];

      const coalesced = coalesceDeltaPayloads(mixedQueue, 100);

      expect(coalesced).toHaveLength(4);
      // 1: lead-1 INSERT
      expect(coalesced[0]).toEqual({
        table: 'leads_tdr',
        eventType: 'INSERT',
        new: { id: 'lead-1', company: 'FinTech Corp', pillar: 'software' },
        timestamp: 1000,
      });
      // 2: proj-1 UPDATE (coalesced to latest v2)
      expect(coalesced[1]).toEqual({
        table: 'client_projects',
        eventType: 'UPDATE',
        old: { id: 'proj-1', title: 'Legacy Project' },
        new: { id: 'proj-1', title: 'Cloud Modernization v2' },
        timestamp: 1045,
      });
      // 3: deliv-99 DELETE
      expect(coalesced[2]).toEqual({
        table: 'project_deliverables',
        eventType: 'DELETE',
        old: { id: 'deliv-99' },
        timestamp: 1060,
      });
      // 4: lead-1 UPDATE
      expect(coalesced[3]).toEqual({
        table: 'leads_tdr',
        eventType: 'UPDATE',
        new: { id: 'lead-1', status: 'CALIFICADO' },
        timestamp: 1070,
      });
    });
  });

  it('batches and coalesces rapid incoming deltas when coalesce option is enabled on useRealtimeTeam', () => {
    const onDeltaPatch = vi.fn();
    renderHook(() =>
      useRealtimeTeam({
        onDeltaPatch,
        enabled: true,
        coalesce: true,
        coalesceWindowMs: 100,
      }),
    );

    act(() => {
      eventCallbacks['client_projects']({
        eventType: 'UPDATE',
        new: { id: 'p1', title: 'Draft v1' },
      });
      eventCallbacks['client_projects']({
        eventType: 'UPDATE',
        new: { id: 'p1', title: 'Draft v2' },
      });
      eventCallbacks['client_projects']({
        eventType: 'UPDATE',
        new: { id: 'p1', title: 'Final Title' },
      });
    });

    // Before timer advances, onDeltaPatch should not have been called
    expect(onDeltaPatch).not.toHaveBeenCalled();

    // Advance by 100ms window
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Should only have been called once with the coalesced latest payload
    expect(onDeltaPatch).toHaveBeenCalledTimes(1);
    expect(onDeltaPatch).toHaveBeenCalledWith(
      expect.objectContaining({
        table: 'client_projects',
        eventType: 'UPDATE',
        new: expect.objectContaining({ id: 'p1', title: 'Final Title' }),
      }),
    );
  });

  describe('channel status transition tracking & reconnection re-synchronization', () => {
    it('automatically triggers onDataRefresh({ forceRefresh: true }) when transitioning from CHANNEL_ERROR back to SUBSCRIBED', () => {
      let statusCallback;
      mockChannel.subscribe = vi.fn().mockImplementation((cb) => {
        statusCallback = cb;
        if (cb) cb('SUBSCRIBED');
        return mockChannel;
      });

      const onDataRefresh = vi.fn();
      const { result } = renderHook(() => useRealtimeTeam({ onDataRefresh, enabled: true }));

      expect(result.current.connectionStatus).toBe('SUBSCRIBED');
      expect(result.current.isOnline).toBe(true);
      // Initial mount subscription must NOT trigger onDataRefresh
      expect(onDataRefresh).not.toHaveBeenCalled();

      // Simulate channel connection failure
      act(() => {
        statusCallback('CHANNEL_ERROR', new Error('WebSocket connection interrupted'));
      });

      expect(result.current.connectionStatus).toBe('CHANNEL_ERROR');
      expect(result.current.isOnline).toBe(false);
      expect(onDataRefresh).not.toHaveBeenCalled();

      // Clear any prior cache calls
      clearTeamDataCache.mockClear();

      // Simulate successful reconnection back to SUBSCRIBED
      act(() => {
        statusCallback('SUBSCRIBED');
      });

      expect(result.current.connectionStatus).toBe('SUBSCRIBED');
      expect(result.current.isOnline).toBe(true);
      expect(clearTeamDataCache).toHaveBeenCalledTimes(1);
      expect(onDataRefresh).toHaveBeenCalledTimes(1);
      expect(onDataRefresh).toHaveBeenCalledWith({ forceRefresh: true });
    });

    it('automatically triggers onDataRefresh({ forceRefresh: true }) when transitioning from CLOSED back to SUBSCRIBED', () => {
      let statusCallback;
      mockChannel.subscribe = vi.fn().mockImplementation((cb) => {
        statusCallback = cb;
        if (cb) cb('SUBSCRIBED');
        return mockChannel;
      });

      const onDataRefresh = vi.fn();
      const { result } = renderHook(() => useRealtimeTeam({ onDataRefresh, enabled: true }));

      expect(onDataRefresh).not.toHaveBeenCalled();

      // Simulate channel close
      act(() => {
        statusCallback('CLOSED');
      });

      expect(result.current.connectionStatus).toBe('CLOSED');
      expect(result.current.isOnline).toBe(false);
      expect(onDataRefresh).not.toHaveBeenCalled();

      clearTeamDataCache.mockClear();

      // Reconnection back to SUBSCRIBED
      act(() => {
        statusCallback('SUBSCRIBED');
      });

      expect(result.current.connectionStatus).toBe('SUBSCRIBED');
      expect(result.current.isOnline).toBe(true);
      expect(clearTeamDataCache).toHaveBeenCalledTimes(1);
      expect(onDataRefresh).toHaveBeenCalledTimes(1);
      expect(onDataRefresh).toHaveBeenCalledWith({ forceRefresh: true });
    });

    it('triggers onDataRefresh({ forceRefresh: true }) upon reconnection even when onDeltaPatch is active', () => {
      let statusCallback;
      mockChannel.subscribe = vi.fn().mockImplementation((cb) => {
        statusCallback = cb;
        if (cb) cb('SUBSCRIBED');
        return mockChannel;
      });

      const onDataRefresh = vi.fn();
      const onDeltaPatch = vi.fn();
      const { result } = renderHook(() =>
        useRealtimeTeam({
          onDataRefresh,
          onDeltaPatch,
          enabled: true,
        }),
      );

      expect(onDataRefresh).not.toHaveBeenCalled();
      expect(onDeltaPatch).not.toHaveBeenCalled();

      // Disconnect
      act(() => {
        statusCallback('CHANNEL_ERROR', new Error('Socket reset'));
      });

      expect(result.current.connectionStatus).toBe('CHANNEL_ERROR');

      clearTeamDataCache.mockClear();

      // Reconnect
      act(() => {
        statusCallback('SUBSCRIBED');
      });

      expect(result.current.connectionStatus).toBe('SUBSCRIBED');
      expect(clearTeamDataCache).toHaveBeenCalledTimes(1);
      expect(onDataRefresh).toHaveBeenCalledTimes(1);
      expect(onDataRefresh).toHaveBeenCalledWith({ forceRefresh: true });
    });

    it('does not trigger onDataRefresh on initial subscription or consecutive SUBSCRIBED statuses', () => {
      let statusCallback;
      mockChannel.subscribe = vi.fn().mockImplementation((cb) => {
        statusCallback = cb;
        return mockChannel;
      });

      const onDataRefresh = vi.fn();
      const { result } = renderHook(() => useRealtimeTeam({ onDataRefresh, enabled: true }));

      // Initial CONNECTING state
      expect(result.current.connectionStatus).toBe('CONNECTING');
      expect(onDataRefresh).not.toHaveBeenCalled();

      // Initial subscription
      act(() => {
        statusCallback('SUBSCRIBED');
      });
      expect(result.current.connectionStatus).toBe('SUBSCRIBED');
      expect(onDataRefresh).not.toHaveBeenCalled();

      // Redundant SUBSCRIBED event without error in between
      act(() => {
        statusCallback('SUBSCRIBED');
      });
      expect(onDataRefresh).not.toHaveBeenCalled();
    });
  });

  describe('shouldDispatchDelta', () => {
    it('returns false when payload is null, undefined, or not an object', () => {
      expect(shouldDispatchDelta(null)).toBe(false);
      expect(shouldDispatchDelta(undefined)).toBe(false);
      expect(shouldDispatchDelta('string')).toBe(false);
      expect(shouldDispatchDelta(123)).toBe(false);
    });

    it('returns true when viewScope === "ALL" or viewScope is not specified, regardless of assigned email', () => {
      const payloadOtherTask = {
        table: 'project_tasks',
        eventType: 'UPDATE',
        new: { id: 't-1', title: 'Tarea Ajena', assigned_to_email: 'otro@inmerge.pe' },
      };

      // viewScope === 'ALL'
      expect(shouldDispatchDelta(payloadOtherTask, { userEmail: 'dev@inmerge.pe', viewScope: 'ALL' })).toBe(true);

      // No options provided
      expect(shouldDispatchDelta(payloadOtherTask)).toBe(true);
      expect(shouldDispatchDelta(payloadOtherTask, {})).toBe(true);

      // userEmail missing or empty
      expect(shouldDispatchDelta(payloadOtherTask, { viewScope: 'ASSIGNED' })).toBe(true);
      expect(shouldDispatchDelta(payloadOtherTask, { userEmail: '', viewScope: 'ASSIGNED' })).toBe(true);

      // viewScope not ASSIGNED
      expect(shouldDispatchDelta(payloadOtherTask, { userEmail: 'dev@inmerge.pe', viewScope: 'CUSTOM' })).toBe(true);
    });

    it('returns true for non-task/deliverable tables even when viewScope === "ASSIGNED"', () => {
      const projectPayload = {
        table: 'client_projects',
        eventType: 'UPDATE',
        new: { id: 'p-1', title: 'Infraestructura Cloud' },
      };
      const leadPayload = {
        table: 'leads_tdr',
        eventType: 'INSERT',
        new: { id: 'l-1', company: 'FinTech', email: 'prospecto@fintech.pe' },
      };
      const milestonePayload = {
        table: 'project_milestones',
        eventType: 'UPDATE',
        new: { id: 'm-1', title: 'Hito 1', assigned_to_email: 'otro@inmerge.pe' },
      };
      const riskPayload = {
        table: 'project_risks',
        eventType: 'INSERT',
        new: { id: 'r-1', description: 'Riesgo Técnico' },
      };

      expect(shouldDispatchDelta(projectPayload, { userEmail: 'dev@inmerge.pe', viewScope: 'ASSIGNED' })).toBe(true);
      expect(shouldDispatchDelta(leadPayload, { userEmail: 'dev@inmerge.pe', viewScope: 'ASSIGNED' })).toBe(true);
      expect(shouldDispatchDelta(milestonePayload, { userEmail: 'dev@inmerge.pe', viewScope: 'ASSIGNED' })).toBe(true);
      expect(shouldDispatchDelta(riskPayload, { userEmail: 'dev@inmerge.pe', viewScope: 'ASSIGNED' })).toBe(true);
    });

    describe('when viewScope === "ASSIGNED"', () => {
      const userEmail = 'dev@inmerge.pe';

      it('ignores (returns false) deltas for project_tasks assigned to a different email', () => {
        const payload = {
          table: 'project_tasks',
          eventType: 'UPDATE',
          new: { id: 't-1', title: 'Optimizar Dockerfile', assigned_to_email: 'otro@inmerge.pe' },
        };
        expect(shouldDispatchDelta(payload, { userEmail, viewScope: 'ASSIGNED' })).toBe(false);
      });

      it('dispatches (returns true) deltas for project_tasks assigned to the user email (case-insensitive)', () => {
        const payloadExact = {
          table: 'project_tasks',
          eventType: 'UPDATE',
          new: { id: 't-2', title: 'Auditoría PostgreSQL', assigned_to_email: 'dev@inmerge.pe' },
        };
        const payloadUpperCase = {
          table: 'project_tasks',
          eventType: 'UPDATE',
          new: { id: 't-3', title: 'Auditoría AWS', assigned_to_email: 'DEV@INMERGE.PE' },
        };
        expect(shouldDispatchDelta(payloadExact, { userEmail, viewScope: 'ASSIGNED' })).toBe(true);
        expect(shouldDispatchDelta(payloadUpperCase, { userEmail: 'dev@inmerge.pe', viewScope: 'ASSIGNED' })).toBe(true);
        expect(shouldDispatchDelta(payloadExact, { userEmail: 'DEV@INMERGE.PE', viewScope: 'ASSIGNED' })).toBe(true);
      });

      it('ignores (returns false) deltas for project_deliverables assigned to or authored by a different email', () => {
        const payloadOtherAuthor = {
          table: 'project_deliverables',
          eventType: 'INSERT',
          new: { id: 'd-1', title: 'Reporte Técnico', author_email: 'auditor@inmerge.pe' },
        };
        const payloadOtherAssigned = {
          table: 'project_deliverables',
          eventType: 'UPDATE',
          new: { id: 'd-2', title: 'Reporte Arquitectura', assigned_to_email: 'lead@inmerge.pe' },
        };
        expect(shouldDispatchDelta(payloadOtherAuthor, { userEmail, viewScope: 'ASSIGNED' })).toBe(false);
        expect(shouldDispatchDelta(payloadOtherAssigned, { userEmail, viewScope: 'ASSIGNED' })).toBe(false);
      });

      it('dispatches (returns true) deltas for project_deliverables when user is author or assignee', () => {
        const payloadAuthor = {
          table: 'project_deliverables',
          eventType: 'INSERT',
          new: { id: 'd-3', title: 'Certificación Cloud', author_email: 'dev@inmerge.pe' },
        };
        const payloadAssignee = {
          table: 'project_deliverables',
          eventType: 'UPDATE',
          new: { id: 'd-4', title: 'Plan de Pruebas', assigned_to_email: 'dev@inmerge.pe' },
        };
        expect(shouldDispatchDelta(payloadAuthor, { userEmail, viewScope: 'ASSIGNED' })).toBe(true);
        expect(shouldDispatchDelta(payloadAssignee, { userEmail, viewScope: 'ASSIGNED' })).toBe(true);
      });

      it('handles camelCase field variants (assignedToEmail, authorEmail)', () => {
        const payloadCamelTask = {
          table: 'project_tasks',
          eventType: 'UPDATE',
          new: { id: 't-5', title: 'Configurar CI/CD', assignedToEmail: 'otro@inmerge.pe' },
        };
        const payloadCamelDeliv = {
          table: 'project_deliverables',
          eventType: 'UPDATE',
          new: { id: 'd-5', title: 'Entregable v1', authorEmail: 'otro@inmerge.pe' },
        };

        expect(shouldDispatchDelta(payloadCamelTask, { userEmail, viewScope: 'ASSIGNED' })).toBe(false);
        expect(shouldDispatchDelta(payloadCamelDeliv, { userEmail, viewScope: 'ASSIGNED' })).toBe(false);

        const payloadMyTaskCamel = {
          table: 'project_tasks',
          eventType: 'UPDATE',
          new: { id: 't-6', title: 'Configurar CI/CD', assignedToEmail: 'dev@inmerge.pe' },
        };
        expect(shouldDispatchDelta(payloadMyTaskCamel, { userEmail, viewScope: 'ASSIGNED' })).toBe(true);
      });

      it('dispatches tasks or deliverables without any assigned or author email (unassigned)', () => {
        const unassignedTask = {
          table: 'project_tasks',
          eventType: 'INSERT',
          new: { id: 't-7', title: 'Tarea no asignada', assigned_to_email: null },
        };
        const unassignedDeliv = {
          table: 'project_deliverables',
          eventType: 'INSERT',
          new: { id: 'd-6', title: 'Entregable general' },
        };
        expect(shouldDispatchDelta(unassignedTask, { userEmail, viewScope: 'ASSIGNED' })).toBe(true);
        expect(shouldDispatchDelta(unassignedDeliv, { userEmail, viewScope: 'ASSIGNED' })).toBe(true);
      });

      it('handles DELETE events inspecting the old row payload', () => {
        const deleteOtherTask = {
          table: 'project_tasks',
          eventType: 'DELETE',
          old: { id: 't-8', assigned_to_email: 'otro@inmerge.pe' },
        };
        const deleteMyTask = {
          table: 'project_tasks',
          eventType: 'DELETE',
          old: { id: 't-9', assigned_to_email: 'dev@inmerge.pe' },
        };

        expect(shouldDispatchDelta(deleteOtherTask, { userEmail, viewScope: 'ASSIGNED' })).toBe(false);
        expect(shouldDispatchDelta(deleteMyTask, { userEmail, viewScope: 'ASSIGNED' })).toBe(true);
      });
    });
  });

  describe('hook integration with user scope filtering', () => {
    it('filters out project_tasks delta and does not call onDeltaPatch or clear cache when viewScope === "ASSIGNED" and task belongs to another user', () => {
      const onDeltaPatch = vi.fn();
      renderHook(() =>
        useRealtimeTeam({
          onDeltaPatch,
          enabled: true,
          userEmail: 'dev@inmerge.pe',
          viewScope: 'ASSIGNED',
        }),
      );

      act(() => {
        eventCallbacks['project_tasks']({
          eventType: 'UPDATE',
          new: { id: 't-other', title: 'Tarea de Tercero', assigned_to_email: 'otro@inmerge.pe' },
        });
      });

      expect(clearTeamDataCache).not.toHaveBeenCalled();
      expect(onDeltaPatch).not.toHaveBeenCalled();

      // But dispatches when task is assigned to user
      act(() => {
        eventCallbacks['project_tasks']({
          eventType: 'UPDATE',
          new: { id: 't-mine', title: 'Mi Tarea Asignada', assigned_to_email: 'dev@inmerge.pe' },
        });
      });

      expect(clearTeamDataCache).toHaveBeenCalledTimes(1);
      expect(onDeltaPatch).toHaveBeenCalledWith(
        expect.objectContaining({
          table: 'project_tasks',
          new: expect.objectContaining({ id: 't-mine' }),
        }),
      );
    });

    it('filters out project_deliverables toast and delta when viewScope === "ASSIGNED" and deliverable is not assigned to or authored by user', () => {
      const onDeltaPatch = vi.fn();
      const { result } = renderHook(() =>
        useRealtimeTeam({
          onDeltaPatch,
          enabled: true,
          userEmail: 'dev@inmerge.pe',
          viewScope: 'ASSIGNED',
        }),
      );

      act(() => {
        eventCallbacks['project_deliverables']({
          eventType: 'INSERT',
          new: { id: 'd-other', title: 'Entregable Ajeno', author_email: 'otro@inmerge.pe' },
        });
      });

      expect(clearTeamDataCache).not.toHaveBeenCalled();
      expect(onDeltaPatch).not.toHaveBeenCalled();
      expect(result.current.toast).toBeNull();

      // Dispatches and shows toast when deliverable is authored by the user
      act(() => {
        eventCallbacks['project_deliverables']({
          eventType: 'INSERT',
          new: { id: 'd-mine', title: 'Mi Informe de Auditoría', author_email: 'dev@inmerge.pe' },
        });
      });

      expect(clearTeamDataCache).toHaveBeenCalledTimes(1);
      expect(onDeltaPatch).toHaveBeenCalledWith(
        expect.objectContaining({
          table: 'project_deliverables',
          new: expect.objectContaining({ id: 'd-mine' }),
        }),
      );
      expect(result.current.toast).toEqual({
        type: 'deliverable',
        title: 'Entregable Publicado',
        message: 'Nuevo entregable publicado: "Mi Informe de Auditoría".',
      });
    });

    it('dispatches all deltas when viewScope is "ALL"', () => {
      const onDeltaPatch = vi.fn();
      renderHook(() =>
        useRealtimeTeam({
          onDeltaPatch,
          enabled: true,
          userEmail: 'dev@inmerge.pe',
          viewScope: 'ALL',
        }),
      );

      act(() => {
        eventCallbacks['project_tasks']({
          eventType: 'UPDATE',
          new: { id: 't-any', title: 'Cualquier Tarea', assigned_to_email: 'otro@inmerge.pe' },
        });
      });

      expect(clearTeamDataCache).toHaveBeenCalledTimes(1);
      expect(onDeltaPatch).toHaveBeenCalledWith(
        expect.objectContaining({
          table: 'project_tasks',
          new: expect.objectContaining({ id: 't-any' }),
        }),
      );
    });
  });
});
