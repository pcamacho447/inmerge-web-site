import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  fetchRegisteredClients,
  fetchTeamLeads,
  updateLeadStatus,
  fetchTeamProjects,
  createTeamProject,
  updateProjectStatus,
  addProjectMilestone,
  updateMilestoneStatus,
  uploadDeliverableFile,
  createDeliverableRecord,
  fetchStaffMembers,
  createStaffMember,
  fetchTeamActivityLogs,
  fetchProjectTasks,
  createProjectTask,
  updateProjectHealth,
  updateDeliverableStatus,
  fetchProjectFindings,
  createProjectFinding,
  updateProjectFinding,
  deleteProjectFinding,
  clearTeamDataCache,
  fetchWorkspaceTelemetrySnapshot,
} from './team.js';
import { supabase } from './supabaseClient.js';
import { createInAppNotification } from './notifications.js';

vi.mock('./notifications.js', () => ({
  createInAppNotification: vi.fn().mockResolvedValue({ id: 'mock-notif-1' }),
}));

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
    clearTeamDataCache();
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
    const mockProjects = [
      {
        id: 'proj-1',
        title: 'Auditoría PostgreSQL',
        client: { full_name: 'Cliente Juan' },
        milestones: [],
        deliverables: [],
        tasks: [],
        risks: [],
      },
    ];
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

    const res = await addProjectMilestone({
      projectId: 'proj-1',
      title: 'Fase 02: Arquitectura',
      orderIndex: 2,
      assignedToName: 'Carlos Dev',
      assignedToEmail: 'carlos@inmerge.com',
      assignedToId: 'user-carlos-1',
    });
    expect(supabase.from).toHaveBeenCalledWith('project_milestones');
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        project_id: 'proj-1',
        title: 'Fase 02: Arquitectura',
        order_index: 2,
        status: 'PENDIENTE',
        assigned_to_name: 'Carlos Dev',
        assigned_to_email: 'carlos@inmerge.com',
        assigned_to_id: 'user-carlos-1',
      }),
    );
    expect(res).toEqual(mockMilestone);
  });

  it('updateMilestoneStatus actualiza el estado y encargado del hito', async () => {
    const mockUpdated = {
      id: 'm-1',
      title: 'Fase 1: Diagnóstico',
      project_id: 'proj-1',
      status: 'COMPLETADO',
      assigned_to_name: 'Ana Lead',
    };
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

    const res = await updateMilestoneStatus('m-1', { status: 'COMPLETADO', assignedToName: 'Ana Lead' });
    expect(supabase.from).toHaveBeenCalledWith('project_milestones');
    expect(updateMock).toHaveBeenCalledWith({ status: 'COMPLETADO', assigned_to_name: 'Ana Lead' });
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

  it('updateProjectStatus actualiza estado, invoca notify-project-status y audita la acción', async () => {
    await expect(updateProjectStatus('', 'EN_AUDITORIA')).rejects.toThrow('ID de proyecto y el nuevo estado son obligatorios');
    await expect(updateProjectStatus('p-1', 'ESTADO_INVALIDO')).rejects.toThrow('Estado inválido: ESTADO_INVALIDO');

    const mockUpdatedProject = {
      id: 'proj-123',
      title: 'Auditoría Forense AWS',
      pillar: 'auditoria',
      status: 'EN_DESARROLLO',
      client_id: 'cli-1',
      profiles: { email: 'cliente@empresa.com', full_name: 'Antamina Admin' },
    };

    const singleMock = vi.fn().mockResolvedValue({ data: mockUpdatedProject, error: null });
    const selectMock = vi.fn().mockReturnValue({ single: singleMock });
    const eqMock = vi.fn().mockReturnValue({ select: selectMock });
    const updateMock = vi.fn().mockReturnValue({ eq: eqMock });
    const logInsertMock = vi.fn().mockResolvedValue({ data: null, error: null });

    supabase.from.mockImplementation((table) => {
      if (table === 'client_projects') return { update: updateMock };
      if (table === 'team_activity_logs') return { insert: logInsertMock };
      return {};
    });

    const res = await updateProjectStatus('proj-123', 'EN_DESARROLLO', { notes: 'Comenzando pipelines ETL' });

    expect(supabase.from).toHaveBeenCalledWith('client_projects');
    expect(updateMock).toHaveBeenCalledWith({ status: 'EN_DESARROLLO' });
    expect(eqMock).toHaveBeenCalledWith('id', 'proj-123');
    expect(supabase.functions.invoke).toHaveBeenCalledWith('notify-project-status', {
      body: {
        project: mockUpdatedProject,
        newStatus: 'EN_DESARROLLO',
        clientEmail: 'cliente@empresa.com',
        clientName: 'Antamina Admin',
        notes: 'Comenzando pipelines ETL',
      },
    });
    expect(res).toEqual(mockUpdatedProject);
  });

  describe('PM Methods (Tasks, Risks, Health)', () => {
    it('fetchProjectTasks consulta las tareas del proyecto', async () => {
      const mockTasks = [{ id: 't-1', title: 'Task 1', project_id: 'p-1' }];
      const orderMock = vi.fn().mockResolvedValue({ data: mockTasks, error: null });
      const eqMock = vi.fn().mockReturnValue({ order: orderMock });
      const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
      supabase.from.mockReturnValue({ select: selectMock });

      const res = await fetchProjectTasks('p-1');
      expect(supabase.from).toHaveBeenCalledWith('project_tasks');
      expect(eqMock).toHaveBeenCalledWith('project_id', 'p-1');
      expect(res).toEqual(mockTasks);
    });

    it('createProjectTask inserta una tarea técnica y registra auditoría', async () => {
      const mockTask = { id: 't-1', title: 'Crear VPC', project_id: 'p-1', status: 'TODO' };
      const singleMock = vi.fn().mockResolvedValue({ data: mockTask, error: null });
      const selectMock = vi.fn().mockReturnValue({ single: singleMock });
      const insertMock = vi.fn().mockReturnValue({ select: selectMock });
      const logInsertMock = vi.fn().mockResolvedValue({ data: null, error: null });

      supabase.from.mockImplementation((table) => {
        if (table === 'project_tasks') return { insert: insertMock };
        if (table === 'team_activity_logs') return { insert: logInsertMock };
        return {};
      });

      const res = await createProjectTask(mockTask);
      expect(supabase.from).toHaveBeenCalledWith('project_tasks');
      expect(insertMock).toHaveBeenCalledWith(mockTask);
      expect(res).toEqual(mockTask);
    });

    it('updateProjectHealth actualiza la salud del proyecto', async () => {
      const mockUpdated = { id: 'p-1', health_status: 'ON_TRACK' };
      const singleMock = vi.fn().mockResolvedValue({ data: mockUpdated, error: null });
      const selectMock = vi.fn().mockReturnValue({ single: singleMock });
      const eqMock = vi.fn().mockReturnValue({ select: selectMock });
      const updateMock = vi.fn().mockReturnValue({ eq: eqMock });
      const logInsertMock = vi.fn().mockResolvedValue({ data: null, error: null });

      supabase.from.mockImplementation((table) => {
        if (table === 'client_projects') return { update: updateMock };
        if (table === 'team_activity_logs') return { insert: logInsertMock };
        return {};
      });

      const res = await updateProjectHealth('p-1', { healthStatus: 'ON_TRACK' });
      expect(supabase.from).toHaveBeenCalledWith('client_projects');
      expect(updateMock).toHaveBeenCalledWith({ health_status: 'ON_TRACK' });
      expect(res).toEqual(mockUpdated);
    });
  });

  describe('Deliverable Status & Project Findings', () => {
    it('updateDeliverableStatus actualiza el estado del entregable y audita la actividad', async () => {
      await expect(updateDeliverableStatus('', 'PUBLICADO_CLIENTE')).rejects.toThrow('ID y nuevo estado son obligatorios.');
      await expect(updateDeliverableStatus('del-1', 'INVALID_STATUS')).rejects.toThrow('Estado de entregable inválido.');

      const mockUpdated = { id: 'del-1', status: 'PUBLICADO_CLIENTE', title: 'Informe Final' };
      const singleMock = vi.fn().mockResolvedValue({ data: mockUpdated, error: null });
      const selectMock = vi.fn().mockReturnValue({ single: singleMock });
      const eqMock = vi.fn().mockReturnValue({ select: selectMock });
      const updateMock = vi.fn().mockReturnValue({ eq: eqMock });
      const logInsertMock = vi.fn().mockResolvedValue({ data: null, error: null });

      supabase.from.mockImplementation((table) => {
        if (table === 'project_deliverables') return { update: updateMock };
        if (table === 'team_activity_logs') return { insert: logInsertMock };
        return {};
      });

      const res = await updateDeliverableStatus('del-1', 'PUBLICADO_CLIENTE', { projectId: 'p-1', title: 'Informe Final' });
      expect(supabase.from).toHaveBeenCalledWith('project_deliverables');
      expect(updateMock).toHaveBeenCalledWith(expect.objectContaining({ status: 'PUBLICADO_CLIENTE' }));
      expect(eqMock).toHaveBeenCalledWith('id', 'del-1');
      expect(res).toEqual(mockUpdated);
      expect(createInAppNotification).not.toHaveBeenCalled();
    });

    it('updateDeliverableStatus dispara createInAppNotification cuando el estado cambia a EN_REVISION', async () => {
      const mockUpdated = { id: 'del-2', status: 'EN_REVISION', title: 'Auditoría PostgreSQL', project_id: 'p-1' };
      const singleMock = vi.fn().mockResolvedValue({ data: mockUpdated, error: null });
      const selectMock = vi.fn().mockReturnValue({ single: singleMock });
      const eqMock = vi.fn().mockReturnValue({ select: selectMock });
      const updateMock = vi.fn().mockReturnValue({ eq: eqMock });
      const logInsertMock = vi.fn().mockResolvedValue({ data: null, error: null });

      supabase.from.mockImplementation((table) => {
        if (table === 'project_deliverables') return { update: updateMock };
        if (table === 'team_activity_logs') return { insert: logInsertMock };
        return {};
      });

      const res = await updateDeliverableStatus('del-2', 'EN_REVISION', { projectId: 'p-1', title: 'Auditoría PostgreSQL' });
      expect(res).toEqual(mockUpdated);
      expect(createInAppNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          targetRole: 'admin',
          category: 'DELIVERABLE',
          projectId: 'p-1',
          title: 'Entregable en Revisión',
        }),
      );
    });

    it('fetchProjectFindings consulta los hallazgos del proyecto ordenados por fecha', async () => {
      expect(await fetchProjectFindings(null)).toEqual([]);

      const mockFindings = [{ id: 'f-1', project_id: 'p-1', title: 'Finding 1' }];
      const orderMock = vi.fn().mockResolvedValue({ data: mockFindings, error: null });
      const eqMock = vi.fn().mockReturnValue({ order: orderMock });
      const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
      supabase.from.mockReturnValue({ select: selectMock });

      const res = await fetchProjectFindings('p-1');
      expect(supabase.from).toHaveBeenCalledWith('project_findings');
      expect(eqMock).toHaveBeenCalledWith('project_id', 'p-1');
      expect(orderMock).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(res).toEqual(mockFindings);
    });

    it('createProjectFinding sanitiza e inserta un hallazgo técnico y dispara notificación si es severidad crítica/alta', async () => {
      const mockFinding = { id: 'f-1', title: 'XSS en search', severity: 'ALTA', category: 'SEGURIDAD_OWASP' };
      const singleMock = vi.fn().mockResolvedValue({ data: mockFinding, error: null });
      const selectMock = vi.fn().mockReturnValue({ single: singleMock });
      const insertMock = vi.fn().mockReturnValue({ select: selectMock });
      const logInsertMock = vi.fn().mockResolvedValue({ data: null, error: null });

      supabase.from.mockImplementation((table) => {
        if (table === 'project_findings') return { insert: insertMock };
        if (table === 'team_activity_logs') return { insert: logInsertMock };
        return {};
      });

      const res = await createProjectFinding({
        projectId: 'p-1',
        title: 'XSS en search',
        severity: 'ALTA',
        category: 'SEGURIDAD_OWASP',
      });

      expect(supabase.from).toHaveBeenCalledWith('project_findings');
      expect(insertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'XSS en search',
          severity: 'ALTA',
          category: 'SEGURIDAD_OWASP',
          status: 'DETECTADO',
        }),
      );
      expect(res).toEqual(mockFinding);
      expect(createInAppNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          targetRole: 'admin',
          category: 'FINDING',
          severity: 'HIGH',
          projectId: 'p-1',
        }),
      );
    });

    it('createProjectFinding no dispara createInAppNotification si la severidad es baja', async () => {
      const mockFinding = { id: 'f-low', title: 'Typo menor en logs', severity: 'BAJA', category: 'CALIDAD_CODIGO' };
      const singleMock = vi.fn().mockResolvedValue({ data: mockFinding, error: null });
      const selectMock = vi.fn().mockReturnValue({ single: singleMock });
      const insertMock = vi.fn().mockReturnValue({ select: selectMock });
      const logInsertMock = vi.fn().mockResolvedValue({ data: null, error: null });

      supabase.from.mockImplementation((table) => {
        if (table === 'project_findings') return { insert: insertMock };
        if (table === 'team_activity_logs') return { insert: logInsertMock };
        return {};
      });

      createInAppNotification.mockClear();
      await createProjectFinding({
        projectId: 'p-1',
        title: 'Typo menor en logs',
        severity: 'BAJA',
        category: 'CALIDAD_CODIGO',
      });

      expect(createInAppNotification).not.toHaveBeenCalled();
    });

    it('updateProjectFinding actualiza los campos de un hallazgo técnico', async () => {
      await expect(updateProjectFinding(null, {})).rejects.toThrow('ID de hallazgo obligatorio.');

      const mockUpdated = { id: 'f-1', title: 'XSS corregido', status: 'VERIFICADO' };
      const singleMock = vi.fn().mockResolvedValue({ data: mockUpdated, error: null });
      const selectMock = vi.fn().mockReturnValue({ single: singleMock });
      const eqMock = vi.fn().mockReturnValue({ select: selectMock });
      const updateMock = vi.fn().mockReturnValue({ eq: eqMock });
      const logInsertMock = vi.fn().mockResolvedValue({ data: null, error: null });

      supabase.from.mockImplementation((table) => {
        if (table === 'project_findings') return { update: updateMock };
        if (table === 'team_activity_logs') return { insert: logInsertMock };
        return {};
      });

      const res = await updateProjectFinding('f-1', { status: 'VERIFICADO' });
      expect(supabase.from).toHaveBeenCalledWith('project_findings');
      expect(updateMock).toHaveBeenCalledWith(expect.objectContaining({ status: 'VERIFICADO' }));
      expect(eqMock).toHaveBeenCalledWith('id', 'f-1');
      expect(res).toEqual(mockUpdated);
    });

    it('deleteProjectFinding elimina el hallazgo', async () => {
      await expect(deleteProjectFinding(null)).rejects.toThrow('ID de hallazgo obligatorio.');

      const eqMock = vi.fn().mockResolvedValue({ error: null });
      const deleteMock = vi.fn().mockReturnValue({ eq: eqMock });
      supabase.from.mockImplementation((table) => {
        if (table === 'project_findings') return { delete: deleteMock };
        return {};
      });

      const res = await deleteProjectFinding('f-1');
      expect(supabase.from).toHaveBeenCalledWith('project_findings');
      expect(deleteMock).toHaveBeenCalled();
      expect(eqMock).toHaveBeenCalledWith('id', 'f-1');
      expect(res).toBe(true);
    });
  });

  describe('Workspace Telemetry RPC & In-Memory TTL Caching', () => {
    it('fetchWorkspaceTelemetrySnapshot invoca el RPC get_workspace_telemetry_snapshot', async () => {
      const mockSnapshot = {
        kpis: {
          active_projects_count: 3,
          active_leads_count: 2,
          pending_deliverables_count: 4,
          open_critical_findings_count: 1,
          user_assigned_tasks_count: 5,
        },
        generated_at: '2026-09-23T22:00:00Z',
      };
      supabase.rpc.mockResolvedValueOnce({ data: mockSnapshot, error: null });

      const res = await fetchWorkspaceTelemetrySnapshot({
        userEmail: 'dev@inmerge.pe',
        isAdmin: true,
      });

      expect(supabase.rpc).toHaveBeenCalledWith('get_workspace_telemetry_snapshot', {
        p_user_email: 'dev@inmerge.pe',
        p_is_admin: true,
      });
      expect(res).toEqual(mockSnapshot);
    });

    it('fetchWorkspaceTelemetrySnapshot recurre al cálculo local si el RPC falla', async () => {
      supabase.rpc.mockResolvedValueOnce({ data: null, error: { message: 'function not found' } });

      const mockProjects = [
        {
          id: 'p-1',
          status: 'EN_DESARROLLO',
          deliverables: [
            { id: 'd-1', status: 'BORRADOR_INTERNO' },
            { id: 'd-2', status: 'PUBLICADO_CLIENTE' },
          ],
          tasks: [
            { id: 't-1', assigned_to_email: 'dev@inmerge.pe', status: 'IN_PROGRESS' },
            { id: 't-2', assigned_to_email: 'dev@inmerge.pe', status: 'DONE' },
            { id: 't-3', assigned_to_email: 'other@inmerge.pe', status: 'TODO' },
          ],
          findings: [
            { id: 'f-1', severity: 'CRITICA', status: 'DETECTADO' },
            { id: 'f-2', severity: 'BAJA', status: 'DETECTADO' },
          ],
        },
        {
          id: 'p-2',
          status: 'FINALIZADO',
          deliverables: [],
          tasks: [],
          findings: [],
        },
      ];

      const mockLeads = [
        { id: 'l-1', status: 'NUEVO' },
        { id: 'l-2', status: 'EN_REVISION' },
        { id: 'l-3', status: 'CONVERTIDO' },
      ];

      const res = await fetchWorkspaceTelemetrySnapshot({
        userEmail: 'dev@inmerge.pe',
        isAdmin: false,
        localProjects: mockProjects,
        localLeads: mockLeads,
      });

      expect(res.kpis.active_projects_count).toBe(1);
      expect(res.kpis.active_leads_count).toBe(2);
      expect(res.kpis.pending_deliverables_count).toBe(1);
      expect(res.kpis.open_critical_findings_count).toBe(1);
      expect(res.kpis.user_assigned_tasks_count).toBe(1);
      expect(res.generated_at).toBeDefined();
    });

    it('fetchWorkspaceTelemetrySnapshot reutiliza el snapshot en memoria dentro del TTL de 15s y permite forceRefresh', async () => {
      const mockSnapshot1 = {
        kpis: {
          active_projects_count: 3,
          active_leads_count: 2,
          pending_deliverables_count: 4,
          open_critical_findings_count: 1,
          user_assigned_tasks_count: 5,
        },
        generated_at: '2026-09-24T10:00:00Z',
      };
      const mockSnapshot2 = {
        kpis: {
          active_projects_count: 4,
          active_leads_count: 2,
          pending_deliverables_count: 4,
          open_critical_findings_count: 1,
          user_assigned_tasks_count: 6,
        },
        generated_at: '2026-09-24T10:01:00Z',
      };

      supabase.rpc.mockResolvedValueOnce({ data: mockSnapshot1, error: null }).mockResolvedValueOnce({ data: mockSnapshot2, error: null });

      // 1. Primera llamada consulta Supabase RPC
      const firstCall = await fetchWorkspaceTelemetrySnapshot({
        userEmail: 'dev@inmerge.pe',
        isAdmin: true,
      });

      // 2. Segunda llamada dentro del TTL debe retornar exactamente la misma referencia sin invocar RPC de nuevo
      const secondCall = await fetchWorkspaceTelemetrySnapshot({
        userEmail: 'dev@inmerge.pe',
        isAdmin: true,
      });

      expect(firstCall).toBe(mockSnapshot1);
      expect(secondCall).toBe(firstCall);
      expect(supabase.rpc).toHaveBeenCalledTimes(1);

      // 3. Llamada con forceRefresh: true debe saltarse el caché e invocar RPC de nuevo
      const forcedCall = await fetchWorkspaceTelemetrySnapshot({
        userEmail: 'dev@inmerge.pe',
        isAdmin: true,
        forceRefresh: true,
      });

      expect(forcedCall).toBe(mockSnapshot2);
      expect(supabase.rpc).toHaveBeenCalledTimes(2);
    });

    it('clearTeamDataCache invalida el caché de telemetría de workspace', async () => {
      const mockSnapshot1 = { kpis: { active_projects_count: 1 }, generated_at: '2026-09-24T10:00:00Z' };
      const mockSnapshot2 = { kpis: { active_projects_count: 2 }, generated_at: '2026-09-24T10:00:15Z' };

      supabase.rpc.mockResolvedValueOnce({ data: mockSnapshot1, error: null }).mockResolvedValueOnce({ data: mockSnapshot2, error: null });

      const firstCall = await fetchWorkspaceTelemetrySnapshot({ userEmail: 'dev@inmerge.pe', isAdmin: true });
      expect(firstCall).toBe(mockSnapshot1);
      expect(supabase.rpc).toHaveBeenCalledTimes(1);

      clearTeamDataCache();

      const secondCall = await fetchWorkspaceTelemetrySnapshot({ userEmail: 'dev@inmerge.pe', isAdmin: true });
      expect(secondCall).toBe(mockSnapshot2);
      expect(supabase.rpc).toHaveBeenCalledTimes(2);
    });

    it('fetchWorkspaceTelemetrySnapshot expira el caché tras cumplirse el TTL de 15 segundos', async () => {
      const mockSnapshot1 = { kpis: { active_projects_count: 1 }, generated_at: '2026-09-24T10:00:00Z' };
      const mockSnapshot2 = { kpis: { active_projects_count: 2 }, generated_at: '2026-09-24T10:00:20Z' };

      supabase.rpc.mockResolvedValueOnce({ data: mockSnapshot1, error: null }).mockResolvedValueOnce({ data: mockSnapshot2, error: null });

      const nowSpy = vi.spyOn(Date, 'now');
      nowSpy.mockReturnValue(1000000);

      const firstCall = await fetchWorkspaceTelemetrySnapshot({ userEmail: 'dev@inmerge.pe', isAdmin: true });
      expect(firstCall).toBe(mockSnapshot1);
      expect(supabase.rpc).toHaveBeenCalledTimes(1);

      // Simular avance de 15001ms (> 15s TTL)
      nowSpy.mockReturnValue(1000000 + 15001);

      const secondCall = await fetchWorkspaceTelemetrySnapshot({ userEmail: 'dev@inmerge.pe', isAdmin: true });
      expect(secondCall).toBe(mockSnapshot2);
      expect(supabase.rpc).toHaveBeenCalledTimes(2);

      nowSpy.mockRestore();
    });

    it('fetchTeamProjects reutiliza el resultado en memoria dentro del TTL de 30s', async () => {
      const mockProjects = [{ id: 'proj-1', title: 'Proyecto Alpha' }];
      const orderMock = vi.fn().mockResolvedValue({ data: mockProjects, error: null });
      const selectMock = vi.fn().mockReturnValue({ order: orderMock });
      supabase.from.mockReturnValue({ select: selectMock });

      const firstCall = await fetchTeamProjects();
      const secondCall = await fetchTeamProjects();

      expect(firstCall[0].title).toBe('Proyecto Alpha');
      expect(secondCall).toBe(firstCall);
      expect(supabase.from).toHaveBeenCalledTimes(1);
    });

    it('fetchTeamProjects con forceRefresh: true fuerza una nueva consulta a la base de datos', async () => {
      const mockProjects1 = [{ id: 'proj-1', title: 'Proyecto Alpha' }];
      const mockProjects2 = [{ id: 'proj-1', title: 'Proyecto Alpha Actualizado' }];

      const orderMock = vi
        .fn()
        .mockResolvedValueOnce({ data: mockProjects1, error: null })
        .mockResolvedValueOnce({ data: mockProjects2, error: null });
      const selectMock = vi.fn().mockReturnValue({ order: orderMock });
      supabase.from.mockReturnValue({ select: selectMock });

      const firstCall = await fetchTeamProjects();
      const forcedCall = await fetchTeamProjects({ forceRefresh: true });

      expect(firstCall[0].title).toBe('Proyecto Alpha');
      expect(forcedCall[0].title).toBe('Proyecto Alpha Actualizado');
      expect(supabase.from).toHaveBeenCalledTimes(2);
    });

    it('clearTeamDataCache invalida el caché y fuerza una nueva llamada a Supabase', async () => {
      const mockProjects = [{ id: 'proj-1', title: 'Proyecto Alpha' }];
      const orderMock = vi.fn().mockResolvedValue({ data: mockProjects, error: null });
      const selectMock = vi.fn().mockReturnValue({ order: orderMock });
      supabase.from.mockReturnValue({ select: selectMock });

      await fetchTeamProjects();
      expect(supabase.from).toHaveBeenCalledTimes(1);

      clearTeamDataCache();

      await fetchTeamProjects();
      expect(supabase.from).toHaveBeenCalledTimes(2);
    });

    it('clearTeamDataCache({ entity: "telemetry" }) invalida solo el caché de telemetría manteniendo intacto el de proyectos', async () => {
      const mockProjects = [{ id: 'proj-1', title: 'Proyecto Alpha' }];
      const orderMock = vi.fn().mockResolvedValue({ data: mockProjects, error: null });
      const selectMock = vi.fn().mockReturnValue({ order: orderMock });
      supabase.from.mockReturnValue({ select: selectMock });

      const mockSnapshot1 = { kpis: { active_projects_count: 1 }, generated_at: '2026-09-24T10:00:00Z' };
      const mockSnapshot2 = { kpis: { active_projects_count: 2 }, generated_at: '2026-09-24T10:00:15Z' };
      supabase.rpc.mockResolvedValueOnce({ data: mockSnapshot1, error: null }).mockResolvedValueOnce({ data: mockSnapshot2, error: null });

      // Llenar ambos cachés
      await fetchTeamProjects();
      await fetchWorkspaceTelemetrySnapshot({ userEmail: 'dev@inmerge.pe', isAdmin: true });
      expect(supabase.from).toHaveBeenCalledTimes(1);
      expect(supabase.rpc).toHaveBeenCalledTimes(1);

      // Invalidar solo telemetría
      clearTeamDataCache({ entity: 'telemetry' });

      // Proyectos debe venir de caché (no invoca supabase.from)
      await fetchTeamProjects();
      expect(supabase.from).toHaveBeenCalledTimes(1);

      // Telemetría debe consultar RPC nuevamente
      await fetchWorkspaceTelemetrySnapshot({ userEmail: 'dev@inmerge.pe', isAdmin: true });
      expect(supabase.rpc).toHaveBeenCalledTimes(2);
    });

    it('clearTeamDataCache({ entity: "projects" }) invalida solo el caché de proyectos manteniendo intacto el de telemetría', async () => {
      const mockProjects1 = [{ id: 'proj-1', title: 'Proyecto Alpha' }];
      const mockProjects2 = [{ id: 'proj-1', title: 'Proyecto Alpha Actualizado' }];
      const orderMock = vi
        .fn()
        .mockResolvedValueOnce({ data: mockProjects1, error: null })
        .mockResolvedValueOnce({ data: mockProjects2, error: null });
      const selectMock = vi.fn().mockReturnValue({ order: orderMock });
      supabase.from.mockReturnValue({ select: selectMock });

      const mockSnapshot = { kpis: { active_projects_count: 1 }, generated_at: '2026-09-24T10:00:00Z' };
      supabase.rpc.mockResolvedValue({ data: mockSnapshot, error: null });

      // Llenar ambos cachés
      await fetchTeamProjects();
      await fetchWorkspaceTelemetrySnapshot({ userEmail: 'dev@inmerge.pe', isAdmin: true });
      expect(supabase.from).toHaveBeenCalledTimes(1);
      expect(supabase.rpc).toHaveBeenCalledTimes(1);

      // Invalidar solo proyectos
      clearTeamDataCache({ entity: 'projects' });

      // Telemetría debe venir de caché (no invoca supabase.rpc de nuevo)
      await fetchWorkspaceTelemetrySnapshot({ userEmail: 'dev@inmerge.pe', isAdmin: true });
      expect(supabase.rpc).toHaveBeenCalledTimes(1);

      // Proyectos debe consultar la base de datos nuevamente
      await fetchTeamProjects();
      expect(supabase.from).toHaveBeenCalledTimes(2);
    });

    it('clearTeamDataCache({ entity: "all" }) y clearTeamDataCache() invalidan ambos cachés', async () => {
      const mockProjects = [{ id: 'proj-1', title: 'Proyecto Alpha' }];
      const orderMock = vi.fn().mockResolvedValue({ data: mockProjects, error: null });
      const selectMock = vi.fn().mockReturnValue({ order: orderMock });
      supabase.from.mockReturnValue({ select: selectMock });

      const mockSnapshot = { kpis: { active_projects_count: 1 }, generated_at: '2026-09-24T10:00:00Z' };
      supabase.rpc.mockResolvedValue({ data: mockSnapshot, error: null });

      // 1. Probar con { entity: 'all' }
      await fetchTeamProjects();
      await fetchWorkspaceTelemetrySnapshot({ userEmail: 'dev@inmerge.pe', isAdmin: true });
      expect(supabase.from).toHaveBeenCalledTimes(1);
      expect(supabase.rpc).toHaveBeenCalledTimes(1);

      clearTeamDataCache({ entity: 'all' });

      await fetchTeamProjects();
      await fetchWorkspaceTelemetrySnapshot({ userEmail: 'dev@inmerge.pe', isAdmin: true });
      expect(supabase.from).toHaveBeenCalledTimes(2);
      expect(supabase.rpc).toHaveBeenCalledTimes(2);

      // 2. Probar llamada por defecto clearTeamDataCache()
      clearTeamDataCache();

      await fetchTeamProjects();
      await fetchWorkspaceTelemetrySnapshot({ userEmail: 'dev@inmerge.pe', isAdmin: true });
      expect(supabase.from).toHaveBeenCalledTimes(3);
      expect(supabase.rpc).toHaveBeenCalledTimes(3);
    });

    it('createProjectTask invalida el caché de proyectos llamando clearTeamDataCache', async () => {
      const mockProjects = [{ id: 'proj-1', title: 'Proyecto Alpha' }];
      const orderMock = vi.fn().mockResolvedValue({ data: mockProjects, error: null });
      const selectMock = vi.fn().mockReturnValue({ order: orderMock });

      const mockTask = { id: 't-1', title: 'Nueva Tarea', project_id: 'proj-1', status: 'TODO' };
      const taskSingleMock = vi.fn().mockResolvedValue({ data: mockTask, error: null });
      const taskSelectMock = vi.fn().mockReturnValue({ single: taskSingleMock });
      const taskInsertMock = vi.fn().mockReturnValue({ select: taskSelectMock });
      const logInsertMock = vi.fn().mockResolvedValue({ data: null, error: null });

      supabase.from.mockImplementation((table) => {
        if (table === 'client_projects') return { select: selectMock };
        if (table === 'project_tasks') return { insert: taskInsertMock };
        if (table === 'team_activity_logs') return { insert: logInsertMock };
        return {};
      });

      // 1. Primer fetch llena el caché
      await fetchTeamProjects();
      expect(supabase.from).toHaveBeenCalledWith('client_projects');

      // 2. Crear tarea técnica
      await createProjectTask(mockTask);

      // 3. Segundo fetch debe disparar consulta de nuevo por invalidación
      await fetchTeamProjects();
      expect(selectMock).toHaveBeenCalledTimes(2);
    });
  });
});
