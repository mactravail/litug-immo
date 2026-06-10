/* ============================================================
   Mustaf — data provider (mock-first).
   Same switchable shape as the Sara provider (lib/data/provider.ts):
   today it serves in-memory seed data; a Supabase implementation
   can be slotted in later behind getMustafProvider().
   All money is FCFA integers. Read-path only for this slice.
   ============================================================ */

import type {
  ConstructionProject, ProjectMember, EscrowSubaccount, Deposit,
  ConstructionPhase, Expense, MaterialOrder, Inspection, FundRelease,
  ConstructionMedia, ConstructionCompany, Anomaly, ProjectDocument,
  EscrowSummary, Participation, ProjectProgress,
} from './types';
import {
  SEED_PROJECT, SEED_MEMBERS, SEED_ESCROW, SEED_DEPOSITS, SEED_PHASES,
  SEED_EXPENSES, SEED_MATERIAL_ORDERS, SEED_INSPECTIONS, SEED_FUND_RELEASES,
  SEED_MEDIA, SEED_COMPANY, SEED_ANOMALIES, SEED_DOCUMENTS,
} from './seed';

/** A phase is "settled" once it has been paid or fully completed. */
const SETTLED: ReadonlyArray<ConstructionPhase['status']> = ['paid', 'completed'];

export interface MustafProvider {
  getProject(): Promise<ConstructionProject>;
  getMembers(): Promise<ProjectMember[]>;
  getEscrow(): Promise<EscrowSubaccount>;
  getDeposits(): Promise<Deposit[]>;
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
};

let _provider: MustafProvider | null = null;

export function getMustafProvider(): MustafProvider {
  if (_provider) return _provider;
  // Mock-first: a './supabase-provider' can replace this later, switched by
  // NEXT_PUBLIC_DATA_SOURCE exactly like the Sara provider.
  _provider = mockProvider;
  return _provider;
}
