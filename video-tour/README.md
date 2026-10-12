# Guía de Video Product Showcase — Inmerge

Este directorio contiene la composición HTML utilizada para generar videos promocionales de Inmerge mediante HyperFrames.

El objetivo no es únicamente registrar la interfaz, sino convertir el producto digital en una pieza audiovisual breve, cinematográfica y orientada a producto.

---

## 1. Objetivo del video

El video debe comunicar tres elementos:

1. Qué es el producto.
2. Qué experiencia ofrece.
3. Qué elemento diferencia visualmente al producto.

La animación nunca debe distraer de la interfaz.

### Principio creativo

> Product first. Motion second. Brand last.

La interfaz real de Inmerge debe permanecer como elemento principal de la composición.

Los movimientos de cámara, zoom, profundidad, desplazamientos y transiciones tienen como función dirigir la atención hacia partes concretas del producto.

---

# 2. Formato maestro

### Master

* Resolución: 1920 × 1080
* Aspect ratio: 16:9
* FPS: 30
* Duración objetivo: 15 segundos
* Formato final: MP4
* Audio: opcional
* Render: determinista

HyperFrames permite definir explícitamente ancho, alto y FPS de la composición, y su CLI actual permite controlar FPS y calidad durante el render.

### Variantes recomendadas

Para futuros proyectos:

**Hero video**

* 8–12 s
* silencioso
* loop
* movimiento continuo

**Product showcase**

* 15–25 s
* 3–5 escenas

**Product launch**

* 30–60 s
* narrativa más completa

**Case-study / portfolio**

* 30–90 s
* problema → solución → resultado

---

# 3. Dirección visual

## Motion language

La animación debe sentirse:

* premium
* precisa
* tecnológica
* cinematográfica
* sobria
* intencional

Evitar:

* exceso de zoom
* movimientos bruscos sin propósito
* demasiados efectos 3D
* flashes innecesarios
* transiciones diferentes en cada escena
* animaciones que compitan con la interfaz

### Regla

Cada movimiento debe responder a una de estas funciones:

**Reveal**
mostrar algo.

**Focus**
llevar la atención a algo.

**Transition**
conectar dos escenas.

**Emphasis**
dar importancia a una característica.

**Brand**
reforzar identidad visual.

---

# 4. Cámara

La cámara debe comportarse como una cámara física virtual.

### Movimientos permitidos

* push-in lento
* pull-out lento
* lateral pan
* vertical slide
* orbit sutil
* parallax
* rack focus simulado
* profundidad 3D moderada

### Intensidad

Preferencia general:

```text
70% movimientos suaves
20% movimientos dinámicos
10% movimientos agresivos
```

Los movimientos agresivos deben reservarse para momentos de transición o impacto.

---

# 5. Profundidad 3D

El navegador o la interfaz pueden estar colocados sobre un espacio tridimensional.

Usar:

```text
perspective
rotateX
rotateY
translateZ
scale
drop-shadow
depth layers
```

Pero la profundidad debe ser pequeña.

Objetivo:

> crear sensación de volumen, no convertir el video en una demostración de efectos 3D.

La interfaz siempre debe permanecer legible.

---

# 6. Storyboard maestro

## Scene 01 — Product Reveal

### 0.0–2.5 s

Mostrar la interfaz principal.

El navegador aparece desde una posición ligeramente desplazada y se estabiliza frente a la cámara.

Movimiento:

```text
scale: 0.92 → 1.00
translateY: 60px → 0
rotateY: 4deg → 0deg
opacity: 0 → 1
```

Easing:

```text
power3.out
```

Objetivo:

Presentar el producto antes de comenzar a explicar sus características.

---

## Scene 02 — Product Focus

### 2.5–6.5 s

La cámara realiza un push-in hacia la zona visualmente más importante de la página.

El resto de la interfaz pierde ligeramente protagonismo.

Movimiento:

```text
scale: 1.00 → 1.08
```

El movimiento debe ser continuo y lento.

Objetivo:

Mostrar qué hace especial al producto.

---

## Scene 03 — Feature Reveal

### 6.5–10.0 s

Cambiar hacia la siguiente sección del producto.

Preferir:

```text
vertical transition
pan
masked reveal
shared-element movement
```

en lugar de un cambio brusco.

El elemento principal de la escena anterior puede continuar parcialmente hacia la nueva escena.

Objetivo:

Crear sensación de continuidad.

---

## Scene 04 — Product Summary

### 10.0–13.0 s

Alejar la cámara y mostrar nuevamente una composición más amplia.

El producto debe aparecer como una pieza coherente.

Movimiento:

```text
scale: 1.08 → 0.94
```

Objetivo:

dar contexto después del detalle.

---

## Scene 05 — Brand Outro

### 13.0–15.0 s

Reducir la presencia de la interfaz.

Mostrar:

```text
INMERGE
```

junto con el elemento de identidad correspondiente.

La animación final debe sentirse como un cierre de marca, no como una quinta demostración de producto.

---

# 7. Transiciones

Usar un lenguaje consistente durante todo el video.

### Transiciones prioritarias

1. Shared-element transition
2. Push / pull camera
3. Vertical slide
4. Mask reveal
5. Crossfade
6. Hard cut

El hard cut debe utilizarse cuando exista una razón narrativa.

Un flash debe ser excepcional, no un recurso predeterminado.

---

# 8. Color

Utilizar únicamente tokens definidos por el sistema visual del proyecto.

```css
--arena: #F3EADA;
--ink: #241A12;
--terracotta: #A8472B;
--gold: ...;
--cream: ...;
```

No introducir nuevos colores durante la producción del video salvo que pertenezcan al producto.

---

# 9. Tipografía

La tipografía debe coincidir con la identidad visual del sitio.

Jerarquía:

```text
Brand
↓
Product title
↓
Feature
↓
Supporting text
```

Evitar texto excesivo.

Una escena debe poder entenderse visualmente incluso sin sonido.

---

# 10. Composición HyperFrames

La estructura recomendada es:

```text
video-tour/
│
├── index.html
├── STORYBOARD.md
├── BRIEF.md
├── meta.json
│
├── compositions/
│   ├── scene-01.html
│   ├── scene-02.html
│   ├── scene-03.html
│   ├── scene-04.html
│   └── scene-05.html
│
├── assets/
│
└── renders/
```

La documentación oficial actual de HyperFrames utiliza precisamente una estructura con `index.html`, `compositions/`, `assets/`, `renders/` y storyboard/meta como archivos de proyecto.

Las composiciones permiten mantener cada escena modular y reutilizable.

---

# 11. Separación entre timing y animación

El HTML debe controlar:

```text
start
duration
track
media timing
composition timing
```

GSAP debe controlar:

```text
transform
opacity
scale
rotation
camera movement
visual transitions
```

No utilizar JavaScript para competir con el sistema de timing de HyperFrames.

HyperFrames indica que el framework administra el ciclo de vida de los clips y el playback de medios, mientras los scripts se ocupan del movimiento visual.

---

# 12. Desarrollo local

Iniciar Inmerge:

```bash
npm run dev
```

o:

```bash
bun dev
```

Verificar:

```text
http://localhost:5173
```

Posteriormente:

```bash
cd video-tour
```

Preview:

```bash
npx hyperframes preview
```

Antes del render final ejecutar:

```bash
npx hyperframes lint
npx hyperframes check
```

Render:

```bash
npx hyperframes render --output renders/inmerge-product-showcase.mp4
```

Para una versión final de mayor calidad:

```bash
npx hyperframes render --quality high --output renders/inmerge-product-showcase-master.mp4
```

HyperFrames recomienda actualmente el flujo `lint → check → render`; también permite utilizar Docker cuando se necesita un entorno de render más controlado y reproducible.

---

# 13. Versionado

Mantener una versión fija de HyperFrames en cada proyecto para conservar reproducibilidad.

Antes de actualizar:

```bash
npx hyperframes@latest upgrade --project . --check
```

Si existe una actualización:

```bash
npx hyperframes@latest upgrade --project .
```

Después:

```bash
npx hyperframes check
```

La documentación actual recomienda fijar la versión utilizada por el proyecto y verificar la composición después de una actualización.

---

# 14. Checklist de calidad

Antes del render final:

### Producto

* La interfaz es claramente visible.
* La funcionalidad principal se entiende.
* El movimiento no oculta información.
* Los textos permanecen legibles.

### Motion

* Cada movimiento tiene propósito.
* No existen movimientos arbitrarios.
* Las transiciones mantienen continuidad.
* La cámara no produce sensación de mareo.
* El cierre tiene suficiente tiempo para ser entendido.

### Técnica

* `lint` pasa correctamente.
* `check` pasa correctamente.
* Resolución correcta.
* FPS correcto.
* Assets cargan correctamente.
* El MP4 exportado fue revisado.

El archivo exportado debe revisarse de forma independiente del preview, ya que HyperFrames distingue entre la reproducción de previsualización y el archivo final renderizado.
