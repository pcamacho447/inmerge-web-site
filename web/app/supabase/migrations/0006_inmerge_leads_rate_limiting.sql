-- Migración 0006: Protección Anti-Spam & Rate Limiting en Formulario de Contacto TDR
-- Inmerge - Editorial Tech Premium

-- 1. Crear índice compuesto en leads_tdr para búsqueda rápida por email y fecha
CREATE INDEX IF NOT EXISTS idx_leads_tdr_email_created_at
  ON public.leads_tdr (email, created_at DESC);

-- 2. Función Trigger para verificar límite de frecuencia (máximo 3 solicitudes por hora por email)
CREATE OR REPLACE FUNCTION public.check_leads_tdr_rate_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_recent_count INTEGER;
  v_normalized_email TEXT;
BEGIN
  -- Normalizar correo eliminando espacios y convirtiendo a minúsculas
  v_normalized_email := LOWER(TRIM(NEW.email));
  NEW.email := v_normalized_email;

  -- Contar solicitudes del mismo correo en los últimos 60 minutos
  SELECT COUNT(*)
  INTO v_recent_count
  FROM public.leads_tdr
  WHERE email = v_normalized_email
    AND created_at > (now() - INTERVAL '1 hour');

  -- Si supera el límite de 3 solicitudes por hora, bloquear y auditar
  IF v_recent_count >= 3 THEN
    -- Registrar intento bloqueado en la bitácora de auditoría
    BEGIN
      INSERT INTO public.team_activity_logs (
        action,
        entity_type,
        entity_id,
        details
      ) VALUES (
        'SPAM_LEAD_BLOCKED',
        'lead',
        NULL,
        jsonb_build_object(
          'email', v_normalized_email,
          'reason', 'RATE_LIMIT_EXCEEDED (Max 3 submissions per hour)',
          'recent_count', v_recent_count,
          'attempted_at', now()
        )
      );
    EXCEPTION
      WHEN OTHERS THEN
        -- No detener la excepción principal si falla el log
        NULL;
    END;

    RAISE EXCEPTION 'RATE_LIMIT_EXCEEDED: Se ha alcanzado el límite de 3 solicitudes por hora para este correo. Por favor intenta más tarde o comunícate vía WhatsApp.'
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$;

-- 3. Crear el Trigger BEFORE INSERT en leads_tdr
DROP TRIGGER IF EXISTS trg_leads_tdr_rate_limit ON public.leads_tdr;
CREATE TRIGGER trg_leads_tdr_rate_limit
  BEFORE INSERT ON public.leads_tdr
  FOR EACH ROW
  EXECUTE FUNCTION public.check_leads_tdr_rate_limit();
