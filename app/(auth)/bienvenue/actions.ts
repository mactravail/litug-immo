'use server';

import { createSupabaseServerClient } from '@/lib/supabase-server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { homeRouteFor } from '@/lib/auth/home-route';
import { redirect } from 'next/navigation';

export type WelcomeState = { error?: string } | null;

/**
 * Premier changement de mot de passe d'un employé.
 *
 * L'admin a créé le compte avec un mot de passe provisoire et le flag
 * app_metadata.must_change_password = true. À sa première connexion, proxy.ts
 * force l'employé ici. Il choisit son vrai mot de passe ; on efface le flag
 * (via la clé service_role : l'utilisateur ne peut pas modifier son app_metadata)
 * puis on le route vers SON espace.
 */
export async function setInitialPassword(
  _prev: WelcomeState,
  formData: FormData,
): Promise<WelcomeState> {
  const password = (formData.get('password') as string) ?? '';
  const confirm = (formData.get('confirm') as string) ?? '';

  if (password.length < 8) return { error: 'Le mot de passe doit contenir au moins 8 caractères.' };
  if (password !== confirm) return { error: 'Les deux mots de passe ne correspondent pas.' };

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Session expirée. Reconnectez-vous avec le mot de passe provisoire.' };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: 'Impossible d’enregistrer le mot de passe : ' + error.message };

  // Lève l'obligation de changement (sinon proxy.ts re-forcerait cette page).
  try {
    const admin = createSupabaseAdminClient();
    await admin.auth.admin.updateUserById(user.id, {
      app_metadata: { user_role: (user.app_metadata as Record<string, unknown>)?.user_role, must_change_password: false },
    });
  } catch {
    // Si l'effacement échoue, l'employé reste bloqué sur cette page : on signale.
    return { error: 'Mot de passe enregistré mais finalisation impossible. Réessayez ou contactez l’administrateur.' };
  }

  const role = (user.app_metadata as Record<string, unknown> | undefined)?.user_role;
  redirect(homeRouteFor(role));
}
