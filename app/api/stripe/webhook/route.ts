import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';

/**
 * Webhook Stripe — source de vérité du paiement.
 *
 * Quand une Checkout Session est payée (`checkout.session.completed`), Stripe
 * appelle cette route. On vérifie la signature puis on passe le compte Supabase
 * correspondant en `payment_status: 'paid'`. L'admin garde la validation finale
 * (CLAUDE.md §5) : ce flag dit seulement « le paiement test a bien abouti ».
 *
 * Mode TEST uniquement (CLAUDE.md §12). Si STRIPE_WEBHOOK_SECRET n'est pas encore
 * configuré, on ne fait rien (la page de retour assure déjà la confirmation UX).
 */
export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.warn('[stripe] STRIPE_WEBHOOK_SECRET absent — webhook ignoré.');
    return NextResponse.json({ received: true, skipped: 'no_secret' });
  }

  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Signature manquante.' }, { status: 400 });
  }

  // Corps BRUT obligatoire pour vérifier la signature.
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, secret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'inconnue';
    console.error('[stripe] signature invalide :', msg);
    return NextResponse.json({ error: 'Signature invalide.' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.supabase_user_id;

    if (userId && session.payment_status === 'paid') {
      try {
        const admin = createSupabaseAdminClient();
        // Fusion manuelle pour ne pas écraser les autres métadonnées du compte.
        const { data } = await admin.auth.admin.getUserById(userId);
        const current = data.user?.user_metadata ?? {};
        await admin.auth.admin.updateUserById(userId, {
          user_metadata: {
            ...current,
            payment_status: 'paid',
            paid_at: new Date().toISOString(),
            stripe_session_id: session.id,
            amount_total: session.amount_total,
            currency: session.currency,
          },
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'inconnue';
        console.error('[stripe] échec mise à jour compte :', msg);
        // 500 → Stripe réessaiera la livraison du webhook.
        return NextResponse.json({ error: 'maj compte' }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
