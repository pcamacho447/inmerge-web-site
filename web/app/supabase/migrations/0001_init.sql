-- Inmerge SaaS — initial schema (Phase 1: reports, subscriptions, one-off
-- purchases, and entitlement checking).
--
-- SECURITY MODEL: `reports` metadata is publicly readable (so the catalog and
-- pricing show to logged-out visitors). `subscriptions` and `purchases` are
-- readable only by their owner. None of the three has a client-facing INSERT
-- or UPDATE policy — those tables represent money/entitlements and are only
-- ever written by Edge Functions using the Supabase SERVICE ROLE key, which
-- bypasses RLS. Never grant client-writable access to them.
--
-- EXCEPTION (added in 0003): `orders` is client-insertable on purpose. It is an
-- INTENT table — a row there grants nothing. Entitlements are still created
-- only by approve_order(), which is service-role-only. See 0003's header.
--
-- PRODUCT DECISION baked into has_access() below: subscription access is
-- "while active" (Netflix-style) — canceling loses access to premium
-- reports, you don't keep a permanent library of what was published during
-- your subscription. Flip this later by joining on subscription period
-- history instead of current status, if that's not what you want.

create extension if not exists "pgcrypto";

-- Billing entity for manual invoicing. Peru distinguishes boleta (persona
-- natural, no tax id required) from factura (empresa, RUC required) — the
-- checkout/account form should ask billing_type first and conditionally
-- require tax_id.
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  billing_type text not null check (billing_type in ('persona_natural', 'empresa')),
  legal_name text not null,
  tax_id text,
  billing_email text not null,
  billing_address text,
  created_at timestamptz not null default now()
);

-- Extends auth.users with the app-specific profile fields.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  organization_id uuid references public.organizations (id),
  full_name text,
  phone text,
  created_at timestamptz not null default now()
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  tag text,
  title text not null,
  summary text,
  tier text not null default 'free' check (tier in ('free', 'premium')),
  price_pen numeric(10, 2), -- null for free reports / subscription-only premium reports
  cover_image_path text,
  file_path text, -- path inside the private `report-files` Storage bucket
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  plan text not null check (plan in ('monthly', 'annual')),
  status text not null check (status in ('active', 'past_due', 'canceled', 'incomplete')),
  culqi_subscription_id text unique,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  report_id uuid not null references public.reports (id),
  amount_pen numeric(10, 2) not null,
  culqi_charge_id text unique,
  status text not null check (status in ('paid', 'refunded', 'failed')),
  created_at timestamptz not null default now()
);

create index on public.subscriptions (user_id);
create index on public.purchases (user_id);
create index on public.purchases (report_id);

-- True if p_user_id can access p_report_id's file: free reports are always
-- accessible; premium reports need either a direct paid purchase of that
-- report, or any currently-active subscription.
create or replace function public.has_access(p_user_id uuid, p_report_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select
    exists (select 1 from public.reports r where r.id = p_report_id and r.tier = 'free')
    or exists (
      select 1 from public.purchases pu
      where pu.user_id = p_user_id and pu.report_id = p_report_id and pu.status = 'paid'
    )
    or exists (
      select 1 from public.subscriptions s
      where s.user_id = p_user_id and s.status = 'active'
    );
$$;

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.reports enable row level security;
alter table public.subscriptions enable row level security;
alter table public.purchases enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);

create policy "organizations_select_own" on public.organizations for select
  using (id in (select organization_id from public.profiles where id = auth.uid()));
create policy "organizations_update_own" on public.organizations for update
  using (id in (select organization_id from public.profiles where id = auth.uid()));
create policy "organizations_insert_authenticated" on public.organizations for insert
  with check (auth.role() = 'authenticated');

create policy "reports_select_all" on public.reports for select using (true);

create policy "subscriptions_select_own" on public.subscriptions for select using (auth.uid() = user_id);

create policy "purchases_select_own" on public.purchases for select using (auth.uid() = user_id);

-- Seed the 5 existing free reports so the catalog isn't empty on first
-- deploy. published_at left null — set it when each is actually published;
-- update file_path once the PDFs are uploaded to the report-files bucket.
insert into public.reports (slug, tag, title, summary, tier) values
  ('ejecucion-presupuestal-regional-2025', 'PRESUPUESTO REGIONAL', 'Ejecución presupuestal regional 2025: quién gastó y quién se quedó corto', 'Un recorrido por las cifras de ejecución de los 24 gobiernos regionales, con la fuente de cada dato a la vista.', 'free'),
  ('gasto-publico-la-libertad', 'LA LIBERTAD', 'El gasto público en La Libertad, cifra por cifra', 'De dónde viene el presupuesto regional y a dónde fue realmente en el último año fiscal.', 'free'),
  ('gobiernos-provinciales-distritales', 'GOBIERNOS LOCALES', 'Gobiernos provinciales y distritales: ¿quién ejecuta mejor?', 'Comparativo de ejecución presupuestal entre municipalidades provinciales y distritales del país.', 'free'),
  ('gasto-ministerio-defensa', 'DEFENSA', 'Defensa bajo la lupa: el gasto del Ministerio de Defensa', 'Un análisis narrativo del presupuesto y la ejecución del sector defensa, con fuente oficial citada línea por línea.', 'free'),
  ('proyectos-inversion-publica-estancados', 'INVERSIÓN PÚBLICA', 'Proyectos de inversión pública: ¿dónde se estancan?', 'Radiografía de los proyectos de inversión con mayor retraso y su impacto real en la ejecución del gasto.', 'free');
