'use server';

import { revalidatePath } from 'next/cache';
import { getAdminProvider } from '@/lib/admin/provider';
import type { InvoiceRecipientType } from '@/lib/admin/types';
import { createServiceInvoice, fcfaToEurCents } from '@/lib/stripe';

export type CreateInvoiceState =
  | {
      error?: string;
      ok?: boolean;
      recipientName?: string;
      number?: string | null;
      hostedInvoiceUrl?: string | null;
      invoicePdf?: string | null;
    }
  | null;

const RECIPIENT_TYPES: InvoiceRecipientType[] = ['seller', 'mustaf', 'employee', 'other'];

/**
 * Émet une facture Stripe (lien à régler) pour un service dû à Litug — vendeur
 * Sara, client Mustaf, employé, ou destinataire libre.
 *
 * Mode TEST uniquement (CLAUDE.md §12) : aucune facture réelle n'est encaissée.
 * Facturation en EUR (le XOF n'est pas débitable) à partir d'un montant FCFA,
 * qui reste la source de vérité. L'action est tracée dans le journal d'audit via
 * `recordInvoice`.
 */
export async function createInvoiceAction(
  _prev: CreateInvoiceState,
  formData: FormData,
): Promise<CreateInvoiceState> {
  const recipientType = ((formData.get('recipientType') as string) ?? '') as InvoiceRecipientType;
  const subjectId = ((formData.get('subjectId') as string) ?? '').trim() || undefined;
  const recipientName = ((formData.get('recipientName') as string) ?? '').trim();
  const recipientEmail = ((formData.get('recipientEmail') as string) ?? '').trim().toLowerCase();
  const description = ((formData.get('description') as string) ?? '').trim();
  const amountRaw = ((formData.get('amount') as string) ?? '').replace(/\s/g, '');
  const amount = Number.parseInt(amountRaw, 10);

  // --- Validation ---
  if (!RECIPIENT_TYPES.includes(recipientType)) return { error: 'Choisis un type de destinataire.' };
  if (!recipientName) return { error: 'Indique le nom du destinataire.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) return { error: 'Adresse email du destinataire invalide.' };
  if (!description) return { error: 'Indique le service facturé.' };
  if (!Number.isFinite(amount) || amount <= 0) return { error: 'Indique un montant en FCFA supérieur à 0.' };

  // --- Création de la facture Stripe (mode test, EUR) ---
  let invoice;
  try {
    invoice = await createServiceInvoice({
      email: recipientEmail,
      name: recipientName,
      amountCents: fcfaToEurCents(amount),
      description,
      metadata: {
        litug_product: 'service_invoice',
        recipient_type: recipientType,
        subject_id: subjectId ?? '',
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'inconnue';
    return { error: 'Facturation indisponible pour le moment : ' + msg };
  }

  // --- Enregistrement interne + audit ---
  await getAdminProvider().recordInvoice({
    recipientType,
    recipientName,
    recipientEmail,
    subjectId,
    description,
    amount,
    stripeInvoiceId: invoice.id,
    stripeNumber: invoice.number,
    hostedInvoiceUrl: invoice.hostedInvoiceUrl,
    invoicePdf: invoice.invoicePdf,
  });

  revalidatePath('/admin/factures');

  return {
    ok: true,
    recipientName,
    number: invoice.number,
    hostedInvoiceUrl: invoice.hostedInvoiceUrl,
    invoicePdf: invoice.invoicePdf,
  };
}
