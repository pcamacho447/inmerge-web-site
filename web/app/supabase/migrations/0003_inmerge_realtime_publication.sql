-- ==============================================================================
-- INMERGE CONSULTORÍA & TECNOLOGÍA — MIGRACIÓN 0003
-- HABILITACIÓN DE SUPABASE REALTIME & IDENTIDADES DE RÉPLICA
-- ==============================================================================

-- 1. HABILITAR IDENTIDAD DE RÉPLICA COMPLETA (REPLICA IDENTITY FULL)
-- Permite que los eventos de UPDATE y DELETE contengan tanto los valores anteriores como los nuevos.
ALTER TABLE IF EXISTS public.leads_tdr REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS public.client_projects REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS public.project_milestones REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS public.project_deliverables REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS public.team_activity_logs REPLICA IDENTITY FULL;

-- 2. ASOCIAR TABLAS A LA PUBLICACIÓN SUPABASE_REALTIME DE FORMA IDEMPOTENTE
DO $$
DECLARE
  tbl_name text;
  tables_to_publish text[] := ARRAY[
    'leads_tdr',
    'client_projects',
    'project_milestones',
    'project_deliverables',
    'team_activity_logs'
  ];
BEGIN
  -- Crear la publicación supabase_realtime si no existiera en el entorno
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
  ) THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;

  -- Agregar individualmente cada tabla a la publicación si no está presente
  FOREACH tbl_name IN ARRAY tables_to_publish
  LOOP
    IF NOT EXISTS (
      SELECT 1 
      FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = tbl_name
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', tbl_name);
    END IF;
  END LOOP;
END;
$$;
