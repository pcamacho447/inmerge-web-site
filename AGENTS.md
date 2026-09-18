# Directrices del Proyecto Inmerge

Inmerge es una firma boutique de consultoría en ingeniería de software, auditoría de sistemas y ciencia de datos (Lima, Perú).

Consulte las especificaciones técnicas del entorno en:
- [Guía de Arquitectura, Diseño & Testing](file:///c:/papx/inmerge-website/inmerge/.agents/rules/inmerge-brand-architecture.md)

---

## 1. Los Tres Pilares Estratégicos
1. **Pilar 01 — Auditoría Técnica y de Datos:** Calidad e integridad de bases de datos, detección de duplicados/inconsistencias, auditoría de sistemas cloud (AWS/GCP), seguridad y cumplimiento normativo.
2. **Pilar 02 — Desarrollo Tecnológico & Cloud:** Arquitectura cloud en AWS (ECS, Lambda, RDS, S3), microservicios, software empresarial a medida, APIs y modernización de sistemas.
3. **Pilar 03 — Ciencia de Datos & Inteligencia Artificial:** Machine Learning, modelos predictivos, forecasting, integración de IA generativa/agentes y dashboards ejecutivos en tiempo real.

---

## 2. Reglas de Navegación y Rutas
- **Rutas Públicas:**
  - `/` (Inicio): Hero con video de fondo cinemático, navbar transparente sin bordes sobre el video, pilares interactivos, diagrama de arquitectura y segmentos de mercado directos al CTA. No incluir bloques redundantes del manifiesto, la cuadrícula de "Principios de Ingeniería" (reservada para `/nosotros`) ni franjas intermedias de certezas o marquesinas repetitivas.
  - `/servicios` (Servicios & Estimación Ágil): Interfaz centrada exclusivamente en el Estimador Interactivo (`<QuickEstimator />`) para proyectar tiempos, costos en PEN/USD, entregables auditables por pilar y cotización directa vía WhatsApp/TDR/Asistente IA. Prohibido reintroducir el catálogo estático de acordeones repetitivos o carruseles de proyectos redundantes.
  - `/nosotros` (Nosotros): Manifiesto de ingeniería, Misión, Visión, Propósito, Compromisos técnicos (Valores), Método Inmerge y explorador de tecnologías (Stack).
  - `/contacto` (Contacto & TDR): Formulario estructurado con selector de pilares y enlace con mensaje pre-rellenado a WhatsApp.
- **Estructura del Header Público:**
  - 4 enlaces principales: `Inicio`, `Servicios`, `Nosotros`, `Contacto` más botón lateral `Iniciar sesión` (el acceso a WhatsApp se canaliza en los CTAs de pilares, servicios y contacto).
- **Arquitectura Bilingüe & Rutas en Inglés:**
  - Rutas públicas espejo: `/en` (Home), `/en/services` (Services), `/en/about` (About Us), `/en/contact` (Contact), `/en/cookies` (Cookie Policy), `/en/login` (Sign In), `/en/register` (Create Account), `/en/account` (Client Portal).
  - Selector de idioma: Componente minimalista editorial tipo píldora `ES | EN` en el Header público (desktop y móvil) con accesibilidad WCAG 2.1 AA (`role="group"`, `aria-pressed`).
  - Enfoque *zero-bloat*: Gestión mediante React Context nativo (`LanguageContext.jsx`) con diccionarios tipados (`content.en.js`, `stack.en.js`). Prohibido introducir librerías pesadas de i18n como `react-i18next`.
  - Micro-interacciones & View Transitions: Envolver la conmutación de idioma en `document.startViewTransition` con fallback progresivo.
  - SEO Internacional: Inyección dinámica de etiquetas `<link rel="alternate" hreflang="es|en|x-default">`, `og:locale` (`es_PE` / `en_US`), `og:locale:alternate` y atributo `inLanguage` en Schema.org JSON-LD.
  - Autenticación y Portal de Clientes Bilingüe (`/login` <-> `/en/login`, `/registro` <-> `/en/register`, `/cuenta` <-> `/en/account`): Experiencia espejo bilingüe completa para clientes. Formularios accesibles con autocompletado nativo (`autoComplete="username"`, `current-password`, `new-password`), titulares semánticos `<h1>` y gestión fiscal dual (RUC 11 dígitos y transferencias en PEN para clientes peruanos; Tax ID flexible y transferencias internacionales SWIFT/MSA para clientes globales).
  - Panel de Consultores & Equipo (`/equipo`): Se mantiene exclusivamente en español para la operación interna del equipo de ingeniería en Lima.
- **Rutas de Autenticación & Clientes:**
  - `/login`, `/registro`, `/cuenta` (Portal de Clientes): Seguimiento exclusivo de proyectos propios, cronogramas e informes técnicos para usuarios `client` y `admin`. Los ingenieros y auditores (`engineer`, `auditor`) son redirigidos obligatoriamente a `/equipo`.
  - `/equipo` (Consola Editorial Full-Canvas & Operaciones): Panel de operaciones de pantalla completa (100vw/100vh) con resumen Bento KPI, Paleta de Comandos global (`⌘K` / `Ctrl+K`) para búsqueda difusa instantánea, espacio de trabajo Maestro-Detalle Split (60/40), Tablero Kanban de Fases Metodológicas Inmerge y Slide-Over Drawer segmentado (`[🚀 Proyecto]`, `[⚡ Hito]`, `[📦 Entregable]`, `[👥 Staff]`). Se mantiene exclusivamente en español. Solo `admin` puede modificar estados de proyectos/hitos/leads, crear proyectos y designar staff.
    - **Gestión In-Situ de Entregables:** La publicación y descarga forense de entregables técnicos (`project_deliverables`) se gestiona directamente dentro de cada tarjeta de proyecto (subpestaña `PM_DELIVERABLES`). Toda descarga debe emplear enlaces firmados temporales auditados (`getSignedDeliverableUrl`).
    - **Navegación Accesible (WCAG 2.1 AA):** Los módulos principales del panel implementan el patrón estándar `role="tablist"` / `role="tab"` / `role="tabpanel"` con navegación fluida por teclado (`ArrowRight`, `ArrowLeft`, `ArrowUp`, `ArrowDown`, `Home`, `End`).
- **Restricciones de Negocio & Pagos:**
  - No reintroducir catálogos de reportes fiscales ni descargas cerradas de PDFs.
  - **Medio de Pago Exclusivo:** Se aceptan única y exclusivamente **Transferencias Bancarias Directas** a cuentas institucionales de Inmerge (BCP, Interbank, BBVA en PEN). Toda orden se gestiona con código correlativo (`INM-ORD-...`) y validación de RUC (11 dígitos).

---

## 3. Sistema de Diseño (Editorial Tech Premium)
- **Paleta de Identidad:**
  - Arena: `--bg` (`#F3EADA`) — Superficie principal.
  - Tinta: `--ink` (`#241A12`) — Tipografía y fondos oscuros.
  - Terracota: `--terracotta` (`#A8472B`) — Acento de marca y botones primarios.
  - Oro: `--gold` (`#D8A84E`) — Destacados e indicadores de calidad.
  - Ocre: `--ochre` (`#C68A3D`) — Elementos secundarios.
  - Crema: `--cream2` (`#EBDFC9`) — Fondos de tarjetas y paneles alternos.
- **Tipografía (Tokens CSS Variables):**
  - `Space Grotesk` (`--font-display`, `--font-sans`): Titulares, logotipo, cuerpo de texto editorial, interfaz de usuario y formularios.
  - `Space Mono` (`--font-mono`): Cifras tabulares, métricas, telemetría técnica, coordenadas, badges y código.
  - **Regla de Tokens:** Toda declaración tipográfica en componentes y estilos debe utilizar variables CSS (`var(--font-display)`, `var(--font-sans)`, `var(--font-mono)`) evitando cadenas tipográficas hardcodeadas para mantener agilidad en futuros cambios de marca.
- **Micro-interacciones:** Usar clases estándar (`.btn-accent`, `.btn-outline`, `.pillar-card-interactive`, `.card-hover`, `.stack-tool-card`).
- **Política de Notificaciones (Prohibición de `window.alert`):** Queda terminantemente prohibido el uso de `window.alert()` o diálogos nativos bloqueantes. Toda notificación, alerta o feedback de operación debe canalizarse mediante `ToastNotification.jsx` usando `role="alert"` (errores/RBAC denegado) o `role="status"` (éxito y Supabase Realtime).

---

## 4. Patrones de Interacción y Componentes
- **Carruseles Infinitos 360°:** Todo carrusel continuo debe utilizar transformaciones aceleradas por GPU (`transform: translate3d`) con buffer virtual triplicado (`3 * N`) y rebase silencioso a 0ms en `onTransitionEnd`. Prohibido el uso de `scrollLeft` nativo con `scroll-behavior: smooth` para ciclos infinitos.

---

## 5. Estándares de Código y Calidad
1. **Testing:** Ejecutar `npm test` en `web/app` antes de cada commit. Las 34 suites de pruebas (178+ tests) deben pasar al 100%.
2. **Build de Producción:** Verificar que `npm run build` compile limpiamente sin errores de bundling.
3. **Formato y Linter:** Mantener conformidad con `npm run lint` y `npm run format`.

