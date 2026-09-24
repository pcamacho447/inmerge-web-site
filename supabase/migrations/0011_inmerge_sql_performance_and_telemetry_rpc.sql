-- Migración 0011: Índices Compuestos de Alto Rendimiento y RPC de Telemetría Consolidada
-- Inmerge - Editorial Tech Premium

-- 1. Índices Compuestos B-Tree para Filtrado O(log N)
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_email_status 
  ON public.project_tasks(assigned_to_email, status);

CREATE INDEX IF NOT EXISTS idx_deliverables_proj_status 
  ON public.project_deliverables(project_id, status);

CREATE INDEX IF NOT EXISTS idx_findings_proj_sev_stat 
  ON public.project_findings(project_id, severity, status);

CREATE INDEX IF NOT EXISTS idx_milestones_assigned_email 
  ON public.project_milestones(assigned_to_email);

CREATE INDEX IF NOT EXISTS idx_leads_status_created 
  ON public.leads_tdr(status, created_at DESC);

-- 2. Optimización RPC get_project_analytics (Single-Pass Aggregates)
CREATE OR REPLACE FUNCTION public.get_project_analytics(p_project_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_result JSONB;
BEGIN
  IF p_project_id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT jsonb_build_object(
    'project_id', p_project_id,
    'total_tasks', COUNT(t.id),
    'completed_tasks', COUNT(t.id) FILTER (WHERE t.status = 'DONE'),
    'in_progress_tasks', COUNT(t.id) FILTER (WHERE t.status = 'IN_PROGRESS'),
    'blocked_tasks', COUNT(t.id) FILTER (WHERE t.status = 'BLOCKED'),
    'overdue_tasks', COUNT(t.id) FILTER (WHERE t.status != 'DONE' AND t.due_date < CURRENT_DATE),
    'total_estimated_hours', COALESCE(SUM(t.estimated_hours), 0),
    'total_actual_hours', COALESCE(SUM(t.actual_hours), 0),
    'effort_variance_pct', CASE 
      WHEN COALESCE(SUM(t.estimated_hours), 0) > 0 
      THEN ROUND((((COALESCE(SUM(t.actual_hours), 0) - SUM(t.estimated_hours)) / SUM(t.estimated_hours)) * 100)::numeric, 2)
      ELSE 0 
    END,
    'completion_pct', CASE 
      WHEN COUNT(t.id) > 0 
      THEN ROUND(((COUNT(t.id) FILTER (WHERE t.status = 'DONE')::numeric / COUNT(t.id)::numeric) * 100)::numeric, 1)
      ELSE 0 
    END,
    'open_risks_count', (SELECT COUNT(*) FROM public.project_risks r WHERE r.project_id = p_project_id AND r.status != 'RESUELTO'),
    'open_critical_findings_count', (SELECT COUNT(*) FROM public.project_findings f WHERE f.project_id = p_project_id AND f.severity IN ('CRITICA', 'ALTA') AND f.status != 'VERIFICADO')
  ) INTO v_result
  FROM public.project_tasks t
  WHERE t.project_id = p_project_id;

  RETURN v_result;
END;
$$;

-- 3. RPC get_workspace_telemetry_snapshot (Resumen Consolidado en 1 Solo Request)
CREATE OR REPLACE FUNCTION public.get_workspace_telemetry_snapshot(
  p_user_email TEXT DEFAULT NULL,
  p_is_admin BOOLEAN DEFAULT FALSE
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_snapshot JSONB;
BEGIN
  SELECT jsonb_build_object(
    'kpis', jsonb_build_object(
      'active_projects_count', (SELECT COUNT(*) FROM public.client_projects WHERE status NOT IN ('FINALIZADO')),
      'active_leads_count', (SELECT COUNT(*) FROM public.leads_tdr WHERE status IN ('NUEVO', 'EN_REVISION')),
      'pending_deliverables_count', (SELECT COUNT(*) FROM public.project_deliverables WHERE status IN ('BORRADOR_INTERNO', 'EN_REVISION')),
      'open_critical_findings_count', (SELECT COUNT(*) FROM public.project_findings WHERE severity IN ('CRITICA', 'ALTA') AND status != 'VERIFICADO'),
      'user_assigned_tasks_count', CASE 
        WHEN p_user_email IS NOT NULL THEN (SELECT COUNT(*) FROM public.project_tasks WHERE assigned_to_email = p_user_email AND status != 'DONE')
        ELSE 0
      END
    ),
    'generated_at', NOW()
  ) INTO v_snapshot;

  RETURN v_snapshot;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_project_analytics(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_workspace_telemetry_snapshot(TEXT, BOOLEAN) TO authenticated;
