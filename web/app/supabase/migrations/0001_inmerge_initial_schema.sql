  -- ==============================================================================
  -- INMERGE — ESQUEMA INICIAL DE BASE DE DATOS (SUPABASE / POSTGRESQL 16)
  -- Consultoría en Auditoría Técnica, Desarrollo Cloud & Ciencia de Datos
  -- ==============================================================================

  -- ------------------------------------------------------------------------------
  -- 1. EXTENSIONES REQUERIDAS
  -- ------------------------------------------------------------------------------
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  CREATE EXTENSION IF NOT EXISTS "pgcrypto";

  -- ------------------------------------------------------------------------------
  -- 2. TABLA DE PERFILES DE USUARIO (PROFILES)
  -- Extiende auth.users con roles y datos organizacionales
  -- ------------------------------------------------------------------------------
  CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    company TEXT,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'client',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  -- Garantizar columnas si la tabla profiles ya existía previamente en Supabase
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company TEXT;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'client';
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

  -- Garantizar la restricción de roles válidos
  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'profiles_role_check'
    ) THEN
      ALTER TABLE public.profiles 
      ADD CONSTRAINT profiles_role_check 
      CHECK (role IN ('client', 'auditor', 'engineer', 'admin'));
    END IF;
  END $$;

  CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles (role);
  CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles (email);

  -- Funciones de seguridad (SECURITY DEFINER) para evitar recursión infinita en RLS
  CREATE OR REPLACE FUNCTION public.is_staff()
  RETURNS BOOLEAN AS $$
    SELECT EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'auditor', 'engineer')
    );
  $$ LANGUAGE sql STABLE SECURITY DEFINER;

  CREATE OR REPLACE FUNCTION public.is_admin()
  RETURNS BOOLEAN AS $$
    SELECT EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    );
  $$ LANGUAGE sql STABLE SECURITY DEFINER;

  ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

  -- Políticas RLS para Profiles
  DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
  CREATE POLICY "profiles_select_own"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id OR public.is_staff());

  DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
  CREATE POLICY "profiles_update_own"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id OR public.is_admin())
    WITH CHECK (auth.uid() = id OR public.is_admin());

  DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
  CREATE POLICY "profiles_insert_own"
    ON public.profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id OR public.is_admin());

  -- Trigger para sincronizar automáticamente nuevos usuarios registrados en auth.users
  CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS TRIGGER AS $$
  BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
      new.id,
      new.email,
      COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
      COALESCE(new.raw_user_meta_data->>'role', 'client')
    )
    ON CONFLICT (id) DO UPDATE
    SET
      email = EXCLUDED.email,
      full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
      updated_at = now();
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;

  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
  CREATE TRIGGER on_auth_user_created
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


  -- ------------------------------------------------------------------------------
  -- 3. TABLA DE SOLICITUDES DE COTIZACIÓN Y LEADS TDR (LEADS_TDR)
  -- Captura requerimientos desde el formulario web
  -- ------------------------------------------------------------------------------
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
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    notes TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_leads_tdr_created_at ON public.leads_tdr (created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_leads_tdr_status ON public.leads_tdr (status);
  CREATE INDEX IF NOT EXISTS idx_leads_tdr_pillar ON public.leads_tdr (pillar);

  ALTER TABLE public.leads_tdr ENABLE ROW LEVEL SECURITY;

  -- Permite a cualquier visitante (anónimo o autenticado) registrar una solicitud
  DROP POLICY IF EXISTS "Public insert leads_tdr" ON public.leads_tdr;
  CREATE POLICY "Public insert leads_tdr"
    ON public.leads_tdr
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

  -- Solo administradores y miembros del equipo técnico pueden ver y gestionar leads
  DROP POLICY IF EXISTS "Team select leads_tdr" ON public.leads_tdr;
  CREATE POLICY "Team select leads_tdr"
    ON public.leads_tdr
    FOR SELECT
    TO authenticated
    USING (public.is_staff());

  DROP POLICY IF EXISTS "Team update leads_tdr" ON public.leads_tdr;
  CREATE POLICY "Team update leads_tdr"
    ON public.leads_tdr
    FOR UPDATE
    TO authenticated
    USING (public.is_staff());


  -- ------------------------------------------------------------------------------
  -- 4. TABLA DE PROYECTOS DE CLIENTES (CLIENT_PROJECTS)
  -- Portal de seguimiento de proyectos de auditoría, cloud o datos
  -- ------------------------------------------------------------------------------
  CREATE TABLE IF NOT EXISTS public.client_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
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

  -- Clientes ven exclusivamente sus propios proyectos; staff ve todos
  DROP POLICY IF EXISTS "Clients view own projects" ON public.client_projects;
  CREATE POLICY "Clients view own projects"
    ON public.client_projects
    FOR SELECT
    TO authenticated
    USING (client_id = auth.uid() OR public.is_staff());

  DROP POLICY IF EXISTS "Staff manage client projects" ON public.client_projects;
  CREATE POLICY "Staff manage client projects"
    ON public.client_projects
    FOR ALL
    TO authenticated
    USING (public.is_staff())
    WITH CHECK (public.is_staff());


  -- ------------------------------------------------------------------------------
  -- 5. TABLA DE HITOS DE PROYECTO (PROJECT_MILESTONES)
  -- ------------------------------------------------------------------------------
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

  DROP POLICY IF EXISTS "Clients view own project milestones" ON public.project_milestones;
  CREATE POLICY "Clients view own project milestones"
    ON public.project_milestones
    FOR SELECT
    TO authenticated
    USING (
      public.is_staff() OR
      EXISTS (
        SELECT 1 FROM public.client_projects cp
        WHERE cp.id = project_milestones.project_id AND cp.client_id = auth.uid()
      )
    );

  DROP POLICY IF EXISTS "Staff manage project milestones" ON public.project_milestones;
  CREATE POLICY "Staff manage project milestones"
    ON public.project_milestones
    FOR ALL
    TO authenticated
    USING (public.is_staff())
    WITH CHECK (public.is_staff());


  -- ------------------------------------------------------------------------------
  -- 6. TABLA DE ENTREGABLES E INFORMES TÉCNICOS (PROJECT_DELIVERABLES)
  -- ------------------------------------------------------------------------------
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

  DROP POLICY IF EXISTS "Clients view own project deliverables" ON public.project_deliverables;
  CREATE POLICY "Clients view own project deliverables"
    ON public.project_deliverables
    FOR SELECT
    TO authenticated
    USING (
      public.is_staff() OR
      EXISTS (
        SELECT 1 FROM public.client_projects cp
        WHERE cp.id = project_deliverables.project_id AND cp.client_id = auth.uid()
      )
    );

  DROP POLICY IF EXISTS "Staff manage project deliverables" ON public.project_deliverables;
  CREATE POLICY "Staff manage project deliverables"
    ON public.project_deliverables
    FOR ALL
    TO authenticated
    USING (public.is_staff())
    WITH CHECK (public.is_staff());


  -- ------------------------------------------------------------------------------
  -- 7. CONFIGURACIÓN DE STORAGE PRIVADO (PROJECT-DELIVERABLES BUCKET)
  -- ------------------------------------------------------------------------------
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('project-deliverables', 'project-deliverables', false)
  ON CONFLICT (id) DO UPDATE SET public = false;

  -- Política de Storage: Acceso de lectura a archivos por parte de clientes asignados o admins
  DROP POLICY IF EXISTS "Private Deliverables Access" ON storage.objects;
  CREATE POLICY "Private Deliverables Access"
    ON storage.objects
    FOR SELECT
    TO authenticated
    USING (
      bucket_id = 'project-deliverables' AND (
        public.is_staff() OR
        EXISTS (
          SELECT 1 FROM public.project_deliverables pd
          JOIN public.client_projects cp ON cp.id = pd.project_id
          WHERE pd.file_path = storage.objects.name AND cp.client_id = auth.uid()
        )
      )
    );

  DROP POLICY IF EXISTS "Staff Upload Deliverables" ON storage.objects;
  CREATE POLICY "Staff Upload Deliverables"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'project-deliverables' AND public.is_staff()
    );


  -- ------------------------------------------------------------------------------
  -- 8. PERMISOS Y ROLES DE ACCESO (GRANTS)
  -- ------------------------------------------------------------------------------
  GRANT USAGE ON SCHEMA public TO anon, authenticated;
  GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

  GRANT INSERT ON public.leads_tdr TO anon, authenticated;
  GRANT SELECT, UPDATE ON public.leads_tdr TO authenticated;

  GRANT SELECT, UPDATE ON public.profiles TO authenticated;
  GRANT SELECT ON public.client_projects TO authenticated;
  GRANT SELECT ON public.project_milestones TO authenticated;
  GRANT SELECT ON public.project_deliverables TO authenticated;
