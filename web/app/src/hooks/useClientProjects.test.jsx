import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import useClientProjects from './useClientProjects.js';
import * as authLib from '../lib/auth.jsx';
import * as projectsLib from '../lib/projects.js';
import { supabase } from '../lib/supabaseClient.js';

vi.mock('../lib/auth.jsx', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../lib/projects.js', () => ({
  fetchClientProjects: vi.fn(),
}));

vi.mock('../lib/supabaseClient.js', () => ({
  supabase: {
    channel: vi.fn(),
    removeChannel: vi.fn(),
  },
}));

describe('useClientProjects', () => {
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

  it('loads client projects on mount and subscribes to Realtime channel', async () => {
    authLib.useAuth.mockReturnValue({ user: { id: 'user-123', email: 'cliente@inmerge.pe' } });
    projectsLib.fetchClientProjects.mockResolvedValue([
      { id: 'proj-1', title: 'Auditoría Cloud AWS', status: 'EN_PROCESO' },
    ]);

    const { result } = renderHook(() => useClientProjects());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.projects).toHaveLength(1);
    expect(result.current.projects[0].title).toBe('Auditoría Cloud AWS');
    expect(supabase.channel).toHaveBeenCalledWith('realtime-client-portal-user-123');
    expect(mockChannel.subscribe).toHaveBeenCalled();
  });

  it('triggers toast notification and reloads when a deliverable is published', async () => {
    authLib.useAuth.mockReturnValue({ user: { id: 'user-123' } });
    projectsLib.fetchClientProjects
      .mockResolvedValueOnce([{ id: 'proj-1', title: 'Auditoría' }])
      .mockResolvedValueOnce([{ id: 'proj-1', title: 'Auditoría', deliverables: [{ id: 'del-1' }] }]);

    const { result } = renderHook(() => useClientProjects());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Simulate Supabase Realtime deliverable INSERT event
    act(() => {
      if (eventCallbacks['project_deliverables']) {
        eventCallbacks['project_deliverables']({
          eventType: 'INSERT',
          new: { title: 'Informe Final Forense.pdf' },
        });
      }
    });

    expect(result.current.toast).toEqual({
      type: 'deliverable',
      title: 'Nuevo Entregable Disponible',
      message: 'Se ha publicado el entregable "Informe Final Forense.pdf".',
    });

    act(() => {
      result.current.dismissToast();
    });

    expect(result.current.toast).toBeNull();
  });

  it('removes channel on unmount', async () => {
    authLib.useAuth.mockReturnValue({ user: { id: 'user-123' } });
    projectsLib.fetchClientProjects.mockResolvedValue([]);

    const { unmount } = renderHook(() => useClientProjects());
    unmount();

    expect(supabase.removeChannel).toHaveBeenCalledWith(mockChannel);
  });
});
