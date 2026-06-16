'use server';

import { headers } from 'next/headers';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { createCheckoutSession, fcfaToEurCents } from '@/lib/stripe';
import { isPlanId, isPeriodId, getTotal, PERIODS, type PlanId, type PeriodId } from '../plans';

export type CheckoutState =
  | { error?: string; ok?: boolean; email?: string; name?: string; checkoutUrl?: string }
  | null;

const PAYMENT_METHODS = ['wave', 'mastercard', 'paypal', 'stripe'] as const;
type PaymentMethod = (typeof PAYMENT_METHODS)[number];
const CARD_METHODS: PaymentMethod[] = ['mastercard', 'stripe'];

/**
 * Finalise l'abonnement Sara.
 * Le total est calculé côté serveur à partir du plan + période — jamais depuis le client.
 */
export async function submitCheckout(
  _prev: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const name     = ((formData.get('name')     as string) ?? '').trim();
  const business = ((formData.get('business') as string) ?? '').trim();
  const phone    = ((formData.get('phone')    as string) ?? '').trim();
  const email    = ((formData.get('email')    as string) ?? '').trim().toLowerCase();
  const password = (formData.get('password')  as string) ?? '';
  const confirm  = (formData.get('confirm')   as string) ?? '';
  const captcha  = formData.get('captcha');
  const method   = ((formData.get('method')   as string) ?? 'wave') as PaymentMethod;
  const tx       = ((formData.get('tx')       as string) ?? '').trim();
  const rawPlan  = formData.get('plan')   as string;
  const rawPeriod = formData.get('period') as string;

  // --- Validation de base ---
  if (!name)     return { error: 'Indique ton nom complet.' };
  if (!business) return { error: "Indique le nom de ton activité." };
  if (!phone)    return { error: 'Indique ton numéro WhatsApp.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Adresse email invalide.' };
  if (password.length < 8) return { error: 'Le mot de passe doit faire au moins 8 caractères.' };
  if (password !== confirm) return { error: 'Les deux mots de passe ne correspondent pas.' };
  if (captcha !== 'on') return { error: "Confirme que tu n'es pas un robot." };
  if (!PAYMENT_METHODS.includes(method)) return { error: 'Choisis un moyen de paiement.' };
  if (method === 'wave' && !tx) return { error: 'Colle ton numéro de transaction Wave.' };

  // --- Plan & période (validés côté serveur) ---
  const plan: PlanId     = isPlanId(rawPlan)     ? rawPlan   : 'essai';
  const period: PeriodId = isPeriodId(rawPeriod) ? rawPeriod : 'mensuel';
  const totalFcfa = getTotal(plan, period);

  const productName =
    plan === 'essai'
      ? 'Sara — mise en service (essai)'
      : `Sara — mise en service + ${PERIODS[period].label} d'abonnement`;

  // --- Origine pour le lien d'activation ---
  const h = await headers();
  const host  = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000';
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
        sara_plan: plan,
        sara_period: plan === 'pro' ? period : null,
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
        amountCents: fcfaToEurCents(totalFcfa),
        productName,
        successUrl: `${origin}/sara/paiement?paid=1`,
        cancelUrl:  `${origin}/sara/paiement?canceled=1&plan=${plan}&period=${period}`,
        metadata: {
          supabase_user_id: data.user?.id ?? '',
          product: 'sara_subscription',
          sara_plan: plan,
          sara_period: period,
          full_name: name,
        },
      });
      return { checkoutUrl };
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'inconnue';
      return { error: 'Paiement indisponible pour le moment : ' + msg };
    }
  }

  // --- Notifier Litug (best effort) ---
  try {
    await fetch(`${origin}/api/notify-checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name, business, phone, email,
        plan, period,
        tx: method === 'wave' ? tx : `paiement ${method} (simulé)`,
      }),
    });
  } catch {
    // pas de blocage si la notification échoue
  }

  return { ok: true, email, name };
}
