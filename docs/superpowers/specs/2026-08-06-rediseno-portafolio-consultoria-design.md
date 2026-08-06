# Rediseño: de tienda de reportes a portafolio de consultoría — Design Spec

**Fecha:** 2026-08-06
**Estado:** aprobado, pendiente de plan de implementación
**Antecede a:** `2026-08-04-endurecimiento-pagos-deposito-design.md`

## Por qué existe este documento

El sitio funciona y su identidad visual es buena. El problema no es de estilo, es de encuadre: **está construido para vender reportes sueltos, y el negocio real es la consultoría.**

Eso produce tres síntomas que se ven en pantalla:

1. `/reportes` se presenta como tienda —tarjetas con precio y botón de compra— cuando esos reportes valen mucho más como prueba de método que como línea de ingreso.
2. El sitio de una consultora de datos **no muestra ni un solo dato**. Promete *"cada cifra con su fuente a la vista"* y no hay ninguna cifra a la vista. La promesa central está declarada, nunca demostrada.
3. Las páginas que deciden si un director escribe —`/servicios`, `/nosotros`— reciben menos cuidado que la tienda que no va a generar ingresos.

## La tesis

**Los reportes son el portafolio, no el producto.**

Un director de gobierno regional no llega buscando un PDF de S/180. Llega preguntándose *"¿esta gente sabe hacer lo que necesito?"*. Cada reporte responde esa pregunta: un ejemplo trabajado del método, sobre datos peruanos reales, con las fuentes a la vista.

Re-encuadrar la biblioteca de reportes convierte una línea de ingreso fallida en el motor de credibilidad del negocio que sí paga. Casi no requiere contenido nuevo — requiere presentarlo distinto.

## El contenido existe (actualizado 2026-08-06)

Cuando se redactó la primera versión de este spec, la tabla `reports` tenía 7 filas inventadas y un solo PDF de relleno. **Eso cambió:** en `reportes/` hay material real y de buena calidad.

- **3 PDFs terminados:** estructura de gasto ministerial, por niveles de gobierno, y recaudación propia (todos 2018-2025).
- **4 informes en Markdown:** gasto distrital de Lima, fiscal de Lima, un anexo técnico, y `REPORTE_SSIV.md`.
- **3 anexos Sankey interactivos** (Plotly) con flujos de gasto público.
- **181 figuras** en `C:\papx\mef2026\mef_2026\deliverables\figuras\` — los informes las referencian con rutas relativas (`../../../figuras/…`) que solo resuelven desde esa carpeta.

El contenido es investigación seria sobre datos del SIAF-MEF, con voz editorial propia y hallazgos que se sostienen solos. **No es material de relleno: es el mejor argumento de venta que tiene el negocio.**

**Dos consecuencias prácticas:**

1. **El catálogo de la base no corresponde a nada real.** Las 7 filas actuales nombran reportes que no existen ("Ejecución presupuestal regional 2025", "La Libertad", "Ministerio de Defensa"). Se reemplazan por los informes reales — no se completan. Los slugs viejos no se preservan: no se han publicado en ninguna parte.

   **Son investigaciones distintas, no versiones del mismo trabajo** (confirmado por el dueño), así que cada archivo es una entrada, guiándose por su nombre. Con dos excepciones que los nombres mismos delatan: `anexo_tecnico_estructura_gasto_lima_distrital.md` es **complemento** de `informe_estructura_gasto_lima_distrital` —el propio informe lo anuncia en su cierre— y no una entrada aparte; y `REPORTE_SSIV.md` **queda fuera por ahora** por decisión del dueño.

   Los tres Sankey se adjuntan al informe que les corresponde según su nombre: `_3niveles` al de niveles de gobierno, `_ingreso` al de recaudación propia, y el general al de estructura de gasto.
2. **Los activos viven fuera del repositorio.** PDFs, figuras y anexos hay que traerlos al proyecto o servirlos desde Storage. Las rutas relativas de los Markdown no sobreviven al traslado y hay que reescribirlas.

Sigue vigente el criterio de diseño: todo debe verse digno con **cero, uno o siete** reportes publicados. Nada puede depender de tener la biblioteca llena.

## Decisiones tomadas

| Decisión | Razón |
|---|---|
| **No se cobra.** Los reportes son gratuitos a cambio de crear una cuenta. El ingreso viene de cotizaciones de consultoría. | Cobrar S/180 nunca iba a mover la aguja, y ponía fricción justo donde está el valor: la captura del lead. |
| **La confirmación por correo se desactiva.** La cuenta se crea y la descarga es inmediata. | El SMTP por defecto de Supabase es para desarrollo, está limitado por hora y ya falló en la práctica. Con reportes gratis, la cuenta es el cuello de botella del negocio — no puede depender de un correo que no llega. |
| **Los pagos salen de la interfaz, quedan dormidos en la BD.** | `orders`, `approve_order()` y compañía están endurecidos y verificados. Cuestan cero dormidos. Borrarlos es una puerta de un solo sentido, tomada un día después de decidir el cambio. |
| **La identidad no se toca.** Paleta de tierra, Spectral, IBM Plex y el rombo se quedan. | El alcance es elevar la ejecución, no rediseñar la marca. El material de `design-system/` seguiría calzando. |
| **Las portadas se generan, no se fotografían.** | No hay fotografía y puede no haberla nunca. Una portada tipográfica derivada del título es más barata, siempre existe, y es más fiel a una marca editorial que una foto de stock. |

## Alcance excluido (YAGNI)

- **Rediseño de identidad.** Ver arriba.
- **Motor de gráficos propio.** La cifra clave se resuelve tipográficamente (ver Fase 2). Los Sankey son la excepción y usan Plotly porque ya vienen hechos con él — no se construye nada nuevo.
- **Lectura del informe completo en la web.** El PDF sigue siendo el entregable; la página lo presenta y lo entrega. Se evaluó publicarlo entero —el contenido lo merece— y se descartó por una razón concreta: si todo el análisis se lee sin registrarse, la cuenta deja de ser un intercambio y el lead magnet no capta nada. Los Sankey cubren la necesidad de mostrar capacidad sin entregar el razonamiento.
- **CMS o panel de edición.** El contenido se administra por SQL, como hoy.

---

## Fase 1 — Quitar lo que ya es falso

Hoy el sitio anuncia precios y un checkout que la decisión de negocio acaba de derogar. Mientras eso siga en pantalla, cada visita ve una oferta que no existe.

1. **Eliminar `/planes`** y su entrada en la navegación. La página entera pierde su razón de ser.
2. **Quitar de `/reportes` los precios y los botones de compra.** La acción única pasa a ser descargar.
3. **Retirar `CheckoutModal` del flujo.** Deja de montarse desde `Reportes.jsx` y `Cuenta.jsx`.
4. **Desactivar la confirmación por correo** en el proyecto Supabase. **Es una acción de dashboard, no de código** (Authentication → Providers → Email → *Confirm email* off).
5. **`signup()` deja de tener rama de "revisa tu correo"** y navega directo a la descarga o a `/cuenta`. El aviso agregado el 2026-08-06 sobre correos ya registrados deja de aplicar en ese punto y se reubica: sigue siendo cierto que un correo repetido no crea cuenta nueva, y el usuario necesita saberlo.
6. **`Cuenta.jsx` deja de mostrar pedidos, suscripción y renovación.** Pasa a ser: mis datos, mis reportes descargados, y cerrar sesión.
7. **Revisar todo el copy** que mencione comprar, precio, suscripción o depósito. Incluye `content.js`, los banners de `Login`/`Registro` y `CLAUDE.md`.

**El código de pagos no se borra.** Las migraciones `0003`-`0012`, las funciones y `orders.js` quedan en el repositorio y en la base. `CLAUDE.md` debe declarar explícitamente que están **dormidas y sin uso en la interfaz**, o el próximo lector asumirá que el sitio cobra.

## Fase 2 — Convertir cada reporte en prueba

Es el corazón del rediseño y lo que resuelve tres problemas de una vez: los rectángulos vacíos, la promesa sin demostrar, y la ausencia total de superficie en buscadores.

1. **Página propia por reporte,** en `/reportes/:slug`. Contiene: título, bajada, la cifra clave, las fuentes, y la descarga.

2. **La cifra clave, tipográfica.** Cada reporte expone **un número con su fuente debajo** — grande, en Spectral, tratado como la pieza principal de la página. Es la expresión más directa posible de *"cada cifra, con su fuente a la vista"*, y es más fiel a una marca editorial que un gráfico genérico.

   Requiere tres columnas nuevas en `reports`, todas anulables para que un reporte sin ellas siga siendo válido:
   - `key_figure text` — la cifra tal como se muestra (`"31%"`, `"S/ 2,400 millones"`).
   - `key_figure_label text` — qué es esa cifra, en una frase (`"del presupuesto regional de 2025 no se ejecutó"`).
   - `sources jsonb` — arreglo de `{ nombre, url }`. `jsonb` y no dos arreglos paralelos, para que nombre y enlace no puedan desalinearse.

   Si `key_figure` es nulo, la sección simplemente no se renderiza. Ningún reporte queda roto por no tenerla.

3. **Fuentes visibles y verificables.** Listadas con nombre y enlace donde exista. Es lo que separa "confía en mí" de "compruébalo".

4. **Portada generada, no fotografiada.** Una composición tipográfica derivada del título sobre la paleta, con el rombo.

   **Mecanismo:** una ruta que renderiza la portada con `@vercel/og` a partir del slug, y devuelve una imagen cacheada. Es la misma pieza que sirve la imagen social de la Fase 4 — se construye una vez y se usa en los dos lugares. En desarrollo local, donde `@vercel/og` no corre, la tarjeta cae a la misma composición hecha con CSS, para que nadie tenga que desplegar para verla.

   Elimina los siete rectángulos rayados para siempre y no depende de que exista fotografía.

5. **La descarga exige cuenta, y la cuenta es instantánea.** Sin sesión, la página muestra todo el contenido y pide crear cuenta para bajar el PDF. Con sesión, descarga directa. La página es pública y indexable; solo el archivo está detrás de la cuenta.

6. **`/reportes` pasa de tienda a índice de portafolio.** Sin precios, sin distinción premium, con la cifra clave asomando en cada tarjeta.

7. **Los anexos Sankey son la prueba pública.** Se muestran **sin exigir cuenta**, a diferencia del análisis escrito. Esa asimetría es deliberada: el diagrama demuestra capacidad de un vistazo y no revela el razonamiento, así que la cuenta sigue siendo un intercambio real por el informe. Es lo más diferenciador del sitio — ningún competidor peruano publica flujos de gasto público navegables.

   **No se sirven tal como están.** Cada archivo pesa 4.86 MB, de los cuales **los datos son 10 KB y el resto es la librería Plotly empaquetada**. Incrustarlos por `iframe` mandaría 14.6 MB para mostrar 30 KB de información. Además tienen lienzo fijo de `1450×900px`, o sea inservibles en móvil — donde estará la mayoría del tráfico.

   **Enfoque:** extraer el payload de datos de cada anexo (la llamada a `Plotly.newPlot`), guardarlo como JSON, y renderizarlo con **una sola** copia de Plotly cargada aparte y compartida por los tres. El lienzo pasa a ser responsivo. Resultado: ~30 KB de datos más una librería que se cachea una vez, en vez de 14.6 MB.

8. **El modelo de derechos se colapsa, y hay que decirlo explícitamente.** Hoy `has_access()` distingue tres vías: reporte gratuito, compra individual, o suscripción vigente. Si todo es gratis a cambio de cuenta, esas tres ramas se reducen a una sola pregunta: **¿hay sesión y el reporte está publicado?**

   Esto no es cosmético — `get-report-download-url` llama a `has_access()` para decidir si entrega el archivo, así que la función tiene que cambiar o seguirá negando descargas de los reportes marcados `premium`.

   **La columna `tier` se conserva** (permite volver a distinguir sin una migración de datos), pero deja de gatear el acceso. La condición pasa a ser publicación + sesión. Las ramas de compra y suscripción se quedan escritas pero inalcanzables mientras no se cobre — coherente con dejar los pagos dormidos, y documentado como tal en la propia función.

## Fase 3 — Cerrar el camino a la cotización

Alguien que terminó de leer un reporte tuyo es el lead más caliente que vas a tener. Hoy no hay nada esperándolo ahí.

1. **Cada página de reporte termina en una invitación específica**, no genérica: *"¿Quieres este análisis sobre tus datos?"*, ligada al servicio que corresponde.
2. **`/servicios` deja de exigir seis clics para comparar seis servicios.** Un director escanea; hoy tiene que abrir uno por uno. Concretamente: que el problema y el plazo de cada servicio se lean **sin abrir nada**, y que el acordeón quede para el detalle (valor y entregables), no para la información básica.
3. **Mostrar cómo se ve un entregable.** La página nombra "Informe de brechas" y "Hoja de ruta priorizada" sin enseñarlos nunca.
4. **La cotización captura contexto,** no solo abre un chat: qué problema, qué datos tiene, qué plazo. WhatsApp sigue siendo el canal; lo que cambia es llegar con la conversación empezada.

## Fase 4 — Subir la ejecución

Ninguno de estos cambia la estructura; todos elevan el resultado.

1. **El friso deja de ser papel tapiz.** Aparece 5-6 veces por página; deja de puntuar y se vuelve ruido. Reducirlo a los cortes que de verdad separan secciones.
2. **Contraste legible en "Método Acequia".** Los números `01`-`05` son marrón oscuro sobre marrón oscuro.
3. **Arreglar la grilla huérfana de `/reportes`:** 5 elementos en 4 columnas dejan uno solo con tres huecos al lado.
4. **`og:image` generada por página** con `@vercel/og`, reutilizando el sistema de portadas de la Fase 2. Hoy no hay ninguna, y **WhatsApp es el canal principal**: cada link compartido sale en blanco.
5. **Respaldo sin JavaScript.** `[data-reveal] { opacity: 0 }` sin `<noscript>` deja la página vacía si el JS falla.
6. **Vercel Web Analytics y Speed Insights.** Hoy no hay ningún dato sobre qué páginas se visitan — se estaría rediseñando a ciegas.

---

## Secuencia de ejecución

Las fases son secuenciales por dependencia real, no por preferencia:

- **La Fase 1 va primero** porque es la única que hoy le miente al visitante, y porque la Fase 2 construye sobre una `/reportes` ya sin precios.
- **La Fase 2 antes que la 3:** la cotización se engancha al final de la página de reporte, que la Fase 2 crea.
- **La Fase 4 es independiente** de las otras tres salvo en un punto: la imagen social reutiliza el generador de portadas de la Fase 2, así que ese ítem espera. El resto (friso, contraste, grilla, `noscript`, analytics) puede ir en cualquier momento.

**Nota sobre el tamaño:** las Fases 1 y 4 son acotadas y entregan valor por sí solas. Las Fases 2 y 3 son sustancialmente más grandes (ruta nueva, columnas nuevas, generación de imágenes, flujo de cotización). Si al escribir el plan la Fase 2 resulta desproporcionada, corresponde partirlo en dos planes —1+4, luego 2+3— en vez de forzar un plan gigante.

## Criterios de éxito

1. No queda ninguna mención de precio, compra, suscripción o depósito en la interfaz.
2. Crear una cuenta y descargar un reporte ocurre **sin pasar por el correo**.
3. Cada reporte publicado tiene página propia, indexable, con su cifra clave y sus fuentes visibles.
4. Ningún rectángulo de relleno queda en pantalla, con o sin fotografía disponible.
5. Un link compartido por WhatsApp muestra imagen y título correctos.
6. La página se lee entera con JavaScript deshabilitado.
7. `npm test`, `npm run lint` y `npm run build` en verde.
8. El sitio se ve digno con **cero** reportes publicados.
9. Los Sankey se ven y se navegan **en un teléfono**, y la página que los contiene no descarga más de una copia de Plotly.
10. El catálogo en pantalla corresponde uno a uno con informes que existen en disco. Ninguna fila nombra algo que no se pueda descargar.

## Riesgos conocidos

- **Desactivar la confirmación por correo permite cuentas con correos inexistentes.** Es aceptable para un lead magnet —el correo se valida al cotizar— pero implica que la lista de leads tendrá ruido. Es una decisión de negocio ya tomada, registrada acá para que no sorprenda.
- **Dejar los pagos dormidos deja un subsistema sin ejercitar.** Sus tests siguen corriendo, pero nadie usa el flujo. Si algún día se reactiva, hay que re-verificarlo antes de confiar en él, no asumir que sigue bueno.
- **Los textos del catálogo son un primer borrador.** El dueño confirmó que los ajustará después. Títulos, bajadas y cifras clave se derivan de los propios informes, pero se escriben para ser editados, no como definitivos.
- **Los dos informes de Lima se convierten a PDF** (decisión del dueño). Solo existen en `.md` y el entregable definido por este spec es el PDF.

  **Enfoque:** maquetar el Markdown como HTML con el sistema de marca del sitio —Spectral para títulos, IBM Plex para cuerpo, la paleta de tierra, el rombo— e imprimirlo a PDF con el navegador headless que el proyecto ya usa para verificación. Un `pandoc` genérico produciría un documento ajeno a la marca; esto produce uno consistente con los otros tres.

  **Riesgo asumido y declarado:** los tres PDFs existentes fueron maquetados a mano y los convertidos no van a ser idénticos. La comparación lado a lado antes de publicar es parte del trabajo, no un extra — si el resultado desmerece al original, es mejor dejar esas dos entradas despublicadas que degradar contenido bueno.

  Las figuras que referencian (`../../../figuras/…`) deben resolverse antes de convertir, o el PDF sale con imágenes rotas.
- **Las figuras se referencian con rutas que no sobreviven al traslado.** `../../../figuras/…` resuelve solo desde `reportes/`. Al mover los activos hay que reescribirlas o las imágenes quedan rotas.
- **`inmerge.pe` sigue sin resolver** (sin registros MX/A/NS). Afecta la imagen social, los `mailto:` de todo el sitio y el despliegue. No lo resuelve este spec.

## Cuestiones abiertas que no son técnicas

- **Escribir los reportes.** Es el bloqueador real del negocio.
- **Rotar la `service_role` key** de Supabase (pendiente desde el 2026-08-05).
- **Registrar y configurar el dominio.**
