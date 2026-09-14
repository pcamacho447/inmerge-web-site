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

## 4. Estándares de Testing (Vitest + Testing Library)
- **Defensiva para jsdom:** En componentes que invoquen `useReveal`, asegurarse de que `IntersectionObserver` esté protegido o mockeado en [`src/test-setup.js`](file:///c:/papx/inmerge-website/inmerge/web/app/src/test-setup.js).
- **Comandos de Verificación:**
  ```bash
  cd web/app
  npm test          # Ejecuta suite completa (48+ tests)
  npm run build     # Valida el bundle de producción en Vite
  npm run lint      # Verifica ausencia de warnings de ESLint
  npm run format    # Aplica formato consistente con Prettier
  ```
