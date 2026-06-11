-- Litug — Attribution du rôle admin au fondateur.
--
-- Le rôle vit à DEUX endroits tant que le hook JWT (custom_access_token_hook,
-- migration 004) n'est pas branché dans Supabase → Auth → Hooks :
--   1. user_roles               → source de vérité pour les policies RLS (has_role / is_admin)
--   2. auth.users.raw_app_meta_data.user_role → lu par proxy.ts et le routage
--      post-login via supabase.auth.getUser().app_metadata (sans requête DB).
--      Côté serveur uniquement : l'utilisateur ne peut pas modifier app_metadata.
--
-- ⚠️ Toute attribution future de rôle (admin / procurement / site_agent /
--    inspector / controller) doit écrire LES DEUX, sur ce modèle.
-- ⚠️ L'utilisateur doit se déconnecter / reconnecter pour que le nouveau
--    app_metadata soit visible dans sa session.
--
-- Note : le compte auth fallmactar14@gmail.com a été créé directement en base
-- (insert auth.users + auth.identities, mot de passe temporaire communiqué au
-- fondateur — à changer à la première connexion). La ligne `sellers` créée par
-- le trigger handle_new_user a été supprimée : un admin n'est pas un vendeur.

insert into user_roles (user_id, role)
select id, 'admin' from auth.users where email = 'fallmactar14@gmail.com'
on conflict do nothing;

update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"user_role": "admin"}'
where email = 'fallmactar14@gmail.com';
