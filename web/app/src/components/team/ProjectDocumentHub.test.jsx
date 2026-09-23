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
});
