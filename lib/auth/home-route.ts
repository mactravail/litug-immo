// Routage post-connexion par rôle — partagé entre l'action de login et proxy.ts.
//
// Le rôle est lu depuis user.app_metadata.user_role (auth.users.raw_app_meta_data,
// posé côté serveur uniquement — migration 006). La table user_roles reste la
// source de vérité pour les policies RLS ; tant que le hook JWT n'est pas branché,
// toute attribution de rôle doit écrire les deux (voir migration 006).
//
// Pas de rôle = vendeur → /dashboard. Le client Mustaf (/projet) n'est pas encore
// une destination de connexion (mock-first, démo publique).

export const TEAM_ROLES = ['procurement', 'site_agent', 'inspector', 'controller'] as const;

export function homeRouteFor(role: unknown): string {
  if (role === 'admin') return '/admin';
  if (TEAM_ROLES.includes(role as (typeof TEAM_ROLES)[number])) return '/equipe';
  return '/dashboard';
}
