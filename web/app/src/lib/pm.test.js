import { describe, it, expect } from 'vitest';
import {
  calculateMilestoneProgress,
  calculateProjectProgress,
  calculateProjectHours,
  calculateAggregatedProjectMetrics,
  deriveProjectHealth,
  sanitizeTaskPayload,
  sanitizeRiskPayload,
  HEALTH_STATUS_CONFIG,
  TASK_STATUS_CONFIG,
  TASK_PRIORITY_CONFIG,
  DELIVERABLE_STATUS_CONFIG,
  FINDING_SEVERITY_CONFIG,
  FINDING_CATEGORY_CONFIG,
  FINDING_STATUS_CONFIG,
  sanitizeDeliverablePayload,
  sanitizeFindingPayload,
} from './pm.js';

describe('pm.js - Project Management Engine', () => {
  describe('Configs & Constants', () => {
    it('provides valid configurations for health, task and priority statuses', () => {
      expect(HEALTH_STATUS_CONFIG.ON_TRACK.label).toBe('En Tiempo');
      expect(TASK_STATUS_CONFIG.DONE.label).toBe('Completada');
      expect(TASK_PRIORITY_CONFIG.CRITICA.label).toBe('Crítica');
      expect(DELIVERABLE_STATUS_CONFIG.BORRADOR_INTERNO).toBeDefined();
      expect(DELIVERABLE_STATUS_CONFIG.PUBLICADO_CLIENTE).toBeDefined();
      expect(FINDING_SEVERITY_CONFIG.CRITICA).toBeDefined();
      expect(FINDING_CATEGORY_CONFIG.CORE_WEB_VITALS).toBeDefined();
      expect(FINDING_STATUS_CONFIG.DETECTADO).toBeDefined();
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

    it('valida estados de entregables y asigna BORRADOR_INTERNO por defecto si no es válido', () => {
      expect(DELIVERABLE_STATUS_CONFIG.BORRADOR_INTERNO).toBeDefined();
      expect(DELIVERABLE_STATUS_CONFIG.PUBLICADO_CLIENTE).toBeDefined();

      expect(() => sanitizeDeliverablePayload(null)).toThrow('Payload de entregable inválido');
      expect(() => sanitizeDeliverablePayload({})).toThrow('El título del entregable es obligatorio.');

      const sanitized = sanitizeDeliverablePayload({
        title: 'Reporte de Auditoría Cloud',
        fileType: 'PDF',
        status: 'INVALID_STATUS',
      });

      expect(sanitized.title).toBe('Reporte de Auditoría Cloud');
      expect(sanitized.status).toBe('BORRADOR_INTERNO');
      expect(sanitized.version).toBe('v1.0');
      expect(sanitized.file_type).toBe('PDF');
    });

    it('valida campos obligatorios y sanitiza payload de hallazgo forense', () => {
      expect(() => sanitizeFindingPayload(null)).toThrow('Payload de hallazgo inválido');
      expect(() => sanitizeFindingPayload({})).toThrow('El título del hallazgo es obligatorio');

      const sanitized = sanitizeFindingPayload({
        project_id: 'proj-123',
        title: 'Vulnerabilidad CSRF en endpoint de órdenes',
        category: 'SEGURIDAD_OWASP',
        severity: 'CRITICA',
        status: 'DETECTADO',
        finding_code: 'FIND-SEC-01',
        evidence_notes: 'Token no validado en POST /orders',
        recommendation: 'Implementar SameSite y double-submit cookie token.',
      });

      expect(sanitized.title).toBe('Vulnerabilidad CSRF en endpoint de órdenes');
      expect(sanitized.category).toBe('SEGURIDAD_OWASP');
      expect(sanitized.severity).toBe('CRITICA');
      expect(sanitized.finding_code).toBe('FIND-SEC-01');
      expect(sanitized.status).toBe('DETECTADO');
      expect(sanitized.evidence_notes).toBe('Token no validado en POST /orders');
      expect(sanitized.recommendation).toBe('Implementar SameSite y double-submit cookie token.');
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
        findings: [
          { severity: 'CRITICA', status: 'DETECTADO' },
          { severity: 'ALTA', status: 'EN_CORRECCION' },
          { severity: 'MEDIA', status: 'DETECTADO' },
          { severity: 'CRITICA', status: 'VERIFICADO' },
        ],
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
      expect(metrics.open_critical_findings_count).toBe(2);
    });

    it('returns null if projectId is null or undefined', async () => {
      const { fetchProjectAnalytics } = await import('./pm.js');
      expect(await fetchProjectAnalytics(null)).toBeNull();
      expect(await fetchProjectAnalytics(undefined)).toBeNull();
    });
  });

  describe('calculateAggregatedProjectMetrics', () => {
    it('handles null, undefined, and empty array gracefully', () => {
      const expectedEmpty = {
        totalProjects: 0,
        totalTasks: 0,
        completedTasks: 0,
        completionPct: 0,
        estimatedHours: 0,
        actualHours: 0,
        varianceHours: 0,
        publishedDeliverablesCount: 0,
        healthCounts: {
          ON_TRACK: 0,
          AT_RISK: 0,
          DELAYED: 0,
          BLOCKED: 0,
        },
      };

      expect(calculateAggregatedProjectMetrics()).toEqual(expectedEmpty);
      expect(calculateAggregatedProjectMetrics(null)).toEqual(expectedEmpty);
      expect(calculateAggregatedProjectMetrics(undefined)).toEqual(expectedEmpty);
      expect(calculateAggregatedProjectMetrics([])).toEqual(expectedEmpty);
    });

    it('aggregates metrics across multiple projects accurately in a single pass O(N)', () => {
      const sampleProjects = [
        {
          id: 'proj-1',
          health_status: 'ON_TRACK',
          tasks: [
            { id: 't-1', status: 'DONE', estimated_hours: 10, actual_hours: 8 },
            { id: 't-2', status: 'IN_PROGRESS', estimated_hours: 15, actual_hours: 12 },
          ],
          deliverables: [
            { id: 'd-1', status: 'PUBLICADO_CLIENTE' },
            { id: 'd-2', status: 'BORRADOR_INTERNO' },
          ],
        },
        {
          id: 'proj-2',
          health_status: 'AT_RISK',
          tasks: [
            { id: 't-3', status: 'DONE', estimated_hours: 5, actual_hours: 6.5 },
            { id: 't-4', status: 'TODO', estimated_hours: 10.5, actual_hours: 0 },
          ],
          deliverables: [
            { id: 'd-3', status: 'PUBLICADO_CLIENTE' },
            { id: 'd-4', title: 'Informe de Arquitectura' }, // No explicit status -> counts as published
          ],
        },
        {
          id: 'proj-3',
          health_status: 'DELAYED',
          tasks: [],
          deliverables: [],
        },
        {
          id: 'proj-4',
          health_status: 'BLOCKED',
          tasks: [{ id: 't-5', status: 'BLOCKED', estimated_hours: 4.5, actual_hours: 1.5 }],
          deliverables: [{ id: 'd-5', status: 'EN_REVISION' }],
        },
      ];

      const metrics = calculateAggregatedProjectMetrics(sampleProjects);

      expect(metrics.totalProjects).toBe(4);
      expect(metrics.totalTasks).toBe(5);
      expect(metrics.completedTasks).toBe(2);
      expect(metrics.completionPct).toBe(40);
      expect(metrics.estimatedHours).toBe(45);
      expect(metrics.actualHours).toBe(28);
      expect(metrics.varianceHours).toBe(-17);
      expect(metrics.publishedDeliverablesCount).toBe(3);
      expect(metrics.healthCounts).toEqual({
        ON_TRACK: 1,
        AT_RISK: 1,
        DELAYED: 1,
        BLOCKED: 1,
      });
    });

    it('supports projects with project_tasks and project_deliverables database fields', () => {
      const dbProjects = [
        {
          id: 'proj-raw',
          // health_status omitted -> defaults to ON_TRACK
          project_tasks: [{ id: 't-raw-1', status: 'DONE', estimated_hours: 20, actual_hours: 22 }],
          project_deliverables: [
            { id: 'd-raw-1', status: 'PUBLICADO_CLIENTE' },
            { id: 'd-raw-2', status: 'BORRADOR_INTERNO' },
          ],
        },
      ];

      const metrics = calculateAggregatedProjectMetrics(dbProjects);

      expect(metrics.totalProjects).toBe(1);
      expect(metrics.totalTasks).toBe(1);
      expect(metrics.completedTasks).toBe(1);
      expect(metrics.completionPct).toBe(100);
      expect(metrics.estimatedHours).toBe(20);
      expect(metrics.actualHours).toBe(22);
      expect(metrics.varianceHours).toBe(2);
      expect(metrics.publishedDeliverablesCount).toBe(1);
      expect(metrics.healthCounts.ON_TRACK).toBe(1);
    });

    it('handles non-numeric values, string numbers, and null items defensively', () => {
      const noisyProjects = [
        null,
        {
          health_status: 'UNKNOWN_STATUS',
          tasks: [
            null,
            { status: 'DONE', estimated_hours: '12.5', actual_hours: '14.2' },
            { status: 'TODO', estimated_hours: null, actual_hours: undefined },
          ],
          deliverables: [null, { status: null }],
        },
      ];

      const metrics = calculateAggregatedProjectMetrics(noisyProjects);

      expect(metrics.totalProjects).toBe(1);
      expect(metrics.totalTasks).toBe(2);
      expect(metrics.completedTasks).toBe(1);
      expect(metrics.completionPct).toBe(50);
      expect(metrics.estimatedHours).toBe(12.5);
      expect(metrics.actualHours).toBe(14.2);
      expect(metrics.varianceHours).toBe(1.7);
      expect(metrics.publishedDeliverablesCount).toBe(1);
      expect(metrics.healthCounts.UNKNOWN_STATUS).toBe(1);
      expect(metrics.healthCounts.ON_TRACK).toBe(0);
    });
  });
});
