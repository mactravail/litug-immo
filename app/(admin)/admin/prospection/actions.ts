'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { getAdminProvider } from '@/lib/admin/provider';

export async function markProspectionSeen() {
  const jar = await cookies();
  jar.set('prospection_last_seen', new Date().toISOString(), {
    httpOnly: true,
    path: '/admin',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  });
}

export type SendTransferState = { error?: string; ok?: boolean } | null;

export async function sendTransferAction(_prev: SendTransferState, formData: FormData): Promise<SendTransferState> {
  try {
    const prospectorId   = (formData.get('prospectorId') as string)?.trim();
    const prospectorName = (formData.get('prospectorName') as string)?.trim();
    const amount         = Number(formData.get('amount'));
    const motif          = (formData.get('motif') as string)?.trim();

    if (!prospectorId) return { error: 'Prospecteur manquant.' };
    if (!Number.isFinite(amount) || amount <= 0) return { error: 'Montant invalide.' };
    if (!motif) return { error: 'Indique le motif du virement.' };

    await getAdminProvider().sendTransferToProspector({ prospectorId, prospectorName, amount, motif });

    revalidatePath('/admin/prospection');
    revalidatePath('/equipe/mon-compte');
    revalidatePath('/admin/audit');
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Envoi impossible.' };
  }
}
