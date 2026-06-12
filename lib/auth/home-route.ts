// Routage post-connexion par rôle — partagé entre l'action de login et proxy.ts.
//
// Le rôle est lu depuis user.app_metadata.user_role (auth.users.raw_app_meta_data,
// posé côté serveur uniquement — migration 006). La table user_roles reste la
// source de vérité pour les policies RLS ; tant que le hook JWT n'est pas branché,
// toute attribution de rôle doit écrire les deux (voir migration 006).
//
// Pas de rôle = vendeur → /dashboard. Le client Mustaf (/projet) n'est pas encore
// une destination de connexion (mock-first, démo publique).

export const TEAM_ROLES = ['procurement', 'site_agent', 'inspector', 'controller', 'prospector'] as const;

export function homeRouteFor(role: unknown): string {
  if (role === 'admin') return '/admin';
  // Le prospecteur a son propre dashboard, distinct des employés terrain.
  if (role === 'prospector') return '/equipe/prospection';
  if (TEAM_ROLES.includes(role as (typeof TEAM_ROLES)[number])) return '/equipe';
  if (role === 'owner') return '/projet';   // client Mustaf (construction)
  return '/dashboard';
}

/**
 * Rôle effectif d'un utilisateur pour le ROUTAGE (pas la sécurité).
 *
 * Priorité à `app_metadata.user_role` (posé côté serveur, source forte). À défaut,
 * un client Mustaf inscrit via le paiement « j'ai déjà mes plans » porte
 * `user_metadata.account_type = 'owner'` (signUp ne peut pas écrire app_metadata).
 * Le routage n'est qu'un confort ; la vraie barrière reste la RLS (CLAUDE.md §5).
 */
export function effectiveRole(user: {
  app_metadata?: Record<string, unknown> | null;
  user_metadata?: Record<string, unknown> | null;
} | null | undefined): unknown {
  const appRole = (user?.app_metadata as Record<string, unknown> | undefined)?.user_role;
  if (appRole) return appRole;
  const accountType = (user?.user_metadata as Record<string, unknown> | undefined)?.account_type;
  if (accountType === 'owner') return 'owner';
  return undefined;
}
