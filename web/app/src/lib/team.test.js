import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  fetchRegisteredClients,
  fetchTeamLeads,
  updateLeadStatus,
  fetchTeamProjects,
  createTeamProject,
  addProjectMilestone,
  updateMilestoneStatus,
  uploadDeliverableFile,
  createDeliverableRecord,
  fetchStaffMembers,
  createStaffMember,
  fetchTeamActivityLogs,
} from './team.js';
import { supabase } from './supabaseClient.js';

vi.mock('./supabaseClient.js', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'staff-user-1' } }, error: null }),
    },
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: { success: true }, error: null }),
    },
    storage: {
      from: vi.fn(),
    },
  },
}));

describe('team.js — Servicios para el Equipo de Consultores', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetchRegisteredClients consulta la lista de clientes registrados', async () => {
    const mockClients = [{ id: 'usr-1', email: 'cliente@empresa.com', role: 'client' }];
    const orderMock = vi.fn().mockResolvedValue({ data: mockClients, error: null });
    const selectMock = vi.fn().mockReturnValue({ order: orderMock });
    supabase.from.mockReturnValue({ select: selectMock });

    const clients = await fetchRegisteredClients();
    expect(supabase.from).toHaveBeenCalledWith('profiles');
    expect(clients).toEqual(mockClients);
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

  it('updateLeadStatus actualiza estado y notas de un lead y registra auditoría', async () => {
    const mockUpdated = { id: 'lead-1', status: 'EN_REVISION', notes: 'Asignado a auditor senior' };
    const singleMock = vi.fn().mockResolvedValue({ data: mockUpdated, error: null });
    const selectMock = vi.fn().mockReturnValue({ single: singleMock });
    const eqMock = vi.fn().mockReturnValue({ select: selectMock });
    const updateMock = vi.fn().mockReturnValue({ eq: eqMock });
    const insertMock = vi.fn().mockResolvedValue({ data: null, error: null });

    supabase.from.mockImplementation((table) => {
      if (table === 'leads_tdr') return { update: updateMock };
      if (table === 'team_activity_logs') return { insert: insertMock };
      return {};
    });

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
    const logInsertMock = vi.fn().mockResolvedValue({ data: null, error: null });

    supabase.from.mockImplementation((table) => {
      if (table === 'client_projects') return { insert: insertMock };
      if (table === 'team_activity_logs') return { insert: logInsertMock };
      return {};
    });

    const res = await createTeamProject({
      clientId: 'usr-123',
      title: 'Auditoría PostgreSQL',
      pillar: 'auditoria',
      description: 'Revisión de integridad',
    });

    expect(insertMock).toHaveBeenCalled();
    expect(res).toEqual(mockProject);
  });

  it('fetchTeamProjects consulta los proyectos con sus clientes, hitos y entregables', async () => {
    const mockProjects = [{ id: 'proj-1', title: 'Auditoría PostgreSQL', client: { full_name: 'Cliente Juan' } }];
    const orderMock = vi.fn().mockResolvedValue({ data: mockProjects, error: null });
    const selectMock = vi.fn().mockReturnValue({ order: orderMock });
    supabase.from.mockReturnValue({ select: selectMock });

    const res = await fetchTeamProjects();
    expect(supabase.from).toHaveBeenCalledWith('client_projects');
    expect(res).toEqual(mockProjects);
  });

  it('addProjectMilestone agrega un nuevo hito al proyecto', async () => {
    await expect(addProjectMilestone({})).rejects.toThrow('El ID de proyecto y título del hito son obligatorios.');

    const mockMilestone = { id: 'm-1', title: 'Fase 1: Diagnóstico', project_id: 'proj-1' };
    const singleMock = vi.fn().mockResolvedValue({ data: mockMilestone, error: null });
    const selectMock = vi.fn().mockReturnValue({ single: singleMock });
    const insertMock = vi.fn().mockReturnValue({ select: selectMock });
    const logInsertMock = vi.fn().mockResolvedValue({ data: null, error: null });

    supabase.from.mockImplementation((table) => {
      if (table === 'project_milestones') return { insert: insertMock };
      if (table === 'team_activity_logs') return { insert: logInsertMock };
      return {};
    });

    const res = await addProjectMilestone({ projectId: 'proj-1', title: 'Fase 1: Diagnóstico' });
    expect(supabase.from).toHaveBeenCalledWith('project_milestones');
    expect(res).toEqual(mockMilestone);
  });

  it('updateMilestoneStatus actualiza el estado del hito', async () => {
    const mockUpdated = { id: 'm-1', title: 'Fase 1: Diagnóstico', project_id: 'proj-1', status: 'COMPLETADO' };
    const singleMock = vi.fn().mockResolvedValue({ data: mockUpdated, error: null });
    const selectMock = vi.fn().mockReturnValue({ single: singleMock });
    const eqMock = vi.fn().mockReturnValue({ select: selectMock });
    const updateMock = vi.fn().mockReturnValue({ eq: eqMock });
    const logInsertMock = vi.fn().mockResolvedValue({ data: null, error: null });

    supabase.from.mockImplementation((table) => {
      if (table === 'project_milestones') return { update: updateMock };
      if (table === 'team_activity_logs') return { insert: logInsertMock };
      return {};
    });

    const res = await updateMilestoneStatus('m-1', 'COMPLETADO');
    expect(supabase.from).toHaveBeenCalledWith('project_milestones');
    expect(res).toEqual(mockUpdated);
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

  it('createDeliverableRecord registra un entregable, loggea auditoría y dispara notify-deliverable', async () => {
    const mockDeliv = { id: 'deliv-1', title: 'Informe Final', file_type: 'PDF' };
    const singleMock = vi.fn().mockResolvedValue({ data: mockDeliv, error: null });
    const selectMock = vi.fn().mockReturnValue({ single: singleMock });
    const insertMock = vi.fn().mockReturnValue({ select: selectMock });
    const logInsertMock = vi.fn().mockResolvedValue({ data: null, error: null });

    supabase.from.mockImplementation((table) => {
      if (table === 'project_deliverables') return { insert: insertMock };
      if (table === 'team_activity_logs') return { insert: logInsertMock };
      return {};
    });

    const res = await createDeliverableRecord({
      projectId: 'proj-1',
      title: 'Informe Final',
      fileType: 'PDF',
      filePath: 'reports/proj1.pdf',
      clientEmail: 'cliente@empresa.com',
      clientName: 'Cliente Juan',
    });

    expect(supabase.from).toHaveBeenCalledWith('project_deliverables');
    expect(res).toEqual(mockDeliv);
    expect(supabase.functions.invoke).toHaveBeenCalledWith('notify-deliverable', expect.any(Object));
  });

  it('fetchStaffMembers consulta los miembros del equipo interno', async () => {
    const mockStaff = [
      { id: 'usr-1', email: 'auditor@inmerge.pe', role: 'auditor' },
      { id: 'usr-2', email: 'dev@inmerge.pe', role: 'engineer' },
    ];
    const orderMock = vi.fn().mockResolvedValue({ data: mockStaff, error: null });
    const inMock = vi.fn().mockReturnValue({ order: orderMock });
    const selectMock = vi.fn().mockReturnValue({ in: inMock });
    supabase.from.mockReturnValue({ select: selectMock });

    const staff = await fetchStaffMembers();
    expect(supabase.from).toHaveBeenCalledWith('profiles');
    expect(inMock).toHaveBeenCalledWith('role', ['admin', 'auditor', 'engineer']);
    expect(staff).toEqual(mockStaff);
  });

  it('createStaffMember invoca el RPC create_staff_member', async () => {
    await expect(createStaffMember({})).rejects.toThrow('Correo, contraseña y nombre completo son obligatorios.');

    supabase.rpc.mockResolvedValue({ data: 'staff-uuid-123', error: null });
    const logInsertMock = vi.fn().mockResolvedValue({ data: null, error: null });
    supabase.from.mockImplementation(() => ({ insert: logInsertMock }));

    const res = await createStaffMember({
      email: 'nuevo@inmerge.pe',
      password: 'SecurePassword123!',
      fullName: 'Carlos Ingeniero',
      role: 'engineer',
    });

    expect(supabase.rpc).toHaveBeenCalledWith('create_staff_member', {
      p_email: 'nuevo@inmerge.pe',
      p_password: 'SecurePassword123!',
      p_full_name: 'Carlos Ingeniero',
      p_role: 'engineer',
      new_email: 'nuevo@inmerge.pe',
      new_password: 'SecurePassword123!',
      new_full_name: 'Carlos Ingeniero',
      new_role: 'engineer',
    });
    expect(res).toBe('staff-uuid-123');
  });

  it('fetchTeamActivityLogs consulta los registros recientes de auditoría', async () => {
    const mockLogs = [{ id: 'log-1', action: 'PROJECT_CREATED', entity_type: 'project', created_at: '2026-09-14T10:00:00Z' }];
    const limitMock = vi.fn().mockResolvedValue({ data: mockLogs, error: null });
    const orderMock = vi.fn().mockReturnValue({ limit: limitMock });
    const selectMock = vi.fn().mockReturnValue({ order: orderMock });
    supabase.from.mockReturnValue({ select: selectMock });

    const logs = await fetchTeamActivityLogs({ limit: 20 });
    expect(supabase.from).toHaveBeenCalledWith('team_activity_logs');
    expect(logs).toEqual(mockLogs);
  });
});
