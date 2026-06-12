import 'server-only';
import Stripe from 'stripe';

/**
 * Client Stripe — SERVEUR UNIQUEMENT (CLAUDE.md §4).
 *
 * Mode TEST exclusivement pour l'instant : la clé `sk_test_…` ne déplace aucun
 * argent réel (CLAUDE.md §12 — pas de banque réelle avant validation légale).
 * Le `import 'server-only'` fait échouer le build si ce module fuit côté client.
 *
 * On ne fixe pas `apiVersion` : on laisse la version épinglée par le SDK, pour
 * que les types TypeScript et l'API restent alignés sans maintenance.
 */
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      'Configuration manquante : STRIPE_SECRET_KEY doit être défini dans .env.local ' +
        'pour créer une session de paiement Stripe.',
    );
  }
  _stripe = new Stripe(key);
  return _stripe;
}

/** Taux fixe FCFA → EUR (identique à lib/utils.formatEur). */
const FCFA_PER_EUR = 655.957;

/** Convertit un montant FCFA en centimes d'euro (Stripe raisonne en plus petite unité). */
export function fcfaToEurCents(fcfa: number): number {
  return Math.round((fcfa / FCFA_PER_EUR) * 100);
}

interface CheckoutArgs {
  /** Email pré-rempli sur la page Stripe (et utilisé pour le reçu). */
  email: string;
  /** Montant à débiter, en centimes d'euro. */
  amountCents: number;
  /** Libellé du produit affiché sur la page Stripe et le reçu. */
  productName: string;
  /** URL absolue de retour après paiement réussi (sans le param session_id). */
  successUrl: string;
  /** URL absolue de retour si le client annule. */
  cancelUrl: string;
  /**
   * Métadonnées rattachées à la session — au minimum `supabase_user_id` pour que
   * le webhook retrouve le compte et le passe en `paid`.
   */
  metadata: Record<string, string>;
}

/**
 * Crée une Stripe Checkout Session (page de paiement hébergée par Stripe) et
 * renvoie son URL. On NE passe PAS `payment_method_types` (best practice Stripe) :
 * les moyens de paiement éligibles sont gérés dynamiquement depuis le Dashboard.
 */
export async function createCheckoutSession(args: CheckoutArgs): Promise<string> {
  const stripe = getStripe();
  const sep = args.successUrl.includes('?') ? '&' : '?';

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: args.email,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'eur',
          unit_amount: args.amountCents,
          product_data: { name: args.productName },
        },
      },
    ],
    // Stripe remplace {CHECKOUT_SESSION_ID} par l'id réel au retour.
    success_url: `${args.successUrl}${sep}paid=1&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: args.cancelUrl,
    metadata: args.metadata,
    payment_intent_data: { metadata: args.metadata },
  });

  if (!session.url) {
    throw new Error('Stripe n’a pas renvoyé d’URL de paiement.');
  }
  return session.url;
}

interface InvoiceArgs {
  /** Email du destinataire — Stripe y rattache la facture et le reçu. */
  email: string;
  /** Nom affiché sur la facture (vendeur, client, employé…). */
  name: string;
  /** Montant à facturer, en centimes d'euro. */
  amountCents: number;
  /** Libellé de la ligne facturée (le service dû). */
  description: string;
  /** Délai de paiement en jours (facture « à régler »). */
  daysUntilDue?: number;
  /** Métadonnées rattachées (type de destinataire, id interne…). */
  metadata: Record<string, string>;
}

export interface HostedInvoice {
  id: string;
  /** Numéro lisible attribué par Stripe (ex. « ABCD-0001 »). */
  number: string | null;
  /** Page de paiement hébergée par Stripe — le lien à envoyer au client. */
  hostedInvoiceUrl: string | null;
  /** PDF de la facture. */
  invoicePdf: string | null;
}

/**
 * Crée une facture Stripe hébergée (API Invoices) et la finalise, pour que
 * `hosted_invoice_url` (le lien à envoyer) et le PDF soient disponibles.
 *
 * `collection_method: 'send_invoice'` ⇒ facture « à régler » (le client paie via
 * le lien), sans débit immédiat. Mode TEST uniquement (CLAUDE.md §12) ; la
 * facturation est en EUR car le XOF n'est pas débitable. On NE passe PAS
 * `payment_method_types` (best practice Stripe : moyens de paiement dynamiques).
 */
export async function createServiceInvoice(args: InvoiceArgs): Promise<HostedInvoice> {
  const stripe = getStripe();

  // 1) Client Stripe (un par email — Stripe déduplique côté facture/reçu).
  const customer = await stripe.customers.create({ email: args.email, name: args.name });

  // 2) Facture vide rattachée au client (brouillon).
  const draft = await stripe.invoices.create({
    customer: customer.id,
    collection_method: 'send_invoice',
    days_until_due: args.daysUntilDue ?? 30,
    currency: 'eur',
    description: args.description,
    metadata: args.metadata,
    auto_advance: false,
  });

  // 3) Ligne facturée, attachée explicitement à CETTE facture.
  await stripe.invoiceItems.create({
    customer: customer.id,
    invoice: draft.id,
    amount: args.amountCents,
    currency: 'eur',
    description: args.description,
    metadata: args.metadata,
  });

  // 4) Finalisation ⇒ la facture devient « open » et expose le lien + le PDF.
  const invoice = await stripe.invoices.finalizeInvoice(draft.id);

  return {
    id: invoice.id,
    number: invoice.number ?? null,
    hostedInvoiceUrl: invoice.hosted_invoice_url ?? null,
    invoicePdf: invoice.invoice_pdf ?? null,
  };
}
