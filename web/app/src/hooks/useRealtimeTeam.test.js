import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useRealtimeTeam from './useRealtimeTeam.js';
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
});
