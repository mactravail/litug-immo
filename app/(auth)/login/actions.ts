'use server';

import { createSupabaseServerClient } from '@/lib/supabase-server';
import { homeRouteFor } from '@/lib/auth/home-route';
import { redirect } from 'next/navigation';

export async function login(
  _prevState: { error: string } | null,
  formData: FormData,
): Promise<{ error: string }> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  });

  if (error) {
    return { error: 'Email ou mot de passe incorrect.' };
  }

  // Routage post-connexion par rôle : admin → /admin, rôles d'équipe terrain → /equipe,
  // sinon dashboard vendeur. Le rôle est porté par app_metadata.user_role
  // (raw_app_meta_data, migration 006).
  const role = (data.user?.app_metadata as Record<string, unknown> | undefined)?.user_role;
  redirect(homeRouteFor(role));
}

export async function logout() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect('/');
}
