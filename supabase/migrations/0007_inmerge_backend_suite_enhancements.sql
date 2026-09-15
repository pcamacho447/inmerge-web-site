-- Migración 0007: Suite Integral de Mejoras Backend Inmerge
-- 1. Facturación B2B: Vouchers Bancarios y Conciliación
-- 2. Integridad Criptográfica: Checksum SHA-256 en Entregables
-- 3. PM Analytics: RPC de Horas y Auto-RAG Status Trigger
-- 4. Seguridad: Detección de Anomalías de Descargas Forenses

-- ============================================================================
-- 1. FACTURACIÓN B2B: VOUCHERS Y CONCILIACIÓN
-- ============================================================================

ALTER TABLE IF EXISTS public.orders
  ADD COLUMN IF NOT EXISTS voucher_file_path TEXT,
  ADD COLUMN IF NOT EXISTS voucher_uploaded_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS voucher_status TEXT DEFAULT 'pending_upload'
    CHECK (voucher_status IN ('pending_upload', 'uploaded', 'verified', 'rejected')),
  ADD COLUMN IF NOT EXISTS admin_notes TEXT,
  ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

-- Bucket de Storage para comprobantes bancarios
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'billing-vouchers',
  'billing-vouchers',
  false,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760;

-- Políticas RLS para storage.objects en billing-vouchers
DROP POLICY IF EXISTS "Clientes pueden subir sus vouchers" ON storage.objects;
CREATE POLICY "Clientes pueden subir sus vouchers"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'billing-vouchers' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Clientes y staff pueden ver sus vouchers" ON storage.objects;
CREATE POLICY "Clientes y staff pueden ver sus vouchers"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'billing-vouchers' AND (
      (storage.foldername(name))[1] = auth.uid()::text OR
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('admin', 'auditor', 'engineer')
      )
    )
  );

-- RPC Administrativo para conciliar y aprobar/rechazar órdenes de pago
DROP FUNCTION IF EXISTS public.verify_billing_order(UUID, TEXT, TEXT) CASCADE;
CREATE OR REPLACE FUNCTION public.verify_billing_order(
  p_order_id UUID,
  p_status TEXT,
  p_admin_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_caller_role TEXT;
  v_order RECORD;
BEGIN
  -- Validar rol del usuario autenticado
  SELECT role INTO v_caller_role
  FROM public.profiles
  WHERE id = auth.uid();

  IF v_caller_role != 'admin' THEN
    RAISE EXCEPTION 'Acceso denegado: Solo administradores pueden conciliar órdenes de pago.';
  END IF;

  IF p_status NOT IN ('approved', 'rejected') THEN
    RAISE EXCEPTION 'Estado inválido. Debe ser approved o rejected.';
  END IF;

  -- Actualizar orden
  UPDATE public.orders
  SET
    status = p_status,
    voucher_status = CASE WHEN p_status = 'approved' THEN 'verified' ELSE 'rejected' END,
    admin_notes = p_admin_notes,
    verified_by = auth.uid(),
    verified_at = now(),
    approved_at = CASE WHEN p_status = 'approved' THEN now() ELSE NULL END
  WHERE id = p_order_id
  RETURNING * INTO v_order;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'La orden especificada no existe.';
  END IF;

  -- Registrar en log de auditoría
  INSERT INTO public.team_activity_logs (
    user_id,
    action,
    entity_type,
    entity_id,
    details
  ) VALUES (
    auth.uid(),
    CASE WHEN p_status = 'approved' THEN 'BILLING_ORDER_APPROVED' ELSE 'BILLING_ORDER_REJECTED' END,
    'order',
    p_order_id,
    jsonb_build_object(
      'order_code', v_order.code,
      'amount_pen', v_order.amount_pen,
      'user_id', v_order.user_id,
      'admin_notes', p_admin_notes
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'order_id', v_order.id,
    'code', v_order.code,
    'status', v_order.status,
    'voucher_status', v_order.voucher_status
  );
END;
$$;

-- ============================================================================
-- 2. INTEGRIDAD CRIPTOGRÁFICA EN ENTREGABLES (SHA-256)
-- ============================================================================

ALTER TABLE IF EXISTS public.project_deliverables
  ADD COLUMN IF NOT EXISTS sha256_checksum VARCHAR(64),
  ADD COLUMN IF NOT EXISTS file_size_bytes BIGINT,
  ADD COLUMN IF NOT EXISTS calculated_at TIMESTAMPTZ DEFAULT now();

-- ============================================================================
-- 3. MOTOR ANALÍTICO DE HORAS Y AUTO-RAG STATUS EN POSTGRESQL
-- ============================================================================

DROP FUNCTION IF EXISTS public.get_project_analytics(UUID) CASCADE;
CREATE OR REPLACE FUNCTION public.get_project_analytics(p_project_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_res JSONB;
BEGIN
  SELECT jsonb_build_object(
    'project_id', p_project_id,
    'total_tasks', COUNT(t.id),
    'completed_tasks', COUNT(t.id) FILTER (WHERE t.status = 'DONE'),
    'in_progress_tasks', COUNT(t.id) FILTER (WHERE t.status = 'IN_PROGRESS'),
    'blocked_tasks', COUNT(t.id) FILTER (WHERE t.status = 'BLOCKED'),
    'overdue_tasks', COUNT(t.id) FILTER (WHERE t.due_date < CURRENT_DATE AND t.status != 'DONE'),
    'total_estimated_hours', COALESCE(SUM(t.estimated_hours), 0),
    'total_actual_hours', COALESCE(SUM(t.actual_hours), 0),
    'effort_variance_pct', CASE
      WHEN COALESCE(SUM(t.estimated_hours), 0) > 0 THEN
        ROUND(((COALESCE(SUM(t.actual_hours), 0) - SUM(t.estimated_hours)) / SUM(t.estimated_hours)) * 100, 2)
      ELSE 0
    END,
    'completion_pct', CASE
      WHEN COUNT(t.id) > 0 THEN
        ROUND((COUNT(t.id) FILTER (WHERE t.status = 'DONE')::NUMERIC / COUNT(t.id)::NUMERIC) * 100, 1)
      ELSE 0
    END,
    'total_milestones', (SELECT COUNT(*) FROM public.project_milestones WHERE project_id = p_project_id),
    'completed_milestones', (SELECT COUNT(*) FROM public.project_milestones WHERE project_id = p_project_id AND status = 'COMPLETED'),
    'open_risks_count', (SELECT COUNT(*) FROM public.project_risks WHERE project_id = p_project_id AND status != 'RESUELTO')
  ) INTO v_res
  FROM public.project_tasks t
  WHERE t.project_id = p_project_id;

  RETURN v_res;
END;
$$;

-- Trigger para recálculo automático de estado RAG
CREATE OR REPLACE FUNCTION public.fn_auto_update_project_rag_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_project_id UUID;
  v_overdue_critical_count INT;
  v_est_hours NUMERIC;
  v_act_hours NUMERIC;
  v_suggested_rag TEXT;
BEGIN
  v_project_id := COALESCE(NEW.project_id, OLD.project_id);
  IF v_project_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Contar tareas críticas o altas vencidas
  SELECT
    COUNT(*) FILTER (WHERE due_date < CURRENT_DATE AND status != 'DONE' AND priority IN ('ALTA', 'CRITICA')),
    COALESCE(SUM(estimated_hours), 0),
    COALESCE(SUM(actual_hours), 0)
  INTO v_overdue_critical_count, v_est_hours, v_act_hours
  FROM public.project_tasks
  WHERE project_id = v_project_id;

  IF v_overdue_critical_count > 0 THEN
    v_suggested_rag := 'DELAYED';
  ELSIF v_est_hours > 0 AND v_act_hours > (v_est_hours * 1.25) THEN
    v_suggested_rag := 'AT_RISK';
  ELSE
    v_suggested_rag := 'ON_TRACK';
  END IF;

  -- Actualizar únicamente si el proyecto no fue marcado manualmente como BLOCKED
  UPDATE public.client_projects
  SET health_status = v_suggested_rag
  WHERE id = v_project_id AND health_status != 'BLOCKED' AND health_status != v_suggested_rag;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_tasks_auto_rag ON public.project_tasks;
CREATE TRIGGER trg_tasks_auto_rag
  AFTER INSERT OR UPDATE OR DELETE ON public.project_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_auto_update_project_rag_status();

-- ============================================================================
-- 4. SEGURIDAD: DETECCIÓN DE ANOMALÍAS DE DESCARGAS
-- ============================================================================

DROP FUNCTION IF EXISTS public.detect_download_anomaly(UUID, INT, INT) CASCADE;
CREATE OR REPLACE FUNCTION public.detect_download_anomaly(
  p_user_id UUID,
  p_window_seconds INT DEFAULT 60,
  p_max_downloads INT DEFAULT 10
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_recent_count INT;
  v_is_anomaly BOOLEAN := false;
BEGIN
  SELECT COUNT(*) INTO v_recent_count
  FROM public.team_activity_logs
  WHERE user_id = p_user_id
    AND action = 'DELIVERABLE_DOWNLOADED'
    AND created_at >= (now() - (p_window_seconds || ' seconds')::INTERVAL);

  IF v_recent_count >= p_max_downloads THEN
    v_is_anomaly := true;

    INSERT INTO public.team_activity_logs (
      user_id,
      action,
      entity_type,
      details
    ) VALUES (
      p_user_id,
      'ANOMALOUS_DOWNLOAD_BURST_DETECTED',
      'security_alert',
      jsonb_build_object(
        'window_seconds', p_window_seconds,
        'download_count', v_recent_count,
        'threshold', p_max_downloads,
        'flagged_at', now()
      )
    );
  END IF;

  RETURN jsonb_build_object(
    'is_anomaly', v_is_anomaly,
    'recent_count', v_recent_count,
    'max_threshold', p_max_downloads
  );
END;
$$;
