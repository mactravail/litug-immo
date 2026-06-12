import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );
}

export async function getAuthenticatedSellerId(): Promise<string> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  return user.id;
}

export interface SellerAccount {
  id: string;
  /** Nom à afficher : nom complet saisi au paiement, sinon activité, sinon email. */
  displayName: string;
  email: string;
  /** Type de compte porté par user_metadata.account_type ('owner' = client Mustaf). */
  accountType?: string;
  /**
   * Compte créé via le paiement mais paiement pas encore validé par l'équipe Litug.
   * Tant que ce flag est vrai, le vendeur peut se connecter mais ne peut RIEN
   * publier (pas de terrain, pas de photo) — on doit d'abord contrôler le paiement.
   * Posé dans user_metadata au signUp ; levé manuellement par l'admin après contrôle.
   */
  pendingVerification: boolean;
}

/**
 * État du compte vendeur connecté, lu directement depuis l'auth Supabase
 * (indépendant du data provider mock/supabase) — sert au message de bienvenue
 * et au verrou « en attente de validation » du dashboard.
 */
export async function getSellerAccount(): Promise<SellerAccount> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const appMeta = (user.app_metadata ?? {}) as Record<string, unknown>;

  const displayName =
    (typeof meta.full_name === 'string' && meta.full_name.trim()) ||
    (typeof meta.business_name === 'string' && meta.business_name.trim()) ||
    user.email?.split('@')[0] ||
    'Vendeur';

  const pendingVerification =
    meta.pending_verification === true || appMeta.pending_verification === true;

  return {
    id: user.id,
    displayName: displayName as string,
    email: user.email ?? '',
    accountType: typeof meta.account_type === 'string' ? meta.account_type : undefined,
    pendingVerification,
  };
}

/**
 * Comme getSellerAccount, mais NE redirige PAS si l'utilisateur n'est pas connecté
 * (retourne null). Sert aux pages publiques/mock-first — ex. le dashboard Mustaf
 * `/projet` — pour afficher un message de bienvenue UNIQUEMENT si un client réel
 * est connecté, sans casser la démo publique anonyme.
 */
export async function getAccountOptional(): Promise<SellerAccount | null> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const appMeta = (user.app_metadata ?? {}) as Record<string, unknown>;
  const displayName =
    (typeof meta.full_name === 'string' && meta.full_name.trim()) ||
    (typeof meta.business_name === 'string' && meta.business_name.trim()) ||
    user.email?.split('@')[0] ||
    'Client';

  return {
    id: user.id,
    displayName: displayName as string,
    email: user.email ?? '',
    accountType: typeof meta.account_type === 'string' ? meta.account_type : undefined,
    pendingVerification:
      meta.pending_verification === true || appMeta.pending_verification === true,
  };
}
