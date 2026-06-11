'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import {
  startTask, endTask, addReceipt, submitReport, raiseIncident,
  addInvoice, addChantierMedia,
} from '@/lib/employe/provider';
import { getCurrentWorkerId, WORKER_COOKIE, TEAM_ROLES } from '@/lib/employe/current';
import { SEED_TEAM } from '@/lib/admin/seed';
import type { TaskPriority } from '@/lib/admin/types';
import type { ExpenseCategory, MediaType } from '@/lib/mustaf/types';

export type ActionState = { error?: string; ok?: boolean } | null;

/** Un rendu-compte / incident écrit ici doit rafraîchir l'espace employé ET l'admin. */
function revalidateBothDoors(taskId?: string) {
  revalidatePath('/equipe');
  revalidatePath('/equipe/portefeuille');
  revalidatePath('/equipe/redditions');
  if (taskId) {
    revalidatePath(`/equipe/taches/${taskId}`);
    revalidatePath(`/equipe/taches/${taskId}/rendu`);
  }
  // Côté admin — même données, autre porte (§3.4).
  revalidatePath('/admin');
  revalidatePath('/admin/redditions');
  revalidatePath('/admin/problemes');
  revalidatePath('/admin/employes');
  revalidatePath('/admin/taches');
  revalidatePath('/admin/audit');
  // Espace client (dépenses / chantier) pour les actions métier.
  revalidatePath('/projet/depenses');
  revalidatePath('/projet/chantier');
}

/* --- Sélecteur de démo (mock-first) : changer d'employé connecté --- */
export async function setWorker(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const id = formData.get('workerId') as string;
  const valid = SEED_TEAM.some(t => t.id === id && (TEAM_ROLES as readonly string[]).includes(t.role));
  if (!valid) return { error: 'Employé invalide.' };
  (await cookies()).set(WORKER_COOKIE, id, { path: '/', httpOnly: false, sameSite: 'lax' });
  revalidatePath('/equipe', 'layout');
  return { ok: true };
}

/* --- Pointage --- */
export async function startTaskAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const taskId = formData.get('taskId') as string;
    startTask(await getCurrentWorkerId(), taskId);
    revalidateBothDoors(taskId);
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Action impossible.' };
  }
}

export async function endTaskAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const taskId = formData.get('taskId') as string;
    endTask(await getCurrentWorkerId(), taskId, (formData.get('summary') as string)?.trim() || undefined);
    revalidateBothDoors(taskId);
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Action impossible.' };
  }
}

/* --- Reçus --- */
export async function addReceiptAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const label = (formData.get('label') as string)?.trim();
    const amount = Number(formData.get('amount'));
    if (!label) return { error: 'Libellé requis.' };
    if (!Number.isFinite(amount) || amount <= 0) return { error: 'Montant invalide.' };
    addReceipt(await getCurrentWorkerId(), formData.get('advanceId') as string, { label, amount });
    revalidateBothDoors(formData.get('taskId') as string);
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Ajout impossible.' };
  }
}

/* --- Rendu-compte --- */
export async function submitReportAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const taskId = formData.get('taskId') as string;
    const workDone = (formData.get('workDone') as string)?.trim();
    if (!workDone) return { error: 'Décris ce qui a été fait.' };
    submitReport(await getCurrentWorkerId(), taskId, {
      workDone,
      workRemaining: (formData.get('workRemaining') as string)?.trim() || undefined,
      amountReturned: Number(formData.get('amountReturned')) || 0,
    });
    revalidateBothDoors(taskId);
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Envoi impossible.' };
  }
}

/* --- Incident --- */
export async function raiseIncidentAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const description = (formData.get('description') as string)?.trim();
    if (!description) return { error: 'Décris le problème.' };
    const lat = formData.get('lat') ? Number(formData.get('lat')) : undefined;
    const lng = formData.get('lng') ? Number(formData.get('lng')) : undefined;
    const geo = lat != null && lng != null && Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : undefined;
    raiseIncident(await getCurrentWorkerId(), {
      description,
      location: (formData.get('location') as string)?.trim() || undefined,
      geo,
      priority: (formData.get('priority') as TaskPriority) || 'medium',
      reportId: (formData.get('reportId') as string) || undefined,
    });
    revalidateBothDoors(formData.get('taskId') as string || undefined);
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Signalement impossible.' };
  }
}

/* --- Actions métier (selon rôle) --- */
export async function addInvoiceAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const label = (formData.get('label') as string)?.trim();
    const amount = Number(formData.get('amount'));
    if (!label) return { error: 'Libellé requis.' };
    if (!Number.isFinite(amount) || amount <= 0) return { error: 'Montant invalide.' };
    addInvoice(await getCurrentWorkerId(), {
      phaseId: formData.get('phaseId') as string,
      category: (formData.get('category') as ExpenseCategory) || 'materials',
      label, amount,
      supplierName: (formData.get('supplierName') as string)?.trim() || undefined,
    });
    revalidateBothDoors();
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Ajout impossible.' };
  }
}

export async function addMediaAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const lat = formData.get('lat') ? Number(formData.get('lat')) : undefined;
    const lng = formData.get('lng') ? Number(formData.get('lng')) : undefined;
    const capturedAt = (formData.get('capturedAt') as string) || undefined;
    const geo = lat != null && lng != null && Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : undefined;
    addChantierMedia(await getCurrentWorkerId(), {
      phaseId: formData.get('phaseId') as string,
      type: (formData.get('type') as MediaType) || 'photo',
      caption: (formData.get('caption') as string)?.trim() || undefined,
      capturedAt, geo,
    });
    revalidateBothDoors();
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Ajout impossible.' };
  }
}
