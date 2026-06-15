/* ============================================================
   Espace employé — provider (mock-first, données partagées).
   Mute les MÊMES SEED_* que le Volet B admin : un rendu-compte
   soumis ici apparaît aussitôt côté admin (/admin/redditions),
   un incident ici remonte dans /admin/problemes. Deux portes,
   un seul jeu de données (CLAUDE.md §3.4).

   Garde-fous (prompt §2) :
   - L'employé n'écrit que SES lignes (filtré sur workerId).
   - Il ne crée jamais une avance (amount_given vient de l'admin),
     ne débloque jamais de fonds (maker-checker).
   - amount_spent est recalculé depuis les reçus : pas de reçu =
     dépense non justifiée, visiblement signalée.
   ============================================================ */

import {
  SEED_TASKS, SEED_CASH_ADVANCES, SEED_ADVANCE_RECEIPTS,
  SEED_WORK_SESSIONS, SEED_FIELD_REPORTS, SEED_INCIDENTS, SEED_AUDIT, SEED_TEAM,
  SEED_PROSPECT_ENTRIES, SEED_PROSPECTOR_WORKDAYS,
} from '@/lib/admin/seed';
import { SEED_EXPENSES, SEED_MEDIA, SEED_PROJECT } from '@/lib/mustaf/seed';
import { SEED_WORKER_PAYMENTS } from './seed';
import type {
  Task, CashAdvance, AdvanceReceipt, WorkSession, FieldReport, Incident,
  AdvanceReconciliation, TaskPriority, AuditAction, AuditTargetType,
  ProspectEntry, ProspectNetwork, ProspectContactMethod, ProspectOutcome, ProspectorWorkDay,
} from '@/lib/admin/types';
import type { Expense, ExpenseCategory, ConstructionMedia, MediaType } from '@/lib/mustaf/types';
import type { MyTaskRow, MyTaskDetail, WalletSummary, WorkerPayment } from './types';

const newId = (prefix: string) =>
  `${prefix}-${(globalThis.crypto?.randomUUID?.() ?? Date.now().toString(36))}`;

const PRIORITY_RANK: Record<TaskPriority, number> = { high: 0, medium: 1, low: 2 };

/** Réconciliation d'une avance — cœur anti-fuite (donné = dépensé + rendu). */
export function reconcileAdvance(advance: CashAdvance): AdvanceReconciliation {
  const receiptsTotal = SEED_ADVANCE_RECEIPTS
    .filter(r => r.cashAdvanceId === advance.id)
    .reduce((s, r) => s + r.amount, 0);
  const gap = advance.amountGiven - advance.amountSpent - advance.amountReturned;
  return {
    given: advance.amountGiven,
    spent: advance.amountSpent,
    returned: advance.amountReturned,
    gap,
    hasGap: gap !== 0,
    missingReceipts: receiptsTotal !== advance.amountSpent,
  };
}

function hoursBetween(startISO: string, endISO?: string): number {
  const end = endISO ? new Date(endISO).getTime() : Date.now();
  return Math.max(0, (end - new Date(startISO).getTime()) / 3_600_000);
}

/** Audit partagé — l'action de l'employé apparaît dans le journal admin. */
function appendAudit(actorId: string, action: AuditAction, targetType: AuditTargetType, targetId: string, targetLabel?: string, metadata?: Record<string, unknown>) {
  SEED_AUDIT.unshift({
    id: newId('audit'),
    actorId,
    actorName: SEED_TEAM.find(t => t.id === actorId)?.displayName ?? 'Employé',
    action, targetType, targetId, targetLabel, metadata,
    createdAt: new Date().toISOString(),
  });
}

const advanceForTask = (taskId: string) => SEED_CASH_ADVANCES.find(a => a.taskId === taskId);

/* ---------------- Lecture ---------------- */

/** Mes tâches, triées par priorité puis par délai (prompt §3.1). */
export function listMyTasks(workerId: string): MyTaskRow[] {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const soon = new Date(today); soon.setDate(soon.getDate() + 2);

  return SEED_TASKS
    .filter(t => t.assignedTo === workerId && t.status !== 'cancelled')
    .map(task => {
      const due = task.dueDate ? new Date(task.dueDate) : undefined;
      const open = task.status === 'assigned' || task.status === 'in_progress';
      return {
        task,
        advance: advanceForTask(task.id),
        overdue: !!due && open && due < today,
        dueSoon: !!due && open && due >= today && due <= soon,
      } satisfies MyTaskRow;
    })
    .sort((a, b) =>
      PRIORITY_RANK[a.task.priority] - PRIORITY_RANK[b.task.priority] ||
      (a.task.dueDate ?? '9999').localeCompare(b.task.dueDate ?? '9999'));
}

export function getTaskDetail(workerId: string, taskId: string): MyTaskDetail | null {
  const task = SEED_TASKS.find(t => t.id === taskId && t.assignedTo === workerId);
  if (!task) return null;
  const advance = advanceForTask(taskId);
  const receipts = advance ? SEED_ADVANCE_RECEIPTS.filter(r => r.cashAdvanceId === advance.id) : [];
  const sessions = SEED_WORK_SESSIONS
    .filter(s => s.taskId === taskId && s.workerId === workerId)
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  return {
    task,
    advance,
    receipts,
    reconciliation: advance ? reconcileAdvance(advance) : undefined,
    sessions,
    activeSession: sessions.find(s => !s.endedAt),
    report: SEED_FIELD_REPORTS.find(r => r.taskId === taskId && r.workerId === workerId),
    totalHours: sessions.reduce((s, ws) => s + hoursBetween(ws.startedAt, ws.endedAt), 0),
  };
}

/** Synthèse argent de l'employé — les 3 flux (avances / paiements / rendu). */
export function getWallet(workerId: string): WalletSummary {
  const advances = SEED_CASH_ADVANCES.filter(a => a.workerId === workerId);
  return {
    advancesReceived:    advances.reduce((s, a) => s + a.amountGiven, 0),
    advancesSpent:       advances.reduce((s, a) => s + a.amountSpent, 0),
    advancesReturned:    advances.reduce((s, a) => s + a.amountReturned, 0),
    advancesOutstanding: advances.filter(a => !a.reconciled).reduce((s, a) => s + reconcileAdvance(a).gap, 0),
    paymentsReceived:    SEED_WORKER_PAYMENTS.filter(p => p.workerId === workerId).reduce((s, p) => s + p.amount, 0),
  };
}

/** Mes avances (argent confié pour acheter) avec leur état de réconciliation. */
export function listMyAdvances(workerId: string): { advance: CashAdvance; reconciliation: AdvanceReconciliation; taskTitle?: string }[] {
  return SEED_CASH_ADVANCES
    .filter(a => a.workerId === workerId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map(advance => ({
      advance,
      reconciliation: reconcileAdvance(advance),
      taskTitle: SEED_TASKS.find(t => t.id === advance.taskId)?.title,
    }));
}

/** Mes paiements (rémunération de mon travail). */
export function listMyPayments(workerId: string): WorkerPayment[] {
  return SEED_WORKER_PAYMENTS
    .filter(p => p.workerId === workerId)
    .sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime());
}

export function listMyReports(workerId: string): { report: FieldReport; task?: Task }[] {
  return SEED_FIELD_REPORTS
    .filter(r => r.workerId === workerId)
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    .map(report => ({ report, task: SEED_TASKS.find(t => t.id === report.taskId) }));
}

/* ---------------- Écriture (uniquement ses lignes) ---------------- */

export function startTask(workerId: string, taskId: string): WorkSession {
  const task = SEED_TASKS.find(t => t.id === taskId && t.assignedTo === workerId);
  if (!task) throw new Error('Tâche introuvable.');
  if (SEED_WORK_SESSIONS.some(s => s.taskId === taskId && s.workerId === workerId && !s.endedAt)) {
    throw new Error('Un pointage est déjà en cours pour cette tâche.');
  }
  const session: WorkSession = {
    id: newId('ws'), workerId, taskId, startedAt: new Date().toISOString(),
  };
  SEED_WORK_SESSIONS.push(session);
  if (task.status === 'assigned') task.status = 'in_progress';
  return session;
}

export function endTask(workerId: string, taskId: string, summary?: string): WorkSession {
  const session = SEED_WORK_SESSIONS.find(s => s.taskId === taskId && s.workerId === workerId && !s.endedAt);
  if (!session) throw new Error('Aucun pointage en cours pour cette tâche.');
  session.endedAt = new Date().toISOString();
  if (summary) session.summary = summary;
  return session;
}

/** Ajoute un reçu et recalcule amount_spent = Σ reçus (la dépense devient justifiée). */
export function addReceipt(workerId: string, advanceId: string, input: { label: string; amount: number; fileUrl?: string }): AdvanceReceipt {
  const advance = SEED_CASH_ADVANCES.find(a => a.id === advanceId && a.workerId === workerId);
  if (!advance) throw new Error('Avance introuvable.');
  if (advance.reconciled) throw new Error('Cette avance est déjà clôturée.');
  if (input.amount <= 0) throw new Error('Montant invalide.');
  const newSpent = SEED_ADVANCE_RECEIPTS
    .filter(r => r.cashAdvanceId === advanceId)
    .reduce((s, r) => s + r.amount, 0) + input.amount;
  // Cohérence DB (migration 005) : dépensé + rendu ne dépasse jamais le donné.
  if (newSpent + advance.amountReturned > advance.amountGiven) {
    throw new Error('Le total dépensé + rendu dépasse l’avance reçue. Vérifie le montant.');
  }
  const receipt: AdvanceReceipt = {
    id: newId('rec'), cashAdvanceId: advanceId,
    label: input.label, amount: input.amount, fileUrl: input.fileUrl ?? '#',
    createdAt: new Date().toISOString(),
  };
  SEED_ADVANCE_RECEIPTS.push(receipt);
  advance.amountSpent = newSpent;
  return receipt;
}

/** Soumet le rendu-compte de fin de mission (argent + travail). */
export function submitReport(workerId: string, taskId: string, input: { workDone: string; workRemaining?: string; amountReturned: number }): FieldReport {
  const task = SEED_TASKS.find(t => t.id === taskId && t.assignedTo === workerId);
  if (!task) throw new Error('Tâche introuvable.');
  if (SEED_FIELD_REPORTS.some(r => r.taskId === taskId && r.status !== 'needs_fix')) {
    throw new Error('Un rendu-compte a déjà été soumis pour cette tâche.');
  }
  const advance = advanceForTask(taskId);
  let amountRemaining = 0;
  if (advance) {
    const returned = Math.max(0, input.amountReturned);
    if (advance.amountSpent + returned > advance.amountGiven) {
      throw new Error('Dépensé + rendu dépasse l’avance reçue.');
    }
    advance.amountReturned = returned;
    amountRemaining = advance.amountGiven - advance.amountSpent - returned;
  }
  // Réouverture après correction demandée : on réutilise le rendu existant.
  const existing = SEED_FIELD_REPORTS.find(r => r.taskId === taskId && r.status === 'needs_fix');
  const report: FieldReport = existing ?? {
    id: newId('fr'), taskId, workerId, workerName: task.assignedToName,
    amountRemaining, workDone: input.workDone, workRemaining: input.workRemaining,
    submittedAt: new Date().toISOString(), status: 'submitted',
  };
  if (existing) {
    existing.amountRemaining = amountRemaining;
    existing.workDone = input.workDone;
    existing.workRemaining = input.workRemaining;
    existing.submittedAt = new Date().toISOString();
    existing.status = 'submitted';
  } else {
    SEED_FIELD_REPORTS.push(report);
  }
  task.status = 'reported';
  // Clôt un éventuel pointage encore ouvert.
  const open = SEED_WORK_SESSIONS.find(s => s.taskId === taskId && s.workerId === workerId && !s.endedAt);
  if (open) open.endedAt = new Date().toISOString();
  return report;
}

/** Signale un problème terrain (où / quand / statut) — remonte dans /admin/problemes. */
export function raiseIncident(workerId: string, input: {
  description: string; location?: string; geo?: { lat: number; lng: number };
  priority: TaskPriority; reportId?: string;
}): Incident {
  const worker = SEED_TEAM.find(t => t.id === workerId);
  const incident: Incident = {
    id: newId('inc'), reportId: input.reportId,
    projectId: SEED_PROJECT.id, projectName: SEED_PROJECT.ownerName,
    raisedByName: worker?.displayName ?? 'Employé',
    description: input.description, location: input.location, geo: input.geo,
    priority: input.priority, occurredAt: new Date().toISOString(),
    status: 'to_resolve', createdAt: new Date().toISOString(),
  };
  SEED_INCIDENTS.unshift(incident);
  return incident;
}

/* ---------------- Prospection commerciale ---------------- */

/** Mes prospections, plus récentes d'abord (par jour puis par saisie). */
export function listMyProspects(workerId: string): ProspectEntry[] {
  return SEED_PROSPECT_ENTRIES
    .filter(p => p.prospectorId === workerId)
    .sort((a, b) =>
      b.prospectedAt.localeCompare(a.prospectedAt) ||
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/** Enregistre une prospection du jour — n'écrit que SA ligne, tracée à l'audit. */
export function createProspect(workerId: string, input: {
  companyName: string;
  contactName?: string;
  contactPhone?: string;
  followers?: number;
  network: ProspectNetwork;
  outcome: ProspectOutcome;
  contactMethod?: ProspectContactMethod;
  concern?: string;
  notes?: string;
  prospectedAt?: string;   // jour ; défaut = aujourd'hui
}): ProspectEntry {
  const worker = SEED_TEAM.find(t => t.id === workerId);
  if (!worker) throw new Error('Employé introuvable.');
  if (worker.role !== 'prospector') throw new Error('Action réservée aux prospecteurs.');
  if (!input.companyName.trim()) throw new Error('Indique le nom de l’entreprise prospectée.');
  // « À prospecter » = simple fiche contact, pas encore démarchée : ni moyen de
  // contact ni objection tant que l'entreprise n'a pas été réellement contactée.
  const contacted = input.outcome !== 'to_contact';
  const followers = Number.isFinite(input.followers) && (input.followers as number) >= 0
    ? Math.round(input.followers as number) : undefined;
  const entry: ProspectEntry = {
    id: newId('prosp'), prospectorId: workerId, prospectorName: worker.displayName,
    companyName: input.companyName.trim(),
    contactName: input.contactName?.trim() || undefined,
    contactPhone: input.contactPhone?.trim() || undefined,
    followers,
    network: input.network,
    outcome: input.outcome,
    contactMethod: contacted ? input.contactMethod : undefined,
    concern: contacted ? input.concern?.trim() || undefined : undefined,
    notes: input.notes?.trim() || undefined,
    // Saisi mais pas encore transmis : reste un brouillon privé jusqu'à l'envoi au superviseur.
    status: 'draft',
    prospectedAt: input.prospectedAt || new Date().toISOString().slice(0, 10),
    createdAt: new Date().toISOString(),
  };
  SEED_PROSPECT_ENTRIES.unshift(entry);
  appendAudit(workerId, 'log_prospect', 'prospect', entry.id, entry.companyName, { network: entry.network, outcome: entry.outcome });
  return entry;
}

/** Combien de prospections en brouillon (pas encore envoyées) pour ce prospecteur. */
export function countDraftProspects(workerId: string): number {
  return SEED_PROSPECT_ENTRIES.filter(p => p.prospectorId === workerId && p.status === 'draft').length;
}

/**
 * Envoie au superviseur toutes les prospections en brouillon du prospecteur :
 * elles passent en `sent` et apparaissent alors côté admin. Retourne le nombre transmis.
 */
export function sendProspectsToSupervisor(workerId: string): number {
  const worker = SEED_TEAM.find(t => t.id === workerId);
  if (!worker) throw new Error('Employé introuvable.');
  if (worker.role !== 'prospector') throw new Error('Action réservée aux prospecteurs.');
  const drafts = SEED_PROSPECT_ENTRIES.filter(p => p.prospectorId === workerId && p.status === 'draft');
  if (drafts.length === 0) throw new Error('Aucune prospection à envoyer.');
  const now = new Date().toISOString();
  drafts.forEach(p => { p.status = 'sent'; p.sentAt = now; });
  appendAudit(workerId, 'submit_prospects', 'prospect', workerId, worker.displayName, { count: drafts.length });
  return drafts.length;
}

/* ---------------- Journées de travail (pointage prospecteur) ---------------- */

/** Mes journées de travail, les plus récentes d'abord. */
export function listMyWorkDays(workerId: string): ProspectorWorkDay[] {
  return SEED_PROSPECTOR_WORKDAYS
    .filter(d => d.workerId === workerId)
    .sort((a, b) => b.workDate.localeCompare(a.workDate));
}

/**
 * Enregistre (ou met à jour) une journée de travail : date + heures faites.
 * Une seule entrée par jour — ressaisir la même date écrase les heures (pas de doublon).
 */
export function logWorkDay(workerId: string, input: { workDate: string; hours: number; note?: string }): ProspectorWorkDay {
  const worker = SEED_TEAM.find(t => t.id === workerId);
  if (!worker) throw new Error('Employé introuvable.');
  if (!input.workDate) throw new Error('Indique la date du jour travaillé.');
  if (input.workDate > new Date().toISOString().slice(0, 10)) throw new Error('La date ne peut pas être dans le futur.');
  if (!Number.isFinite(input.hours) || input.hours <= 0) throw new Error('Indique un nombre d’heures valide.');
  if (input.hours > 24) throw new Error('Une journée ne peut pas dépasser 24 heures.');
  const note = input.note?.trim() || undefined;
  const existing = SEED_PROSPECTOR_WORKDAYS.find(d => d.workerId === workerId && d.workDate === input.workDate);
  if (existing) {
    existing.hours = input.hours;
    existing.note = note;
    return existing;
  }
  const day: ProspectorWorkDay = {
    id: newId('wd'), workerId, workerName: worker.displayName,
    workDate: input.workDate, hours: input.hours, note,
    createdAt: new Date().toISOString(),
  };
  SEED_PROSPECTOR_WORKDAYS.unshift(day);
  return day;
}

/* ---------------- Actions métier selon le rôle ---------------- */

/** procurement — ajoute une facture (prix réel, zéro marge). */
export function addInvoice(workerId: string, input: { phaseId: string; category: ExpenseCategory; label: string; amount: number; supplierName?: string }): Expense {
  if (input.amount <= 0) throw new Error('Montant invalide.');
  const exp: Expense = {
    id: newId('exp'), projectId: SEED_PROJECT.id, phaseId: input.phaseId,
    category: input.category, label: input.label, amount: input.amount,
    supplierName: input.supplierName, invoiceUrl: '#', createdAt: new Date().toISOString(),
  };
  SEED_EXPENSES.push(exp);
  appendAudit(workerId, 'add_invoice', 'expense', exp.id, input.label, { amount: input.amount, supplier: input.supplierName, phaseId: input.phaseId });
  return exp;
}

/** site_agent / inspector — ajoute une photo de chantier (géoloc + horodatage). */
export function addChantierMedia(workerId: string, input: { phaseId: string; type: MediaType; caption?: string; capturedAt?: string; geo?: { lat: number; lng: number } }): ConstructionMedia {
  const media: ConstructionMedia = {
    id: newId('med'), projectId: SEED_PROJECT.id, phaseId: input.phaseId,
    url: '#', type: input.type, caption: input.caption,
    capturedAt: input.capturedAt, geo: input.geo,
    // Métadonnée sacrée (§3.11) : géoloc + date présents ⇒ vérifié, sinon marqué.
    metadataStatus: input.geo && input.capturedAt ? 'verified' : 'unverified_metadata',
    uploadedBy: workerId, createdAt: new Date().toISOString(),
  };
  SEED_MEDIA.push(media);
  appendAudit(workerId, 'add_media', 'media', media.id, input.caption ?? 'Média de chantier', { phaseId: input.phaseId, metadata: media.metadataStatus });
  return media;
}
