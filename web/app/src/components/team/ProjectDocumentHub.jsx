import React from 'react';

/**
 * ProjectDocumentHub — Hub Documental y de Especificaciones del Proyecto
 * Proporciona acceso a TDRs, Arquitectura, Sandbox y Entregables en un solo espacio limpio.
 */
export default function ProjectDocumentHub({ project, deliverables = [], isAdmin = false, onOpenPreview, onUploadClick }) {
  if (!project) return null;

  // Extraer TDR / Descripción del proyecto
  const tdrContent = project.description || 'Sin descripción técnica registrada para este proyecto.';

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

        {isAdmin && onUploadClick && (
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
              <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: "'IBM Plex Mono', monospace" }}>Desarrollo</span>
            </div>
            <h4 style={{ margin: '0 0 8px', fontSize: 15, color: 'var(--ink)' }}>Guía de Conexión & Entorno Sandbox</h4>
            <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5, margin: 0 }}>
              Variables de entorno sin secretos sensibles, convenciones de git, endpoints y reglas de desarrollo.
            </p>
          </div>

          <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1px solid var(--border)', textAlign: 'right' }}>
            <button
              type="button"
              onClick={() => {
                onOpenPreview?.({
                  title: `Guía Sandbox & APIs — ${project.title}`,
                  fileType: 'CONFIG',
                  content: `# Guía de Entorno de Desarrollo & Sandbox\n\n**Lead Técnico:** ${project.tech_lead_name || 'Inmerge Staff'} (${project.tech_lead_contact || 'inmerge3@gmail.com'})\n\n## 1. Convenciones de Ramas Git\n- \`main\` -> Producción auditada.\n- \`feature/XYZ\` -> Desarrollos asignados a consultores.\n\n## 2. Reglas de Testing & Formato\n- Ejecutar \`npm test\` antes de solicitar homologación de hito.\n- Prohibidos logs o credenciales expuestas.`,
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {projectDeliverables.slice(0, 3).map((deliv) => (
                  <div
                    key={deliv.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: 12,
                      background: 'var(--bg)',
                      padding: '4px 8px',
                      borderRadius: 4,
                      border: '1px solid var(--border)',
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 600,
                        color: 'var(--ink)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: 220,
                      }}
                    >
                      📄 {deliv.title}
                    </span>
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
                ))}
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
