-- Litug — Back-office Admin (Phase Admin)
-- Fondations : système de rôles + abonnements unifiés + journal d'audit.
--
-- ⚠️ PRÊTE MAIS NON BRANCHÉE : le dashboard admin tourne aujourd'hui en mock-first
--    (lib/admin/*). On applique cette migration le jour où l'on bascule
--    NEXT_PUBLIC_DATA_SOURCE='supabase' pour l'espace admin, comme pour Sara/Mustaf.
--
-- Décisions (validées avec le fondateur) :
--   1. RÔLES : table `user_roles` + fonction has_role() + custom claim JWT.
--   2. ABONNEMENTS : table UNIFIÉE `subscriptions` (vendeurs + clients Mustaf),
--      cycle de vie pending|active|suspended|revoked (révoqué = suppression douce).
--   3. AUDIT : table `audit_log` EN ÉCRITURE SEULE (insert only, jamais update/delete).
--
-- À appliquer après 001, 002, 003. Les tables construction Mustaf (construction_projects,
-- phases, expenses, …) feront l'objet d'une migration dédiée quand Mustaf quittera le mock.

-- =====================================================================
-- 0. Enums
-- =====================================================================
do $$ begin
  create type team_role as enum ('admin', 'procurement', 'site_agent', 'inspector', 'controller');
exception when duplicate_object then null; end $$;

do $$ begin
  create type subscription_subject as enum ('seller', 'mustaf');
exception when duplicate_object then null; end $$;

do $$ begin
  create type subscription_status as enum ('pending', 'active', 'suspended', 'revoked');
exception when duplicate_object then null; end $$;

-- =====================================================================
-- 1. user_roles : le système de rôles (un user peut porter plusieurs rôles)
-- =====================================================================
create table if not exists user_roles (
  user_id    uuid not null references auth.users(id) on delete cascade,
  role       team_role not null,
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

-- Fonction de garde réutilisée par toutes les policies. SECURITY DEFINER pour
-- lire user_roles sans exposer la table, STABLE pour le planner.
create or replace function public.has_role(check_role team_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from user_roles ur
    where ur.user_id = auth.uid() and ur.role = check_role
  );
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_role('admin');
$$;

alter table user_roles enable row level security;
drop policy if exists "admin manages roles" on user_roles;
drop policy if exists "user reads own roles" on user_roles;
create policy "admin manages roles" on user_roles for all  using (public.is_admin()) with check (public.is_admin());
create policy "user reads own roles"  on user_roles for select using (user_id = auth.uid());

-- =====================================================================
-- 2. Custom claim JWT app_metadata.user_role
--    Posé par un Auth Hook Supabase (Access Token Hook). proxy.ts et le
--    routage post-login lisent ce claim SANS requête DB.
--
--    À déclarer dans Supabase (Dashboard → Auth → Hooks) en pointant vers
--    cette fonction. Elle reçoit l'event, ajoute le rôle au token, le renvoie.
-- =====================================================================
create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  claims      jsonb;
  user_role   text;
begin
  -- Priorité au rôle admin ; sinon premier rôle trouvé.
  select role::text into user_role
  from user_roles
  where user_id = (event->>'user_id')::uuid
  order by (role = 'admin') desc
  limit 1;

  claims := event->'claims';
  if user_role is not null then
    claims := jsonb_set(claims, '{app_metadata, user_role}', to_jsonb(user_role));
  end if;

  return jsonb_set(event, '{claims}', claims);
end;
$$;

-- =====================================================================
-- 3. subscriptions : abonnements UNIFIÉS (vendeurs Sara + clients Mustaf)
--    Autorité unique du cycle de vie admin. sellers.subscription_status devient
--    secondaire (à synchroniser/retirer lors du branchement).
-- =====================================================================
create table if not exists subscriptions (
  id           uuid primary key default gen_random_uuid(),
  subject_type subscription_subject not null,
  subject_id   uuid not null,                 -- sellers.id ou construction_projects.id
  tier         text not null,                 -- 'Sara Standard' | 'suivi' | 'serenite' | …
  status       subscription_status not null default 'pending',
  validated_by uuid references auth.users(id),
  validated_at timestamptz,
  created_at   timestamptz not null default now(),
  unique (subject_type, subject_id)
);
create index if not exists subscriptions_status_idx on subscriptions (status);
create index if not exists subscriptions_subject_idx on subscriptions (subject_type, subject_id);

alter table subscriptions enable row level security;
drop policy if exists "admin manages subscriptions" on subscriptions;
drop policy if exists "seller reads own subscription" on subscriptions;
create policy "admin manages subscriptions"
  on subscriptions for all using (public.is_admin()) with check (public.is_admin());
-- Un vendeur voit son propre abonnement (subject_id = son auth.uid()).
create policy "seller reads own subscription"
  on subscriptions for select
  using (subject_type = 'seller' and subject_id = auth.uid());

-- =====================================================================
-- 4. audit_log : ÉCRITURE SEULE. Aucune policy update/delete → immuable.
-- =====================================================================
create table if not exists audit_log (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid not null references auth.users(id),
  action      text not null,                  -- validate_sub | add_invoice | release_funds | …
  target_type text not null,                  -- subscription | expense | phase | media | user | project | anomaly
  target_id   text not null,
  target_label text,
  metadata    jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists audit_log_actor_idx on audit_log (actor_id, created_at desc);
create index if not exists audit_log_target_idx on audit_log (target_type, target_id);

alter table audit_log enable row level security;
-- INSERT : tout rôle d'équipe authentifié peut tracer ses actions.
drop policy if exists "team inserts audit" on audit_log;
create policy "team inserts audit"
  on audit_log for insert to authenticated
  with check (
    actor_id = auth.uid()
    and (public.is_admin() or public.has_role('procurement') or public.has_role('site_agent')
         or public.has_role('inspector') or public.has_role('controller'))
  );
-- SELECT : admin uniquement.
drop policy if exists "admin reads audit" on audit_log;
create policy "admin reads audit" on audit_log for select using (public.is_admin());
-- PAS de policy UPDATE ni DELETE → le journal est immuable, même pour l'admin.

-- =====================================================================
-- 5. Rappel séparation des pouvoirs (§3.10) — appliqué côté applicatif aujourd'hui.
--    Quand fund_releases passera en base, ajouter une contrainte d'intégrité :
--      check (controller_id <> inspector_id)
--    pour que le maker-checker soit garanti par la base elle-même.
-- =====================================================================
