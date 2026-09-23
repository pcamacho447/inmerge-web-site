import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import WorkerCockpitView from './WorkerCockpitView.jsx';

describe('WorkerCockpitView Component', () => {
  const mockUser = {
    email: 'auditor@inmerge.pe',
    fullName: 'Carlos Auditor',
    role: 'auditor',
    isAdmin: false,
  };

  const mockProjects = [
    {
      id: 'p-1',
      title: 'Auditoría Core Web Vitals',
      tasks: [
        {
          id: 't-1',
          title: 'Medición de LCP y CLS',
          status: 'IN_PROGRESS',
          priority: 'CRITICA',
          assigned_to_email: 'auditor@inmerge.pe',
          due_date: '2026-10-01',
          estimated_hours: 6,
          actual_hours: 2,
        },
        {
          id: 't-2',
          title: 'Configurar BigQuery',
          status: 'TODO',
          assigned_to_email: 'otro@inmerge.pe',
        },
      ],
      deliverables: [
        {
          id: 'd-1',
          title: 'Informe Preliminar CWV',
          status: 'BORRADOR_INTERNO',
          author_email: 'auditor@inmerge.pe',
          version: 'v1.0',
          file_type: 'PDF',
        },
        {
          id: 'd-2',
          title: 'Arquitectura Cloud Document',
          status: 'PUBLICADO_CLIENTE',
          author_email: 'auditor@inmerge.pe',
          version: 'v2.0',
          file_type: 'PDF',
        },
      ],
    },
  ];

  it('renderiza tareas asignadas al usuario y métricas personales', () => {
    render(<WorkerCockpitView user={mockUser} projects={mockProjects} />);
    expect(screen.getByText('Carlos Auditor')).toBeInTheDocument();
    expect(screen.getByText('Medición de LCP y CLS')).toBeInTheDocument();
    expect(screen.queryByText('Configurar BigQuery')).not.toBeInTheDocument();
    expect(screen.getByText('Informe Preliminar CWV')).toBeInTheDocument();
  });

  it('permite cambiar estado de tarea directamente desde el cockpit', () => {
    const onTaskUpdated = vi.fn();
    render(<WorkerCockpitView user={mockUser} projects={mockProjects} onTaskUpdated={onTaskUpdated} />);

    const statusSelect = screen.getByLabelText(/Estado de tarea Medición de LCP y CLS/i);
    fireEvent.change(statusSelect, { target: { value: 'DONE' } });

    expect(onTaskUpdated).toHaveBeenCalledWith('t-1', expect.objectContaining({ status: 'DONE' }), 'p-1');
  });

  it('muestra las tarjetas de métricas personales correctamente', () => {
    render(<WorkerCockpitView user={mockUser} projects={mockProjects} />);

    // Active tasks: 1 (t-1 is IN_PROGRESS)
    expect(screen.getByText('Mis Tareas Activas')).toBeInTheDocument();
    // Deliverables in progress / review: 1 (d-1 is BORRADOR_INTERNO, d-2 is PUBLICADO_CLIENTE)
    expect(screen.getByText('Mis Entregables en Trámite')).toBeInTheDocument();
    // Hours: 2h registradas / 6h estimadas
    expect(screen.getByText('Horas Imputadas del Mes')).toBeInTheDocument();
  });

  it('muestra píldoras de estado de entregable con DELIVERABLE_STATUS_CONFIG', () => {
    render(<WorkerCockpitView user={mockUser} projects={mockProjects} />);

    expect(screen.getByText('Borrador Interno')).toBeInTheDocument();
    expect(screen.getByText('Publicado al Cliente')).toBeInTheDocument();
  });

  it('permite navegar al proyecto al hacer clic en "Ver en Proyecto"', async () => {
    const user = userEvent.setup();
    const handleSelectProject = vi.fn();

    render(<WorkerCockpitView user={mockUser} projects={mockProjects} onSelectProject={handleSelectProject} />);

    const viewProjectBtns = screen.getAllByRole('button', { name: /Ver en Proyecto/i });
    expect(viewProjectBtns.length).toBeGreaterThan(0);
    await user.click(viewProjectBtns[0]);

    expect(handleSelectProject).toHaveBeenCalledWith(mockProjects[0]);
  });

  it('muestra mensaje amigable cuando no hay tareas o entregables asignados', () => {
    render(<WorkerCockpitView user={mockUser} projects={[]} />);

    expect(screen.getByText(/No tienes tareas técnicas asignadas actualmente/i)).toBeInTheDocument();
    expect(screen.getByText(/No tienes entregables técnicos registrados/i)).toBeInTheDocument();
  });
});
