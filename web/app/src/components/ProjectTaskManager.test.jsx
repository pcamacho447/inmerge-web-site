import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProjectTaskManager from './ProjectTaskManager.jsx';
import ProjectRiskManager from './ProjectRiskManager.jsx';

describe('PM Components - ProjectTaskManager & ProjectRiskManager', () => {
  const mockMilestones = [
    { id: 'm-1', title: 'Diagnóstico e Ingesta', order_index: 1 },
    { id: 'm-2', title: 'Modelado Predictivo', order_index: 2 },
  ];

  const mockTasks = [
    {
      id: 't-1',
      milestone_id: 'm-1',
      title: 'Validación de esquema SQL',
      status: 'TODO',
      priority: 'ALTA',
      assigned_to_name: 'Tech Lead',
      estimated_hours: 6,
      actual_hours: 2,
    },
  ];

  const mockRisks = [
    {
      id: 'r-1',
      title: 'Falta acceso a GCP BigQuery',
      severity: 'ALTA',
      status: 'ABIERTO',
      impact: 'Retraso de 2 días',
      mitigation_plan: 'Solicitar credenciales IAM',
    },
  ];

  describe('ProjectTaskManager', () => {
    it('renders phase tabs and registered tasks', () => {
      render(<ProjectTaskManager projectId="p-1" milestones={mockMilestones} tasks={mockTasks} />);

      expect(screen.getByText(/Fase 1: Diagnóstico e Ingesta/i)).toBeInTheDocument();
      expect(screen.getByText('Validación de esquema SQL')).toBeInTheDocument();
      expect(screen.getByText(/👤 Tech Lead/i)).toBeInTheDocument();
    });

    it('toggles new task form and submits', async () => {
      const onTaskCreated = vi.fn();
      render(<ProjectTaskManager projectId="p-1" milestones={mockMilestones} tasks={mockTasks} onTaskCreated={onTaskCreated} />);

      const addBtn = screen.getByRole('button', { name: /\+ Nueva Tarea Técnica/i });
      fireEvent.click(addBtn);

      const input = screen.getByPlaceholderText(/Ej. Configurar IAM Roles y VPC Peering/i);
      fireEvent.change(input, { target: { value: 'Nueva Tarea de Test' } });

      const submitBtn = screen.getByRole('button', { name: /Registrar Tarea/i });
      fireEvent.click(submitBtn);

      expect(onTaskCreated).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Nueva Tarea de Test',
          project_id: 'p-1',
          milestone_id: 'm-1',
        }),
      );
    });

    it('allows editing actual hours dedicated to a task', async () => {
      const onTaskUpdated = vi.fn();
      render(<ProjectTaskManager projectId="p-1" milestones={mockMilestones} tasks={mockTasks} onTaskUpdated={onTaskUpdated} />);

      const hoursInput = screen.getByLabelText(/Horas reales para Validación de esquema SQL/i);
      expect(hoursInput.value).toBe('2');

      fireEvent.change(hoursInput, { target: { value: '5.5' } });
      fireEvent.blur(hoursInput);

      expect(onTaskUpdated).toHaveBeenCalledWith('t-1', {
        actual_hours: 5.5,
      });
    });

    it('allows assigning a staff member directly via inline selector', async () => {
      const onTaskUpdated = vi.fn();
      const mockStaffList = [{ id: 's-1', full_name: 'Ana Auditora', email: 'ana@inmerge.pe', role: 'auditor' }];
      render(
        <ProjectTaskManager
          projectId="p-1"
          milestones={mockMilestones}
          tasks={mockTasks}
          staffList={mockStaffList}
          onTaskUpdated={onTaskUpdated}
        />,
      );

      const assignSelect = screen.getByLabelText(/Asignar consultor para tarea Validación de esquema SQL/i);
      expect(assignSelect).toBeInTheDocument();

      fireEvent.change(assignSelect, { target: { value: 'ana@inmerge.pe' } });

      expect(onTaskUpdated).toHaveBeenCalledWith('t-1', {
        assigned_to_name: 'Ana Auditora',
        assigned_to_email: 'ana@inmerge.pe',
      });
    });

    it('requires two clicks to confirm deletion of a task without window.confirm', async () => {
      const onTaskDeleted = vi.fn();
      render(<ProjectTaskManager projectId="p-1" milestones={mockMilestones} tasks={mockTasks} onTaskDeleted={onTaskDeleted} />);

      const deleteBtn = screen.getByTitle('Eliminar tarea');
      expect(deleteBtn).toBeInTheDocument();

      // First click: enters confirmation mode
      fireEvent.click(deleteBtn);
      expect(onTaskDeleted).not.toHaveBeenCalled();
      expect(screen.getByText('Confirmar')).toBeInTheDocument();

      // Second click: triggers deletion
      fireEvent.click(screen.getByText('Confirmar'));
      expect(onTaskDeleted).toHaveBeenCalledWith('t-1', 'p-1');
    });
  });

  describe('ProjectRiskManager', () => {
    it('renders risks and displays severity', () => {
      render(<ProjectRiskManager projectId="p-1" milestones={mockMilestones} risks={mockRisks} />);

      expect(screen.getByText('Matriz de Riesgos & Bloqueos Técnicos')).toBeInTheDocument();
      expect(screen.getByText('Falta acceso a GCP BigQuery')).toBeInTheDocument();
      expect(screen.getByText(/ALTO/i)).toBeInTheDocument();
      expect(screen.getByText(/Retraso de 2 días/i)).toBeInTheDocument();
    });
  });
});
