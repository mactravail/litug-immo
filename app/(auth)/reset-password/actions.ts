'use server';

import { createSupabaseServerClient } from '@/lib/supabase-server';
import { validatePassword } from '@/lib/auth/password-policy';
import { redirect } from 'next/navigation';

export async function resetPassword(
  _prevState: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const password = formData.get('password') as string;
  const confirm = formData.get('confirm') as string;

  if (password !== confirm) return { error: 'Les mots de passe ne correspondent pas.' };
  const passwordError = validatePassword(password);
  if (passwordError) return { error: passwordError };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) return { error: 'Impossible de mettre à jour le mot de passe. Recommencez depuis le début.' };

  redirect('/login?reinitialise=true');
}
