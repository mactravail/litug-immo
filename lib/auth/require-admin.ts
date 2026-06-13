import 'server-only';
import { createSupabaseServerClient } from '@/lib/supabase-server';

/**
 * Garde serveur partagé : confirme que l'appelant est un admin connecté.
 *
 * À utiliser dans TOUTE server action / route qui agit avec la clé `service_role`
 * (createSupabaseAdminClient), car cette clé contourne la RLS — le routage de
 * proxy.ts ne suffit pas (les server actions sont des endpoints POST appelables
 * directement, indépendamment de la page d'où elles sont importées, CLAUDE.md §5).
 *
 * Renvoie l'utilisateur admin si OK, sinon un message d'erreur prêt à afficher.
 */
export async function requireAdmin(): Promise<
  | { ok: true; userId: string; email: string }
  | { ok: false; error: string }
> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const role = (user?.app_metadata as Record<string, unknown> | undefined)?.user_role;

  if (!user || role !== 'admin') {
    return { ok: false, error: 'Action réservée à l’administrateur. Reconnectez-vous puis réessayez.' };
  }
  return { ok: true, userId: user.id, email: user.email ?? '' };
}
