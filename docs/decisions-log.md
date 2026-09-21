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

### 2. Tipografía Editorial Contenida & Efecto Máquina de Escribir (*Typewriter*)
- Reducción del titular a una escala sobria y sofisticada (`clamp(26px, 3.3vw, 44px)`).
- Efecto de máquina de escribir carácter a carácter (~32ms por glifo) con cursor terracota intermitente (`|`).
- **Accesibilidad & SEO:** `aria-label` semántico en el `<h1>`, texto estático para motores de búsqueda, y respeto estricto a `prefers-reduced-motion: reduce`.

### 3. Tríptico de Portales Arquitectónicos al Pie
- Banda horizontal con 3 módulos de navegación integrados con hairline de 1px:
  - `[ 01 / SERVICIOS ]` → *Monografía & Prototipos 1:1* (`/servicios` / `/en/services`)
  - `[ 02 / NOSOTROS ]` → *Manifiesto & Directores* (`/nosotros` / `/en/about`)
  - `[ 03 / CONTACTO ]` → *Términos de Referencia (TDR)* (`/contacto` / `/en/contact`)
- Micro-footer institucional al pie con copyright, enlaces a política de cookies y coordenadas geográficas.

### 4. Verificación y Rendimiento
- Reducción del bundle de `Inicio.js` de 25.10 kB a solo **5.32 kB** (gzip 2.31 kB).
- Pruebas unitarias de `Inicio.test.jsx` actualizadas y pasando (4/4).
- 38 suites y 209 tests de Vitest pasando al 100%. Build de producción completado en 2.45s.

---

## Sesión: 2026-09-21 (Sesión 10) — Depuración de Portales y Desactivación de Alaec en `/inicio`
- **Erradicación de Recuadros y Línea Divisoria:** Los 3 portales inferiores pasaron de tarjetas con fondo y borde a pura tipografía editorial flotante (`background: transparent; border: none;`), eliminando la línea divisoria superior para una integración 100% etérea sobre el video cinemático.
- **Desactivación de Alaec en Inicio:** Se retiró el botón flotante y modal de Alaec AI exclusivamente en `/inicio`, manteniendo una atmósfera limpia y sin distracciones visuales (Alaec permanece activo en `/servicios`, `/contacto`, etc.).





