'use server';

import { createSupabaseServerClient } from '@/lib/supabase-server';
import { homeRouteFor, effectiveRole } from '@/lib/auth/home-route';
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

  // Routage post-connexion par rôle : admin → /admin, équipe → /equipe,
  // client Mustaf (owner) → /projet, sinon dashboard vendeur. Le rôle vient
  // d'app_metadata.user_role, avec repli sur user_metadata.account_type (owner).
  redirect(homeRouteFor(effectiveRole(data.user)));
}

export async function logout() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect('/');
}
