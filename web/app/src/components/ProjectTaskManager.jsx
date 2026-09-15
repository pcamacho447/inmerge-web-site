import React, { useState } from 'react';
import { TASK_STATUS_CONFIG, TASK_PRIORITY_CONFIG, sanitizeTaskPayload } from '../lib/pm.js';

/**
 * ProjectTaskManager - Gestor Operativo de Tareas Técnicas por Hito
 * Para el Panel de Consultores & Tech Leads (/equipo)
 */
export default function ProjectTaskManager({
  projectId,
  milestones = [],
  tasks = [],
  onTaskCreated,
  onTaskUpdated,
  onTaskDeleted,
}) {
  const [selectedMilestoneId, setSelectedMilestoneId] = useState(milestones[0]?.id || '');
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'TODO',
    priority: 'MEDIA',
    assigned_to_name: '',
    assigned_to_email: '',
    estimated_hours: 4,
    actual_hours: 0,
    weight: 1,
    due_date: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const activeMilestone = milestones.find((m) => String(m.id) === String(selectedMilestoneId)) || milestones[0];
  const activeTasks = (tasks || []).filter((t) => String(t.milestone_id) === String(activeMilestone?.id));

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);
    try {
      const sanitized = sanitizeTaskPayload({
        ...formData,
        project_id: projectId,
        milestone_id: activeMilestone?.id,
      });

      if (onTaskCreated) {
        await onTaskCreated(sanitized);
      }
      setIsAdding(false);
      setFormData({
        title: '',
        description: '',
        status: 'TODO',
        priority: 'MEDIA',
        assigned_to_name: '',
        assigned_to_email: '',
        estimated_hours: 4,
        actual_hours: 0,
        weight: 1,
        due_date: '',
      });
    } catch (err) {
      setErrorMsg(err.message || 'Error al registrar tarea');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    try {
      if (onTaskUpdated) {
        await onTaskUpdated(task.id, {
          status: newStatus,
          completed_at: newStatus === 'DONE' ? new Date().toISOString() : null,
        });
      }
    } catch (err) {
      console.error('Error al actualizar estado de tarea:', err);
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta tarea técnica?')) return;
    try {
      if (onTaskDeleted) {
        await onTaskDeleted(taskId, projectId);
      }
    } catch (err) {
      console.error('Error al eliminar tarea:', err);
    }
  };

  if (!milestones || milestones.length === 0) {
    return (
      <div style={{ padding: 20, color: 'var(--muted)', fontFamily: "'IBM Plex Sans', sans-serif" }}>
        Primero debes definir los hitos del proyecto para asociar tareas técnicas.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Selector de Hitos / Pestañas de Fase */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
        {milestones.map((m, idx) => {
          const isSelected = String(m.id) === String(activeMilestone?.id);
          const mTasksCount = (tasks || []).filter((t) => String(t.milestone_id) === String(m.id)).length;

          return (
            <button
              key={m.id || idx}
              type="button"
              onClick={() => setSelectedMilestoneId(m.id)}
              style={{
                padding: '8px 14px',
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 12,
                fontWeight: isSelected ? 700 : 500,
                background: isSelected ? 'var(--ink)' : 'var(--cream2)',
                color: isSelected ? 'var(--bg)' : 'var(--ink)',
                border: '1px solid var(--border)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span>Fase {m.order_index || idx + 1}: {m.title}</span>
              <span
                style={{
                  background: isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.08)',
                  padding: '1px 6px',
                  borderRadius: 10,
                  fontSize: 10,
                }}
              >
                {mTasksCount}
              </span>
            </button>
          );
        })}
      </div>

      {/* Cabecera de la Fase Seleccionada y Botón Añadir */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          padding: '12px 16px',
          background: 'var(--bg)',
          border: '1px solid var(--border)',
        }}
      >
        <div>
          <h4 style={{ fontFamily: "'Spectral', serif", fontSize: 16, margin: 0, color: 'var(--ink)' }}>
            Tareas de Fase: {activeMilestone?.title}
          </h4>
          <span style={{ fontSize: 12, color: 'var(--muted)', fontFamily: "'IBM Plex Mono', monospace" }}>
            {activeTasks.length} tarea(s) registradas
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsAdding(!isAdding)}
          style={{
            padding: '6px 14px',
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 12,
            background: isAdding ? 'var(--muted)' : 'var(--terracotta)',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          {isAdding ? '✕ Cancelar' : '+ Nueva Tarea Técnica'}
        </button>
      </div>

      {/* Formulario de Nueva Tarea */}
      {isAdding && (
        <form
          onSubmit={handleCreateTask}
          style={{
            padding: 16,
            background: 'var(--cream2)',
            border: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          {errorMsg && (
            <div style={{ color: 'var(--terracotta)', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace" }}>
              {errorMsg}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: 'var(--ink)', marginBottom: 4 }}>
                Título de la Tarea *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Configurar IAM Roles y VPC Peering"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  color: 'var(--ink)',
                  fontSize: 13,
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: 'var(--ink)', marginBottom: 4 }}>
                Consultor Responsable
              </label>
              <input
                type="text"
                placeholder="Ej. Tech Lead / Data Architect"
                value={formData.assigned_to_name}
                onChange={(e) => setFormData({ ...formData, assigned_to_name: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  color: 'var(--ink)',
                  fontSize: 13,
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: 'var(--ink)', marginBottom: 4 }}>
                Prioridad
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  color: 'var(--ink)',
                  fontSize: 13,
                }}
              >
                {Object.values(TASK_PRIORITY_CONFIG).map((p) => (
                  <option key={p.key} value={p.key}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: 'var(--ink)', marginBottom: 4 }}>
                Horas Est.
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={formData.estimated_hours}
                onChange={(e) => setFormData({ ...formData, estimated_hours: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  color: 'var(--ink)',
                  fontSize: 13,
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: 'var(--ink)', marginBottom: 4 }}>
                Peso Ponderado
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  color: 'var(--ink)',
                  fontSize: 13,
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: 'var(--ink)', marginBottom: 4 }}>
                Fecha Límite
              </label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  color: 'var(--ink)',
                  fontSize: 13,
                }}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '8px 16px',
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 12,
                background: 'var(--terracotta)',
                color: '#fff',
                border: 'none',
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontWeight: 700,
              }}
            >
              {submitting ? 'Guardando...' : 'Registrar Tarea'}
            </button>
          </div>
        </form>
      )}

      {/* Lista de Tareas de la Fase */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {activeTasks.length === 0 ? (
          <div
            style={{
              padding: 20,
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              fontSize: 13,
              color: 'var(--muted)',
              textAlign: 'center',
            }}
          >
            No hay tareas técnicas registradas en esta fase todavía.
          </div>
        ) : (
          activeTasks.map((task) => {
            const statusCfg = TASK_STATUS_CONFIG[task.status] || TASK_STATUS_CONFIG.TODO;
            const priorityCfg = TASK_PRIORITY_CONFIG[task.priority] || TASK_PRIORITY_CONFIG.MEDIA;

            return (
              <div
                key={task.id}
                style={{
                  padding: '12px 16px',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 12,
                }}
              >
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 10,
                        fontWeight: 700,
                        color: priorityCfg.color,
                        background: 'rgba(0,0,0,0.04)',
                        padding: '1px 6px',
                        border: '1px solid var(--border)',
                      }}
                    >
                      P: {priorityCfg.label}
                    </span>
                    {task.assigned_to_name && (
                      <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: "'IBM Plex Mono', monospace" }}>
                        👤 {task.assigned_to_name}
                      </span>
                    )}
                    {task.due_date && (
                      <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: "'IBM Plex Mono', monospace" }}>
                        📅 {task.due_date}
                      </span>
                    )}
                  </div>
                  <strong style={{ fontSize: 14, color: 'var(--ink)' }}>{task.title}</strong>
                  {task.description && (
                    <p style={{ fontSize: 12, color: 'var(--muted)', margin: '4px 0 0 0' }}>{task.description}</p>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ textAlign: 'right', fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--muted)' }}>
                    <span>{task.actual_hours || 0}h / {task.estimated_hours || 0}h</span>
                  </div>

                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task, e.target.value)}
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 11,
                      fontWeight: 600,
                      color: statusCfg.color,
                      background: statusCfg.bg,
                      border: `1px solid ${statusCfg.color}`,
                      padding: '4px 8px',
                      cursor: 'pointer',
                    }}
                  >
                    {Object.values(TASK_STATUS_CONFIG).map((st) => (
                      <option key={st.key} value={st.key}>
                        {st.label}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => handleDelete(task.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--muted)',
                      cursor: 'pointer',
                      fontSize: 14,
                      padding: 4,
                    }}
                    title="Eliminar tarea"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
