-- Ajoute 'prospector' à l'enum team_role.
-- Manquant depuis 004 : les comptes prospecteurs créés avant cette migration
-- n'avaient pas de ligne dans user_roles (l'insert échouait silencieusement).
ALTER TYPE team_role ADD VALUE IF NOT EXISTS 'prospector';
