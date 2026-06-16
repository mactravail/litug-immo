'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import {
  startTask, endTask, addReceipt, submitReport, raiseIncident,
  addInvoice, addChantierMedia, createProspect, sendProspectsToSupervisor,
  logWorkDay, confirmTransfer, denyTransfer,
} from '@/lib/employe/provider';
import { getCurrentWorkerId, getCurrentProspectorId, getRealProspectorId, WORKER_COOKIE, TEAM_ROLES } from '@/lib/employe/current';
import { dbCreateProspect, dbSendToSupervisor, dbLogWorkDay, dbConfirmTransfer, dbDenyTransfer } from '@/lib/employe/prospection-db';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { SEED_TEAM } from '@/lib/admin/seed';
import type { TaskPriority, ProspectNetwork, ProspectContactMethod, ProspectOutcome } from '@/lib/admin/types';
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

/* --- Prospection commerciale --- */
export async function createProspectAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const companyName = (formData.get('companyName') as string)?.trim();
    if (!companyName) return { error: "Indique le nom de l'entreprise prospectée." };
    const outcome = (formData.get('outcome') as ProspectOutcome) || 'to_contact';
    const answered = outcome === 'interested' || outcome === 'refused';
    const contactMethod = (formData.get('contactMethod') as ProspectContactMethod) || undefined;
    if (answered && !contactMethod) return { error: 'Indique comment le contact a eu lieu.' };
    const followersRaw = formData.get('followers');
    const followers = followersRaw != null && String(followersRaw).trim() !== '' ? Number(followersRaw) : undefined;

    const input = {
      companyName,
      contactName:   (formData.get('contactName') as string)?.trim()  || undefined,
      contactPhone:  (formData.get('contactPhone') as string)?.trim() || undefined,
      followers,
      network:       (formData.get('network') as ProspectNetwork) || 'other',
      outcome,
      contactMethod,
      concern:       (formData.get('concern') as string)?.trim()  || undefined,
      notes:         (formData.get('notes') as string)?.trim()    || undefined,
      prospectedAt:  (formData.get('prospectedAt') as string)     || undefined,
    };

    const realId = await getRealProspectorId();
    if (realId) {
      const supabase = await createSupabaseServerClient();
      await dbCreateProspect(supabase, realId, input);
    } else {
      createProspect(await getCurrentProspectorId(), input);
    }

    revalidatePath('/equipe/prospection');
    revalidatePath('/equipe', 'layout');
    revalidatePath('/admin/prospection');
    revalidatePath('/admin/audit');
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Enregistrement impossible." };
  }
}

/* --- Journée de travail (pointage prospecteur) --- */
export async function logWorkDayAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const workDate = (formData.get('workDate') as string)?.trim();
    if (!workDate) return { error: 'Indique la date du jour travaillé.' };
    const hours = Number(formData.get('hours'));
    if (!Number.isFinite(hours) || hours <= 0) return { error: "Indique un nombre d'heures valide." };
    const input = { workDate, hours, note: (formData.get('note') as string)?.trim() || undefined };

    const realId = await getRealProspectorId();
    if (realId) {
      const supabase = await createSupabaseServerClient();
      await dbLogWorkDay(supabase, realId, input);
    } else {
      logWorkDay(await getCurrentProspectorId(), input);
    }

    revalidatePath('/equipe/journees');
    revalidatePath('/equipe/prospection');
    revalidatePath('/admin/prospection');
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Enregistrement impossible." };
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- signature imposée par useActionState ; aucun champ requis pour l'envoi.
export async function sendProspectsAction(_prev: ActionState, _formData: FormData): Promise<ActionState> {
  try {
    const realId = await getRealProspectorId();
    if (realId) {
      const supabase = await createSupabaseServerClient();
      await dbSendToSupervisor(supabase, realId);
    } else {
      sendProspectsToSupervisor(await getCurrentProspectorId());
    }
    revalidatePath('/equipe/prospection');
    revalidatePath('/equipe', 'layout');
    revalidatePath('/admin/prospection');
    revalidatePath('/admin/audit');
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Envoi impossible.' };
  }
}

/* --- Virements admin → prospecteur : confirmation de réception --- */

export async function confirmTransferAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const transferId = formData.get('transferId') as string;
    const realId = await getRealProspectorId();
    if (realId) {
      const supabase = await createSupabaseServerClient();
      await dbConfirmTransfer(supabase, transferId);
    } else {
      const workerId = await getCurrentProspectorId();
      confirmTransfer(workerId, transferId);
    }
    revalidatePath('/equipe/mon-compte');
    revalidatePath('/admin/prospection');
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Action impossible.' };
  }
}

export async function denyTransferAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const transferId = formData.get('transferId') as string;
    const reason = (formData.get('reason') as string)?.trim() || undefined;
    const realId = await getRealProspectorId();
    if (realId) {
      const supabase = await createSupabaseServerClient();
      await dbDenyTransfer(supabase, transferId, reason);
    } else {
      const workerId = await getCurrentProspectorId();
      denyTransfer(workerId, transferId, reason);
    }
    revalidatePath('/equipe/mon-compte');
    revalidatePath('/admin/prospection');
    revalidatePath('/admin/audit');
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Action impossible.' };
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
