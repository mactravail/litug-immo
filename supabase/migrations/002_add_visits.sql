-- Table visits
create type visit_status as enum ('planifiee', 'confirmee', 'annulee', 'effectuee');

create table visits (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references sellers(id) on delete cascade,
  land_id uuid not null references lands(id) on delete cascade,
  lead_id uuid references leads(id) on delete set null,
  visit_date timestamptz not null,
  notes text,
  status visit_status not null default 'planifiee',
  created_at timestamptz not null default now()
);

create index on visits (seller_id, status);
create index on visits (seller_id, visit_date);

alter table visits enable row level security;

create policy "seller reads own visits"
  on visits for select using (seller_id = auth.uid());

create policy "seller writes own visits"
  on visits for all using (seller_id = auth.uid()) with check (seller_id = auth.uid());
