import React, { useState, useMemo } from 'react';
import { TASK_STATUS_CONFIG, HEALTH_STATUS_CONFIG } from '../lib/pm.js';

/**
 * ProjectGantt - Diagrama de Cronograma Gantt Interactivo Nativo
 * Sistema de Diseño: Editorial Tech Premium (Inmerge)
 */
export default function ProjectGantt({
  project = {},
  milestones = [],
  tasks = [],
  showTasks = true,
  isExecutive = false,
}) {
  const [zoomMode, setZoomMode] = useState('WEEK'); // 'WEEK' | 'MONTH'
  const [hoveredItem, setHoveredItem] = useState(null);
  const [expandedMilestones, setExpandedMilestones] = useState(() => {
    const initial = {};
    (milestones || []).forEach((m) => {
      initial[m.id] = true;
    });
    return initial;
  });

  const toggleMilestone = (mId) => {
    setExpandedMilestones((prev) => ({
      ...prev,
      [mId]: !prev[mId],
    }));
  };

  // 1. Determinar el rango de fechas global del proyecto
  const { minDate, maxDate, totalDays, timelineData } = useMemo(() => {
    const now = new Date();
    const dates = [];

    if (project.start_date) dates.push(new Date(project.start_date));
    if (project.target_end_date) dates.push(new Date(project.target_end_date));
    if (project.created_at) dates.push(new Date(project.created_at));

    milestones.forEach((m) => {
      if (m.start_date) dates.push(new Date(m.start_date));
      if (m.due_date) dates.push(new Date(m.due_date));
    });

    tasks.forEach((t) => {
      if (t.due_date) dates.push(new Date(t.due_date));
      if (t.created_at) dates.push(new Date(t.created_at));
    });

    dates.push(now);

    let start = new Date(Math.min(...dates.map((d) => d.getTime())));
    let end = new Date(Math.max(...dates.map((d) => d.getTime())));

    // Asegurar un margen de 3 días antes y después
    start = new Date(start.getTime() - 86400000 * 3);
    end = new Date(end.getTime() + 86400000 * 5);

    const diffDays = Math.max(7, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));

    // Estructurar items con posiciones
    const items = [];

    milestones.forEach((m, idx) => {
      const mStart = m.start_date ? new Date(m.start_date) : new Date(project.start_date || project.created_at || start);
      const mEnd = m.due_date ? new Date(m.due_date) : new Date(mStart.getTime() + 86400000 * 14);

      const mStartDays = Math.max(0, Math.floor((mStart - start) / (1000 * 60 * 60 * 24)));
      const mDurationDays = Math.max(1, Math.ceil((mEnd - mStart) / (1000 * 60 * 60 * 24)));

      const mLeftPct = (mStartDays / diffDays) * 100;
      const mWidthPct = Math.min(100 - mLeftPct, (mDurationDays / diffDays) * 100);

      const mTasks = (tasks || []).filter((t) => String(t.milestone_id) === String(m.id));

      items.push({
        type: 'milestone',
        id: m.id || `m-${idx}`,
        data: m,
        title: m.title,
        orderIndex: m.order_index || idx + 1,
        status: m.status,
        startDate: mStart.toISOString().split('T')[0],
        endDate: mEnd.toISOString().split('T')[0],
        leftPct: mLeftPct,
        widthPct: Math.max(3, mWidthPct),
        tasksCount: mTasks.length,
        assignedTo: m.assigned_to_name,
      });

      if (showTasks && expandedMilestones[m.id]) {
        mTasks.forEach((t, tIdx) => {
          const tStart = t.created_at ? new Date(t.created_at) : mStart;
          const tEnd = t.due_date ? new Date(t.due_date) : mEnd;

          const tStartDays = Math.max(0, Math.floor((tStart - start) / (1000 * 60 * 60 * 24)));
          const tDurationDays = Math.max(1, Math.ceil((tEnd - tStart) / (1000 * 60 * 60 * 24)));

          const tLeftPct = (tStartDays / diffDays) * 100;
          const tWidthPct = Math.min(100 - tLeftPct, (tDurationDays / diffDays) * 100);

          items.push({
            type: 'task',
            id: t.id || `t-${tIdx}`,
            milestoneId: m.id,
            data: t,
            title: t.title,
            status: t.status,
            priority: t.priority,
            assignedTo: t.assigned_to_name,
            hours: t.actual_hours || t.estimated_hours,
            startDate: tStart.toISOString().split('T')[0],
            endDate: tEnd.toISOString().split('T')[0],
            leftPct: tLeftPct,
            widthPct: Math.max(2.5, tWidthPct),
          });
        });
      }
    });

    // Calcular posición de hoy
    const nowDays = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    const todayLeftPct = Math.min(100, Math.max(0, (nowDays / diffDays) * 100));

    // Generar marcadores de cuadrícula
    const gridCols = [];
    const step = zoomMode === 'WEEK' ? 7 : 14;
    for (let d = 0; d < diffDays; d += step) {
      const curDate = new Date(start.getTime() + d * 86400000);
      const label =
        zoomMode === 'WEEK'
          ? `${curDate.getDate()} ${curDate.toLocaleDateString('es-PE', { month: 'short' })}`
          : curDate.toLocaleDateString('es-PE', { month: 'short', year: '2-digit' });
      gridCols.push({
        leftPct: (d / diffDays) * 100,
        label,
      });
    }

    return {
      minDate: start,
      maxDate: end,
      totalDays: diffDays,
      timelineData: items,
      todayLeftPct,
      gridCols,
    };
  }, [project, milestones, tasks, showTasks, expandedMilestones, zoomMode]);

  if (!milestones || milestones.length === 0) {
    return (
      <div
        style={{
          padding: '24px',
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontSize: 14,
          color: 'var(--muted)',
          textAlign: 'center',
        }}
      >
        No hay hitos de cronograma definidos para generar el diagrama de Gantt.
      </div>
    );
  }

  const healthCfg = HEALTH_STATUS_CONFIG[project.health_status || 'ON_TRACK'] || HEALTH_STATUS_CONFIG.ON_TRACK;

  return (
    <div
      style={{
        background: 'var(--bg)',
        border: '1px solid var(--border)',
        padding: '20px',
        position: 'relative',
      }}
    >
      {/* Header / Controles del Gantt */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 16,
          paddingBottom: 12,
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span
            style={{
              fontFamily: "'Spectral', serif",
              fontSize: 16,
              fontWeight: 700,
              color: 'var(--ink)',
            }}
          >
            Cronograma del Proyecto
          </span>
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11,
              fontWeight: 600,
              color: healthCfg.color,
              background: healthCfg.badgeBg,
              padding: '2px 8px',
              border: `1px solid ${healthCfg.color}`,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            {healthCfg.icon} {healthCfg.label}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            onClick={() => setZoomMode('WEEK')}
            style={{
              padding: '4px 10px',
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11,
              background: zoomMode === 'WEEK' ? 'var(--ink)' : 'var(--cream2)',
              color: zoomMode === 'WEEK' ? 'var(--bg)' : 'var(--ink)',
              border: '1px solid var(--border)',
              cursor: 'pointer',
            }}
          >
            Semanas
          </button>
          <button
            type="button"
            onClick={() => setZoomMode('MONTH')}
            style={{
              padding: '4px 10px',
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11,
              background: zoomMode === 'MONTH' ? 'var(--ink)' : 'var(--cream2)',
              color: zoomMode === 'MONTH' ? 'var(--bg)' : 'var(--ink)',
              border: '1px solid var(--border)',
              cursor: 'pointer',
            }}
          >
            Meses
          </button>
        </div>
      </div>

      {/* Contenedor del Gráfico Gantt */}
      <div style={{ overflowX: 'auto', width: '100%', position: 'relative' }}>
        <div style={{ minWidth: 640 }}>
          {/* Cabecera de fechas */}
          <div
            style={{
              display: 'flex',
              height: 28,
              borderBottom: '1px solid var(--border)',
              position: 'relative',
              marginBottom: 8,
            }}
          >
            <div
              style={{
                width: isExecutive ? 220 : 280,
                flexShrink: 0,
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 11,
                color: 'var(--muted)',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              Fases & Tareas
            </div>
            <div style={{ flex: 1, position: 'relative' }}>
              {timelineData.gridCols &&
                timelineData.gridCols.map((col, idx) => (
                  <div
                    key={idx}
                    style={{
                      position: 'absolute',
                      left: `${col.leftPct}%`,
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 10,
                      color: 'var(--muted)',
                      transform: 'translateX(-50%)',
                    }}
                  >
                    {col.label}
                  </div>
                ))}
            </div>
          </div>

          {/* Filas del Gantt */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, position: 'relative' }}>
            {/* Línea vertical de HOY */}
            <div
              style={{
                position: 'absolute',
                left: `calc(${isExecutive ? '220px' : '280px'} + (100% - ${isExecutive ? '220px' : '280px'}) * ${timelineData.todayLeftPct / 100})`,
                top: 0,
                bottom: 0,
                width: 2,
                background: 'var(--terracotta)',
                zIndex: 3,
                pointerEvents: 'none',
              }}
              title="Hoy"
            >
              <span
                style={{
                  position: 'absolute',
                  top: -18,
                  left: -16,
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 9,
                  background: 'var(--terracotta)',
                  color: '#fff',
                  padding: '1px 4px',
                  borderRadius: 2,
                }}
              >
                HOY
              </span>
            </div>

            {timelineData.map((item) => {
              const isMilestone = item.type === 'milestone';
              const isCompleted = item.status === 'COMPLETADO' || item.status === 'DONE';
              const isInProgress = item.status === 'EN_PROGRESO' || item.status === 'EN_PROCESO' || item.status === 'IN_PROGRESS';
              const isBlocked = item.status === 'BLOQUEADO' || item.status === 'BLOCKED';

              const barColor = isCompleted
                ? 'var(--green, #4A9C6A)'
                : isBlocked
                  ? 'var(--terracotta, #A8472B)'
                  : isInProgress
                    ? 'var(--gold, #D8A84E)'
                    : 'var(--muted, #7A6B58)';

              return (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    minHeight: isMilestone ? 36 : 28,
                    background: isMilestone ? 'var(--cream2)' : 'transparent',
                    border: isMilestone ? '1px solid var(--border)' : 'none',
                    padding: '2px 8px',
                    position: 'relative',
                  }}
                  onMouseEnter={() => setHoveredItem(item)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  {/* Nombre y toggle */}
                  <div
                    style={{
                      width: isExecutive ? 220 : 280,
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      paddingLeft: isMilestone ? 0 : 20,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {isMilestone && showTasks && item.tasksCount > 0 && (
                      <button
                        type="button"
                        onClick={() => toggleMilestone(item.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 0,
                          fontSize: 10,
                          color: 'var(--ink)',
                          fontFamily: 'monospace',
                        }}
                      >
                        {expandedMilestones[item.id] ? '▼' : '▶'}
                      </button>
                    )}

                    <span
                      style={{
                        fontFamily: isMilestone ? "'Spectral', serif" : "'IBM Plex Sans', sans-serif",
                        fontSize: isMilestone ? 13 : 12,
                        fontWeight: isMilestone ? 700 : 400,
                        color: 'var(--ink)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={item.title}
                    >
                      {isMilestone ? `Fase ${item.orderIndex}: ${item.title}` : `↳ ${item.title}`}
                    </span>
                  </div>

                  {/* Barra de Tiempo Gantt */}
                  <div style={{ flex: 1, position: 'relative', height: '100%', minHeight: 24, display: 'flex', alignItems: 'center' }}>
                    {/* Líneas de cuadrícula de fondo */}
                    {timelineData.gridCols &&
                      timelineData.gridCols.map((col, cIdx) => (
                        <div
                          key={cIdx}
                          style={{
                            position: 'absolute',
                            left: `${col.leftPct}%`,
                            top: 0,
                            bottom: 0,
                            width: 1,
                            background: 'rgba(122, 107, 88, 0.08)',
                            pointerEvents: 'none',
                          }}
                        />
                      ))}

                    {/* Barra de progreso */}
                    <div
                      style={{
                        position: 'absolute',
                        left: `${item.leftPct}%`,
                        width: `${item.widthPct}%`,
                        height: isMilestone ? 16 : 10,
                        background: barColor,
                        borderRadius: 2,
                        opacity: isMilestone ? 0.9 : 0.75,
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                        transition: 'all 0.2s ease',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tooltip de Detalle al pasar el cursor */}
      {hoveredItem && (
        <div
          style={{
            marginTop: 12,
            padding: '8px 14px',
            background: 'var(--ink)',
            color: 'var(--bg)',
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 11,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <div>
            <strong>{hoveredItem.title}</strong> — {hoveredItem.type === 'milestone' ? 'Hito' : 'Tarea Técnica'}
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <span>Inicio: {hoveredItem.startDate}</span>
            <span>Meta: {hoveredItem.endDate}</span>
            <span>Estado: {hoveredItem.status}</span>
            {hoveredItem.assignedTo && <span>Resp: {hoveredItem.assignedTo}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
