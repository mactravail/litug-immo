import { createSupabaseServerClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const type = searchParams.get('type');

  if (code) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  if (type === 'recovery') {
    return NextResponse.redirect(`${origin}/reset-password`);
  }

  // Invitation d'un employé (créée depuis /admin) → il choisit son mot de passe.
  if (type === 'invite') {
    return NextResponse.redirect(`${origin}/bienvenue`);
  }

  // Activation d'un compte vendeur après paiement : le lien de l'email d'activation
  // porte ?next=/login?active=1 → on l'envoie vers la connexion (chemin interne sûr).
  const next = searchParams.get('next');
  if (next && next.startsWith('/')) {
    return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}/`);
}
