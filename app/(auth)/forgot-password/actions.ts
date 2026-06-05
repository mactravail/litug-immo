'use server';

import { createSupabaseServerClient } from '@/lib/supabase-server';
import { headers } from 'next/headers';

export async function forgotPassword(
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const email = formData.get('email') as string;
  if (!email) return { error: 'Veuillez saisir votre email.' };

  const headersList = await headers();
  const origin = headersList.get('origin') ?? 'http://localhost:3000';

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?type=recovery`,
  });

  if (error) return { error: 'Impossible d\'envoyer l\'email. Vérifiez l\'adresse saisie.' };

  return { success: true };
}
