# Reglas del Proyecto Inmerge & Matriz de Delegación (CLAUDE.md)

Este documento establece las directrices permanentes del repositorio y el modelo de asignación y delegación a subagentes para el desarrollo del sitio web y plataforma de **Inmerge**.

---

## 1. Reglas Fijas del Proyecto

### 1.1 Las Tres Líneas de Servicio Oficiales
El sitio web, sus componentes y todos sus textos bilingües comunican única y exclusivamente tres líneas de servicio:
1. **Páginas Web:** Sitios corporativos, plataformas web y landings de alto impacto, rendimiento extremo (Core Web Vitals óptimos), SEO técnico y diseño editorial prehispánico contemporáneo.
2. **Ingeniería de Software:** Desarrollo a medida, arquitecturas cloud en AWS/GCP, microservicios, APIs de alta densidad, refactorización de legados y metodologías ágiles en sprints de 1-2 semanas.
3. **Inteligencia de Negocios:** Auditoría técnica y de integridad de datos, analítica avanzada, modelos predictivos, IA aplicada y dashboards ejecutivos en tiempo real con fuentes verificables.

*Nota:* Queda estrictamente prohibido inventar o reintroducir categorizaciones obsoletas o catálogos genéricos desalineados.

### 1.2 Regla de Oro de la Arquitectura Visual y UX
- **Landing (`/`, `/en`):** Es la **única página dividida por secciones y bloques de colores contrastantes** (Hero cinemático oscuro sobre video, showcase de casos sobre arena, pilares sobre crema, franja terracota de cierre).
- **Páginas Interiores (`/servicios`, `/nosotros`, `/contacto` y versiones `/en/*`):** Diseñadas sobre un **lienzo continuo** mineral claro (`--bg: #F3EADA` / `--cream2`). Sin bloques oscuros alternos ni cajas cerradas que fracturen la lectura. Reducción de textos redundantes al mínimo editorial necesario.
- **Aplanamiento de Cards y Saneamiento de Falsos Botones:**
  - Las tarjetas son planas, sin sombras pesadas difusas (`box-shadow` exageradas prohibidas).
  - Los badges, tags técnicos y etiquetas no clickeables deben tener `cursor: default`, bordes sutiles y carecer de efectos hover de botón (sin traslaciones ni sombras).
  - Solo los botones interactivos reales (`<button>`, `<a>`, `<Link>`) utilizan estilos de botón (`.btn-accent`, `.btn-outline`).

### 1.3 Medio de Pago Exclusivo y Reglas Comerciales
- Se aceptan única y exclusivamente **Transferencias Bancarias Directas** a cuentas institucionales de Inmerge (BCP, Interbank, BBVA en PEN para Perú; transferencias internacionales SWIFT/Wire en USD para el exterior).
- Cada cotización o venta genera un código correlativo formal `INM-ORD-YYYYMMDD-XXXX`.
- Validación estricta de RUC peruano (11 dígitos numéricos) o Tax ID internacional.
- Prohibida la incorporación de pasarelas de pago automáticas con cobros de comisión por transacción.

### 1.4 Política Estricta de Notificaciones
- Queda terminantemente prohibido el uso de `window.alert()`, `confirm()` o diálogos nativos bloqueantes del navegador.
- Toda notificación debe emitirse mediante el componente `ToastNotification.jsx` utilizando atributos ARIA semánticos: `role="status"` para confirmaciones y eventos Realtime, y `role="alert"` para advertencias o errores de validación/acceso.

### 1.5 Calidad de Código, Cero Bloat y Pruebas
- **Arquitectura Zero-Bloat:** CSS nativo basado en tokens variables en `:root` (`web/app/src/styles/index.css`), React 18 puro, sin dependencias pesadas de i18n o librerías de UI externas.
- **Suite de Pruebas:** Ejecutar `npm test` en `web/app` ante cualquier modificación de código. Las 38 suites y 200+ pruebas deben pasar al 100%.
- **Build de Producción:** Verificar que `npm run build` compile limpiamente sin errores sintácticos ni fallas de empaquetado.

---

## 2. Matriz de Delegación a Subagentes

Para el ciclo de desarrollo, las responsabilidades se distribuyen de acuerdo al siguiente esquema:

| Subagente / Plugin | Rol y Ámbito de Especialidad | Cuándo y Cómo Invocarlo |
| :--- | :--- | :--- |
| **`voltagent-core-dev`** | **Especialista en Desarrollo Frontend & Fullstack** | Responsable principal de la implementación técnica de componentes React, maquetación, refactorización de código, hooks de datos y estado local. Ejecuta cada historia de frontend. |
| **`modern-web-guidance`** | **Estándares Web Modernos, Layout y Accesibilidad** | Consulta obligatoria previa a la implementación de layouts modernos (CSS Grid, subgrid, flexbox fluido), View Transitions API, atributos semánticos de formularios (`:user-valid`, `autocomplete`), y conformidad WCAG 2.1 AA (`role="tablist"`, foco visible). |
| **`voltagent-meta`** | **Coordinador y Orquestador Multi-Pieza** | Se invoca cuando una tarea cruza simultáneamente múltiples piezas (por ejemplo, sincronización entre `QuickEstimator`, `LanguageContext`, diccionarios bilingües y rutas de navegación). Mantiene la coherencia arquitectónica global. |
| **`voltagent-dev-exp`** | **Experiencia de Desarrollo & Tooling** | Encargado de la configuración de Vite, optimización de scripts de empaquetado, suite de tests en Vitest, linter, formateadores y dependencias locales. |
| **`bmad-method` / `bmad-toolbox`** | **Metodología Ágil, PRD & Arquitectura** | Gestión del ciclo de vida de los artefactos de producto (`docs/prd.md`, `docs/architecture.md`, descomposición en historias y criterios de aceptación). |
| **`superpowers`** | **Flujo Disciplinado de Ejecución** | Cada historia de desarrollo pasa por el ciclo completo: especificación/plan -> TDD (test-driven development) -> implementación en verde -> verificación rigurosa -> revisión de código antes de dar por cerrada la tarea. |
| **`voltagent-infra`** | **Infraestructura & Despliegue Especial** | *En reserva:* Se activa únicamente si el proyecto requiere aprovisionamiento especial en AWS, configuración avanzada de DNS o pipelines de CI/CD cloud. |
| **`voltagent-data-ai`** | **Ciencia de Datos & Modelos IA** | *En reserva:* Se activa únicamente si se implementan pipelines analíticos complejos, migraciones masivas de datos o integraciones de LLM dedicadas en backend. |

---

## 3. Protocolo de Ejecución de Tareas

1. **Alineación:** Tomar la historia correspondiente desde `docs/tasks.md`.
2. **Revisión de Estándares:** Consultar directrices en `modern-web-guidance` para accesibilidad y layout.
3. **Desarrollo TDD con Superpowers:** Escribir o actualizar la prueba unitaria en Vitest antes de tocar el código productivo.
4. **Implementación:** Asignar a `voltagent-core-dev` para el refactoring o construcción del componente.
5. **Verificación:** Ejecutar `npm test` en `web/app` confirmando 100% de éxito y verificar compilación con `npm run build`.
6. **Bitácora:** Registrar el avance y decisiones tomadas en `docs/decisions-log.md`.
