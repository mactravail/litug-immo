-- Litug — Prospection commerciale (espace équipe)
-- Tables : prospect_entries + prospector_work_days
-- RLS : chaque prospecteur voit et écrit UNIQUEMENT ses propres lignes ;
--       l'admin (is_admin()) lit tout.
--
-- Dépend de 004 (is_admin() + has_role() déjà créés).

-- =====================================================================
-- 0. Types textuels (pas d'enums Postgres pour garder la flexibilité)
-- =====================================================================

-- =====================================================================
-- 1. prospect_entries — carnet de bord du prospecteur
-- =====================================================================
create table if not exists prospect_entries (
  id             uuid primary key default gen_random_uuid(),
  prospector_id  uuid not null references auth.users(id) on delete cascade,
  company_name   text not null,
  contact_name   text,
  contact_phone  text,
  followers      int check (followers >= 0),
  network        text not null,        -- facebook|instagram|tiktok|whatsapp|marketplace|other
  outcome        text not null,        -- to_contact|no_response|interested|refused
  contact_method text,                 -- call|message|comment|whatsapp|email|other
  concern        text,
  notes          text,
  status         text not null default 'draft', -- draft|sent
  prospected_at  date not null,
  sent_at        timestamptz,
  created_at     timestamptz not null default now()
);

create index if not exists prospect_entries_prospector_idx
  on prospect_entries (prospector_id, prospected_at desc);

alter table prospect_entries enable row level security;

drop policy if exists "admin all prospect_entries" on prospect_entries;
drop policy if exists "prospector manages own entries" on prospect_entries;

create policy "admin all prospect_entries"
  on prospect_entries for all
  using  (public.is_admin())
  with check (public.is_admin());

create policy "prospector manages own entries"
  on prospect_entries for all
  using  (prospector_id = auth.uid())
  with check (prospector_id = auth.uid());

-- =====================================================================
-- 2. prospector_work_days — pointage journalier (date + heures)
--    Contrainte UNIQUE (worker_id, work_date) : une seule ligne par jour.
-- =====================================================================
create table if not exists prospector_work_days (
  id          uuid primary key default gen_random_uuid(),
  worker_id   uuid not null references auth.users(id) on delete cascade,
  work_date   date not null,
  hours       numeric not null check (hours > 0 and hours <= 24),
  note        text,
  created_at  timestamptz not null default now(),
  unique (worker_id, work_date)
);

create index if not exists prospector_work_days_worker_idx
  on prospector_work_days (worker_id, work_date desc);

alter table prospector_work_days enable row level security;

drop policy if exists "admin all work_days" on prospector_work_days;
drop policy if exists "prospector manages own days" on prospector_work_days;

create policy "admin all work_days"
  on prospector_work_days for all
  using  (public.is_admin())
  with check (public.is_admin());

create policy "prospector manages own days"
  on prospector_work_days for all
  using  (worker_id = auth.uid())
  with check (worker_id = auth.uid());
