---
title: "Inmerge Design Specification: Editorial Tech Premium"
status: approved
version: "2.0.0"
created: "2026-09-21"
updated: "2026-09-21"
tokens_source: "design-system/Inmerse Brand Guidelines.dc.html & web/app/src/styles/index.css"
---

# Design Specification (design.md) — Inmerge

Especificación de diseño visual, interfaz y experiencia de usuario para la plataforma Inmerge, fundamentada en el sistema de marca original (`design-system/`) y las directrices de evolución UX editorial.

---

## 1. Fundamento de Marca & Dirección Visual

### 1.1 Identidad "Editorial Tech Premium"
Inmerge fusiona la precisión matemática y constructiva de las culturas prehispánicas de la costa norte del Perú (**Mochica y Chimú**) con los estándares más rigurosos de la ingeniería de software moderna y la auditoría de sistemas.
- **Tono y Personalidad:** Rigor intelectual, sobriedad institucional, claridad forense y autoridad técnica. Rechaza el estilo "startup SaaS genérico" saturado de gradientes morados y copys comerciales vacíos.
- **Sustrato Mineral:** La experiencia descansa sobre sustratos minerales cálidos (arena y crema), evitando blancos clínicos o fondos oscuros artificiales en páginas interiores.

### 1.2 Regla de Oro de la Arquitectura de Lienzo
1. **La Página de Inicio (`/`, `/en`) es la ÚNICA página dividida por secciones y franjas de color:**
   - Hero cinemático oscuro sobre video (`--ink: #241A12` con texto arena `#F3EADA`).
   - Showcase de proyectos y casos de estudio sobre arena mineral (`--bg: #F3EADA`).
   - Bloque de pilares y metodología sobre crema suave (`--cream2: #EBDFC9`).
   - Cierre y franja de conversión sobre terracota de marca (`--terracotta: #A8472B`).
2. **Páginas Interiores (`/nosotros`, `/servicios`, `/contacto` y rutas `/en/*`) son de LIENZO CONTINUO:**
   - Se despliegan sobre un fondo único y fluido de arena mineral (`--bg: #F3EADA` con áreas complementarias en `--cream2`).
   - Sin franjas horizontales de colores contrastantes que fragmenten la concentración del usuario.
   - Reducción sustancial del volumen de texto publicitario: textos concisos, métricas auditables y foco en la interacción directa (estimador, formulario, manifiesto).

---

## 2. Tokens de Marca Canónicos (Sin Tokens Inventados)

Tomados directamente del sistema de marca en `design-system/` y consolidados en `:root` de `web/app/src/styles/index.css`:

### 2.1 Paleta de Color
| Token CSS | Hex / Valor | Rol Semántico |
| :--- | :--- | :--- |
| `--bg` | `#F3EADA` | Superficie mineral principal (Arena). Sustrato del lienzo continuo. |
| `--cream2` | `#EBDFC9` | Superficie secundaria cálida para paneles y áreas de apoyo. |
| `--cream3` | `#E2D3B8` | Fondos de hover sutiles y divisores suaves. |
| `--ink` | `#241A12` | Tinta mineral profunda. Color primario de texto, titulares y nav oscuro. |
| `--brown2` | `#3A2B1C` | Fondo intermedio para contrastes oscuros secundarios. |
| `--muted` | `#7A6B58` | Texto secundario, descripciones breves y metadatos no interactivos. |
| `--tan-text` | `#C9B79C` | Texto suave de apoyo sobre fondos oscuros (ej. Hero). |
| `--terracotta` | `#A8472B` | Acento de marca insignia: botones primarios y marcadores activos. |
| `--terracotta-hover` | `#8A3820` | Estado hover de botones primarios de acción. |
| `--gold` | `#D8A84E` | Insignias de excelencia técnica y acentos en modo oscuro. |
| `--ochre` | `#C68A3D` | Categorías técnicas, coordenadas y marcadores secundarios. |
| `--border` | `#DDCBAE` | Bordes estructurales (`rgba(36, 26, 18, 0.12)`). |
| `--borderStrong` | `rgba(36, 26, 18, 0.25)` | Bordes activos y delimitadores de formularios. |
| `--green` | `#4A9C6A` | Estado de éxito, verificaciones y telemetría en línea. |
| `--rose` | `#D08A6E` | Estados de advertencia técnica controlada. |

### 2.2 Sistema Tipográfico
- **Titulares & Display (`--font-display`, `--font-serif`):**
  - `'Spectral', Georgia, serif` para titulares de impacto editorial con empaque histórico.
  - Alternativa técnica: `'Space Grotesk', 'IBM Plex Sans', sans-serif` para titulares de UI estructurada.
- **Cuerpo de Texto (`--font-sans`):**
  - `'IBM Plex Sans', -apple-system, BlinkMacSystemFont, sans-serif` o `'Space Grotesk'`.
  - Peso regular (400) y medio (500), interlineado relajado (1.6 a 1.7) para legibilidad óptima.
- **Métricas, Cifras & Telemetría (`--font-mono`):**
  - `'Space Mono', 'IBM Plex Mono', monospace`.
  - Empleado obligatoriamente en cifras numéricas, códigos de orden (`INM-ORD-...`), badges técnicos, coordenadas y tiempos de sprint.

---

## 3. Directriz Crítica: Aplanamiento de Cards y Saneamiento de Falsos Botones

Para evitar confusiones en la experiencia de usuario y falsas expectativas de interactividad:

### 3.1 Aplanamiento de Tarjetas (Flattened Cards)
- **Prohibido:** Sombras proyectadas difusas pesadas (`box-shadow: 0 10px 30px rgba(...)`) que eleven tarjetas como si fueran modales o elementos despegados del lienzo.
- **Estándar Permitido:** Tarjetas con superficie plana en `--cream2` o transparentes sobre el lienzo arena, con borde fino de 1px (`--border`), esquinas ligeramente redondeadas (`border-radius: 4px` o `8px`), o esquinas rectas de inspiración arquitectónica Mochica.

### 3.2 Saneamiento de Falsos Botones
- **El Problema:** Textos, etiquetas o badges que usan estilos similares a píldoras interactivas o botones rellenos hacen que el usuario intente hacer clic infructuosamente.
- **Regla Estricta:**
  1. **Badges informativos y tags técnicos:**
     - Deben renderizarse planos, con borde tenue (`border: 1px solid var(--border)`), fondo transparente o `--cream2`.
     - Tipografía mono reducida (11px o 12px), `text-transform: uppercase`.
     - **Cursor:** Estrictamente `cursor: default`. Prohibido `cursor: pointer`.
     - **Hover:** Sin traslaciones de posición (`transform: translateY(-2px)` prohibido en badges) ni efectos de botón.
  2. **Botones de Acción Reales:**
     - Solo los componentes interactivos que ejecutan una acción o redirigen (`<button>`, `<a>`, `<Link>`) tienen derecho a la clase `.btn-accent` (relleno terracota con texto claro) o `.btn-outline` (borde contrastante y relleno sutil en hover).
     - Deben incluir feedback accesible (`:focus-visible` con ring de contraste).

---

## 4. Estilo de Imagen & Elementos Gráficos Mochica-Chimú

### 4.1 Lenguaje Gráfico Prehispánico Depurado
- **Frisos Geométricos de Chan Chan:** Uso de grecas ortogonales repetitivas como delimitadores sutiles entre secciones clave.
- **Rombos Ceremoniales Moche:** Motivo gráfico de rombos rotados a 45° en composiciones piramidales o modulares (patrón 1-3-5 rombos) representando jerarquía y precisión constructiva.
- **Línea Escalonada:** Cortes de nivel y muescas ortogonales inspiradas en las Huacas del Sol y de la Luna.

### 4.2 Tratamiento de Imágenes y Fotografía
- **Fotografía Documental & Humana:** Imágenes sobrias, con personas reales en entornos de ingeniería o arquitectura sobria.
- **Gradación Tonal Mineral:** Las imágenes deben tratarse con un sutil filtro cálido o duotono en tonos tinta y arena para fundirse de forma armónica con el sustrato de la página. Prohibido el uso de ilustraciones 3D caricaturescas tipo "startup tech".

---

## 5. Micro-interacciones & Accesibilidad (WCAG 2.1 AA)

- **Selector de Idioma (`ES | EN`):** Píldora compacta en el Header. Fondo translúcido, opción activa en `--terracotta` con texto `#F3EADA`. Conmutación animada vía View Transitions API.
- **Navegación por Teclado:** Foco visual marcado con `--terracotta` u `--ochre` mediante `:focus-visible { outline: 2px solid var(--terracotta); outline-offset: 2px; }`.
- **Feedback de Sistema:** Todo feedback al usuario (copiado de enlaces, confirmación de TDR, errores de validación) debe usar el componente flotante `ToastNotification.jsx` con atributos ARIA `role="status"` o `role="alert"`. Prohibido el uso de `window.alert()`.

---

## 6. Patrón Curatorial de Cotización (Museum Wall Placard)

Para erradicar el aspecto de "calculadora SaaS" con tarjetas flotantes, la sección de cotización adopta la estética de una **cédula de museo o galería de arte contemporáneo**:
1. **Lienzo Plano:** Montado directamente sobre el sustrato arena mineral (`--bg: #F3EADA`), con estructura en rejilla de 1px (`--border`) y esquinas rectas o sutiles (4px). Cero sombras proyectadas.
2. **Selector Tipográfico Plano:** Las 3 líneas de servicio se seleccionan mediante texto interactivo espacioso (`01 / Páginas Web`, `02 / Ingeniería de Software`, `03 / Inteligencia de Negocios`), donde el estado activo se indica mediante un trazo horizontal inferior de 1px en `--terracotta` y texto en `--ink`.
3. **Escala por Solución Tangible:** La escala se calibra por Tipo de Solución (3 por línea), especificando plazos referenciales de entrega en semanas en lugar de comprometer sprints fijos no contrastados.
4. **Cédula de Ingeniería:** Muestra el código de catálogo (`INM-CAT-2026.XX`), titular en `Spectral`, especificaciones técnicas en viñetas de rombo Mochica, tiempo estimado y cifras tabulares en `Space Mono` con selector `[ PEN | USD ]`.
5. **Acción de Conversión:** Botón primario `.btn-accent` con enlace dinámico que abre WhatsApp con el mensaje pre-redactado con la solución y monto referencial, complementado por un enlace discreto hacia el formulario de contacto TDR.

