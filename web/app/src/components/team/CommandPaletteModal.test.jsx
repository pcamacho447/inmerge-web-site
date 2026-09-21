import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CommandPaletteModal from './CommandPaletteModal.jsx';

describe('CommandPaletteModal', () => {
  const mockProjects = [
    { id: 'p1', title: 'Auditoría Cloud AWS', status: 'EN_PROGRESO', client: { full_name: 'BCP Bank' } },
    { id: 'p2', title: 'Pipeline Machine Learning', status: 'PLANIFICADO', client: { full_name: 'Rímac Seguros' } },
  ];

  const mockLeads = [{ id: 'l1', full_name: 'Carlos Mendoza', company: 'Fintech Perú', pillar: 'auditoria', status: 'NUEVO' }];

  it('renders search input and options when isOpen is true', () => {
    render(
      <CommandPaletteModal
        isOpen={true}
        onClose={vi.fn()}
        projects={mockProjects}
        leads={mockLeads}
        isAdmin={true}
        onOpenNewProject={vi.fn()}
      />,
    );

    expect(screen.getByPlaceholderText(/Buscar proyectos, leads TDR/i)).toBeInTheDocument();
    expect(screen.getByText('Auditoría Cloud AWS')).toBeInTheDocument();
    expect(screen.getByText(/Fintech Perú — Carlos Mendoza/i)).toBeInTheDocument();
    expect(screen.getByText('Registrar Nuevo Proyecto')).toBeInTheDocument();
  });

  it('filters results dynamically based on typed query', async () => {
    const user = userEvent.setup();
    render(<CommandPaletteModal isOpen={true} onClose={vi.fn()} projects={mockProjects} leads={mockLeads} isAdmin={true} />);

    const input = screen.getByPlaceholderText(/Buscar proyectos, leads TDR/i);
    await user.type(input, 'Machine Learning');

    expect(screen.getByText('Pipeline Machine Learning')).toBeInTheDocument();
    expect(screen.queryByText('Auditoría Cloud AWS')).not.toBeInTheDocument();
  });

  it('calls onSelectProject when project option is clicked', async () => {
    const user = userEvent.setup();
    const handleSelectProject = vi.fn();
    const handleClose = vi.fn();

    render(
      <CommandPaletteModal
        isOpen={true}
        onClose={handleClose}
        projects={mockProjects}
        leads={mockLeads}
        onSelectProject={handleSelectProject}
      />,
    );

    const projOption = screen.getByText('Auditoría Cloud AWS');
    await user.click(projOption);

    expect(handleSelectProject).toHaveBeenCalledWith(mockProjects[0]);
    expect(handleClose).toHaveBeenCalled();
  });

  it('navigates with keyboard arrows and triggers on Enter', async () => {
    const handleSelectAction = vi.fn();
    const handleClose = vi.fn();

    render(
      <CommandPaletteModal
        isOpen={true}
        onClose={handleClose}
        projects={mockProjects}
        leads={[]}
        isAdmin={true}
        onOpenNewProject={handleSelectAction}
      />,
    );

    const input = screen.getByPlaceholderText(/Buscar proyectos, leads TDR/i);
    // Enter on first selected item (New Project Action)
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(handleSelectAction).toHaveBeenCalled();
    expect(handleClose).toHaveBeenCalled();
  });
});
