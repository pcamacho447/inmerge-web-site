-- Migración 0010: Campos de Estado para Entregables Asimétricos y Tabla de Hallazgos Forenses
-- Inmerge - Editorial Tech Premium

-- 1. Ampliar project_deliverables con campos de estado de aprobación y autoría
ALTER TABLE IF EXISTS public.project_deliverables
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'PUBLICADO_CLIENTE'
    CHECK (status IN ('BORRADOR_INTERNO', 'EN_REVISION', 'PUBLICADO_CLIENTE')),
  ADD COLUMN IF NOT EXISTS author_name TEXT,
  ADD COLUMN IF NOT EXISTS author_email TEXT;

-- 2. Crear tabla project_findings (Matriz de Hallazgos Forenses de Auditoría)
CREATE TABLE IF NOT EXISTS public.project_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.client_projects(id) ON DELETE CASCADE,
  milestone_id UUID REFERENCES public.project_milestones(id) ON DELETE SET NULL,
  finding_code TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'CORE_WEB_VITALS'
    CHECK (category IN ('CORE_WEB_VITALS', 'DATOS_CLOUD', 'SEGURIDAD_OWASP', 'ARQUITECTURA_CLOUD', 'CALIDAD_CODIGO')),
  severity TEXT NOT NULL DEFAULT 'MEDIA'
    CHECK (severity IN ('CRITICA', 'ALTA', 'MEDIA', 'BAJA', 'INFORMATIVA')),
  status TEXT NOT NULL DEFAULT 'DETECTADO'
    CHECK (status IN ('DETECTADO', 'EN_CORRECCION', 'VERIFICADO')),
  evidence_notes TEXT,
  recommendation TEXT,
  created_by_name TEXT,
  created_by_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_findings_project_id ON public.project_findings(project_id);

-- 3. Habilitar RLS en project_findings
ALTER TABLE public.project_findings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lectura publica o autenticada de project_findings" ON public.project_findings;
CREATE POLICY "Lectura publica o autenticada de project_findings"
  ON public.project_findings
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Equipo puede gestionar project_findings" ON public.project_findings;
CREATE POLICY "Equipo puede gestionar project_findings"
  ON public.project_findings
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 4. Replica Identity y Publicación Realtime
ALTER TABLE public.project_findings REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.project_findings;
  END IF;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;
