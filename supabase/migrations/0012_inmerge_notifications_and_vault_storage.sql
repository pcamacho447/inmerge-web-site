-- Migración 0012: Tabla de Notificaciones de Usuario y Políticas de Almacenamiento Vault
-- Inmerge - Editorial Tech Premium

-- 1. Crear Tabla user_notifications
CREATE TABLE IF NOT EXISTS public.user_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  target_role TEXT DEFAULT 'ALL', -- 'admin', 'client', 'engineer', 'auditor', 'ALL'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('DELIVERABLE', 'FINDING', 'TASK', 'SYSTEM', 'SECURITY')),
  severity TEXT NOT NULL DEFAULT 'INFO' CHECK (severity IN ('CRITICAL', 'HIGH', 'MEDIUM', 'INFO')),
  project_id UUID REFERENCES public.client_projects(id) ON DELETE CASCADE,
  link_url TEXT,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Habilitar RLS e Índices Compuestos
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_notifications_user_read 
  ON public.user_notifications(user_email, is_read, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_category_severity 
  ON public.user_notifications(category, severity);

-- 3. Políticas RLS para user_notifications
DROP POLICY IF EXISTS "Usuarios ven sus propias notificaciones o por rol" ON public.user_notifications;
CREATE POLICY "Usuarios ven sus propias notificaciones o por rol" 
  ON public.user_notifications
  FOR SELECT 
  TO authenticated 
  USING (
    user_email = auth.jwt()->>'email' 
    OR target_role = 'ALL'
  );

DROP POLICY IF EXISTS "Usuarios pueden actualizar estado is_read de sus notificaciones" ON public.user_notifications;
CREATE POLICY "Usuarios pueden actualizar estado is_read de sus notificaciones" 
  ON public.user_notifications
  FOR UPDATE 
  TO authenticated 
  USING (user_email = auth.jwt()->>'email');

DROP POLICY IF EXISTS "Personal autenticado puede insertar notificaciones" ON public.user_notifications;
CREATE POLICY "Personal autenticado puede insertar notificaciones" 
  ON public.user_notifications
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

-- 4. Creación e Inserción de Bucket de Almacenamiento Vault
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-deliverables-vault',
  'project-deliverables-vault',
  false,
  52428800, -- 50 MB
  ARRAY['application/pdf', 'application/json', 'image/png', 'image/jpeg', 'application/zip', 'text/markdown']
)
ON CONFLICT (id) DO NOTHING;

-- Políticas RLS para storage.objects en project-deliverables-vault
DROP POLICY IF EXISTS "Staff puede subir entregables al vault" ON storage.objects;
CREATE POLICY "Staff puede subir entregables al vault"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'project-deliverables-vault' AND
    (public.is_staff() OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'auditor', 'engineer')
    ))
  );

DROP POLICY IF EXISTS "Usuarios autenticados pueden leer entregables del vault" ON storage.objects;
CREATE POLICY "Usuarios autenticados pueden leer entregables del vault"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'project-deliverables-vault'
  );

-- 5. Permisos de Ejecución y Publicación Realtime
GRANT ALL ON TABLE public.user_notifications TO authenticated;

ALTER TABLE public.user_notifications REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.user_notifications;
  END IF;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;
