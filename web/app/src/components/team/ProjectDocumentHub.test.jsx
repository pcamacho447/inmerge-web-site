import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProjectDocumentHub from './ProjectDocumentHub.jsx';
import * as vaultStorage from '../../lib/vaultStorage.js';

vi.mock('../../lib/vaultStorage.js', () => ({
  getSignedDeliverableUrl: vi.fn().mockResolvedValue({
    signedUrl: 'https://vault.inmerge.dev/signed/proj-1/report.pdf',
    expiresAt: '2026-09-24T12:00:00Z',
  }),
}));

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

  it('renderiza la ficha técnica con repositorio, stack tags y runbook de entorno', () => {
    const mockProjectWithSpecs = {
      id: 'proj-cloud-1',
      title: 'Modernización Cloud GCP & BigQuery',
      pillar: 'datos',
      description: 'Auditoría y optimización de pipelines.',
      repo_url: 'https://github.com/inmerge-org/data-lake-pipeline',
      staging_url: 'https://staging.pipeline.inmerge.dev',
      cloud_provider: 'Google Cloud Platform (us-central1)',
      stack_tags: ['BigQuery', 'Dataform', 'Python', 'FastAPI'],
      runbook_instructions: 'Usar gcloud auth application-default login antes de correr el test local.',
    };

    render(<ProjectDocumentHub project={mockProjectWithSpecs} deliverables={[]} />);

    expect(screen.getByText(/Google Cloud Platform/i)).toBeInTheDocument();
    expect(screen.getByText('BigQuery')).toBeInTheDocument();
    expect(screen.getByText(/data-lake-pipeline/i)).toBeInTheDocument();
    expect(screen.getByText(/gcloud auth application-default/i)).toBeInTheDocument();
  });

  it('permite copiar la URL del repositorio con feedback visual temporal', async () => {
    const writeTextMock = vi.fn().mockResolvedValue();
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    const mockProjectWithSpecs = {
      id: 'proj-copy-test',
      title: 'Desarrollo API Microservicios',
      pillar: 'desarrollo',
      repo_url: 'https://github.com/inmerge-org/backend-api',
      cloud_provider: 'AWS (us-east-1)',
      stack_tags: ['Node.js', 'Express', 'PostgreSQL'],
      runbook_instructions: 'npm run test:ci',
    };

    render(<ProjectDocumentHub project={mockProjectWithSpecs} deliverables={[]} />);

    const copyRepoBtn = screen.getByRole('button', { name: /Copiar URL Repositorio/i });
    expect(copyRepoBtn).toBeInTheDocument();

    fireEvent.click(copyRepoBtn);

    expect(writeTextMock).toHaveBeenCalledWith('https://github.com/inmerge-org/backend-api');
    expect(await screen.findByText(/¡Copiado!/i)).toBeInTheDocument();
  });

  it('utiliza fallbacks técnicos según el pilar cuando no se especifican en el proyecto', () => {
    const mockPillarProject = {
      id: 'proj-pillar-auditoria',
      title: 'Auditoría Forense Web',
      pillar: 'auditoria',
    };

    render(<ProjectDocumentHub project={mockPillarProject} deliverables={[]} />);

    expect(screen.getByText(/Lighthouse/i)).toBeInTheDocument();
  });

  it('permite copiar el runbook de entorno con feedback visual temporal', async () => {
    const writeTextMock = vi.fn().mockResolvedValue();
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    const mockProjectWithSpecs = {
      id: 'proj-runbook-test',
      title: 'Auditoría PostgreSQL',
      pillar: 'auditoria',
      runbook_instructions: 'docker compose -f docker-compose.audit.yml up -d',
    };

    render(<ProjectDocumentHub project={mockProjectWithSpecs} deliverables={[]} />);

    const copyRunbookBtn = screen.getByRole('button', { name: /Copiar Runbook/i });
    expect(copyRunbookBtn).toBeInTheDocument();

    fireEvent.click(copyRunbookBtn);

    expect(writeTextMock).toHaveBeenCalledWith('docker compose -f docker-compose.audit.yml up -d');
    expect(await screen.findByText(/¡Copiado!/i)).toBeInTheDocument();
  });

  it('envía los datos de la ficha técnica al previsualizar la guía sandbox en el drawer', () => {
    const onOpenPreview = vi.fn();
    const mockProjectWithSpecs = {
      id: 'proj-preview-test',
      title: 'Plataforma Web Mochica',
      pillar: 'auditoria',
      repo_url: 'https://github.com/inmerge-org/mochica-web',
      cloud_provider: 'Cloudflare Pages / AWS',
      staging_url: 'https://staging.mochica.pe',
      stack_tags: ['Vite', 'React'],
      runbook_instructions: 'npm run dev',
    };

    render(<ProjectDocumentHub project={mockProjectWithSpecs} deliverables={[]} onOpenPreview={onOpenPreview} />);

    const previewBtn = screen.getByRole('button', { name: /Previsualizar Guía Sandbox/i });
    fireEvent.click(previewBtn);

    expect(onOpenPreview).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Guía Sandbox & APIs — Plataforma Web Mochica',
        fileType: 'CONFIG',
        content: expect.stringContaining('https://github.com/inmerge-org/mochica-web'),
      }),
    );
  });

  it('resolves signed URL via getSignedDeliverableUrl when previewing deliverable with file_path', async () => {
    const onOpenPreview = vi.fn();
    const deliverablesWithFile = [
      {
        id: 'deliv-signed-1',
        title: 'Informe Forense de Seguridad',
        file_path: 'proj-101/informe-forense.pdf',
        file_type: 'PDF',
        status: 'PUBLICADO_CLIENTE',
      },
    ];

    render(<ProjectDocumentHub project={mockProject} deliverables={deliverablesWithFile} onOpenPreview={onOpenPreview} />);

    const previewBtn = screen.getByRole('button', { name: /Ver entregable Informe Forense de Seguridad/i });
    fireEvent.click(previewBtn);

    await waitFor(() => {
      expect(vaultStorage.getSignedDeliverableUrl).toHaveBeenCalledWith('proj-101/informe-forense.pdf');
      expect(onOpenPreview).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Informe Forense de Seguridad',
          url: 'https://vault.inmerge.dev/signed/proj-1/report.pdf',
          filePath: 'proj-101/informe-forense.pdf',
        }),
      );
    });
  });

  it('triggers direct secure download via getSignedDeliverableUrl', async () => {
    const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    const deliverablesWithFile = [
      {
        id: 'deliv-signed-2',
        title: 'Certificado de Auditoría OWASP',
        file_path: 'proj-101/owasp-cert.pdf',
        file_type: 'PDF',
        status: 'PUBLICADO_CLIENTE',
      },
    ];

    render(<ProjectDocumentHub project={mockProject} deliverables={deliverablesWithFile} />);

    const downloadBtn = screen.getByRole('button', { name: /Descargar entregable Certificado de Auditoría OWASP/i });
    fireEvent.click(downloadBtn);

    await waitFor(() => {
      expect(vaultStorage.getSignedDeliverableUrl).toHaveBeenCalledWith('proj-101/owasp-cert.pdf');
      expect(windowOpenSpy).toHaveBeenCalledWith('https://vault.inmerge.dev/signed/proj-1/report.pdf', '_blank', 'noopener,noreferrer');
    });

    windowOpenSpy.mockRestore();
  });
});
