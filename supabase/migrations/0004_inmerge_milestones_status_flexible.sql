-- ==============================================================================
-- INMERGE CONSULTORÍA & TECNOLOGÍA — MIGRACIÓN 0004
-- FLEXIBILIZACIÓN DE ESTADOS DE HITOS DE PROYECTO (PROJECT_MILESTONES)
-- ==============================================================================

-- Reemplazar el constraint project_milestones_status_check para admitir EN_PROGRESO, EN_PROCESO, COMPLETADO, PENDIENTE y BLOQUEADO
ALTER TABLE IF EXISTS public.project_milestones
  DROP CONSTRAINT IF EXISTS project_milestones_status_check;

ALTER TABLE IF EXISTS public.project_milestones
  ADD CONSTRAINT project_milestones_status_check
  CHECK (status IN ('PENDIENTE', 'EN_PROGRESO', 'EN_PROCESO', 'COMPLETADO', 'BLOQUEADO'));
