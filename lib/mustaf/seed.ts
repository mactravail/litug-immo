/* ============================================================
   Mustaf — seed / demo data for the vertical slice (mustaf.md §8).
   1 project · 1 family with 3 contributors · 4 phases · the
   foundation taken all the way to `paid`.
   ⚠️ Demo data — never presented as a real verification.
   ============================================================ */

import type {
  ConstructionProject, ProjectMember, EscrowSubaccount, Deposit,
  ConstructionPhase, Expense, MaterialOrder, Inspection, FundRelease,
  ConstructionMedia, ConstructionCompany, Anomaly, ProjectDocument,
} from './types';

const PROJECT_ID = 'cproj-1';

/* --- Users (ids referenced across the seed) --- */
const OWNER_ID = 'user-modou';
const SITE_AGENT_ID = 'user-site-baba';
const INSPECTOR_ID = 'user-insp-awa';
const CONTROLLER_ID = 'user-ctrl-ndiaye';
const PROCUREMENT_ID = 'user-proc-sega';

export const SEED_PROJECT: ConstructionProject = {
  id: PROJECT_ID,
  landId: 'land-1',
  landTitle: 'Terrain TF — Cité Keur Gorgui, Dakar',
  ownerId: OWNER_ID,
  ownerName: 'Modou Fall',
  subscriptionTier: 'serenite',
  phaseZeroFee: 750_000,
  totalEstimate: 15_000_000,
  zone: 'Dakar',
  status: 'active',
  createdAt: '2026-03-15T09:00:00Z',
};

export const SEED_MEMBERS: ProjectMember[] = [
  { id: 'pm-modou', projectId: PROJECT_ID, userId: OWNER_ID,     displayName: 'Modou Fall',   joinedAt: '2026-03-15T09:00:00Z' },
  { id: 'pm-fatou', projectId: PROJECT_ID, userId: 'user-fatou', displayName: 'Fatou Ndiaye', joinedAt: '2026-03-16T10:00:00Z' },
  { id: 'pm-aicha', projectId: PROJECT_ID, userId: 'user-aicha', displayName: 'Aïcha Sow',    joinedAt: '2026-03-18T14:00:00Z' },
];

export const SEED_ESCROW: EscrowSubaccount = {
  id: 'esc-1',
  projectId: PROJECT_ID,
  custodian: 'notaire',
  custodianName: 'Étude Me Awa Sow (notaire)',
  simulated: true,
};

// Total deposited = 2 300 000 FCFA. Foundation (1 800 000) already released
// → current balance = 500 000 FCFA.
export const SEED_DEPOSITS: Deposit[] = [
  { id: 'dep-1', projectId: PROJECT_ID, contributorId: OWNER_ID,     contributorName: 'Modou Fall',   amount: 500_000, depositedAt: '2026-04-12T08:30:00Z', note: 'Premier versement' },
  { id: 'dep-2', projectId: PROJECT_ID, contributorId: 'user-aicha', contributorName: 'Aïcha Sow',    amount: 500_000, depositedAt: '2026-04-15T11:00:00Z' },
  { id: 'dep-3', projectId: PROJECT_ID, contributorId: 'user-fatou', contributorName: 'Fatou Ndiaye', amount: 400_000, depositedAt: '2026-04-18T16:20:00Z' },
  { id: 'dep-4', projectId: PROJECT_ID, contributorId: OWNER_ID,     contributorName: 'Modou Fall',   amount: 250_000, depositedAt: '2026-05-08T09:10:00Z' },
  { id: 'dep-5', projectId: PROJECT_ID, contributorId: 'user-aicha', contributorName: 'Aïcha Sow',    amount: 300_000, depositedAt: '2026-05-20T13:45:00Z' },
  { id: 'dep-6', projectId: PROJECT_ID, contributorId: 'user-fatou', contributorName: 'Fatou Ndiaye', amount: 120_000, depositedAt: '2026-05-22T18:00:00Z' },
  { id: 'dep-7', projectId: PROJECT_ID, contributorId: OWNER_ID,     contributorName: 'Modou Fall',   amount: 150_000, depositedAt: '2026-06-03T07:40:00Z' },
  { id: 'dep-8', projectId: PROJECT_ID, contributorId: 'user-fatou', contributorName: 'Fatou Ndiaye', amount:  80_000, depositedAt: '2026-06-03T19:05:00Z', note: 'Tabaski' },
];

export const SEED_PHASES: ConstructionPhase[] = [
  {
    id: 'phase-foundation', projectId: PROJECT_ID, name: 'foundation', label: 'Fondation',
    order: 1, estimate: 1_800_000, requiresPrePourCheck: true, siteAgentId: SITE_AGENT_ID,
    status: 'paid', validityUntil: '2026-07-31', startedAt: '2026-05-02T08:00:00Z', completedAt: '2026-05-28T17:00:00Z',
  },
  {
    id: 'phase-walls', projectId: PROJECT_ID, name: 'walls', label: 'Murs (élévation)',
    order: 2, estimate: 4_500_000, requiresPrePourCheck: false, siteAgentId: SITE_AGENT_ID,
    status: 'pending_funding', validityUntil: '2026-08-31',
  },
  {
    id: 'phase-roof', projectId: PROJECT_ID, name: 'roof', label: 'Toiture',
    order: 3, estimate: 3_200_000, requiresPrePourCheck: false, siteAgentId: SITE_AGENT_ID,
    status: 'pending_funding', validityUntil: '2026-09-30',
  },
  {
    id: 'phase-finishing', projectId: PROJECT_ID, name: 'finishing', label: 'Finitions',
    order: 4, estimate: 5_500_000, requiresPrePourCheck: false, siteAgentId: SITE_AGENT_ID,
    status: 'pending_funding', validityUntil: '2026-11-30',
  },
];

// Foundation expenses sum exactly to the 1 800 000 release. The Phase 0 fee
// (plan + permis + étude de sol) is a separate upfront line.
export const SEED_EXPENSES: Expense[] = [
  { id: 'exp-1', projectId: PROJECT_ID, phaseId: 'phase-foundation', category: 'phase_zero',     label: 'Honoraires Phase 0 — plan d’architecte + permis + étude de sol', amount: 750_000, supplierName: 'Litug', invoiceUrl: '#', createdAt: '2026-03-20T10:00:00Z' },
  { id: 'exp-2', projectId: PROJECT_ID, phaseId: 'phase-foundation', category: 'materials',      label: 'Ciment (120 sacs)',          amount: 470_000, supplierName: 'Sococim',       invoiceUrl: '#', createdAt: '2026-05-04T09:00:00Z' },
  { id: 'exp-3', projectId: PROJECT_ID, phaseId: 'phase-foundation', category: 'materials',      label: 'Fer à béton (acier HA)',     amount: 510_000, supplierName: 'Fougerolle',    invoiceUrl: '#', createdAt: '2026-05-05T09:00:00Z' },
  { id: 'exp-4', projectId: PROJECT_ID, phaseId: 'phase-foundation', category: 'materials',      label: 'Sable & gravier',            amount: 140_000, supplierName: 'Carrière Diack', invoiceUrl: '#', createdAt: '2026-05-06T09:00:00Z' },
  { id: 'exp-5', projectId: PROJECT_ID, phaseId: 'phase-foundation', category: 'materials',      label: 'Eau de gâchage',             amount:  30_000, supplierName: 'SDE',           invoiceUrl: '#', createdAt: '2026-05-07T09:00:00Z' },
  { id: 'exp-6', projectId: PROJECT_ID, phaseId: 'phase-foundation', category: 'labor',          label: 'Main-d’œuvre maçons',        amount: 380_000, supplierName: 'Téranga BTP',   invoiceUrl: '#', createdAt: '2026-05-26T09:00:00Z' },
  { id: 'exp-7', projectId: PROJECT_ID, phaseId: 'phase-foundation', category: 'transport',      label: 'Transport des matériaux',    amount:  90_000, supplierName: 'Transport Mbao', invoiceUrl: '#', createdAt: '2026-05-10T09:00:00Z' },
  { id: 'exp-8', projectId: PROJECT_ID, phaseId: 'phase-foundation', category: 'management_fee', label: 'Commission Litug (Sérénité)', amount: 180_000, supplierName: 'Litug',         invoiceUrl: '#', createdAt: '2026-05-28T09:00:00Z' },
];

// Reconciliation gap: 8 sacs ordered/received but not used → flagged.
export const SEED_MATERIAL_ORDERS: MaterialOrder[] = [
  { id: 'mord-1', projectId: PROJECT_ID, phaseId: 'phase-foundation', item: 'Ciment',       qtyOrdered: 120, qtyReceived: 120, qtyUsed: 112, unit: 'sac', supplierName: 'Sococim',    invoiceUrl: '#', createdAt: '2026-05-04T09:00:00Z' },
  { id: 'mord-2', projectId: PROJECT_ID, phaseId: 'phase-foundation', item: 'Fer à béton',  qtyOrdered: 2.4, qtyReceived: 2.4, qtyUsed: 2.4, unit: 't',   supplierName: 'Fougerolle', invoiceUrl: '#', createdAt: '2026-05-05T09:00:00Z' },
];

export const SEED_INSPECTIONS: Inspection[] = [
  {
    id: 'insp-pre', projectId: PROJECT_ID, phaseId: 'phase-foundation', inspectorId: INSPECTOR_ID, inspectorName: 'Awa Diallo',
    prePour: true, result: 'pass', signedAt: '2026-05-18T15:30:00Z', signature: 'Awa Diallo — Inspecteur indépendant',
    checklist: [
      { label: 'Ferraillage compté : 32 barres Ø12 conformes au plan', ok: true },
      { label: 'Espacement des aciers conforme', ok: true },
      { label: 'Enrobage béton respecté', ok: true },
      { label: 'Coffrage stable et étanche', ok: true },
    ],
  },
  {
    id: 'insp-final', projectId: PROJECT_ID, phaseId: 'phase-foundation', inspectorId: INSPECTOR_ID, inspectorName: 'Awa Diallo',
    prePour: false, result: 'pass', signedAt: '2026-05-28T16:00:00Z', signature: 'Awa Diallo — Inspecteur indépendant',
    checklist: [
      { label: 'Béton coulé sans nid de gravier', ok: true },
      { label: 'Niveau et équerrage corrects', ok: true },
      { label: 'Cure du béton réalisée', ok: true },
    ],
  },
];

// Maker-checker: inspector ≠ controller, and neither is the phase's site agent.
export const SEED_FUND_RELEASES: FundRelease[] = [
  {
    id: 'rel-1', projectId: PROJECT_ID, phaseId: 'phase-foundation', inspectionId: 'insp-final',
    inspectorId: INSPECTOR_ID, inspectorName: 'Awa Diallo',
    controllerId: CONTROLLER_ID, controllerName: 'Cheikh Ndiaye',
    amount: 1_800_000, releasedAt: '2026-05-29T10:00:00Z',
  },
];

export const SEED_MEDIA: ConstructionMedia[] = [
  {
    id: 'med-1', projectId: PROJECT_ID, phaseId: 'phase-foundation', url: '#', type: 'photo',
    caption: 'Ferraillage des semelles', capturedAt: '2026-05-18T15:10:00Z',
    geo: { lat: 14.7167, lng: -17.4677 }, metadataStatus: 'verified', uploadedBy: INSPECTOR_ID, createdAt: '2026-05-18T15:12:00Z',
  },
  {
    id: 'med-2', projectId: PROJECT_ID, phaseId: 'phase-foundation', url: '#', type: 'photo',
    caption: 'Coulage de la fondation', capturedAt: '2026-05-22T11:40:00Z',
    geo: { lat: 14.7168, lng: -17.4676 }, metadataStatus: 'verified', uploadedBy: SITE_AGENT_ID, createdAt: '2026-05-22T11:42:00Z',
  },
  {
    id: 'med-3', projectId: PROJECT_ID, phaseId: 'phase-foundation', url: '#', type: 'photo',
    caption: 'Livraison ciment', metadataStatus: 'unverified_metadata', uploadedBy: PROCUREMENT_ID, createdAt: '2026-05-04T10:30:00Z',
  },
];

export const SEED_COMPANY: ConstructionCompany = {
  id: 'comp-1', name: 'Téranga BTP', rating: 4.7, retentionPct: 10, status: 'vetted',
};

export const SEED_ANOMALIES: Anomaly[] = [
  {
    id: 'anom-1', projectId: PROJECT_ID, raisedBy: OWNER_ID, raisedByName: 'Modou Fall',
    targetType: 'media', targetId: 'med-3',
    message: 'Cette photo n’a ni date ni position GPS — pouvez-vous confirmer qu’elle vient bien de mon chantier ?',
    status: 'open', createdAt: '2026-06-04T08:00:00Z',
  },
];

export const SEED_DOCUMENTS: ProjectDocument[] = [
  { id: 'doc-1', projectId: PROJECT_ID, category: 'plan',    label: 'Plan d’architecte',                url: '#', createdAt: '2026-03-19T10:00:00Z' },
  { id: 'doc-2', projectId: PROJECT_ID, category: 'permis',  label: 'Permis de construire',             url: '#', createdAt: '2026-04-02T10:00:00Z' },
  { id: 'doc-3', projectId: PROJECT_ID, category: 'devis',   label: 'Devis détaillé', phaseLabel: 'Fondation', url: '#', createdAt: '2026-04-25T10:00:00Z' },
  { id: 'doc-4', projectId: PROJECT_ID, category: 'devis',   label: 'Devis détaillé', phaseLabel: 'Murs (élévation)', url: '#', createdAt: '2026-04-25T10:00:00Z' },
  { id: 'doc-5', projectId: PROJECT_ID, category: 'contrat', label: 'Contrat entreprise — Téranga BTP', url: '#', createdAt: '2026-04-28T10:00:00Z' },
];
