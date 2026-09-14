import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useDocumentHead from '../hooks/useDocumentHead.js';
import Footer from '../components/Footer.jsx';
import ProjectTimeline from '../components/ProjectTimeline.jsx';
import useClientProjects from '../hooks/useClientProjects.js';
import { useAuth } from '../lib/auth.jsx';
import { waLink } from '../data/content.js';
import { getSignedDeliverableUrl } from '../lib/projects.js';

const PILLAR_LABELS = {
  auditoria: '01. Auditoría Técnica & Datos',
  desarrollo: '02. Desarrollo Cloud & AWS',
  datos: '03. Datos & IA',
  integral: 'Solución Integral',
};

const DELIVERABLE_TYPE_BADGES = {
  PDF: { label: 'PDF / INFORME', bg: 'rgba(168, 71, 43, 0.1)', text: 'var(--terracotta)', border: 'var(--terracotta)' },
  DASHBOARD_URL: { label: 'DASHBOARD BI', bg: 'rgba(216, 168, 78, 0.15)', text: '#9B7322', border: 'var(--gold)' },
  REPO: { label: 'REPOSITORIO GIT', bg: 'rgba(36, 26, 18, 0.08)', text: 'var(--ink)', border: 'var(--border)' },
  DATASET: { label: 'DATASET / CSV', bg: 'rgba(46, 117, 89, 0.12)', text: '#2E7559', border: '#2E7559' },
  DOCUMENTO: { label: 'DOCUMENTO', bg: 'rgba(0,0,0,0.05)', text: 'var(--muted)', border: 'var(--border)' },
};

export default function Cuenta() {
  useDocumentHead({ title: 'Portal de Clientes — Inmerge', path: '/cuenta', noIndex: true });
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { projects, loading, error, refreshProjects } = useClientProjects();
  const [downloadingId, setDownloadingId] = useState(null);

  if (!user) return null;

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  async function handleDownload(deliverable) {
    if (deliverable.external_url) {
      window.open(deliverable.external_url, '_blank');
      return;
    }

    if (!deliverable.file_path) return;

    setDownloadingId(deliverable.id);
    try {
      const url = await getSignedDeliverableUrl(deliverable.file_path);
      if (url) {
        window.open(url, '_blank');
      }
    } catch (err) {
      alert(`No se pudo descargar el archivo: ${err.message}`);
    } finally {
      setDownloadingId(null);
    }
  }

  const supportWaUrl = waLink(
    `Hola Inmerge, soy cliente registrado con correo ${user.email}. Deseo consultar sobre el estado de mis proyectos y auditorías.`,
  );

  return (
    <>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '120px clamp(20px,5vw,40px) 80px' }}>
        {/* Header Bar */}
        <div
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 16, marginBottom: 8 }}
        >
          <div>
            <div
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 12,
                color: 'var(--terracotta)',
                letterSpacing: 2,
                marginBottom: 6,
                fontWeight: 600,
              }}
            >
              PORTAL DE CLIENTES
            </div>
            <h1 style={{ fontFamily: "'Spectral',serif", fontWeight: 700, fontSize: 'clamp(32px,5vw,44px)', margin: 0 }}>
              Panel de Proyectos & Auditoría
            </h1>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="btn-outline-hover"
            style={{
              background: 'none',
              border: '1px solid var(--border)',
              color: 'var(--ink)',
              borderRadius: 20,
              padding: '9px 20px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: "'IBM Plex Sans',sans-serif",
            }}
          >
            Cerrar sesión
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 40, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 15, color: 'var(--muted)' }}>
            Sesión activa: <strong style={{ color: 'var(--ink)' }}>{user.email}</strong>
          </div>
          {user.isStaff && (
            <Link
              to="/equipo"
              style={{
                fontSize: 13,
                fontFamily: "'IBM Plex Mono', monospace",
                fontWeight: 600,
                color: 'var(--terracotta)',
                textDecoration: 'none',
                background: 'var(--cream2)',
                padding: '6px 14px',
                borderRadius: 4,
                border: '1px solid var(--terracotta)',
              }}
            >
              Ir al Panel de Equipo (/equipo) →
            </Link>
          )}
        </div>

        {/* Loading and Error States */}
        {loading && (
          <div
            style={{ padding: 32, background: 'var(--cream2)', border: '1px solid var(--border)', textAlign: 'center', marginBottom: 32 }}
          >
            <div style={{ fontSize: 15, color: 'var(--muted)' }}>Cargando proyectos y estado de auditorías...</div>
          </div>
        )}

        {error && (
          <div
            style={{
              padding: 20,
              background: 'rgba(208, 138, 110, 0.15)',
              border: '1px solid var(--rose)',
              color: 'var(--rose)',
              marginBottom: 32,
            }}
          >
            <div>Error al sincronizar con el servidor: {error}</div>
            <button
              type="button"
              onClick={refreshProjects}
              style={{
                marginTop: 10,
                background: 'none',
                border: '1px solid var(--rose)',
                color: 'var(--rose)',
                padding: '6px 14px',
                cursor: 'pointer',
              }}
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Projects Section */}
        {!loading && !error && projects.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32, marginBottom: 48 }}>
            <div
              style={{
                fontSize: 13,
                letterSpacing: 2,
                color: 'var(--terracotta)',
                fontWeight: 600,
                fontFamily: "'IBM Plex Mono', monospace",
              }}
            >
              PROYECTOS ACTIVOS ({projects.length})
            </div>

            {projects.map((project) => {
              const totalMilestones = project.milestones?.length || 0;
              const completedMilestones = project.milestones?.filter((m) => m.status === 'COMPLETADO').length || 0;
              const progressPct = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

              const techLeadWaMsg = `Hola Inmerge, soy cliente del proyecto "${project.title}". Deseo consultar sobre el estado y próximos entregables.`;
              const techLeadWaUrl = waLink(techLeadWaMsg);

              return (
                <div
                  key={project.id}
                  style={{
                    background: 'var(--cream2)',
                    border: '1px solid var(--border)',
                    padding: 'clamp(24px, 4vw, 36px)',
                    borderRadius: 8,
                    boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
                  }}
                >
                  {/* Project Header */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      flexWrap: 'wrap',
                      gap: 12,
                      marginBottom: 16,
                      borderBottom: '1px solid var(--border)',
                      paddingBottom: 16,
                    }}
                  >
                    <div>
                      <span
                        style={{
                          fontFamily: "'IBM Plex Mono', monospace",
                          fontSize: 11,
                          letterSpacing: 1,
                          textTransform: 'uppercase',
                          color: 'var(--terracotta)',
                          display: 'block',
                          marginBottom: 4,
                          fontWeight: 600,
                        }}
                      >
                        Pilar: {PILLAR_LABELS[project.pillar] || project.pillar}
                      </span>
                      <h2
                        style={{
                          fontFamily: "'Spectral', serif",
                          fontSize: 'clamp(22px, 3vw, 28px)',
                          fontWeight: 700,
                          margin: 0,
                          color: 'var(--ink)',
                        }}
                      >
                        {project.title}
                      </h2>
                    </div>

                    <span
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 12,
                        padding: '4px 12px',
                        background: 'var(--bg)',
                        border: '1px solid var(--border)',
                        color: 'var(--ink)',
                        fontWeight: 600,
                        borderRadius: 4,
                      }}
                    >
                      Estado: {project.status}
                    </span>
                  </div>

                  {project.description && (
                    <p style={{ fontSize: 14, color: 'var(--ink)', lineHeight: 1.6, margin: '0 0 20px 0', whiteSpace: 'pre-line' }}>
                      {project.description}
                    </p>
                  )}

                  {/* Progress Indicator */}
                  <div
                    style={{
                      background: 'var(--bg)',
                      border: '1px solid var(--border)',
                      padding: '16px 20px',
                      borderRadius: 6,
                      marginBottom: 24,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: 13,
                        fontFamily: "'IBM Plex Mono', monospace",
                        marginBottom: 8,
                      }}
                    >
                      <span>
                        Progreso del Proyecto: <strong>{completedMilestones} de {totalMilestones} hitos completados</strong>
                      </span>
                      <span style={{ fontWeight: 700, color: 'var(--terracotta)', fontSize: 14 }}>{progressPct}%</span>
                    </div>
                    <div style={{ width: '100%', height: 8, background: 'var(--cream2)', borderRadius: 4, overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${progressPct}%`,
                          height: '100%',
                          background: 'var(--terracotta)',
                          transition: 'width 0.4s ease',
                        }}
                      />
                    </div>
                  </div>

                  {/* Tech Lead Bar with WhatsApp */}
                  {project.tech_lead_name && (
                    <div
                      style={{
                        background: 'var(--bg)',
                        border: '1px solid var(--border)',
                        padding: '14px 18px',
                        fontSize: 13,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 12,
                        marginBottom: 28,
                        borderRadius: 6,
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: 'var(--muted)', marginBottom: 2 }}>
                          LÍDER TÉCNICO ASIGNADO:
                        </div>
                        <strong style={{ color: 'var(--ink)', fontSize: 14 }}>{project.tech_lead_name}</strong>
                        {project.tech_lead_contact && (
                          <span style={{ marginLeft: 8, color: 'var(--muted)', fontSize: 12 }}>({project.tech_lead_contact})</span>
                        )}
                      </div>

                      <a
                        href={techLeadWaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          background: '#25D366',
                          color: '#fff',
                          padding: '7px 16px',
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 600,
                          textDecoration: 'none',
                          fontFamily: "'IBM Plex Sans', sans-serif",
                        }}
                      >
                        💬 Contactar Tech Lead
                      </a>
                    </div>
                  )}

                  {/* Milestones Timeline */}
                  <div style={{ marginBottom: 32 }}>
                    <h3 style={{ fontFamily: "'Spectral', serif", fontSize: 20, fontWeight: 700, margin: '0 0 12px 0' }}>
                      Hitos & Fases de Entrega
                    </h3>
                    <ProjectTimeline milestones={project.milestones} />
                  </div>

                  {/* Deliverables List */}
                  {project.deliverables && project.deliverables.length > 0 && (
                    <div>
                      <h3 style={{ fontFamily: "'Spectral', serif", fontSize: 20, fontWeight: 700, margin: '0 0 12px 0' }}>
                        Entregables & Informes Técnicos ({project.deliverables.length})
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {project.deliverables.map((del) => {
                          const badge = DELIVERABLE_TYPE_BADGES[del.file_type] || DELIVERABLE_TYPE_BADGES.DOCUMENTO;
                          return (
                            <div
                              key={del.id}
                              style={{
                                background: 'var(--bg)',
                                border: '1px solid var(--border)',
                                padding: '16px 20px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: 14,
                                borderRadius: 6,
                              }}
                            >
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                  <span
                                    style={{
                                      fontFamily: "'IBM Plex Mono', monospace",
                                      fontSize: 10,
                                      padding: '2px 8px',
                                      borderRadius: 4,
                                      background: badge.bg,
                                      color: badge.text,
                                      border: `1px solid ${badge.border}`,
                                      fontWeight: 700,
                                    }}
                                  >
                                    {badge.label}
                                  </span>
                                  <span
                                    style={{
                                      fontFamily: "'IBM Plex Mono', monospace",
                                      fontSize: 11,
                                      color: 'var(--muted)',
                                    }}
                                  >
                                    {del.version || 'v1.0'}
                                  </span>
                                </div>
                                <strong style={{ fontSize: 15, color: 'var(--ink)' }}>{del.title}</strong>
                                {del.notes && (
                                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{del.notes}</div>
                                )}
                              </div>

                              <button
                                type="button"
                                onClick={() => handleDownload(del)}
                                disabled={downloadingId === del.id}
                                style={{
                                  background: 'var(--terracotta)',
                                  color: '#F3EADA',
                                  border: 'none',
                                  padding: '8px 18px',
                                  fontSize: 12,
                                  fontWeight: 600,
                                  borderRadius: 20,
                                  cursor: downloadingId === del.id ? 'wait' : 'pointer',
                                  opacity: downloadingId === del.id ? 0.7 : 1,
                                }}
                                className="btn-accent"
                              >
                                {downloadingId === del.id
                                  ? 'Generando enlace...'
                                  : del.external_url
                                  ? 'Abrir Enlace ↗'
                                  : 'Descargar Archivo ↓'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State when no projects assigned */}
        {!loading && !error && projects.length === 0 && (
          <div
            style={{
              background: 'var(--cream2)',
              border: '1px solid var(--border)',
              padding: '36px clamp(20px, 4vw, 48px)',
              marginBottom: 40,
              borderRadius: 8,
            }}
          >
            <div
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 11,
                color: 'var(--terracotta)',
                letterSpacing: 1.5,
                marginBottom: 8,
              }}
            >
              ESTADO DE PROYECTOS
            </div>
            <h2 style={{ fontFamily: "'Spectral', serif", fontSize: 24, fontWeight: 700, margin: '0 0 12px 0' }}>
              Bienvenido a tu Portal de Clientes
            </h2>
            <p style={{ fontSize: 15, color: 'var(--muted)', lineHeight: 1.6, margin: '0 0 24px 0' }}>
              Aún no tienes un proyecto o auditoría asignada a este correo. Una vez formalizado el TDR o iniciada la consultoría, aquí se
              publicarán tus hitos, métricas en vivo, accesos a repositorios e informes técnicos privados.
            </p>

            <div
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                padding: 20,
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 16,
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)' }}>¿Deseas iniciar una auditoría o desarrollo?</div>
                <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
                  Envíanos el alcance de tu requerimiento para agendar la llamada técnica.
                </div>
              </div>
              <Link
                to="/contacto"
                style={{
                  background: 'var(--terracotta)',
                  color: '#F3EADA',
                  padding: '10px 20px',
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
                className="btn-accent"
              >
                Solicitar Cotización TDR
              </Link>
            </div>
          </div>
        )}

        {/* Quick Navigation Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          <Link
            to="/servicios"
            style={{
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              padding: 24,
              borderRadius: 6,
              textDecoration: 'none',
              color: 'var(--ink)',
              display: 'block',
            }}
            className="card-hover"
          >
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--terracotta)', marginBottom: 6 }}>
              SERVICIOS
            </div>
            <div style={{ fontFamily: "'Spectral', serif", fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Explorar Catálogo</div>
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>Revisa los 3 pilares: Auditoría, Desarrollo Cloud y Ciencia de Datos.</div>
          </Link>

          <Link
            to="/metodologia"
            style={{
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              padding: 24,
              borderRadius: 6,
              textDecoration: 'none',
              color: 'var(--ink)',
              display: 'block',
            }}
            className="card-hover"
          >
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--terracotta)', marginBottom: 6 }}>
              ARQUITECTURA
            </div>
            <div style={{ fontFamily: "'Spectral', serif", fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Stack & Metodología</div>
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>
              Conoce los estándares de seguridad, pipelines y tecnologías aplicadas.
            </div>
          </Link>

          <a
            href={supportWaUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              padding: 24,
              borderRadius: 6,
              textDecoration: 'none',
              color: 'var(--ink)',
              display: 'block',
            }}
            className="card-hover"
          >
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--terracotta)', marginBottom: 6 }}>
              SOPORTE
            </div>
            <div style={{ fontFamily: "'Spectral', serif", fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Contacto Directo</div>
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>Comunícate directamente con tu equipo técnico por WhatsApp.</div>
          </a>
        </div>
      </div>

      <Footer />
    </>
  );
}
