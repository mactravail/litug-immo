/* ============================================================
   Mustaf — data provider (mock-first).
   Same switchable shape as the Sara provider (lib/data/provider.ts):
   today it serves in-memory seed data; a Supabase implementation
   can be slotted in later behind getMustafProvider().
   All money is FCFA integers. Read-path only for this slice.
   ============================================================ */

import type {
  ConstructionProject, ProjectMember, EscrowSubaccount, Deposit, RechargeRequest,
  RechargeStatus, ConstructionPhase, Expense, MaterialOrder, Inspection, FundRelease,
  ConstructionMedia, ConstructionCompany, Anomaly, ProjectDocument,
  EscrowSummary, Participation, ProjectProgress, ProjectNotification,
} from './types';
import { formatFcfa } from '@/lib/utils';
import {
  SEED_PROJECT, SEED_MEMBERS, SEED_ESCROW, SEED_DEPOSITS, SEED_RECHARGE_REQUESTS,
  SEED_PHASES, SEED_EXPENSES, SEED_MATERIAL_ORDERS, SEED_INSPECTIONS, SEED_FUND_RELEASES,
  SEED_MEDIA, SEED_COMPANY, SEED_ANOMALIES, SEED_DOCUMENTS,
} from './seed';

/** A phase is "settled" once it has been paid or fully completed. */
const SETTLED: ReadonlyArray<ConstructionPhase['status']> = ['paid', 'completed'];

export interface MustafProvider {
  getProject(): Promise<ConstructionProject>;
  getMembers(): Promise<ProjectMember[]>;
  getEscrow(): Promise<EscrowSubaccount>;
  getDeposits(): Promise<Deposit[]>;
  getRechargeRequests(filter?: { status?: RechargeStatus }): Promise<RechargeRequest[]>;
  /** Sum of recharges still awaiting validation (shown to the client, never in the balance). */
  getPendingRechargeTotal(): Promise<number>;
  getPhases(): Promise<ConstructionPhase[]>;
  getExpenses(): Promise<Expense[]>;
  getMaterialOrders(): Promise<MaterialOrder[]>;
  getInspections(): Promise<Inspection[]>;
  getFundReleases(): Promise<FundRelease[]>;
  getMedia(): Promise<ConstructionMedia[]>;
  getCompany(): Promise<ConstructionCompany>;
  getAnomalies(): Promise<Anomaly[]>;
  getDocuments(): Promise<ProjectDocument[]>;
  // Computed view-models
  getEscrowSummary(): Promise<EscrowSummary>;
  getParticipation(): Promise<Participation[]>;
  getProgress(): Promise<ProjectProgress>;
  /** Client notifications, newest first — new photos, invoices, confirmed deposits. */
  getNotifications(): Promise<ProjectNotification[]>;
  // Mutations (simulated escrow — no real banking, mustaf.md §4/§12)
  /** A family member declares a Wave top-up → a PENDING request (balance unchanged). */
  requestRecharge(input: { contributorName: string; amount: number; note?: string }): Promise<RechargeRequest>;
  /** Admin validates a pending recharge → it becomes a real deposit, balance rises. */
  approveRecharge(id: string, reviewer: { id: string; name: string }): Promise<{ request: RechargeRequest; deposit: Deposit; balance: number }>;
  /** Admin rejects a pending recharge → discarded, balance never moves. */
  rejectRecharge(id: string, reviewer: { id: string; name: string }, reason?: string): Promise<RechargeRequest>;
}

const phasesByOrder = () => [...SEED_PHASES].sort((a, b) => a.order - b.order);

const totalDeposited = () => SEED_DEPOSITS.reduce((s, d) => s + d.amount, 0);
const totalReleased = () => SEED_FUND_RELEASES.reduce((s, r) => s + r.amount, 0);

/** Escrow balance is recomputed from deposits minus releases (mustaf.md §6). */
function escrowSummary(): EscrowSummary {
  const deposited = totalDeposited();
  const released = totalReleased();
  const balance = deposited - released;
  // The next phase to fund is the first unsettled phase still pending funding.
  const nextPhase = phasesByOrder().find(p => p.status === 'pending_funding');
  const shortfall = nextPhase ? Math.max(0, nextPhase.estimate - balance) : 0;
  return {
    balance,
    totalDeposited: deposited,
    totalReleased: released,
    custodian: SEED_ESCROW.custodian,
    custodianName: SEED_ESCROW.custodianName,
    nextPhase,
    shortfall,
  };
}

/** Participation % is computed from deposits — never an ownership share (§2.6). */
function participation(): Participation[] {
  const deposited = totalDeposited() || 1; // avoid /0
  return SEED_MEMBERS.map(member => {
    const total = SEED_DEPOSITS
      .filter(d => d.contributorId === member.userId)
      .reduce((s, d) => s + d.amount, 0);
    return { member, total, pct: (total / deposited) * 100 };
  }).sort((a, b) => b.total - a.total);
}

/**
 * Client notifications — derived from the events that matter to an owner watching
 * from abroad: a new geolocated photo of THEIR plot, a new supplier invoice, or a
 * deposit the back-office has confirmed. Mock-first: rebuilt from seed data, newest
 * first. "Read" state lives in the browser (localStorage), no per-user store yet.
 */
function notifications(): ProjectNotification[] {
  const phaseLabel = (phaseId: string) =>
    SEED_PHASES.find(p => p.id === phaseId)?.label ?? 'votre chantier';

  const fromMedia: ProjectNotification[] = SEED_MEDIA.map(m => ({
    id: `ntf-media-${m.id}`,
    kind: 'media',
    title: m.type === 'video' ? 'Nouvelle vidéo du chantier' : 'Nouvelle photo du chantier',
    body: `${phaseLabel(m.phaseId)}${m.caption ? ` — ${m.caption}` : ''}`,
    href: '/projet/chantier',
    createdAt: m.createdAt,
  }));

  const fromInvoices: ProjectNotification[] = SEED_EXPENSES
    .filter(e => e.invoiceUrl)
    .map(e => ({
      id: `ntf-inv-${e.id}`,
      kind: 'invoice',
      title: 'Nouvelle facture disponible',
      body: `${e.label} — ${formatFcfa(e.amount)}`,
      href: '/projet/depenses',
      createdAt: e.createdAt,
    }));

  const fromDeposits: ProjectNotification[] = SEED_DEPOSITS.map(d => ({
    id: `ntf-dep-${d.id}`,
    kind: 'deposit',
    title: 'Dépôt confirmé',
    body: `${d.contributorName} · ${formatFcfa(d.amount)} crédité sur le séquestre`,
    href: '/projet/epargne',
    createdAt: d.depositedAt,
  }));

  return [...fromMedia, ...fromInvoices, ...fromDeposits]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 20);
}

function progress(): ProjectProgress {
  const phases = phasesByOrder();
  const phasesPaid = phases.filter(p => SETTLED.includes(p.status)).length;
  const settledValue = phases
    .filter(p => SETTLED.includes(p.status))
    .reduce((s, p) => s + p.estimate, 0);
  const pctComplete = SEED_PROJECT.totalEstimate
    ? (settledValue / SEED_PROJECT.totalEstimate) * 100
    : 0;
  const currentPhase = phases.find(p => !SETTLED.includes(p.status));
  return { pctComplete, phasesPaid, phasesTotal: phases.length, currentPhase };
}

const mockProvider: MustafProvider = {
  async getProject() { return SEED_PROJECT; },
  async getMembers() { return SEED_MEMBERS; },
  async getEscrow() { return SEED_ESCROW; },
  async getDeposits() {
    return [...SEED_DEPOSITS].sort((a, b) => new Date(b.depositedAt).getTime() - new Date(a.depositedAt).getTime());
  },
  async getRechargeRequests(filter) {
    let rows = [...SEED_RECHARGE_REQUESTS];
    if (filter?.status) rows = rows.filter(r => r.status === filter.status);
    return rows.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
  },
  async getPendingRechargeTotal() {
    return SEED_RECHARGE_REQUESTS.filter(r => r.status === 'pending').reduce((s, r) => s + r.amount, 0);
  },
  async getPhases() { return phasesByOrder(); },
  async getExpenses() {
    return [...SEED_EXPENSES].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  async getMaterialOrders() { return SEED_MATERIAL_ORDERS; },
  async getInspections() { return SEED_INSPECTIONS; },
  async getFundReleases() { return SEED_FUND_RELEASES; },
  async getMedia() {
    return [...SEED_MEDIA].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  async getCompany() { return SEED_COMPANY; },
  async getAnomalies() { return SEED_ANOMALIES; },
  async getDocuments() { return SEED_DOCUMENTS; },
  async getEscrowSummary() { return escrowSummary(); },
  async getParticipation() { return participation(); },
  async getProgress() { return progress(); },
  async getNotifications() { return notifications(); },
  // A Wave top-up is DECLARED, not credited: it creates a PENDING request that
  // waits for admin validation. The balance does not move yet (§3.4). Match the
  // contributor to a known family member by display name when possible.
  async requestRecharge({ contributorName, amount, note }) {
    const name = contributorName.trim();
    const member = SEED_MEMBERS.find(
      m => m.displayName.toLowerCase() === name.toLowerCase()
    );
    const request: RechargeRequest = {
      id: `rch-${Date.now()}`,
      projectId: SEED_PROJECT.id,
      contributorId: member?.userId ?? `guest-${name.toLowerCase().replace(/\s+/g, '-')}`,
      contributorName: name,
      amount,
      method: 'wave',
      status: 'pending',
      note: note?.trim() || 'Recharge Wave',
      requestedAt: new Date().toISOString(),
    };
    SEED_RECHARGE_REQUESTS.push(request);
    return request;
  },

  // Validation by the admin turns the pending request into a real deposit — the
  // ONLY moment the escrow balance rises. Idempotent guard: only a pending request
  // can be validated.
  async approveRecharge(id, reviewer) {
    const request = SEED_RECHARGE_REQUESTS.find(r => r.id === id);
    if (!request) throw new Error('Demande de recharge introuvable.');
    if (request.status !== 'pending') throw new Error('Cette recharge a déjà été traitée.');
    const deposit: Deposit = {
      id: `dep-${Date.now()}`,
      projectId: request.projectId,
      contributorId: request.contributorId,
      contributorName: request.contributorName,
      amount: request.amount,
      depositedAt: new Date().toISOString(),
      note: request.note || 'Recharge Wave (validée)',
    };
    SEED_DEPOSITS.push(deposit);
    request.status = 'validated';
    request.reviewedById = reviewer.id;
    request.reviewedByName = reviewer.name;
    request.reviewedAt = new Date().toISOString();
    request.depositId = deposit.id;
    return { request, deposit, balance: totalDeposited() - totalReleased() };
  },

  // Rejection discards the request — the balance never moves.
  async rejectRecharge(id, reviewer, reason) {
    const request = SEED_RECHARGE_REQUESTS.find(r => r.id === id);
    if (!request) throw new Error('Demande de recharge introuvable.');
    if (request.status !== 'pending') throw new Error('Cette recharge a déjà été traitée.');
    request.status = 'rejected';
    request.reviewedById = reviewer.id;
    request.reviewedByName = reviewer.name;
    request.reviewedAt = new Date().toISOString();
    request.rejectionReason = reason?.trim() || undefined;
    return request;
  },
};

let _provider: MustafProvider | null = null;

export function getMustafProvider(): MustafProvider {
  if (_provider) return _provider;
  // Mock-first: a './supabase-provider' can replace this later, switched by
  // NEXT_PUBLIC_DATA_SOURCE exactly like the Sara provider.
  _provider = mockProvider;
  return _provider;
}
