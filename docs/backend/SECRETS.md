# Guía de Aprovisionamiento de Secretos y Backend — Inmerge

Esta guía documenta el aprovisionamiento de variables y secretos de producción para el backend de Inmerge (Supabase PostgreSQL, Storage y Edge Functions).

---

## 1. Edge Functions y Secretos Remotos

Las 4 Edge Functions de Inmerge operan en el runtime de Deno en Supabase:
1. `notify-lead-tdr`: Notifica inmediatamente por Webhook a canales de ingeniería y envía confirmación por email al solicitante y al inbox de Inmerge (`inmerge3@gmail.com`).
2. `notify-deliverable`: Notifica al cliente cuando se sube un entregable técnico en su proyecto.
3. `notify-project-status`: Comunica cambios en las fases del proyecto y salud RAG (`ON_TRACK`, `AT_RISK`, `DELAYED`, `BLOCKED`).
4. `secure-download`: Genera URLs firmadas de 900s (15 min) para entregables confidenciales con auditoría forense inmutable (`team_activity_logs`).

### Comandos de Aprovisionamiento (Supabase CLI)

```bash
# Vincular con el proyecto remoto (si no se ha hecho previamente)
npx supabase link --project-ref <TU_PROJECT_REF>

# Aprovisionar secretos desde el archivo local .env
npx supabase secrets set --env-file ./supabase/.env

# O configurar manualmente variables individuales:
npx supabase secrets set \
  ALERT_WEBHOOK_URL="https://discord.com/api/webhooks/..." \
  RESEND_API_KEY="re_..." \
  CONSULTING_INBOX="inmerge3@gmail.com" \
  RESEND_FROM="Inmerge Consulting <informes@inmerge.pe>"
```

### Despliegue de Edge Functions

```bash
npx supabase functions deploy notify-lead-tdr --no-verify-jwt
npx supabase functions deploy notify-deliverable
npx supabase functions deploy notify-project-status
npx supabase functions deploy secure-download
```

---

## 2. Paridad Defensiva de Fallbacks

Las Edge Functions de Inmerge fueron diseñadas bajo el principio de **degradación elegante**:
- Si `ALERT_WEBHOOK_URL` o `RESEND_API_KEY` no están presentes en el entorno, la función registra un log de advertencia claro (`[notify-lead-tdr] Env status — Webhook: MISSING`) y retorna respuesta exitosa estructurada al cliente web.
- El cliente web nunca experimenta un bloqueo o fallo de UX si un proveedor de correo externo o webhook sufre latencia o indisponibilidad temporal.

---

## 3. Storage y Restricciones de Carga

- Bucket `billing-vouchers`: 
  - Tamaño máximo: `10 MB` (`10485760` bytes).
  - Tipos MIME admitidos: `image/jpeg`, `image/png`, `image/webp`, `application/pdf`.
  - Validación dual: Tanto en el cliente vía `validateVoucherFile` ([web/app/src/lib/billing.js](file:///c:/papx/inmerge-website/inmerge/web/app/src/lib/billing.js)) como en Storage policies de PostgreSQL ([supabase/migrations/0007_inmerge_backend_suite_enhancements.sql](file:///c:/papx/inmerge-website/inmerge/supabase/migrations/0007_inmerge_backend_suite_enhancements.sql)).
- Bucket `project-deliverables`:
  - Solo accesible mediante URLs firmadas temporales o usuarios autenticados con rol asignado (`admin`, `auditor`, `engineer`, o `client` propietario).
