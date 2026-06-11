-- Litug — Volet B Admin : pilotage des employés (tâches, avances, redditions, problèmes)
--
-- ⚠️ PRÊTE MAIS NON BRANCHÉE : le Volet B tourne aujourd'hui en mock-first
--    (lib/admin/*). On applique cette migration au basculement Supabase de l'admin,
--    comme 004_admin.sql. Dépend de 004 (rôles user_roles + has_role()/is_admin()).
--
-- Principe (CLAUDE.md / prompt §2) :
--   - Suppression douce (tasks.status = 'cancelled'), jamais de DELETE.
--   - Réconciliation des avances : amount_given = amount_spent + amount_returned ;
--     l'écart est calculé et signalé côté app, et contraint ici (CHECK de cohérence).
--   - audit_log (déjà créé en 004) trace chaque action. Reçus en bucket privé.

-- =====================================================================
-- 0. Enums
-- =====================================================================
do $$ begin create type task_priority as enum ('high','medium','low'); exception when duplicate_object then null; end $$;
do $$ begin create type task_status as enum ('assigned','in_progress','reported','validated','cancelled'); exception when duplicate_object then null; end $$;
do $$ begin create type field_report_status as enum ('submitted','validated','needs_fix'); exception when duplicate_object then null; end $$;
do $$ begin create type incident_status as enum ('to_resolve','resolved'); exception when duplicate_object then null; end $$;

-- =====================================================================
-- 1. tasks — travail assigné à un employé sur un projet
-- =====================================================================
create table if not exists tasks (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references construction_projects(id) on delete cascade,
  assigned_to uuid not null references auth.users(id),
  title       text not null,
  description text,
  priority    task_priority not null default 'medium',
  due_date    date,
  status      task_status not null default 'assigned',
  created_by  uuid not null references auth.users(id),
  created_at  timestamptz not null default now()
);
create index if not exists tasks_assigned_idx on tasks (assigned_to, status);
create index if not exists tasks_project_idx on tasks (project_id);

-- =====================================================================
-- 2. cash_advances — argent confié pour une tâche (l'exception, pas la règle)
--    Cohérence : dépensé + rendu ne dépasse jamais le donné.
-- =====================================================================
create table if not exists cash_advances (
  id              uuid primary key default gen_random_uuid(),
  task_id         uuid not null references tasks(id) on delete cascade,
  worker_id       uuid not null references auth.users(id),
  amount_given    bigint not null check (amount_given >= 0),
  amount_spent    bigint not null default 0 check (amount_spent >= 0),
  amount_returned bigint not null default 0 check (amount_returned >= 0),
  reconciled      boolean not null default false,
  purpose         text not null,
  created_at      timestamptz not null default now(),
  check (amount_spent + amount_returned <= amount_given)
);
create index if not exists cash_advances_worker_idx on cash_advances (worker_id, reconciled);

-- =====================================================================
-- 3. advance_receipts — justificatifs de dépense (fichiers en bucket privé)
-- =====================================================================
create table if not exists advance_receipts (
  id              uuid primary key default gen_random_uuid(),
  cash_advance_id uuid not null references cash_advances(id) on delete cascade,
  label           text not null,
  amount          bigint not null check (amount >= 0),
  file_url        text,
  created_at      timestamptz not null default now()
);

-- =====================================================================
-- 4. work_sessions — pointage début/fin + résumé (heures de travail)
-- =====================================================================
create table if not exists work_sessions (
  id         uuid primary key default gen_random_uuid(),
  worker_id  uuid not null references auth.users(id),
  task_id    uuid not null references tasks(id) on delete cascade,
  started_at timestamptz not null,
  ended_at   timestamptz,
  summary    text,
  check (ended_at is null or ended_at >= started_at)
);
create index if not exists work_sessions_worker_idx on work_sessions (worker_id, started_at desc);

-- =====================================================================
-- 5. field_reports — rendu-compte d'une mission (argent + travail)
-- =====================================================================
create table if not exists field_reports (
  id               uuid primary key default gen_random_uuid(),
  task_id          uuid not null references tasks(id) on delete cascade,
  worker_id        uuid not null references auth.users(id),
  amount_remaining bigint not null default 0,
  work_done        text not null,
  work_remaining   text,
  submitted_at     timestamptz not null default now(),
  status           field_report_status not null default 'submitted'
);

-- =====================================================================
-- 6. incidents — problèmes remontés du terrain (où / quand / statut)
-- =====================================================================
create table if not exists incidents (
  id          uuid primary key default gen_random_uuid(),
  report_id   uuid references field_reports(id) on delete set null,
  project_id  uuid not null references construction_projects(id) on delete cascade,
  raised_by   uuid not null references auth.users(id),
  description text not null,
  location    text,
  geo_lat     double precision,
  geo_lng     double precision,
  priority    task_priority not null default 'medium',
  occurred_at timestamptz not null,
  status      incident_status not null default 'to_resolve',
  created_at  timestamptz not null default now()
);
create index if not exists incidents_status_idx on incidents (status, priority);

-- =====================================================================
-- 7. RLS — admin large ; chaque employé ne voit QUE ses propres lignes.
-- =====================================================================
alter table tasks            enable row level security;
alter table cash_advances    enable row level security;
alter table advance_receipts enable row level security;
alter table work_sessions    enable row level security;
alter table field_reports    enable row level security;
alter table incidents        enable row level security;

-- tasks
drop policy if exists "admin all tasks" on tasks;
drop policy if exists "worker reads own tasks" on tasks;
create policy "admin all tasks"        on tasks for all using (public.is_admin()) with check (public.is_admin());
create policy "worker reads own tasks" on tasks for select using (assigned_to = auth.uid());

-- cash_advances
drop policy if exists "admin all advances" on cash_advances;
drop policy if exists "worker reads own advances" on cash_advances;
create policy "admin all advances"        on cash_advances for all using (public.is_admin()) with check (public.is_admin());
create policy "worker reads own advances" on cash_advances for select using (worker_id = auth.uid());

-- advance_receipts (le worker gère les reçus de ses propres avances)
drop policy if exists "admin all receipts" on advance_receipts;
drop policy if exists "worker writes own receipts" on advance_receipts;
create policy "admin all receipts" on advance_receipts for all using (public.is_admin()) with check (public.is_admin());
create policy "worker writes own receipts" on advance_receipts for all
  using (exists (select 1 from cash_advances ca where ca.id = cash_advance_id and ca.worker_id = auth.uid()))
  with check (exists (select 1 from cash_advances ca where ca.id = cash_advance_id and ca.worker_id = auth.uid()));

-- work_sessions (le worker pointe ses propres sessions)
drop policy if exists "admin all sessions" on work_sessions;
drop policy if exists "worker manages own sessions" on work_sessions;
create policy "admin all sessions"          on work_sessions for all using (public.is_admin()) with check (public.is_admin());
create policy "worker manages own sessions" on work_sessions for all using (worker_id = auth.uid()) with check (worker_id = auth.uid());

-- field_reports (le worker soumet ; l'admin valide)
drop policy if exists "admin all reports" on field_reports;
drop policy if exists "worker manages own reports" on field_reports;
create policy "admin all reports"          on field_reports for all using (public.is_admin()) with check (public.is_admin());
create policy "worker manages own reports" on field_reports for all using (worker_id = auth.uid()) with check (worker_id = auth.uid());

-- incidents (le worker signale ; l'admin traite)
drop policy if exists "admin all incidents" on incidents;
drop policy if exists "worker raises incidents" on incidents;
drop policy if exists "worker reads own incidents" on incidents;
create policy "admin all incidents"        on incidents for all using (public.is_admin()) with check (public.is_admin());
create policy "worker raises incidents"    on incidents for insert with check (raised_by = auth.uid());
create policy "worker reads own incidents" on incidents for select using (raised_by = auth.uid());

-- =====================================================================
-- 8. Storage : bucket privé 'advance-receipts' pour les justificatifs.
--    À créer via le dashboard/CLI Supabase ; accès par URL signée uniquement.
-- =====================================================================
