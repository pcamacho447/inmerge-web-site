-- ==============================================================================
-- INMERGE — MIGRACIÓN 0002: BLINDAJE DE SEGURIDAD, RLS & AUDITORÍA AUTOMÁTICA
-- Consultoría en Auditoría Técnica, Desarrollo Cloud & Ciencia de Datos
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. PREVENCIÓN DE ESCALACIÓN DE ROLES EN PROFILES
-- Evita que cualquier usuario no-administrador altere el campo 'role'
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_profile_role_update()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Si el rol está cambiando y el usuario actual NO es admin ni el trigger del sistema
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF NOT public.is_admin() THEN
      RAISE EXCEPTION 'Operación denegada: Solo los administradores pueden modificar roles de usuario.';
    END IF;
  END IF;

  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_role_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_role_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.check_profile_role_update();


-- ------------------------------------------------------------------------------
-- 2. RESTRICCIÓN DE SEGURIDAD Y PERMISOS EN RPC CREATE_STAFF_MEMBER
-- Solo administradores autenticados pueden invocar esta función
-- ------------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.create_staff_member(text, text, text, text) CASCADE;
DROP FUNCTION IF EXISTS public.create_staff_member(text, text, text) CASCADE;
DROP FUNCTION IF EXISTS public.create_staff_member CASCADE;

CREATE OR REPLACE FUNCTION public.create_staff_member(
  p_email TEXT,
  p_password TEXT,
  p_full_name TEXT,
  p_role TEXT DEFAULT 'auditor'
)
RETURNS UUID
SECURITY DEFINER
SET search_path = public, auth, extensions
LANGUAGE plpgsql
AS $$
DECLARE
  v_user_id UUID := gen_random_uuid();
BEGIN
  -- Verificar que el invocador sea administrador autenticado
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Acceso denegado: Se requiere rol de administrador para dar de alta miembros del equipo.';
  END IF;

  IF p_role NOT IN ('admin', 'auditor', 'engineer') THEN
    RAISE EXCEPTION 'Rol inválido para miembro de equipo. Debe ser admin, auditor o engineer.';
  END IF;

  -- Si el usuario ya existe en auth.users, actualizamos su rol y perfil
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = p_email) THEN
    SELECT id INTO v_user_id FROM auth.users WHERE email = p_email;
    UPDATE public.profiles
    SET role = p_role, full_name = p_full_name, updated_at = now()
    WHERE id = v_user_id;

    -- Registrar auditoría
    INSERT INTO public.team_activity_logs (user_id, action, entity_type, entity_id, details)
    VALUES (
      auth.uid(),
      'STAFF_ROLE_UPDATED',
      'profile',
      v_user_id,
      jsonb_build_object('email', p_email, 'full_name', p_full_name, 'role', p_role)
    );

    RETURN v_user_id;
  END IF;

  -- Insertar usuario nuevo en auth.users compatible con GoTrue
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    role,
    aud,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    p_email,
    crypt(p_password, gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', p_full_name, 'role', p_role),
    now(),
    now(),
    'authenticated',
    'authenticated',
    '',
    '',
    '',
    ''
  );

  -- Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (v_user_id, p_email, p_full_name, p_role)
  ON CONFLICT (id) DO UPDATE
  SET role = p_role, full_name = p_full_name, updated_at = now();

  -- Registrar en bitácora de auditoría
  INSERT INTO public.team_activity_logs (user_id, action, entity_type, entity_id, details)
  VALUES (
    auth.uid(),
    'STAFF_MEMBER_CREATED',
    'profile',
    v_user_id,
    jsonb_build_object('email', p_email, 'full_name', p_full_name, 'role', p_role)
  );

  RETURN v_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_staff_member(text, text, text, text) TO authenticated;


-- ------------------------------------------------------------------------------
-- 3. INMUTABILIDAD DE LA BITÁCORA DE AUDITORÍA (TEAM_ACTIVITY_LOGS)
-- Bloquear cualquier intento de UPDATE o DELETE para garantizar no-repudio
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "No Update Activity Logs" ON public.team_activity_logs;
DROP POLICY IF EXISTS "No Delete Activity Logs" ON public.team_activity_logs;

-- Reasegurar que solo staff autenticado pueda leer e insertar, nadie puede actualizar ni borrar
ALTER TABLE public.team_activity_logs ENABLE ROW LEVEL SECURITY;

REVOKE UPDATE, DELETE ON public.team_activity_logs FROM public, anon, authenticated;


-- ------------------------------------------------------------------------------
-- 4. FUNCIÓN Y TRIGGERS DE AUDITORÍA AUTOMÁTICA EN BASE DE DATOS
-- Registra cambios en Leads, Proyectos, Hitos y Entregables
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.audit_team_activity_trigger()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_action TEXT;
  v_entity_type TEXT := TG_TABLE_NAME;
  v_entity_id UUID;
  v_details JSONB := '{}'::jsonb;
  v_user_id UUID := auth.uid();
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_action := UPPER(TG_TABLE_NAME) || '_INSERTED';
    v_entity_id := NEW.id;
    v_details := jsonb_build_object(
      'op', 'INSERT',
      'new', to_jsonb(NEW) - 'encrypted_password'
    );
  ELSIF TG_OP = 'UPDATE' THEN
    v_action := UPPER(TG_TABLE_NAME) || '_UPDATED';
    v_entity_id := NEW.id;
    v_details := jsonb_build_object(
      'op', 'UPDATE',
      'old', to_jsonb(OLD) - 'encrypted_password',
      'new', to_jsonb(NEW) - 'encrypted_password'
    );
  ELSIF TG_OP = 'DELETE' THEN
    v_action := UPPER(TG_TABLE_NAME) || '_DELETED';
    v_entity_id := OLD.id;
    v_details := jsonb_build_object(
      'op', 'DELETE',
      'old', to_jsonb(OLD) - 'encrypted_password'
    );
  END IF;

  INSERT INTO public.team_activity_logs (user_id, action, entity_type, entity_id, details)
  VALUES (v_user_id, v_action, v_entity_type, v_entity_id, v_details);

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- Triggers automáticos en tablas críticas
DROP TRIGGER IF EXISTS trg_audit_leads_tdr ON public.leads_tdr;
CREATE TRIGGER trg_audit_leads_tdr
  AFTER INSERT OR UPDATE OR DELETE ON public.leads_tdr
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_team_activity_trigger();

DROP TRIGGER IF EXISTS trg_audit_client_projects ON public.client_projects;
CREATE TRIGGER trg_audit_client_projects
  AFTER INSERT OR UPDATE OR DELETE ON public.client_projects
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_team_activity_trigger();

DROP TRIGGER IF EXISTS trg_audit_project_milestones ON public.project_milestones;
CREATE TRIGGER trg_audit_project_milestones
  AFTER INSERT OR UPDATE OR DELETE ON public.project_milestones
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_team_activity_trigger();

DROP TRIGGER IF EXISTS trg_audit_project_deliverables ON public.project_deliverables;
CREATE TRIGGER trg_audit_project_deliverables
  AFTER INSERT OR UPDATE OR DELETE ON public.project_deliverables
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_team_activity_trigger();


-- ------------------------------------------------------------------------------
-- 5. REFUERZO DE CONSTRAINTS Y VALIDACIONES DE ESQUEMA
-- ------------------------------------------------------------------------------
DO $$
BEGIN
  -- Validación de formato de email en leads_tdr
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'leads_tdr_email_format_check'
  ) THEN
    ALTER TABLE public.leads_tdr
    ADD CONSTRAINT leads_tdr_email_format_check
    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
  END IF;

  -- Validación de consistencia de fechas en client_projects
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'client_projects_dates_check'
  ) THEN
    ALTER TABLE public.client_projects
    ADD CONSTRAINT client_projects_dates_check
    CHECK (target_completion_date IS NULL OR start_date IS NULL OR target_completion_date >= start_date);
  END IF;

  -- Validación de entregables: al menos un recurso accesible (archivo o enlace externo)
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'project_deliverables_resource_check'
  ) THEN
    ALTER TABLE public.project_deliverables
    ADD CONSTRAINT project_deliverables_resource_check
    CHECK (file_path IS NOT NULL OR external_url IS NOT NULL);
  END IF;
END $$;
