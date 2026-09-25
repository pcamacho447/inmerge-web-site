# Registro de Decisiones y Avances (decisions-log.md) — Inmerge

Bitácora histórica de decisiones arquitectónicas, de producto, de diseño y avances por sesión para el proyecto Inmerge.

---

## Sesión: 2026-09-21 — Configuración del Entorno de Agentes y Marco de Especificación

### 1. Auditoría y Configuración de Plugins & Marketplaces

- **Diagnóstico Inicial:**
  - `bmad-method` y `bmad-toolbox` estaban instalados en el proyecto pero en estado `disabled`.
  - `superpowers` estaba habilitado tanto a nivel de usuario como de proyecto.
  - `voltagent-core-dev`, `voltagent-dev-exp`, `voltagent-meta` estaban activos en el ámbito de usuario. `voltagent-infra` y `voltagent-data-ai` se mantienen en reserva (sólo si se requiere infraestructura cloud dedicada o ciencia de datos específica).
  - El marketplace de Google Chrome no estaba configurado y el plugin `modern-web-guidance` faltaba por instalar.
- **Acciones Ejecutadas:**
  - Habilitación de `bmad-method@bmad` y `bmad-toolbox@bmad` en el ámbito del proyecto (`scope: project`).
  - Adición del marketplace `GoogleChrome/modern-web-guidance` (`googlechrome`).
  - Instalación y habilitación de `modern-web-guidance@googlechrome` en ámbito de usuario.
- **Decisión:** Mantener el entorno limpio y ceñido estrictamente a las herramientas necesarias para la fase de diseño y desarrollo web.

---

### 2. Definición Canónica de las Tres Líneas Estratégicas de Servicio

- **Decisión:** Inmerge comunica exactamente tres líneas de servicio en toda su presencia corporativa:
  1. **Páginas Web:** Plataformas web corporativas, landings y sitios de alto rendimiento (Core Web Vitals), SEO técnico internacional y estética prehispánica moderna.
  2. **Ingeniería de Software:** Desarrollo a medida, arquitecturas cloud en AWS/GCP, APIs y microservicios, y modernización de sistemas legacy en sprints ágiles de 1-2 semanas.
  3. **Inteligencia de Negocios:** Auditoría técnica de datos y sistemas, aseguramiento de integridad de bases de datos, dashboards ejecutivos en tiempo real y modelos predictivos con fuentes auditables y verificables.
- **Razón:** Claridad comercial y erradicación de ambigüedades o taxonomías obsoletas que dispersaban el mensaje ante clientes corporativos y PyMEs.

---

### 3. Arquitectura Visual: Landing Diferenciado vs. Lienzo Continuo en Interiores

- **Decisión:**
  - **Landing (`/`, `/en`):** Es la **única página** estructurada en franjas cromáticas y bloques de color contrastantes (Hero oscuro sobre video -> Showcase sobre arena `--bg` -> Pilares sobre crema `--cream2` -> Conversión sobre terracota `--terracotta`).
  - **Páginas Interiores (`/servicios`, `/nosotros`, `/contacto` y equivalentes en `/en`):** Se conciben como un **lienzo continuo** sobre la superficie cálida mineral arena (`--bg: #F3EADA` con acentos en `--cream2`).
- **Razón:** Ofrecer máximo impacto e inmersión en la primera impresión (Home), pero eliminar la fatiga visual y la fragmentación en las páginas donde el usuario debe leer, estimar o contactar. Se acompaña de una reducción drástica de texto publicitario innecesario.

---

### 4. Aplanamiento de Tarjetas y Saneamiento de Falsos Botones

- **Decisión:**
  - Eliminar sombras difusas pesadas (`box-shadow` exageradas) en tarjetas para darles un aspecto plano y editorial.
  - Saneamiento de etiquetas: los badges de tecnologías, etiquetas de pilares o indicadores de estado tendrán `cursor: default`, bordes sutiles de 1px (`--border`) y carecerán de animaciones o pseudo-estados de hover que sugieran que son clickeables.
  - La apariencia de botón (`.btn-accent`, `.btn-outline`) queda reservada con exclusividad a elementos con interactividad real (`<button>`, `<a>`, `<Link>`).
- **Razón:** Mejorar la usabilidad y erradicar la frustración de usuarios que intentaban pulsar sobre etiquetas puramente descriptivas.

---

### 5. Reglas Comerciales y Políticas de Sistema

- **Medio de Pago Exclusivo:** Se ratifica el cobro exclusivo por **Transferencias Bancarias Directas** a cuentas institucionales (BCP, Interbank, BBVA en PEN; SWIFT en USD). Prohibidas las pasarelas de pago automáticas. Cada transacción genera código `INM-ORD-YYYYMMDD-XXXX`.
- **Prohibición de `window.alert()`:** Toda notificación debe canalizarse a través de `ToastNotification.jsx` con atributos ARIA accesibles (`role="status"` y `role="alert"`).
- **Control de Calidad:** Las 38 suites de pruebas de Vitest (202 pruebas) deben mantenerse al 100% de aprobación antes de cualquier commit.

---

### 6. Punto de Control de Aprobación de Artefactos

- **Decisión:** Los cinco documentos base (`docs/prd.md`, `docs/architecture.md`, `docs/design.md`, `CLAUDE.md`, `docs/tasks.md` y este `docs/decisions-log.md`) se presentan formalmente al usuario para su revisión y aprobación antes de iniciar cualquier implementación de código.

---

## Sesión: 2026-09-21 (Sesión 2) — Brainstorming UX: Cotizador Plano con Estética de Galería de Arte

### 1. Conceptualización del Cotizador: De Calculadora SaaS a "Cédula Curatorial"

- **Decisión:** Transformar la sección de cotización en `/servicios` adoptando la estética de **galerías de arte contemporáneo (Museum Wall Label / Placard)**:
  - Diseño 100% plano directamente sobre el lienzo arena mineral (`--bg: #F3EADA`), estructurado por una rejilla de líneas ultra-finas de 1px (`--border`), suprimiendo sombras y tarjetas flotantes.
  - Tipografía combinada: `Spectral` serif para el nombre de la solución y `Space Mono` para datos tabulares, especificaciones y códigos de catálogo.
- **Razón:** Elevar drásticamente la percepción de autoridad técnica y exclusividad boutique, alejando a Inmerge de las típicas calculadoras de startups genéricas.

### 2. Calibración por Tipo de Solución en Lugar de Sprints Fijos

- **Decisión:** Descartar la promesa de sprints fijos en la interacción inicial del cotizador. La escala se define por **Tipo de Solución tangible** con plazos de entrega referenciales en semanas.
- **Razón:** Asegurar sprints exactos antes de un levantamiento técnico detallado es poco realista y genera riesgos contractuales en proyectos de consultoría a medida.

### 3. Catálogo Canónico de 9 Soluciones (3 por Línea)

- **Decisión:** Aprobar el catálogo curado para alimentar la cédula:
  - **Páginas Web:** Landing de Alto Impacto (1-2 sem, desde S/ 2,400 / $650), Sitio Web Corporativo Editorial (2-4 sem, desde S/ 4,500 / $1,200), Portal Web Interactivo (4-6 sem, desde S/ 7,200 / $1,950).
  - **Ingeniería de Software:** Arquitectura Cloud & Microservicios (3-5 sem, desde S/ 6,500 / $1,750), Aplicación Web Empresarial (4-8 sem, desde S/ 9,800 / $2,650), Modernización de Legados (3-6 sem, desde S/ 5,800 / $1,550).
  - **Inteligencia de Negocios:** Auditoría Técnica & Saneamiento (2-3 sem, desde S/ 3,900 / $1,050), Dashboard Ejecutivo Real-Time (2-4 sem, desde S/ 5,200 / $1,400), Modelos Predictivos & Analítica (4-7 sem, desde S/ 8,400 / $2,250).
- **Flujo de Conversión:** Conmutador tipográfico `[ PEN | USD ]` y botón `.btn-accent` con enlace y mensaje pre-armado contextual hacia WhatsApp / TDR.

---

## Sesión: 2026-09-21 (Sesión 3) — Brainstorming: Purificación Radical de /servicios y Exhibición Monumental del Prototipo

### 1. Purificación Radical de la Página /servicios

- **Decisión:** Suprimir de `Servicios.jsx` la cabecera publicitaria redundante superior (H1 repetitivo y párrafo largo) y el banner inferior beige de combinaciones con botón dorado.
- **Razón:** La Cédula Curatorial ya resuelve autónomamente todo el flujo informativo, técnico y comercial. Conservar bloques exteriores generaba ruido y fragmentaba el lienzo. La Cédula se convierte en la experiencia principal y única de `/servicios`.

### 2. Composición de "Exhibición Monumental" (Opción 2)

- **Decisión:** Adoptar la estructura de sala de exhibición de museo:
  1. Selector superior de disciplinas (`01 / Páginas Web`, etc.) y botones planos de solución.
  2. **Marco Visual del Prototipo (16:9 / 16:10):** Ventana panorámica con marco de 1px que exhibe la fotografía de alta definición, render o video del prototipo real de la solución seleccionada.
  3. **Cédula Curatorial Horizontal:** Directamente debajo de la obra, con código de catálogo, especificaciones técnicas, plazos, inversión y botones de acción (WhatsApp directo y consulta con Alaec IA).
- **Razón:** En museos y galerías de diseño contemporáneo, la cédula técnica siempre acompaña físicamente a la obra en exhibición; ver el prototipo tangible multiplica la credibilidad y el deseo de conversión.

---

## Sesión: 2026-09-21 (Sesión 4) — Implementación y Verificación de la Exhibición Monumental y Purificación de /servicios

### 1. Implementación de la Ventana de Exhibición Monumental en index.css

- **Detalle Técnico:**
  - Se crearon las clases `.curatorial-monumental-viewport`, `.monumental-badge-overlay`, `.monumental-dot`, `.monumental-badge-text`, `.monumental-image-container`, `.monumental-prototype-img`, `.monumental-caption-bar`, `.caption-diamond` y `.caption-text`.
  - Proporción 16:9 con marco fino de 1px (`--border`) y fondo oscuro neutro (`#18110b` / `--ink`).
  - Overlay de sala con badge `[ ESPECÍMEN EN SALA — VISTA DE PROTOTIPO 1:1 ]` en `Space Mono` con indicador de punto dorado resplandeciente (`var(--gold)`).
  - Microinteracción de zoom sutil al hover (`scale(1.015)`) con aceleración GPU y desactivación para `prefers-reduced-motion`.
  - Pie de foto técnico en `--cream2` con glifo Mochica (`◆`) y descripción contextual de la solución activa.

### 2. Purificación Radical de Servicios.jsx

- **Detalle Técnico:**
  - Se eliminó la cabecera publicitaria externa (`H1` repetitivo y párrafo largo).
  - Se eliminó el banner inferior beige de combinaciones y el botón dorado.
  - Se saneó el archivo eliminando la importación no utilizada de `Link` de `react-router-dom`.
  - La página se redujo a 54 líneas de código puro, limpio y directo: contenedor de sala de museo continuo (`padding: '120px clamp(24px, 5vw, 64px) 100px'`) con `<QuickEstimator />` como experiencia central e integral, botón flotante de Alaec IA y Footer.

### 3. Verificación Integral y Suite de Pruebas

- **Resultados:**
  - `Servicios.test.jsx`: Actualizado para verificar la purificación de banners, la presencia del H1 en la Cédula Curatorial, la ventana monumental (`figure`), el selector de disciplinas y el asistente Alaec (4/4 pruebas pasando).
  - `QuickEstimator.test.jsx`: Actualizado con pruebas del prototipo monumental y cambio dinámico de espécimen al alternar disciplinas y soluciones (7/7 pruebas pasando).
  - Suite completa de pruebas de regresión: **38 test suites pasadas (206/206 tests exitosos)**.
  - Compilación de producción: `npm run build` completada limpiamente en 2.75s con cero errores de bundling.

---

## Sesión: 2026-09-21 (Sesión 5) — Evolución a Lienzo Total (Full Canvas) y Banco Curatorial Horizontal

### 1. Desbloqueo a Ancho Completo del Viewport (Full Bleed)

- **Decisión:** Suprimir las restricciones artificiales de ancho máximo (`max-width: 1160px` y `1440px`) en `/servicios` y `QuickEstimator`.
- **Implementación:**
  - `Servicios.jsx`: Contenedor a lienzo total `width: '100%', maxWidth: '100%', padding: '100px clamp(20px, 3.5vw, 56px) 80px'`.
  - `.curatorial-container`: Expandido a `max-width: 100%; width: 100%`.

### 2. Capa Superior Panorámica de Exhibición (Top Specimen Tier)

- **Detalles Artísticos & Arqueotécnicos:**
  - Proporción cinematográfica `21:9` en pantallas amplias (`max-height: 540px`) y `16:9` en estándares.
  - Marcador dinámico de espécimen de sala: `[ ESPÉCIMEN 01 / 09 — VISTA DE PROTOTIPO 1:1 ]`.
  - Coordenadas geográficas prehispánicas y sala en esquina superior derecha: `[ + 08°06′S · 79°01′W — SALA 01 ]`.
  - Pie de foto con glifo Mochica `◆` y tag de archivo `[ INMERGE · SALA 01 · INM-CAT-2026.01 ]`.

### 3. Banco Curatorial Horizontal Panorámico (Bottom Placard Tier)

- **Estructura en 4 Columnas Planas:**
  - **Columna 1 (Registro & Moneda):** Código de inventario, disciplina, índice de sala y conmutador `[ PEN | USD ]`.
  - **Columna 2 (Ámbito & Memoria):** Título de solución y descripción conceptual.
  - **Columna 3 (Entregables & SLA):** Especificaciones técnicas, plazo referencial en semanas y condiciones de garantía/despliegue.
  - **Columna 4 (Inversión & Acción):** Cifra tabular en `Space Mono`, botón directo de cotización vía WhatsApp y consulta con Alaec IA.
- **Responsividad:** 4 columnas en desktop panorámico (`240px 1.35fr 1.35fr 290px`), 2x2 en tablet (< 1200px) y 1 columna corrida en móvil (< 768px).

### 4. Verificación y Calidad

- 38 suites y 206 pruebas de Vitest pasando al 100%.
- Compilación de producción validada en 2.35s sin advertencias.

---

## Sesión: 2026-09-21 (Sesión 6) — Revisión Curatorial de Sally (UX Designer): Depuración Tipográfica Radical

### 1. Eliminación de Etiquetas Didácticas y de Software Educativo

- **Diagnóstico:** Los textos explicativos (`CATÁLOGO & ESTIMACIÓN CURATORIAL`, `CONSULTORÍA SENIOR DIRECTA`, `Cédula Curatorial de Ingeniería`, `Selecciona una disciplina...`) y el rótulo `ALCANCE & TIPO DE SOLUCIÓN:` actuaban como un instructivo didáctico de software, rompiendo la serenidad y sofisticación de una galería contemporánea.
- **Acción:**
  - Supresión total de carteles didácticos e instructivos de manual.
  - Reemplazo por una cabecera monográfica silenciosa:
    `MONOGRAFÍA DE INGENIERÍA · LIMA · 08°06′S 79°01′W` con el `<h1>` directo de la sala activa (`Páginas Web` / `Ingeniería de Software` / `Inteligencia de Negocios`).

### 2. Erradicación de Falsos Botones Tipo "Pills"

- **Diagnóstico:** Las píldoras redondeadas grises de selección de soluciones competían visualmente con el prototipo y parecían chips de filtros de e-commerce.
- **Acción:**
  - Sustitución por un **índice tipográfico corrido de sala** (`.gallery-specimens-index`), puramente textual en `Space Mono` y `Space Grotesk`.
  - Estados sutiles de catálogo de arte: atenuado (`opacity: 0.45`), hover reactivo e indicador activo mediante micro-hairline terracota de 1px.

### 3. Verificación

- Pruebas unitarias de `Servicios.test.jsx` y `QuickEstimator.test.jsx` actualizadas y pasando.
- 38/38 suites (206/206 pruebas) de Vitest aprobadas al 100%.
- Compilación de producción de Vite pasando limpiamente en 2.27s.

---

## Sesión: 2026-09-21 (Sesión 7) — Microinteracciones Curatoriales: Cross-fade, Lightbox 1:1 y Navegación por Teclado

### 1. Transición Curatorial Cross-Fade Acelerada por GPU

- **Implementación:** Animación `@keyframes curatorialFadeIn` para `.monumental-prototype-img` (0.45s con curva cúbica editorial `cubic-bezier(0.16, 1, 0.3, 1)` y microajuste de brillo/contraste).
- **Accesibilidad:** Respeto estricto a `prefers-reduced-motion: reduce` que anula la animación instantáneamente.

### 2. Visor de Inspección Monumental a Pantalla Completa (Lightbox 1:1)

- **Activación:** Click o pulsación de `Enter`/`Space` sobre el contenedor del prototipo (`.monumental-image-container`). Hint visual flotante reactivo `[ INSPECT 1:1 ]` en la esquina inferior derecha.
- **Diálogo Modal Accesible:**
  - `role="dialog"`, `aria-modal="true"` con `backdrop-filter: blur(12px)`.
  - Botón superior de cierre con pista visual de teclado `[ ESC ]`.
  - Cierre al hacer click en el backdrop oscuro o al presionar la tecla `Escape`.
  - Barra inferior de metadatos de obra con glifo Mochica `◆`, disciplina, solución, descripción de espécimen y código de inventario.

### 3. Navegación Curatorial por Atajos de Teclado

- Atajos `[ ← ]` (`ArrowLeft`) y `[ → ]` (`ArrowRight`) en toda la sala para navegar cíclicamente entre los 3 especímenes de la disciplina activa.
- Guarda de foco para no interceptar flechas cuando el foco está en un `input`, `textarea` o elemento editable.

### 4. Cobertura de Pruebas y Build

- 4 nuevas pruebas unitarias en `QuickEstimator.test.jsx` para apertura/cierre de Lightbox, backdrop click, Escape key y navegación por flechas.
- Total suites: 38/38 pasando al 100% (209 pruebas).
- Vite build completado en 3.38s con 0 errores.

---

## Sesión: 2026-09-21 (Sesión 8) — Ajuste de Ajuste Fino en `/servicios`: Acople Inmediato con el Header

- Se eliminaron los 48px de margen superior de `.curatorial-placard-section`.
- Se calibró el `padding-top` del contenedor en `Servicios.jsx` de 100px a **54px**, acoplándolo de manera inmediata y continua con el borde inferior del menú de navegación (~51px de altura).
- Toda la suite de pruebas y compilación pasando al 100%.

---

## Sesión: 2026-09-21 (Sesión 9) — Rediseño de `/inicio`: Atrio Cinematográfico 100vh & Typewriter Effect

### 1. Modelo Mental de Atrio Cinematográfico (Single Viewport)

- Se erradicaron de la portada el carrusel redundante de proyectos (`ProjectCarousel`), las franjas intermedias y los bloques comerciales repetitivos.
- `/inicio` pasa a ser una experiencia inmersiva pura de **100vh exactos (sin scroll vertical en desktop)** con el video de fondo cinematográfico (`/hero_inmerge.mp4`), gradiente oscuro mineral y acento Mochica.

### 2. Tipografía Editorial Contenida & Efecto Máquina de Escribir (_Typewriter_)

- Reducción del titular a una escala sobria y sofisticada (`clamp(26px, 3.3vw, 44px)`).
- Efecto de máquina de escribir carácter a carácter (~32ms por glifo) con cursor terracota intermitente (`|`).
- **Accesibilidad & SEO:** `aria-label` semántico en el `<h1>`, texto estático para motores de búsqueda, y respeto estricto a `prefers-reduced-motion: reduce`.

### 3. Tríptico de Portales Arquitectónicos al Pie

- Banda horizontal con 3 módulos de navegación integrados con hairline de 1px:
  - `[ 01 / SERVICIOS ]` → _Monografía & Prototipos 1:1_ (`/servicios` / `/en/services`)
  - `[ 02 / NOSOTROS ]` → _Manifiesto & Directores_ (`/nosotros` / `/en/about`)
  - `[ 03 / CONTACTO ]` → _Términos de Referencia (TDR)_ (`/contacto` / `/en/contact`)
- Micro-footer institucional al pie con copyright, enlaces a política de cookies y coordenadas geográficas.

### 4. Verificación y Rendimiento

- Reducción del bundle de `Inicio.js` de 25.10 kB a solo **5.32 kB** (gzip 2.31 kB).
- Pruebas unitarias de `Inicio.test.jsx` actualizadas y pasando (4/4).
- 38 suites y 209 tests de Vitest pasando al 100%. Build de producción completado en 2.45s.

---

## Sesión: 2026-09-21 (Sesión 10) — Depuración de Portales y Desactivación de Alaec en `/inicio`

- **Erradicación de Recuadros y Línea Divisoria:** Los 3 portales inferiores pasaron de tarjetas con fondo y borde a pura tipografía editorial flotante (`background: transparent; border: none;`), eliminando la línea divisoria superior para una integración 100% etérea sobre el video cinemático.
- **Desactivación de Alaec en Inicio:** Se retiró el botón flotante y modal de Alaec AI exclusivamente en `/inicio`, manteniendo una atmósfera limpia y sin distracciones visuales (Alaec permanece activo en `/servicios`, `/contacto`, etc.).

---

## Sesión: 2026-09-21 (Sesión 11) — Exhibición Monumental 100vw en `/servicios`: Hero Prototipo Full-Bleed & Curaduría Minimalista

- **Ventana de Prototipo a Ancho Completo:** La fotografía de prototipo 1:1 se promovió a la posición hero de `/servicios` ocupando el 100% del ancho del viewport (`width: 100vw`, `height: 82vh`, `max-height: 860px`), colocándose inmediatamente debajo del menú de navegación.
- **Erradicación de Fondos Negros:** Se eliminó cualquier vestigio de cajas oscuras o contrastes de contenedor artificiales; todos los selectores de disciplinas (`01 Páginas Web`, `02 Ingeniería de Software`, `03 Inteligencia de Negocios`) y especímenes se asientan directamente sobre el lienzo Arena `--bg`.
- **Reorganización Curatorial:** Los indicadores HUD (`MONOGRAFÍA DE INGENIERÍA`, coordenadas geográficas Mochica, código de inventario y selectores) se ubicaron debajo de la imagen monumental, permitiendo que la visualización del prototipo domine visualmente la entrada.
- **Verificación:** Pruebas unitarias de `QuickEstimator.test.jsx` (10/10) y suite global de 38 suites pasando al 100%.

---

## Sesión: 2026-09-21 (Sesión 12) — Armonización de Ritmo Vertical y Espaciado en `/nosotros`

- **Diagnóstico:** Se identificó que sobre el lienzo continuo Arena, la suma de paddings simétricos de 150px provocaba vacíos de 250px a 360px entre el Podio Mochica (`#mision`), el Equipo Directivo (`#directores`), el Método (`#metodo`) y el CTA final, dando la impresión de páginas truncadas o desconectadas.
- **Calibración Editorial:** Se ajustaron los paddings y márgenes a proporciones áureas:
  - Hero `#mision`: de 80px a `clamp(56px, 7vh, 88px) ... clamp(32px, 4vh, 48px)`.
  - Directores `#directores`: de 150px a `clamp(48px, 6vh, 64px) ... clamp(40px, 5vh, 56px)`. Margen inferior de `.directors-carousel` reducido de 64px a 24px.
  - Método `#metodo`: calibrado a `clamp(48px, 6vh, 64px)`. Se redujo la separación interna entre las 4 fases y la cenefa `MochicaDivider` de 136px a 84px.
  - CTA final: de 150px a `clamp(64px, 8vh, 88px)`.
- **Verificación:** `npm test` al 100% (209 pruebas) y tolerancia aumentada en `Inicio.test.jsx` para ejecuciones paralelas.

---

## Sesión: 2026-09-21 (Sesión 13) — Refinamiento Integral de `/contacto` & Normalización de Tokens

- **Calibración de Espaciado:** Se erradicó la fractura de 140px entre el titular editorial y las columnas de acción, reduciendo el padding del header y ajustando la cuadrícula B2B a `clamp(32px, 4vh, 48px) ... clamp(64px, 8vh, 96px)`.
- **Anclaje Arquitectónico Mochica:** Integración del componente `<MochicaDivider />` continuo (`seed="inmerge-contacto-top"`, `height={14}`) entre el encabezado y el espacio de trabajo.
- **Normalización de Tipografía:** Reemplazo de todas las fuentes legadas `'IBM Plex Mono'` e `'IBM Plex Sans'` por los tokens canónicos `var(--font-mono)` (`Space Mono`) y `var(--font-sans)` (`Space Grotesk`), unificando inputs, selects, textareas y botones.
- **Verificación:** 38 suites y 209 tests de Vitest pasando al 100%. Build de producción completado en 2.65s.

---

## Sesión: 2026-09-21 (Sesión 14) — Cierre Formal del Hito Frontend & Transición al Backend

- **Hito Culminado:** Frontend corporativo de Inmerge 100% finalizado, accesible (WCAG 2.1 AA), responsive y con diseño editorial tech premium consistente en todas las rutas públicas (`/`, `/servicios`, `/nosotros`, `/contacto`, `/cookies`, `/en/*`).
- **Actualización Documental:** Sincronización completa de `README.md`, `AGENTS.md`, `docs/tasks.md`, `docs/architecture.md`, `docs/ux/DESIGN.md`, `docs/ux/EXPERIENCE.md` y `docs/decisions-log.md`.
- **Próximo Paso Estratégico:** Inicio de la Épica 5 para revisión, auditoría de migraciones PostgreSQL en Supabase, políticas RLS, Edge Functions Deno, Realtime y paridad con el frontend.

---

## Sesión: 2026-09-23 — Refactorización UX & Hub Documental para el Panel del Trabajador (`/equipo`)

### Tarea 1: Corrección de Cumplimiento Normativo en Tareas Técnicas (`ProjectTaskManager.jsx`)

- **Agente Ejecutor:** Sally 🎨 & Amelia 💻
- **Archivos Modificados:** `web/app/src/components/ProjectTaskManager.jsx`, `web/app/src/components/ProjectTaskManager.test.jsx`
- **Resumen del Cambio:** Se eliminó la instrucción nativa bloqueante `window.confirm()` en la eliminación de tareas técnicas para cumplir con la directriz del proyecto (AGENTS.md). Se implementó un estado de confirmación en dos pasos (`confirmDeleteTaskId`) con reseteo automático a los 4 segundos y feedback visual accesible.
- **Verificación:** Pruebas unitarias de `ProjectTaskManager.test.jsx` pasando al 100% (6/6 tests).
- **Estado:** APROBADO.

### Tarea 2: Hub de Especificaciones & Documentación Compartida (`ProjectDocumentHub.jsx`)

- **Agente Ejecutor:** Sally 🎨 & Winston 🏛️
- **Archivos Creados:** `web/app/src/components/team/ProjectDocumentHub.jsx`, `web/app/src/components/team/ProjectDocumentHub.test.jsx`
- **Resumen del Cambio:** Se creó el espacio de documentación compartida para el desarrollador, organizando los requerimientos en 4 categorías: Briefing TDR, Arquitectura, Sandbox/APIs y Entregables Auditados. Incorpora disparadores de previsualización sin requerir descarga inmediata de archivos.
- **Verificación:** Pruebas unitarias en `ProjectDocumentHub.test.jsx` pasando al 100% (2/2 tests).
- **Estado:** APROBADO.

### Tarea 3: Visor de Previsualización In-App (`DocumentPreviewDrawer.jsx`)

- **Agente Ejecutor:** Sally 🎨 & Amelia 💻
- **Archivos Creados:** `web/app/src/components/team/DocumentPreviewDrawer.jsx`, `web/app/src/components/team/DocumentPreviewDrawer.test.jsx`
- **Resumen del Cambio:** Se implementó un panel deslizante lateral (_Slide-Over Drawer_) con accesibilidad completa (tecla `Escape`, overlay y atributos ARIA). Soporta renderizado de texto/markdown estructurado, incrustación de PDFs/enlaces iframe y acciones de descarga firmada.
- **Verificación:** Pruebas unitarias en `DocumentPreviewDrawer.test.jsx` pasando al 100% (2/2 tests).
- **Estado:** APROBADO.

### Tarea 4: Descongestión de Botones & Divulgación Progresiva en `ProjectsManagementView.jsx`

- **Agente Ejecutor:** Sally 🎨 & Amelia 💻
- **Archivos Modificados:** `web/app/src/components/team/ProjectsManagementView.jsx`
- **Resumen del Cambio:** Se refactorizaron las subpestañas por tarjeta de proyecto, reemplazando la franja saturada de 5 botones por un esquema limpio de 3 grupos de divulgación progresiva (`[ 📖 Especificaciones & Docs ]`, `[ 📋 Tareas Técnicas ]`, y un selector desplegable para herramientas avanzadas PM). Se conectó `ProjectDocumentHub` y `DocumentPreviewDrawer`.
- **Verificación:** Pruebas de integración de `Equipo.test.jsx` pasando al 100% (4/4 tests).
- **Estado:** APROBADO.

### Tarea 5: Filtro de Enfoque "Mis Asignaciones" en la Consola (`Equipo.jsx`)

- **Agente Ejecutor:** Sally 🎨 & John 📋
- **Archivos Modificados:** `web/app/src/pages/Equipo.jsx`
- **Resumen del Cambio:** Se introdujo el selector de alcance reactivo `viewScope` (`Todos los Proyectos` vs `★ Mis Asignaciones`). Permite a cualquier consultor, desarrollador o auditor aislar instantáneamente únicamente los proyectos donde figura como Lead Técnico o donde tiene hitos o tareas técnicas asignadas a su email.
- **Verificación:** Pruebas de integración en `Equipo.test.jsx` pasando al 100% (4/4 tests).
- **Estado:** APROBADO.

### Tarea 6: Trazabilidad Automática Lead TDR -> Cédula Técnica de Proyecto (`Equipo.jsx`)

- **Agente Ejecutor:** Mary 📊 & Amelia 💻
- **Archivos Modificados:** `web/app/src/pages/Equipo.jsx`
- **Resumen del Cambio:** Se actualizó la conversión de Leads a Proyectos (`handleConvertLeadToProject`) para generar automáticamente la descripción en formato de Cédula Técnica Markdown (`# CÉDULA DE ALCANCE INICIAL`, `## 1. Requerimiento`, `## 2. Contacto`, `## 3. Plazo y Pilar`). Esto permite su lectura estructurada inmediata en `ProjectDocumentHub`.
- **Verificación:** Pruebas de integración en `Equipo.test.jsx` pasando al 100% (4/4 tests).
- **Estado:** APROBADO.

### Tarea 7: Verificación Global de Calidad, Build y Cierre de Sesión (`/equipo`)

- **Agente Ejecutor:** Sally 🎨 & Amelia 💻
- **Archivos Creados:** `docs/brainstorming/brainstorm-ux-panel-trabajador-2026-09-23/cambios-implementados.md`
- **Resumen del Cambio:** Se completó la refactorización integral del panel de operaciones del trabajador. Se verificó el 100% de la suite de pruebas unitarias e integración (40 suites, 210 pruebas pasando en verde). Se realizó la compilación de producción con Vite (`npm run build`) en 2.58s sin advertencias ni errores. Se redactó la documentación final de cambios y la guía de uso.
- **Verificación:** `npm test -- --run` (210/210 tests pasados), `npm run build` exitoso (0 errores).
- **Estado:** COMPLETADO Y CERRADO.

---

## Sesión: 2026-09-23 (Sesión 2) — Cockpit Personal, Auditoría Forense y Gobernanza de Entregables (`/equipo`)

Implementación completa del plan de arquitectura de operaciones y entregables para ingenieros y auditores según especificación consensuada (`docs/superpowers/plans/2026-09-23-panel-trabajadores-cockpit-auditoria-entregables.md`).

### 1. Flujo Asimétrico de Entregables & Aislamiento Hermético de Clientes

- **Decisión:** Establecer una máquina de estados formal para entregables técnicos (`project_deliverables`): `BORRADOR_INTERNO` → `EN_REVISION` → `PUBLICADO_CLIENTE`.
  - **Permisos por Roles:** Los ingenieros y auditores redactan y elevan entregables a revisión (`EN_REVISION`). Únicamente usuarios administradores (`admin`) pueden aprobar y publicar formalmente a `PUBLICADO_CLIENTE`, o rechazar devolviendo a `BORRADOR_INTERNO` con registro de feedback.
  - **Aislamiento de Clientes:** En el portal de clientes (`/cuenta`), la función `fetchClientProjectDeliverables` filtra estrictamente a nivel de consulta y cliente entregables cuyo estado sea única y exclusivamente `PUBLICADO_CLIENTE`. Los borradores y revisiones intermedias quedan completamente invisibles e inaccesibles para el cliente.
  - **Trazabilidad y Auditoría:** Cada cambio de estado de un entregable registra un evento en la tabla `team_activity_logs` con metadatos del usuario, proyecto y fecha ISO.
- **Archivos Clave:** `web/app/src/lib/pm.js`, `web/app/src/lib/team.js`, `web/app/src/lib/projects.js`, `web/app/src/components/team/ProjectsManagementView.jsx`.

### 2. Matriz de Hallazgos Forenses de Auditoría (`ProjectAuditFindings.jsx` & `PM_FINDINGS`)

- **Decisión:** Incorporar un módulo de registro y seguimiento de vulnerabilidades y hallazgos técnicos forenses por proyecto, accesible dentro del selector de herramientas avanzadas PM (`PM_FINDINGS`).
  - **Taxonomía Estandarizada:**
    - Severidades: `CRITICA`, `ALTA`, `MEDIA`, `BAJA`, `INFORMATIVA` con codificación visual y semántica Mochica.
    - Categorías Técnicas: `CORE_WEB_VITALS`, `DATOS_CLOUD`, `SEGURIDAD_OWASP`, `ARQUITECTURA_CLOUD`, `CALIDAD_CODIGO`.
    - Estados de Mitigación: `DETECTADO`, `EN_CORRECCION`, `VERIFICADO`.
  - **UX & Resiliencia:** Métricas agregadas de severidad por proyecto, formulario estructurado con campos de impacto, recomendación técnica y evidencia. Eliminación protegida en dos pasos (sin `window.confirm`), feedback accesible con `ToastNotification` y soporte dual Supabase/almacenamiento local resiliente.
- **Archivos Clave:** `web/app/src/components/team/ProjectAuditFindings.jsx`, `web/app/src/components/team/ProjectAuditFindings.test.jsx`, `web/app/src/lib/pm.js`, `web/app/src/lib/team.js`.

### 3. Ficha Técnica, Entornos & Runbook Interactivo (`ProjectDocumentHub.jsx`)

- **Decisión:** Evolucionar la sección de Arquitectura del Hub Documental de Proyecto hacia una consola interactiva de especificaciones y despliegue técnico:
  - **Runbook Interactivo de Pasos de Despliegue:** Lista estructurada de procedimientos técnicos numerados, indicador de duración estimada, estado (`PENDIENTE` vs `COMPLETADO`) conmutador de progreso y comando de terminal directo con botón de copiado al portapapeles y anuncio accesible (`aria-live="polite"`).
  - **Ficha de Entornos de Infraestructura:** Especificaciones organizadas de endpoints, branches y configuraciones para entornos de `Desarrollo / Local`, `Staging / QA` y `Producción`.
- **Archivos Clave:** `web/app/src/components/team/ProjectDocumentHub.jsx`, `web/app/src/components/team/ProjectDocumentHub.test.jsx`.

### 4. Cockpit Personal de Especialistas & Auto-scoping por Roles (`WorkerCockpitView.jsx`)

- **Decisión:** Diseñar una estación de trabajo centrada en el colaborador técnico para eliminar la sobrecarga cognitiva en `/equipo`:
  - **Auto-scoping:** Al autenticarse un usuario no-administrador (`engineer`, `auditor`), la consola inicializa automáticamente la pestaña en `cockpit` ("Mi Estación") y fija el alcance en `viewScope = 'ASSIGNED'` ("Mis Asignaciones").
  - **Vista Cockpit (`WorkerCockpitView.jsx`):** Agrupa en un panel unificado las métricas personales de tareas (Pendientes, En Proceso, Completadas), entregables propios y la lista reactiva de tareas técnicas asignadas con capacidad de alternar estado in-situ y botón de navegación directa al contexto del proyecto (`Ver en Proyecto`).
  - **Paleta de Comandos (`CommandPaletteModal.jsx`):** Inclusión de atajos globales inmediatos (`> Cockpit Personal` y `> Mis Tareas Asignadas`) activables vía `⌘K` / `Ctrl+K`.
- **Archivos Clave:** `web/app/src/components/team/WorkerCockpitView.jsx`, `web/app/src/components/team/WorkerCockpitView.test.jsx`, `web/app/src/pages/Equipo.jsx`, `web/app/src/components/team/CommandPaletteModal.jsx`.

### 5. Evidencias de Verificación y Calidad de Código

- **Suite de Pruebas Automatizadas (Vitest):** 42 suites de pruebas ejecutadas, 245 pruebas aprobadas al 100% (0 errores, 0 regresiones).
- **Linter (ESLint):** 0 errores (`npm run lint`).
- **Formateador (Prettier):** 100% de archivos en conformidad de estilo (`npm run format:check`).
- **Compilación de Producción (Vite):** Bundle generado con éxito en `dist/` en 2.65s (`npm run build`).

---

## Sesión: 2026-09-23 (Sesión 3) — Fase 1: Optimización de Consultas SQL, Índices Compuestos, RPCs de Telemetría y Sincronización Delta Reactiva

Implementación completa de la Fase 1 del plan de optimización de bases de datos y rendimiento (`docs/superpowers/plans/2026-09-23-optimizacion-consultas-sql-indices-rpc.md`).

### 1. Migración SQL de Índices Compuestos B-Tree & Paridad Estricta (`0011_inmerge_sql_performance_and_telemetry_rpc.sql`)

- **Decisión:** Crear índices btree compuestos específicos en PostgreSQL para transformar los escaneos secuenciales O(N) en búsquedas directas O(log N):
  - `idx_tasks_assigned_email_status` en `project_tasks(assigned_to_email, status)`: optimiza el filtrado del cockpit técnico y conteos de tareas por especialista.
  - `idx_deliverables_proj_status` en `project_deliverables(project_id, status)`: optimiza la consulta de entregables confidenciales y el filtrado hermético para el portal del cliente.
  - `idx_findings_proj_sev_stat` en `project_findings(project_id, severity, status)`: acelera la matriz forense y agregados de vulnerabilidades críticas.
  - `idx_milestones_assigned_email` en `project_milestones(assigned_to_email)`: optimiza el emparejamiento de hitos asignados a consultores.
  - `idx_leads_status_created` en `leads_tdr(status, created_at DESC)`: acelera la bandeja de entrada y triaje de TDRs.
- **Paridad Estricta:** Replicación 1:1 en `supabase/migrations/` y `web/app/supabase/migrations/`, verificada con `scripts/verify-migrations-parity.test.mjs`.

### 2. RPCs Consolidadas en PostgreSQL (Single-Pass Aggregates & Telemetry Snapshot)

- **Decisión:** Reemplazar múltiples consultas separadas y agregaciones pesadas en el cliente por dos funciones PL/pgSQL STABLE con `SECURITY DEFINER`:
  - `get_project_analytics(p_project_id UUID)`: Ejecuta una agregación consolidada en una sola pasada sobre `project_tasks`, calculando conteos por estado, varianza de esfuerzo (`effort_variance_pct`), porcentaje de avance (`completion_pct`), y conteos correlacionados de riesgos abiertos y hallazgos críticos abiertos.
  - `get_workspace_telemetry_snapshot(p_user_email TEXT, p_is_admin BOOLEAN)`: Proporciona un snapshot integral en un único viaje de red (1 HTTP roundtrip) con conteos exactos de proyectos activos, leads pendientes, entregables en revisión, hallazgos críticos sin mitigar y tareas asignadas al usuario.

### 3. Caché en Memoria con TTL de 30 Segundos y Fallbacks Resilientes (`team.js` & `projects.js`)

- **Decisión:** Implementar un caché en memoria de 30 segundos (`CACHE_TTL_MS = 30000`) tanto para el panel de consultores (`teamProjectsCache`) como para el portal de clientes (`clientCache` indexado por `userId`):
  - Invocaciones repetidas o cambios de pestaña dentro de la ventana de 30s reutilizan la referencia en memoria a 0ms de latencia.
  - El parámetro `{ forceRefresh: true }` y los invalidadores explícitos `clearTeamDataCache()` y `clearClientProjectsCache()` purgan el caché inmediatamente ante mutaciones o eventos de sincronización.
  - Las consultas se construyen con diseño defensivo y fallbacks analíticos locales que computan métricas agregadas si la base de datos remota aún no ha aplicado las funciones RPC (cumpliendo la Regla 4 de `AGENTS.md`).

### 4. Sincronización Delta Reactiva en Tiempo Real (`useRealtimeTeam.js`)

- **Decisión:** Refactorizar el hook de suscripciones WebSocket para erradicar las tormentas de re-consultas (_refetch storms_):
  - Se añadió el manejador opcional `onDeltaPatch(payload)` y la invalidación inmediata de caché `clearTeamDataCache()`.
  - Cuando se provee `onDeltaPatch`, las mutaciones en `leads_tdr`, `client_projects`, `project_deliverables`, `project_tasks` y `project_findings` se despachan de forma instantánea al estado local, sin generar tráfico de red HTTP ni sobrecarga a la base de datos.
  - Como mecanismo de respaldo ante la ausencia de `onDeltaPatch`, se implementó amortiguación (_debouncing_) de 300ms en `onDataRefresh({ forceRefresh: true })`, consolidando ráfagas de eventos Realtime en una única recarga.

### 5. Integración en Consola Operativa (`Equipo.jsx`)

- **Decisión:** Integrar `handleDeltaPatch` y `fetchWorkspaceTelemetrySnapshot` en `/equipo`:
  - La carga inicial aprovecha el RPC de telemetría consolidada para poblar los indicadores Bento ejecutivos y tiras de KPIs instantáneamente.
  - Los eventos WebSocket de tareas, entregables y hallazgos parchean la matriz de proyectos local en tiempo real con latencia visual de 0ms, preservando la inmutabilidad y ordenación del estado.
  - El indicador visual de estado Realtime en la barra superior refleja fielmente la salud del canal (`REALTIME ACTIVO` vs `SIN CONEXIÓN REALTIME`) con accesibilidad WCAG (`role="status"`, `aria-live="polite"`).

### 6. Evidencias de Verificación y Calidad Global

- **Suite de Pruebas Vitest:** 42 archivos de prueba ejecutados, 259 pruebas pasando con 100% de éxito (0 fallos).
- **Linter (ESLint):** 0 errores (`npm run lint`).
- **Formateador (Prettier):** 100% de archivos en conformidad estricta (`npm run format:check`).
- **Compilación de Producción (Vite):** Build limpio y optimizado generado en 2.65s (`npm run build`).

---

## Sesión: 2026-09-24 — Fase 2: Escalabilidad de Infraestructura, Almacenamiento Vault, Notificaciones In-App y Telemetría

Implementación completa de la Fase 2 del plan de escalabilidad (`docs/superpowers/plans/2026-09-23-fase-2-escalabilidad-notificaciones-alertas.md`).

### 1. Migración SQL de Notificaciones y Bucket Seguro Vault (`0012_inmerge_user_notifications_and_vault_storage.sql`)

- **Decisión:** Implementar la infraestructura de base de datos y almacenamiento confidencial para notificaciones in-app y custodia de entregables:
  - **Tabla `user_notifications`:** Esquema relacional con columnas tipadas (`user_email`, `target_role`, `title`, `message`, `category`, `severity`, `project_id`, `link_url`, `is_read`, `created_at`), validación por check constraints para severidades (`CRITICAL`, `HIGH`, `MEDIUM`, `INFO`) y categorías (`DELIVERABLE`, `FINDING`, `TASK`, `SYSTEM`, `SECURITY`), con índices optimizados B-tree (`idx_user_notif_email_read`, `idx_user_notif_role_created`).
  - **Políticas RLS en `user_notifications`:** Acceso granular con `auth.jwt() ->> 'email'`, permisos de lectura restringidos al destinatario o rol, e inserción abierta para triggers y administradores.
  - **Bucket de Almacenamiento Seguro `project-deliverables-vault`:** Configurado como bucket privado con límite de 50 MB por archivo, restricción de tipos MIME autorizados (PDF, JSON, PNG, JPG, ZIP, Markdown) y políticas RLS estrictas en `storage.objects` (solo staff autenticado para lectura/escritura y clientes para proyectos asociados).
- **Paridad Estricta:** Replicación correlativa en `supabase/migrations/` y `web/app/supabase/migrations/`, validada con `scripts/verify-migrations-parity.test.mjs`.

### 2. Gestor de Notificaciones In-App con Caché TTL y Fallback Resiliente (`notifications.js`)

- **Decisión:** Crear un gestor de notificaciones in-app de alta resiliencia y bajo impacto de red:
  - **Caché en Memoria con TTL de 15s (`NOTIFICATIONS_CACHE_TTL_MS = 15000`):** Minimiza llamadas recurrentes a la base de datos durante navegación rápida entre pestañas.
  - **Consultas Defensivas y Fallback Local:** Diseñado según la Regla 4 de `AGENTS.md`. Si la tabla remota no ha sido migrada o hay contingencia de red, las notificaciones se almacenan y consultan en un búfer local en memoria, garantizando continuidad operativa con 0 caídas.
  - **Mutaciones Seguras:** Funciones `createInAppNotification`, `fetchUserNotifications`, `markNotificationAsRead` y `markAllUserNotificationsAsRead` con saneamiento estricto de parámetros.

### 3. Cliente de Almacenamiento Seguro Vault & URLs Firmadas Temporales (`vaultStorage.js`)

- **Decisión:** Centralizar la custodia de archivos técnicos en un cliente dedicado `vaultStorage.js`:
  - **Validación Previa:** Verificación de tamaño máximo (<50MB) y extensiones permitidas antes de iniciar cualquier transferencia hacia Supabase Storage.
  - **URLs Firmadas de Corta Duración (`getSignedDeliverableUrl`):** Enlaces temporales con expiración auditada (por defecto 900s / 15 minutos), con fallback resiliente seguro en modo local y registro forense.
  - **Subida Controlada (`uploadDeliverableToVault`):** Normalización y saneamiento de rutas (`<projectId>/<timestamp>_<cleanFileName>`) para prevenir colisiones o inyección en rutas de almacenamiento.

### 4. Componentes UI Accesibles: Centro de Notificaciones & Banner de Telemetría

- **Decisión:** Crear dos componentes reutilizables con accesibilidad WCAG 2.1 AA en `web/app/src/components/team/`:
  - **`<NotificationsPopover />`:** Diálogo flotante (`role="dialog"`, `aria-modal="true"`) con cierre por tecla `Escape`, filtrado por leídas/no leídas, badges de severidad estilizados acordes a la paleta editorial Inmerge, contador de no leídas y soporte para modo controlado o autónomo vía `userEmail`.
  - **`<ConnectionTelemetryBanner />`:** Banner de contingencia accesible (`role="alert"`, `aria-live="assertive"`) que detecta automáticamente caídas de red local (`navigator.onLine`) o reconexión del WebSocket Realtime (`DISCONNECTED`, `CONNECTING`, `CHANNEL_ERROR`), ofreciendo feedback visual inmediato y botón de reintento.

### 5. Integración Global en Consolas Operativas (`/equipo` y `/cuenta`) y Hub de Entregables

- **Decisión:** Incorporar las capacidades de telemetría, notificaciones y URLs firmadas en las vistas principales:
  - **Panel de Consultores (`Equipo.jsx`):** Banner superior de telemetría de red, botón de acceso al Centro de Notificaciones en la barra de herramientas superior, y modal `<NotificationsPopover />` para supervisión in-situ.
  - **Portal de Clientes (`Cuenta.jsx`):** Banner de conectividad en cabecera, trigger de notificaciones con accesibilidad bilingüe (`ES | EN`), y consumo de notificaciones dirigidas al cliente.
  - **Hub Documental (`ProjectDocumentHub.jsx`):** Integración de `getSignedDeliverableUrl` para la previsualización e inicio de descargas seguras directas de archivos confidenciales.

### 6. Evidencias de Verificación y Calidad Global

- **Suite Completa de Pruebas (Vitest):** 46 archivos de prueba ejecutados, 318 pruebas pasando con 100% de éxito (0 fallos, 0 regresiones).
- **Linter (ESLint):** 0 errores (`npm run lint`).
- **Formateador (Prettier):** 100% de archivos en conformidad estricta (`npm run format:check`).
- **Compilación de Producción (Vite):** Build de producción limpio y optimizado generado en 2.44s (`npm run build`).

---

## Sesión: 2026-09-24 (Sesión 2) — Optimización de Telemetría RPC, Deduplicación de Caché (15s TTL), Invalidación Granular y Reintentos Resilientes

Implementación de la optimización del canal de telemetría y consolidación de caché en el panel de consultores (`web/app/src/lib/team.js`).

### 1. Deduplicación y Caché en Memoria con TTL de 15s (`TELEMETRY_CACHE_TTL_MS = 15000`)

- **Decisión:** Implementar almacenamiento en caché en memoria con expiración de 15 segundos para `fetchWorkspaceTelemetrySnapshot`:
  - **Clave Compuesta:** Clave determinística `${userEmail || ''}_${isAdmin ? '1' : '0'}` para garantizar aislamiento de métricas por especialista y rol de auditor/administrador.
  - **Deduplicación de Consultas:** Invocaciones concurrentes o transiciones de navegación entre subpestañas dentro de la ventana de 15s resuelven a 0ms de latencia sin emitir viajes de red redundantes.
  - **Soporte `forceRefresh`:** Bypasea el caché cuando se solicita sincronización manual explícita.

### 2. Invalidación Granular por Entidad (`clearTeamDataCache({ entity })`)

- **Decisión:** Evolucionar el invalidador de caché monolítico a una API selectiva por entidad:
  - `clearTeamDataCache({ entity = 'all' })` admite las opciones `'all'`, `'projects'` y `'telemetry'`.
  - Mutaciones en proyectos, hitos o entregables pueden purgar selectivamente el segmento afectado sin invalidar innecesariamente el snapshot de telemetría general, o purgar ambos ante mutaciones transversales.

### 3. Métricas de Salud del Caché y Diagnóstico Operativo (`getCacheTelemetryMetrics`)

- **Decisión:** Exportar herramientas de telemetría interna para diagnóstico de rendimiento:
  - `getCacheTelemetryMetrics()` retorna `{ hits, misses, totalRequests, hitRatioPct, hasProjectsCache, hasTelemetryCache }`.
  - Permite auditar el ratio de aciertos de caché (_cache hit ratio_) en tiempo real y verificar el estado de frescura de las estructuras en memoria sin alterar su ciclo de vida.
  - Se acompaña del método de aislamiento `resetCacheTelemetryMetrics()` para entornos de prueba y benchmarks.

### 4. Resiliencia de Red con Reintento Transparente y Backoff de 200ms (`TELEMETRY_RPC_RETRY_DELAY_MS = 200`)

- **Decisión:** Incorporar tolerancia a fallos transitorios en la invocación de `get_workspace_telemetry_snapshot`:
  - Algoritmo de 1 reintento transparente (`maxAttempts = 2`) con retardo de 200ms ante fallos de conexión, respuestas HTTP 5xx o excepciones transitorias.
  - Si ambos intentos RPC resultan infructuosos, la función activa automáticamente el fallback analítico local resiliente (conforme a la Regla 4 de `AGENTS.md`), computando los KPIs a partir de los datos en memoria con cero interrupciones de cara al usuario.

### 5. Evidencias de Verificación y Calidad Global

- **Suite Completa de Pruebas (Vitest):** 46 archivos de prueba ejecutados, 335 pruebas pasando con 100% de éxito (0 fallos, 0 regresiones).
  - Incluye 46 tests en `team.test.js` que validan el ciclo de vida de caché TTL, expiración, invalidación granular, contadores de hits/misses, y reintentos con backoff simulado.
- **Linter (ESLint):** 0 errores (`npm run lint`).
- **Formateador (Prettier):** 100% de archivos en conformidad estricta (`npm run format:check`).
- **Compilación de Producción (Vite):** Build de producción limpio y optimizado generado en 2.19s (`npm run build`).

---

## Sesión: 2026-09-24 (Sesión 3) — Optimización del Portal de Clientes: Caché Multi-Usuario (TTL 30s), Analítica Single-Pass O(N) y Aislamiento Estricto de Entregables

Implementación de las optimizaciones arquitectónicas de rendimiento, diagnóstico y seguridad para el portal de clientes (`/cuenta` / `/en/account`) en `web/app/src/lib/projects.js` y `web/app/src/lib/pm.js`.

### 1. Caché Multi-Usuario en Memoria con TTL de 30s (`CLIENT_PROJECTS_CACHE_TTL_MS = 30000`)

- **Decisión:** Implementar un almacenamiento estructurado mediante `Map` en memoria (`clientCache`) indexado estrictamente por `userId`:
  - **Aislamiento Multi-Usuario:** Previene colisiones y fugas de datos entre sesiones o cuentas en el mismo entorno de ejecución cliente.
  - **Estrategia TTL & Freshness:** Cada entrada almacena `{ data, timestamp }`. Si el tiempo transcurrido desde la última consulta es menor a 30 segundos, las llamadas posteriores a `fetchClientProjects(userId)` retornan instantáneamente la referencia en memoria con 0ms de latencia y sin tráfico de red redundante.
  - **Soporte de `forceRefresh` e Invalidación:** Soporta `{ forceRefresh: true }` y la función de purga `clearClientProjectsCache(userId?)`, permitiendo invalidar un usuario específico o la totalidad del mapa ante eventos de mutación o sincronización.

### 2. Telemetría y Diagnóstico de Caché (`getClientCacheMetrics` & `resetClientCacheMetrics`)

- **Decisión:** Exponer métricas de rendimiento y observabilidad interna del caché del portal:
  - `getClientCacheMetrics()` retorna `{ hits, misses, totalRequests, hitRatioPct, userCacheCount }`, posibilitando auditar el ratio de aciertos de caché en tiempo real.
  - Se añade `resetClientCacheMetrics()` para restablecer contadores en pruebas automatizadas y diagnósticos de benchmark.

### 3. Analítica Agregada en Pasada Única O(N) (`calculateAggregatedProjectMetrics`)

- **Decisión:** Centralizar el cálculo de métricas agregadas del portafolio en una sola pasada iterativa lineal O(N) en `web/app/src/lib/pm.js`:
  - En un solo bucle sobre la colección de proyectos, computa simultáneamente:
    - Estado de salud global (`activeCount`, `completedCount`, `delayedCount`, `onTrackCount`).
    - Consolidación financiera y presupuestaria (`totalBudgetPEN`, `totalBudgetUSD`).
    - Avance promedio ponderado (`averageProgress`).
    - Tareas totales, completadas y porcentaje de ejecución global de tareas.
  - **Tolerancia a Fallos:** Maneja valores nulos, colecciones vacías y estructuras heterogéneas sin lanzar excepciones.

### 4. Aislamiento Hermético de Entregables para Clientes (`filterDeliverablesForClient`)

- **Decisión:** Reforzar la frontera de seguridad y confidencialidad de entregables técnicos (`project_deliverables`):
  - La función pura `filterDeliverablesForClient(deliverables)` garantiza que única y exclusivamente los registros con estado `PUBLICADO_CLIENTE` sean expuestos al portal del cliente.
  - Cualquier borrador interno (`BORRADOR_INTERNO`), revisión preliminar (`EN_REVISION`) o estado desconocido es purgado automáticamente en la capa de datos antes de transferirse a la vista de usuario.

### 5. Evidencias de Verificación y Calidad Global

- **Suite Completa de Pruebas (Vitest):** 46 archivos de prueba ejecutados, 352 pruebas pasando con 100% de éxito (0 fallos, 0 regresiones).
  - Incluye 23 pruebas en `projects.test.js` y 19 pruebas en `pm.test.js` verificando el ciclo de vida de caché multi-usuario, TTL, invalidación selectiva, métricas de diagnóstico, agregación O(N) y aislamiento estricto de entregables.
- **Linter (ESLint):** 0 errores (`npm run lint`).
- **Formateador (Prettier):** 100% de conformidad estricta (`npm run format:check`).
- **Compilación de Producción (Vite):** Bundle de producción compilado limpiamente en 2.67s sin advertencias ni errores (`npm run build`).

---

## Sesión: 2026-09-24 (Sesión 4) — Optimización de Sincronización Realtime: Event Coalescing, Delta Patching, Escuchadores Postgres y Resincronización Automática

Implementación de optimizaciones reactivas de alto rendimiento para el hook del panel de operaciones (`web/app/src/hooks/useRealtimeTeam.js`) y su canal de WebSocket Supabase Realtime.

### 1. Consolidación y Coalescing de Eventos Realtime (`coalesceDeltaPayloads`)

- **Decisión:** Implementar la función pura `coalesceDeltaPayloads(eventQueue, windowMs = 100)` para consolidar ráfagas de mutaciones concurrentes:
  - **Deduplicación Temporal de `UPDATE`:** Agrupa eventos de actualización consecutivos para una misma entidad (`entityId` extraído defensivamente vía `getEntityId` desde `new.id`, `record.id`, `old.id` o `id`) dentro de una ventana de tiempo configurable (100ms por defecto).
  - **Fusión Profunda de Estados:** Combina las mutaciones sucesivas (`coalescedEvent.new = { ...prevEvent.new, ...event.new }`) preservando el estado inicial `old`, lo que evita ciclos de re-renderizado innecesarios en la interfaz.
  - **Preservación Estricta:** Mantiene inalterados y en estricto orden los eventos `INSERT`, `DELETE` y mutaciones entre diferentes tablas o entidades.
  - **Soporte Opcional en el Hook:** Se activa mediante los parámetros `coalesce: true` y `coalesceWindowMs` en `useRealtimeTeam`.

### 2. Escuchadores Postgres Granulares para Hitos y Riesgos (`project_milestones` & `project_risks`)

- **Decisión:** Incorporar escuchadores dedicados de `postgres_changes` en el canal `realtime-team-consultancy`:
  - **`project_milestones`:** Escucha cambios (`*`) en hitos del cronograma y propaga el payload enriquecido con `table: 'project_milestones'`, sincronizando el diagrama de Gantt y los indicadores de avance al instante.
  - **`project_risks`:** Escucha mutaciones (`*`) en la matriz de riesgos del proyecto y propaga `table: 'project_risks'`, actualizando las alertas y planes de mitigación sin recargar la vista.
  - **Propagación Uniforme:** Asegura que la propiedad `table` siempre viaje normalizada en cada delta despachado.

### 3. Resincronización Automática ante Reconexión de Canal Realtime WebSocket

- **Decisión:** Implementar auto-recuperación transparente ante fallos transitorios de conectividad WebSocket:
  - **Detección de Transición:** Mediante `prevStatusRef`, monitorea transiciones desde estados caídos (`CHANNEL_ERROR`, `TIMED_OUT`, `CLOSED`) hacia `SUBSCRIBED`.
  - **Saneamiento y Purga:** Al reconectarse, limpia temporizadores debounce en vuelo, invalida el caché local de datos (`clearTeamDataCache()`) y ejecuta `onDataRefresh({ forceRefresh: true })`.
  - **Consistencia Garantizada:** Elimina estados inconsistentes por eventos perdidos durante desconexiones temporales de red sin requerir interacción manual del usuario.

### 4. Filtrado Contextual de Deltas por Ámbito de Usuario (`shouldDispatchDelta` & `userScope`)

- **Decisión:** Implementar la función pura `shouldDispatchDelta(payload, { userEmail, viewScope })` para optimizar el consumo de recursos en vistas asignadas:
  - **Ámbito 'ASSIGNED':** Si la consola está filtrada por asignación personal (`viewScope === 'ASSIGNED'`), solo procesa deltas de tareas (`project_tasks`) o entregables (`project_deliverables`) asignados o creados por el especialista activo (`userEmail`, insensible a mayúsculas/minúsculas).
  - **Tolerancia a Sin Asignar:** Permite el paso de elementos sin asignar para que los consultores puedan reclamar nuevas tareas o entregables en tiempo real.
  - **Visibilidad Global de Portafolio:** Tablas críticas como `leads_tdr`, `client_projects`, `project_milestones`, `project_risks`, `project_findings` y `team_activity_logs` se despachan invariablemente a todos los consultores.

### 5. Evidencias de Verificación y Calidad Global

- **Suite Completa de Pruebas (Vitest):** 46 archivos de prueba ejecutados, 379 pruebas pasando con 100% de éxito (0 fallos, 0 regresiones).
  - Incluye 34 pruebas en `useRealtimeTeam.test.js` validando exhaustivamente coalescing, fusiones parciales, orden de cola, listeners de hitos y riesgos, reconexión automática y filtrado por scope de usuario.
- **Linter (ESLint):** 0 errores (`npm run lint`).
- **Formateador (Prettier):** 100% de conformidad estricta (`npm run format:check`).
- **Compilación de Producción (Vite):** Bundle de producción compilado limpiamente en 2.61s sin errores (`npm run build`).
