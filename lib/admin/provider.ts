/* ============================================================
   Admin back-office — data provider (mock-first, switchable).
   Today: in-memory mutations over the shared seed arrays, so an
   admin action (add invoice/media, advance a phase, release funds)
   shows up immediately in the client's Mustaf read-space — same
   data, different doors (prompt §3.4).
   A './supabase-provider' can replace this later behind
   NEXT_PUBLIC_DATA_SOURCE, exactly like the Sara/Mustaf providers.
   Every sensitive write appends an append-only audit line (§2).
   ============================================================ */

import type {
  Subscription, SubscriptionStatus, AuditLogEntry, AuditAction,
  TeamMember, AdminOverview, MustafProjectRow, SiteStats, MonthlyPoint,
  Task, TaskPriority, CashAdvance, AdvanceReceipt, FieldReport, Incident,
  IncidentStatus, EmployeeRow, AdvanceReconciliation, ReportReview, WorkSession,
  Invoice, BillableParty, InvoiceRecipientType, ProspectEntry,
} from './types';
import {
  SEED_SUBSCRIPTIONS, SEED_TEAM, SEED_AUDIT, ADMIN_USER_ID, ADMIN_USER_NAME,
  SEED_TASKS, SEED_CASH_ADVANCES, SEED_ADVANCE_RECEIPTS, SEED_WORK_SESSIONS,
  SEED_FIELD_REPORTS, SEED_INCIDENTS, SEED_INVOICES, SEED_PROSPECT_ENTRIES,
} from './seed';
import { sellerPlanPrice, VERIFICATION_FEE } from './pricing';
import { TEAM_ROLE_LABEL, SUBSCRIPTION_STATUS_LABEL } from './labels';
import { SEED_LANDS, SEED_LEADS, SEED_VISITS } from '@/lib/data/seed';
import {
  SEED_EXPENSES, SEED_MEDIA, SEED_PHASES, SEED_FUND_RELEASES, SEED_INSPECTIONS,
} from '@/lib/mustaf/seed';
import { getMustafProvider } from '@/lib/mustaf/provider';
import { PHASE_STATUS_LABEL } from '@/lib/mustaf/labels';
import type {
  Expense, ExpenseCategory, ConstructionMedia, PhaseStatus, MediaType,
  Anomaly, AnomalyStatus, RechargeRequest, RechargeStatus,
} from '@/lib/mustaf/types';
import { SEED_ANOMALIES } from '@/lib/mustaf/seed';

const newId = (prefix: string) =>
  `${prefix}-${(globalThis.crypto?.randomUUID?.() ?? Date.now().toString(36))}`;

/** Un contact connu est-il un email exploitable pour pré-remplir une facture ? */
const looksLikeEmail = (contact?: string): boolean =>
  !!contact && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);

/** Append-only audit. Mock impl unshifts so reads are newest-first. */
function appendAudit(entry: Omit<AuditLogEntry, 'id' | 'createdAt' | 'actorId' | 'actorName'> &
  Partial<Pick<AuditLogEntry, 'actorId' | 'actorName'>>): AuditLogEntry {
  const row: AuditLogEntry = {
    id: newId('audit'),
    actorId: entry.actorId ?? ADMIN_USER_ID,
    actorName: entry.actorName ?? ADMIN_USER_NAME,
    action: entry.action,
    targetType: entry.targetType,
    targetId: entry.targetId,
    targetLabel: entry.targetLabel,
    metadata: entry.metadata,
    createdAt: new Date().toISOString(),
  };
  SEED_AUDIT.unshift(row);
  return row;
}

export interface AddInvoiceInput {
  phaseId: string;
  category: ExpenseCategory;
  label: string;
  amount: number;
  supplierName?: string;
  invoiceUrl?: string;
}

export interface AddMediaInput {
  phaseId: string;
  type: MediaType;
  caption?: string;
  capturedAt?: string;
  geo?: { lat: number; lng: number };
  url?: string;
}

export interface AdminProvider {
  // Overview
  getOverview(): Promise<AdminOverview>;
  // Business statistics (revenue, subscriptions, activity, Mustaf, monthly)
  getSiteStats(): Promise<SiteStats>;
  // Subscriptions
  listSubscriptions(subjectType?: 'seller' | 'mustaf'): Promise<Subscription[]>;
  getSubscription(id: string): Promise<Subscription | null>;
  getSubscriptionBySubject(subjectId: string): Promise<Subscription | null>;
  setSubscriptionStatus(id: string, status: SubscriptionStatus): Promise<Subscription>;
  changeSubscriptionTier(id: string, tier: string): Promise<Subscription>;
  // Invoices (services facturés)
  listBillableParties(): Promise<BillableParty[]>;
  listInvoices(): Promise<Invoice[]>;
  recordInvoice(input: RecordInvoiceInput): Promise<Invoice>;
  // Mustaf project rows + field actions
  listMustafProjects(): Promise<MustafProjectRow[]>;
  addInvoice(projectId: string, input: AddInvoiceInput): Promise<Expense>;
  addMedia(projectId: string, input: AddMediaInput): Promise<ConstructionMedia>;
  updatePhaseStatus(phaseId: string, status: PhaseStatus): Promise<void>;
  releaseFunds(phaseId: string, controllerId: string): Promise<void>;
  // Recharges déclarées par la famille → validation/refus par l'admin (le solde ne
  // bouge qu'à la validation). Délégué au provider Mustaf qui détient le dataset.
  listRechargeRequests(filter?: { status?: RechargeStatus }): Promise<RechargeRequest[]>;
  validateRecharge(id: string): Promise<RechargeRequest>;
  rejectRecharge(id: string, reason?: string): Promise<RechargeRequest>;
  // Team & roles
  listTeam(): Promise<TeamMember[]>;
  assignRole(input: { displayName: string; role: TeamMember['role']; contact?: string }): Promise<TeamMember>;
  rotateInspector(inspectorId: string, projectId: string): Promise<TeamMember>;
  // Anomalies
  listAnomalies(): Promise<Anomaly[]>;
  setAnomalyStatus(id: string, status: AnomalyStatus): Promise<Anomaly>;
  // Audit
  listAudit(filter?: { projectId?: string; actorId?: string }): Promise<AuditLogEntry[]>;
  // --- Volet B : pilotage des employés ---
  listEmployees(): Promise<EmployeeRow[]>;
  getEmployee(id: string): Promise<{ member: TeamMember; tasks: Task[]; sessions: WorkSession[]; totalHours: number; advances: { advance: CashAdvance; reconciliation: AdvanceReconciliation; receipts: AdvanceReceipt[] }[] } | null>;
  listTasks(filter?: { status?: Task['status']; workerId?: string }): Promise<Task[]>;
  getTask(id: string): Promise<Task | null>;
  createTask(input: CreateTaskInput): Promise<Task>;
  cancelTask(id: string): Promise<Task>;
  listReportReviews(filter?: { status?: FieldReport['status'] }): Promise<ReportReview[]>;
  validateReport(reportId: string): Promise<void>;
  requestReportFix(reportId: string): Promise<void>;
  listIncidents(filter?: { status?: IncidentStatus; projectId?: string }): Promise<Incident[]>;
  resolveIncident(id: string): Promise<Incident>;
  escalateIncident(id: string): Promise<Incident>;
  // Prospection commerciale (lecture admin)
  listProspectEntries(filter?: { prospectorId?: string; status?: ProspectEntry['status'] }): Promise<ProspectEntry[]>;
  countSentProspectEntries(): Promise<number>;
}

export interface RecordInvoiceInput {
  recipientType: InvoiceRecipientType;
  recipientName: string;
  recipientEmail: string;
  subjectId?: string;
  description: string;
  amount: number;             // FCFA
  stripeInvoiceId?: string;
  stripeNumber?: string | null;
  hostedInvoiceUrl?: string | null;
  invoicePdf?: string | null;
}

export interface CreateTaskInput {
  projectId: string;
  projectName: string;
  landRef: string;
  assignedTo: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  dueDate?: string;
  advance?: { amountGiven: number; purpose: string };
}

/** Money reconciliation for one advance (the heart of Volet B). */
function reconcileAdvance(advance: CashAdvance): AdvanceReconciliation {
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

/* --- next phase to release: legal phase states for the release gate --- */
const RELEASABLE: ReadonlyArray<PhaseStatus> = ['inspected', 'awaiting_release'];

/** Last 6 months of datable revenue (one-off events) + new subscriptions. */
function monthlySeries(): MonthlyPoint[] {
  const now = new Date();
  const months: { key: string; label: string }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = new Intl.DateTimeFormat('fr-FR', { month: 'short', year: '2-digit' }).format(d);
    months.push({ key, label });
  }
  return months.map(({ key, label }) => {
    const collected = SEED_EXPENSES
      .filter(e => (e.category === 'management_fee' || e.category === 'phase_zero') && e.createdAt.slice(0, 7) === key)
      .reduce((s, e) => s + e.amount, 0)
      + SEED_LANDS.filter(l => l.verificationStatus === 'verifie' && l.verifiedAt?.slice(0, 7) === key).length * VERIFICATION_FEE;
    const newSubs = SEED_SUBSCRIPTIONS.filter(s => s.createdAt.slice(0, 7) === key).length;
    return { label, revenue: collected, newSubs };
  });
}

export const adminMockProvider: AdminProvider = {
  async getOverview() {
    const subs = SEED_SUBSCRIPTIONS;
    const phases = SEED_PHASES;
    const mp = getMustafProvider();
    const [project, rechargesToValidate] = await Promise.all([
      mp.getProject(),
      mp.getRechargeRequests({ status: 'pending' }),
    ]);

    const phasesAwaitingRelease = phases
      .filter(p => RELEASABLE.includes(p.status))
      .map(p => ({
        projectId: project.id, projectName: project.ownerName,
        phaseId: p.id, phaseLabel: p.label, amount: p.estimate,
      }));

    return {
      sellersActive: subs.filter(s => s.subjectType === 'seller' && s.status === 'active').length,
      sellersPending: subs.filter(s => s.subjectType === 'seller' && s.status === 'pending').length,
      mustafByStatus: {
        pendingFunding:    phases.filter(p => p.status === 'pending_funding').length,
        inProgress:        phases.filter(p => p.status === 'in_progress' || p.status === 'funded').length,
        awaitingInspection:phases.filter(p => p.status === 'awaiting_inspection').length,
        completed:         phases.filter(p => p.status === 'completed' || p.status === 'paid').length,
      },
      queue: {
        subsToValidate: subs.filter(s => s.status === 'pending'),
        rechargesToValidate,
        phasesAwaitingRelease,
        openAnomalies: SEED_ANOMALIES.filter(a => a.status === 'open').length,
        reportsToReview: SEED_FIELD_REPORTS.filter(r => r.status === 'submitted').length,
        unreconciledAdvances: SEED_CASH_ADVANCES.filter(a => !a.reconciled).length,
        openIncidents: SEED_INCIDENTS.filter(i => i.status === 'to_resolve').length,
      },
    };
  },

  async getSiteStats() {
    // --- Revenue (money-in) — all four streams (zero materials margin: never count
    // materials/labor as revenue; only Sara + Phase 0 + Mustaf commission + verification). ---
    const sellerMrr = SEED_SUBSCRIPTIONS
      .filter(s => s.subjectType === 'seller' && s.status === 'active')
      .reduce((sum, s) => sum + sellerPlanPrice(String(s.tier)), 0);
    const phaseZero = SEED_EXPENSES.filter(e => e.category === 'phase_zero').reduce((s, e) => s + e.amount, 0);
    const mustafCommission = SEED_EXPENSES.filter(e => e.category === 'management_fee').reduce((s, e) => s + e.amount, 0);
    // Verification fees: 1 verified land = 1 paid verification (mock proxy until a real
    // verification/payment entity exists).
    const verifiedLands = SEED_LANDS.filter(l => l.verificationStatus === 'verifie').length;
    const verification = verifiedLands * VERIFICATION_FEE;
    const total = sellerMrr + phaseZero + mustafCommission + verification;

    // --- Subscriptions (sold / active / by type / churn) ---
    const subs = SEED_SUBSCRIPTIONS;
    const sold = subs.length;
    const active = subs.filter(s => s.status === 'active').length;
    const suspended = subs.filter(s => s.status === 'suspended').length;
    const revoked = subs.filter(s => s.status === 'revoked').length;
    const tierMap = new Map<string, number>();
    subs.filter(s => s.status === 'active').forEach(s => {
      const t = String(s.tier);
      tierMap.set(t, (tierMap.get(t) ?? 0) + 1);
    });
    const churnCount = suspended + revoked;

    // --- Activity (lands / leads / visits) ---
    const leadsTotal = SEED_LEADS.length;
    const leadsConverted = SEED_LEADS.filter(l => l.status === 'converti').length;

    // --- Mustaf ---
    const mp = getMustafProvider();
    const [phases, progress, escrow, projects] = await Promise.all([
      mp.getPhases(), mp.getProgress(), mp.getEscrowSummary(), this.listMustafProjects(),
    ]);
    const phaseStatusMap = new Map<string, number>();
    phases.forEach(p => phaseStatusMap.set(p.status, (phaseStatusMap.get(p.status) ?? 0) + 1));

    return {
      revenue: {
        sellerMrr, phaseZero, mustafCommission, verification, total,
        bySource: [
          { key: 'seller_subscriptions', label: 'Abonnements vendeurs (Sara)', amount: sellerMrr },
          { key: 'phase_zero', label: 'Forfaits Phase 0', amount: phaseZero },
          { key: 'mustaf_commission', label: 'Commissions Mustaf', amount: mustafCommission },
          { key: 'verification', label: 'Frais de vérification', amount: verification },
        ],
      },
      subscriptions: {
        sold, active,
        pending: subs.filter(s => s.status === 'pending').length,
        suspended, revoked,
        byTier: [...tierMap.entries()].map(([tier, count]) => ({ tier, count })).sort((a, b) => b.count - a.count),
        churnCount,
        churnRate: sold ? (churnCount / sold) * 100 : 0,
      },
      activity: {
        landsTotal: SEED_LANDS.length,
        landsAvailable: SEED_LANDS.filter(l => l.saleStatus === 'disponible').length,
        landsSold: SEED_LANDS.filter(l => l.saleStatus === 'vendu').length,
        landsVerified: verifiedLands,
        leadsTotal,
        leadsQualified: SEED_LEADS.filter(l => l.status === 'qualifie').length,
        leadsConverted,
        conversionRate: leadsTotal ? (leadsConverted / leadsTotal) * 100 : 0,
        visitsTotal: SEED_VISITS.length,
      },
      mustaf: {
        projects: projects.length,
        phasesByStatus: [...phaseStatusMap.entries()].map(([status, count]) => ({
          label: PHASE_STATUS_LABEL[status as keyof typeof PHASE_STATUS_LABEL], count,
        })),
        progressPct: progress.pctComplete,
        escrowBalance: escrow.balance,
        totalDeposited: escrow.totalDeposited,
      },
      monthly: monthlySeries(),
    };
  },

  async listSubscriptions(subjectType) {
    const rows = subjectType
      ? SEED_SUBSCRIPTIONS.filter(s => s.subjectType === subjectType)
      : SEED_SUBSCRIPTIONS;
    return [...rows].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getSubscription(id) {
    return SEED_SUBSCRIPTIONS.find(s => s.id === id) ?? null;
  },

  async getSubscriptionBySubject(subjectId) {
    return SEED_SUBSCRIPTIONS.find(s => s.subjectId === subjectId) ?? null;
  },

  async setSubscriptionStatus(id, status) {
    const sub = SEED_SUBSCRIPTIONS.find(s => s.id === id);
    if (!sub) throw new Error('Abonnement introuvable.');
    const from = sub.status;
    sub.status = status;
    if (status === 'active' && !sub.validatedAt) {
      sub.validatedBy = ADMIN_USER_ID;
      sub.validatedAt = new Date().toISOString();
    }
    const action: AuditAction =
      status === 'active' ? 'validate_sub' :
      status === 'suspended' ? 'suspend_sub' : 'revoke_sub';
    appendAudit({ action, targetType: 'subscription', targetId: id, targetLabel: sub.subjectName, metadata: { from, to: status } });
    return sub;
  },

  async changeSubscriptionTier(id, tier) {
    const sub = SEED_SUBSCRIPTIONS.find(s => s.id === id);
    if (!sub) throw new Error('Abonnement introuvable.');
    const from = sub.tier;
    sub.tier = tier;
    appendAudit({ action: 'change_tier', targetType: 'subscription', targetId: id, targetLabel: sub.subjectName, metadata: { from, to: tier } });
    return sub;
  },

  async listBillableParties() {
    const parties: BillableParty[] = [];

    // Abonnés (vendeurs Sara + clients Mustaf) — révoqués exclus (soft-delete).
    for (const sub of SEED_SUBSCRIPTIONS) {
      if (sub.status === 'revoked') continue;
      const isEmail = looksLikeEmail(sub.contact);
      parties.push({
        type: sub.subjectType === 'seller' ? 'seller' : 'mustaf',
        refId: sub.id,
        name: sub.subjectName,
        detail: `${String(sub.tier)} · ${SUBSCRIPTION_STATUS_LABEL[sub.status]}`,
        email: isEmail ? sub.contact : undefined,
        // Vendeur : prix du palier connu. Mustaf : commission = % du projet → pas de montant fixe.
        suggestedAmount: sub.subjectType === 'seller' ? sellerPlanPrice(String(sub.tier)) : undefined,
      });
    }

    // Employés actifs (le fondateur/admin n'est pas facturé).
    for (const m of SEED_TEAM) {
      if (m.role === 'admin' || m.status !== 'active') continue;
      parties.push({
        type: 'employee',
        refId: m.id,
        name: m.displayName,
        detail: TEAM_ROLE_LABEL[m.role],
        email: looksLikeEmail(m.contact) ? m.contact : undefined,
      });
    }

    return parties;
  },

  async listInvoices() {
    return [...SEED_INVOICES].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async recordInvoice(input) {
    const invoice: Invoice = {
      id: newId('inv'),
      recipientType: input.recipientType,
      recipientName: input.recipientName,
      recipientEmail: input.recipientEmail,
      subjectId: input.subjectId,
      description: input.description,
      amount: input.amount,
      status: 'open',
      stripeInvoiceId: input.stripeInvoiceId,
      stripeNumber: input.stripeNumber ?? undefined,
      hostedInvoiceUrl: input.hostedInvoiceUrl ?? undefined,
      invoicePdf: input.invoicePdf ?? undefined,
      createdBy: ADMIN_USER_ID,
      createdAt: new Date().toISOString(),
    };
    SEED_INVOICES.push(invoice);
    appendAudit({
      action: 'issue_invoice', targetType: 'invoice', targetId: invoice.id,
      targetLabel: `${invoice.recipientName} — ${invoice.description}`,
      metadata: { amount: invoice.amount, recipientType: invoice.recipientType, stripeNumber: invoice.stripeNumber },
    });
    return invoice;
  },

  async listMustafProjects() {
    const mp = getMustafProvider();
    const [project, progress] = await Promise.all([mp.getProject(), mp.getProgress()]);
    const sub = SEED_SUBSCRIPTIONS.find(s => s.subjectId === project.id);
    return [{
      projectId: project.id,
      landRef: project.landRef,
      ownerName: project.ownerName,
      zone: project.zone,
      tier: project.subscriptionTier,
      currentPhaseLabel: progress.currentPhase?.label ?? 'Terminé',
      projectStatusLabel: progress.currentPhase ? PHASE_STATUS_LABEL[progress.currentPhase.status] : 'Terminé',
      openAnomalies: SEED_ANOMALIES.filter(a => a.projectId === project.id && a.status === 'open').length,
      subscriptionStatus: sub?.status ?? 'active',
    }];
  },

  async addInvoice(projectId, input) {
    const exp: Expense = {
      id: newId('exp'), projectId, phaseId: input.phaseId,
      category: input.category, label: input.label, amount: input.amount,
      supplierName: input.supplierName, invoiceUrl: input.invoiceUrl ?? '#',
      createdAt: new Date().toISOString(),
    };
    SEED_EXPENSES.push(exp);
    appendAudit({ action: 'add_invoice', targetType: 'expense', targetId: exp.id, targetLabel: input.label, metadata: { amount: input.amount, supplier: input.supplierName, phaseId: input.phaseId } });
    return exp;
  },

  async addMedia(projectId, input) {
    const media: ConstructionMedia = {
      id: newId('med'), projectId, phaseId: input.phaseId,
      url: input.url ?? '#', type: input.type, caption: input.caption,
      capturedAt: input.capturedAt, geo: input.geo,
      // Metadata is sacred (§3.11/§4): present geo+date ⇒ verified, else flagged.
      metadataStatus: input.geo && input.capturedAt ? 'verified' : 'unverified_metadata',
      uploadedBy: ADMIN_USER_ID, createdAt: new Date().toISOString(),
    };
    SEED_MEDIA.push(media);
    appendAudit({ action: 'add_media', targetType: 'media', targetId: media.id, targetLabel: input.caption ?? 'Média de chantier', metadata: { phaseId: input.phaseId, metadata: media.metadataStatus } });
    return media;
  },

  async updatePhaseStatus(phaseId, status) {
    const phase = SEED_PHASES.find(p => p.id === phaseId);
    if (!phase) throw new Error('Phase introuvable.');
    // Releasing funds is NOT a status edit — it goes through releaseFunds (maker-checker).
    if (status === 'paid') throw new Error('Le passage en « Payée » se fait uniquement via le déblocage de fonds (séparation des pouvoirs).');
    const from = phase.status;
    phase.status = status;
    appendAudit({ action: 'update_phase_status', targetType: 'phase', targetId: phaseId, targetLabel: phase.label, metadata: { from, to: status } });
  },

  async releaseFunds(phaseId, controllerId) {
    const phase = SEED_PHASES.find(p => p.id === phaseId);
    if (!phase) throw new Error('Phase introuvable.');
    if (!RELEASABLE.includes(phase.status)) {
      throw new Error('La phase doit être inspectée et en attente de déblocage.');
    }
    const inspection = SEED_INSPECTIONS.find(i => i.phaseId === phaseId && i.result === 'pass' && !i.prePour);
    if (!inspection) throw new Error('Aucune inspection finale signée pour cette phase.');
    // Separation of powers (§3.10): the controller releasing funds must NOT be the
    // inspector who certified the work. The code enforces it — not just the UI.
    if (inspection.inspectorId === controllerId) {
      throw new Error('Séparation des pouvoirs : celui qui certifie le travail ne peut pas débloquer les fonds.');
    }
    SEED_FUND_RELEASES.push({
      id: newId('rel'), projectId: phase.projectId, phaseId,
      inspectionId: inspection.id,
      inspectorId: inspection.inspectorId, inspectorName: inspection.inspectorName,
      controllerId, controllerName: SEED_TEAM.find(t => t.id === controllerId)?.displayName ?? 'Contrôleur',
      amount: phase.estimate, releasedAt: new Date().toISOString(),
    });
    phase.status = 'paid';
    appendAudit({ actorId: controllerId, action: 'release_funds', targetType: 'phase', targetId: phaseId, targetLabel: phase.label, metadata: { amount: phase.estimate, inspector: inspection.inspectorName } });
  },

  async listRechargeRequests(filter) {
    return getMustafProvider().getRechargeRequests(filter);
  },

  // Validation : transforme la demande en dépôt réel (le solde monte). La logique
  // de création du dépôt vit dans le provider Mustaf (propriétaire des dépôts) ; ici
  // on ne fait qu'orchestrer + tracer l'action (§2, audit insert-only).
  async validateRecharge(id) {
    const { request, deposit } = await getMustafProvider().approveRecharge(id, { id: ADMIN_USER_ID, name: ADMIN_USER_NAME });
    appendAudit({
      action: 'validate_recharge', targetType: 'recharge', targetId: id,
      targetLabel: `${request.contributorName} — recharge`,
      metadata: { amount: request.amount, depositId: deposit.id, method: request.method },
    });
    return request;
  },

  // Refus : la demande est écartée, le solde ne bouge jamais.
  async rejectRecharge(id, reason) {
    const request = await getMustafProvider().rejectRecharge(id, { id: ADMIN_USER_ID, name: ADMIN_USER_NAME }, reason);
    appendAudit({
      action: 'reject_recharge', targetType: 'recharge', targetId: id,
      targetLabel: `${request.contributorName} — recharge`,
      metadata: { amount: request.amount, reason: reason ?? null },
    });
    return request;
  },

  async listTeam() {
    return [...SEED_TEAM].sort((a, b) => a.role.localeCompare(b.role));
  },

  async assignRole(input) {
    const member: TeamMember = {
      id: newId('user'), displayName: input.displayName, role: input.role,
      contact: input.contact, assignedProjectIds: [], status: 'active',
      createdAt: new Date().toISOString(),
    };
    SEED_TEAM.push(member);
    appendAudit({ action: 'assign_role', targetType: 'user', targetId: member.id, targetLabel: input.displayName, metadata: { role: input.role } });
    return member;
  },

  async rotateInspector(inspectorId, projectId) {
    const inspector = SEED_TEAM.find(t => t.id === inspectorId && t.role === 'inspector');
    if (!inspector) throw new Error('Inspecteur introuvable.');
    // Rotation lever (§8.4): pull every other inspector off this project, assign this one.
    SEED_TEAM.forEach(t => {
      if (t.role === 'inspector') {
        t.assignedProjectIds = t.assignedProjectIds.filter(p => p !== projectId);
      }
    });
    if (!inspector.assignedProjectIds.includes(projectId)) inspector.assignedProjectIds.push(projectId);
    appendAudit({ action: 'rotate_inspector', targetType: 'project', targetId: projectId, targetLabel: inspector.displayName, metadata: { inspectorId } });
    return inspector;
  },

  async listAnomalies() {
    return [...SEED_ANOMALIES].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async setAnomalyStatus(id, status) {
    const anom = SEED_ANOMALIES.find(a => a.id === id);
    if (!anom) throw new Error('Anomalie introuvable.');
    const from = anom.status;
    anom.status = status;
    appendAudit({ action: 'update_anomaly', targetType: 'anomaly', targetId: id, targetLabel: anom.message.slice(0, 40), metadata: { from, to: status } });
    return anom;
  },

  async listAudit(filter) {
    let rows = [...SEED_AUDIT];
    if (filter?.actorId) rows = rows.filter(r => r.actorId === filter.actorId);
    if (filter?.projectId) {
      // Best-effort: keep rows whose target relates to the project's phases/media/expenses.
      const mp = getMustafProvider();
      const phases = await mp.getPhases();
      const phaseIds = new Set(phases.map(p => p.id));
      rows = rows.filter(r =>
        (r.targetType === 'phase' && phaseIds.has(r.targetId)) ||
        r.targetType === 'expense' || r.targetType === 'media' || r.targetType === 'project',
      );
    }
    return rows.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  /* ---------------- Volet B : pilotage des employés ---------------- */

  async listEmployees() {
    // Operational workers only (the founder/admin isn't piloted like an employee).
    return SEED_TEAM.filter(t => t.role !== 'admin').map(member => {
      const tasks = SEED_TASKS.filter(t => t.assignedTo === member.id && t.status !== 'cancelled');
      const openAdvances = SEED_CASH_ADVANCES.filter(a => a.workerId === member.id && !a.reconciled);
      return {
        member,
        activeTasks: tasks.filter(t => t.status === 'assigned' || t.status === 'in_progress').length,
        unreconciledAdvances: openAdvances.length,
        outstandingAmount: openAdvances.reduce((s, a) => s + reconcileAdvance(a).gap, 0),
      } satisfies EmployeeRow;
    }).sort((a, b) => b.unreconciledAdvances - a.unreconciledAdvances);
  },

  async getEmployee(id) {
    const member = SEED_TEAM.find(t => t.id === id);
    if (!member) return null;
    const tasks = [...SEED_TASKS].filter(t => t.assignedTo === id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const sessions = [...SEED_WORK_SESSIONS].filter(s => s.workerId === id).sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
    const totalHours = sessions.reduce((s, ws) => s + hoursBetween(ws.startedAt, ws.endedAt), 0);
    const advances = SEED_CASH_ADVANCES.filter(a => a.workerId === id)
      .map(advance => ({
        advance,
        reconciliation: reconcileAdvance(advance),
        receipts: SEED_ADVANCE_RECEIPTS.filter(r => r.cashAdvanceId === advance.id),
      }));
    return { member, tasks, sessions, totalHours, advances };
  },

  async listTasks(filter) {
    let rows = [...SEED_TASKS];
    if (filter?.status) rows = rows.filter(t => t.status === filter.status);
    if (filter?.workerId) rows = rows.filter(t => t.assignedTo === filter.workerId);
    return rows.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getTask(id) {
    return SEED_TASKS.find(t => t.id === id) ?? null;
  },

  async createTask(input) {
    const worker = SEED_TEAM.find(t => t.id === input.assignedTo);
    if (!worker) throw new Error('Employé introuvable.');
    // Anti-fraud rule (§2.4): no new advance to a worker with an unreconciled one.
    if (input.advance) {
      const blocking = SEED_CASH_ADVANCES.find(a => a.workerId === input.assignedTo && !a.reconciled);
      if (blocking) {
        throw new Error(`Avance impossible : l’avance précédente de ${worker.displayName} n’est pas encore réconciliée.`);
      }
    }
    const task: Task = {
      id: newId('task'), projectId: input.projectId, projectName: input.projectName, landRef: input.landRef,
      assignedTo: input.assignedTo, assignedToName: worker.displayName,
      title: input.title, description: input.description, priority: input.priority,
      dueDate: input.dueDate, status: 'assigned',
      createdBy: ADMIN_USER_ID, createdAt: new Date().toISOString(),
    };
    SEED_TASKS.push(task);
    appendAudit({ action: 'assign_task', targetType: 'task', targetId: task.id, targetLabel: task.title, metadata: { worker: worker.displayName, terrain: task.landRef, priority: task.priority } });

    if (input.advance) {
      const advance: CashAdvance = {
        id: newId('adv'), taskId: task.id, workerId: worker.id, workerName: worker.displayName,
        amountGiven: input.advance.amountGiven, amountSpent: 0, amountReturned: 0, reconciled: false,
        purpose: input.advance.purpose, createdAt: new Date().toISOString(),
      };
      SEED_CASH_ADVANCES.push(advance);
      appendAudit({ action: 'create_advance', targetType: 'advance', targetId: advance.id, targetLabel: input.advance.purpose, metadata: { worker: worker.displayName, amount: advance.amountGiven } });
    }
    return task;
  },

  async cancelTask(id) {
    const task = SEED_TASKS.find(t => t.id === id);
    if (!task) throw new Error('Tâche introuvable.');
    task.status = 'cancelled';
    appendAudit({ action: 'cancel_task', targetType: 'task', targetId: id, targetLabel: task.title });
    return task;
  },

  async listReportReviews(filter) {
    let reports = [...SEED_FIELD_REPORTS];
    if (filter?.status) reports = reports.filter(r => r.status === filter.status);
    return reports
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
      .map(report => {
        const task = SEED_TASKS.find(t => t.id === report.taskId)!;
        const advance = SEED_CASH_ADVANCES.find(a => a.taskId === report.taskId);
        const receipts = advance ? SEED_ADVANCE_RECEIPTS.filter(r => r.cashAdvanceId === advance.id) : [];
        return {
          report, task, advance, receipts,
          reconciliation: advance ? reconcileAdvance(advance) : undefined,
        } satisfies ReportReview;
      });
  },

  async validateReport(reportId) {
    const report = SEED_FIELD_REPORTS.find(r => r.id === reportId);
    if (!report) throw new Error('Rendu-compte introuvable.');
    report.status = 'validated';
    const task = SEED_TASKS.find(t => t.id === report.taskId);
    if (task) task.status = 'validated';
    // Validating closes the loop: the advance is reconciled.
    const advance = SEED_CASH_ADVANCES.find(a => a.taskId === report.taskId);
    if (advance) advance.reconciled = true;
    appendAudit({ action: 'validate_report', targetType: 'report', targetId: reportId, targetLabel: task?.title ?? 'Rendu-compte', metadata: { task: task?.title } });
  },

  async requestReportFix(reportId) {
    const report = SEED_FIELD_REPORTS.find(r => r.id === reportId);
    if (!report) throw new Error('Rendu-compte introuvable.');
    report.status = 'needs_fix';
    const task = SEED_TASKS.find(t => t.id === report.taskId);
    if (task) task.status = 'in_progress';
    appendAudit({ action: 'request_fix', targetType: 'report', targetId: reportId, targetLabel: task?.title ?? 'Rendu-compte' });
  },

  async listIncidents(filter) {
    let rows = [...SEED_INCIDENTS];
    if (filter?.status) rows = rows.filter(i => i.status === filter.status);
    if (filter?.projectId) rows = rows.filter(i => i.projectId === filter.projectId);
    const rank: Record<TaskPriority, number> = { high: 0, medium: 1, low: 2 };
    // Open problems first, then by priority, then most recent.
    return rows.sort((a, b) =>
      (a.status === b.status ? 0 : a.status === 'to_resolve' ? -1 : 1) ||
      rank[a.priority] - rank[b.priority] ||
      new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
  },

  async resolveIncident(id) {
    const inc = SEED_INCIDENTS.find(i => i.id === id);
    if (!inc) throw new Error('Problème introuvable.');
    inc.status = 'resolved';
    appendAudit({ action: 'resolve_incident', targetType: 'incident', targetId: id, targetLabel: inc.description.slice(0, 40) });
    return inc;
  },

  async escalateIncident(id) {
    const inc = SEED_INCIDENTS.find(i => i.id === id);
    if (!inc) throw new Error('Problème introuvable.');
    inc.priority = 'high';   // escalation bumps priority; status stays "to resolve"
    appendAudit({ action: 'escalate_incident', targetType: 'incident', targetId: id, targetLabel: inc.description.slice(0, 40) });
    return inc;
  },

  async listProspectEntries(filter) {
    let rows = [...SEED_PROSPECT_ENTRIES];
    if (filter?.prospectorId) rows = rows.filter(p => p.prospectorId === filter.prospectorId);
    if (filter?.status) rows = rows.filter(p => p.status === filter.status);
    // Plus récents d'abord (par jour de prospection, puis par horodatage de saisie).
    return rows.sort((a, b) =>
      b.prospectedAt.localeCompare(a.prospectedAt) ||
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async countSentProspectEntries() {
    return SEED_PROSPECT_ENTRIES.filter(p => p.status === 'sent').length;
  },
};

let _provider: AdminProvider | null = null;

export function getAdminProvider(): AdminProvider {
  if (_provider) return _provider;
  // Switchable like the Sara/Mustaf data layers. The Supabase provider serves the
  // real subscriptions/team/audit/stats and delegates Mustaf (demo project kept)
  // and Volet B (shared with the employee space, migrated in a later phase) to the mock.
  //
  // Repli gracieux : la source « supabase » lit via la clé service_role (serveur
  // uniquement). Si cette clé — ou l'URL Supabase — manque (ex. variable absente
  // sur Vercel), on retombe sur le mock AU LIEU de planter tout l'espace admin en
  // 500. La vraie correction reste de définir SUPABASE_SERVICE_ROLE_KEY côté serveur.
  const wantsSupabase = process.env.NEXT_PUBLIC_DATA_SOURCE === 'supabase';
  const canUseSupabase =
    wantsSupabase &&
    !!process.env.SUPABASE_SERVICE_ROLE_KEY &&
    !!process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (canUseSupabase) {
    const { supabaseAdminProvider } = require('./supabase-provider');
    _provider = supabaseAdminProvider;
  } else {
    if (wantsSupabase) {
      console.warn(
        '[admin] NEXT_PUBLIC_DATA_SOURCE=supabase mais SUPABASE_SERVICE_ROLE_KEY (ou NEXT_PUBLIC_SUPABASE_URL) est absente — repli sur les données mock. Définis la clé service_role côté serveur pour activer le vrai back-office.',
      );
    }
    _provider = adminMockProvider;
  }
  return _provider!;
}

/** The acting admin for server actions (mock). Real impl reads auth.uid() + role. */
export { ADMIN_USER_ID, ADMIN_USER_NAME } from './seed';
