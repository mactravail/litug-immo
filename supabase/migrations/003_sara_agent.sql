-- Litug — Agent IA « Sara » (WhatsApp)
-- Phase 1 : la fenêtre étroite + le multi-locataire.
--
-- Principe de sécurité (NON NÉGOCIABLE) :
--   1. Sara se connecte avec un rôle Postgres dédié `sara_role` (JAMAIS service_role).
--   2. Sa "fenêtre" se limite à :
--        - LECTURE de la vue `public_lands` (8 colonnes autorisées + l'id technique,
--          voir note ci-dessous) ;
--        - LECTURE des 2 tables de config nécessaires au routage : `whatsapp_numbers`
--          (résoudre le vendeur) et `seller_knowledge_base` (charger le contexte du prompt) ;
--        - LECTURE/ÉCRITURE sur `leads` et `conversations` (+ la table de mémoire de chat).
--   3. AUCUN accès à `lands` (table de base), `documents`, `sellers`, CNI, prix d'achat, etc.
--   4. L'isolation par vendeur (un acheteur ne voit jamais les données d'un autre vendeur)
--      est imposée par le WORKFLOW n8n : chaque requête est filtrée par le `seller_id`
--      résolu depuis `whatsapp_numbers`. Cette migration fournit la fenêtre étroite (quelles
--      tables/colonnes) ; le workflow fournit l'isolation locataire (quel vendeur).
--
-- À appliquer après 001 et 002.

-- =====================================================================
-- 0. Colonnes additionnelles (idempotent — au cas où la base diverge du repo)
-- =====================================================================

-- Porte de publication (ajoutée en Phase 3 directement sur la base live ; on la garantit ici).
alter table lands add column if not exists published boolean not null default false;

-- Signal "passer la main à un humain" posé par Sara quand l'acheteur est sérieux.
alter table leads add column if not exists needs_human boolean not null default false;
alter table leads add column if not exists qualified_at timestamptz;

-- =====================================================================
-- 1. Table whatsapp_numbers : phone_number_id (Meta) -> seller_id
--    Le coeur du multi-locataire : 1 seul workflow, N vendeurs.
-- =====================================================================
create table if not exists whatsapp_numbers (
  phone_number_id      text primary key,            -- "phone_number_id" de WhatsApp Cloud API
  seller_id            uuid not null references sellers(id) on delete cascade,
  display_phone_number text,                         -- numéro lisible (+221...), optionnel
  created_at           timestamptz not null default now()
);
create index if not exists whatsapp_numbers_seller_idx on whatsapp_numbers (seller_id);

alter table whatsapp_numbers enable row level security;
-- Le vendeur peut voir le(s) numéro(s) liés à son compte depuis le dashboard.
drop policy if exists "seller reads own whatsapp numbers" on whatsapp_numbers;
create policy "seller reads own whatsapp numbers"
  on whatsapp_numbers for select using (seller_id = auth.uid());

-- =====================================================================
-- 2. Table seller_knowledge_base : contexte injecté dans le prompt de Sara
-- =====================================================================
create table if not exists seller_knowledge_base (
  seller_id    uuid primary key references sellers(id) on delete cascade,
  presentation text,                 -- présentation du vendeur / de l'entreprise
  faq          text,                 -- FAQ libre (texte) injectée telle quelle dans le prompt
  ton          text,                 -- consignes de ton spécifiques au vendeur
  updated_at   timestamptz not null default now()
);

alter table seller_knowledge_base enable row level security;
drop policy if exists "seller reads own kb" on seller_knowledge_base;
drop policy if exists "seller writes own kb" on seller_knowledge_base;
create policy "seller reads own kb"
  on seller_knowledge_base for select using (seller_id = auth.uid());
create policy "seller writes own kb"
  on seller_knowledge_base for all using (seller_id = auth.uid()) with check (seller_id = auth.uid());

-- =====================================================================
-- 3. Vue public_lands : la fenêtre de LECTURE de Sara sur les terrains
--    UNIQUEMENT les colonnes autorisées. Jamais documents / verified_by / registry / surface interne, etc.
--
--    NOTE sur `id` : la liste autorisée ne le mentionne pas, mais Sara doit pouvoir
--    rattacher un lead à un terrain précis (leads.interested_land_id). L'id est un UUID
--    aléatoire non sensible (au même titre que seller_id, déjà exposé). C'est le SEUL
--    ajout au-delà des 8 colonnes demandées, et il est strictement nécessaire au lien lead→terrain.
--
--    SÉCURITÉ DE LA VUE : on NE met PAS `security_invoker = true`. La vue s'exécute donc
--    avec les droits de son propriétaire (postgres), ce qui lui permet de lire `lands`
--    sans donner à `sara_role` le moindre droit sur la table de base `lands`. `sara_role`
--    ne reçoit QUE le SELECT sur la vue → il ne peut voir que ces colonnes, ces lignes.
-- =====================================================================
create or replace view public_lands as
  select
    l.id,
    l.seller_id,
    l.title,
    l.zone,
    l.price_fcfa,
    l.document_type,
    l.description,
    l.sale_status,
    l.photos
  from lands l
  where l.published = true;   -- les brouillons ne sont JAMAIS exposés aux acheteurs

-- =====================================================================
-- 4. Index pour les accès de Sara (upsert lead par téléphone, log conversation)
-- =====================================================================
-- Permet l'upsert "ON CONFLICT" du lead par (vendeur, téléphone).
create unique index if not exists leads_seller_phone_uniq
  on leads (seller_id, phone) where phone is not null;
-- Permet l'upsert "ON CONFLICT" de la conversation (1 ligne par lead).
create unique index if not exists conversations_lead_uniq
  on conversations (lead_id);

-- =====================================================================
-- 5. Mémoire de chat de Sara (utilisée par le node "Postgres Chat Memory" de n8n)
--    Schéma attendu par LangChain/n8n. Table dédiée, séparée de nos conversations métier.
-- =====================================================================
create table if not exists sara_chat_memory (
  id         bigserial primary key,
  session_id varchar(255) not null,   -- = "<phone_number_id>:<numero_acheteur>"
  message    jsonb not null
);
create index if not exists sara_chat_memory_session_idx on sara_chat_memory (session_id);

-- =====================================================================
-- 6. Le rôle dédié `sara_role` + GRANTs EXACTS
--    Défauts sûrs : pas de superuser, pas de createdb/role, ne contourne PAS la RLS.
-- =====================================================================
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'sara_role') then
    create role sara_role with
      login
      nosuperuser
      nocreatedb
      nocreaterole
      noinherit
      nobypassrls;   -- IMPORTANT : la RLS s'applique bien à Sara
  end if;
end
$$;

-- Le mot de passe N'EST PAS dans ce fichier versionné. À définir À LA MAIN, une fois,
-- dans le SQL Editor Supabase (et à stocker comme secret n8n, jamais commité) :
--     alter role sara_role with password '[SARA_DB_PASSWORD]';

-- 6.a Accès au schéma (nécessaire mais ne donne aucun droit sur les tables par défaut).
grant usage on schema public to sara_role;
-- CREATE requis par le nœud n8n "Postgres Chat Memory" (langchain) : il exécute un
-- `CREATE TABLE IF NOT EXISTS sara_chat_memory` à chaque appel, et Postgres vérifie le
-- droit CREATE sur le schéma MÊME si la table existe déjà. Ne donne aucun accès aux
-- tables protégées (lands/sellers/documents restent hors de la fenêtre de sara_role).
grant create on schema public to sara_role;

-- 6.b LECTURE — la fenêtre étroite, table par table. Rien d'autre.
grant select on public_lands          to sara_role;   -- la vue uniquement (jamais `lands`)
grant select on whatsapp_numbers       to sara_role;   -- résoudre le vendeur
grant select on seller_knowledge_base  to sara_role;   -- charger le contexte du prompt

-- 6.c LECTURE + ÉCRITURE — uniquement les 2 tables de travail + la mémoire de chat.
grant select, insert, update on leads          to sara_role;
grant select, insert, update on conversations  to sara_role;
grant select, insert, delete on sara_chat_memory to sara_role;  -- delete : reset mémoire d'une session
grant usage, select on sequence sara_chat_memory_id_seq to sara_role;

-- 6.d Types enum utilisés par les INSERT/UPDATE de leads (USAGE explicite, par robustesse).
grant usage on type document_type to sara_role;
grant usage on type lead_status   to sara_role;

-- 6.e Verrouillage explicite : on s'assure que les droits par défaut futurs ne fuient pas.
--     (Un nouveau rôle ne reçoit aucun droit table automatiquement ; ceci est une ceinture+bretelles.)
alter default privileges in schema public revoke all on tables from sara_role;
alter default privileges in schema public revoke all on sequences from sara_role;

-- =====================================================================
-- 7. Policies RLS pour `sara_role` (la RLS est active sur leads/conversations).
--    Ces policies sont permissives mais SCOPÉES `to sara_role` : elles n'élargissent
--    en rien les droits des vendeurs (qui restent sur `auth.uid()`).
--    L'isolation par vendeur reste assurée par le WHERE seller_id = ... du workflow n8n.
-- =====================================================================
-- leads
drop policy if exists "sara reads leads"   on leads;
drop policy if exists "sara inserts leads"  on leads;
drop policy if exists "sara updates leads"  on leads;
create policy "sara reads leads"   on leads for select to sara_role using (true);
create policy "sara inserts leads"  on leads for insert to sara_role with check (true);
create policy "sara updates leads"  on leads for update to sara_role using (true) with check (true);

-- conversations
drop policy if exists "sara reads conversations"   on conversations;
drop policy if exists "sara inserts conversations"  on conversations;
drop policy if exists "sara updates conversations"  on conversations;
create policy "sara reads conversations"   on conversations for select to sara_role using (true);
create policy "sara inserts conversations"  on conversations for insert to sara_role with check (true);
create policy "sara updates conversations"  on conversations for update to sara_role using (true) with check (true);

-- whatsapp_numbers & seller_knowledge_base : la RLS y est active (policies vendeur sur
--   auth.uid()). sara_role se connecte en Postgres direct (auth.uid() = NULL), donc sans
--   policy dédiée il lirait 0 ligne. On ajoute une policy de LECTURE scopée `to sara_role`
--   (le GRANT select seul ne suffit pas quand la RLS est active).
drop policy if exists "sara reads whatsapp numbers" on whatsapp_numbers;
create policy "sara reads whatsapp numbers"
  on whatsapp_numbers for select to sara_role using (true);

drop policy if exists "sara reads kb" on seller_knowledge_base;
create policy "sara reads kb"
  on seller_knowledge_base for select to sara_role using (true);

-- sara_chat_memory : table interne à Sara → on active la RLS et on l'ouvre à sara_role seulement.
alter table sara_chat_memory enable row level security;
drop policy if exists "sara manages own chat memory" on sara_chat_memory;
create policy "sara manages own chat memory"
  on sara_chat_memory for all to sara_role using (true) with check (true);

-- =====================================================================
-- 8. Vérification rapide (à lancer après coup, lecture seule) :
--   set role sara_role;
--   select * from public_lands limit 1;         -- OK
--   select * from lands limit 1;                 -- doit ÉCHOUER (permission denied)
--   select * from sellers limit 1;               -- doit ÉCHOUER
--   reset role;
-- =====================================================================
