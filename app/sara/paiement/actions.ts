'use server';

import { headers } from 'next/headers';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { createCheckoutSession, fcfaToEurCents } from '@/lib/stripe';

export type CheckoutState =
  | { error?: string; ok?: boolean; email?: string; name?: string; checkoutUrl?: string }
  | null;

const METHODS = ['wave', 'mastercard', 'paypal', 'stripe'] as const;
type PaymentMethod = (typeof METHODS)[number];

// Moyens réglés par carte → passent par Stripe Checkout (mode test).
const CARD_METHODS: PaymentMethod[] = ['mastercard', 'stripe'];

// Total Sara à payer aujourd'hui : mise en service (100 000) + 1er mois (50 000).
const SARA_TOTAL_FCFA = 150_000;

/**
 * Finalise l'abonnement Sara depuis la page de paiement.
 *
 * Le paiement carte/PayPal/Stripe est SIMULÉ (CLAUDE.md §12 : pas de banque réelle
 * tant que le volet légal n'est pas validé). Aucune donnée carte ne transite par le
 * serveur — seul le moyen choisi est enregistré. Wave reste le canal réel (numéro de
 * transaction à contrôler).
 *
 * Effet : on crée le compte vendeur (signUp) avec le flag `pending_verification`
 * (le vendeur pourra se connecter mais rien publier avant notre contrôle), et
 * Supabase envoie l'email d'activation. Le lien de cet email ramène vers /login.
 */
export async function submitCheckout(
  _prev: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const name = ((formData.get('name') as string) ?? '').trim();
  const business = ((formData.get('business') as string) ?? '').trim();
  const phone = ((formData.get('phone') as string) ?? '').trim();
  const email = ((formData.get('email') as string) ?? '').trim().toLowerCase();
  const password = (formData.get('password') as string) ?? '';
  const confirm = (formData.get('confirm') as string) ?? '';
  const captcha = formData.get('captcha');
  const method = ((formData.get('method') as string) ?? 'wave') as PaymentMethod;
  const tx = ((formData.get('tx') as string) ?? '').trim();

  // --- Validation ---
  if (!name) return { error: 'Indique ton nom complet.' };
  if (!business) return { error: "Indique le nom de ton activité." };
  if (!phone) return { error: 'Indique ton numéro WhatsApp.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Adresse email invalide.' };
  if (password.length < 8) return { error: 'Le mot de passe doit faire au moins 8 caractères.' };
  if (password !== confirm) return { error: 'Les deux mots de passe ne correspondent pas.' };
  if (captcha !== 'on') return { error: "Confirme que tu n'es pas un robot." };
  if (!METHODS.includes(method)) return { error: 'Choisis un moyen de paiement.' };
  if (method === 'wave' && !tx) return { error: 'Colle ton numéro de transaction Wave.' };

  // --- Origine (pour le lien d'activation de l'email) ---
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000';
  const proto = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https');
  const origin = `${proto}://${host}`;
  const next = encodeURIComponent('/login?active=1');

  // --- Création du compte vendeur en attente de validation ---
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
        business_name: business,
        phone,
        pending_verification: true,
        payment_method: method,
        payment_status: 'pending',
        wave_tx: method === 'wave' ? tx : null,
      },
      emailRedirectTo: `${origin}/auth/callback?next=${next}`,
    },
  });

  if (error) {
    if (/already.*registered|exist|duplicate/i.test(error.message)) {
      return { error: 'Un compte existe déjà avec cet email. Connecte-toi simplement.' };
    }
    return { error: 'Création du compte impossible : ' + error.message };
  }

  // --- Paiement carte → Stripe Checkout (mode test, EUR) ---
  if (CARD_METHODS.includes(method)) {
    try {
      const checkoutUrl = await createCheckoutSession({
        email,
        amountCents: fcfaToEurCents(SARA_TOTAL_FCFA),
        productName: 'Abonnement Sara — mise en service + 1er mois',
        successUrl: `${origin}/sara/paiement`,
        cancelUrl: `${origin}/sara/paiement?canceled=1`,
        metadata: {
          supabase_user_id: data.user?.id ?? '',
          product: 'sara_subscription',
          full_name: name,
        },
      });
      return { checkoutUrl };
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'inconnue';
      return { error: 'Paiement indisponible pour le moment : ' + msg };
    }
  }

  // --- Notifier Litug (best effort, ne bloque jamais la confirmation) ---
  try {
    await fetch(`${origin}/api/notify-checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        business,
        phone,
        email,
        tx: method === 'wave' ? tx : `paiement ${method} (simulé)`,
      }),
    });
  } catch {
    // pas de blocage si le SMS échoue
  }

  return { ok: true, email, name };
}
