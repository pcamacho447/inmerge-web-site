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
4. **[`Nav.jsx`](file:///c:/papx/inmerge-website/inmerge/web/app/src/components/Nav.jsx) y Video Hero Cinemático:**
   - En `/` (Landing), el Navbar se sobrepone de forma transparente (`background: transparent`) y sin borde divisor inferior (`border-bottom: none`) sobre el video de fondo (`hero_inmerge.mp4`). Al hacer scroll (`scrollY > 40`), transiciona fluidamente a fondo acrílico (`rgba(243, 234, 218, 0.95)`, `backdrop-filter: blur(8px)` y borde sutil).
   - El header público cuenta estrictamente con 4 enlaces principales (`Inicio`, `Servicios`, `Nosotros`, `Contacto`) y un botón de acción a la derecha (`Iniciar sesión`).
5. **Concisión del Landing Page (`/`):**
   - El landing page debe mantenerse ágil y directo al objetivo de conversión. No reintroducir sliders de citas duplicadas ni la cuadrícula de "Principios de Ingeniería" (`VALUES`), cuyos compromisos viven oficialmente en `/nosotros`.
6. **Estándares de Formularios y Accesibilidad (Modern Web Guidance):**
   - Todo formulario de inicio de sesión (`Login.jsx`), registro (`Registro.jsx`) o contacto (`Contacto.jsx`) debe implementar titulares semánticos `<h1>` y atributos nativos de autocompletado para compatibilidad con gestores de contraseñas: `autoComplete="username"` y `autoComplete="current-password"` en login; `autoComplete="name"`, `autoComplete="username"` y `autoComplete="new-password"` en registro. Las etiquetas y placeholders deben consumirse desde diccionarios centralizados tipados (`AUTH_CONTENT`).
7. **[`ToastNotification.jsx`](file:///c:/papx/inmerge-website/inmerge/web/app/src/components/ToastNotification.jsx) y Feedback No Invasivo:**
   - Componente flotante editorial para notificaciones en vivo.
   - Tipos soportados: `error` (`var(--terracotta)`, `role="alert"`, `aria-live="assertive"`), `success` (`#2E7559`, `role="status"`), `warning` (`var(--gold)`), `info` (`var(--ink)`), `lead` (`🔔`), `deliverable` (`📦`), `milestone` (`✨`), `project` (`📂`).
   - Se prohíbe el uso de `window.alert()`, `window.confirm()` o diálogos bloqueantes nativos en cualquier vista de la plataforma.
8. **Navegación por Pestañas Accesibles (WCAG 2.1 AA Tablist Pattern):**
   - Todo contenedor de pestañas (`Equipo.jsx`, `StackTabs.jsx`, etc.) debe implementar la semántica ARIA: `<div role="tablist">`, botones con `role="tab"`, `aria-selected`, `aria-controls` y paneles asociados `<div role="tabpanel">`.
   - Soporte obligatorio de control por teclado mediante `onKeyDown`: `ArrowRight` y `ArrowLeft` para conmutar tabs cíclicamente, `Home` para el primer tab y `End` para el último tab, enfocando el elemento correspondiente.
9. **Rendimiento de Renderizado en Listas Extensas & Tablas:**
   - En feeds de actividad o bitácoras (`TeamActivityFeed.jsx`), aplicar `content-visibility: auto` y `contain-intrinsic-size: 0 80px` en cada fila para optimizar el trabajo del hilo principal y la memoria del navegador.
   - En tablas con filtrado en tiempo real (`LeadsInboxTable.jsx`), memoizar el procesamiento de datos con `useMemo`.
10. **Carruseles Continuos 360° Infinitos (Hardware-Accelerated Transform):**
   - Todo componente de carrusel continuo (`ProjectCarousel.jsx`) debe utilizar transformaciones CSS aceleradas por GPU (`transform: translate3d(translateX, 0, 0)`) sobre un buffer virtual triplicado (`3 * N`).
   - Prohibido el uso de `scrollLeft` con `scroll-behavior: smooth` para ciclos continuos (genera rebobinados visuales hacia atrás).
   - Al completar la animación de transición (`onTransitionEnd`), ejecutar un rebase instantáneo a 0ms sin transición (`withTransition = false`) para garantizar un avance continuo siempre en una sola dirección hacia adelante.
11. **Consola de Operaciones Full-Canvas, Command Palette (⌘K) y Vistas Split/Kanban (`/equipo`):**
    - La vista de equipo opera siempre en modo **Full-Canvas (`100vw` / `100vh`)** con barra superior pegajosa, resumen Bento KPI instantáneo y estado Realtime.
    - **Paleta de Comandos Omnicanal ([`CommandPaletteModal.jsx`](file:///c:/papx/inmerge-website/inmerge/web/app/src/components/team/CommandPaletteModal.jsx)):** Atajo global `Cmd+K` / `Ctrl+K` con búsqueda difusa de proyectos, leads TDR y acciones rápidas (`+ Registrar Proyecto`, `+ Añadir Hito`, `+ Subir Entregable`, `+ Dar de Alta Staff`), accesible según WCAG 2.1 AA (`role="combobox"`, `role="listbox"`, `role="option"`, `↑`/`↓`/`Enter`/`Esc`).
    - **Conmutador de 4 Vistas en Gestión de Proyectos ([`ProjectsManagementView.jsx`](file:///c:/papx/inmerge-website/inmerge/web/app/src/components/team/ProjectsManagementView.jsx)):**
      1. `◫ Split 60/40` (Maestro-Detalle): Selección de proyecto en panel izquierdo y detalle completo (Gantt, tareas, entregables firmados, matriz de riesgos) en inspector lateral sticky.
      2. `☷ Kanban Fases`: Tablero interactivo organizado por las 4 fases metodológicas oficiales de Inmerge (`01 Diagnóstico`, `02 Arquitectura`, `03 Ingeniería/IA`, `04 Certificación`).
      3. `▦ Cuadrícula`: Vista responsive en 2 columnas para monitores anchos.
      4. `☰ Lista`: Vista lineal extendida al 100% de ancho.
    - **Centro de Opciones & Creación Segmentado ([`NewProjectModal.jsx`](file:///c:/papx/inmerge-website/inmerge/web/app/src/components/team/NewProjectModal.jsx)):** Pestañas independientes (`[🚀 Proyecto]`, `[⚡ Hito]`, `[📦 Entregable]`, `[👥 Staff]`) en el Slide-Over Drawer (`.equipo-drawer-panel`) para flujos in-situ sin perder el contexto de trabajo.
12. **Diseño y Propósito de la Ruta `/servicios`:**
    - La página `/servicios` concentra toda la exploración de soluciones mediante el componente **`<QuickEstimator />`**. No debe incluir listados estáticos redundantes de servicios ni duplicar el carrusel de casos de estudio (el cual pertenece exclusivamente a `/` Inicio).

---

## 3. Micro-interacciones y CSS Tokens
- **Tokens Tipográficos Centralizados:**
  - Todo componente debe utilizar `var(--font-display)` para titulares / logotipos, `var(--font-sans)` para textos generales y `var(--font-mono)` para métricas, badges, etiquetas de telemetría y coordenadas.
  - Las fuentes activas en producción son `Space Grotesk` y `Space Mono`. Toda modificación tipográfica global debe realizarse centralizadamente en los tokens `:root` de `web/app/src/styles/index.css`.
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
- **Método de Pago Único & Gestión Dual:** Inmerge opera bajo modelo de consultoría B2B y acepta exclusivamente pagos mediante **Transferencia Bancaria Directa** (`transferencia_bancaria`) a cuentas corrientes institucionales. No utilizar pasarelas de tarjeta ni débitos automáticos.
  - **Clientes Nacionales (Perú):** Operación en Soles (PEN) a cuentas BCP, Interbank y BBVA con validación estricta de RUC peruano (11 dígitos numéricos que inicien con `10`, `15`, `16`, `17` o `20`).
  - **Clientes Internacionales:** Coordinación mediante transferencia institucional internacional (código SWIFT) o acuerdos de servicio corporativos (MSA) en USD/EUR, con soporte de Tax ID / VAT / EIN flexible en `/en/register` y `/en/account`.
- **Validación de Montos:** Los importes a facturar deben ser números positivos estrictos (`amount > 0`).
- **Suscripción Realtime en Facturación:** El hook `useOrganizationBilling` escucha eventos en tiempo real sobre `billing_orders` para reflejar instantáneamente aprobaciones o rechazos de órdenes de pago.

### 4.7 Matriz de Roles, Seguridad y Control de Acceso (RBAC)
- **`admin`**: Control administrativo total sobre `/equipo`. Es el único rol facultado para crear y modificar proyectos, alterar estados (`status`) y salud RAG (`health_status`), gestionar hitos (`project_milestones`), convertir solicitudes de leads TDR a proyectos y designar/reasignar ingenieros y auditores como responsables técnicos. Acceso opcional a previsualización del portal de cliente.
- **`engineer` & `auditor`**: Acceso al panel `/equipo` para consulta técnica, visualización de tareas asignadas e imputación de horas de trabajo en tareas (`project_tasks`). Todos los selectores estructurales de proyectos, hitos y leads se presentan en modo bloqueado (`🔒`) de solo lectura. **Tienen terminantemente prohibido el acceso al portal de clientes (`/cuenta`)**, siendo redirigidos automáticamente a `/equipo` por `ProtectedRoute.jsx` y `Cuenta.jsx`.
- **`client`**: Acceso exclusivo a `/cuenta` para dar seguimiento a sus proyectos, descargar entregables y gestionar pagos bancarios.
- **Trazabilidad Inmutable**: Toda reasignación de personal técnico y cambio de estado se registra de forma inmutable en `team_activity_logs`.
- **Entregables In-Situ & Descargas Firmadas:**
  - La publicación de entregables técnicos vinculados a hitos se gestiona directamente en `ProjectsManagementView.jsx` bajo la subpestaña `PM_DELIVERABLES`.
  - Toda descarga de entregables adjuntos debe realizarse mediante `getSignedDeliverableUrl(filePath, deliverableId)` (invocando la Edge Function `secure-download` con fallback seguro a Supabase Storage y registro inmutable en `team_activity_logs`).

---

## 5. Estándares de Testing (Vitest + Testing Library) y Despliegue
- **Defensiva para jsdom:** En componentes que invoquen `useReveal`, asegurarse de que `IntersectionObserver` esté protegido o mockeado en [`src/test-setup.js`](file:///c:/papx/inmerge-website/inmerge/web/app/src/test-setup.js).
- **Comandos de Verificación:**
  ```bash
  cd web/app
  npm test          # Ejecuta suite completa (34 suites, 178+ tests al 100%)
  npm run build     # Valida el bundle de producción en Vite
  npm run lint      # Verifica ausencia de warnings de ESLint
  npm run format    # Aplica formato consistente con Prettier
  ```
- **Despliegue en Cloudflare Pages:**
  - El archivo `package.json` en la raíz del repositorio incluye un script `"build"` que compila `web/app` y copia automáticamente el resultado a `dist/` en la raíz. Esto garantiza compilaciones exitosas tanto si Cloudflare Pages está configurado en la raíz (`/`) como en el subdirectorio `web/app`.
- **Entorno PowerShell en Windows:**
  - En PowerShell, no encadenar comandos con `&&` ya que causa error de sintaxis en versiones estándar de Windows. Utilizar `;` o invocar cada comando de forma individual.


