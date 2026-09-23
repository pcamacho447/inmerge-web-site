import { TASK_STATUS_CONFIG, TASK_PRIORITY_CONFIG, DELIVERABLE_STATUS_CONFIG } from '../../lib/pm.js';

export default function WorkerCockpitView({ user, projects = [], onTaskUpdated, onSelectProject }) {
  const userEmail = user?.email?.toLowerCase();
  const userName = user?.fullName || user?.email || 'Especialista Inmerge';

  const roleLabels = {
    auditor: 'Auditor de Sistemas & Datos',
    engineer: 'Ingeniero de Software & Cloud',
    admin: 'Arquitecto Principal / Administrador',
  };
  const roleDisplay = roleLabels[user?.role] || 'Consultor Técnico Especialista';

  // Aggregate assigned tasks across all projects
  const myTasks = [];
  projects.forEach((proj) => {
    (proj.tasks || []).forEach((task) => {
      if (task.assigned_to_email?.toLowerCase() === userEmail) {
        myTasks.push({
          ...task,
          projectId: proj.id,
          projectTitle: proj.title,
          projectPillar: proj.pillar,
          parentProject: proj,
        });
      }
    });
  });

  // Aggregate deliverables created by or assigned to the specialist
  const myDeliverables = [];
  projects.forEach((proj) => {
    (proj.deliverables || []).forEach((deliv) => {
      const isDelivAuthor =
        deliv.author_email?.toLowerCase() === userEmail ||
        (deliv.author_name && user?.fullName && deliv.author_name.toLowerCase() === user.fullName.toLowerCase());
      if (isDelivAuthor) {
        myDeliverables.push({
          ...deliv,
          projectId: proj.id,
          projectTitle: proj.title,
          parentProject: proj,
        });
      }
    });
  });

  // Sort tasks: Active first, then by priority (CRITICA -> ALTA -> MEDIA -> BAJA), then due date
  const priorityWeights = { CRITICA: 4, ALTA: 3, MEDIA: 2, BAJA: 1 };
  const sortedTasks = [...myTasks].sort((a, b) => {
    const aDone = a.status === 'DONE';
    const bDone = b.status === 'DONE';
    if (aDone !== bDone) return aDone ? 1 : -1;

    const pA = priorityWeights[a.priority] || 2;
    const pB = priorityWeights[b.priority] || 2;
    if (pA !== pB) return pB - pA;

    if (a.due_date && b.due_date) {
      return a.due_date.localeCompare(b.due_date);
    }
    return a.due_date ? -1 : 1;
  });

  // Metrics
  const activeTasksCount = myTasks.filter((t) => t.status !== 'DONE').length;
  const inReviewDeliverablesCount = myDeliverables.filter((d) => d.status === 'BORRADOR_INTERNO' || d.status === 'EN_REVISION').length;
  const totalActualHours = myTasks.reduce((acc, t) => acc + (Number(t.actual_hours) || 0), 0);
  const totalEstimatedHours = myTasks.reduce((acc, t) => acc + (Number(t.estimated_hours) || 0), 0);

  const handleStatusChange = (task, newStatus) => {
    if (onTaskUpdated) {
      onTaskUpdated(task.id, { status: newStatus }, task.projectId);
    }
  };

  const todayStr = new Intl.DateTimeFormat('es-PE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  return (
    <div className="worker-cockpit-container" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Editorial Welcome Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, var(--ink) 0%, #17100B 100%)',
          color: 'var(--bg)',
          borderRadius: 12,
          padding: '24px 28px',
          border: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 11,
              color: 'var(--gold)',
              letterSpacing: 2,
              textTransform: 'uppercase',
              marginBottom: 6,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span>⚡ ESTACIÓN DE TRABAJO TÉCNICA</span>
            <span>·</span>
            <span>{todayStr}</span>
          </div>
          <h2
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 24,
              fontWeight: 700,
              margin: '0 0 6px 0',
              color: '#F3EADA',
            }}
          >
            {userName}
          </h2>
          <div
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 13,
              color: 'rgba(243, 234, 218, 0.75)',
            }}
          >
            {roleDisplay} · Inmerge Engineering & Audit Desk
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div
            style={{
              background: 'rgba(216, 168, 78, 0.12)',
              border: '1px solid rgba(216, 168, 78, 0.3)',
              borderRadius: 8,
              padding: '8px 14px',
              fontFamily: "'Space Mono', monospace",
              fontSize: 12,
              color: 'var(--gold)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span>⏱️</span>
            <span>SLA Técnico: &lt; 24h</span>
          </div>
          <div
            style={{
              background: 'rgba(74, 156, 106, 0.15)',
              border: '1px solid rgba(74, 156, 106, 0.3)',
              borderRadius: 8,
              padding: '8px 14px',
              fontFamily: "'Space Mono', monospace",
              fontSize: 12,
              color: '#7AC497',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span>✓</span>
            <span>Operatividad: 100%</span>
          </div>
        </div>
      </div>

      {/* Bento Personal KPI Metrics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 16,
        }}
      >
        <div
          style={{
            background: 'var(--cream2)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div
            style={{
              fontSize: 28,
              background: 'rgba(216, 168, 78, 0.2)',
              borderRadius: 10,
              width: 52,
              height: 52,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ⚡
          </div>
          <div>
            <div
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 24,
                fontWeight: 700,
                color: 'var(--ink)',
              }}
            >
              {activeTasksCount} <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 400 }}>/ {myTasks.length}</span>
            </div>
            <div
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--ink)',
              }}
            >
              Mis Tareas Activas
            </div>
          </div>
        </div>

        <div
          style={{
            background: 'var(--cream2)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div
            style={{
              fontSize: 28,
              background: 'rgba(168, 71, 43, 0.15)',
              borderRadius: 10,
              width: 52,
              height: 52,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            📦
          </div>
          <div>
            <div
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 24,
                fontWeight: 700,
                color: 'var(--ink)',
              }}
            >
              {inReviewDeliverablesCount}{' '}
              <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 400 }}>/ {myDeliverables.length}</span>
            </div>
            <div
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--ink)',
              }}
            >
              Mis Entregables en Trámite
            </div>
          </div>
        </div>

        <div
          style={{
            background: 'var(--cream2)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div
            style={{
              fontSize: 28,
              background: 'rgba(74, 156, 106, 0.15)',
              borderRadius: 10,
              width: 52,
              height: 52,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ⏱️
          </div>
          <div>
            <div
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 24,
                fontWeight: 700,
                color: 'var(--ink)',
              }}
            >
              {totalActualHours}h{' '}
              <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 400 }}>/ {totalEstimatedHours}h est.</span>
            </div>
            <div
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--ink)',
              }}
            >
              Horas Imputadas del Mes
            </div>
          </div>
        </div>
      </div>

      {/* Main Dual Workspaces */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 24 }}>
        {/* Mis Tareas Prioritarias */}
        <section
          style={{
            background: 'var(--cream2)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>📋</span>
              <h3 style={{ margin: 0, fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, color: 'var(--ink)' }}>
                Mis Tareas Prioritarias
              </h3>
            </div>
            <span
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 11,
                color: 'var(--muted)',
                background: 'rgba(36, 26, 18, 0.06)',
                padding: '4px 8px',
                borderRadius: 4,
              }}
            >
              {sortedTasks.length} asignadas
            </span>
          </div>

          {sortedTasks.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: 'var(--muted)',
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 14,
                background: 'var(--bg)',
                borderRadius: 8,
                border: '1px dashed var(--border)',
              }}
            >
              <p style={{ margin: '0 0 6px 0', fontWeight: 600 }}>No tienes tareas técnicas asignadas actualmente.</p>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--muted)' }}>
                Buen momento para revisar la bitácora o coordinar con el Tech Lead.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {sortedTasks.map((task) => {
                const priorityConfig = TASK_PRIORITY_CONFIG[task.priority] || TASK_PRIORITY_CONFIG.MEDIA;
                const statusConfig = TASK_STATUS_CONFIG[task.status] || TASK_STATUS_CONFIG.TODO;

                return (
                  <div
                    key={task.id}
                    style={{
                      background: 'var(--bg)',
                      border: '1px solid var(--border)',
                      borderLeft: `4px solid ${priorityConfig.color}`,
                      borderRadius: 8,
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10,
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <div>
                        <div
                          style={{
                            fontFamily: "'Space Mono', monospace",
                            fontSize: 11,
                            color: 'var(--muted)',
                            marginBottom: 4,
                          }}
                        >
                          {task.projectTitle}
                        </div>
                        <h4
                          style={{
                            margin: 0,
                            fontFamily: "'Space Grotesk', sans-serif",
                            fontSize: 15,
                            fontWeight: 600,
                            color: 'var(--ink)',
                            textDecoration: task.status === 'DONE' ? 'line-through' : 'none',
                          }}
                        >
                          {task.title}
                        </h4>
                      </div>

                      <span
                        style={{
                          fontFamily: "'Space Mono', monospace",
                          fontSize: 11,
                          color: priorityConfig.color,
                          fontWeight: 700,
                          border: `1px solid ${priorityConfig.color}`,
                          padding: '2px 6px',
                          borderRadius: 4,
                          textTransform: 'uppercase',
                        }}
                      >
                        {priorityConfig.label}
                      </span>
                    </div>

                    {task.description && (
                      <p
                        style={{
                          margin: 0,
                          fontSize: 13,
                          color: 'var(--muted)',
                          lineHeight: 1.4,
                        }}
                      >
                        {task.description}
                      </p>
                    )}

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 10,
                        marginTop: 4,
                        paddingTop: 8,
                        borderTop: '1px solid var(--border)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                        {task.due_date && (
                          <div
                            style={{
                              fontFamily: "'Space Mono', monospace",
                              fontSize: 11,
                              color: 'var(--ink)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            <span>📅</span>
                            <span>{task.due_date}</span>
                          </div>
                        )}

                        {(task.actual_hours != null || task.estimated_hours != null) && (
                          <div
                            style={{
                              fontFamily: "'Space Mono', monospace",
                              fontSize: 11,
                              color: 'var(--muted)',
                            }}
                          >
                            ⏱️ {task.actual_hours || 0}h / {task.estimated_hours || 0}h
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <select
                          aria-label={`Estado de tarea ${task.title}`}
                          value={task.status || 'TODO'}
                          onChange={(e) => handleStatusChange(task, e.target.value)}
                          style={{
                            fontFamily: "'Space Mono', monospace",
                            fontSize: 11,
                            padding: '4px 8px',
                            borderRadius: 4,
                            border: `1px solid ${statusConfig.color}`,
                            background: statusConfig.bg,
                            color: statusConfig.color,
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          {Object.values(TASK_STATUS_CONFIG).map((cfg) => (
                            <option key={cfg.key} value={cfg.key}>
                              {cfg.label}
                            </option>
                          ))}
                        </select>

                        {onSelectProject && task.parentProject && (
                          <button
                            type="button"
                            onClick={() => onSelectProject(task.parentProject)}
                            style={{
                              background: 'none',
                              border: '1px solid var(--border)',
                              borderRadius: 4,
                              padding: '4px 8px',
                              fontSize: 11,
                              fontFamily: "'Space Grotesk', sans-serif",
                              color: 'var(--ink)',
                              cursor: 'pointer',
                            }}
                            title={`Ver proyecto ${task.projectTitle}`}
                          >
                            Ver en Proyecto →
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Mis Entregables en Trámite */}
        <section
          style={{
            background: 'var(--cream2)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>📦</span>
              <h3 style={{ margin: 0, fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, color: 'var(--ink)' }}>
                Mis Entregables en Trámite & Auditoría
              </h3>
            </div>
            <span
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 11,
                color: 'var(--muted)',
                background: 'rgba(36, 26, 18, 0.06)',
                padding: '4px 8px',
                borderRadius: 4,
              }}
            >
              {myDeliverables.length} registrados
            </span>
          </div>

          {myDeliverables.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: 'var(--muted)',
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 14,
                background: 'var(--bg)',
                borderRadius: 8,
                border: '1px dashed var(--border)',
              }}
            >
              <p style={{ margin: '0 0 6px 0', fontWeight: 600 }}>No tienes entregables técnicos registrados.</p>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--muted)' }}>
                Puedes subir informes preliminares o código desde el Hub de cada proyecto.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {myDeliverables.map((deliv) => {
                const statusConfig = DELIVERABLE_STATUS_CONFIG[deliv.status] || DELIVERABLE_STATUS_CONFIG.BORRADOR_INTERNO;

                return (
                  <div
                    key={deliv.id}
                    style={{
                      background: 'var(--bg)',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <div>
                        <div
                          style={{
                            fontFamily: "'Space Mono', monospace",
                            fontSize: 11,
                            color: 'var(--muted)',
                            marginBottom: 4,
                          }}
                        >
                          {deliv.projectTitle} · {deliv.version || 'v1.0'}
                        </div>
                        <h4
                          style={{
                            margin: 0,
                            fontFamily: "'Space Grotesk', sans-serif",
                            fontSize: 15,
                            fontWeight: 600,
                            color: 'var(--ink)',
                          }}
                        >
                          {deliv.title}
                        </h4>
                      </div>

                      <span
                        style={{
                          fontFamily: "'Space Mono', monospace",
                          fontSize: 11,
                          fontWeight: 600,
                          color: statusConfig.color,
                          background: statusConfig.bg,
                          padding: '3px 8px',
                          borderRadius: 4,
                          border: `1px solid ${statusConfig.color}`,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {statusConfig.label}
                      </span>
                    </div>

                    {deliv.notes && (
                      <p
                        style={{
                          margin: 0,
                          fontSize: 12,
                          color: 'var(--muted)',
                          lineHeight: 1.4,
                        }}
                      >
                        {deliv.notes}
                      </p>
                    )}

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 8,
                        marginTop: 4,
                        paddingTop: 8,
                        borderTop: '1px solid var(--border)',
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "'Space Mono', monospace",
                          fontSize: 11,
                          color: 'var(--muted)',
                        }}
                      >
                        Tipo: {deliv.file_type || deliv.fileType || 'PDF'}
                      </span>

                      {onSelectProject && deliv.parentProject && (
                        <button
                          type="button"
                          onClick={() => onSelectProject(deliv.parentProject)}
                          style={{
                            background: 'none',
                            border: '1px solid var(--border)',
                            borderRadius: 4,
                            padding: '4px 8px',
                            fontSize: 11,
                            fontFamily: "'Space Grotesk', sans-serif",
                            color: 'var(--ink)',
                            cursor: 'pointer',
                          }}
                          title={`Ver proyecto ${deliv.projectTitle}`}
                        >
                          Ver en Proyecto →
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
