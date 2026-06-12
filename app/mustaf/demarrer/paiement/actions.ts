'use server';

import { headers } from 'next/headers';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { createCheckoutSession, fcfaToEurCents } from '@/lib/stripe';
import { PHASE_ZERO_FEE } from '../../offers';

export type SelfBuildState =
  | { error?: string; ok?: boolean; email?: string; name?: string; checkoutUrl?: string }
  | null;

// Accès dashboard sans Phase 0 : 10 € fixe (1000 centimes).
const DASHBOARD_FEE_CENTS = 1000;

/**
 * Inscription Mustaf « Phase 0 » : le client règle le forfait Phase 0 (plan, permis,
 * étude de sol). Comme Sara, il crée son accès (email + mot de passe) ; on crée son
 * compte client (`account_type = owner`, `pending_verification`), Supabase envoie
 * l'email d'activation dont le lien ramène vers /login. Paiement SIMULÉ (§12).
 */
export async function submitPhaseZero(
  _prev: SelfBuildState,
  formData: FormData,
): Promise<SelfBuildState> {
  const name = ((formData.get('name') as string) ?? '').trim();
  const phone = ((formData.get('phone') as string) ?? '').trim();
  const email = ((formData.get('email') as string) ?? '').trim().toLowerCase();
  const password = (formData.get('password') as string) ?? '';
  const confirm = (formData.get('confirm') as string) ?? '';
  const captcha = formData.get('captcha');
  const method = ((formData.get('method') as string) ?? 'card') as (typeof PHASE_ZERO_METHODS)[number];

  if (!name) return { error: 'Indique ton nom complet.' };
  if (!phone) return { error: 'Indique ton numéro WhatsApp.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Adresse email invalide.' };
  if (password.length < 8) return { error: 'Le mot de passe doit faire au moins 8 caractères.' };
  if (password !== confirm) return { error: 'Les deux mots de passe ne correspondent pas.' };
  if (captcha !== 'on') return { error: "Confirme que tu n'es pas un robot." };
  if (!PHASE_ZERO_METHODS.includes(method)) return { error: 'Choisis un moyen de paiement.' };

  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000';
  const proto = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https');
  const origin = `${proto}://${host}`;
  const next = encodeURIComponent('/login?active=1');

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
        phone,
        account_type: 'owner',
        pending_verification: true,
        payment_method: method,
        payment_status: 'pending',
        skip_phase_zero: false,
        phase_zero: true,
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
  if (method === 'card') {
    try {
      const checkoutUrl = await createCheckoutSession({
        email,
        amountCents: fcfaToEurCents(PHASE_ZERO_FEE),
        productName: 'Mustaf — Forfait Phase 0 (plan, permis, étude de sol)',
        successUrl: `${origin}/mustaf/demarrer/paiement`,
        cancelUrl: `${origin}/mustaf/demarrer/paiement?canceled=1`,
        metadata: {
          supabase_user_id: data.user?.id ?? '',
          product: 'mustaf_phase_zero',
          full_name: name,
        },
      });
      return { checkoutUrl };
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'inconnue';
      return { error: 'Paiement indisponible pour le moment : ' + msg };
    }
  }

  try {
    await fetch(`${origin}/api/notify-checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        business: 'Mustaf — Phase 0',
        phone,
        email,
        tx: `forfait Phase 0 (${method}, simulé)`,
      }),
    });
  } catch {
    // pas de blocage si le SMS échoue
  }

  return { ok: true, email, name };
}

const METHODS = ['mastercard', 'paypal', 'stripe'] as const;
type PaymentMethod = (typeof METHODS)[number];

const PHASE_ZERO_METHODS = ['card', 'paypal', 'mobile'] as const;

const STAGES = ['plans', 'permis', 'fondation', 'elevation', 'autre'] as const;

/**
 * Inscription Mustaf « j'ai déjà mes plans / permis (voire ma fondation) ».
 *
 * Le client n'a pas besoin de la Phase 0 : il règle seulement l'accès au tableau
 * de bord (~10 €, paiement SIMULÉ — CLAUDE.md §12) et nous explique pourquoi, et
 * où en sont ses travaux. On crée son compte client (`account_type = owner`) avec
 * le flag `pending_verification` ; Supabase envoie l'email d'activation, dont le
 * lien ramène vers /login. Après connexion il atterrit sur son dashboard /projet.
 */
export async function submitSelfBuild(
  _prev: SelfBuildState,
  formData: FormData,
): Promise<SelfBuildState> {
  const name = ((formData.get('name') as string) ?? '').trim();
  const phone = ((formData.get('phone') as string) ?? '').trim();
  const email = ((formData.get('email') as string) ?? '').trim().toLowerCase();
  const password = (formData.get('password') as string) ?? '';
  const confirm = (formData.get('confirm') as string) ?? '';
  const captcha = formData.get('captcha');
  const method = ((formData.get('method') as string) ?? 'mastercard') as PaymentMethod;
  const reason = ((formData.get('reason') as string) ?? '').trim();
  const started = formData.get('started') === 'on';
  const stage = ((formData.get('stage') as string) ?? '') as (typeof STAGES)[number];
  const stageDetail = ((formData.get('stage_detail') as string) ?? '').trim();

  // --- Validation ---
  if (!name) return { error: 'Indique ton nom complet.' };
  if (!phone) return { error: 'Indique ton numéro WhatsApp.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Adresse email invalide.' };
  if (password.length < 8) return { error: 'Le mot de passe doit faire au moins 8 caractères.' };
  if (password !== confirm) return { error: 'Les deux mots de passe ne correspondent pas.' };
  if (captcha !== 'on') return { error: "Confirme que tu n'es pas un robot." };
  if (!METHODS.includes(method)) return { error: 'Choisis un moyen de paiement.' };
  if (reason.length < 10) {
    return { error: 'Explique en quelques mots pourquoi tu n’as pas besoin de la Phase 0.' };
  }
  if (started && !STAGES.includes(stage)) {
    return { error: 'Indique où en sont tes travaux.' };
  }

  // --- Origine (lien d'activation de l'email) ---
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000';
  const proto = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https');
  const origin = `${proto}://${host}`;
  const next = encodeURIComponent('/login?active=1');

  // --- Création du compte client Mustaf en attente de validation ---
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
        phone,
        account_type: 'owner',
        pending_verification: true,
        payment_method: method,
        payment_status: 'pending',
        skip_phase_zero: true,
        no_phase_zero_reason: reason,
        works_started: started,
        works_stage: started ? stage : null,
        works_stage_detail: started ? stageDetail : null,
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

  // --- Paiement carte → Stripe Checkout (10 €, mode test) ---
  if (method === 'mastercard' || method === 'stripe') {
    try {
      const checkoutUrl = await createCheckoutSession({
        email,
        amountCents: DASHBOARD_FEE_CENTS,
        productName: 'Mustaf — Accès au tableau de bord',
        successUrl: `${origin}/mustaf/demarrer/paiement`,
        cancelUrl: `${origin}/mustaf/demarrer/paiement?canceled=1`,
        metadata: {
          supabase_user_id: data.user?.id ?? '',
          product: 'mustaf_dashboard_access',
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
        name,
        business: 'Mustaf — sans Phase 0',
        phone,
        email,
        tx: `accès dashboard (${method}, simulé) · ${started ? `travaux: ${stage}` : 'pas encore commencé'}`,
      }),
    });
  } catch {
    // pas de blocage si le SMS échoue
  }

  return { ok: true, email, name };
}
