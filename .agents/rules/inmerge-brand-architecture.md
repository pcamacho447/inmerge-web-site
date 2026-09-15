# Guía Técnica de Arquitectura, Diseño & Testing — Inmerge

Esta guía detalla las convenciones de desarrollo de componentes, tokens del sistema de diseño, manejo de rutas y pruebas para la plataforma web de Inmerge.

---

## 1. Estructura de Datos y Servicios
- Toda la definición de pilares y servicios vive centralizada en:
  - [`web/app/src/data/content.js`](file:///c:/papx/inmerge-website/inmerge/web/app/src/data/content.js) (`PILLARS`, `SERVICES`, `VALUES`, `SEGMENTS`, `NAV_LINKS`, `waLink`).
  - [`web/app/src/data/stack.js`](file:///c:/papx/inmerge-website/inmerge/web/app/src/data/stack.js) (`METHODOLOGY_STEPS`, `STACK_CATEGORIES`, `PILLARS_DETAIL`).
- **Idempotencia de Enlaces:** Utilizar la función helper `waLink(mensaje)` para generar enlaces con mensajes contextuales pre-rellenados según la sección donde se origine el contacto.

---

## 2. Componentes Reutilizables y UI
1. **[`StackTabs.jsx`](file:///c:/papx/inmerge-website/inmerge/web/app/src/components/StackTabs.jsx):**
   - Renderiza un sistema de pestañas accesible (`role="tablist"` / `role="tab"` / `role="tabpanel"`) para explorar tecnologías categorizadas (Cloud, Datos/IA, Backend, Frontend, Auditoría).
2. **[`ServicePillarCard.jsx`](file:///c:/papx/inmerge-website/inmerge/web/app/src/components/ServicePillarCard.jsx):**
   - Tarjeta interactiva con efecto de elevación `.pillar-card-interactive`, que enlaza al catálogo `/servicios` y permite cotización directa vía WhatsApp.
3. **[`ArchitectureDiagram.jsx`](file:///c:/papx/inmerge-website/inmerge/web/app/src/components/ArchitectureDiagram.jsx):**
   - Representación visual modular del ciclo de ingeniería y aseguramiento técnico en 4 capas (Ingestión/Auditoría, AWS/Pipelines, Modelos/IA, Aplicaciones Vivas).

---

## 3. Micro-interacciones y CSS Tokens
- **Bordes y Sombras:**
  - Las tarjetas utilizan fondo `var(--cream2)` o `var(--bg)` con borde `1px solid var(--border)`.
  - Al hover se activan sombras suaves: `box-shadow: 0 16px 32px rgba(36, 26, 18, 0.12)` y acento `border-color: var(--terracotta)`.
- **Botones:**
  - Botón primario: `.btn-accent` (Fondo terracotta `#A8472B`, texto `#F3EADA`, elevación sutil).
  - Botón secundario: `.btn-outline` (Borde `#241A12`, transición a fondo tinta `#241A12` y texto `#F3EADA` al hover).
- **Animaciones de Scroll:**
  - Todo elemento con animación debe llevar el atributo `data-reveal=""` gestionado por el hook [`useReveal.js`](file:///c:/papx/inmerge-website/inmerge/web/app/src/hooks/useReveal.js).

---

## 4. Arquitectura de Base de Datos y Supabase
- **Esquema Inicial Maestro:** [`web/app/supabase/migrations/0001_inmerge_initial_schema.sql`](file:///c:/papx/inmerge-website/inmerge/web/app/supabase/migrations/0001_inmerge_initial_schema.sql)
- **Migraciones Incrementales:** Nombrado secuencial `000X_<feature_or_hardening>.sql` (ej. `0002_inmerge_security_and_audit_hardening.sql`).
- **Idempotencia y Manejo Seguro de Esquema:**
  - Utilizar siempre `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` en `public.profiles` para evitar discrepancias con plantillas predeterminadas de Supabase.
  - Roles soportados: `profiles.role IN ('client', 'auditor', 'engineer', 'admin')`.
  - Bucket privado `project-deliverables` con políticas de lectura restringidas a clientes asignados y equipo técnico.
  - **Manejo Seguro de Funciones RPC y Triggers:**
    - Incluir siempre `DROP FUNCTION IF EXISTS public.<funcion>(<tipos>) CASCADE;` antes de `CREATE OR REPLACE FUNCTION` para prevenir el error `42P13` de PostgreSQL por renombrado de parámetros.
    - No crear funciones sobrecargadas con idénticos tipos de datos para actuar como alias de argumentos; unificar la signatura canónica (`p_*`) y normalizar en el SDK cliente.
    - Ejecutar `DROP TRIGGER IF EXISTS` antes de crear triggers y `DROP POLICY IF EXISTS` antes de crear políticas RLS.
    - Inmutabilidad de auditoría: Garantizar `REVOKE UPDATE, DELETE ON public.team_activity_logs`.

### 4.1 Inserciones Anónimas y Políticas RLS en PostgREST
- **Regla de Inserción sin `.select()`:** Cuando una tabla (`leads_tdr`, etc.) permita inserción pública (`anon`) pero restrinja la lectura (`SELECT`) a usuarios autenticados o miembros del equipo, **nunca encadenar `.select()` ni `.select().single()`** en `supabase.from('...').insert([payload])`.
- Encadenar `.select()` fuerza a PostgREST a solicitar `RETURNING *`, lo que dispara un error `403 RLS Violation`.
- Enviar siempre el objeto `payload` del cliente a las Edge Functions de notificación (`notify-lead-tdr`).

### 4.2 Configuración y Hooks de Supabase Realtime
- **Identidad de Réplica:** Toda tabla suscrita a `supabase_realtime` debe configurarse con `ALTER TABLE public.<tabla> REPLICA IDENTITY FULL;` para garantizar que los eventos `UPDATE` y `DELETE` contengan los estados anteriores y posteriores.
- **Idempotencia en Publicaciones:** Gestionar la publicación `supabase_realtime` verificando previamente su existencia en `pg_publication_tables`.
- **Limpieza de Canales en React:** Los hooks reactivos (`useRealtimeTeam`, `useClientProjects`) deben almacenar la referencia retornada por `supabase.channel(...)` y ejecutar `supabase.removeChannel(channel)` en el retorno del `useEffect`.

### 4.3 Buzón y Enrutamiento de Correos
- La dirección institucional operativa de la firma para cotizaciones, soporte y Tech Leads es **`inmerge3@gmail.com`** (a la espera de la configuración de registros MX para `@inmerge.pe`).

### 4.4 Protección Anti-Spam, Honeypots y Rate Limiting
- **Honeypot Silencioso (Shadow Ban):** Formularios públicos (como `/contacto`) deben incluir un campo oculto `website_url_hp` (fuera de pantalla y `tabIndex="-1"`). Si un bot lo completa, el SDK cliente debe retornar `{ success: true, isSpamFiltered: true }` sin realizar inserción en base de datos ni invocar Edge Functions.
- **Rate Limiting en PostgreSQL:** En tablas de prospección (`leads_tdr`), restringir a máx. 3 envíos por email por hora mediante trigger `BEFORE INSERT` apoyado en el índice `idx_leads_tdr_email_created_at (email, created_at DESC)`.
- **Auditoría de Spam:** Registrar intentos bloqueados bajo la acción `SPAM_LEAD_BLOCKED` en `team_activity_logs`.
- **Segmentación UX de Errores:** En la UI, capturar el código `RATE_LIMIT_EXCEEDED` para mostrar un banner informativo y suprimir el fallback `mailto:`, canalizando al usuario hacia WhatsApp.

### 4.5 Convenciones de Project Management (PM), Progreso Dinámico e Imputación de Horas
- **Estados de Salud RAG:** Los proyectos deben calcular y admitir únicamente los estados de salud: `'ON_TRACK'`, `'AT_RISK'`, `'DELAYED'`, `'BLOCKED'`.
- **Estados de Hitos (`project_milestones`):** `'PENDING'`, `'IN_PROGRESS'`, `'COMPLETED'`, `'DELAYED'`.
- **Progreso Dinámico de Proyecto:** La tabla `client_projects` no contiene columna `progress`. El porcentaje de avance (0-100%) se calcula en cliente mediante `calculateProjectProgress(milestones, tasks)` ponderando hitos completados y tareas finalizadas.
- **Control e Imputación de Horas Técnicas (`project_tasks`):** Las tareas registran `estimated_hours` y `actual_hours`. El panel `/equipo` (`ProjectTaskManager.jsx`) permite a los consultores y administradores imputar e incrementar horas reales interactivamente mediante `updateProjectTask(taskId, { actual_hours })`.
- **Paridad de Migraciones:** Toda nueva migración `000X_*.sql` debe mantenerse idéntica tanto en `supabase/migrations/` (raíz) como en `web/app/supabase/migrations/`.

### 4.6 Facturación B2B y Pagos Exclusivos por Transferencia Bancaria
- **Método de Pago Único:** Inmerge opera bajo modelo de consultoría B2B y acepta exclusivamente pagos mediante **Transferencia Bancaria Directa** (`transferencia_bancaria`) en Soles (PEN) a sus cuentas corrientes institucionales (BCP, Interbank, BBVA). No utilizar pasarelas de tarjeta ni débitos automáticos.
- **Validación Estricta de RUC:** Toda solicitud de facturación B2B (`createBillingOrder`) exige un RUC peruano válido de exactamente 11 dígitos numéricos que inicie con `10`, `15`, `16`, `17` o `20`.
- **Validación de Montos:** Los importes a facturar deben ser números positivos estrictos (`amount > 0`).
- **Suscripción Realtime en Facturación:** El hook `useOrganizationBilling` escucha eventos en tiempo real sobre `billing_orders` para reflejar instantáneamente aprobaciones o rechazos de órdenes de pago.

### 4.7 Matriz de Roles, Seguridad y Control de Acceso (RBAC)
- **`admin`**: Control administrativo total sobre `/equipo`. Es el único rol facultado para crear y modificar proyectos, alterar estados (`status`) y salud RAG (`health_status`), gestionar hitos (`project_milestones`), convertir solicitudes de leads TDR a proyectos y designar/reasignar ingenieros y auditores como responsables técnicos. Acceso opcional a previsualización del portal de cliente.
- **`engineer` & `auditor`**: Acceso al panel `/equipo` para consulta técnica, visualización de tareas asignadas e imputación de horas de trabajo en tareas (`project_tasks`). Todos los selectores estructurales de proyectos, hitos y leads se presentan en modo bloqueado (`🔒`) de solo lectura. **Tienen terminantemente prohibido el acceso al portal de clientes (`/cuenta`)**, siendo redirigidos automáticamente a `/equipo` por `ProtectedRoute.jsx` y `Cuenta.jsx`.
- **`client`**: Acceso exclusivo a `/cuenta` para dar seguimiento a sus proyectos, descargar entregables y gestionar pagos bancarios.
- **Trazabilidad Inmutable**: Toda reasignación de personal técnico y cambio de estado se registra de forma inmutable en `team_activity_logs`.

---

## 5. Estándares de Testing (Vitest + Testing Library)
- **Defensiva para jsdom:** En componentes que invoquen `useReveal`, asegurarse de que `IntersectionObserver` esté protegido o mockeado en [`src/test-setup.js`](file:///c:/papx/inmerge-website/inmerge/web/app/src/test-setup.js).
- **Comandos de Verificación:**
  ```bash
  cd web/app
  npm test          # Ejecuta suite completa (20 suites, 104+ tests)
  npm run build     # Valida el bundle de producción en Vite
  npm run lint      # Verifica ausencia de warnings de ESLint
  npm run format    # Aplica formato consistente con Prettier
  ```


