import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useRealtimeTeam from './useRealtimeTeam.js';
import { supabase } from '../lib/supabaseClient.js';

vi.mock('../lib/supabaseClient.js', () => ({
  supabase: {
    channel: vi.fn(),
    removeChannel: vi.fn(),
  },
}));

describe('useRealtimeTeam', () => {
  let mockChannel;
  let eventCallbacks;

  beforeEach(() => {
    vi.clearAllMocks();
    eventCallbacks = {};

    mockChannel = {
      on: vi.fn().mockImplementation((event, filter, callback) => {
        const table = filter.table;
        eventCallbacks[table] = callback;
        return mockChannel;
      }),
      subscribe: vi.fn().mockReturnValue(mockChannel),
    };

    supabase.channel.mockReturnValue(mockChannel);
  });

  it('subscribes to realtime-team-consultancy channel when enabled', () => {
    const onDataRefresh = vi.fn();
    renderHook(() => useRealtimeTeam({ onDataRefresh, enabled: true }));

    expect(supabase.channel).toHaveBeenCalledWith('realtime-team-consultancy');
    expect(mockChannel.subscribe).toHaveBeenCalled();
  });

  it('handles new lead TDR INSERT event and calls onDataRefresh', () => {
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
    expect(onDataRefresh).toHaveBeenCalledTimes(1);
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
    expect(onDataRefresh).toHaveBeenCalledTimes(1);
  });

  it('unsubscribes and cleans up channel on unmount', () => {
    const { unmount } = renderHook(() => useRealtimeTeam({ enabled: true }));
    unmount();

    expect(supabase.removeChannel).toHaveBeenCalledWith(mockChannel);
  });
});
