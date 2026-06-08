-- Litug — Schéma initial
-- Phase 3 : appliquer avec `supabase db push` après branchement

-- Enums
create type document_type as enum ('tf', 'bail', 'deliberation');
create type verification_status as enum ('non_verifie', 'a_verifier', 'verifie');
create type sale_status as enum ('disponible', 'en_cours_de_vente', 'vendu');
create type lead_status as enum ('nouveau', 'qualifie', 'en_contact', 'converti', 'perdu');

-- Sellers (1 ligne par compte Auth)
create table sellers (
  id uuid primary key references auth.users(id) on delete cascade,
  business_name text not null,
  phone text,
  email text,
  subscription_status text not null default 'trial' check (subscription_status in ('trial', 'active', 'past_due')),
  created_at timestamptz not null default now()
);

-- Lands
create table lands (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references sellers(id) on delete cascade,
  title text not null,
  zone text not null,
  surface integer,
  price_fcfa bigint not null check (price_fcfa > 0),
  document_type document_type not null,
  verification_status verification_status not null default 'non_verifie',
  verified_by_notaire text,
  verified_at date,
  registry_checked text,
  sale_status sale_status not null default 'disponible',
  photos text[] not null default '{}',
  documents text[] not null default '{}',
  description text,
  created_at timestamptz not null default now()
);

create index on lands (seller_id, sale_status);
create index on lands (seller_id, verification_status);
create index on lands (seller_id, document_type);

-- Leads
create table leads (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references sellers(id) on delete cascade,
  name text,
  phone text,
  budget_fcfa bigint,
  desired_zone text,
  desired_document_type document_type,
  status lead_status not null default 'nouveau',
  source text not null default 'whatsapp' check (source in ('whatsapp', 'site', 'autre')),
  interested_land_id uuid references lands(id) on delete set null,
  created_at timestamptz not null default now()
);

create index on leads (seller_id, status);

-- Conversations
create table conversations (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  messages jsonb not null default '[]',
  updated_at timestamptz not null default now()
);

-- RLS : activé sur toutes les tables
alter table sellers enable row level security;
alter table lands enable row level security;
alter table leads enable row level security;
alter table conversations enable row level security;

-- Sellers RLS
create policy "seller reads own profile"
  on sellers for select using (id = auth.uid());
create policy "seller updates own profile"
  on sellers for update using (id = auth.uid()) with check (id = auth.uid());

-- Lands RLS
create policy "seller reads own lands"
  on lands for select using (seller_id = auth.uid());
create policy "seller writes own lands"
  on lands for all using (seller_id = auth.uid()) with check (seller_id = auth.uid());

-- Leads RLS
create policy "seller reads own leads"
  on leads for select using (seller_id = auth.uid());
create policy "seller updates own leads"
  on leads for update using (seller_id = auth.uid()) with check (seller_id = auth.uid());
-- n8n insère via service_role (bypass RLS), donc pas de policy INSERT pour les leads

-- Conversations RLS
create policy "seller reads own conversations"
  on conversations for select
  using (exists (
    select 1 from leads where leads.id = conversations.lead_id and leads.seller_id = auth.uid()
  ));

-- Storage buckets (à créer via le dashboard Supabase ou la CLI)
-- Bucket: land-photos  → public (lecture), authentifié pour écriture
-- Bucket: land-documents → privé, accès uniquement via URL signée

-- Trigger : créer la ligne sellers à la première connexion
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.sellers (id, business_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'business_name', 'Nouveau vendeur'),
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
