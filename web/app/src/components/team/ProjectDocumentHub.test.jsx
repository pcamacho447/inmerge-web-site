import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProjectDocumentHub from './ProjectDocumentHub.jsx';

describe('ProjectDocumentHub', () => {
  const mockProject = {
    id: 'proj-101',
    title: 'Auditoria GCP & BigQuery',
    description: 'Requerimiento de auditoría de rendimiento SQL y cuotas IAM en BigQuery.',
    pillar: 'auditoria',
    tech_lead_name: 'Winston Arquitecto',
    tech_lead_contact: 'winston@inmerge.pe',
    client: { full_name: 'Empresa Test SA', email: 'contacto@empreatest.pe' },
  };

  const mockDeliverables = [
    {
      id: 'deliv-1',
      title: 'Informe Forense PostgreSQL',
      file_type: 'PDF',
      version: 'v1.0',
      notes: 'Matriz de índices y tiempos de respuesta.',
    },
  ];

  it('renders the 4 document hub sections correctly', () => {
    render(<ProjectDocumentHub project={mockProject} deliverables={mockDeliverables} />);

    expect(screen.getByText(/Hub de Especificaciones & Documentos Compartidos/i)).toBeInTheDocument();
    expect(screen.getByText(/01. ALCANCE & TDR/i)).toBeInTheDocument();
    expect(screen.getByText(/02. ARQUITECTURA/i)).toBeInTheDocument();
    expect(screen.getByText(/03. SANDBOX & APIS/i)).toBeInTheDocument();
    expect(screen.getByText(/04. ENTREGABLES AUDITADOS/i)).toBeInTheDocument();
  });

  it('triggers onOpenPreview when clicking preview buttons', () => {
    const onOpenPreview = vi.fn();
    render(<ProjectDocumentHub project={mockProject} deliverables={mockDeliverables} onOpenPreview={onOpenPreview} />);

    const readTdrBtn = screen.getByRole('button', { name: /Leer Especificación Completa/i });
    fireEvent.click(readTdrBtn);

    expect(onOpenPreview).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'TDR & Alcance — Auditoria GCP & BigQuery',
        fileType: 'TDR',
      }),
    );
  });

  it('renders upload button for all staff when onUploadClick is provided even if isAdmin is false', () => {
    const onUploadClick = vi.fn();
    render(<ProjectDocumentHub project={mockProject} deliverables={mockDeliverables} isAdmin={false} onUploadClick={onUploadClick} />);

    const uploadBtn = screen.getByRole('button', { name: /\+ Subir Entregable \/ Documento/i });
    expect(uploadBtn).toBeInTheDocument();
    fireEvent.click(uploadBtn);
    expect(onUploadClick).toHaveBeenCalledTimes(1);
  });

  it('displays status badge and handles [ 🚀 Solicitar Revisión ] for BORRADOR_INTERNO', () => {
    const onUpdateDeliverableStatus = vi.fn();
    const deliverables = [
      {
        id: 'deliv-draft',
        title: 'Borrador Técnico de Red',
        status: 'BORRADOR_INTERNO',
      },
    ];

    render(
      <ProjectDocumentHub
        project={mockProject}
        deliverables={deliverables}
        isAdmin={false}
        onUpdateDeliverableStatus={onUpdateDeliverableStatus}
      />,
    );

    expect(screen.getByText('Borrador Interno')).toBeInTheDocument();
    const requestReviewBtn = screen.getByRole('button', { name: /🚀 Solicitar Revisión/i });
    expect(requestReviewBtn).toBeInTheDocument();

    fireEvent.click(requestReviewBtn);
    expect(onUpdateDeliverableStatus).toHaveBeenCalledWith(
      'deliv-draft',
      'EN_REVISION',
      expect.objectContaining({ projectId: 'proj-101', title: 'Borrador Técnico de Red' }),
    );
  });

  it('displays [ ✓ Aprobar y Publicar al Cliente ] for isAdmin when deliverable is not published', () => {
    const onUpdateDeliverableStatus = vi.fn();
    const deliverables = [
      {
        id: 'deliv-review',
        title: 'Auditoría Pendiente de Aprobación',
        status: 'EN_REVISION',
      },
    ];

    render(
      <ProjectDocumentHub
        project={mockProject}
        deliverables={deliverables}
        isAdmin={true}
        onUpdateDeliverableStatus={onUpdateDeliverableStatus}
      />,
    );

    expect(screen.getByText('En Revisión Lead')).toBeInTheDocument();
    const approveBtn = screen.getByRole('button', { name: /✓ Aprobar y Publicar al Cliente/i });
    expect(approveBtn).toBeInTheDocument();

    fireEvent.click(approveBtn);
    expect(onUpdateDeliverableStatus).toHaveBeenCalledWith(
      'deliv-review',
      'PUBLICADO_CLIENTE',
      expect.objectContaining({ projectId: 'proj-101', title: 'Auditoría Pendiente de Aprobación' }),
    );
  });

  it('does not display [ ✓ Aprobar y Publicar al Cliente ] when isAdmin is false', () => {
    const deliverables = [
      {
        id: 'deliv-review',
        title: 'Auditoría Pendiente de Aprobación',
        status: 'EN_REVISION',
      },
    ];

    render(<ProjectDocumentHub project={mockProject} deliverables={deliverables} isAdmin={false} onUpdateDeliverableStatus={vi.fn()} />);

    expect(screen.queryByRole('button', { name: /✓ Aprobar y Publicar al Cliente/i })).not.toBeInTheDocument();
  });
});
