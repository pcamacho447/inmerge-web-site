import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Equipo from './Equipo.jsx';
import * as authLib from '../lib/auth.jsx';
import * as teamLib from '../lib/team.js';
import * as realtimeHook from '../hooks/useRealtimeTeam.js';

vi.mock('../lib/auth.jsx', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../lib/team.js', () => ({
  fetchRegisteredClients: vi.fn(),
  fetchTeamLeads: vi.fn(),
  updateLeadStatus: vi.fn(),
  fetchTeamProjects: vi.fn(),
  createTeamProject: vi.fn(),
  updateProjectStatus: vi.fn(),
  addProjectMilestone: vi.fn(),
  updateMilestoneStatus: vi.fn(),
  uploadDeliverableFile: vi.fn(),
  createDeliverableRecord: vi.fn(),
  updateDeliverableStatus: vi.fn(),
  fetchStaffMembers: vi.fn(),
  createStaffMember: vi.fn(),
  fetchTeamActivityLogs: vi.fn(),
  createProjectTask: vi.fn(),
  updateProjectTask: vi.fn(),
  deleteProjectTask: vi.fn(),
  createProjectRisk: vi.fn(),
  updateProjectRisk: vi.fn(),
  updateProjectHealth: vi.fn(),
  updateProjectStaff: vi.fn(),
  createProjectFinding: vi.fn(),
  updateProjectFinding: vi.fn(),
  deleteProjectFinding: vi.fn(),
  fetchProjectFindings: vi.fn(),
  fetchWorkspaceTelemetrySnapshot: vi.fn(),
}));

vi.mock('../hooks/useRealtimeTeam.js', () => ({
  default: vi.fn(),
}));

vi.mock('../lib/supabaseClient.js', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    })),
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn((cb) => cb && cb('SUBSCRIBED')),
    })),
    removeChannel: vi.fn(),
  },
}));

describe('Equipo Console Component', () => {
  const mockLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    authLib.useAuth.mockReturnValue({
      user: {
        id: 'admin-1',
        email: 'lead.architect@inmerge.pe',
        fullName: 'Principal Architect',
        role: 'admin',
        isStaff: true,
        isAdmin: true,
      },
      logout: mockLogout,
    });

    realtimeHook.default.mockReturnValue({
      toast: null,
      dismissToast: vi.fn(),
      connectionStatus: 'CONNECTED',
      isOnline: true,
    });

    teamLib.fetchTeamLeads.mockResolvedValue([
      {
        id: 'lead-1',
        full_name: 'Carlos Mendoza',
        company_name: 'Fintech Latam SAC',
        email: 'cmendoza@fintechlatam.pe',
        pillar_interest: 'auditoria',
        status: 'NUEVO',
        estimated_budget: 'S/ 8,000 PEN',
        created_at: '2026-09-10T12:00:00Z',
      },
    ]);

    teamLib.fetchTeamProjects.mockResolvedValue([
      {
        id: 'proj-1',
        title: 'Auditoría Forense PostgreSQL',
        pillar: 'auditoria',
        status: 'EN_AUDITORIA',
        health_status: 'ON_TRACK',
        milestones: [{ id: 'm-1', title: 'Fase 01 — Diagnóstico', status: 'COMPLETADO', progress: 100 }],
        tasks: [],
        risks: [],
        deliverables: [
          {
            id: 'deliv-1',
            title: 'Informe Forense Inicial',
            status: 'EN_REVISION',
            version: 'v1.0',
            file_type: 'PDF',
          },
        ],
      },
    ]);

    teamLib.fetchRegisteredClients.mockResolvedValue([{ id: 'client-1', email: 'cmendoza@fintechlatam.pe', fullName: 'Carlos Mendoza' }]);

    teamLib.fetchStaffMembers.mockResolvedValue([{ id: 'staff-1', full_name: 'Elena Ramos', email: 'elena@inmerge.pe', role: 'auditor' }]);

    teamLib.fetchTeamActivityLogs.mockResolvedValue([
      {
        id: 'log-1',
        action: 'PROJECT_STATUS_UPDATE',
        entity_name: 'Auditoría Forense PostgreSQL',
        created_at: '2026-09-10T14:00:00Z',
      },
    ]);

    teamLib.fetchWorkspaceTelemetrySnapshot.mockResolvedValue({
      kpis: {
        active_projects_count: 1,
        active_leads_count: 1,
        pending_deliverables_count: 1,
        open_critical_findings_count: 0,
        user_assigned_tasks_count: 0,
      },
      generated_at: '2026-09-23T20:00:00Z',
    });
  });

  it('renders the Full-Canvas layout with top KPI metric strip and realtime status', async () => {
    render(
      <MemoryRouter>
        <Equipo />
      </MemoryRouter>,
    );

    expect(await screen.findByText('REALTIME ACTIVO')).toBeInTheDocument();
    expect(screen.getByText('Gestión Operativa de Auditorías & Proyectos')).toBeInTheDocument();
    expect(screen.getByText('📥 Leads TDR:')).toBeInTheDocument();
    expect(screen.getByText('⚡ Proyectos:')).toBeInTheDocument();
  });

  it('toggles sidebar collapse and expansion', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Equipo />
      </MemoryRouter>,
    );

    await screen.findByText('Gestión Operativa de Auditorías & Proyectos');

    const toggleBtn = screen.getByRole('button', { name: /Colapsar barra lateral/i });
    expect(toggleBtn).toBeInTheDocument();

    await user.click(toggleBtn);
    expect(screen.getByRole('button', { name: /Expandir barra lateral/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Expandir barra lateral/i }));
    expect(screen.getByRole('button', { name: /Colapsar barra lateral/i })).toBeInTheDocument();
  });

  it('opens and closes the slide-over drawer via trigger button and Escape key', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Equipo />
      </MemoryRouter>,
    );

    await screen.findByText('Gestión Operativa de Auditorías & Proyectos');
    await waitFor(() => expect(screen.queryByText(/Cargando consola/i)).not.toBeInTheDocument());

    const triggerBtn = screen.getByRole('button', { name: /\+ Opciones & Creación/i });
    await user.click(triggerBtn);

    const drawerDialog = screen.getByRole('dialog', { hidden: true });
    expect(drawerDialog.className).toContain('is-open');

    // Close via Escape key
    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
    await waitFor(() => {
      expect(drawerDialog.className).not.toContain('is-open');
    });
  });

  it('navigates seamlessly between workspace tabs (Leads, Projects, Activity, Team)', async () => {
    render(
      <MemoryRouter>
        <Equipo />
      </MemoryRouter>,
    );

    expect(await screen.findByText('Gestión Operativa de Auditorías & Proyectos')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText(/Cargando consola/i)).not.toBeInTheDocument());

    // Click Projects tab
    const projectsTab = screen.getByRole('tab', { name: /Proyectos & Auditorías/i });
    fireEvent.click(projectsTab);

    expect(await screen.findByText(/Proyectos en Curso & Auditorías/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Auditoría Forense PostgreSQL' })).toBeInTheDocument();

    // Click Activity tab
    const activityTab = screen.getByRole('tab', { name: /Bitácora & Auditoría/i });
    fireEvent.click(activityTab);

    expect(await screen.findByText('Registro cronológico forense y eventos de auditoría en tiempo real.')).toBeInTheDocument();
  });

  it('allows admin to approve deliverable directly from project hub', async () => {
    teamLib.updateDeliverableStatus.mockResolvedValue({ id: 'deliv-1', status: 'PUBLICADO_CLIENTE' });

    render(
      <MemoryRouter>
        <Equipo />
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.queryByText(/Cargando consola/i)).not.toBeInTheDocument());

    // Switch to projects tab
    const projectsTab = screen.getByRole('tab', { name: /Proyectos & Auditorías/i });
    fireEvent.click(projectsTab);

    expect(await screen.findByText(/Informe Forense Inicial/i)).toBeInTheDocument();
    expect(screen.getByText('En Revisión Lead')).toBeInTheDocument();

    const approveBtn = screen.getByRole('button', { name: /✓ Aprobar y Publicar al Cliente/i });
    fireEvent.click(approveBtn);

    await waitFor(() => {
      expect(teamLib.updateDeliverableStatus).toHaveBeenCalledWith(
        'deliv-1',
        'PUBLICADO_CLIENTE',
        expect.objectContaining({ projectId: 'proj-1', title: 'Informe Forense Inicial' }),
      );
    });
  });

  it('permite acceder a la matriz de hallazgos PM_FINDINGS desde el panel', async () => {
    teamLib.fetchProjectFindings.mockResolvedValue([
      {
        id: 'f-101',
        finding_code: 'FIND-INT-101',
        title: 'Vulnerabilidad SQL Injection mitigada',
        category: 'SEGURIDAD_OWASP',
        severity: 'ALTA',
        status: 'VERIFICADO',
      },
    ]);

    render(
      <MemoryRouter>
        <Equipo />
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.queryByText(/Cargando consola/i)).not.toBeInTheDocument());

    // Switch to projects tab
    const projectsTab = screen.getByRole('tab', { name: /Proyectos & Auditorías/i });
    fireEvent.click(projectsTab);

    // Select PM_FINDINGS tool
    const toolSelect = screen.getByLabelText(/Seleccionar herramienta avanzada de proyecto/i);
    fireEvent.change(toolSelect, { target: { value: 'PM_FINDINGS' } });

    expect(await screen.findByText('FIND-INT-101')).toBeInTheDocument();
    expect(screen.getByText('Vulnerabilidad SQL Injection mitigada')).toBeInTheDocument();
    expect(screen.getByText(/Matriz Forense de Hallazgos Técnicos/i)).toBeInTheDocument();
  });

  it('fija activeTab en cockpit y viewScope en ASSIGNED para usuarios no administradores', async () => {
    authLib.useAuth.mockReturnValue({
      user: {
        id: 'auditor-1',
        email: 'auditor.lead@inmerge.pe',
        fullName: 'Elena Ramos',
        role: 'auditor',
        isStaff: true,
        isAdmin: false,
      },
      logout: mockLogout,
    });

    render(
      <MemoryRouter>
        <Equipo />
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.queryByText(/Cargando consola/i)).not.toBeInTheDocument());

    expect(screen.getByRole('tab', { name: /Mi Estación de Trabajo/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Elena Ramos' })).toBeInTheDocument();
    expect(screen.getByText(/ESTACIÓN DE TRABAJO TÉCNICA/i)).toBeInTheDocument();
  });

  it('permite alternar hacia la estación de trabajo desde las pestañas', async () => {
    render(
      <MemoryRouter>
        <Equipo />
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.queryByText(/Cargando consola/i)).not.toBeInTheDocument());

    const cockpitTab = screen.getByRole('tab', { name: /Mi Estación de Trabajo/i });
    fireEvent.click(cockpitTab);

    expect(await screen.findByText(/ESTACIÓN DE TRABAJO TÉCNICA/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Principal Architect' })).toBeInTheDocument();
  });

  it('aprovecha fetchWorkspaceTelemetrySnapshot para inicializar telemetría de KPIs', async () => {
    render(
      <MemoryRouter>
        <Equipo />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(teamLib.fetchWorkspaceTelemetrySnapshot).toHaveBeenCalledWith({
        userEmail: 'lead.architect@inmerge.pe',
        isAdmin: true,
      });
    });
  });

  it('aplica parches delta reactivos para tareas, entregables y hallazgos sin consultar la red', async () => {
    let capturedOptions;
    realtimeHook.default.mockImplementation((opts) => {
      capturedOptions = opts;
      return {
        toast: null,
        dismissToast: vi.fn(),
        connectionStatus: 'CONNECTED',
        isOnline: true,
      };
    });

    render(
      <MemoryRouter>
        <Equipo />
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.queryByText(/Cargando consola/i)).not.toBeInTheDocument());

    expect(capturedOptions?.onDeltaPatch).toBeDefined();

    // Limpiar contador de llamadas a la red
    teamLib.fetchTeamProjects.mockClear();

    // 1. Delta INSERT en project_tasks sin invocar red
    act(() => {
      capturedOptions.onDeltaPatch({
        table: 'project_tasks',
        eventType: 'INSERT',
        new: {
          id: 'task-new-1',
          project_id: 'proj-1',
          title: 'Optimización de Índices PostgreSQL',
          status: 'IN_PROGRESS',
        },
      });
    });

    expect(teamLib.fetchTeamProjects).not.toHaveBeenCalled();

    // 2. Delta UPDATE en project_deliverables reflejado en la UI
    act(() => {
      capturedOptions.onDeltaPatch({
        table: 'project_deliverables',
        eventType: 'UPDATE',
        new: {
          id: 'deliv-1',
          project_id: 'proj-1',
          title: 'Informe Forense Aprobado',
          status: 'PUBLICADO_CLIENTE',
        },
      });
    });

    expect(teamLib.fetchTeamProjects).not.toHaveBeenCalled();

    // El entregable actualizado debe reflejarse en la UI
    expect(await screen.findByText(/Informe Forense Aprobado/i)).toBeInTheDocument();

    // 3. Delta INSERT en project_findings reflejado directamente en la matriz
    act(() => {
      capturedOptions.onDeltaPatch({
        table: 'project_findings',
        eventType: 'INSERT',
        new: {
          id: 'find-99',
          project_id: 'proj-1',
          finding_code: 'FIND-SEC-99',
          title: 'Hallazgo Crítico Resuelto',
          severity: 'ALTA',
          status: 'IDENTIFICADO',
        },
      });
    });

    expect(teamLib.fetchTeamProjects).not.toHaveBeenCalled();

    const toolSelect = screen.getByLabelText(/Seleccionar herramienta avanzada de proyecto/i);
    fireEvent.change(toolSelect, { target: { value: 'PM_FINDINGS' } });

    expect(await screen.findByText('FIND-SEC-99')).toBeInTheDocument();
    expect(screen.getByText('Hallazgo Crítico Resuelto')).toBeInTheDocument();
  });

  it('opens and closes NotificationsPopover when clicking the notifications trigger button', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Equipo />
      </MemoryRouter>,
    );

    await screen.findByText('Gestión Operativa de Auditorías & Proyectos');

    const notifBtn = screen.getByRole('button', { name: /Abrir centro de notificaciones/i });
    expect(notifBtn).toBeInTheDocument();

    await user.click(notifBtn);

    expect(await screen.findByRole('dialog', { name: /Centro de Notificaciones/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Notificaciones' })).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /Centro de Notificaciones/i })).not.toBeInTheDocument();
    });
  });

  it('displays ConnectionTelemetryBanner when network is offline', async () => {
    realtimeHook.default.mockReturnValue({
      toast: null,
      dismissToast: vi.fn(),
      connectionStatus: 'DISCONNECTED',
      isOnline: false,
    });

    render(
      <MemoryRouter>
        <Equipo />
      </MemoryRouter>,
    );

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/SIN CONEXIÓN DE RED/i)).toBeInTheDocument();
  });
});
