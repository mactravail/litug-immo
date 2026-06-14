/* ============================================================
   Admin back-office — domain types.
   Code/DB in English; all user-facing copy stays French.
   Money is FCFA (integer); EUR computed for display only.
   Mock-first, switchable: a Supabase provider can replace the
   mock one later (migration 004), exactly like the Sara/Mustaf
   data layers.
   ============================================================ */

import type { SubscriptionTier, RechargeRequest } from '@/lib/mustaf/types';

/* --- Subscriptions (unified table: sellers + Mustaf clients) --- */

export type SubjectType = 'seller' | 'mustaf';

/** Admin lifecycle of any subscription. `revoked` = soft-delete (never hard-deleted). */
export type SubscriptionStatus = 'pending' | 'active' | 'suspended' | 'revoked';

export interface Subscription {
  id: string;
  subjectType: SubjectType;
  subjectId: string;          // sellers.id or construction_projects.id
  subjectName: string;        // denormalized for the list (business / owner name)
  contact?: string;           // phone or email, denormalized
  /** Seller plan label, or Mustaf tier code. Kept as string for one uniform UI. */
  tier: SubscriptionTier | string;
  status: SubscriptionStatus;
  zone?: string;              // Mustaf: land zone
  validatedBy?: string;       // admin user id who activated it
  validatedAt?: string;
  createdAt: string;
}

/* --- Invoices (services facturés : Sara, Mustaf, employés, libre) --- */

/** Qui est facturé. `other` = saisie libre (destinataire hors liste). */
export type InvoiceRecipientType = 'seller' | 'mustaf' | 'employee' | 'other';

/** État local de la facture, calqué sur Stripe (la facture naît `open`). */
export type InvoiceStatus = 'open' | 'paid' | 'void';

export interface Invoice {
  id: string;
  recipientType: InvoiceRecipientType;
  recipientName: string;
  recipientEmail: string;
  /** Abonnement/employé d'origine quand le destinataire vient de la liste. */
  subjectId?: string;
  description: string;
  amount: number;             // FCFA (entier) — source de vérité ; € calculé à l'affichage
  status: InvoiceStatus;
  stripeInvoiceId?: string;
  stripeNumber?: string;
  hostedInvoiceUrl?: string;
  invoicePdf?: string;
  createdBy: string;
  createdAt: string;
}

/** Une partie facturable proposée dans le formulaire (qui « doit un service »). */
export interface BillableParty {
  type: Exclude<InvoiceRecipientType, 'other'>;
  refId: string;              // subscription id ou employee id
  name: string;
  detail: string;             // palier vendeur, zone Mustaf, ou rôle employé
  email?: string;             // pré-rempli si le contact connu est un email
  suggestedAmount?: number;   // FCFA pré-rempli (prix du palier vendeur, etc.)
}

/* --- Audit log (insert-only; never updated/deleted) --- */

export type AuditAction =
  | 'validate_sub'
  | 'suspend_sub'
  | 'revoke_sub'
  | 'change_tier'
  | 'add_invoice'
  | 'issue_invoice'
  | 'add_media'
  | 'update_phase_status'
  | 'release_funds'
  | 'assign_role'
  | 'rotate_inspector'
  | 'update_anomaly'
  | 'assign_task'
  | 'create_advance'
  | 'validate_report'
  | 'request_fix'
  | 'cancel_task'
  | 'resolve_incident'
  | 'escalate_incident'
  | 'log_prospect'
  | 'submit_prospects'
  | 'validate_recharge'
  | 'reject_recharge';

export type AuditTargetType =
  | 'subscription'
  | 'invoice'
  | 'expense'
  | 'media'
  | 'phase'
  | 'user'
  | 'project'
  | 'anomaly'
  | 'task'
  | 'advance'
  | 'report'
  | 'incident'
  | 'prospect'
  | 'recharge';

export interface AuditLogEntry {
  id: string;
  actorId: string;
  actorName: string;          // denormalized
  action: AuditAction;
  targetType: AuditTargetType;
  targetId: string;
  targetLabel?: string;       // human-readable target for the audit screen
  metadata?: Record<string, unknown>;  // e.g. { from, to, amount }
  createdAt: string;
}

/* --- Team & roles (Mustaf operational roles + admin) --- */

export type TeamRole = 'admin' | 'procurement' | 'site_agent' | 'inspector' | 'controller' | 'prospector';

export interface TeamMember {
  id: string;
  displayName: string;
  role: TeamRole;
  contact?: string;
  /** For inspectors: project ids currently assigned (rotation lever, §8.4). */
  assignedProjectIds: string[];
  status: 'active' | 'inactive';
  createdAt: string;
}

/* --- Overview view-model (admin home) --- */

export interface AdminOverview {
  sellersActive: number;
  sellersPending: number;
  mustafByStatus: {
    pendingFunding: number;
    inProgress: number;
    awaitingInspection: number;
    completed: number;
  };
  queue: {
    subsToValidate: Subscription[];
    rechargesToValidate: RechargeRequest[];
    phasesAwaitingRelease: { projectId: string; projectName: string; phaseId: string; phaseLabel: string; amount: number }[];
    openAnomalies: number;
    reportsToReview: number;
    unreconciledAdvances: number;
    openIncidents: number;
  };
}

/* --- Business stats view-models (admin statistics screen) --- */

/** One revenue line (a money-in source) — FCFA only, € computed at display. */
export interface RevenueSource {
  key: 'seller_subscriptions' | 'phase_zero' | 'mustaf_commission' | 'verification';
  label: string;
  amount: number;
}

export interface RevenueStats {
  sellerMrr: number;        // recurring monthly revenue from active seller subs
  phaseZero: number;        // Phase 0 fixed fees collected
  mustafCommission: number; // Litug management fees (management_fee)
  verification: number;     // buyer verification fees
  total: number;
  bySource: RevenueSource[];
}

export interface SubscriptionStats {
  sold: number;             // total subscriptions ever created
  active: number;
  pending: number;
  suspended: number;
  revoked: number;
  byTier: { tier: string; count: number }[];
  churnCount: number;       // suspended + revoked
  churnRate: number;        // churnCount / sold (0–100)
}

export interface ActivityStats {
  landsTotal: number;
  landsAvailable: number;
  landsSold: number;
  landsVerified: number;
  leadsTotal: number;
  leadsQualified: number;
  leadsConverted: number;
  conversionRate: number;   // converted / total (0–100)
  visitsTotal: number;
}

export interface MustafStats {
  projects: number;
  phasesByStatus: { label: string; count: number }[];
  progressPct: number;      // global progress across phases
  escrowBalance: number;
  totalDeposited: number;
}

export interface MonthlyPoint {
  label: string;            // e.g. "mars 26"
  revenue: number;          // FCFA collected that month
  newSubs: number;          // subscriptions created that month
}

/** Everything the statistics screen needs, in one read. */
export interface SiteStats {
  revenue: RevenueStats;
  subscriptions: SubscriptionStats;
  activity: ActivityStats;
  mustaf: MustafStats;
  monthly: MonthlyPoint[];
}

/* --- Mustaf project row for the admin list --- */

export interface MustafProjectRow {
  projectId: string;
  landRef: string;
  ownerName: string;
  zone: string;
  tier: SubscriptionTier;
  currentPhaseLabel: string;
  projectStatusLabel: string;
  openAnomalies: number;
  subscriptionStatus: SubscriptionStatus;
}

/* ============================================================
   Volet B — pilotage des employés (tâches, avances, redditions,
   incidents). Money in FCFA integers; € computed at display.
   ============================================================ */

export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskStatus = 'assigned' | 'in_progress' | 'reported' | 'validated' | 'cancelled';

export interface Task {
  id: string;
  projectId: string;
  projectName: string;        // denormalized
  landRef: string;            // terrain id — same as the owner's, avoids mixing plots/works
  assignedTo: string;         // worker (TeamMember) id
  assignedToName: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  dueDate?: string;
  status: TaskStatus;
  createdBy: string;
  createdAt: string;
}

/** Cash handed to a worker for a task. Must reconcile: given = spent + returned. */
export interface CashAdvance {
  id: string;
  taskId: string;
  workerId: string;
  workerName: string;
  amountGiven: number;
  amountSpent: number;
  amountReturned: number;
  reconciled: boolean;
  purpose: string;
  createdAt: string;
}

/** A receipt justifying one expense out of a cash advance. */
export interface AdvanceReceipt {
  id: string;
  cashAdvanceId: string;
  label: string;
  amount: number;
  fileUrl?: string;
  createdAt: string;
}

/** Clock-in/out + what was done — powers the time-tracking view. */
export interface WorkSession {
  id: string;
  workerId: string;
  taskId: string;
  startedAt: string;
  endedAt?: string;
  summary?: string;
}

export type FieldReportStatus = 'submitted' | 'validated' | 'needs_fix';

/** A worker's account of a finished mission (money + work + problems). */
export interface FieldReport {
  id: string;
  taskId: string;
  workerId: string;
  workerName: string;
  amountRemaining: number;
  workDone: string;
  workRemaining?: string;
  submittedAt: string;
  status: FieldReportStatus;
}

export type IncidentStatus = 'to_resolve' | 'resolved';

export interface Incident {
  id: string;
  reportId?: string;
  projectId: string;
  projectName: string;
  raisedByName: string;
  description: string;
  location?: string;
  geo?: { lat: number; lng: number };
  priority: TaskPriority;
  occurredAt: string;
  status: IncidentStatus;
  createdAt: string;
}

/* ============================================================
   Prospection commerciale — second métier d'employé.
   Le prospecteur démarche, sur les réseaux sociaux, des gens qui
   vendent des terrains et leur propose Sara. Il consigne chaque
   jour qui il a prospecté et le résultat. Une ligne = un prospect.
   ============================================================ */

export type ProspectNetwork =
  | 'facebook' | 'instagram' | 'tiktok' | 'linkedin'
  | 'whatsapp' | 'youtube' | 'marketplace' | 'other';

/** Comment le contact a réellement eu lieu (si le prospect a répondu). */
export type ProspectContactMethod =
  | 'message' | 'comment' | 'call' | 'whatsapp' | 'in_person' | 'other';

/** Issue de la prise de contact. `no_response` = la personne n'a pas répondu. */
export type ProspectOutcome = 'no_response' | 'interested' | 'refused';

/** `draft` = saisi par le prospecteur, pas encore transmis ; `sent` = envoyé au superviseur (visible admin). */
export type ProspectStatus = 'draft' | 'sent';

export interface ProspectEntry {
  id: string;
  prospectorId: string;
  prospectorName: string;
  companyName: string;              // entreprise / vendeur prospecté
  network: ProspectNetwork;
  outcome: ProspectOutcome;
  contactMethod?: ProspectContactMethod;  // renseigné si la personne a répondu
  concern?: string;                 // son souci / pourquoi elle refuse Sara
  notes?: string;                   // libre
  status: ProspectStatus;
  prospectedAt: string;             // jour de prospection (YYYY-MM-DD)
  createdAt: string;
  sentAt?: string;                  // horodatage de transmission au superviseur
}

/* --- View-models (derived) --- */

export interface EmployeeRow {
  member: TeamMember;
  activeTasks: number;
  unreconciledAdvances: number;
  outstandingAmount: number;   // FCFA still unaccounted across open advances
}

export interface AdvanceReconciliation {
  given: number;
  spent: number;
  returned: number;
  gap: number;                 // given - spent - returned (should be 0)
  hasGap: boolean;
  missingReceipts: boolean;    // spent ≠ Σ receipts
}

export interface ReportReview {
  report: FieldReport;
  task: Task;
  advance?: CashAdvance;
  receipts: AdvanceReceipt[];
  reconciliation?: AdvanceReconciliation;
}
