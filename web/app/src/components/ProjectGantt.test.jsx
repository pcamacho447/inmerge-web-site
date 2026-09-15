import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProjectGantt from './ProjectGantt.jsx';

describe('ProjectGantt.jsx Component', () => {
  const mockProject = {
    id: 'p-1',
    title: 'Auditoría de Datos Cloud',
    health_status: 'ON_TRACK',
    start_date: '2026-09-01',
    target_end_date: '2026-10-15',
  };

  const mockMilestones = [
    {
      id: 'm-1',
      title: 'Diagnóstico e Ingesta Forense',
      order_index: 1,
      status: 'COMPLETADO',
      start_date: '2026-09-01',
      due_date: '2026-09-15',
    },
    {
      id: 'm-2',
      title: 'Modelado y Detección de Anomalías',
      order_index: 2,
      status: 'EN_PROGRESO',
      start_date: '2026-09-16',
      due_date: '2026-10-01',
    },
  ];

  const mockTasks = [
    {
      id: 't-1',
      milestone_id: 'm-2',
      title: 'Pipeline de profiling en BigQuery',
      status: 'DONE',
      assigned_to_name: 'Tech Lead',
      due_date: '2026-09-20',
    },
  ];

  it('renders fallback when no milestones are provided', () => {
    render(<ProjectGantt project={mockProject} milestones={[]} />);
    expect(screen.getByText(/No hay hitos de cronograma definidos/i)).toBeInTheDocument();
  });

  it('renders gantt headers, health badge and milestone bars', () => {
    render(<ProjectGantt project={mockProject} milestones={mockMilestones} tasks={mockTasks} />);
    expect(screen.getByText('Cronograma del Proyecto')).toBeInTheDocument();
    expect(screen.getByText(/En Tiempo/i)).toBeInTheDocument();
    expect(screen.getByText(/Fase 1: Diagnóstico e Ingesta Forense/i)).toBeInTheDocument();
    expect(screen.getByText(/Fase 2: Modelado y Detección de Anomalías/i)).toBeInTheDocument();
  });

  it('allows toggling zoom mode between Semanas and Meses', () => {
    render(<ProjectGantt project={mockProject} milestones={mockMilestones} tasks={mockTasks} />);
    const monthBtn = screen.getByRole('button', { name: /Meses/i });
    fireEvent.click(monthBtn);
    expect(monthBtn).toHaveStyle({ background: 'var(--ink)' });
  });
});
