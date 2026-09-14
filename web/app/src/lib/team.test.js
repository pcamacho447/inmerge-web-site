import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  fetchTeamLeads,
  updateLeadStatus,
  fetchTeamProjects,
  createTeamProject,
  addProjectMilestone,
  updateMilestoneStatus,
  uploadDeliverableFile,
  createDeliverableRecord,
} from './team.js';
import { supabase } from './supabaseClient.js';

vi.mock('./supabaseClient.js', () => ({
  supabase: {
    from: vi.fn(),
    storage: {
      from: vi.fn(),
    },
  },
}));

describe('team.js — Servicios para el Equipo de Consultores', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetchTeamLeads consulta y retorna las solicitudes TDR', async () => {
    const mockData = [{ id: 'lead-1', pillar: 'auditoria', status: 'NUEVO' }];
    const orderMock = vi.fn().mockResolvedValue({ data: mockData, error: null });
    const selectMock = vi.fn().mockReturnValue({ order: orderMock });
    supabase.from.mockReturnValue({ select: selectMock });

    const leads = await fetchTeamLeads();
    expect(supabase.from).toHaveBeenCalledWith('leads_tdr');
    expect(leads).toEqual(mockData);
  });

  it('updateLeadStatus actualiza estado y notas de un lead', async () => {
    const mockUpdated = { id: 'lead-1', status: 'EN_REVISION', notes: 'Asignado a auditor senior' };
    const singleMock = vi.fn().mockResolvedValue({ data: mockUpdated, error: null });
    const selectMock = vi.fn().mockReturnValue({ single: singleMock });
    const eqMock = vi.fn().mockReturnValue({ select: selectMock });
    const updateMock = vi.fn().mockReturnValue({ eq: eqMock });
    supabase.from.mockReturnValue({ update: updateMock });

    const result = await updateLeadStatus('lead-1', { status: 'EN_REVISION', notes: 'Asignado a auditor senior' });
    expect(supabase.from).toHaveBeenCalledWith('leads_tdr');
    expect(updateMock).toHaveBeenCalledWith({ status: 'EN_REVISION', notes: 'Asignado a auditor senior' });
    expect(result).toEqual(mockUpdated);
  });

  it('createTeamProject valida campos requeridos y crea un proyecto', async () => {
    await expect(createTeamProject({})).rejects.toThrow('El ID de cliente, título y pilar estratégico son obligatorios.');

    const mockProject = { id: 'proj-1', title: 'Auditoría PostgreSQL', pillar: 'auditoria' };
    const singleMock = vi.fn().mockResolvedValue({ data: mockProject, error: null });
    const selectMock = vi.fn().mockReturnValue({ single: singleMock });
    const insertMock = vi.fn().mockReturnValue({ select: selectMock });
    supabase.from.mockReturnValue({ insert: insertMock });

    const res = await createTeamProject({
      clientId: 'usr-123',
      title: 'Auditoría PostgreSQL',
      pillar: 'auditoria',
      description: 'Revisión de integridad',
    });

    expect(insertMock).toHaveBeenCalled();
    expect(res).toEqual(mockProject);
  });

  it('uploadDeliverableFile sube el archivo al storage de supabase', async () => {
    const mockFile = new Blob(['sample report content'], { type: 'application/pdf' });
    const uploadMock = vi.fn().mockResolvedValue({ data: { path: 'reports/proj1.pdf' }, error: null });
    supabase.storage.from.mockReturnValue({ upload: uploadMock });

    const path = await uploadDeliverableFile(mockFile, 'reports/proj1.pdf');
    expect(supabase.storage.from).toHaveBeenCalledWith('project-deliverables');
    expect(uploadMock).toHaveBeenCalledWith('reports/proj1.pdf', mockFile, expect.any(Object));
    expect(path).toBe('reports/proj1.pdf');
  });

  it('createDeliverableRecord registra un entregable en la base de datos', async () => {
    const mockDeliv = { id: 'deliv-1', title: 'Informe Final', file_type: 'PDF' };
    const singleMock = vi.fn().mockResolvedValue({ data: mockDeliv, error: null });
    const selectMock = vi.fn().mockReturnValue({ single: singleMock });
    const insertMock = vi.fn().mockReturnValue({ select: selectMock });
    supabase.from.mockReturnValue({ insert: insertMock });

    const res = await createDeliverableRecord({
      projectId: 'proj-1',
      title: 'Informe Final',
      fileType: 'PDF',
      filePath: 'reports/proj1.pdf',
    });

    expect(supabase.from).toHaveBeenCalledWith('project_deliverables');
    expect(res).toEqual(mockDeliv);
  });
});
