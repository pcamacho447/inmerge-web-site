# Plan A — Limpiar la tienda y elevar la ejecución

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que el sitio deje de anunciar precios, suscripciones y un checkout que la decisión de negocio ya derogó, y que la ejecución visual suba de nivel — todo antes del despliegue previsto para el 15 de agosto.

**Architecture:** Una migración que colapsa el modelo de derechos a "publicado + sesión", el retiro de la capa de venta de la interfaz (dejando el código de pagos dormido en la base y el repositorio), y una tanda de correcciones visuales acotadas.

**Tech Stack:** React 18, Vite 5, react-router-dom 6, Supabase Postgres + RLS, Deno Edge Functions, vitest 4 + jsdom.

**Spec:** `docs/superpowers/specs/2026-08-06-rediseno-portafolio-consultoria-design.md`

**Este plan NO incluye** las páginas por reporte, las portadas generadas, los Sankey ni la cotización. Eso es el Plan B, que construye encima de este.

## Global Constraints

- **Proyecto Supabase:** `zboxdsiejvmjupdawgax`. Es el único vivo.
- **Directorio de trabajo:** todos los comandos se corren desde `web/app/`.
- **Shell:** Windows. En Bash encadena con `;` o `&&`; nunca con el `&&` de PowerShell.
- **Migraciones:** `npx supabase@latest db push --include-all --linked`. El MCP de Supabase devuelve 401 en este entorno; usa el CLI. Lecturas: `npx supabase@latest db query --linked "..."`.
- **`0001`-`0012` ya están aplicadas.** La siguiente libre es `0013`.
- **Estilos:** objetos `style={{}}` inline con CSS vars (`var(--terracotta)`). Sin Tailwind. `:hover`/`:active` solo con las clases existentes: `btn-hover`, `btn-outline-hover`, `card-hover`, `row-hover`, `link-hover`, `icon-btn-hover`.
- **Nunca** el shorthand `font` después de `fontSize`/`fontWeight` en el mismo objeto: los resetea en silencio.
- **Prettier: 140 columnas.** Corre `npm run format` antes de cada commit.
- **Copy en español**, tono directo, sin signos de admiración.
- **El hosting será AWS S3 + CloudFront.** Nada puede depender de una plataforma concreta.
- **No borres el código de pagos.** Migraciones `0003`-`0012`, `orders.js`, `CheckoutModal.jsx` y sus tests se quedan. Lo que se quita es su uso en la interfaz.

---

### Task 1: Migración `0013` — colapsar el modelo de derechos

**Files:**
- Create: `web/app/supabase/migrations/0013_access_is_free_with_account.sql`

**Interfaces:**
- Consumes: `public.reports`, `public.has_access`.
- Produces: `has_access(uuid, uuid)` que concede acceso a cualquier sesión sobre cualquier reporte publicado.

- [ ] **Step 1: Escribir la migración**

Crea `web/app/supabase/migrations/0013_access_is_free_with_account.sql`:

```sql
-- Los reportes dejan de venderse: son gratuitos a cambio de crear una cuenta,
-- y el ingreso viene de cotizaciones de consultoría. El modelo de derechos se
-- colapsa en consecuencia.
--
-- Antes había tres vías: reporte gratuito, compra individual, o suscripción
-- vigente. Ahora hay una sola pregunta: ¿hay sesión y el reporte está publicado?
--
-- Esto NO es cosmético. get-report-download-url llama a has_access() para
-- decidir si entrega el archivo, así que sin este cambio los reportes marcados
-- `tier = 'premium'` seguirían negando la descarga aunque ya no cuesten nada.
--
-- `p_user_id is not null` es la comprobación de sesión: la Edge Function solo
-- llega hasta acá después de validar el token y pasa el id del usuario real.
--
-- Las ramas de compra y suscripción se ELIMINAN en vez de dejarse escritas e
-- inalcanzables. Una rama muerta que nadie puede alcanzar miente sobre lo que
-- el sistema hace; si algún día se vuelve a cobrar, la versión anterior está
-- en 0009_published_and_file_path.sql y en el historial de git.
--
-- La columna `reports.tier` se conserva: permite volver a distinguir sin una
-- migración de datos, pero deja de gatear el acceso.
create or replace function public.has_access(p_user_id uuid, p_report_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select p_user_id is not null
    and exists (
      select 1
      from public.reports r
      where r.id = p_report_id
        and r.published_at is not null
        and r.published_at <= now()
    );
$$;

revoke execute on function public.has_access(uuid, uuid) from public, anon, authenticated;
grant execute on function public.has_access(uuid, uuid) to service_role;
```

- [ ] **Step 2: Aplicar**

Run: `npx supabase@latest db push --include-all --linked`
Expected: `Applying migration 0013_access_is_free_with_account.sql...` sin errores.

- [ ] **Step 3: Verificar el comportamiento nuevo**

Con `db query --linked`. Usa el usuario existente y los dos reportes premium, que antes se le negaban:

```sql
select
  (select has_access(
     (select id from auth.users limit 1),
     (select id from public.reports where slug = 'radiografia-contratistas-infraestructura'))) as premium_con_sesion,
  (select has_access(
     null,
     (select id from public.reports where slug = 'radiografia-contratistas-infraestructura'))) as premium_sin_sesion;
```

`premium_con_sesion` debe ser `true` (antes era `false`: no hay compra ni suscripción para ese reporte).
`premium_sin_sesion` debe ser `false`.

- [ ] **Step 4: Verificar que un reporte sin publicar sigue bloqueado**

```sql
begin;
update public.reports set published_at = null where slug = 'gasto-ministerio-defensa';
select has_access((select id from auth.users limit 1),
                  (select id from public.reports where slug = 'gasto-ministerio-defensa')) as debe_ser_false;
rollback;
```

`debe_ser_false` tiene que ser `f`. Si es `t`, la condición de publicación no quedó aplicada.

- [ ] **Step 5: Verificar los ACL**

```sql
select has_function_privilege('anon', 'public.has_access(uuid,uuid)', 'execute') as anon_puede,
       has_function_privilege('authenticated', 'public.has_access(uuid,uuid)', 'execute') as auth_puede,
       has_function_privilege('service_role', 'public.has_access(uuid,uuid)', 'execute') as service_puede;
```

Los dos primeros `false`, el tercero `true`.

- [ ] **Step 6: Commit**

```bash
git add web/app/supabase/migrations/0013_access_is_free_with_account.sql
git commit -m "feat(db): grant report access to any session, reports are free now"
```

---

### Task 2: Cuenta instantánea — desactivar la confirmación por correo

**Files:**
- Modify: `web/app/src/lib/auth.jsx` (`signup`, ~líneas 177-200)
- Modify: `web/app/src/pages/Registro.jsx` (eliminar el estado `confirmEmailSent` y su pantalla)

**Interfaces:**
- Consumes: nada.
- Produces: `signup(...)` que devuelve `void` y deja sesión iniciada; `Registro.jsx` sin rama de "revisa tu correo".

- [ ] **Step 1: Desactivar la confirmación en el proyecto Supabase**

**Esto es una acción de dashboard, no de código.** No hay forma de hacerlo por el CLI.

Dashboard → **Authentication → Sign In / Providers → Email** → desactivar **Confirm email** → guardar.

Sin este paso, los cambios de código de abajo dejan al usuario en una pantalla que espera una sesión que nunca llega.

- [ ] **Step 2: Verificar que la confirmación quedó desactivada**

Este es el paso que prueba el Step 1. Crea `web/app/_verificar_signup.mjs`:

```js
// Temporal: confirma que signUp devuelve sesión inmediata.
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf-8')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'))
    .map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1)]),
);

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);
const email = `verif-${Date.now()}@mailinator.com`;

const { data, error } = await supabase.auth.signUp({
  email,
  password: `Verif-${Math.random().toString(36).slice(2)}-x9`,
  options: { data: { full_name: 'Verificacion', billing_type: 'persona_natural' } },
});

if (error) console.log('ERROR:', error.message);
else console.log('sesion inmediata:', !!data.session, '<- debe ser true');
console.log('usuario creado:', data?.user?.id ?? 'ninguno');
```

Run: `node _verificar_signup.mjs`
Expected: `sesion inmediata: true`. Si sale `false`, el Step 1 no se aplicó — **detente y vuelve al dashboard**.

Después borra el usuario de prueba (Dashboard → Authentication → Users) y el script:
`rm _verificar_signup.mjs`

- [ ] **Step 3: Simplificar `signup()` en `auth.jsx`**

Reemplaza la función `signup` completa por:

```jsx
  // La confirmación por correo está desactivada en el proyecto: signUp deja
  // sesión iniciada de inmediato y el listener de onAuthStateChange construye
  // el usuario. No hay rama de "revisa tu correo" porque no hay correo.
  //
  // Un correo ya registrado sigue devolviendo éxito sin sesión y sin crear
  // nada — GoTrue lo hace a propósito, para que nadie descubra qué direcciones
  // tienen cuenta probándolas. Ese caso se detecta acá y se convierte en un
  // error accionable, porque sin sesión el usuario se quedaría mirando un
  // formulario que "funcionó" y no lo llevó a ninguna parte.
  const signup = useCallback(async ({ fullName, email, password, billingType, taxId }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, billing_type: billingType, tax_id: taxId || null } },
    });
    if (error) throw error;
    if (!data.session) {
      throw new Error('Ese correo ya tiene una cuenta. Inicia sesión con tu contraseña.');
    }
  }, []);
```

**Nota de diseño:** acá sí se revela que el correo existe, a diferencia de la decisión del 2026-08-06. El motivo cambió: antes había una pantalla de "revisa tu correo" que absorbía ambos casos; ahora, sin esa pantalla, un `signUp` sin sesión deja al usuario sin salida. Entre filtrar que una dirección está registrada y dejar a un cliente atascado en el único formulario que da acceso, el segundo costo es mayor para un lead magnet.

- [ ] **Step 4: Quitar la pantalla de confirmación de `Registro.jsx`**

Elimina el estado `confirmEmailSent` (línea ~20), el bloque `{confirmEmailSent ? (...) : (` con toda la tarjeta oscura de "Revisa tu correo", y su `)}` de cierre — dejando el `<form>` como único contenido. Y en `handleSubmit`, reemplaza:

```jsx
      const result = await signup({ fullName: fullName.trim(), email: email.trim(), password, billingType, taxId: taxId.trim() });
      if (result.confirmEmailRequired) {
        setConfirmEmailSent(true);
      } else {
        navigate(location.state?.redirectTo || '/cuenta');
      }
```

por:

```jsx
      await signup({ fullName: fullName.trim(), email: email.trim(), password, billingType, taxId: taxId.trim() });
      navigate(location.state?.redirectTo || '/cuenta');
```

Si `Link` queda sin uso tras borrar la tarjeta, quítalo del import — el lint lo marcará.

- [ ] **Step 5: Verificar**

Run: `npm test; npm run lint; npm run build`
Expected: todo en verde.

Levanta `npm run dev`, crea una cuenta con un correo nuevo y confirma que **entra directo a `/cuenta`** sin pasar por ninguna pantalla de correo. Después bórrala del dashboard.

- [ ] **Step 6: Commit**

```bash
npm run format
git add web/app/src/lib/auth.jsx web/app/src/pages/Registro.jsx
git commit -m "feat: sign up straight into a session, no email confirmation step"
```

---

### Task 3: Eliminar `/planes`

**Files:**
- Delete: `web/app/src/pages/Planes.jsx`
- Modify: `web/app/src/App.jsx:26`
- Modify: `web/app/src/data/content.js:21`
- Modify: `web/app/src/pages/Cuenta.jsx:210`, `web/app/src/pages/Reportes.jsx:68,130`

**Interfaces:**
- Consumes: nada.
- Produces: ninguna ruta ni enlace a `/planes` en el sitio.

- [ ] **Step 1: Borrar la página y su ruta**

```bash
rm web/app/src/pages/Planes.jsx
```

En `src/App.jsx`, borra la línea `<Route path="/planes" element={<Planes />} />` y el import de `Planes`.

- [ ] **Step 2: Quitarla de la navegación**

En `src/data/content.js`, borra la entrada `{ to: '/planes', label: 'Planes' }` de `NAV_LINKS`.

- [ ] **Step 3: Quitar los TRES enlaces entrantes, en esta misma tarea**

Borrar la ruta y dejar enlaces apuntando a ella deja el sitio con botones visibles que llevan a un 404. **Los tres se van acá**, aunque las Tasks 4 y 5 después eliminen los bloques que los contienen:

- `Reportes.jsx:68` — el párrafo de introducción dice *"de a un reporte suelto o por suscripción"*. Reescríbelo para que hable de descargar con cuenta.
- `Reportes.jsx:130` — el enlace "Ver planes →" junto al encabezado "Reportes premium". Borra **solo el enlace**; el encabezado lo quita la Task 4.
- `Cuenta.jsx:210` — el botón "Ver planes" del bloque de suscripción. Borra **solo el botón**; el bloque lo quita la Task 5.

En los dos últimos, si al quitar el enlace el contenedor queda vacío o descuadrado, déjalo visualmente aceptable — es un estado que va a durar una o dos tareas, no debe verse roto.

- [ ] **Step 4: Verificar**

Run: `npm run build; npm run lint`
Expected: build limpio. Un error de import aquí significa que quedó una referencia.

Run: `grep -rn "planes\|Planes" web/app/src/`
Expected: **sin ninguna coincidencia.** Si queda alguna, hay un enlace roto en producción.

Levanta `npm run dev` y confirma que la navegación ya no muestra "Planes" y que ni `/reportes` ni `/cuenta` tienen botones que lleven ahí.

- [ ] **Step 5: Commit**

```bash
npm run format
git add -A web/app/src
git commit -m "feat: remove the pricing page, reports are not sold anymore"
```

---

### Task 4: Quitar la venta de `/reportes`

**Files:**
- Modify: `web/app/src/pages/Reportes.jsx`

**Interfaces:**
- Consumes: `hasAccess` de `auth.jsx`, `useReports`.
- Produces: `/reportes` sin precios, sin distinción premium y sin checkout.

- [ ] **Step 1: Unificar el catálogo**

Hoy la página parte los reportes en dos grillas (`freeReports` y `premiumReports`, línea ~25) y les da tratamientos distintos: las tarjetas premium son mucho más grandes y llevan una insignia. Esa jerarquía existía porque unos costaban y otros no.

Reemplaza las dos grillas por **una sola**, con el mismo tamaño de tarjeta para todos los reportes. Quita el encabezado "Reportes premium" y su enlace "Ver planes →" (línea ~129-131), y la insignia `PREMIUM` de las tarjetas.

**Deja el filtro por `tier` fuera:** la columna sigue existiendo pero no se usa para nada visual.

- [ ] **Step 2: Reemplazar la acción de compra**

En la línea ~195, `Comprar por depósito — S/ {formatPEN(r.price_pen)}` desaparece. Toda tarjeta lleva la misma acción, que depende solo de si hay sesión. `Cuenta.jsx` ya tiene el patrón de descarga (`handleDownload` con `getReportDownloadUrl`); reutilízalo tal cual:

```jsx
                  {user ? (
                    <button
                      type="button"
                      onClick={() => handleDownload(r.id)}
                      disabled={downloadingId === r.id}
                      className="link-hover"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        fontSize: 13,
                        fontWeight: 600,
                        fontFamily: "'IBM Plex Sans',sans-serif",
                        cursor: downloadingId === r.id ? 'wait' : 'pointer',
                        background: 'none',
                        border: 'none',
                        color: 'inherit',
                        padding: 0,
                      }}
                    >
                      <div style={{ width: 7, height: 7, background: 'var(--terracotta)', transform: 'rotate(45deg)' }} />
                      {downloadingId === r.id ? 'Generando…' : 'Descargar reporte'}
                    </button>
                  ) : (
                    <Link
                      to="/registro"
                      state={{ redirectTo: '/reportes' }}
                      className="link-hover"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600 }}
                    >
                      <div style={{ width: 7, height: 7, background: 'var(--terracotta)', transform: 'rotate(45deg)' }} />
                      Crear cuenta para descargar
                    </Link>
                  )}
```

Esto exige traer a `Reportes.jsx` el estado y la función de descarga que hoy viven en `Cuenta.jsx` (`downloadingId`, `downloadError`, `handleDownload`, `mensajeDeDescarga`). **Muéstralo también acá:** un error de descarga sin mensaje visible deja al usuario sin saber qué pasó, que es el mismo defecto que ya se corrigió una vez en `/cuenta`.

- [ ] **Step 3: Desmontar el checkout**

Quita el `{checkoutReport && <CheckoutModal ... />}` del final del archivo, el estado `checkoutReport`, y el import de `CheckoutModal`. **El archivo `CheckoutModal.jsx` no se borra** — queda dormido.

- [ ] **Step 4: Arreglar la grilla huérfana**

Con 5 reportes en `repeat(auto-fit,minmax(260px,1fr))` a ancho completo, el quinto queda solo con tres huecos al lado. Sube el `minmax` de modo que la fila se llene con 3 columnas en escritorio en vez de 4, o limita el ancho del contenedor. Verifícalo con el número real de reportes publicados, no en abstracto.

- [ ] **Step 5: Verificar**

Run: `npm test; npm run lint; npm run build`

Levanta `npm run dev` y comprueba en el navegador, **con sesión y sin sesión**: no aparece ningún precio, ninguna insignia premium, ninguna mención de comprar, y ninguna fila queda con huecos.

- [ ] **Step 6: Commit**

```bash
npm run format
git add web/app/src/pages/Reportes.jsx
git commit -m "feat: one catalogue, no prices, download instead of buy"
```

---

### Task 5: Simplificar `/cuenta`

**Files:**
- Modify: `web/app/src/pages/Cuenta.jsx`

**Interfaces:**
- Consumes: `useAuth`, `useReports`, `getReportDownloadUrl`.
- Produces: `/cuenta` con datos del usuario, sus descargas y cerrar sesión.

- [ ] **Step 1: Quitar las secciones de venta**

El archivo tiene tres secciones (`fontSize: 22`): **Suscripción** (línea ~108), **Pedidos** (~246) y **Reportes comprados** (~304).

- **Suscripción** se elimina entera, con su bloque de renovación, el botón "Ver planes" (~210) y el `CheckoutModal` de renovación al final.
- **Pedidos** se elimina entera, junto con el banner de `ordersError`.
- **Reportes comprados** se queda pero cambia de nombre: ya no se compra nada. Pasa a listar **todos los reportes publicados** con su botón de descarga, porque la cuenta ahora da acceso a todos.

- [ ] **Step 2: Limpiar lo que queda sin uso**

Tras el paso anterior sobran: `usePlans`, `isSubscriptionActive`, `CheckoutModal`, `cancelSubscription`, `DEMO_MODE` (si ya no se usa), `formatPEN` (si ya no se usa), y los cálculos `plan`, `subActiva`, `vence`, `venceTexto`, `renovando`. El lint marcará los imports; los cálculos hay que buscarlos.

**`user.purchases` deja de filtrar la lista.** Antes decidía qué reportes mostrar; ahora se muestran todos los publicados.

- [ ] **Step 3: Verificar**

Run: `npm test; npm run lint; npm run build`

En el navegador, con sesión: `/cuenta` muestra tu correo, la lista de reportes publicados con botón de descarga, y cerrar sesión. **Descarga uno de verdad** — es lo que prueba que la Task 1 funcionó de punta a punta.

- [ ] **Step 4: Commit**

```bash
npm run format
git add web/app/src/pages/Cuenta.jsx
git commit -m "feat: account page lists every published report, no orders or subscription"
```

---

### Task 6: Barrer el copy de venta

**Files:**
- Modify: `web/app/src/data/content.js`, `web/app/src/pages/Inicio.jsx`, `web/app/src/pages/Login.jsx`, `web/app/src/pages/Registro.jsx`, `web/app/src/pages/Reportes.jsx`, y cualquier otro que aparezca en la búsqueda.

**Interfaces:**
- Consumes: nada.
- Produces: ninguna mención en la interfaz a comprar, precio, suscripción o depósito.

- [ ] **Step 1: Encontrar todo**

```bash
grep -rniE "comprar|compra|precio|suscri|dep[oó]sito|S/ |premium|plan mensual|plan anual" web/app/src/ --include=*.jsx --include=*.js | grep -v "\.test\." | grep -v "CheckoutModal.jsx" | grep -v "orders.js" | grep -v "bankDetails.js"
```

`CheckoutModal.jsx`, `orders.js` y `bankDetails.js` se excluyen a propósito: son el código dormido y su copy no se muestra.

- [ ] **Step 2: Reescribir cada aparición**

El banner de `Login.jsx` y `Registro.jsx` dice hoy *"Los pagos son por depósito bancario o Yape…"*. Ya no hay pagos. Reemplázalo por algo que diga lo que la cuenta sí hace: dar acceso a los reportes. Mantén el condicional de `DEMO_MODE` si sigue teniendo sentido, o quítalo si no.

En `content.js`, revisa `PLAN_COPY`, `periodLabel` y `waVoucherMessage`: los tres existen solo para la venta. **`waVoucherMessage` la usa `CheckoutModal`** (dormido), así que se queda. `PLAN_COPY` y `periodLabel` las usaba `usePlans`/`Planes.jsx` — si nada más las importa, se van.

En `Inicio.jsx` y `Reportes.jsx`, cualquier frase que ofrezca comprar o suscribirse.

- [ ] **Step 3: Verificar**

Repite el `grep` del Step 1: no debe quedar ninguna coincidencia fuera de los tres archivos excluidos.

Run: `npm test; npm run lint; npm run build`

- [ ] **Step 4: Commit**

```bash
npm run format
git add -A web/app/src
git commit -m "docs: purge selling copy from the interface"
```

---

### Task 7: Ajustes visuales

**Files:**
- Modify: `web/app/src/pages/Inicio.jsx` (frisos y contraste del Método Acequia)

**Interfaces:**
- Consumes: `Frieze`.
- Produces: ninguna interfaz nueva.

- [ ] **Step 1: Reducir la repetición del friso**

`Inicio.jsx` monta **4** `<Frieze>`, y la marquesina añade una quinta banda oscura del mismo peso visual. En una sola pantalla de scroll eso deja de puntuar y se vuelve papel tapiz.

Baja Inicio a **2** frisos, colocados en los cortes que de verdad separan bloques de sentido. Las demás páginas ya tienen 2 y se quedan como están.

- [ ] **Step 2: Arreglar el contraste del Método Acequia**

Los números `01`-`05` de esa sección son marrón oscuro sobre fondo marrón oscuro — prácticamente ilegibles. Súbelos a un tono de la paleta que se lea sobre `var(--ink)`: `var(--gold)` o `var(--tan-text)`.

**Regla del proyecto:** Ocre sobre Arena es 3.1:1, válido solo para texto ≥18px. Estos números son grandes, pero van sobre tinta, no sobre arena — verifica el par que elijas antes de darlo por bueno.

- [ ] **Step 3: Verificar**

Levanta `npm run dev` y compara Inicio antes y después. Los números deben leerse sin esfuerzo, y las bandas oscuras deben sentirse como separadores, no como patrón.

Run: `npm run lint; npm run build`

- [ ] **Step 4: Commit**

```bash
npm run format
git add web/app/src/pages/Inicio.jsx
git commit -m "fix: fewer friezes on the home page, legible Acequia numerals"
```

---

### Task 8: Respaldo sin JavaScript

**Files:**
- Modify: `web/app/src/styles/index.css` (regla `[data-reveal]`, ~línea 50)
- Modify: `web/app/index.html`

**Interfaces:**
- Consumes: nada.
- Produces: contenido visible cuando el JS no corre.

- [ ] **Step 1: Entender el problema antes de tocarlo**

`[data-reveal] { opacity: 0 }` y `useReveal` agrega `.is-visible` al entrar en viewport. Si el JS no corre —bloqueado, error de red, un bug— **la página queda en blanco**: el contenido está en el DOM pero invisible para siempre.

`prefers-reduced-motion` ya fuerza `opacity: 1`, así que en una máquina con esa preferencia el fallo no se ve. No confíes en tu propia máquina para comprobarlo.

- [ ] **Step 2: Agregar el respaldo**

En `index.html`, dentro de `<head>`:

```html
    <noscript>
      <style>
        /* Sin JavaScript, useReveal nunca agrega .is-visible y el contenido
           quedaría invisible para siempre. Esto lo revela todo de una. */
        [data-reveal] {
          opacity: 1 !important;
          transform: none !important;
        }
      </style>
    </noscript>
```

- [ ] **Step 3: Verificar de verdad**

Un `<noscript>` no se puede comprobar leyendo el código. En el navegador, con `npm run dev` corriendo:

DevTools → Command Palette (Ctrl+Shift+P) → **Disable JavaScript** → recarga `/`.

Expected: se ve todo el contenido de la página. Vuelve a habilitarlo después.

- [ ] **Step 4: Commit**

```bash
npm run format
git add web/app/index.html
git commit -m "fix: reveal all content when JavaScript does not run"
```

---

### Task 9: Reconciliar `CLAUDE.md`

**Files:**
- Modify: `web/app/CLAUDE.md`

**Interfaces:**
- Consumes: todo lo anterior.
- Produces: nada de código.

- [ ] **Step 1: Declarar el cambio de modelo**

`CLAUDE.md` describe hoy un sitio que cobra por depósito bancario con aprobación manual. **Eso dejó de ser cierto con este plan.** Agrega una entrada de fase nueva que registre: los reportes son gratuitos a cambio de una cuenta, el ingreso viene de cotizaciones, y la confirmación por correo está desactivada.

Cita el spec: `docs/superpowers/specs/2026-08-06-rediseno-portafolio-consultoria-design.md`.

- [ ] **Step 2: Declarar que los pagos están dormidos**

Es lo más importante de esta tarea. Las migraciones `0003`-`0012`, `approve_order()`, `orders.js` y `CheckoutModal.jsx` **siguen existiendo y funcionando**, pero ninguna interfaz los usa.

Sin esta declaración explícita, el próximo lector —persona o agente— va a encontrar un sistema de pagos completo y endurecido y asumir que el sitio cobra.

Deja escrito también que si algún día se reactivan, **hay que re-verificarlos antes de confiar en ellos**: llevarán meses sin ejercitarse.

- [ ] **Step 3: Corregir lo que quedó obsoleto**

- La tabla de rutas menciona `/planes`, que ya no existe.
- La sección de `content.js` menciona `PLAN_COPY` y demás, si se eliminaron en la Task 6.
- `has_access()` ahora se redefine en `0013`, no en `0009`.
- La cola de trabajo: el ítem de `bankDetails.js` deja de bloquear nada, porque no hay primer pedido real que bloquear.

- [ ] **Step 4: Anotar la trampa de CloudFront**

El despliegue va a AWS S3 + CloudFront. El Plan B agrega `/reportes/:slug`, y **un enlace profundo devuelve 403 desde S3** hasta que la distribución responda `index.html` en 403/404.

Déjalo escrito ahora, donde se vea, aunque la ruta todavía no exista: muerde el día del despliegue, no antes.

- [ ] **Step 5: Verificar**

Lee el documento entero de corrido. ¿Se contradice en algún punto? ¿Alguien que llegue sin contexto entendería que el sitio no cobra?

Run: `npm run format:check`

- [ ] **Step 6: Commit**

```bash
npm run format
git add web/app/CLAUDE.md
git commit -m "docs: record the free-with-account model and the dormant payment layer"
```

---

## Notas de verificación final

Antes de dar el plan por terminado, corre y **lee la salida** de:

```
npm test
npm run lint
npm run build
node scripts/verify-supabase.mjs
```

Y comprueba a mano, en el navegador:

1. **No queda ningún precio, ni "comprar", ni "suscripción" en toda la interfaz.**
2. Crear una cuenta lleva directo a `/cuenta`, **sin pasar por el correo**.
3. Un usuario recién creado **descarga un reporte que antes era premium** — es la prueba de punta a punta de la Task 1.
4. Sin sesión, `/reportes` muestra el catálogo e invita a crear cuenta, no a comprar.
5. La página se ve entera con JavaScript deshabilitado.
6. Ninguna fila del catálogo queda con huecos al costado.

**Lo que este plan deliberadamente NO hace:**

- Páginas por reporte, portadas generadas, imágenes sociales, los Sankey, el catálogo real y la cotización — todo eso es el Plan B.
- **La imagen social (`og:image`)**, aunque es de la Fase 4 del spec: depende del generador de portadas que construye el Plan B. Adelantarla significaría escribir dos veces la misma pieza.
- **La analítica**, también de la Fase 4: no se puede instalar en un sitio que todavía no está desplegado. Va cuando el dominio y CloudFront estén arriba, y la herramienta debe funcionar sobre hosting estático — no atada a la plataforma.

**Pendiente del dueño, no del código:** rotar la `service_role` key de Supabase, y comprar y configurar el dominio.
