'use server';

import { createSupabaseServerClient } from '@/lib/supabase-server';
import { validatePassword } from './password-policy';

export type PasswordState = { error?: string; ok?: boolean } | null;

/**
 * Change the connected user's own password (real Supabase auth, not mock).
 * Shared by every authenticated space (admin, vendeur, équipe).
 *
 * Defence-in-depth : we re-authenticate with the current password before
 * accepting a new one — holding the session cookie alone shouldn't be enough.
 */
export async function changePassword(
  _prev: PasswordState,
  formData: FormData,
): Promise<PasswordState> {
  const current = (formData.get('current') as string) ?? '';
  const password = (formData.get('password') as string) ?? '';
  const confirm = (formData.get('confirm') as string) ?? '';

  const passwordError = validatePassword(password);
  if (passwordError) return { error: passwordError };
  if (password !== confirm) return { error: 'Les deux mots de passe ne correspondent pas.' };
  if (password === current) return { error: 'Le nouveau mot de passe doit être différent de l’ancien.' };

  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { error: 'Session expirée. Reconnectez-vous puis réessayez.' };

  // Vérifie l'ancien mot de passe en se ré-authentifiant.
  const { error: reauthError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: current,
  });
  if (reauthError) return { error: 'Mot de passe actuel incorrect.' };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: 'Modification impossible : ' + error.message };

  return { ok: true };
}
