# Guía de Referencia y Arquitectura: Rediseño de Servicios Inmerge (Inspiración Paragon Productions "Work")

> **Documento de Especificación & Referencia Técnica Oficial**  
> **Referencia de Inspiración:** [Paragon Productions — Work](https://www.paragonproductions.co/work)  
> **Destino en Inmerge:** Página pública de Servicios (`/servicios` y `/en/services`)  
> **Decisión de Diseño Confirmada:** 
> 1. **Vista Index Exclusiva:** Cada proyecto/solución se despliega en la estructura asimétrica de 3 columnas de Paragon (Metadatos | Visor 1:1 con Video Hover | Dictamen & Acción).
> 2. **Sin Video Hero:** Se omite intencionalmente el hero video inicial para entrar directo a las soluciones con LCP < 0.8s y preservar la exclusividad del Atrio Cinematográfico en la Home (`/`).
> 3. **Pop-up Modal "Ver Ficha":** Al pulsar `[ Ver Ficha → ]`, se abre un lightbox técnico editorial con especificaciones, condiciones de entrega/SLA, inversor base dual (`PEN | USD`), cotización directa por WhatsApp y consulta con el Asistente IA Alaec.
> 4. **Cierre Tailored CTA:** Bloque de cierre editorial para solicitudes a medida con embudo directo a TDR y WhatsApp.
> **Estado:** Documento de Referencia Maestro actualizado y listo para ejecución.

---

## 1. Resumen Ejecutivo y Diagnóstico

### 1.1 Diagrama de Flujo y Experiencia de Usuario

```
┌────────────────────────────────────────────────────────────────────────┐
│                   INMERGE — CABECERA EDITORIAL                         │
│         [ INMERGE AUDITED PORTFOLIO ]  ·  01 / 02 / 03                 │
│         "Ingeniería FORJADA EN rigor" / "Work BUILT ON evidence"       │
│         Explorador curatorial de soluciones y plataformas web          │
├────────────────────────────────────────────────────────────────────────┤
│ VISTA "INDEX" DE SOLUCIONES (Monografía Asimétrica 3 Columnas)         │
│                                                                        │
│ ┌───────────────┬───────────────────────────────┬────────────────────┐ │
│ │ 01 METADATOS  │      VIDEO / SCREENCAST       │ SINOPSIS & ACCIÓN  │ │
│ │ • Catálogo    │  (Hover: Poster WebP -> Video)│ • Glifo Mochica    │ │
│ │ • Cliente     │  Aspect Ratio 16:9            │ • KPI: LCP < 0.8s  │ │
│ │ • Pilar Serv. │  Hairline 1px border          │ • [ Ver Ficha → ]  │ │
│ └───────────────┴───────────────────────────────┴──────────┬─────────┘ │
│                                                            │           │
│  (Click en "Ver Ficha") ───────────────────────────────────┘           │
│  ▼                                                                     │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │                     POP-UP: FICHA TÉCNICA Y CONDICIONES            │ │
│ │                                                      [ ESC / ✕ ]   │ │
│ │ High-Impact Landing Page                                           │ │
│ │ Single-page conversion & launch platform focused on qualified lead │ │
│ │ capture, extreme load speed (LCP < 1.0s), and bespoke design.      │ │
│ │                                                                    │ │
│ │ ◆ TECHNICAL SPECIFICATIONS                                         │ │
│ │ — React 18 / Vite zero-bloat architecture                          │ │
│ │ — Guaranteed 95+ Lighthouse score (Core Web Vitals)                │ │
│ │ — Accessible form with honeypot anti-spam                          │ │
│ │ — International SEO & canonical metadata                           │ │
│ │                                                                    │ │
│ │ ◆ DELIVERY & SLA CONDITIONS                                        │ │
│ │ — Estimated Timeline: ~1 to 2 weeks                                │ │
│ │ — Deliverable: Complete source code in Git                         │ │
│ │ — Automated production deployment on Vercel/Cloudflare             │ │
│ │ — 30 days post-launch technical warranty                           │ │
│ │                                                                    │ │
│ │ BASELINE INVESTMENT:  [ (●) PEN  |  ( ) USD ]                      │ │
│ │ S/ 2,400 PEN                                                       │ │
│ │ Scope calibrated to milestone deliverables                         │ │
│ │                                                                    │ │
│ │ [ Quote this Solution via WhatsApp ↗ ]                             │ │
│ │ [ Consult with Alaec (AI) → ]                                      │ │
│ └────────────────────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────────────────┤
│ CIERRE CTA TAILORED: "¿Busca una arquitectura o auditoría a medida?"   │
│ [ Iniciar TDR Técnico ]  [ Asistente IA Alaec ]  [ WhatsApp Directo ]  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Anatomía de Cada Fila en Vista "Index" (Inspiración Paragon)

Cada proyecto se renderiza como una franja asimétrica en 3 columnas sobre el lienzo continuo Arena (`--bg: #F3EADA`):

```
┌─────────────────────────┬─────────────────────────────────────┬─────────────────────────┐
│ COLUMNA 1 (25% ancho)   │ COLUMNA 2 (50% ancho)               │ COLUMNA 3 (25% ancho)   │
│ Ficha Técnica & Cliente │ Escenario Visual 1:1                │ Dictamen & Acción       │
├─────────────────────────┼─────────────────────────────────────┼─────────────────────────┤
│ • Badge: [01]           │ • Marco con ratio 16:9              │ • Glifo Mochica Oro     │
│ • Titular H3 Solución   │ • Poster WebP/AVIF estático         │ • Sinopsis ejecutiva    │
│ • Cliente / Industria   │ • Video MP4/WebM oculto debajo      │ • KPI: [99.99% Auditado]│
│ • Especialidad Técnica  │ • Hover/Focus: poster opacity -> 0  │ • Botón con Text Roll   │
│ • Tags [AWS / React]    │ • Hairline 1px con muesca Mochica   │ • [ Ver Ficha → ]       │
└─────────────────────────┴─────────────────────────────────────┴─────────────────────────┘
```

### 2.1 Columna 1: Metadatos y Clasificación
- **Número y Catálogo:** Badge tipográfico `[01]` y `[INM-CAT-2026.01]` en `Space Mono`.
- **Titular:** `<h3 className="service-row-title">` en `Space Grotesk`.
- **Cliente:** Referencia institucional o corporativa (ej. *Grupo Financiero & Servicios Corporativos*).
- **Stack Técnico:** Píldoras monospaciadas con bordes de 1px (`[REACT 18]`, `[AWS ECS]`, `[POSTGRESQL]`).

### 2.2 Columna 2: Media Interactivo (Video en Hover con Poster Fade)
- Contenedor con `aspect-ratio: 16 / 9` y contorno hairline (`1px solid var(--border)`).
- **Poster estático de alta fidelidad** (`WebP/AVIF`) posicionado con `z-index: 2`.
- **Video silencioso en loop** (`<video preload="none" muted loop playsInline>`) en `z-index: 1`.
- **Comportamiento Hover:** Al posar el cursor o recibir `:focus-visible`, la imagen poster se desvanece suavemente a `opacity: 0` (350ms cubic-bezier), revelando la interfaz activa en movimiento en tiempo real. Cero layout shifts (**CLS = 0.00**).

### 2.3 Columna 3: Sinopsis, Dictamen y Gatillador del Pop-up
- Glifo geométrico ceremonial Mochica (`<MochicaStepIcon />` en color Oro `--gold: #D8A84E`).
- Párrafo de sinopsis ejecutiva (2-3 líneas) enfocado en valor cuantitativo y retos resueltos.
- Métricas o KPIs destacados (`LCP < 0.8s`, `Integridad 99.99%`).
- **Botón de Ficha Técnica:**
  - Texto con efecto **Staggering Char Roll** (`[data-button-animate-chars]`) y subrayado direccional.
  - Al hacer click o pulsar `Enter`/`Space`: Despliega el **Pop-up Modal de Especificaciones y Cotización**.

---

## 3. Especificación Exhaustiva del Pop-up Modal: "Ficha Técnica & SLA"

El pop-up modal es el núcleo de divulgación progresiva y conversión de cada servicio. Se presenta en una ventana modal centrada sobre un backdrop editorial difuso, con navegación accesible por teclado (`ESC`, foco atrapado) y sin utilizar diálogos nativos bloqueantes.

### 3.1 Estructura Visual y Jerarquía del Pop-up

```
┌────────────────────────────────────────────────────────────────────────┐
│  INMERGE MONOGRAPH SPECIFICATION // [INM-CAT-2026.01]       [ ESC / ✕ ]│
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  High-Impact Landing Page                                              │
│  Single-page conversion & launch platform focused on qualified lead    │
│  capture, extreme load speed (LCP < 1.0s), and bespoke visual design.  │
│                                                                        │
│  ◆ TECHNICAL SPECIFICATIONS                                            │
│  — React 18 / Vite zero-bloat architecture                             │
│  — Guaranteed 95+ Lighthouse score (Core Web Vitals)                   │
│  — Accessible form with honeypot anti-spam                             │
│  — International SEO & canonical metadata                              │
│                                                                        │
│  ◆ DELIVERY & SLA CONDITIONS                                           │
│  — Estimated Timeline: ~1 to 2 weeks                                   │
│  — Deliverable: Complete source code in Git                            │
│  — Automated production deployment on Vercel/Cloudflare                │
│  — 30 days post-launch technical warranty                              │
│                                                                        │
│  BASELINE INVESTMENT:                                                  │
│  [ (●) PEN  |  ( ) USD ]                                               │
│                                                                        │
│  S/ 2,400 PEN                                                          │
│  Scope calibrated to milestone deliverables                            │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ [↗] Quote this Solution via WhatsApp                             │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ [→] Consult with Alaec (AI)                                      │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

### 3.2 Campos y Reglas de Negocio del Pop-up

1. **Cabecera y Clasificación:**
   - Barra superior con código de catálogo correlativo: `[INM-CAT-2026.01]` en `Space Mono`.
   - Botón de cierre accesible (`aria-label="Cerrar ficha técnica"`, atajo `[ ESC ]`).
2. **Titular y Propuesta de Valor:**
   - Título de la solución (`<h1>` o `<h2>` en `Space Grotesk` 1.75rem).
   - Bajada descriptiva editorial explicando el impacto comercial y la arquitectura.
3. **Sección `◆ TECHNICAL SPECIFICATIONS`:**
   - Separador tipográfico con diamante Mochica (`◆`) o greca ortogonal.
   - Lista desglosada con guiones largos (`—`) para cada especificación técnica garantizada.
4. **Sección `◆ DELIVERY & SLA CONDITIONS`:**
   - Plazo estimado de ejecución (ej. `~1 to 2 weeks`).
   - Formato de entregables (código fuente auditado en Git, CI/CD, configuración de nube).
   - Plazo de garantía técnica y SLA post-despliegue (ej. `30 days post-launch warranty`).
5. **Sección `BASELINE INVESTMENT:` & Toggle de Moneda Dual:**
   - **Selector de Moneda en Píldora:** `[ PEN | USD ]` con accesibilidad `role="radiogroup"`.
   - **Monto Base Dinámico:**
     - Si está en `PEN`: `S/ 2,400 PEN` (utilizando el formateador institucional `formatPEN`).
     - Si está en `USD`: `$650 USD`.
   - **Nota de Sustentación:** `Scope calibrated to milestone deliverables` / `Alcance calibrado por hitos de entrega`.
6. **Botones de Conversión y Cotización:**
   - **CTA WhatsApp (`.btn-accent`):**  
     `Quote this Solution via WhatsApp ↗`  
     Genera el enlace dinámico `waLink` pre-rellenado:
     ```
     https://wa.me/51987654321?text=Hola%20Inmerge,%20deseo%20cotizar%20la%20solución%20[INM-CAT-2026.01]%20High-Impact%20Landing%20Page.
     ```
   - **CTA Asistente IA Alaec (`.btn-outline`):**  
     `Consult with Alaec (AI) →`  
     Abre el modal interactivo de IA (`LLMAssistantModal.jsx`) inyectando automáticamente el contexto de la solución (título, especificaciones, SLA y estimación).

---

## 4. Sección de Cierre Editorial: Tailored CTA ("Solución a Medida")

Ubicada inmediatamente después del listado de proyectos Index, esta sección captura a los decisores con requerimientos especializados o arquitecturas híbridas:

```
┌────────────────────────────────────────────────────────────────────────┐
│ ¿Busca una arquitectura o auditoría técnica a medida?                  │
│                                                                        │
│ Describa el alcance de su desafío tecnológico. Nuestro equipo          │
│ directivo le entregará un Término de Referencia (TDR), cronograma y    │
│ estimación de inversión en menos de 24 horas hábiles.                  │
│                                                                        │
│ [ Iniciar TDR Técnico ]  [ Consultar con Alaec IA ]  [ WhatsApp ]      │
└────────────────────────────────────────────────────────────────────────┘
```

- **Acción 1:** `Iniciar TDR Técnico` (enlace con desplazamiento a `/contacto`).
- **Acción 2:** `Consultar con Alaec IA` (dispara el asistente IA contextual).
- **Acción 3:** Enlace a WhatsApp institucional bajo compromiso SLA.

---

## 5. Implementación de Componentes React & CSS

### 5.1 Componente Modal: `ProjectSpecModal.jsx`

```jsx
// web/app/src/components/services/ProjectSpecModal.jsx
import { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { waLink } from '../../data/content.js';

export default function ProjectSpecModal({ isOpen, onClose, solution, onOpenAssistant }) {
  const { isEn } = useLanguage();
  const [currency, setCurrency] = useState('PEN'); // 'PEN' | 'USD'

  // Gestión de tecla Escape y scroll-lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen || !solution) return null;

  const title = solution.title?.[isEn ? 'en' : 'es'] || solution.title?.es || '';
  const description = solution.description?.[isEn ? 'en' : 'es'] || solution.description?.es || '';
  const specs = solution.specs?.[isEn ? 'en' : 'es'] || solution.specs?.es || [];
  const conditions = solution.conditions?.[isEn ? 'en' : 'es'] || solution.conditions?.es || [];
  const timeline = solution.timeline?.[isEn ? 'en' : 'es'] || solution.timeline?.es || '';
  const catNumber = solution.catNumber || 'INM-CAT-2026.01';

  const priceFormatted = currency === 'PEN'
    ? `S/ ${solution.penBase?.toLocaleString('es-PE') || '2,400'} PEN`
    : `$${solution.usdBase?.toLocaleString('en-US') || '650'} USD`;

  // Mensaje pre-rellenado de WhatsApp
  const waMessage = isEn
    ? `Hello Inmerge, I would like to quote the solution [${catNumber}] ${title}.`
    : `Hola Inmerge, deseo cotizar la solución [${catNumber}] ${title}.`;
  const customWaUrl = `${waLink}?text=${encodeURIComponent(waMessage)}`;

  return (
    <div 
      className="spec-modal-backdrop" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="spec-modal-title"
    >
      <div 
        className="spec-modal-dialog" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del Modal */}
        <div className="spec-modal-header">
          <span className="spec-modal-mono-cat">
            {catNumber} // {isEn ? 'TECHNICAL SHEET' : 'FICHA TÉCNICA'}
          </span>
          <button 
            type="button" 
            className="spec-modal-close-btn"
            onClick={onClose}
            aria-label={isEn ? 'Close modal' : 'Cerrar modal'}
          >
            [ ESC / ✕ ]
          </button>
        </div>

        {/* Cuerpo y Título */}
        <div className="spec-modal-body">
          <h2 id="spec-modal-title" className="spec-modal-title">
            {title}
          </h2>
          <p className="spec-modal-description">
            {description}
          </p>

          {/* Bloque: Especificaciones Técnicas */}
          <div className="spec-modal-section">
            <h3 className="spec-section-subtitle">
              <span className="spec-diamond">◆</span> {isEn ? 'TECHNICAL SPECIFICATIONS' : 'ESPECIFICACIONES TÉCNICAS'}
            </h3>
            <ul className="spec-items-list">
              {specs.map((item, idx) => (
                <li key={idx} className="spec-item-row">
                  <span className="spec-emdash">—</span>
                  <span className="spec-text">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Bloque: Condiciones y SLA */}
          <div className="spec-modal-section">
            <h3 className="spec-section-subtitle">
              <span className="spec-diamond">◆</span> {isEn ? 'DELIVERY & SLA CONDITIONS' : 'CONDICIONES DE ENTREGA & SLA'}
            </h3>
            <ul className="spec-items-list">
              {timeline && (
                <li className="spec-item-row">
                  <span className="spec-emdash">—</span>
                  <span className="spec-text">
                    <strong>{isEn ? 'Estimated Timeline: ' : 'Plazo Estimado: '}</strong>{timeline}
                  </span>
                </li>
              )}
              {conditions.map((item, idx) => (
                <li key={idx} className="spec-item-row">
                  <span className="spec-emdash">—</span>
                  <span className="spec-text">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Bloque: Inversión Base y Toggle */}
          <div className="spec-investment-panel">
            <div className="spec-investment-top">
              <span className="spec-investment-label">
                {isEn ? 'BASELINE INVESTMENT:' : 'INVERSIÓN BASE ESTIMADA:'}
              </span>
              <div className="currency-pill-toggle" role="radiogroup">
                <button
                  type="button"
                  className={`currency-btn ${currency === 'PEN' ? 'is-active' : ''}`}
                  onClick={() => setCurrency('PEN')}
                >
                  PEN
                </button>
                <span className="currency-divider">|</span>
                <button
                  type="button"
                  className={`currency-btn ${currency === 'USD' ? 'is-active' : ''}`}
                  onClick={() => setCurrency('USD')}
                >
                  USD
                </button>
              </div>
            </div>

            <div className="spec-price-amount">{priceFormatted}</div>
            <p className="spec-price-subtext">
              {isEn 
                ? 'Scope calibrated to milestone deliverables' 
                : 'Alcance calibrado por hitos de entrega auditables'}
            </p>
          </div>

          {/* Botones de Acción y Cotización */}
          <div className="spec-modal-actions">
            <a 
              href={customWaUrl}
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-accent spec-action-btn"
            >
              {isEn ? 'Quote this Solution via WhatsApp ↗' : 'Cotizar esta Solución vía WhatsApp ↗'}
            </a>

            <button
              type="button"
              className="btn-outline spec-action-btn"
              onClick={() => {
                onClose();
                if (onOpenAssistant) {
                  onOpenAssistant({
                    context: `Solución: ${title} (${catNumber})`,
                    solution,
                  });
                }
              }}
            >
              {isEn ? 'Consult with Alaec (AI) →' : 'Consultar con Alaec (IA) →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

### 5.2 Estilos CSS del Modal (`spec-modal.css`)

```css
/* Backdrop con desenfoque editorial */
.spec-modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(36, 26, 18, 0.72);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1.5rem;
  overflow-y: auto;
}

/* Caja de diálogo */
.spec-modal-dialog {
  background-color: var(--bg, #F3EADA);
  color: var(--ink, #241A12);
  border: 1px solid var(--ink, #241A12);
  box-shadow: 0 24px 60px rgba(36, 26, 18, 0.35);
  width: 100%;
  max-width: 680px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  display: flex;
  flex-direction: column;
}

/* Cabecera */
.spec-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(36, 26, 18, 0.15);
  background-color: var(--cream2, #EBDFC9);
}

.spec-modal-mono-cat {
  font-family: var(--font-mono, monospace);
  font-size: 0.8125rem;
  letter-spacing: 0.08em;
  color: var(--terracotta, #A8472B);
  font-weight: 600;
}

.spec-modal-close-btn {
  background: transparent;
  border: none;
  font-family: var(--font-mono, monospace);
  font-size: 0.8125rem;
  cursor: pointer;
  color: var(--ink, #241A12);
  transition: opacity 0.2s ease;
}

.spec-modal-close-btn:hover {
  opacity: 0.6;
}

/* Cuerpo */
.spec-modal-body {
  padding: 2rem 2.25rem;
}

.spec-modal-title {
  font-family: var(--font-display, var(--font-sans));
  font-size: 1.875rem;
  font-weight: 700;
  line-height: 1.15;
  margin-bottom: 0.75rem;
  color: var(--ink, #241A12);
}

.spec-modal-description {
  font-size: 1rem;
  line-height: 1.5;
  color: rgba(36, 26, 18, 0.85);
  margin-bottom: 1.75rem;
}

/* Subtítulos de Sección */
.spec-section-subtitle {
  font-family: var(--font-mono, monospace);
  font-size: 0.8125rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 0.875rem;
  color: var(--ink, #241A12);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.spec-diamond {
  color: var(--gold, #D8A84E);
  font-size: 0.875rem;
}

.spec-items-list {
  list-style: none;
  padding: 0;
  margin: 0 0 1.75rem 0;
}

.spec-item-row {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  font-size: 0.9375rem;
  line-height: 1.45;
  color: rgba(36, 26, 18, 0.9);
}

.spec-emdash {
  font-family: var(--font-mono, monospace);
  color: var(--terracotta, #A8472B);
}

/* Panel de Inversión */
.spec-investment-panel {
  background-color: var(--cream2, #EBDFC9);
  border: 1px solid rgba(36, 26, 18, 0.2);
  padding: 1.25rem 1.5rem;
  margin-bottom: 1.75rem;
}

.spec-investment-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.spec-investment-label {
  font-family: var(--font-mono, monospace);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: rgba(36, 26, 18, 0.7);
}

.currency-pill-toggle {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-family: var(--font-mono, monospace);
  font-size: 0.75rem;
}

.currency-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: rgba(36, 26, 18, 0.5);
  font-weight: 600;
  padding: 0 0.2rem;
}

.currency-btn.is-active {
  color: var(--ink, #241A12);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.spec-price-amount {
  font-family: var(--font-mono, monospace);
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--terracotta, #A8472B);
  line-height: 1.1;
  margin-bottom: 0.25rem;
}

.spec-price-subtext {
  font-size: 0.8125rem;
  color: rgba(36, 26, 18, 0.65);
  margin: 0;
}

/* Botones de Acción */
.spec-modal-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.spec-action-btn {
  width: 100%;
  text-align: center;
  justify-content: center;
  padding: 0.875rem 1.25rem;
  font-size: 0.9375rem;
}
```

---

## 6. Mapeo de Datos Integrado (`SOLUTIONS_CATALOG` ↔ Proyectos Index)

Para asegurar que cada uno de los proyectos en la vista Index abra su respectiva ficha técnica calibrada, se conecta directamente con el catálogo maestro ya existente en [`QuickEstimator.jsx`](file:///C:/papx/website-inmerge/inmerge/web/app/src/components/QuickEstimator.jsx#L5-L180):

| Id Solución | Código Catálogo | Título Solución | Plazo | Inversión Base (PEN / USD) |
| :--- | :--- | :--- | :--- | :--- |
| `landing_alto_impacto` | `INM-CAT-2026.01` | **High-Impact Landing Page** | ~1 a 2 semanas | `S/ 2,400 PEN` / `$650 USD` |
| `web_corporativo` | `INM-CAT-2026.02` | **Sitio Web Corporativo Editorial** | ~2 a 4 semanas | `S/ 4,500 PEN` / `$1,200 USD` |
| `portal_interactivo` | `INM-CAT-2026.03` | **Portal Web Interactivo a Medida** | ~4 a 6 semanas | `S/ 7,200 PEN` / `$1,950 USD` |
| `cloud_microservicios`| `INM-CAT-2026.04` | **Arquitectura Cloud & Microservicios** | ~3 a 5 semanas | `S/ 6,500 PEN` / `$1,750 USD` |
| `software_empresarial`| `INM-CAT-2026.05` | **Aplicación Web Empresarial a Medida** | ~6 a 10 semanas| `S/ 12,000 PEN` / `$3,250 USD` |
| `modernizacion_legacy`| `INM-CAT-2026.06` | **Modernización y Refactorización Core** | ~4 a 8 semanas | `S/ 8,500 PEN` / `$2,300 USD` |
| `bi_dashboard_realtime`| `INM-CAT-2026.07` | **Dashboard Ejecutivo en Tiempo Real** | ~2 a 4 semanas | `S/ 3,800 PEN` / `$1,050 USD` |
| `data_pipeline_etl` | `INM-CAT-2026.08` | **Pipelines de Datos & Data Lakehouse** | ~4 a 6 semanas | `S/ 7,500 PEN` / `$2,000 USD` |
| `ai_agents_enterprise`| `INM-CAT-2026.09` | **Agentes de IA & Modelos Predictivos** | ~5 a 8 semanas | `S/ 9,800 PEN` / `$2,650 USD` |

---

## 7. Próximos Pasos para la Implementación en Código

Cuando se instruya proceder con los cambios en el código:
1. **Crear `ProjectSpecModal.jsx`** en `web/app/src/components/services/`.
2. **Crear `ServicesIndexView.jsx` y `ServicesIndexRow.jsx`** integrando la interacción de poster fade y el botón `[ Ver Ficha → ]`.
3. **Crear `ServicesTailoredCTA.jsx`** con la sección final de cierre de página.
4. **Actualizar `Servicios.jsx`** para reemplazar `ProjectFeed.jsx` por la nueva vista Index y el modal.
5. **Ejecutar `npm test` y `npm run build`** para certificar 100% de tests passing y 0 errores de bundling.
