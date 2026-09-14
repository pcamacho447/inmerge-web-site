import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchClientProjects, getSignedDeliverableUrl } from './projects.js';
import { supabase } from './supabaseClient.js';

vi.mock('./supabaseClient.js', () => ({
  supabase: {
    from: vi.fn(),
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

  it('generates signed deliverable download url', async () => {
    const mockCreateSignedUrl = vi.fn().mockResolvedValue({
      data: { signedUrl: 'https://supabase.co/storage/v1/object/sign/deliverables/inf.pdf?token=abc' },
      error: null,
    });

    supabase.storage.from.mockReturnValue({
      createSignedUrl: mockCreateSignedUrl,
    });

    const url = await getSignedDeliverableUrl('projects/p1/informe.pdf');
    expect(url).toContain('https://supabase.co/storage');
    expect(mockCreateSignedUrl).toHaveBeenCalledWith('projects/p1/informe.pdf', 3600);
  });
});
