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

---

## 5. Estándares de Testing (Vitest + Testing Library)
- **Defensiva para jsdom:** En componentes que invoquen `useReveal`, asegurarse de que `IntersectionObserver` esté protegido o mockeado en [`src/test-setup.js`](file:///c:/papx/inmerge-website/inmerge/web/app/src/test-setup.js).
- **Comandos de Verificación:**
  ```bash
  cd web/app
  npm test          # Ejecuta suite completa (12 suites, 59+ tests)
  npm run build     # Valida el bundle de producción en Vite
  npm run lint      # Verifica ausencia de warnings de ESLint
  npm run format    # Aplica formato consistente con Prettier
  ```

