# Tareas y Backlog de Historias de Usuario (tasks.md) — Inmerge

Historias de usuario derivadas del PRD (`docs/prd.md`), la Arquitectura (`docs/architecture.md`) y la Especificación de Diseño (`docs/design.md`), incluyendo las tareas pendientes del rediseño UX en curso.

Cada historia de frontend seguirá el flujo disciplinado de **Superpowers**, implementada por **voltagent-core-dev**, respaldada por **modern-web-guidance** para estándares y coordinada por **voltagent-meta** cuando involucre piezas transversales.

---

## Épica 1: Rediseño UX — Lienzo Continuo y Saneamiento de Falsos Botones

### Historia 1.1: Saneamiento de Falsos Botones y Aplanamiento de Cards [COMPLETADA]

- **ID:** `TASK-UX-01`
- **Estado:** ✅ Completada y Verificada (2026-09-21)
- **Agentes:** `voltagent-core-dev` + `modern-web-guidance`
- **Contexto:** Actualmente existen tarjetas con sombras difusas pesadas y badges/etiquetas técnicas que usuarios confunden con botones por tener cursores o bordes interactivos.
- **Alcance & Criterios de Aceptación:**
  1. En `web/app/src/styles/index.css`, auditar y aplanar las tarjetas de contenido: eliminar `box-shadow` pesadas, aplicar fondos limpios en `--cream2` o transparentes sobre el sustrato arena `--bg` con borde fino de 1px (`--border`). (Completado).
  2. Ajustar componentes de badges (`MochicaPatterns`, etiquetas de pilares, tags de tecnologías en `ProjectCarousel` y `Nosotros`):
     - Asignar estrictamente `cursor: default`. (Completado).
     - Remover cualquier pseudoclase `:hover` con traslación vertical o sombras de botón. (Completado).
     - Dejar el aspecto de botón (`.btn-accent`, `.btn-outline`) exclusivamente para elementos `<a>` y `<button>` con acciones reales. (Completado).
- **Verificación:** Pruebas unitarias de renderizado y verificación visual en DOM. 38 suites pasando al 100%.

### Historia 1.2: Purificación Radical de `/servicios` y Exhibición Monumental del Prototipo [COMPLETADA]

- **ID:** `TASK-UX-02`
- **Estado:** ✅ Completada y Verificada (2026-09-21)
- **Agentes:** `voltagent-core-dev` + `modern-web-guidance`
- **Contexto:** `/servicios` debe ser un lienzo continuo puro y minimalista. Se eliminan las cabeceras publicitarias redundantes y el banner inferior de cierre; la Cédula Curatorial se convierte en la protagonista total, incorporando una ventana de exhibición monumental (16:9) con fotografía/video del prototipo real de la solución activa.
- **Alcance & Criterios de Aceptación:**
  1. En `Servicios.jsx`, suprimir el bloque de cabecera exterior y el banner inferior beige de combinaciones con botón dorado. (Completado: página reducida a 54 líneas continuas).
  2. En `QuickEstimator.jsx`, integrar la **Ventana de Exhibición Monumental**:
     - Marco de 1px (`--border`) en relación de aspecto 16:9 / 16:10.
     - Etiqueta de sala en `Space Mono`: `[ ESPECÍMEN EN SALA — VISTA DE PROTOTIPO 1:1 ]`.
     - Fotografía de alta fidelidad del entregable/prototipo correspondiente a cada una de las 9 soluciones del catálogo (conectando activos reales de `/projects/`).
     - Transición suave al alternar de solución con respeto a `prefers-reduced-motion`.
  3. Establecer el título de la Cédula como el `<h1>` semántico principal de la página, con padding superior elegante para el Header de navegación.
  4. Mantener paridad bilingüe en `/en/services` y enlaces directos a WhatsApp y TDR.
- **Verificación:** `npm test src/pages/Servicios.test.jsx` (4/4 tests pasando) y `npm test` completo (38 suites, 209 tests pasando). Build validado (2.65s).

### Historia 1.3: Consolidación de Lienzo Continuo en `/nosotros` y `/en/about` [COMPLETADA]

- **ID:** `TASK-UX-03`
- **Estado:** ✅ Completada y Verificada (2026-09-21)
- **Agentes:** `voltagent-core-dev` + `modern-web-guidance`
- **Contexto:** `/nosotros` debe presentar el Manifiesto de Ingeniería, el Método Mochica (Bento de 4 fases), el equipo de Directores y el Stack tecnológico de forma integrada sobre un único lienzo continuo.
- **Alcance & Criterios de Aceptación:**
  1. Homogeneizar el fondo de `Nosotros.jsx` a `--bg: #F3EADA` sin franjas oscuras intermedias. (Completado).
  2. Armonizar el ritmo vertical y espaciado: suprimir apilamientos de márgenes y paddings de 300px entre Misión, Directores, Método y CTA. Calibrado a `clamp(48px, 6vh, 64px)`. (Completado).
  3. Las 4 fases del Método Mochica en el Bento Grid usan superficies planas con marcos Mochica escalonados. (Completado).
  4. El carrusel de directores (`DirectorsCarousel`) opera con scroll virtual continuo y márgenes compactos. (Completado).
  5. Preservar la localización completa en `/en/about`. (Completado).
- **Verificación:** `npm test src/pages/Nosotros.test.jsx` (4/4 tests) y suite completa (38/38 suites, 209 tests).

### Historia 1.4: Consolidación de Lienzo Continuo en `/contacto` y `/en/contact` [COMPLETADA]

- **ID:** `TASK-UX-04`
- **Estado:** ✅ Completada y Verificada (2026-09-21)
- **Agentes:** `voltagent-core-dev` + `modern-web-guidance`
- **Contexto:** `/contacto` debe ser un lienzo continuo editorial con el formulario estructurado TDR y acceso directo a WhatsApp sin divisiones artificiales.
- **Alcance & Criterios de Aceptación:**
  1. Asegurar que `Contacto.jsx` fluya sobre el lienzo mineral sin franjas contrastantes ni fracturas de 140px de espacio muerto. (Completado: padding superior e inferior armonizado).
  2. Integración de `<MochicaDivider />` continuo para anclar el encabezado al espacio de requerimientos. (Completado).
  3. Normalización tipográfica estricta: erradicación de `'IBM Plex'` a favor de `var(--font-sans)` y `var(--font-mono)`. (Completado).
  4. Formulario plano con inputs de alta legibilidad (`--border`, focus terracota). (Completado).
  5. Mantener y verificar la validación de campos, honeypot anti-spam y rate limiting. (Completado).
  6. Paridad en `/en/contact`. (Completado).
- **Verificación:** `npm test src/pages/Contacto.test.jsx` (4/4 tests) y suite global de pruebas (38 suites, 209 tests).

---

## Épica 2: Alineación Canónica de las Tres Líneas de Servicio

### Historia 2.1: Actualización de Contenido y Diccionarios a las 3 Líneas de Servicio [COMPLETADA]

- **ID:** `TASK-SRV-01`
- **Estado:** ✅ Completada y Verificada (2026-09-21)
- **Agentes:** `voltagent-core-dev` + `voltagent-meta`
- **Contexto:** Reemplazar referencias mixtas u obsoletas por las 3 líneas oficiales: **Páginas Web**, **Ingeniería de Software**, e **Inteligencia de Negocios**.
- **Alcance & Criterios de Aceptación:**
  1. Actualizar diccionarios de contenido en `web/app/src/data/content.es.js` y `web/app/src/data/content.en.js` para articular formalmente:
     - Línea 01: Páginas Web (Web Development / High-Performance Websites). (Completado).
     - Línea 02: Ingeniería de Software (Software Engineering & Cloud Architecture). (Completado).
     - Línea 03: Inteligencia de Negocios (Business Intelligence & Data Auditing). (Completado).
  2. Reflejar estas tres líneas en `QuickEstimator`, catálogo curatorial de prototipos y selectores de solución. (Completado).
  3. Actualizar selectores en el formulario TDR de `Contacto.jsx` para listar las opciones con precisión. (Completado).
- **Verificación:** Pruebas de renderizado de contenido en español e inglés. 38 suites pasando al 100%.

### Historia 2.2: Implementación de la "Cédula Curatorial de Ingeniería" (`QuickEstimator`) [COMPLETADA]

- **ID:** `TASK-SRV-02`
- **Estado:** ✅ Completada y Verificada (2026-09-21)
- **Agentes:** `voltagent-core-dev` + `modern-web-guidance`
- **Contexto:** En lugar de una calculadora SaaS con sprints fijos o tarjetas encimadas, transformar el cotizador en una Monografía Curatorial a lienzo total (`100vw`) inspirada en galerías de arte contemporáneo (estilo Tate / Fondazione Prada) sobre el sustrato arena mineral (`--bg`).
- **Alcance & Criterios de Aceptación:**
  1. Diseñar el componente plano estructurado en rejilla de 1px (`--border`), sin sombras proyectadas (`box-shadow: none`). (Completado).
  2. Implementar el selector tipográfico horizontal de las 3 Líneas de Servicio (`01 Páginas Web`, `02 Ingeniería de Software`, `03 Inteligencia de Negocios`) accesible mediante `role="tablist"` y `aria-selected`. (Completado).
  3. Sustituir falsos botones "pills" por un índice tipográfico corrido de sala (`.gallery-specimens-index`). (Completado).
  4. Ventana de Exhibición Monumental panorámica en la capa superior con imagen de prototipo 1:1, coordenadas geográficas Mochica, código de inventario y transición _cross-fade_ acelerada por GPU. (Completado).
  5. Modo inspección a pantalla completa (_Curatorial Lightbox 1:1_) accesible con `role="dialog"`, `aria-modal="true"`, atajo `[ ESC ]` y cierre al click en backdrop. (Completado).
  6. Navegación fluida por atajos de teclado (`[ ← ]` / `[ → ]`) para alternar entre especímenes. (Completado).
  7. Gran banco curatorial horizontal de 4 columnas (Registro/Moneda, Ámbito/Memoria, Entregables/SLA, Inversión/Acciones) con enlace directo a WhatsApp y consulta con Alaec IA. (Completado).
- **Verificación:** Pruebas unitarias en `src/components/QuickEstimator.test.jsx` (10/10 tests pasando) y suite global de pruebas (38 suites, 209 tests al 100%). Build de producción validado en 2.65s.

---

## Épica 3: Estándares Web Modernos, View Transitions & Accesibilidad

### Historia 3.1: Envolvente View Transitions y Accesibilidad WCAG 2.1 AA [COMPLETADA]

- **ID:** `TASK-MWG-01`
- **Estado:** ✅ Completada y Verificada (2026-09-21)
- **Agentes:** `voltagent-core-dev` + `modern-web-guidance`
- **Contexto:** Garantizar que las microinteracciones sigan las mejores prácticas de la web moderna sin parpadeos ni problemas de contraste.
- **Alcance & Criterios de Aceptación:**
  1. Conmutación de idioma en `LanguageContext.jsx` protegida con `document.startViewTransition` con fallback seguro. (Completado).
  2. Auditoría de contraste WCAG 2.1 AA en todas las combinaciones de color (texto sobre `--bg`, `--cream2` y estado activo del selector). (Completado).
  3. Navegación por teclado en tabs (`role="tablist"`), drawers y modales (`role="dialog"`) con manejo de foco y teclas de cursor (`ArrowRight`/`ArrowLeft`, `Home`/`End`, `Escape`). (Completado).
- **Verificación:** Pruebas unitarias de navegación y accesibilidad.

---

## Épica 4: Calidad y Verificación Integral

### Historia 4.1: Mantenimiento del 100% de la Suite de Pruebas & Build Limpio [COMPLETADA]

- **ID:** `TASK-QA-01`
- **Estado:** ✅ Completada y Verificada (2026-09-21)
- **Agentes:** `voltagent-dev-exp` + `voltagent-core-dev`
- **Contexto:** Ninguna refactorización debe introducir regresiones en las 38 suites existentes.
- **Alcance & Criterios de Aceptación:**
  1. Aserciones actualizadas en `.test.jsx` reflejando las 3 líneas de servicio y el rediseño editorial. (Completado).
  2. 100% de pruebas (38 suites, 209 tests) pasando exitosamente con `npm test`. (Completado).
  3. `npm run build` ejecutando limpiamente sin errores de empaquetado (2.65s). (Completado).
- **Verificación:** Salida en verde de Vitest y Vite build.

---

## Épica 5: Revisión, Auditoría y Endurecimiento del Backend (Próxima Fase)

### Historia 5.1: Auditoría de Migraciones PostgreSQL y Consistencia de Esquema

- **ID:** `TASK-BE-01`
- **Agentes:** `voltagent-core-dev` + `voltagent-infra`
- **Contexto:** Verificar que todas las migraciones en `supabase/migrations/` coincidan exactamente con las tablas, índices, triggers y vistas utilizadas por el frontend (`clients`, `projects`, `project_milestones`, `project_deliverables`, `leads_tdr`, `orders`, `team_activity_logs`).
- **Alcance:**
  1. Revisar orden correlativo de migraciones (`0001` a `0006` y `20260915003802_remote_schema.sql`).
  2. Validar índices compuestos de búsqueda rápida y de rate limiting.
  3. Ejecutar script de verificación de paridad `npm test scripts/verify-migrations-parity.test.mjs`.

### Historia 5.2: Auditoría de Row Level Security (RLS) y Políticas de Acceso

- **ID:** `TASK-BE-02`
- **Agentes:** `voltagent-core-dev`
- **Contexto:** Garantizar que ninguna tabla exponga datos sensibles corporativos a consultas públicas anónimas.
- **Alcance:**
  1. Auditar políticas RLS en `public.profiles`, `public.projects`, `public.project_deliverables`, `public.orders`.
  2. Verificar que las inserciones anónimas públicas en `leads_tdr` sigan el patrón de inserción segura sin lectura.
  3. Validar permisos de inmutabilidad en `team_activity_logs` (`REVOKE UPDATE, DELETE`).

### Historia 5.3: Auditoría de Edge Functions & Almacenamiento (Storage)

- **ID:** `TASK-BE-03`
- **Agentes:** `voltagent-core-dev`
- **Contexto:** Revisar la robustez y fallbacks de las funciones Deno en Supabase.
- **Alcance:**
  1. Auditar `notify-lead-tdr` (sanitización de payloads entrantes, alertas por correo/webhook y resiliencia).
  2. Auditar `secure-download` (generación de Presigned URLs temporales de 60 segundos sobre el bucket privado `project-deliverables`).
  3. Verificar fallbacks de cliente ante desconexión o indisponibilidad momentánea de las Edge Functions.

### Historia 5.4: Auditoría de Supabase Realtime & WebSockets

- **ID:** `TASK-BE-04`
- **Agentes:** `voltagent-core-dev`
- **Contexto:** Asegurar que los canales de suscripción en tiempo real (`useRealtimeTeam`, `team_activity_logs`) funcionen sin fugas de memoria ni reconexiones agresivas.
- **Alcance:**
  1. Verificar publicación `supabase_realtime` con `REPLICA IDENTITY FULL`.
  2. Probar resiliencia ante `CHANNEL_ERROR` y reconexión exponencial.
