import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProjectAuditFindings from './ProjectAuditFindings.jsx';

describe('ProjectAuditFindings Component', () => {
  const mockFindings = [
    {
      id: 'f-1',
      finding_code: 'FIND-CWV-01',
      title: 'LCP superior a 4.2s en página de catálogo',
      category: 'CORE_WEB_VITALS',
      severity: 'CRITICA',
      status: 'DETECTADO',
      evidence_notes: 'Carga de hero image sin fetchpriority ni formato WebP.',
      recommendation: 'Inyectar fetchpriority="high" y servir srcset en AVIF/WebP.',
    },
    {
      id: 'f-2',
      finding_code: 'FIND-SQL-02',
      title: 'Query full-scan en tabla transaccional',
      category: 'DATOS_CLOUD',
      severity: 'ALTA',
      status: 'VERIFICADO',
      evidence_notes: 'SELECT * sin filtro de partición de fecha.',
      recommendation: 'Añadir partición por _PARTITIONDATE y clusterizar por client_id.',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza la lista de hallazgos con severidad y código', () => {
    render(<ProjectAuditFindings findings={mockFindings} projectId="proj-1" />);
    expect(screen.getByText('FIND-CWV-01')).toBeInTheDocument();
    expect(screen.getByText('LCP superior a 4.2s en página de catálogo')).toBeInTheDocument();
    expect(screen.getByText('Crítica')).toBeInTheDocument();
    expect(screen.getByText('FIND-SQL-02')).toBeInTheDocument();
  });

  it('filtra hallazgos por severidad', () => {
    render(<ProjectAuditFindings findings={mockFindings} projectId="proj-1" />);
    const filterSelect = screen.getByLabelText(/Filtrar por severidad/i);
    fireEvent.change(filterSelect, { target: { value: 'CRITICA' } });

    expect(screen.getByText('FIND-CWV-01')).toBeInTheDocument();
    expect(screen.queryByText('FIND-SQL-02')).not.toBeInTheDocument();
  });

  it('filtra hallazgos por búsqueda de texto', () => {
    render(<ProjectAuditFindings findings={mockFindings} projectId="proj-1" />);
    const searchInput = screen.getByPlaceholderText(/Buscar por código o título/i);
    fireEvent.change(searchInput, { target: { value: 'full-scan' } });

    expect(screen.getByText('FIND-SQL-02')).toBeInTheDocument();
    expect(screen.queryByText('FIND-CWV-01')).not.toBeInTheDocument();
  });

  it('permite abrir el formulario de nuevo hallazgo', () => {
    const onCreated = vi.fn();
    render(<ProjectAuditFindings findings={mockFindings} projectId="proj-1" onFindingCreated={onCreated} />);
    const addBtn = screen.getByRole('button', { name: /\+ Registrar Hallazgo/i });
    fireEvent.click(addBtn);

    expect(screen.getByLabelText(/Título del Hallazgo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Severidad/i)).toBeInTheDocument();
  });

  it('permite actualizar el estado de un hallazgo', async () => {
    const onUpdated = vi.fn().mockResolvedValue();
    render(<ProjectAuditFindings findings={mockFindings} projectId="proj-1" onFindingUpdated={onUpdated} />);

    const statusSelect = screen.getByLabelText(/Cambiar estado para FIND-CWV-01/i);
    fireEvent.change(statusSelect, { target: { value: 'VERIFICADO' } });

    expect(onUpdated).toHaveBeenCalledWith('f-1', expect.objectContaining({ status: 'VERIFICADO' }));
  });

  it('exporta el informe en Markdown al portapapeles', async () => {
    const writeTextMock = vi.fn().mockResolvedValue();
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(<ProjectAuditFindings findings={mockFindings} projectId="proj-1" projectTitle="Auditoría PostgreSQL" />);
    const exportBtn = screen.getByRole('button', { name: /Copiar Informe Markdown/i });
    fireEvent.click(exportBtn);

    expect(writeTextMock).toHaveBeenCalled();
    const exportedText = writeTextMock.mock.calls[0][0];
    expect(exportedText).toContain('Informe de Auditoría Técnica');
    expect(exportedText).toContain('FIND-CWV-01');
    expect(exportedText).toContain('LCP superior a 4.2s en página de catálogo');
  });

  it('envía el formulario para registrar un nuevo hallazgo', async () => {
    const onCreated = vi.fn().mockResolvedValue();
    render(<ProjectAuditFindings findings={mockFindings} projectId="proj-1" onFindingCreated={onCreated} />);

    fireEvent.click(screen.getByRole('button', { name: /\+ Registrar Hallazgo/i }));

    fireEvent.change(screen.getByLabelText(/Título del Hallazgo/i), {
      target: { value: 'Inyección de dependencias cíclica' },
    });
    fireEvent.change(screen.getByLabelText(/Categoría/i), {
      target: { value: 'CALIDAD_CODIGO' },
    });
    fireEvent.change(screen.getByLabelText(/Severidad/i), {
      target: { value: 'ALTA' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Guardar Hallazgo/i }));

    await waitFor(() => {
      expect(onCreated).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Inyección de dependencias cíclica',
          category: 'CALIDAD_CODIGO',
          severity: 'ALTA',
          project_id: 'proj-1',
        }),
      );
    });
  });
});
