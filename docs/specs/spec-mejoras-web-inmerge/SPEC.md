---
companions:
  - "architecture-diagrams.md"
sources:
  - "docs/brainstorming/brainstorm-mejorar-cerrar-brechas-web-2026-09-16/brainstorm-intent.md"
---

# SPEC: Mejoras y Cierre de Brechas Web en Inmerge

## Why
El sitio web de Inmerge requiere cerrar la brecha entre la navegación informativa y la conversión corporativa. Frente al modelo burocrático y costoso de consultoras tradicionales (Big 4), Inmerge se posiciona con soluciones de ingeniería de software, auditoría de datos y ciencia de datos **baratas, simples y rápidas**. Esta especificación define la incorporación de un Carrusel de Casos de Éxito reales (prueba de autoridad), un Cotizador Ágil con rangos transparentes de sprints/precios, y un Asistente LLM ligero con failover híbrido a WhatsApp, preservando el canal tradicional.

## Capabilities

### CAP-1: Carrusel de Casos de Éxito & Proyectos Reales
- **Intent:** Exhibir un carrusel interactivo y accesible de proyectos representativos desarrollados por Inmerge, clasificados bajo los tres pilares estratégicos (Auditoría Técnica, Cloud/Software, Ciencia de Datos & IA), detallando el dolor del cliente, la solución técnica implementada y la métrica de impacto.
- **Success:** El usuario puede navegar fluidamente entre casos de estudio mediante controles táctiles, teclado o botones direccionales; cada tarjeta muestra badges de tecnologías y métricas tangibles (ej. "Migración en 10 días", "Reducción de costos AWS en 45%"), con botón contextual para cotizar un proyecto similar.

### CAP-2: Cotizador Ágil & Transparente de Proyectos
- **Intent:** Proveer un componente de estimación rápida donde el cliente seleccione su pilar, nivel de complejidad y volumen, recibiendo una estimación preliminar de tiempo en sprints (1-2 semanas) y rangos de precio competitivos sin rodeos.
- **Success:** El cotizador calcula interactivamente el desglose de hitos, muestra rangos accesibles en moneda local (PEN) e internacional (USD) y permite enviar el alcance al Asistente LLM o al formulario de contacto con 1 clic.

### CAP-3: Asistente Técnico LLM Ligero con Failover Híbrido
- **Intent:** Integrar un asistente interactivo ligero y accesible que responda consultas sobre los servicios y cotizaciones de Inmerge en streaming, incorporando un mecanismo de contingencia ("failover") que transicione a WhatsApp/Contacto si el cliente prefiere atención humana directa.
- **Success:** El asistente responde con contexto preciso del catálogo de Inmerge, ofrece opciones predefinidas de consulta, y cuenta con un botón visible "Hablar con un Ingeniero vía WhatsApp" que transfiere el contexto de la consulta sin fricción.

### CAP-4: Integración y Localización Bilingüe en Páginas Clave
- **Intent:** Integrar los nuevos componentes en las vistas públicas `/` (Inicio), `/servicios` (Servicios) y `/contacto` (Contacto), tanto en español como en inglés (`/en`, `/en/services`, `/en/contact`).
- **Success:** Ambas versiones idiomáticas renderizan los contenidos localizados con fidelidad editorial, enlaces canónicos y etiquetas SEO correctas.

## Constraints
- **Preservación del Contacto Tradicional:** El formulario estructurado en `/contacto` y el enlace a WhatsApp no deben ser alterados ni eliminados.
- **Sistema de Diseño:** Cumplimiento estricto de la paleta Editorial Tech (`--bg: #F3EADA`, `--ink: #241A12`, `--terracotta: #A8472B`, `--gold: #D8A84E`, `--cream2: #EBDFC9`) y tipografías (`Spectral`, `IBM Plex Sans`, `IBM Plex Mono`).
- **Accesibilidad WCAG 2.1 AA:** Navegación por teclado completa, atributos `aria-label`, `role="region"`, `role="dialog"` y contraste de color accesible.
- **Calidad y Testing:** Cero regresiones en la suite de pruebas unitarias (`npm test`) y compilación limpia de producción (`npm run build`).

## Non-goals
- No se implementará procesamiento de pagos con pasarelas automáticas (se mantiene exclusivamente transferencia bancaria directa).
- No se modificará el panel interno `/equipo` (reservado para consultores en Lima).
- No se requerirán dependencias externas pesadas de i18n o carruseles (se empleará CSS moderno y React nativo).

## Success signal
- El carrusel de proyectos y el cotizador funcionan interactivamente en desktop y móvil en las páginas `/` y `/servicios`.
- La suite completa de Vitest pasa al 100% (añadiendo pruebas unitarias para `ProjectCarousel`, `QuickEstimator` y `LLMAssistantModal`).
- `npm run build` compila sin errores ni advertencias de linting.
