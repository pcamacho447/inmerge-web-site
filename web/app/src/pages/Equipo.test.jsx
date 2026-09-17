import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
}));

vi.mock('../hooks/useRealtimeTeam.js', () => ({
  default: vi.fn(),
}));

vi.mock('../lib/supabaseClient.js', () => ({
  supabase: {
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
        milestones: [
          { id: 'm-1', title: 'Fase 01 — Diagnóstico', status: 'COMPLETADO', progress: 100 },
        ],
        tasks: [],
        risks: [],
        deliverables: [],
      },
    ]);

    teamLib.fetchRegisteredClients.mockResolvedValue([
      { id: 'client-1', email: 'cmendoza@fintechlatam.pe', fullName: 'Carlos Mendoza' },
    ]);

    teamLib.fetchStaffMembers.mockResolvedValue([
      { id: 'staff-1', full_name: 'Elena Ramos', email: 'elena@inmerge.pe', role: 'auditor' },
    ]);

    teamLib.fetchTeamActivityLogs.mockResolvedValue([
      {
        id: 'log-1',
        action: 'PROJECT_STATUS_UPDATE',
        entity_name: 'Auditoría Forense PostgreSQL',
        created_at: '2026-09-10T14:00:00Z',
      },
    ]);
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
});
