'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { getAdminProvider, ADMIN_USER_ID } from '@/lib/admin/provider';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { sendAccountApproved } from '@/lib/email/send';
import type { SubscriptionStatus, TeamRole, TaskPriority } from '@/lib/admin/types';
import type { ExpenseCategory, PhaseStatus, MediaType, AnomalyStatus } from '@/lib/mustaf/types';

export type ActionState = { error?: string; ok?: boolean } | null;

/** Pages touched by a Mustaf write — refresh both the admin and the client read-space. */
function revalidateProject(projectId: string) {
  revalidatePath('/admin');
  revalidatePath(`/admin/mustaf/${projectId}`);
  revalidatePath('/admin/mustaf');
  revalidatePath('/admin/audit');
  // The client's Mustaf space shows the same data, different door (§3.4).
  revalidatePath('/projet');
  revalidatePath('/projet/depenses');
  revalidatePath('/projet/chantier');
  revalidatePath('/projet/epargne');
}

/* --- Subscriptions --- */

async function setSubStatus(id: string, status: SubscriptionStatus): Promise<ActionState> {
  try {
    await getAdminProvider().setSubscriptionStatus(id, status);
    revalidatePath('/admin');
    revalidatePath('/admin/vendeurs');
    revalidatePath('/admin/mustaf');
    revalidatePath('/admin/audit');
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Action impossible.' };
  }
}

export async function validateSubscription(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return setSubStatus(formData.get('id') as string, 'active');
}
export async function suspendSubscription(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return setSubStatus(formData.get('id') as string, 'suspended');
}
export async function revokeSubscription(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return setSubStatus(formData.get('id') as string, 'revoked');
}
/**
 * Valide la demande d'un compte en attente (vendeur Sara ou client Mustaf) après
 * contrôle du paiement : lève le flag `pending_verification` sur le VRAI compte auth
 * Supabase (les deux stores de métadonnées), ce qui débloque le dashboard du client
 * (publication pour un vendeur, accompagnement pour un client Mustaf). Action tracée.
 */
export async function validateAccountRequest(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const userId = (formData.get('id') as string) ?? '';
  if (!userId) return { error: 'Identifiant manquant.' };

  // Garde : seul un admin connecté peut valider (comme la création d'accès employé, §5).
  const supabase = await createSupabaseServerClient();
  const { data: { user: actor } } = await supabase.auth.getUser();
  const actorRole = (actor?.app_metadata as Record<string, unknown> | undefined)?.user_role;
  if (!actor || actorRole !== 'admin') {
    return { error: 'Action réservée à l’administrateur. Reconnectez-vous puis réessayez.' };
  }

  let admin;
  try {
    admin = createSupabaseAdminClient();
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Configuration serveur manquante.' };
  }

  try {
    const { data: target } = await admin.auth.admin.getUserById(userId);
    const um = (target?.user?.user_metadata ?? {}) as Record<string, unknown>;
    const apm = (target?.user?.app_metadata ?? {}) as Record<string, unknown>;

    const { error } = await admin.auth.admin.updateUserById(userId, {
      user_metadata: { ...um, pending_verification: false, verified_at: new Date().toISOString() },
      app_metadata: { ...apm, pending_verification: false },
    });
    if (error) return { error: 'Validation impossible : ' + error.message };

    // Journal d'audit (insert-only) — qui/quoi/quand.
    await admin.from('audit_log').insert({
      actor_id: actor.id,
      action: 'validate_account',
      target_type: 'user',
      target_id: userId,
      target_label: (um.full_name as string) || target?.user?.email || userId,
      metadata: { type: um.account_type === 'owner' ? 'owner' : 'seller' },
    });

    revalidatePath('/admin/demandes');
    revalidatePath('/admin');
    revalidatePath('/admin/audit');

    // Prévenir l'intéressé que son espace est ouvert (best-effort : un échec
    // d'email ne doit pas annuler la validation, déjà actée en base).
    const recipient = target?.user?.email;
    if (recipient) {
      const h = await headers();
      const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000';
      const proto = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https');
      await sendAccountApproved({
        to: recipient,
        name: (um.full_name as string) || (um.business_name as string) || recipient.split('@')[0],
        type: um.account_type === 'owner' ? 'owner' : 'seller',
        loginUrl: `${proto}://${host}/login`,
      });
    }

    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Validation impossible.' };
  }
}

export async function changeTier(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await getAdminProvider().changeSubscriptionTier(formData.get('id') as string, formData.get('tier') as string);
    revalidatePath('/admin/mustaf');
    revalidatePath('/admin/vendeurs');
    revalidatePath('/admin/audit');
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Action impossible.' };
  }
}

/* --- Mustaf field actions --- */

export async function addInvoice(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const projectId = formData.get('projectId') as string;
    const amount = Number(formData.get('amount'));
    if (!Number.isFinite(amount) || amount <= 0) return { error: 'Montant invalide.' };
    await getAdminProvider().addInvoice(projectId, {
      phaseId: formData.get('phaseId') as string,
      category: formData.get('category') as ExpenseCategory,
      label: (formData.get('label') as string)?.trim(),
      amount,
      supplierName: (formData.get('supplierName') as string)?.trim() || undefined,
    });
    revalidateProject(projectId);
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Ajout impossible.' };
  }
}

export async function addMedia(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const projectId = formData.get('projectId') as string;
    const lat = formData.get('lat') ? Number(formData.get('lat')) : undefined;
    const lng = formData.get('lng') ? Number(formData.get('lng')) : undefined;
    const capturedAt = (formData.get('capturedAt') as string) || undefined;
    const geo = lat != null && lng != null && Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : undefined;
    await getAdminProvider().addMedia(projectId, {
      phaseId: formData.get('phaseId') as string,
      type: (formData.get('type') as MediaType) || 'photo',
      caption: (formData.get('caption') as string)?.trim() || undefined,
      capturedAt,
      geo,
    });
    revalidateProject(projectId);
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Ajout impossible.' };
  }
}

export async function updatePhaseStatus(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const projectId = formData.get('projectId') as string;
    await getAdminProvider().updatePhaseStatus(formData.get('phaseId') as string, formData.get('status') as PhaseStatus);
    revalidateProject(projectId);
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Mise à jour impossible.' };
  }
}

export async function releaseFunds(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const projectId = formData.get('projectId') as string;
    // The acting admin releases as controller; the provider enforces maker-checker
    // (controller ≠ the inspector who certified the phase) — §3.10.
    await getAdminProvider().releaseFunds(formData.get('phaseId') as string, ADMIN_USER_ID);
    revalidateProject(projectId);
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Déblocage impossible.' };
  }
}

/* --- Team & roles --- */

export async function assignRole(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const displayName = (formData.get('displayName') as string)?.trim();
    if (!displayName) return { error: 'Nom requis.' };
    await getAdminProvider().assignRole({
      displayName,
      role: formData.get('role') as TeamRole,
      contact: (formData.get('contact') as string)?.trim() || undefined,
    });
    revalidatePath('/admin/equipe');
    revalidatePath('/admin/audit');
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Action impossible.' };
  }
}

export async function rotateInspector(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await getAdminProvider().rotateInspector(formData.get('inspectorId') as string, formData.get('projectId') as string);
    revalidatePath('/admin/equipe');
    revalidatePath('/admin/audit');
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Action impossible.' };
  }
}

/* --- Anomalies --- */

export async function setAnomalyStatus(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await getAdminProvider().setAnomalyStatus(formData.get('id') as string, formData.get('status') as AnomalyStatus);
    revalidatePath('/admin');
    revalidatePath('/admin/anomalies');
    revalidatePath('/admin/audit');
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Action impossible.' };
  }
}

/* --- Volet B : tâches, redditions, problèmes --- */

/** Pages touched by an employee-piloting write. */
function revalidateWorkforce() {
  revalidatePath('/admin');
  revalidatePath('/admin/employes');
  revalidatePath('/admin/taches');
  revalidatePath('/admin/redditions');
  revalidatePath('/admin/problemes');
  revalidatePath('/admin/audit');
}

export async function createTask(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const title = (formData.get('title') as string)?.trim();
    if (!title) return { error: 'Titre requis.' };
    const advanceAmount = Number(formData.get('advanceAmount'));
    const hasAdvance = Number.isFinite(advanceAmount) && advanceAmount > 0;
    await getAdminProvider().createTask({
      projectId: formData.get('projectId') as string,
      projectName: formData.get('projectName') as string,
      landRef: formData.get('landRef') as string,
      assignedTo: formData.get('assignedTo') as string,
      title,
      description: (formData.get('description') as string)?.trim() || undefined,
      priority: (formData.get('priority') as TaskPriority) || 'medium',
      dueDate: (formData.get('dueDate') as string) || undefined,
      advance: hasAdvance
        ? { amountGiven: advanceAmount, purpose: (formData.get('advancePurpose') as string)?.trim() || 'Avance' }
        : undefined,
    });
    revalidateWorkforce();
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Création impossible.' };
  }
}

export async function cancelTask(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await getAdminProvider().cancelTask(formData.get('id') as string);
    revalidateWorkforce();
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Action impossible.' };
  }
}

export async function validateReport(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await getAdminProvider().validateReport(formData.get('id') as string);
    revalidateWorkforce();
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Action impossible.' };
  }
}

export async function requestReportFix(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await getAdminProvider().requestReportFix(formData.get('id') as string);
    revalidateWorkforce();
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Action impossible.' };
  }
}

export async function resolveIncident(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await getAdminProvider().resolveIncident(formData.get('id') as string);
    revalidateWorkforce();
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Action impossible.' };
  }
}

export async function escalateIncident(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await getAdminProvider().escalateIncident(formData.get('id') as string);
    revalidateWorkforce();
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Action impossible.' };
  }
}
