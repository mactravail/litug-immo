'use server';

import { createSupabaseServerClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';

export async function resetPassword(
  _prevState: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const password = formData.get('password') as string;
  const confirm = formData.get('confirm') as string;

  if (password !== confirm) return { error: 'Les mots de passe ne correspondent pas.' };
  if (password.length < 6) return { error: 'Le mot de passe doit contenir au moins 6 caractères.' };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) return { error: 'Impossible de mettre à jour le mot de passe. Recommencez depuis le début.' };

  redirect('/login?reinitialise=true');
}
