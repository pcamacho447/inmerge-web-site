# Intención Técnica & Alcance: Mejoras y Cierre de Brechas en la Web de Inmerge

## 1. Contexto & Propósito Estratégico
- **Propósito:** Cerrar las brechas de conversión, autoridad y agilidad en el sitio web público e interfaces de Inmerge.
- **Posicionamiento Central:** Soluciones de ingeniería de software, auditoría de datos y ciencia de datos **baratas, simples y rápidas** con precios y tiempos transparentes frente al modelo inflado y burocrático de las consultoras tradicionales (Big 4).
- **Enfoque de Experiencia:** Cero fricción, diseño editorial premium, y preservación del canal de contacto tradicional.

---

## 2. Decisiones de Producto y Arquitectura

### A. Carrusel Interactivo de Proyectos Reales / Casos de Éxito
- **Ubicación:** Home (`/` y `/en`) y Servicios (`/servicios` y `/en/services`).
- **Estructura por Tarjeta:**
  - *Pilar Estratégico:* (Auditoría Técnica, Desarrollo & Cloud, Ciencia de Datos e IA).
  - *Problema del Cliente:* Dolor real (ej. cuellos de botella en base de datos, latencia de microservicios, falta de pipeline predictivo).
  - *Solución Inmerge:* Stack técnico y arquitectura implementada.
  - *Métricas / Resultado:* Reducción de tiempos, optimización de costos cloud o integridad de registros.
  - *Acción:* Botón contextual *"Cotizar solución similar"*.

### B. Cotizador Inteligente y Estimador de Proyectos
- **Ubicación:** Integrado en `/servicios` y vinculado desde el CTA del carrusel.
- **Capacidades:**
  - Selección guiada de necesidades por pilar y volumen.
  - Estimación transparente en sprints ágiles (ej. 1 a 2 semanas) y rangos de precios competitivos.
  - Resumen descargable o exportable a solicitud de reunión técnica.

### C. Agente LLM Ligero con Streaming & Failover Híbrido
- **Comportamiento:** Asistente conversacional rápido con contexto del catálogo de Inmerge.
- **Regla de Resiliencia:** Si el LLM experimenta latencia o el usuario prefiere atención humana, conmutación instantánea a WhatsApp pre-llenando los datos ingresados.

### D. Preservación del Flujo Clásico
- **Mantenimiento:** El formulario tradicional en `/contacto` y enlaces a WhatsApp se mantienen 100% operativos para clientes corporativos de perfil conservador.

---

## 3. Próximos Pasos en el Ecosistema BMad
- **Paso Recomendado:** Alimentar este documento a `bmad-spec` o `bmad-agent-dev` para iniciar la implementación de los componentes en `web/app/src/components/`.
