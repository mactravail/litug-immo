/**
 * Prospection — couche de données Supabase (remplace le mock seed quand un
 * vrai prospecteur est connecté). Utilisé par la page /equipe/prospection,
 * /equipe/journees et les Server Actions correspondantes.
 *
 * Toutes les fonctions reçoivent le client Supabase en paramètre pour être
 * utilisables depuis les Server Components ET les Server Actions sans recréer
 * le client à chaque appel.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { ProspectEntry, ProspectorWorkDay, ProspectorTransfer, ProspectNetwork, ProspectContactMethod, ProspectOutcome } from '@/lib/admin/types';

/* ------------------------------------------------------------------ */
/* Mappeurs DB → types internes                                        */
/* ------------------------------------------------------------------ */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapEntry(row: Record<string, any>): ProspectEntry {
  return {
    id:            row.id,
    prospectorId:  row.prospector_id,
    prospectorName: row.prospector_name ?? '',
    companyName:   row.company_name,
    contactName:   row.contact_name ?? undefined,
    contactPhone:  row.contact_phone ?? undefined,
    followers:     row.followers ?? undefined,
    network:       row.network as ProspectNetwork,
    outcome:       row.outcome as ProspectOutcome,
    contactMethod: row.contact_method as ProspectContactMethod | undefined,
    concern:       row.concern ?? undefined,
    notes:         row.notes ?? undefined,
    status:        row.status,
    prospectedAt:  row.prospected_at,
    createdAt:     row.created_at,
    sentAt:        row.sent_at ?? undefined,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapWorkDay(row: Record<string, any>): ProspectorWorkDay {
  return {
    id:        row.id,
    workerId:  row.worker_id,
    workerName: row.worker_name ?? '',
    workDate:  row.work_date,
    hours:     Number(row.hours),
    note:      row.note ?? undefined,
    createdAt: row.created_at,
  };
}

/* ------------------------------------------------------------------ */
/* Lecture                                                             */
/* ------------------------------------------------------------------ */

export async function dbListProspects(
  supabase: SupabaseClient,
  userId: string,
): Promise<ProspectEntry[]> {
  const { data, error } = await supabase
    .from('prospect_entries')
    .select('*')
    .eq('prospector_id', userId)
    .order('prospected_at', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapEntry);
}

export async function dbCountDrafts(
  supabase: SupabaseClient,
  userId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from('prospect_entries')
    .select('id', { count: 'exact', head: true })
    .eq('prospector_id', userId)
    .eq('status', 'draft');
  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function dbListWorkDays(
  supabase: SupabaseClient,
  userId: string,
): Promise<ProspectorWorkDay[]> {
  const { data, error } = await supabase
    .from('prospector_work_days')
    .select('*')
    .eq('worker_id', userId)
    .order('work_date', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapWorkDay);
}

/* ------------------------------------------------------------------ */
/* Écriture                                                            */
/* ------------------------------------------------------------------ */

export async function dbCreateProspect(
  supabase: SupabaseClient,
  userId: string,
  input: {
    companyName: string;
    contactName?: string;
    contactPhone?: string;
    followers?: number;
    network: ProspectNetwork;
    outcome: ProspectOutcome;
    contactMethod?: ProspectContactMethod;
    concern?: string;
    notes?: string;
    prospectedAt?: string;
  },
): Promise<ProspectEntry> {
  if (!input.companyName.trim()) throw new Error("Indique le nom de l'entreprise prospectée.");
  const contacted = input.outcome !== 'to_contact';
  const { data, error } = await supabase
    .from('prospect_entries')
    .insert({
      prospector_id:  userId,
      company_name:   input.companyName.trim(),
      contact_name:   input.contactName ?? null,
      contact_phone:  input.contactPhone ?? null,
      followers:      input.followers ?? null,
      network:        input.network,
      outcome:        input.outcome,
      contact_method: contacted ? (input.contactMethod ?? null) : null,
      concern:        contacted ? (input.concern ?? null) : null,
      notes:          input.notes ?? null,
      status:         'draft',
      prospected_at:  input.prospectedAt ?? new Date().toISOString().slice(0, 10),
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapEntry(data);
}

/**
 * Transmet tous les brouillons du prospecteur au superviseur (status → sent).
 * Retourne le nombre de lignes transmises.
 */
export async function dbSendToSupervisor(
  supabase: SupabaseClient,
  userId: string,
): Promise<number> {
  // On récupère d'abord les IDs des brouillons pour connaître le compte exact.
  const { data: drafts, error: fetchErr } = await supabase
    .from('prospect_entries')
    .select('id')
    .eq('prospector_id', userId)
    .eq('status', 'draft');
  if (fetchErr) throw new Error(fetchErr.message);
  if (!drafts || drafts.length === 0) throw new Error('Aucune prospection à envoyer.');

  const { error: updateErr } = await supabase
    .from('prospect_entries')
    .update({ status: 'sent', sent_at: new Date().toISOString() })
    .eq('prospector_id', userId)
    .eq('status', 'draft');
  if (updateErr) throw new Error(updateErr.message);
  return drafts.length;
}

/**
 * Enregistre (ou met à jour) une journée de travail.
 * Un seul enregistrement par jour — la contrainte UNIQUE (worker_id, work_date)
 * est gérée avec upsert.
 */
/* ------------------------------------------------------------------ */
/* Virements reçus (prospector_transfers)                             */
/* ------------------------------------------------------------------ */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapTransfer(row: Record<string, any>): ProspectorTransfer {
  return {
    id:             row.id,
    prospectorId:   row.prospector_id,
    prospectorName: row.prospector_name ?? '',
    amount:         Number(row.amount),
    motif:          row.motif,
    sentAt:         row.sent_at,
    status:         row.status as ProspectorTransfer['status'],
    confirmedAt:    row.confirmed_at ?? undefined,
    deniedAt:       row.denied_at ?? undefined,
    denialReason:   row.denial_reason ?? undefined,
  };
}

export async function dbListMyTransfers(
  supabase: SupabaseClient,
  userId: string,
): Promise<ProspectorTransfer[]> {
  const { data, error } = await supabase
    .from('prospector_transfers')
    .select('*')
    .eq('prospector_id', userId)
    .order('sent_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapTransfer);
}

export async function dbConfirmTransfer(
  supabase: SupabaseClient,
  transferId: string,
): Promise<ProspectorTransfer> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('prospector_transfers')
    .update({ status: 'confirmed', confirmed_at: now })
    .eq('id', transferId)
    .eq('status', 'pending')
    .select()
    .single();
  if (error) throw new Error(error.message);
  if (!data) throw new Error('Virement introuvable ou déjà traité.');
  return mapTransfer(data);
}

export async function dbDenyTransfer(
  supabase: SupabaseClient,
  transferId: string,
  reason?: string,
): Promise<ProspectorTransfer> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('prospector_transfers')
    .update({ status: 'denied', denied_at: now, denial_reason: reason ?? null })
    .eq('id', transferId)
    .eq('status', 'pending')
    .select()
    .single();
  if (error) throw new Error(error.message);
  if (!data) throw new Error('Virement introuvable ou déjà traité.');
  return mapTransfer(data);
}

export async function dbLogWorkDay(
  supabase: SupabaseClient,
  userId: string,
  input: { workDate: string; hours: number; note?: string },
): Promise<ProspectorWorkDay> {
  if (!input.workDate) throw new Error('Indique la date du jour travaillé.');
  if (input.workDate > new Date().toISOString().slice(0, 10))
    throw new Error('La date ne peut pas être dans le futur.');
  if (!Number.isFinite(input.hours) || input.hours <= 0)
    throw new Error("Indique un nombre d'heures valide.");
  if (input.hours > 24) throw new Error('Une journée ne peut pas dépasser 24 heures.');

  const { data, error } = await supabase
    .from('prospector_work_days')
    .upsert(
      {
        worker_id: userId,
        work_date: input.workDate,
        hours:     input.hours,
        note:      input.note ?? null,
      },
      { onConflict: 'worker_id,work_date' },
    )
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapWorkDay(data);
}
