# Inmerge — Web App

React + Vite rebuild of the Inmerge marketing site (data consultancy, Lima, Perú), plus a front-end preview of a SaaS layer on top of it (subscriptions + one-off report purchases). This file is the source of truth for where things stand — read it before assuming anything about scope, decisions, or what's real vs. mocked.

## Origin — why this exists

The original design was a Claude-Design export (`.dc.html` files with proprietary `<x-dc>`/`<sc-if>`/`<sc-for>` tags and a `support.js` runtime that wasn't included) at `../front/` — those files cannot run as-is. This `app/` directory is a full rebuild in plain React 18 + Vite + react-router-dom, visually matching the original but with real HTML semantics, real CSS, and no proprietary runtime dependency. `../back/` is empty and unused (front-end-only site until the SaaS backend below gets connected).

## Stack & commands

React 18, Vite 5, react-router-dom 6, plain CSS + inline `style={{}}` objects (see "Styling convention" below) — no CSS-in-JS library, no Tailwind. `@supabase/supabase-js` is installed but **not wired to a real backend yet** (see "SaaS backend" section).

Run from this directory (`app/`), Windows/PowerShell — chain with `;`, not `&&`:

- `npm run dev` — dev server, default `http://localhost:5173/`
- `npm run build` — production build (also the fastest correctness check — catches JSX/import errors without a browser)
- `npm run lint` — ESLint (flat config, `eslint.config.js`)
- `npm run format` / `npm run format:check` — Prettier (140-char print width, chosen deliberately so the dense inline-style pattern below doesn't get exploded across dozens of lines)

## Brand system — non-negotiable source of truth

**Palette** (CSS custom properties in `src/styles/index.css`):

| Role                        | Hex       | Var            |
| --------------------------- | --------- | -------------- |
| Background ("Arena")        | `#F3EADA` | `--bg`         |
| Text/dark surface ("Tinta") | `#241A12` | `--ink`        |
| Primary ("Ocre")            | `#C68A3D` | `--ochre`      |
| Accent/brand ("Terracota")  | `#A8472B` | `--terracotta` |
| Highlight ("Oro")           | `#D8A84E` | `--gold`       |
| Muted text                  | `#7A6B58` | `--muted`      |
| Muted text on dark          | `#C9B79C` | `--tan-text`   |
| Borders                     | `#DDCBAE` | `--border`     |
| Alt section bg              | `#EBDFC9` | `--cream2`     |

**Contrast rule** (already audited once, zero violations found — Ocre is only ever used on decorative shapes, never text): Ocre/Arena is 3.1:1, valid only for labels/UI ≥18px, never body copy. Terracota/Arena is 4.6:1 (body-text safe). Re-check this if you add new Ocre text usage.

**Typography:** Spectral (serif — headlines, logotype; 500/600/700/800) + IBM Plex Sans (body/UI; 400/500/600) + IBM Plex Mono (tabular figures; 500), loaded via Google Fonts in `index.html`.

**Logo:** no raster asset — reproduced live as a stepped pyramid of rotated-45° diamond `<div>`s (1 gold / 3 ochre / 5 terracotta) in `Nav.jsx`/`MobileMenu.jsx` (abbreviated to a single terracotta diamond there), and as standalone portable SVGs at `public/favicon.svg` (single diamond, used as the browser favicon) and `public/logo-mark.svg` / `public/logo-lockup.svg` (full pyramid, ± wordmark). **Caveat on `logo-lockup.svg`:** its wordmark is live SVG `<text>` in Spectral with a serif fallback — only renders correctly where the Spectral webfont is available. True portability (email signatures, print) needs the text converted to outlined paths in a design tool; this environment has no font-to-path tool. Use `logo-mark.svg` alone where font-independence matters.

## Styling convention

Inline `style={{}}` objects referencing CSS vars (`var(--terracotta)`), consistent across every component/page. Only cross-cutting concerns that inline styles structurally can't express live in `src/styles/index.css`: `@media` breakpoints, `@keyframes`, and — critically — **`:hover`/`:active` pseudo-classes**, via a small set of reusable utility classes applied alongside the inline style on interactive elements:

- `.btn-hover` — solid buttons (brightness lift + shadow on hover, scale-down press on `:active`)
- `.btn-outline-hover` — outline/ghost buttons (soft `--cream2` fill)
- `.card-hover` — cards (lift + shadow)
- `.row-hover` — list/accordion rows (background fill — this restores an effect the original `.dc.html` had via a proprietary `style-hover` prop that doesn't exist in plain CSS)
- `.link-hover` — text links (underline)
- `.icon-btn-hover` — icon-only buttons (soft circular fill)

These are deliberately built on properties the inline styles never set (`filter`/`transform`/`box-shadow`/`background-color`-as-fill/`text-decoration`) — a stylesheet `:hover` rule can never win against an inline style setting the _same_ property, so don't try to override `color`/`background` this way, it will silently no-op. All of them include `:active`, not just `:hover` — touch devices don't hover, so `:active` is what actually gives mobile users feedback.

When adding a new interactive element, apply the matching class. When converting a `<div onClick>` to a real `<button>`, remember to reset default button chrome inline (`border:'none', font:'inherit'` or explicit `fontFamily`/`fontSize`/`fontWeight` — **do not** use the `font` shorthand _after_ explicit `fontSize`/`fontWeight` in the same style object, it silently resets them back to browser defaults; this bug was made and caught once already).

## Routes / pages

`src/App.jsx` — all routes render inside `Layout` (preloader + nav + `<Outlet/>`), wrapped in `AuthProvider` (see SaaS section).

| Path                  | Page                        | Notes                                                                                                         |
| --------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `/`                   | `Inicio.jsx`                | Home                                                                                                          |
| `/servicios`          | `Servicios.jsx`             | Accordion defaults open on "01 Diagnóstico" (lowest-commitment entry point — a judgment call, easy to revert) |
| `/reportes`           | `Reportes.jsx`              | Free reports (unchanged email-gate → `mailto:`) + premium reports section (SaaS)                              |
| `/planes`             | `Planes.jsx`                | Pricing (SaaS)                                                                                                |
| `/nosotros`           | `Nosotros.jsx`              |                                                                                                               |
| `/contacto`           | `Contacto.jsx`              | WhatsApp CTA + formal TDR contact form (→ `mailto:`)                                                          |
| `/login`, `/registro` | `Login.jsx`, `Registro.jsx` | SaaS auth (mock)                                                                                              |
| `/cuenta`             | `Cuenta.jsx`                | SaaS account (mock), wrapped in `ProtectedRoute`                                                              |
| `*`                   | `NotFound.jsx`              | 404, `noIndex: true`                                                                                          |

Shared: `Layout`, `Nav`, `MobileMenu`, `Preloader`, `Frieze` (decorative diamond divider strip, `aria-hidden`), `Footer`, `ImagePlaceholder` (stand-in for real report cover photos — none exist yet), `ScrollToTop` (React Router v6 doesn't reset scroll on navigate by default), `ProtectedRoute`, `CheckoutModal`.

Content/copy lives in `src/data/content.js`, not inline in JSX — includes `WA_LINK`/`waLink(message)` (prefilled WhatsApp text per CTA context), `SITE_URL` (**assumed** `https://inmerge.pe`, based on the `contacto@inmerge.pe` address already in the copy — the site isn't deployed and this hasn't been confirmed; also hardcoded in `public/sitemap.xml`/`robots.txt`/`index.html` — update all four together if it's wrong), `REPORTS` (5 real free reports + 2 illustrative premium examples), `PLANS`, pricing constants.

`useDocumentHead({title, description, path, noIndex})` (hook) sets per-page title/meta/OG/canonical client-side — helps the browser tab and Googlebot (executes JS), does **not** help social-link-preview crawlers (WhatsApp/Facebook/Twitter don't run JS, always see the static tags in `index.html` regardless of which route was shared — true per-page social cards would need prerendering/SSG, which this app doesn't have).

## SaaS layer — status: auth + data + entitlements/downloads are REAL; pagos por depósito bancario con activación manual — REAL. Culqi descartado (2026-08-04): su área comercial no aprobó la cuenta.

Business model (confirmed with the user): free reports stay free (unchanged, existing lead-magnet flow). Premium reports are new content (not a relabeling) — either bought individually (S/180) or accessed via subscription (S/249/mes or S/2,390/año). Invoicing is **manual** — user emails a boleta/factura by hand after each payment, no SUNAT electronic-invoicing integration. This is why `Registro.jsx` asks persona-natural-vs-empresa + conditionally RUC — that data is for the manual invoice, not for any automated system.

**Current reality (through Phase B3):** signup/login/session, the report catalog, and entitlement checks + signed-URL downloads are all **real** (Supabase Auth + Postgres + Storage + a deployed Edge Function). The **only** simulated piece left is the _payment write_ — `subscribe()`/`purchaseReport()` in `src/lib/auth.jsx` still write subscription/purchase state to `localStorage` (keyed by the real user id) instead of a payment processor. `auth.jsx` is where the mock lives and where B4/Culqi plugs in: its `buildUser` already **unions** those mock writes with real `subscriptions`/`purchases` reads from the DB, and keeps the `useAuth()` shape stable so no page/component changes when the mock writes are replaced by real Culqi-driven ones. `hasAccess(user, report)` in that file mirrors `has_access()` in the SQL migration — keep them in sync if the entitlement rule changes. (Note: `hasAccess` is the front-end UI gate; the real download gate is `has_access()` re-checked server-side in the Edge Function, so a mock-only purchase unlocks the UI but a real download still 403s without a real DB row.)

Every still-simulated screen has a visible "Vista previa de producto" / "simulación" banner — intentional and load-bearing (matches a running principle in this project: never let a preview silently look like it did something real). These now scope specifically to the **payment** step; don't remove them until B4 wires real Culqi payments.

### `supabase/` — backend scaffold (partially deployed as of B3)

- `migrations/0001_init.sql` — ✅ applied. Schema (`organizations`, `profiles`, `reports`, `subscriptions`, `purchases`), RLS policies, `has_access()` function. Money/entitlement tables have **no client-writable RLS policy** — only Edge Functions using the service-role key may write them. Pre-seeded with the 5 real free reports.
- `migrations/0002_seed_premium_examples.sql` — ✅ applied and verified (7 rows total: 5 free + 2 premium). The 2 illustrative premium reports (previously duplicated in `content.js`, eliminated in Phase B2).
- `functions/get-report-download-url` — ✅ **DEPLOYED and verified end-to-end in B3** (see B3 below). No Culqi dependency — just `has_access()` + Storage signed URLs. Deployed with `--no-verify-jwt` (mandatory here — see the JWT Signing Keys gotcha in B3).
- `functions/culqi-create-charge`, `culqi-create-subscription` — **not deployed.** Request shapes grounded in real Culqi SDK field names (verified via search, not a full docs fetch — re-check before relying on them for real money). B4 work.
- `functions/culqi-webhook` — **not deployed, and explicitly flagged incomplete in its own file header**: the event-envelope field names are an unverified guess, and it has **no signature verification**, meaning anyone who finds the URL could currently POST a fake "payment succeeded" event. Hard blocker before this goes live, not a nice-to-have (B4).
- `.env.example` documents every env var needed on both sides (browser `VITE_*` vars vs. server-side Edge Function secrets).

### Backend connection plan — Culqi deliberately saved for last

Rationale: auth, data, and entitlements/downloads can all be built and tested end-to-end using manually-seeded test data in Supabase, with zero Culqi dependency. Only the actual payment step needs it — so everything that de-risks the system comes first, and the one piece that touches real money comes last.

- **Phase B0 — Supabase project setup — ✅ DONE (rebuilt 2026-08-04).** **The original project was deleted on 2026-08-03 along with its whole org.** The live project is now **`zboxdsiejvmjupdawgax`** (us-west-2, org `gzxoeosqngheptftclvs`) — _not_ the old São Paulo one, and not the ref in any older note. Rebuilt from the repo via the Supabase CLI: `0001` + `0002` applied (`db push --include-all`), private `report-files` bucket recreated, `get-report-download-url` redeployed with `--no-verify-jwt`. All verified. **Server-side test data was NOT restored** — see the B3 warning below.
  - **How to drive this project when the MCP 401s:** use the CLI, not the MCP. `supabase login` must run in a **real terminal** (non-TTY fails) and stores its token on disk, so it needs no Claude Code restart and no env var. `link` and `db push` need **no database password** (`contraseña supabase.txt` was never required). `db query` defaults to local Docker — always pass **`--linked`**. There is no CLI/MCP command to create a Storage bucket; do it in SQL against `storage.buckets`. `.env.local` holds `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` (gitignored — not in this file, ask the user if a fresh session needs them, or check `.env.local` directly). Verified working via `node scripts/verify-supabase.mjs` — confirms the `reports` table is reachable, and RLS correctly returns nothing from `subscriptions` to an unauthenticated client. Re-run that script anytime to sanity-check the connection (it now also reports free vs. premium row counts).
- **Phase B1 — Real authentication — ✅ DONE.** `src/lib/mockAuth.jsx` deleted, replaced by `src/lib/auth.jsx` — real Supabase Auth (`signUp`/`signInWithPassword`/`signOut`, session persisted + restored via `onAuthStateChange`/`getSession`). `Registro.jsx`/`Login.jsx` now take real passwords, show real errors, and handle the "check your email" case. **Subscription/purchase state is still simulated** (localStorage, keyed by the real user id) — deliberately deferred to B3/B4, see `auth.jsx`'s file header. `ProtectedRoute` gained a `loading` guard so refreshing `/cuenta` while genuinely logged in doesn't briefly bounce to `/login`.
  - Verified live via `node scripts/verify-auth-signup.mjs` (creates a disposable test user — safe to delete from Dashboard > Authentication > Users): confirmed **email confirmation is ON** for this project, so the real signup flow always goes through the "check your email" path, not instant login — this was exercised for real, not assumed.
  - **Important finding from that same test:** `@inmerge.pe` addresses are rejected by Supabase ("invalid" domain) — `Resolve-DnsName` confirms `inmerge.pe` currently has **no MX, A, or NS records at all**, i.e. it doesn't resolve as a domain yet. This means every `mailto:contacto@inmerge.pe` link across the site (Contacto, Reportes gate, NotFound) is currently undeliverable, not just an SEO/canonical-URL assumption as previously flagged — confirm the real domain before launch, or register/configure `inmerge.pe` for mail.
- **Phase B2 — Real data — ✅ DONE (report catalog only — scope narrowed from the original plan).** `Reportes.jsx` and `Cuenta.jsx` now fetch the report catalog live from Supabase via the new `src/hooks/useReports.js` hook. The `REPORTS` array in `content.js` is **deleted** — Supabase is now the only source, no more duplication to drift. Field name changes to be aware of: DB uses `price_pen` (not `price`), and there's no `imgPlaceholder` column — `ImagePlaceholder` labels are now derived from `title` at render time. `CheckoutModal` handles both `PLANS` entries (`.price`, from `content.js`, unchanged) and live report rows (`.price_pen`) via its `kind` prop.
  - **Deliberately did NOT wire real subscription/purchase reads in this phase**, despite that being the original B2 plan — realized mid-implementation that it would desync from `CheckoutModal`'s still-local mock writes (money tables aren't client-writable until B3/B4), breaking the working purchase→account demo flow. Real subscription/purchase reads now belong in B3, paired with the real entitlement testing where they're coherent.
  - `migrations/0002_seed_premium_examples.sql` — ✅ applied and verified (`node scripts/verify-supabase.mjs` confirms 7 rows: 5 free + 2 premium).
- **Phase B3 — Entitlements & downloads (still no Culqi needed) — ✅ DONE (verified end-to-end, backend + browser).**
  - **Code done:** real entitlement READS wired in `src/lib/auth.jsx` (`fetchRealEntitlements` — reads own `subscriptions`/`purchases` via RLS `*_select_own`), **unioned** with the still-mock localStorage state in `buildUser` (a real active sub wins; purchase ids are the union of mock ∪ DB). This keeps the CheckoutModal preview demo working AND lets a manually-inserted DB entitlement drive a real download. Writes stay mock until B4 — don't write those tables from the client. New `src/lib/downloadReport.js` (`getReportDownloadUrl`) calls the `get-report-download-url` Edge Function via `supabase.functions.invoke` (auto-attaches session token) and surfaces the function's `{ error }` **or** the gateway's `{ message }` body plus the HTTP status. `Cuenta.jsx`'s "Descargar" button is now live (loading/error states) instead of disabled. Build + lint clean.
  - **Deployed & verified:** `get-report-download-url` is live. `node scripts/test-download-url.mjs pcamacho447@gmail.com <pwd> seguimiento-trimestral-educacion` returns **200 with a real signed URL** — auth → `has_access()` (paywall) → signed 5-min URL all confirmed against real test data (a `purchases` row for the test user + `file_path` set on that report + a PDF in the `report-files` bucket).
  - **⚠️ Non-obvious gotcha (cost hours — read before touching Edge Functions): this project has Supabase JWT Signing Keys (the new asymmetric key system) enabled.** With the gateway's default "Verify JWT" ON, EVERY call — even with a fresh valid user token — was rejected by the platform gateway with `401 {code:'INVALID_CREDENTIALS'}` **before our function code ran** (the gateway verifies with the legacy HS256 secret, which no longer matches tokens signed by the new keys). Auth sign-in and PostgREST reads still worked with the same anon key — only the Edge gateway broke, which is what made it confusing. **Fix: the function is deployed with `--no-verify-jwt`** (JWT verification is done in-code instead: the function requires an `Authorization` header, validates it via `supabase.auth.getUser()`, and checks `has_access()` — so disabling the gateway check is safe, not a security hole). If you ever redeploy this (or any user-facing) function, **keep `--no-verify-jwt`** or the 401 returns. There is no per-function "Verify JWT" toggle in this project's dashboard — set it at deploy time via CLI: `npx supabase@latest functions deploy <name> --project-ref zboxdsiejvmjupdawgax --no-verify-jwt` (Docker not required — deploy bundles via API; the "Docker is not running" warning is harmless).
  - **Verifying the flag actually applied:** both the broken and working states return HTTP 401, so the status code proves nothing — read the **body**. `{"code":"INVALID_CREDENTIALS"}` = the gateway rejected it, flag did NOT apply. `{"error":"Missing Authorization header"}` = our own function code ran, gateway bypassed, correct. Cross-check with `npx supabase@latest functions list` → `"verify_jwt": false`.
  - **Premium slugs** (for `test-download-url.mjs`): `seguimiento-trimestral-educacion`, `radiografia-contratistas-infraestructura`.
  - **Browser path confirmed:** the `/cuenta` "Descargar" button (front-end `functions.invoke` → `window.open` of the signed URL) opens the real PDF for an entitled test user — so the full chain works end-to-end, not just the script.
  - **Entitlement paths — which of `has_access()`'s three branches are actually exercised:** free (always) — implicit; **purchase branch — ✅ fully verified** (200, above); **subscription branch — 🚧 baseline only.** Confirmed `radiografia-contratistas-infraestructura` returns **403** for the test user (no purchase, no sub) — the correct "blocked" baseline. Completing it needs a manual `subscriptions` row (`user_id`, `plan='monthly'`, `status='active'`) inserted in the dashboard, then re-running `test-download-url.mjs` against that slug: expect **404** (sub grants entitlement ✅, but that report has no `file_path`) or **200** if you also set its `file_path`. Not yet done — pending the manual insert.
  - **⚠️ Test data is GONE (project deleted 2026-08-03, rebuilt 2026-08-04).** The schema, bucket and function were restored (see "Rebuild" below), but **none** of the test data was (rebuild details in B0 above): no test user, no `purchases` row, no PDF in the bucket, and no `file_path` on any report. The B3 end-to-end verification above therefore describes a state that **no longer exists** — it is a record of what was proven once, not of what is currently true. To re-verify the download chain you must first recreate: a test user, a `purchases` row for it, an uploaded PDF, and that report's `file_path`. Historical values, for reference only: test user was `pcamacho447@gmail.com` (id `0e49bcc5-5508-4bb8-bc95-3767b0e06184`), purchase was for `seguimiento-trimestral-educacion`, `file_path` was `noticia_trujillo_gasto_seguridad_delito_3graficos.pdf`.
- **Phase B4' — Pago por depósito — ✅ DONE (reemplaza Culqi).** Culqi se descartó (2026-08-04, su área comercial no aprobó la cuenta); ver el spec `docs/superpowers/specs/2026-08-04-pago-deposito-bancario-design.md` y el plan `docs/superpowers/plans/2026-08-04-pago-deposito-bancario.md`. El pago ahora es por depósito bancario o Yape/Plin con verificación humana: el cliente crea un pedido (`orders`, `src/lib/orders.js`), ve el código + datos bancarios en `CheckoutModal`, y manda la constancia por WhatsApp. Migraciones `0003_plans_and_orders.sql` (tablas `plans`/`orders`, trigger que recalcula `amount_pen` en el servidor) y `0004_approve_orders.sql` (`approve_order()`/`reject_order()`, ambas `service_role`-only). Aprobar un pedido: `select approve_order('INM-2026-0042');` desde el SQL Editor — convierte el pedido en una fila de `purchases` o extiende/crea la fila de `subscriptions`. **`has_access()` ahora exige `current_period_end > now()`** para la rama de suscripción — las suscripciones son periodos prepagados con vencimiento real, no un estado "activo" permanente; `hasAccess`/`isSubscriptionActive` en `src/lib/auth.jsx` espejan esto del lado del cliente. `DEMO_MODE` (`src/lib/demoMode.js`, env `VITE_DEMO_MODE`) revive el checkout simulado en localStorage cuando se necesita mostrar el flujo sin depósito real; apagado (default) es producción. Verificado end-to-end con `scripts/verify-deposit-flow.mjs` (anon key: confirma que el cliente no puede aprobarse pedidos, escribir `purchases`/`subscriptions`, ni invocar `approve_order`/`has_access`) y `scripts/test-download-url.mjs` (rama de compra: 200 con URL firmada; rama de suscripción: 404 porque ese reporte no tiene `file_path`, no 403; vencimiento: `has_access()` da `false` con `current_period_end` en el pasado).
- **Phase B5 — Cutover — not started.** Remove the "Vista previa de producto" / "simulación" banners, drop the localStorage mock entitlement layer from `auth.jsx` (leaving DB-only reads), deploy the front end (Vercel/Netlify are the natural fit — also resolves the assumed domain).

### Working queue — backend items that don't need a domain (B4' is done; B5/cutover is paused until a real domain exists)

- [x] **Finish the subscription-branch test** (see B3 above) — done in B4'/Task 10: manual `subscriptions` insert via `approve_order()`, `test-download-url.mjs` against `radiografia-contratistas-infraestructura` returned 404 (entitled, file missing), and the expiry check (`current_period_end` in the past → `has_access()` false) also verified.
- [x] **Completar `bankDetails.js`** — hecho 2026-08-04. Interbank Cuenta Simple Soles `611-3082499683`, CCI `00361101308249968314` (validado: el número de cuenta va embebido en el CCI), Yape `957251279` (el mismo número del WhatsApp del sitio), titular Paul Alonso Camacho Abadie. RUC `20608620690` (checksum módulo-11 validado) de **Servicios Inmerge SAC**, expuesto como `BILLING_ENTITY` aparte de `BANK_ACCOUNT` porque no son la misma entidad — ver el ítem abierto de abajo.
- [ ] **Decidir si se cobra a una cuenta personal facturando como SAC.** Hoy el titular de la cuenta es una persona natural (Paul Alonso Camacho Abadie) y el comprobante lo emite Servicios Inmerge SAC (RUC 20608620690). El modal lo muestra separado y honesto ("Facturamos como…"), así que el cliente no se confunde, pero un cliente empresa que necesita sustentar el gasto va a tener el pago y la factura a nombre de entidades distintas. **Consultar con el contador**; si corresponde, abrir cuenta a nombre de la SAC y actualizar `BANK_ACCOUNT.holder` + `number` + `cci` juntos.
- [ ] **Upload the real premium PDFs** to the `report-files` bucket and set each report's `file_path` (only 1 test PDF/placeholder exists today).
- [ ] **Replace the 2 illustrative premium reports** (`seguimiento-trimestral-educacion`, `radiografia-contratistas-infraestructura` in `0002_seed_premium_examples.sql`) with real editorial content once it exists.
- [ ] **Define the manual-invoicing process** (boleta/factura by hand after each payment) — a written runbook, not code.
- Hygiene (not code, but open): revoke the Supabase Personal Access Token (`sbp_…`) used for the B3 CLI deploy; commit the B3 changes (**git CLI now works** — v2.55.0 with worktree support, verified 2026-08-04; the earlier "git is not installed on this machine" note is obsolete); rotate the test account password (it was shared in a chat).

## Known open items (asset/decision-blocked, not code work)

- Real production domain (currently assumed `inmerge.pe`)
- `og:image` (1200×630) — deliberately omitted rather than referencing a broken image; a missing tag is safer than a broken one for social previews
- Real report cover photography (currently `ImagePlaceholder` stand-ins, `role="img" aria-label` for accessibility)
- Backend connection (see above)

## Tooling / agents

Two project-scoped subagents exist at `C:\papx\.claude\agents\` (`frontend-engineer.md`, `ux-reviewer.md`) — written for a session that couldn't hot-load them mid-conversation; a **new** Claude Code session starting fresh in this repo should be able to use them via the Agent tool. `frontend-engineer` has this same brand/convention briefing baked in; `ux-reviewer` is read-only and audits without editing.
