-- Migración 0018: Gestión de Leads TDR y Portal de Clientes (Proyectos, Hitos y Entregables)
-- Inmerge Consultoría y Tecnología

-- 1. Tabla de Solicitudes de Cotización / Leads TDR
CREATE TABLE IF NOT EXISTS public.leads_tdr (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  pillar TEXT NOT NULL CHECK (pillar IN ('auditoria', 'desarrollo', 'datos', 'integral', 'Especificado', 'otro')),
  full_name TEXT,
  company TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  timeline TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'NUEVO' CHECK (status IN ('NUEVO', 'EN_REVISION', 'CONTACTADO', 'PROPUESTA_ENVIADA', 'CERRADO_GANADO', 'DESCARTADO')),
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT
);

-- Índices para leads_tdr
CREATE INDEX IF NOT EXISTS idx_leads_tdr_created_at ON public.leads_tdr (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_tdr_status ON public.leads_tdr (status);
CREATE INDEX IF NOT EXISTS idx_leads_tdr_pillar ON public.leads_tdr (pillar);

-- RLS para leads_tdr
ALTER TABLE public.leads_tdr ENABLE ROW LEVEL SECURITY;

-- Cualquier visitante (anónimo o autenticado) puede enviar un lead / cotización
CREATE POLICY "Public insert leads_tdr"
  ON public.leads_tdr
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Solo administradores autenticados o con rol especial pueden consultar leads
CREATE POLICY "Admin select leads_tdr"
  ON public.leads_tdr
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'auditor', 'engineer')
    )
  );


-- 2. Tabla de Proyectos de Clientes (Auditoría, Desarrollo, Datos)
CREATE TABLE IF NOT EXISTS public.client_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  pillar TEXT NOT NULL CHECK (pillar IN ('auditoria', 'desarrollo', 'datos', 'integral')),
  status TEXT NOT NULL DEFAULT 'EN_PLANIFICACION' CHECK (status IN ('EN_PLANIFICACION', 'EN_AUDITORIA', 'EN_DESARROLLO', 'EN_VALIDACION', 'ENTREGADO', 'FINALIZADO')),
  start_date DATE DEFAULT CURRENT_DATE,
  target_completion_date DATE,
  actual_completion_date DATE,
  description TEXT,
  tech_lead_name TEXT,
  tech_lead_contact TEXT
);

CREATE INDEX IF NOT EXISTS idx_client_projects_client_id ON public.client_projects (client_id);
CREATE INDEX IF NOT EXISTS idx_client_projects_status ON public.client_projects (status);

ALTER TABLE public.client_projects ENABLE ROW LEVEL SECURITY;

-- Un cliente solo puede ver sus propios proyectos asignados
CREATE POLICY "Clients can view own projects"
  ON public.client_projects
  FOR SELECT
  TO authenticated
  USING (client_id = auth.uid());


-- 3. Tabla de Hitos de Proyecto (Milestones)
CREATE TABLE IF NOT EXISTS public.project_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  project_id UUID NOT NULL REFERENCES public.client_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'PENDIENTE' CHECK (status IN ('PENDIENTE', 'EN_PROGRESO', 'COMPLETADO')),
  order_index INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_project_milestones_project_id ON public.project_milestones (project_id, order_index);

ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;

-- Clientes ven hitos de proyectos que les pertenecen
CREATE POLICY "Clients can view milestones of own projects"
  ON public.project_milestones
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.client_projects
      WHERE client_projects.id = project_milestones.project_id
        AND client_projects.client_id = auth.uid()
    )
  );


-- 4. Tabla de Entregables e Informes Técnicos Privados
CREATE TABLE IF NOT EXISTS public.project_deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  project_id UUID NOT NULL REFERENCES public.client_projects(id) ON DELETE CASCADE,
  milestone_id UUID REFERENCES public.project_milestones(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('PDF', 'DASHBOARD_URL', 'REPO', 'DATASET', 'DOCUMENTO')),
  file_path TEXT,
  external_url TEXT,
  version TEXT DEFAULT 'v1.0',
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_project_deliverables_project_id ON public.project_deliverables (project_id);

ALTER TABLE public.project_deliverables ENABLE ROW LEVEL SECURITY;

-- Clientes ven entregables de sus propios proyectos
CREATE POLICY "Clients can view deliverables of own projects"
  ON public.project_deliverables
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.client_projects
      WHERE client_projects.id = project_deliverables.project_id
        AND client_projects.client_id = auth.uid()
    )
  );

-- Grants
GRANT INSERT ON public.leads_tdr TO anon, authenticated;
GRANT SELECT ON public.leads_tdr TO authenticated;
GRANT SELECT ON public.client_projects TO authenticated;
GRANT SELECT ON public.project_milestones TO authenticated;
GRANT SELECT ON public.project_deliverables TO authenticated;
