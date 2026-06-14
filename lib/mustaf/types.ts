/* ============================================================
   Mustaf (construction module) — domain types.
   Code/DB in English; all user-facing copy stays French.
   Money is in FCFA (integer, no decimals); EUR is computed
   for display only. Mirrors the data model in mustaf.md §4.
   ============================================================ */

export type SubscriptionTier = 'suivi' | 'serenite' | 'tranquillite';
export type ProjectStatus = 'onboarding' | 'active' | 'paused' | 'completed';

export type PhaseStatus =
  | 'pending_funding'
  | 'funded'
  | 'in_progress'
  | 'pre_pour_verified'
  | 'awaiting_inspection'
  | 'inspected'
  | 'awaiting_release'
  | 'paid'
  | 'completed';

export type ExpenseCategory = 'materials' | 'labor' | 'transport' | 'management_fee' | 'phase_zero';
export type Custodian = 'notaire' | 'partner_bank';
export type MediaType = 'photo' | 'video';
export type MetadataStatus = 'verified' | 'unverified_metadata';
export type InspectionResult = 'pass' | 'fail' | 'needs_rework';
export type AnomalyTarget = 'expense' | 'phase' | 'media';
export type AnomalyStatus = 'open' | 'reviewing' | 'resolved';
export type DocumentCategory = 'plan' | 'permis' | 'devis' | 'contrat';

/** A construction project tied to one verified plot, owned by one diaspora client. */
export interface ConstructionProject {
  id: string;
  landId: string;
  /** Human-readable terrain reference — the SAME id shown to the owner and on
   *  every task, so land plots and their works are never confused. */
  landRef: string;
  landTitle: string;      // denormalized for display
  ownerId: string;
  ownerName: string;
  subscriptionTier: SubscriptionTier;
  phaseZeroFee: number;
  totalEstimate: number;
  zone: string;
  status: ProjectStatus;
  createdAt: string;
}

/** A family co-contributor. Participation % is COMPUTED from deposits, never ownership. */
export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  displayName: string;
  joinedAt: string;
}

/** One ring-fenced escrow sub-account per project (simulated — no real banking). */
export interface EscrowSubaccount {
  id: string;
  projectId: string;
  custodian: Custodian;
  custodianName: string;  // e.g. "Étude Me Awa Sow"
  simulated: boolean;
}

/** A deposit raises the escrow balance — the only way a phase gets funded. */
export interface Deposit {
  id: string;
  projectId: string;
  contributorId: string;
  contributorName: string; // denormalized
  amount: number;
  depositedAt: string;
  note?: string;
}

export type RechargeStatus = 'pending' | 'validated' | 'rejected';

/**
 * A top-up *declared* by a family member ("j'ai envoyé X par Wave"). It does NOT
 * raise the escrow balance: it waits in the admin's validation queue. Only once
 * the back-office confirms the money was actually received does it become a real
 * Deposit (status `validated`). Rejected requests never touch the balance.
 * Trust rule (§3.4): money moves only after a human control, never automatically.
 */
export interface RechargeRequest {
  id: string;
  projectId: string;
  contributorId: string;
  contributorName: string; // denormalized
  amount: number;
  method: 'wave';          // simulé — Wave pour l'instant (§4/§12)
  status: RechargeStatus;
  note?: string;
  requestedAt: string;
  reviewedById?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  depositId?: string;      // set when validated → the deposit it created
  rejectionReason?: string;
}

export interface ConstructionPhase {
  id: string;
  projectId: string;
  name: string;           // code: foundation | walls | roof | finishing ...
  label: string;          // French display label
  order: number;
  estimate: number;
  requiresPrePourCheck: boolean;
  siteAgentId: string;
  status: PhaseStatus;
  validityUntil: string;  // devis expiry
  startedAt?: string;
  completedAt?: string;
}

export interface Expense {
  id: string;
  projectId: string;
  phaseId: string;
  category: ExpenseCategory;
  label: string;
  amount: number;
  supplierName?: string;
  invoiceUrl?: string;
  createdAt: string;
}

/** Quantity reconciliation — the app flags any ordered-vs-used gap. */
export interface MaterialOrder {
  id: string;
  projectId: string;
  phaseId: string;
  item: string;
  qtyOrdered: number;
  qtyReceived: number;
  qtyUsed: number;
  unit: string;
  supplierName?: string;
  invoiceUrl?: string;
  createdAt: string;
}

export interface Inspection {
  id: string;
  projectId: string;
  phaseId: string;
  inspectorId: string;
  inspectorName: string;
  prePour: boolean;
  checklist: { label: string; ok: boolean }[];
  result: InspectionResult;
  signedAt?: string;
  signature?: string;     // inspector identity
}

/** Maker-checker release: inspector certifies (maker), controller releases (checker). */
export interface FundRelease {
  id: string;
  projectId: string;
  phaseId: string;
  inspectionId: string;
  inspectorId: string;
  inspectorName: string;
  controllerId: string;
  controllerName: string;
  amount: number;
  releasedAt: string;
}

export interface ConstructionMedia {
  id: string;
  projectId: string;
  phaseId: string;
  url: string;
  type: MediaType;
  caption?: string;
  capturedAt?: string;
  geo?: { lat: number; lng: number };
  metadataStatus: MetadataStatus;
  uploadedBy: string;
  createdAt: string;
}

export interface ConstructionCompany {
  id: string;
  name: string;
  rating: number;
  retentionPct: number;   // retenue de garantie, default 10
  status: 'vetted' | 'suspended';
}

export interface Anomaly {
  id: string;
  projectId: string;
  raisedBy: string;
  raisedByName: string;
  targetType: AnomalyTarget;
  targetId: string;
  message: string;
  status: AnomalyStatus;
  createdAt: string;
}

export interface ProjectDocument {
  id: string;
  projectId: string;
  category: DocumentCategory;
  label: string;
  phaseLabel?: string;
  url?: string;
  createdAt: string;
}

/* --- Computed view-models (derived, never stored) --- */

export interface EscrowSummary {
  balance: number;
  totalDeposited: number;
  totalReleased: number;
  custodian: Custodian;
  custodianName: string;
  nextPhase?: ConstructionPhase;
  shortfall: number;       // FCFA still missing to fund nextPhase
}

export interface Participation {
  member: ProjectMember;
  total: number;
  pct: number;
}

export interface ProjectProgress {
  pctComplete: number;
  phasesPaid: number;
  phasesTotal: number;
  currentPhase?: ConstructionPhase;
}
