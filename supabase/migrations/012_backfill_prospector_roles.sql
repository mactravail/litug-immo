-- Répare les comptes prospecteurs créés avant la migration 011 :
-- insère user_roles pour tout utilisateur dont app_metadata contient
-- user_role='prospector' mais sans entrée dans user_roles.
-- Dépend de 011 (enum étendu, commit séparé obligatoire sous Postgres).
INSERT INTO user_roles (user_id, role)
SELECT u.id, 'prospector'::team_role
FROM auth.users u
WHERE u.raw_app_meta_data->>'user_role' = 'prospector'
  AND NOT EXISTS (
    SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role = 'prospector'
  );
