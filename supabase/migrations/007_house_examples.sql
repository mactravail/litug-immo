-- 007_house_examples.sql
-- Vitrine « Exemple de maison » (landing) gérée depuis /admin/maisons.
-- La photo est stockée en base64 (data URL), comme les photos de terrains,
-- pour rester simple (pas de bucket de stockage à configurer).

create table if not exists public.house_examples (
  id uuid primary key default gen_random_uuid(),
  title text,
  surface text,
  photo text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

comment on table public.house_examples is 'Exemples de maisons (vitrine landing), gérés par l''admin. Lecture publique, écriture service_role uniquement.';

alter table public.house_examples enable row level security;

-- Lecture publique (anon) : la vitrine de la landing.
drop policy if exists house_examples_public_read on public.house_examples;
create policy house_examples_public_read
  on public.house_examples
  for select
  to anon, authenticated
  using (true);

-- Aucune policy d'écriture : seules les actions serveur via la clé service_role
-- (qui contourne RLS) peuvent insérer/supprimer. Le front n'écrit jamais directement.

create index if not exists house_examples_sort_idx
  on public.house_examples (sort_order asc, created_at desc);
