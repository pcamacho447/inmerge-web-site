import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  CLIENT_PROJECTS_CACHE_TTL_MS,
  fetchClientProjects,
  clearClientProjectsCache,
  filterDeliverablesForClient,
  getSignedDeliverableUrl,
  calculateFileSha256,
  verifyDeliverableIntegrity,
  generateExecutiveReportMarkdown,
  getClientCacheMetrics,
  resetClientCacheMetrics,
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
    resetClientCacheMetrics();
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

  describe('Client Cache Diagnostics & Metrics', () => {
    it('getClientCacheMetrics retorna estado inicial vacío tras reset y limpieza de caché', () => {
      clearClientProjectsCache();
      resetClientCacheMetrics();

      const metrics = getClientCacheMetrics();
      expect(metrics).toEqual({
        hits: 0,
        misses: 0,
        totalRequests: 0,
        hitRatioPct: 0,
        activeUsersInCache: 0,
      });
    });

    it('fetchClientProjects incrementa misses en primera consulta y hits en consultas subsecuentes', async () => {
      const mockProjects = [{ id: 'proj-1', title: 'Auditoría Cliente', client_id: 'user-client-1' }];
      const orderMock = vi.fn().mockResolvedValue({ data: mockProjects, error: null });
      const eqMock = vi.fn().mockReturnValue({ order: orderMock });
      const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
      supabase.from.mockReturnValue({ select: selectMock });

      // 1. Primera consulta: Miss (va a base de datos)
      await fetchClientProjects('user-client-1');
      let metrics = getClientCacheMetrics();
      expect(metrics.misses).toBe(1);
      expect(metrics.hits).toBe(0);
      expect(metrics.totalRequests).toBe(1);
      expect(metrics.hitRatioPct).toBe(0);
      expect(metrics.activeUsersInCache).toBe(1);

      // 2. Segunda consulta dentro de TTL: Hit
      await fetchClientProjects('user-client-1');
      metrics = getClientCacheMetrics();
      expect(metrics.misses).toBe(1);
      expect(metrics.hits).toBe(1);
      expect(metrics.totalRequests).toBe(2);
      expect(metrics.hitRatioPct).toBe(50);
      expect(metrics.activeUsersInCache).toBe(1);

      // 3. Tercera consulta dentro de TTL: Hit
      await fetchClientProjects('user-client-1');
      metrics = getClientCacheMetrics();
      expect(metrics.misses).toBe(1);
      expect(metrics.hits).toBe(2);
      expect(metrics.totalRequests).toBe(3);
      expect(metrics.hitRatioPct).toBe(66.67);

      // 4. Consulta con forceRefresh: Miss
      await fetchClientProjects('user-client-1', { forceRefresh: true });
      metrics = getClientCacheMetrics();
      expect(metrics.misses).toBe(2);
      expect(metrics.hits).toBe(2);
      expect(metrics.totalRequests).toBe(4);
      expect(metrics.hitRatioPct).toBe(50);
      expect(metrics.activeUsersInCache).toBe(1);
    });

    it('activeUsersInCache refleja usuarios activos independientes y respeta invalidación granular', async () => {
      const mockProjectsA = [{ id: 'proj-a', title: 'Proyecto A', client_id: 'user-a' }];
      const mockProjectsB = [{ id: 'proj-b', title: 'Proyecto B', client_id: 'user-b' }];

      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockImplementation((col, uid) => ({
            order: vi.fn().mockResolvedValue({
              data: uid === 'user-a' ? mockProjectsA : mockProjectsB,
              error: null,
            }),
          })),
        }),
      });

      await fetchClientProjects('user-a');
      expect(getClientCacheMetrics().activeUsersInCache).toBe(1);

      await fetchClientProjects('user-b');
      expect(getClientCacheMetrics().activeUsersInCache).toBe(2);

      // Invalidar solo user-a
      clearClientProjectsCache('user-a');
      let metrics = getClientCacheMetrics();
      expect(metrics.activeUsersInCache).toBe(1);

      // Invalidar todos
      clearClientProjectsCache();
      metrics = getClientCacheMetrics();
      expect(metrics.activeUsersInCache).toBe(0);
      expect(metrics.totalRequests).toBe(2); // Los contadores se preservan
    });

    it('resetClientCacheMetrics restablece hits y misses a cero preservando activeUsersInCache', async () => {
      const mockProjects = [{ id: 'proj-1', title: 'Auditoría Cliente', client_id: 'user-client-1' }];
      const orderMock = vi.fn().mockResolvedValue({ data: mockProjects, error: null });
      const eqMock = vi.fn().mockReturnValue({ order: orderMock });
      supabase.from.mockReturnValue({ select: vi.fn().mockReturnValue({ eq: eqMock }) });

      await fetchClientProjects('user-client-1');
      await fetchClientProjects('user-client-1');

      let metrics = getClientCacheMetrics();
      expect(metrics.hits).toBe(1);
      expect(metrics.misses).toBe(1);
      expect(metrics.totalRequests).toBe(2);
      expect(metrics.activeUsersInCache).toBe(1);

      resetClientCacheMetrics();

      metrics = getClientCacheMetrics();
      expect(metrics.hits).toBe(0);
      expect(metrics.misses).toBe(0);
      expect(metrics.totalRequests).toBe(0);
      expect(metrics.hitRatioPct).toBe(0);
      expect(metrics.activeUsersInCache).toBe(1);
    });

    it('activeUsersInCache retorna 0 cuando las entradas en caché han expirado su TTL', async () => {
      const mockProjects = [{ id: 'proj-1', title: 'Auditoría Cliente', client_id: 'user-client-1' }];
      const orderMock = vi.fn().mockResolvedValue({ data: mockProjects, error: null });
      const eqMock = vi.fn().mockReturnValue({ order: orderMock });
      supabase.from.mockReturnValue({ select: vi.fn().mockReturnValue({ eq: eqMock }) });

      const nowSpy = vi.spyOn(Date, 'now');
      nowSpy.mockReturnValue(1000000);

      await fetchClientProjects('user-client-1');
      expect(getClientCacheMetrics().activeUsersInCache).toBe(1);

      // Avanzar más allá de los 30s de TTL (30001ms)
      nowSpy.mockReturnValue(1000000 + 30001);
      expect(getClientCacheMetrics().activeUsersInCache).toBe(0);

      nowSpy.mockRestore();
    });
  });

  describe('Strict Deliverable Client Isolation & Resilience', () => {
    it('filterDeliverablesForClient strictly includes PUBLICADO_CLIENTE and legacy deliverables without status', () => {
      const input = [
        { id: 'deliv-pub-1', title: 'Informe Final', status: 'PUBLICADO_CLIENTE' },
        { id: 'deliv-legacy-1', title: 'Entregable Histórico Sin Estado' },
        { id: 'deliv-legacy-null', title: 'Entregable con Status Null', status: null },
        { id: 'deliv-legacy-undef', title: 'Entregable con Status Undefined', status: undefined },
      ];

      const result = filterDeliverablesForClient(input);
      expect(result).toHaveLength(4);
      expect(result.map((d) => d.id)).toEqual(['deliv-pub-1', 'deliv-legacy-1', 'deliv-legacy-null', 'deliv-legacy-undef']);
    });

    it('filterDeliverablesForClient strictly excludes BORRADOR_INTERNO, EN_REVISION and any non-public status', () => {
      const input = [
        { id: 'deliv-pub', title: 'Dictamen Oficial', status: 'PUBLICADO_CLIENTE' },
        { id: 'deliv-draft', title: 'Notas de Trabajo', status: 'BORRADOR_INTERNO' },
        { id: 'deliv-rev', title: 'Revisión por Pares', status: 'EN_REVISION' },
        { id: 'deliv-arch', title: 'Entregable Archivado', status: 'ARCHIVADO' },
        { id: 'deliv-other', title: 'Otro Estado Interno', status: 'CONFIDENCIAL' },
      ];

      const result = filterDeliverablesForClient(input);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('deliv-pub');
      expect(result[0].status).toBe('PUBLICADO_CLIENTE');
    });

    it('filterDeliverablesForClient handles null, undefined, non-arrays, and malformed items gracefully without crashing', () => {
      expect(filterDeliverablesForClient(null)).toEqual([]);
      expect(filterDeliverablesForClient(undefined)).toEqual([]);
      expect(filterDeliverablesForClient('not-an-array')).toEqual([]);
      expect(filterDeliverablesForClient(42)).toEqual([]);
      expect(filterDeliverablesForClient({})).toEqual([]);

      const malformedInput = [
        null,
        undefined,
        'string-entry',
        12345,
        { id: 'valid-pub', title: 'Auditoría Certificada', status: 'PUBLICADO_CLIENTE' },
        null,
      ];
      const result = filterDeliverablesForClient(malformedInput);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('valid-pub');
    });

    it('fetchClientProjects guarantees deliverable isolation across multiple client projects and handles malformed data', async () => {
      const mockProjects = [
        {
          id: 'proj-cloud',
          title: 'Auditoría Cloud AWS',
          client_id: 'client-isolated-1',
          project_deliverables: [
            { id: 'd-pub-1', title: 'Certificación Cloud', status: 'PUBLICADO_CLIENTE' },
            { id: 'd-draft-1', title: 'Borrador Confidencial', status: 'BORRADOR_INTERNO' },
            { id: 'd-rev-1', title: 'Revisión Arquitectura', status: 'EN_REVISION' },
            null,
          ],
        },
        {
          id: 'proj-data',
          title: 'Ciencia de Datos BI',
          client_id: 'client-isolated-1',
          project_deliverables: [
            { id: 'd-draft-2', title: 'Borrador Notebook', status: 'BORRADOR_INTERNO' },
            { id: 'd-rev-2', title: 'Revisión Pipeline', status: 'EN_REVISION' },
          ],
        },
        {
          id: 'proj-empty',
          title: 'Consultoría Estratégica',
          client_id: 'client-isolated-1',
          project_deliverables: null,
        },
      ];

      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockProjects,
              error: null,
            }),
          }),
        }),
      });

      const projects = await fetchClientProjects('client-isolated-1');
      expect(projects).toHaveLength(3);

      // Proj 1: Only published deliverable survived, drafts/review and null stripped
      expect(projects[0].deliverables).toHaveLength(1);
      expect(projects[0].deliverables[0].id).toBe('d-pub-1');

      // Proj 2: All were draft/review -> empty array
      expect(projects[1].deliverables).toEqual([]);

      // Proj 3: project_deliverables was null -> empty array
      expect(projects[2].deliverables).toEqual([]);

      // Assert no BORRADOR_INTERNO or EN_REVISION ever leaked into any project
      for (const p of projects) {
        for (const d of p.deliverables) {
          expect(d.status).not.toBe('BORRADOR_INTERNO');
          expect(d.status).not.toBe('EN_REVISION');
        }
      }
    });
  });
});
