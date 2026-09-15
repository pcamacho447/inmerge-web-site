-- Migración 0008: Asignación de Encargado / Responsable de Equipo Interno a Hitos
-- Inmerge - Editorial Tech Premium

-- 1. Agregar columnas de asignación de consultor/encargado en project_milestones
ALTER TABLE IF EXISTS public.project_milestones
  ADD COLUMN IF NOT EXISTS assigned_to_name TEXT,
  ADD COLUMN IF NOT EXISTS assigned_to_email TEXT,
  ADD COLUMN IF NOT EXISTS assigned_to_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_project_milestones_assigned_to ON public.project_milestones(assigned_to_id);
