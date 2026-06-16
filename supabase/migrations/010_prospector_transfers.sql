-- Litug — Virements admin → prospecteur
-- Table : prospector_transfers
-- RLS : l'admin lit et écrit tout (is_admin()).
--       Le prospecteur voit ses propres lignes et peut confirmer/nier une réception.
--
-- Dépend de 004 (is_admin() + has_role() déjà créés).

create table if not exists prospector_transfers (
  id              uuid primary key default gen_random_uuid(),
  prospector_id   uuid not null references auth.users(id) on delete cascade,
  prospector_name text not null,
  amount          int not null check (amount > 0),   -- FCFA, entier
  motif           text not null,
  sent_at         timestamptz not null default now(),
  status          text not null default 'pending'
                  check (status in ('pending', 'confirmed', 'denied')),
  confirmed_at    timestamptz,
  denied_at       timestamptz,
  denial_reason   text,
  created_at      timestamptz not null default now()
);

create index if not exists prospector_transfers_prospector_idx
  on prospector_transfers (prospector_id, sent_at desc);

alter table prospector_transfers enable row level security;

-- Admin : accès complet (lecture + écriture de tous les virements).
drop policy if exists "admin all prospector_transfers" on prospector_transfers;
create policy "admin all prospector_transfers"
  on prospector_transfers for all
  using  (public.is_admin())
  with check (public.is_admin());

-- Prospecteur : lecture de ses propres virements.
drop policy if exists "prospector reads own transfers" on prospector_transfers;
create policy "prospector reads own transfers"
  on prospector_transfers for select
  using (prospector_id = auth.uid());

-- Prospecteur : peut confirmer ou nier un virement EN ATTENTE qui lui appartient.
-- using  → ne peut agir que si status = 'pending' ET c'est son virement.
-- with check → la nouvelle valeur doit être 'confirmed' ou 'denied'.
drop policy if exists "prospector confirms own transfer" on prospector_transfers;
create policy "prospector confirms own transfer"
  on prospector_transfers for update
  using  (prospector_id = auth.uid() and status = 'pending')
  with check (prospector_id = auth.uid() and status in ('confirmed', 'denied'));
