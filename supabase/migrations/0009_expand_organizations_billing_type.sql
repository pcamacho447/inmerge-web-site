-- Migración 0009: Expansión de tipos de facturación en organizaciones & Realtime de órdenes
-- Permite compatibilidad con gestión fiscal dual:
-- RUC (11 dígitos, Perú), DNI (8 dígitos, Perú) y Tax ID / EIN / VAT (Internacional B2B)
-- Manteniendo compatibilidad retroactiva con 'persona_natural' y 'empresa'

ALTER TABLE IF EXISTS public.organizations
  DROP CONSTRAINT IF EXISTS organizations_billing_type_check;

ALTER TABLE IF EXISTS public.organizations
  ADD CONSTRAINT organizations_billing_type_check
  CHECK (billing_type IN ('persona_natural', 'empresa', 'ruc', 'dni', 'tax_id'));

-- Habilitar identidad de réplica para orders
ALTER TABLE IF EXISTS public.orders REPLICA IDENTITY FULL;

-- Agregar orders a la publicación supabase_realtime de forma idempotente
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  END IF;
END;
$$;
