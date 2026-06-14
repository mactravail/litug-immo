-- Litug — Backfill des abonnements vendeurs dans la table `subscriptions`.
--
-- Contexte : la table `subscriptions` (migration 004) existe mais reste vide ;
-- l'admin passe en vrai Supabase (retrait des données de démo). On y recopie les
-- vendeurs déjà présents pour que /admin/vendeurs affiche de VRAIS abonnements.
-- Les validations futures (validateAccountRequest) y insèrent leur ligne au fil de l'eau.
--
-- Idempotent : `on conflict (subject_type, subject_id) do nothing` (contrainte unique 004).
-- Mapping sellers.subscription_status → subscription_status :
--   active → active · past_due → suspended · trial (défaut) → pending.

insert into subscriptions (subject_type, subject_id, tier, status, created_at)
select
  'seller'::subscription_subject,
  s.id,
  'Sara Standard',
  case s.subscription_status
    when 'active'   then 'active'::subscription_status
    when 'past_due' then 'suspended'::subscription_status
    else                 'pending'::subscription_status
  end,
  s.created_at
from sellers s
on conflict (subject_type, subject_id) do nothing;
