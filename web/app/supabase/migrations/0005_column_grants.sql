-- Cierra C1/I4: RLS no tiene granularidad de columna, así que el trigger que
-- corregía amount_pen/status/approved_at dejaba libres `code`, `notes` y
-- `created_at`. `code` era el peligroso: vive en un espacio único global del
-- que depende todo el checkout, así que un usuario registrado podía insertar
-- pedidos con códigos futuros y hacer que cada cliente real chocara contra el
-- índice único.
--
-- REGLA GENERAL: donde un trigger "corrige" una columna, revisa qué OTRAS
-- columnas puede escribir el cliente. La policy no las cubre.

revoke insert, update, delete on public.orders from anon, authenticated;
grant insert (user_id, kind, report_id, plan, method) on public.orders to authenticated;

-- Cierra I3: Supabase trae `alter default privileges ... grant execute on
-- functions to anon, authenticated` para el esquema public. `create or replace`
-- conserva el ACL, pero cambiar una firma obliga a DROP + CREATE, y la función
-- nueva nacería EJECUTABLE POR CUALQUIER USUARIO LOGUEADO. Task 3 hace
-- exactamente ese cambio de firma.
alter default privileges in schema public revoke execute on functions from anon, authenticated;
alter default privileges for role postgres in schema public revoke execute on functions from anon, authenticated;
