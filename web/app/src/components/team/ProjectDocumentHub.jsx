import { useState } from 'react';
import { DELIVERABLE_STATUS_CONFIG } from '../../lib/pm.js';

const PILLAR_TECH_FALLBACKS = {
  auditoria: {
    cloud_provider: 'AWS Cloud / GCP (Multi-tenant)',
    stack_tags: ['Lighthouse CI', 'PostgreSQL', 'Docker', 'OWASP ZAP', 'Core Web Vitals'],
    repo_url_suffix: '-audit',
    staging_url: 'https://audit-staging.inmerge.dev',
    runbook_instructions: 'npm install && npm run audit:local\nConfigurar credenciales de lectura en .env.sandbox para réplicas.',
  },
  desarrollo: {
    cloud_provider: 'Amazon Web Services (us-east-1)',
    stack_tags: ['React', 'Node.js', 'PostgreSQL', 'Docker', 'AWS ECS'],
    repo_url_suffix: '-core',
    staging_url: 'https://staging.inmerge.dev',
    runbook_instructions: 'git clone && docker compose up -d\nEjecutar npm test antes de enviar PR a main.',
  },
  datos: {
    cloud_provider: 'Google Cloud Platform (us-central1)',
    stack_tags: ['BigQuery', 'Dataform', 'Python', 'FastAPI'],
    repo_url_suffix: '-data-pipeline',
    staging_url: 'https://staging.pipeline.inmerge.dev',
    runbook_instructions: 'Usar gcloud auth application-default login antes de correr el test local.',
  },
};

const DEFAULT_FALLBACK = {
  cloud_provider: 'Inmerge Private Cloud / AWS',
  stack_tags: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
  repo_url_suffix: '-repo',
  staging_url: 'https://staging.inmerge.dev',
  runbook_instructions: 'npm install && npm test\nConsultar variables de entorno en el panel del equipo.',
};

/**
 * ProjectDocumentHub — Hub Documental y de Especificaciones del Proyecto
 * Proporciona acceso a TDRs, Arquitectura, Sandbox y Entregables en un solo espacio limpio.
 */
export default function ProjectDocumentHub({
  project,
  deliverables = [],
  isAdmin = false,
  onOpenPreview,
  onUploadClick,
  onUpdateDeliverableStatus,
}) {
  const [copiedRepo, setCopiedRepo] = useState(false);
  const [copiedRunbook, setCopiedRunbook] = useState(false);

  if (!project) return null;

  // Extraer TDR / Descripción del proyecto
  const tdrContent = project.description || 'Sin descripción técnica registrada para este proyecto.';

  // Extraer ficha técnica y fallbacks según el pilar
  const pillar = project.pillar || 'integral';
  const fallback = PILLAR_TECH_FALLBACKS[pillar] || DEFAULT_FALLBACK;

  const repoUrl =
    project.repo_url ||
    project.tech_specs?.repo_url ||
    project.metadata?.repo_url ||
    `https://github.com/inmerge-org/${project.id || 'project'}${fallback.repo_url_suffix || ''}`;

  const stagingUrl = project.staging_url || project.tech_specs?.staging_url || project.metadata?.staging_url || fallback.staging_url;

  const cloudProvider =
    project.cloud_provider ||
    project.tech_specs?.cloud_provider ||
    project.metadata?.cloud_provider ||
    (project.region ? `${fallback.cloud_provider} (${project.region})` : fallback.cloud_provider);

  const rawTags = project.stack_tags || project.tech_specs?.stack_tags || project.metadata?.stack_tags || fallback.stack_tags;

  const stackTags = Array.isArray(rawTags)
    ? rawTags
    : typeof rawTags === 'string'
      ? rawTags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      : fallback.stack_tags;

  const runbookInstructions =
    project.runbook_instructions ||
    project.tech_specs?.runbook_instructions ||
    project.metadata?.runbook_instructions ||
    fallback.runbook_instructions;

  const handleCopyRepo = async () => {
    if (navigator?.clipboard?.writeText && repoUrl) {
      try {
        await navigator.clipboard.writeText(repoUrl);
        setCopiedRepo(true);
        setTimeout(() => setCopiedRepo(false), 2000);
      } catch (err) {
        console.warn('Error al copiar repositorio:', err);
      }
    }
  };

  const handleCopyRunbook = async () => {
    if (navigator?.clipboard?.writeText && runbookInstructions) {
      try {
        await navigator.clipboard.writeText(runbookInstructions);
        setCopiedRunbook(true);
        setTimeout(() => setCopiedRunbook(false), 2000);
      } catch (err) {
        console.warn('Error al copiar runbook:', err);
      }
    }
  };

  // Lista unificada de entregables
  const projectDeliverables = deliverables && deliverables.length > 0 ? deliverables : project.deliverables || [];

  const handlePreviewTdr = () => {
    onOpenPreview?.({
      title: `TDR & Alcance — ${project.title}`,
      fileType: 'TDR',
      content: tdrContent,
      notes: `Requerimiento original del cliente. Pilar: ${project.pillar || 'N/A'}.`,
      version: 'v1.0-inicial',
      author: project.client?.full_name || project.client?.email || 'Cliente Inmerge',
    });
  };

  const handlePreviewDeliverable = (deliv) => {
    onOpenPreview?.({
      title: deliv.title,
      fileType: deliv.file_type || 'DOC',
      content: deliv.notes || 'Sin notas adicionales.',
      url: deliv.external_url || deliv.file_path || null,
      notes: deliv.notes || '',
      version: deliv.version || 'v1.0',
      author: 'Equipo Técnico Inmerge',
      deliverableId: deliv.id,
      filePath: deliv.file_path,
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Resumen del Hub */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          background: 'var(--cream2)',
          padding: '16px 20px',
          borderRadius: 6,
          border: '1px solid var(--border)',
        }}
      >
        <div>
          <h3 style={{ margin: '0 0 4px', fontSize: 18, fontFamily: "'Spectral', serif", color: 'var(--ink)' }}>
            📖 Hub de Especificaciones & Documentos Compartidos
          </h3>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--muted)' }}>
            Documentación técnica, TDR del cliente, arquitectura y entregables auditados.
          </p>
        </div>

        {onUploadClick && (
          <button
            type="button"
            onClick={onUploadClick}
            style={{
              background: 'var(--terracotta)',
              color: '#fff',
              border: 'none',
              borderRadius: 16,
              padding: '6px 14px',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: "'IBM Plex Sans', sans-serif",
            }}
          >
            + Subir Entregable / Documento
          </button>
        )}
      </div>

      {/* Cuadrícula de 4 Secciones Documentales */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 480px), 1fr))',
          gap: 16,
        }}
      >
        {/* 01. Briefing & Alcance TDR */}
        <div
          style={{
            background: '#fff',
            borderRadius: 6,
            border: '1px solid var(--border)',
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 10,
                  fontWeight: 700,
                  background: 'rgba(168, 71, 43, 0.1)',
                  color: 'var(--terracotta)',
                  padding: '2px 6px',
                  borderRadius: 4,
                  border: '1px solid rgba(168, 71, 43, 0.25)',
                }}
              >
                01. ALCANCE & TDR
              </span>
              <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: "'IBM Plex Mono', monospace" }}>Entrada</span>
            </div>
            <h4 style={{ margin: '0 0 8px', fontSize: 15, color: 'var(--ink)' }}>Requerimiento de Negocio & TDR</h4>
            <p
              style={{
                fontSize: 12,
                color: 'var(--muted)',
                lineHeight: 1.5,
                margin: 0,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {tdrContent}
            </p>
          </div>

          <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1px solid var(--border)', textAlign: 'right' }}>
            <button
              type="button"
              onClick={handlePreviewTdr}
              style={{
                background: 'var(--bg)',
                color: 'var(--ink)',
                border: '1px solid var(--border)',
                borderRadius: 4,
                padding: '5px 12px',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: "'IBM Plex Sans', sans-serif",
              }}
            >
              👁️ Leer Especificación Completa
            </button>
          </div>
        </div>

        {/* 02. Arquitectura de Solución */}
        <div
          style={{
            background: '#fff',
            borderRadius: 6,
            border: '1px solid var(--border)',
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 10,
                  fontWeight: 700,
                  background: 'rgba(216, 168, 78, 0.15)',
                  color: '#9B7322',
                  padding: '2px 6px',
                  borderRadius: 4,
                  border: '1px solid var(--gold)',
                }}
              >
                02. ARQUITECTURA
              </span>
              <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: "'IBM Plex Mono', monospace" }}>Diseño</span>
            </div>
            <h4 style={{ margin: '0 0 8px', fontSize: 15, color: 'var(--ink)' }}>Especificaciones de Arquitectura & ADRs</h4>
            <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5, margin: 0 }}>
              Diseño de microservicios, esquemas de base de datos, flujos de datos y matriz de decisiones técnicas.
            </p>
          </div>

          <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1px solid var(--border)', textAlign: 'right' }}>
            <button
              type="button"
              onClick={() => {
                onOpenPreview?.({
                  title: `Arquitectura de Solución — ${project.title}`,
                  fileType: 'ARQUITECTURA',
                  content: `# Especificación de Arquitectura de Software\n\n**Proyecto:** ${project.title}\n**Pilar:** ${project.pillar}\n\n## 1. Topología del Sistema\n- Servicios alojados en AWS (ECS / Lambda) con persistencia en Supabase (PostgreSQL).\n- Comunicación mediante APIs REST seguras con autenticación JWT.\n\n## 2. Decisiones Arquitectónicas (ADRs)\n- **ADR-01:** Uso de RLS en Supabase para aislamiento de tenants de cliente.\n- **ADR-02:** Enlaces firmados de expiración temporal (15 min) para entregables confidenciales.`,
                  notes: 'Matriz de arquitectura aprobada por el Tech Lead.',
                  version: 'v1.0-arch',
                  author: 'Inmerge Architecture Team',
                });
              }}
              style={{
                background: 'var(--bg)',
                color: 'var(--ink)',
                border: '1px solid var(--border)',
                borderRadius: 4,
                padding: '5px 12px',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: "'IBM Plex Sans', sans-serif",
              }}
            >
              👁️ Previsualizar Arquitectura
            </button>
          </div>
        </div>

        {/* 03. Entorno Sandbox & APIs */}
        <div
          style={{
            background: '#fff',
            borderRadius: 6,
            border: '1px solid var(--border)',
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 14,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 10,
                  fontWeight: 700,
                  background: 'rgba(52, 89, 149, 0.12)',
                  color: '#345995',
                  padding: '2px 6px',
                  borderRadius: 4,
                  border: '1px solid #345995',
                }}
              >
                03. SANDBOX & APIS
              </span>
              <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: "'IBM Plex Mono', monospace" }}>Desarrollo & Runbook</span>
            </div>
            <h4 style={{ margin: '0 0 4px', fontSize: 15, color: 'var(--ink)' }}>Guía de Conexión & Entorno Sandbox</h4>
            <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5, margin: '0 0 12px' }}>
              Variables de entorno, repositorios git, endpoints y reglas de desarrollo.
            </p>

            {/* Bento Grid de Especificaciones Técnicas */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Repositorio Git */}
              <div
                style={{
                  background: 'var(--cream2)',
                  padding: '10px 12px',
                  borderRadius: 4,
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 200, flex: 1 }}>
                  <span
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 10,
                      fontWeight: 700,
                      color: 'var(--muted)',
                      textTransform: 'uppercase',
                    }}
                  >
                    Repositorio Git
                  </span>
                  <a
                    href={repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 11,
                      color: 'var(--terracotta)',
                      textDecoration: 'none',
                      wordBreak: 'break-all',
                    }}
                    title={repoUrl}
                  >
                    {repoUrl} ↗
                  </a>
                </div>
                <button
                  type="button"
                  onClick={handleCopyRepo}
                  style={{
                    background: copiedRepo ? 'rgba(46, 117, 89, 0.15)' : '#fff',
                    color: copiedRepo ? '#2E7559' : 'var(--ink)',
                    border: copiedRepo ? '1px solid #2E7559' : '1px solid var(--border)',
                    borderRadius: 4,
                    padding: '4px 10px',
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: "'IBM Plex Sans', sans-serif",
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {copiedRepo ? '✓ ¡Copiado!' : '📋 Copiar URL Repositorio'}
                </button>
              </div>

              {/* Cloud Provider & Staging URL */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 8,
                }}
              >
                {/* Cloud & Región */}
                <div
                  style={{
                    background: 'var(--bg)',
                    padding: '8px 10px',
                    borderRadius: 4,
                    border: '1px solid var(--border)',
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 9,
                      fontWeight: 700,
                      color: 'var(--muted)',
                      marginBottom: 3,
                    }}
                  >
                    CLOUD PROVIDER & REGIÓN
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: 'var(--ink)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <span>☁️</span>
                    <span>{cloudProvider}</span>
                  </div>
                </div>

                {/* Staging */}
                <div
                  style={{
                    background: 'var(--bg)',
                    padding: '8px 10px',
                    borderRadius: 4,
                    border: '1px solid var(--border)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 3,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 9,
                        fontWeight: 700,
                        color: 'var(--muted)',
                      }}
                    >
                      STAGING ENDPOINT
                    </span>
                    <span
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 9,
                        fontWeight: 700,
                        background: 'rgba(46, 117, 89, 0.15)',
                        color: '#2E7559',
                        padding: '1px 5px',
                        borderRadius: 3,
                        border: '1px solid #2E7559',
                      }}
                    >
                      ACTIVO
                    </span>
                  </div>
                  <a
                    href={stagingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 11,
                      color: 'var(--terracotta)',
                      textDecoration: 'none',
                      display: 'block',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={stagingUrl}
                  >
                    🌐 {stagingUrl}
                  </a>
                </div>
              </div>

              {/* Stack Tags */}
              <div
                style={{
                  background: 'var(--bg)',
                  padding: '8px 10px',
                  borderRadius: 4,
                  border: '1px solid var(--border)',
                }}
              >
                <div
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 9,
                    fontWeight: 700,
                    color: 'var(--muted)',
                    marginBottom: 6,
                  }}
                >
                  STACK TECNOLÓGICO & HERRAMIENTAS
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {stackTags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 10,
                        fontWeight: 600,
                        background: 'var(--cream2)',
                        color: 'var(--ink)',
                        padding: '2px 8px',
                        borderRadius: 4,
                        border: '1px solid var(--border)',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Runbook / Comandos Rápidos */}
              <div
                style={{
                  background: 'var(--cream2)',
                  padding: '10px 12px',
                  borderRadius: 4,
                  border: '1px solid var(--border)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 6,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 10,
                      fontWeight: 700,
                      color: 'var(--ink)',
                      textTransform: 'uppercase',
                    }}
                  >
                    ⚡ Runbook & Comandos de Inicio
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyRunbook}
                    style={{
                      background: copiedRunbook ? 'rgba(46, 117, 89, 0.15)' : '#fff',
                      color: copiedRunbook ? '#2E7559' : 'var(--ink)',
                      border: copiedRunbook ? '1px solid #2E7559' : '1px solid var(--border)',
                      borderRadius: 4,
                      padding: '2px 8px',
                      fontSize: 10,
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: "'IBM Plex Sans', sans-serif",
                    }}
                  >
                    {copiedRunbook ? '✓ ¡Copiado!' : '📋 Copiar Runbook'}
                  </button>
                </div>
                <pre
                  style={{
                    margin: 0,
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 11,
                    background: 'var(--bg)',
                    padding: '8px 10px',
                    borderRadius: 4,
                    border: '1px solid var(--border)',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    color: 'var(--ink)',
                    lineHeight: 1.45,
                  }}
                >
                  {runbookInstructions}
                </pre>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1px solid var(--border)', textAlign: 'right' }}>
            <button
              type="button"
              onClick={() => {
                onOpenPreview?.({
                  title: `Guía Sandbox & APIs — ${project.title}`,
                  fileType: 'CONFIG',
                  content: `# Guía de Entorno de Desarrollo & Sandbox\n\n**Proyecto:** ${project.title}\n**Pilar:** ${project.pillar || 'N/A'}\n**Lead Técnico:** ${project.tech_lead_name || 'Inmerge Staff'} (${project.tech_lead_contact || 'inmerge3@gmail.com'})\n**Cloud Provider:** ${cloudProvider}\n**Repositorio:** ${repoUrl}\n**Staging:** ${stagingUrl}\n**Stack:** ${stackTags.join(', ')}\n\n## 1. Convenciones de Ramas Git\n- \`main\` -> Producción auditada.\n- \`feature/XYZ\` -> Desarrollos asignados a consultores.\n\n## 2. Runbook de Inicio Rápido\n\`\`\`bash\n${runbookInstructions}\n\`\`\`\n\n## 3. Reglas de Testing & Formato\n- Ejecutar \`npm test\` antes de solicitar homologación de hito.\n- Prohibidos logs o credenciales expuestas en repositorios públicos.`,
                  notes: 'Lineamientos de desarrollo para el equipo asignado.',
                  version: 'v1.0-dev',
                  author: 'Inmerge Engineering',
                });
              }}
              style={{
                background: 'var(--bg)',
                color: 'var(--ink)',
                border: '1px solid var(--border)',
                borderRadius: 4,
                padding: '5px 12px',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: "'IBM Plex Sans', sans-serif",
              }}
            >
              👁️ Previsualizar Guía Sandbox
            </button>
          </div>
        </div>

        {/* 04. Entregables Forenses Auditados */}
        <div
          style={{
            background: '#fff',
            borderRadius: 6,
            border: '1px solid var(--border)',
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 10,
                  fontWeight: 700,
                  background: 'rgba(46, 117, 89, 0.15)',
                  color: '#2E7559',
                  padding: '2px 6px',
                  borderRadius: 4,
                  border: '1px solid #2E7559',
                }}
              >
                04. ENTREGABLES AUDITADOS
              </span>
              <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: "'IBM Plex Mono', monospace" }}>
                {projectDeliverables.length} Archivos
              </span>
            </div>
            <h4 style={{ margin: '0 0 8px', fontSize: 15, color: 'var(--ink)' }}>Informes & Entregables de Salida</h4>
            <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5, margin: 0 }}>
              Documentos de entrega para el cliente, auditorías de código e informes finales con firma digital.
            </p>
          </div>

          <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
            {projectDeliverables.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {projectDeliverables.map((deliv) => {
                  const statusCfg =
                    DELIVERABLE_STATUS_CONFIG[deliv.status || 'PUBLICADO_CLIENTE'] || DELIVERABLE_STATUS_CONFIG.PUBLICADO_CLIENTE;
                  return (
                    <div
                      key={deliv.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: 12,
                        background: 'var(--bg)',
                        padding: '6px 10px',
                        borderRadius: 4,
                        border: '1px solid var(--border)',
                        flexWrap: 'wrap',
                        gap: 8,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span
                          style={{
                            fontWeight: 600,
                            color: 'var(--ink)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: 200,
                          }}
                        >
                          📄 {deliv.title}
                        </span>
                        <span
                          style={{
                            fontFamily: "'IBM Plex Mono', monospace",
                            fontSize: 10,
                            fontWeight: 700,
                            color: statusCfg.color,
                            background: statusCfg.bg,
                            padding: '1px 6px',
                            borderRadius: 4,
                            border: `1px solid ${statusCfg.color}`,
                          }}
                          title={statusCfg.description}
                        >
                          {statusCfg.label}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        {deliv.status === 'BORRADOR_INTERNO' && onUpdateDeliverableStatus && (
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateDeliverableStatus(deliv.id, 'EN_REVISION', {
                                projectId: project.id,
                                title: deliv.title,
                              })
                            }
                            style={{
                              background: 'rgba(216, 168, 78, 0.15)',
                              color: '#9B7322',
                              border: '1px solid var(--gold)',
                              borderRadius: 12,
                              padding: '2px 8px',
                              fontSize: 11,
                              fontWeight: 600,
                              cursor: 'pointer',
                              fontFamily: "'IBM Plex Sans', sans-serif",
                            }}
                          >
                            🚀 Solicitar Revisión
                          </button>
                        )}

                        {isAdmin && deliv.status && deliv.status !== 'PUBLICADO_CLIENTE' && onUpdateDeliverableStatus && (
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateDeliverableStatus(deliv.id, 'PUBLICADO_CLIENTE', {
                                projectId: project.id,
                                title: deliv.title,
                              })
                            }
                            style={{
                              background: 'rgba(74, 156, 106, 0.15)',
                              color: 'var(--green, #2E7559)',
                              border: '1px solid var(--green, #2E7559)',
                              borderRadius: 12,
                              padding: '2px 8px',
                              fontSize: 11,
                              fontWeight: 600,
                              cursor: 'pointer',
                              fontFamily: "'IBM Plex Sans', sans-serif",
                            }}
                          >
                            ✓ Aprobar y Publicar al Cliente
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handlePreviewDeliverable(deliv)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--terracotta)',
                            cursor: 'pointer',
                            fontSize: 11,
                            fontWeight: 600,
                          }}
                        >
                          👁️ Ver
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ fontSize: 11, color: 'var(--muted)', fontStyle: 'italic', textAlign: 'center' }}>
                Sin entregables publicados aún.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
