'use server';

import { revalidatePath } from 'next/cache';
import { getMustafProvider } from '@/lib/mustaf/provider';

export type RechargeState =
  | { ok: true; name: string; amount: number }
  | { error: string }
  | null;

/**
 * Recharge simulée du compte séquestre par Wave (mustaf.md §4/§12 — aucun
 * encaissement réel). Le client saisit le nom du contributeur et le montant,
 * scanne le QR Wave, puis confirme : une DEMANDE EN ATTENTE est créée et envoyée
 * à l'admin. Le solde NE bouge PAS tant que l'admin n'a pas validé le virement
 * reçu (§3.4 — l'argent ne bouge qu'après contrôle humain).
 */
export async function rechargeAccount(
  _prev: RechargeState,
  formData: FormData
): Promise<RechargeState> {
  const name = String(formData.get('name') ?? '').trim();
  const confirmed = formData.get('confirmed') === 'on';

  // Le montant peut être saisi avec des espaces (« 50 000 ») — on ne garde que les chiffres.
  const rawAmount = String(formData.get('amount') ?? '').replace(/[^\d]/g, '');
  const amount = Number(rawAmount);

  if (!name) {
    return { error: 'Indiquez le nom de la personne qui recharge.' };
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: 'Indiquez un montant valide (en FCFA).' };
  }
  if (amount < 1000) {
    return { error: 'Le montant minimum est de 1 000 FCFA.' };
  }
  if (!confirmed) {
    return { error: 'Confirmez d’abord avoir envoyé le paiement via Wave.' };
  }

  await getMustafProvider().requestRecharge({ contributorName: name, amount });

  // La demande apparaît dans la file d'attente (épargne client + dashboard admin).
  // Le solde, lui, ne changera qu'après validation admin.
  revalidatePath('/projet/epargne');
  revalidatePath('/admin');

  return { ok: true, name, amount };
}
