import { describe, it, expect } from 'vitest';
import {
  calculateMilestoneProgress,
  calculateProjectProgress,
  calculateProjectHours,
  deriveProjectHealth,
  sanitizeTaskPayload,
  sanitizeRiskPayload,
  HEALTH_STATUS_CONFIG,
  TASK_STATUS_CONFIG,
  TASK_PRIORITY_CONFIG,
} from './pm.js';

describe('pm.js - Project Management Engine', () => {
  describe('Configs & Constants', () => {
    it('provides valid configurations for health, task and priority statuses', () => {
      expect(HEALTH_STATUS_CONFIG.ON_TRACK.label).toBe('En Tiempo');
      expect(TASK_STATUS_CONFIG.DONE.label).toBe('Completada');
      expect(TASK_PRIORITY_CONFIG.CRITICA.label).toBe('Crítica');
    });
  });

  describe('calculateMilestoneProgress', () => {
    it('returns fallback progress based on milestone status when no tasks exist', () => {
      expect(calculateMilestoneProgress({ id: 'm1', status: 'COMPLETADO' }, [])).toBe(100);
      expect(calculateMilestoneProgress({ id: 'm1', status: 'EN_PROGRESO' }, [])).toBe(50);
      expect(calculateMilestoneProgress({ id: 'm1', status: 'PENDIENTE' }, [])).toBe(0);
    });

    it('calculates weighted progress correctly based on tasks', () => {
      const milestone = { id: 'm1', status: 'EN_PROGRESO' };
      const tasks = [
        { milestone_id: 'm1', status: 'DONE', weight: 1 },
        { milestone_id: 'm1', status: 'TODO', weight: 1 },
      ];
      expect(calculateMilestoneProgress(milestone, tasks)).toBe(50);
    });

    it('handles weighted tasks and partial statuses (REVIEW, IN_PROGRESS)', () => {
      const milestone = { id: 'm1' };
      const tasks = [
        { milestone_id: 'm1', status: 'DONE', weight: 2 }, // 2
        { milestone_id: 'm1', status: 'REVIEW', weight: 1 }, // 0.8
        { milestone_id: 'm1', status: 'IN_PROGRESS', weight: 1 }, // 0.4
        { milestone_id: 'm1', status: 'TODO', weight: 1 }, // 0
      ];
      // Total weight = 5. Completed = 3.2 / 5 = 64%
      expect(calculateMilestoneProgress(milestone, tasks)).toBe(64);
    });
  });

  describe('calculateProjectProgress', () => {
    it('returns 0 for empty milestones and tasks', () => {
      expect(calculateProjectProgress([], [])).toBe(0);
    });

    it('calculates weighted progress across multiple milestones', () => {
      const milestones = [
        { id: 'm1', status: 'COMPLETADO', weight: 1 }, // 100% * 1 = 100
        { id: 'm2', status: 'PENDIENTE', weight: 3 }, // 0% * 3 = 0
      ];
      // Total weight = 4. Progress = 100/4 = 25%
      expect(calculateProjectProgress(milestones, [])).toBe(25);
    });
  });

  describe('calculateProjectHours', () => {
    it('aggregates estimated vs actual hours', () => {
      const tasks = [
        { estimated_hours: 12.5, actual_hours: 14.0 },
        { estimated_hours: 8.0, actual_hours: 6.5 },
      ];
      const result = calculateProjectHours(tasks);
      expect(result.estimatedHours).toBe(20.5);
      expect(result.actualHours).toBe(20.5);
      expect(result.varianceHours).toBe(0);
    });
  });

  describe('deriveProjectHealth', () => {
    it('identifies BLOCKED if there are active critical risks', () => {
      const project = { health_status: 'ON_TRACK' };
      const risks = [{ status: 'ABIERTO', severity: 'CRITICA', title: 'Falta acceso a AWS' }];
      expect(deriveProjectHealth(project, [], risks)).toBe('BLOCKED');
    });

    it('identifies DELAYED if past target_end_date and not completed', () => {
      const pastDate = new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0];
      const project = { health_status: 'ON_TRACK', target_end_date: pastDate, progress: 40 };
      expect(deriveProjectHealth(project, [], [])).toBe('DELAYED');
    });
  });

  describe('Sanitizers', () => {
    it('sanitizes task payloads safely', () => {
      const payload = {
        title: '   Configurar VPC y Subnets  ',
        project_id: 'p1',
        status: 'IN_PROGRESS',
        priority: 'ALTA',
        estimated_hours: '15.5',
        actual_hours: '10',
        weight: '2',
      };
      const clean = sanitizeTaskPayload(payload);
      expect(clean.title).toBe('Configurar VPC y Subnets');
      expect(clean.estimated_hours).toBe(15.5);
      expect(clean.weight).toBe(2);
      expect(clean.status).toBe('IN_PROGRESS');
    });

    it('sanitizes risk payloads safely', () => {
      const payload = {
        title: 'Credenciales de BigQuery expiradas',
        project_id: 'p1',
        severity: 'CRITICA',
        status: 'ABIERTO',
      };
      const clean = sanitizeRiskPayload(payload);
      expect(clean.title).toBe('Credenciales de BigQuery expiradas');
      expect(clean.severity).toBe('CRITICA');
      expect(clean.status).toBe('ABIERTO');
    });
  });

  describe('fetchProjectAnalytics', () => {
    it('calculates project analytics metrics correctly with local project fallback', async () => {
      const { fetchProjectAnalytics } = await import('./pm.js');

      const localData = {
        tasks: [
          { status: 'DONE', estimated_hours: 10, actual_hours: 8 },
          { status: 'IN_PROGRESS', estimated_hours: 15, actual_hours: 12 },
          { status: 'TODO', estimated_hours: 5, actual_hours: 0, due_date: '2020-01-01' }, // Overdue
        ],
        milestones: [{ status: 'COMPLETED' }, { status: 'PENDING' }],
        risks: [{ status: 'ABIERTO' }],
      };

      const metrics = await fetchProjectAnalytics('proj-123', localData);
      expect(metrics.total_tasks).toBe(3);
      expect(metrics.completed_tasks).toBe(1);
      expect(metrics.in_progress_tasks).toBe(1);
      expect(metrics.overdue_tasks).toBe(1);
      expect(metrics.total_estimated_hours).toBe(30);
      expect(metrics.total_actual_hours).toBe(20);
      expect(metrics.effort_variance_pct).toBe(-33.33);
      expect(metrics.total_milestones).toBe(2);
      expect(metrics.completed_milestones).toBe(1);
      expect(metrics.open_risks_count).toBe(1);
    });
  });
});
