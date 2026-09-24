import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  CLIENT_PROJECTS_CACHE_TTL_MS,
  fetchClientProjects,
  clearClientProjectsCache,
  getSignedDeliverableUrl,
  calculateFileSha256,
  verifyDeliverableIntegrity,
  generateExecutiveReportMarkdown,
} from './projects.js';
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
    clearClientProjectsCache();
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

  it('filtra entregables de cliente para excluir borradores internos o en revisión', async () => {
    const mockSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: [
            {
              id: 'proj-1',
              title: 'Auditoría Cloud AWS',
              client_id: 'user-123',
              project_milestones: [],
              project_deliverables: [
                { id: 'deliv-1', title: 'Dictamen Oficial', status: 'PUBLICADO_CLIENTE' },
                { id: 'deliv-2', title: 'Borrador Técnico', status: 'BORRADOR_INTERNO' },
                { id: 'deliv-3', title: 'Informe en Revisión', status: 'EN_REVISION' },
                { id: 'deliv-4', title: 'Entregable Antiguo Sin Estado' },
              ],
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
    expect(projects[0].deliverables).toHaveLength(2);
    expect(projects[0].deliverables.map((d) => d.id)).toEqual(['deliv-1', 'deliv-4']);
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

  it('calculateFileSha256 and verifyDeliverableIntegrity perform cryptographic validation', async () => {
    const testData = new TextEncoder().encode('Inmerge Technical Audit Deliverable');
    const blob = new Blob([testData], { type: 'text/plain' });

    const hash = await calculateFileSha256(blob);
    expect(hash).toBeDefined();
    expect(hash).toHaveLength(64);

    const verification = await verifyDeliverableIntegrity(blob, hash);
    expect(verification.valid).toBe(true);

    const badVerification = await verifyDeliverableIntegrity(blob, '0000000000000000000000000000000000000000000000000000000000000000');
    expect(badVerification.valid).toBe(false);
  });

  it('generateExecutiveReportMarkdown produces a complete editorial markdown summary', () => {
    const sampleProj = {
      title: 'Auditoría Forense de Base de Datos',
      pillar: '01. Auditoría Técnica & Datos',
      health_status: 'ON_TRACK',
      tech_lead_name: 'Carlos Mendoza',
      tech_lead_contact: 'cmendoza@inmerge.pe',
      milestones: [{ title: 'Fase 1: Diagnóstico', status: 'COMPLETED', due_date: '2026-09-30' }],
      tasks: [{ title: 'Análisis de Redundancias', status: 'DONE', estimated_hours: 20, actual_hours: 18 }],
      deliverables: [{ title: 'Reporte Forense.pdf', version: '1.0', file_type: 'PDF', sha256_checksum: 'a1b2c3d4e5f6' }],
    };

    const report = generateExecutiveReportMarkdown(sampleProj);
    expect(report).toContain('INMERGE — Resumen Ejecutivo de Proyecto');
    expect(report).toContain('Auditoría Forense de Base de Datos');
    expect(report).toContain('Reporte Forense.pdf');
    expect(report).toContain('a1b2c3d4e5f6');
  });

  it('caches client projects per userId for 30s TTL and avoids redundant queries', async () => {
    const mockOrder = vi.fn().mockResolvedValue({
      data: [{ id: 'proj-1', title: 'Audit P1', client_id: 'user-a' }],
      error: null,
    });
    const mockEq = vi.fn().mockReturnValue({ order: mockOrder });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    supabase.from.mockReturnValue({ select: mockSelect });

    // Call 1 for user-a
    const firstCall = await fetchClientProjects('user-a');
    expect(firstCall).toHaveLength(1);
    expect(supabase.from).toHaveBeenCalledTimes(1);

    // Call 2 for user-a should hit cache
    const secondCall = await fetchClientProjects('user-a');
    expect(secondCall).toHaveLength(1);
    expect(supabase.from).toHaveBeenCalledTimes(1);

    // Call for user-b should query database
    await fetchClientProjects('user-b');
    expect(supabase.from).toHaveBeenCalledTimes(2);
  });

  it('bypasses cache when forceRefresh is true', async () => {
    const mockOrder = vi.fn().mockResolvedValue({
      data: [{ id: 'proj-1', title: 'Audit P1', client_id: 'user-a' }],
      error: null,
    });
    const mockEq = vi.fn().mockReturnValue({ order: mockOrder });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    supabase.from.mockReturnValue({ select: mockSelect });

    await fetchClientProjects('user-a');
    expect(supabase.from).toHaveBeenCalledTimes(1);

    await fetchClientProjects('user-a', { forceRefresh: true });
    expect(supabase.from).toHaveBeenCalledTimes(2);
  });

  it('clearClientProjectsCache clears cache for specific user or all users', async () => {
    const mockOrder = vi.fn().mockResolvedValue({
      data: [{ id: 'proj-1', title: 'Audit P1', client_id: 'user-a' }],
      error: null,
    });
    const mockEq = vi.fn().mockReturnValue({ order: mockOrder });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    supabase.from.mockReturnValue({ select: mockSelect });

    // Fill cache for user-a and user-b
    await fetchClientProjects('user-a');
    await fetchClientProjects('user-b');
    expect(supabase.from).toHaveBeenCalledTimes(2);

    // Clear user-a only
    clearClientProjectsCache('user-a');

    // user-a should query DB again
    await fetchClientProjects('user-a');
    expect(supabase.from).toHaveBeenCalledTimes(3);

    // user-b should still hit cache
    await fetchClientProjects('user-b');
    expect(supabase.from).toHaveBeenCalledTimes(3);

    // Clear all
    clearClientProjectsCache();

    // user-b should now query DB again
    await fetchClientProjects('user-b');
    expect(supabase.from).toHaveBeenCalledTimes(4);
  });

  it('exports CLIENT_PROJECTS_CACHE_TTL_MS equal to 30000 ms', () => {
    expect(CLIENT_PROJECTS_CACHE_TTL_MS).toBe(30000);
  });

  it('expires cache for userId after 30 seconds TTL', async () => {
    vi.useFakeTimers();
    try {
      const mockOrder = vi.fn().mockResolvedValue({
        data: [{ id: 'proj-1', title: 'Audit P1', client_id: 'user-a' }],
        error: null,
      });
      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({ order: mockOrder }),
        }),
      });

      await fetchClientProjects('user-a');
      expect(mockOrder).toHaveBeenCalledTimes(1);

      // Advance 29 seconds - within TTL window
      vi.advanceTimersByTime(29000);
      await fetchClientProjects('user-a');
      expect(mockOrder).toHaveBeenCalledTimes(1);

      // Advance past 30 seconds (total 31 seconds) - expired
      vi.advanceTimersByTime(2000);
      await fetchClientProjects('user-a');
      expect(mockOrder).toHaveBeenCalledTimes(2);
    } finally {
      vi.useRealTimers();
    }
  });

  it('returns independent cached references for distinct userIds', async () => {
    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockImplementation((col, uid) => ({
          order: vi.fn().mockResolvedValue({
            data: [{ id: `proj-${uid}`, title: `Audit ${uid}`, client_id: uid }],
            error: null,
          }),
        })),
      }),
    });

    const userARes1 = await fetchClientProjects('user-a');
    const userBRes1 = await fetchClientProjects('user-b');
    const userARes2 = await fetchClientProjects('user-a');
    const userBRes2 = await fetchClientProjects('user-b');

    expect(userARes1).toBe(userARes2);
    expect(userBRes1).toBe(userBRes2);
    expect(userARes1).not.toBe(userBRes1);
    expect(userARes1[0].client_id).toBe('user-a');
    expect(userBRes1[0].client_id).toBe('user-b');
  });

  it('clearClientProjectsCache deletes only cache for userId when supplied, and clears all when null or undefined', async () => {
    let callCount = 0;
    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockImplementation((col, uid) => ({
          order: vi.fn().mockImplementation(() => {
            callCount++;
            return Promise.resolve({
              data: [{ id: `proj-${uid}-${callCount}`, title: `Audit ${uid}`, client_id: uid }],
              error: null,
            });
          }),
        })),
      }),
    });

    // Populate user-a and user-b
    const a1 = await fetchClientProjects('user-a');
    const b1 = await fetchClientProjects('user-b');

    // Invalidate user-a only
    clearClientProjectsCache('user-a');
    const a2 = await fetchClientProjects('user-a');
    const b2 = await fetchClientProjects('user-b');

    expect(a2).not.toBe(a1); // user-a refetched
    expect(b2).toBe(b1); // user-b stayed cached

    // Invalidate with undefined clears all
    clearClientProjectsCache(undefined);
    const b3 = await fetchClientProjects('user-b');
    expect(b3).not.toBe(b2); // user-b refetched

    // Invalidate with null clears all
    clearClientProjectsCache(null);
    const b4 = await fetchClientProjects('user-b');
    expect(b4).not.toBe(b3); // user-b refetched again
  });
});
