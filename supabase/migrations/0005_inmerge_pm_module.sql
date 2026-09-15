-- Migración 0005: Módulo de Gestión y Seguimiento de Proyectos (PM Profesional)
-- Inmerge - Editorial Tech Premium

-- 1. Ampliar client_projects con campos de cronograma y salud RAG
ALTER TABLE IF EXISTS public.client_projects
  ADD COLUMN IF NOT EXISTS health_status TEXT DEFAULT 'ON_TRACK'
    CHECK (health_status IN ('ON_TRACK', 'AT_RISK', 'DELAYED', 'BLOCKED')),
  ADD COLUMN IF NOT EXISTS start_date DATE DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS target_end_date DATE;

-- 2. Ampliar project_milestones con fechas y peso ponderado
ALTER TABLE IF EXISTS public.project_milestones
  ADD COLUMN IF NOT EXISTS start_date DATE,
  ADD COLUMN IF NOT EXISTS weight INTEGER DEFAULT 1 CHECK (weight >= 1);

-- 3. Crear tabla project_tasks (Desglose de tareas técnicas por hito)
CREATE TABLE IF NOT EXISTS public.project_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.client_projects(id) ON DELETE CASCADE,
  milestone_id UUID REFERENCES public.project_milestones(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'TODO'
    CHECK (status IN ('TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'BLOCKED')),
  priority TEXT NOT NULL DEFAULT 'MEDIA'
    CHECK (priority IN ('BAJA', 'MEDIA', 'ALTA', 'CRITICA')),
  assigned_to_name TEXT,
  assigned_to_email TEXT,
  estimated_hours NUMERIC(6, 2) DEFAULT 0,
  actual_hours NUMERIC(6, 2) DEFAULT 0,
  weight INTEGER NOT NULL DEFAULT 1 CHECK (weight >= 1),
  due_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_tasks_project_id ON public.project_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_milestone_id ON public.project_tasks(milestone_id);

-- 4. Crear tabla project_risks (Gestión de bloqueos e impedimentos técnicos)
CREATE TABLE IF NOT EXISTS public.project_risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.client_projects(id) ON DELETE CASCADE,
  milestone_id UUID REFERENCES public.project_milestones(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT NOT NULL DEFAULT 'MEDIA'
    CHECK (severity IN ('BAJA', 'MEDIA', 'ALTA', 'CRITICA')),
  status TEXT NOT NULL DEFAULT 'ABIERTO'
    CHECK (status IN ('ABIERTO', 'EN_MITIGACION', 'RESUELTO')),
  impact TEXT,
  mitigation_plan TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_risks_project_id ON public.project_risks(project_id);

-- 5. Habilitar RLS en las nuevas tablas
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_risks ENABLE ROW LEVEL SECURITY;

-- 5.1 Políticas RLS para project_tasks
DROP POLICY IF EXISTS "Lectura publica o autenticada de project_tasks" ON public.project_tasks;
CREATE POLICY "Lectura publica o autenticada de project_tasks"
  ON public.project_tasks
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Equipo puede gestionar project_tasks" ON public.project_tasks;
CREATE POLICY "Equipo puede gestionar project_tasks"
  ON public.project_tasks
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 5.2 Políticas RLS para project_risks
DROP POLICY IF EXISTS "Lectura publica o autenticada de project_risks" ON public.project_risks;
CREATE POLICY "Lectura publica o autenticada de project_risks"
  ON public.project_risks
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Equipo puede gestionar project_risks" ON public.project_risks;
CREATE POLICY "Equipo puede gestionar project_risks"
  ON public.project_risks
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 6. Configurar Replica Identity y Publicación Realtime
ALTER TABLE public.project_tasks REPLICA IDENTITY FULL;
ALTER TABLE public.project_risks REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.project_tasks, public.project_risks;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;
