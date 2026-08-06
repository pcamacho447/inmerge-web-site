-- Hallazgo de la revisión final de todo el branch: information_schema.role_table_grants
-- en vivo muestra que anon Y authenticated todavía tienen INSERT/UPDATE/DELETE/TRUNCATE
-- de TABLA sobre reports, plans, purchases y subscriptions — son los defaults que trae
-- Supabase por esquema, nunca revocados para estas cuatro. Lo único que hoy bloquea esas
-- escrituras es la AUSENCIA de una policy de RLS que las autorice: una sola capa, no dos.
-- `orders` ya es la excepción endurecida (0005_column_grants.sql): sin UPDATE/DELETE de
-- tabla en absoluto, e INSERT acotado columna por columna. Misma clase de hallazgo que dio
-- inicio a todo este plan de endurecimiento — cerrarla en las cuatro tablas restantes.
revoke insert, update, delete, truncate on
  public.reports, public.plans, public.purchases, public.subscriptions
  from anon, authenticated;

-- TRAMPA A NO CAER: acá se revoca SOLO update, delete, truncate sobre `orders` —
-- NUNCA insert. En PostgreSQL, revocar un privilegio a nivel de TABLA revoca también los
-- grants de COLUMNA de ese mismo privilegio — así que `revoke insert on public.orders`
-- destruiría el INSERT acotado columna por columna que 0005_column_grants.sql estableció
-- (user_id, kind, report_id, plan, method) y dejaría el checkout completamente roto.
-- `orders` ya no tenía UPDATE/DELETE de tabla desde 0005 — esto solo cierra TRUNCATE, que
-- 0005 no tocó.
revoke update, delete, truncate on public.orders from anon, authenticated;
