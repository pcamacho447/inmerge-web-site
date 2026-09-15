import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchClientProjects, getSignedDeliverableUrl } from './projects.js';
import { supabase } from './supabaseClient.js';

vi.mock('./supabaseClient.js', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'client-user-1' } }, error: null }),
    },
    functions: {
      invoke: vi.fn(),
    },
    storage: {
      from: vi.fn(),
    },
  },
}));

describe('projects.js', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns empty array if userId is not provided', async () => {
    const res = await fetchClientProjects(null);
    expect(res).toEqual([]);
  });

  it('fetches and sorts milestones of client projects', async () => {
    const mockSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: [
            {
              id: 'proj-1',
              title: 'Auditoría Cloud AWS',
              client_id: 'user-123',
              project_milestones: [
                { id: 'm-2', title: 'Hito 2', order_index: 2 },
                { id: 'm-1', title: 'Hito 1', order_index: 1 },
              ],
              project_deliverables: [{ id: 'd-1', title: 'Informe de Vulnerabilidades.pdf' }],
            },
          ],
          error: null,
        }),
      }),
    });

    supabase.from.mockReturnValue({
      select: mockSelect,
    });

    const projects = await fetchClientProjects('user-123');
    expect(projects).toHaveLength(1);
    expect(projects[0].milestones[0].id).toBe('m-1');
    expect(projects[0].milestones[1].id).toBe('m-2');
    expect(projects[0].deliverables).toHaveLength(1);
  });

  it('invoca la Edge Function secure-download para obtener la URL firmada con auditoría', async () => {
    supabase.functions.invoke.mockResolvedValue({
      data: {
        success: true,
        signedUrl: 'https://supabase.co/storage/v1/object/sign/deliverables/secure-doc.pdf?token=xyz',
        expiresIn: 900,
      },
      error: null,
    });

    const url = await getSignedDeliverableUrl({
      filePath: 'projects/p1/secure-doc.pdf',
      deliverableId: 'deliv-999',
      expiresIn: 900,
    });

    expect(supabase.functions.invoke).toHaveBeenCalledWith('secure-download', {
      body: {
        deliverableId: 'deliv-999',
        filePath: 'projects/p1/secure-doc.pdf',
        expiresIn: 900,
      },
    });
    expect(url).toContain('secure-doc.pdf');
  });

  it('ejecuta fallback a Storage y registra log si la Edge Function falla o no está disponible', async () => {
    supabase.functions.invoke.mockRejectedValue(new Error('Edge Function Unavailable'));

    const mockCreateSignedUrl = vi.fn().mockResolvedValue({
      data: { signedUrl: 'https://supabase.co/storage/v1/object/sign/deliverables/inf.pdf?token=abc' },
      error: null,
    });

    const mockInsert = vi.fn().mockResolvedValue({ data: null, error: null });

    supabase.storage.from.mockReturnValue({
      createSignedUrl: mockCreateSignedUrl,
    });
    supabase.from.mockReturnValue({
      insert: mockInsert,
    });

    const url = await getSignedDeliverableUrl('projects/p1/informe.pdf', 'deliv-123', 900);
    expect(url).toContain('https://supabase.co/storage');
    expect(mockCreateSignedUrl).toHaveBeenCalledWith('projects/p1/informe.pdf', 900);
    expect(supabase.from).toHaveBeenCalledWith('team_activity_logs');
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'DELIVERABLE_DOWNLOADED',
        entity_id: 'deliv-123',
      }),
    );
  });
});
