/* ============================================================
   Admin back-office — seed / demo data (mock-first slice).
   ⚠️ Demo data — never presented as a real verification or a
   real payment. Escrow stays simulated (CLAUDE.md §12).
   ============================================================ */

import type {
  Subscription, TeamMember, AuditLogEntry, Invoice, ProspectEntry, ProspectorWorkDay,
  Task, CashAdvance, AdvanceReceipt, WorkSession, FieldReport, Incident,
} from './types';
import { SELLER_ID, SEED_SELLER } from '@/lib/data/seed';
import { SEED_PROJECT } from '@/lib/mustaf/seed';

/** The founder wears every hat at the start, but stays distinct from the inspector. */
export const ADMIN_USER_ID = 'user-admin-founder';
export const ADMIN_USER_NAME = 'Mactar (fondateur)';

/* --- Unified subscriptions: sellers (Sara) + Mustaf clients --- */
export const SEED_SUBSCRIPTIONS: Subscription[] = [
  // Real seed seller — has a full detail page (lands, leads).
  {
    id: 'sub-seller-001', subjectType: 'seller', subjectId: SELLER_ID,
    subjectName: SEED_SELLER.businessName, contact: SEED_SELLER.phone,
    tier: 'Sara Standard', status: 'active',
    validatedBy: ADMIN_USER_ID, validatedAt: '2026-01-15T10:30:00Z',
    createdAt: SEED_SELLER.createdAt,
  },
  // Demo sellers awaiting validation / suspended (list-only).
  {
    id: 'sub-seller-002', subjectType: 'seller', subjectId: 'seller-002',
    subjectName: 'Teranga Immobilier', contact: '+221 77 123 45 67',
    tier: 'Sara Standard', status: 'pending',
    createdAt: '2026-06-05T09:00:00Z',
  },
  {
    id: 'sub-seller-003', subjectType: 'seller', subjectId: 'seller-003',
    subjectName: 'Diaspora Foncier SARL', contact: 'contact@diaspora-foncier.sn',
    tier: 'Sara Pro', status: 'pending',
    createdAt: '2026-06-07T14:00:00Z',
  },
  {
    id: 'sub-seller-004', subjectType: 'seller', subjectId: 'seller-004',
    subjectName: 'Khadim Promotion', contact: '+221 78 987 65 43',
    tier: 'Sara Standard', status: 'suspended',
    validatedBy: ADMIN_USER_ID, validatedAt: '2026-04-02T11:00:00Z',
    createdAt: '2026-03-28T08:00:00Z',
  },
  // Real Mustaf project — full detail page.
  {
    id: 'sub-mustaf-001', subjectType: 'mustaf', subjectId: SEED_PROJECT.id,
    subjectName: SEED_PROJECT.ownerName, contact: '+39 351 22 33 44',
    tier: SEED_PROJECT.subscriptionTier, status: 'active', zone: SEED_PROJECT.zone,
    validatedBy: ADMIN_USER_ID, validatedAt: '2026-03-15T09:30:00Z',
    createdAt: SEED_PROJECT.createdAt,
  },
];

/* --- Factures émises (vide au départ : seules de vraies factures Stripe s'y
   ajoutent, jamais de fausse facture présentée comme réelle, CLAUDE.md §12). --- */
export const SEED_INVOICES: Invoice[] = [];

/* --- Team & operational roles (separation of powers, §3.10) --- */
export const SEED_TEAM: TeamMember[] = [
  { id: ADMIN_USER_ID,        displayName: ADMIN_USER_NAME, role: 'admin',      status: 'active', assignedProjectIds: [], createdAt: '2026-01-01T00:00:00Z' },
  { id: 'user-proc-sega',     displayName: 'Séga Diop',     role: 'procurement', contact: '+221 77 200 10 10', status: 'active', assignedProjectIds: ['cproj-1'], createdAt: '2026-02-01T00:00:00Z' },
  { id: 'user-site-baba',     displayName: 'Baba Sarr',     role: 'site_agent',  contact: '+221 77 300 20 20', status: 'active', assignedProjectIds: ['cproj-1'], createdAt: '2026-02-01T00:00:00Z' },
  { id: 'user-insp-awa',      displayName: 'Awa Diallo',    role: 'inspector',   contact: '+221 77 400 30 30', status: 'active', assignedProjectIds: ['cproj-1'], createdAt: '2026-02-01T00:00:00Z' },
  { id: 'user-insp-ml',       displayName: 'Moussa Lô',     role: 'inspector',   contact: '+221 77 401 31 31', status: 'active', assignedProjectIds: [], createdAt: '2026-02-15T00:00:00Z' },
  { id: 'user-ctrl-ndiaye',   displayName: 'Cheikh Ndiaye', role: 'controller',  contact: '+221 77 500 40 40', status: 'active', assignedProjectIds: ['cproj-1'], createdAt: '2026-02-01T00:00:00Z' },
  // Second métier : prospecteur commercial (démarche les vendeurs sur les réseaux pour Sara).
  { id: 'user-prosp-fatou',   displayName: 'Fatou Ndoye',   role: 'prospector',  contact: '+221 77 600 50 50', status: 'active', assignedProjectIds: [], createdAt: '2026-05-20T00:00:00Z' },
];

/* --- Prospection commerciale : carnet de bord du prospecteur (démo).
   Adossé à globalThis pour SURVIVRE au rechargement à chaud (dev) et rester une
   seule et même liste partagée entre l'espace prospecteur et l'admin dans un même
   process. (En déployé multi-instances, la vraie persistance passera par Supabase.) --- */
const _prospectStore = globalThis as unknown as { __litugProspects?: ProspectEntry[] };
export const SEED_PROSPECT_ENTRIES: ProspectEntry[] =
  _prospectStore.__litugProspects ?? (_prospectStore.__litugProspects = [
  {
    id: 'prosp-1', prospectorId: 'user-prosp-fatou', prospectorName: 'Fatou Ndoye',
    companyName: 'Keur Massar Immobilier', contactName: 'M. Diouf', contactPhone: '+221 77 111 22 33',
    followers: 24_500, network: 'facebook', outcome: 'interested', contactMethod: 'message',
    notes: 'Vend 3 terrains à Keur Massar. Veut une démo de Sara cette semaine.',
    status: 'sent', prospectedAt: '2026-06-11', createdAt: '2026-06-11T16:20:00Z', sentAt: '2026-06-11T19:00:00Z',
  },
  {
    id: 'prosp-2', prospectorId: 'user-prosp-fatou', prospectorName: 'Fatou Ndoye',
    companyName: 'Promoteur Diamniadio', contactName: 'Mme Sow', contactPhone: '+221 78 444 55 66',
    followers: 8_200, network: 'instagram', outcome: 'refused', contactMethod: 'comment',
    concern: 'Pense que c’est trop cher et préfère vendre lui-même via WhatsApp.',
    status: 'sent', prospectedAt: '2026-06-11', createdAt: '2026-06-11T17:05:00Z', sentAt: '2026-06-11T19:00:00Z',
  },
  {
    id: 'prosp-3', prospectorId: 'user-prosp-fatou', prospectorName: 'Fatou Ndoye',
    companyName: 'Saly Terrains & Co', contactPhone: '+221 76 777 88 99',
    followers: 152_000, network: 'tiktok', outcome: 'no_response',
    status: 'sent', prospectedAt: '2026-06-11', createdAt: '2026-06-11T17:40:00Z', sentAt: '2026-06-11T19:00:00Z',
  },
  {
    id: 'prosp-4', prospectorId: 'user-prosp-fatou', prospectorName: 'Fatou Ndoye',
    companyName: 'Mbour Foncier', contactName: 'Pape Gueye', contactPhone: '+221 70 222 33 44',
    followers: 3_400, network: 'whatsapp', outcome: 'refused', contactMethod: 'whatsapp',
    concern: 'Peur de payer un abonnement sans être sûr de vendre. Veut des témoignages.',
    status: 'sent', prospectedAt: '2026-06-10', createdAt: '2026-06-10T15:10:00Z', sentAt: '2026-06-10T18:30:00Z',
  },
  // À prospecter : trouvée sur Marketplace, contact noté, pas encore appelée.
  {
    id: 'prosp-5', prospectorId: 'user-prosp-fatou', prospectorName: 'Fatou Ndoye',
    companyName: 'Rufisque Immo Services', contactName: 'Aïssatou Ba', contactPhone: '+221 77 888 99 00',
    followers: 47_800, network: 'marketplace', outcome: 'to_contact',
    notes: 'Plusieurs annonces de terrains à Rufisque. À appeler en début de semaine.',
    status: 'draft', prospectedAt: '2026-06-15', createdAt: '2026-06-15T09:30:00Z',
  },
]);

/* --- Pointage des prospecteurs : leurs journées de travail (date + heures).
   Même store globalThis que les prospections, pour survivre au HMR en dev. --- */
const _workdayStore = globalThis as unknown as { __litugProspectorWorkDays?: ProspectorWorkDay[] };
export const SEED_PROSPECTOR_WORKDAYS: ProspectorWorkDay[] =
  _workdayStore.__litugProspectorWorkDays ?? (_workdayStore.__litugProspectorWorkDays = [
  {
    id: 'wd-1', workerId: 'user-prosp-fatou', workerName: 'Fatou Ndoye',
    workDate: '2026-06-11', hours: 6, note: 'Démarchage Facebook + Instagram, 3 prospects.',
    createdAt: '2026-06-11T19:05:00Z',
  },
  {
    id: 'wd-2', workerId: 'user-prosp-fatou', workerName: 'Fatou Ndoye',
    workDate: '2026-06-10', hours: 4.5, note: 'Relances WhatsApp.',
    createdAt: '2026-06-10T18:40:00Z',
  },
]);

/* --- Audit log — chronological, append-only. Newest first when read. --- */
export const SEED_AUDIT: AuditLogEntry[] = [
  {
    id: 'audit-1', actorId: ADMIN_USER_ID, actorName: ADMIN_USER_NAME,
    action: 'validate_sub', targetType: 'subscription', targetId: 'sub-seller-001',
    targetLabel: SEED_SELLER.businessName, metadata: { to: 'active' },
    createdAt: '2026-01-15T10:30:00Z',
  },
  {
    id: 'audit-2', actorId: ADMIN_USER_ID, actorName: ADMIN_USER_NAME,
    action: 'validate_sub', targetType: 'subscription', targetId: 'sub-mustaf-001',
    targetLabel: SEED_PROJECT.ownerName, metadata: { to: 'active' },
    createdAt: '2026-03-15T09:30:00Z',
  },
  {
    id: 'audit-3', actorId: 'user-insp-awa', actorName: 'Awa Diallo',
    action: 'release_funds', targetType: 'phase', targetId: 'phase-foundation',
    targetLabel: 'Fondation', metadata: { amount: 1_800_000, controller: 'Cheikh Ndiaye' },
    createdAt: '2026-05-29T10:00:00Z',
  },
];

/* ============================================================
   Volet B — pilotage des employés (demo data on project cproj-1).
   Workers reuse SEED_TEAM ids. Designed to show every state:
   a clean advance to validate, a flagged advance (gap + missing
   receipt), an in-progress task, an open incident.
   ============================================================ */

const PROJECT_ID = SEED_PROJECT.id;
const PROJECT_NAME = SEED_PROJECT.ownerName;     // « Modou Fall »
const PROJECT_REF = SEED_PROJECT.landRef;        // « TER-DKR-001 » — même id que chez le propriétaire
const SEGA = { id: 'user-proc-sega', name: 'Séga Diop' };
const BABA = { id: 'user-site-baba', name: 'Baba Sarr' };

export const SEED_TASKS: Task[] = [
  {
    id: 'task-1', projectId: PROJECT_ID, projectName: PROJECT_NAME, landRef: PROJECT_REF,
    assignedTo: SEGA.id, assignedToName: SEGA.name,
    title: 'Achat ciment — phase murs', description: 'Acheter 70 sacs de ciment au prix de gros et les livrer sur le chantier.',
    priority: 'high', dueDate: '2026-06-08', status: 'reported',
    createdBy: ADMIN_USER_ID, createdAt: '2026-06-06T08:00:00Z',
  },
  {
    id: 'task-2', projectId: PROJECT_ID, projectName: PROJECT_NAME, landRef: PROJECT_REF,
    assignedTo: BABA.id, assignedToName: BABA.name,
    title: 'Transport sable & gravier', description: 'Organiser l’acheminement du sable et du gravier pour l’élévation.',
    priority: 'medium', dueDate: '2026-06-09', status: 'reported',
    createdBy: ADMIN_USER_ID, createdAt: '2026-06-07T08:00:00Z',
  },
  {
    id: 'task-3', projectId: PROJECT_ID, projectName: PROJECT_NAME, landRef: PROJECT_REF,
    assignedTo: BABA.id, assignedToName: BABA.name,
    title: 'Coordination maçons (élévation)', description: 'Encadrer l’équipe de maçons pour le démarrage des murs.',
    priority: 'medium', dueDate: '2026-06-14', status: 'in_progress',
    createdBy: ADMIN_USER_ID, createdAt: '2026-06-09T08:00:00Z',
  },
  {
    id: 'task-4', projectId: PROJECT_ID, projectName: PROJECT_NAME, landRef: PROJECT_REF,
    assignedTo: SEGA.id, assignedToName: SEGA.name,
    title: 'Relevé des niveaux fondation', description: 'Vérifier et relever les niveaux avant le démarrage des murs.',
    priority: 'low', dueDate: '2026-06-16', status: 'assigned',
    createdBy: ADMIN_USER_ID, createdAt: '2026-06-10T09:00:00Z',
  },
];

export const SEED_CASH_ADVANCES: CashAdvance[] = [
  // Clean: given = spent + returned, receipts match spent → ready to validate.
  {
    id: 'adv-1', taskId: 'task-1', workerId: SEGA.id, workerName: SEGA.name,
    amountGiven: 500_000, amountSpent: 470_000, amountReturned: 30_000, reconciled: false,
    purpose: 'Achat ciment (70 sacs)', createdAt: '2026-06-06T08:05:00Z',
  },
  // Flagged: 50 000 unaccounted (gap) AND a 30 000 expense without a receipt.
  {
    id: 'adv-2', taskId: 'task-2', workerId: BABA.id, workerName: BABA.name,
    amountGiven: 200_000, amountSpent: 150_000, amountReturned: 0, reconciled: false,
    purpose: 'Transport sable & gravier', createdAt: '2026-06-07T08:05:00Z',
  },
];

export const SEED_ADVANCE_RECEIPTS: AdvanceReceipt[] = [
  { id: 'rec-1', cashAdvanceId: 'adv-1', label: 'Ciment 50 sacs — Sococim', amount: 300_000, fileUrl: '#', createdAt: '2026-06-07T10:00:00Z' },
  { id: 'rec-2', cashAdvanceId: 'adv-1', label: 'Ciment 20 sacs — Sococim', amount: 170_000, fileUrl: '#', createdAt: '2026-06-07T10:05:00Z' },
  // adv-2 : un seul reçu de 120 000 alors que 150 000 ont été dépensés → 30 000 sans reçu.
  { id: 'rec-3', cashAdvanceId: 'adv-2', label: 'Location camion', amount: 120_000, fileUrl: '#', createdAt: '2026-06-09T17:30:00Z' },
];

export const SEED_WORK_SESSIONS: WorkSession[] = [
  { id: 'ws-1', workerId: SEGA.id, taskId: 'task-1', startedAt: '2026-06-08T08:00:00Z', endedAt: '2026-06-08T12:30:00Z', summary: 'Achat et livraison du ciment, contrôle des sacs.' },
  { id: 'ws-2', workerId: BABA.id, taskId: 'task-2', startedAt: '2026-06-09T07:30:00Z', endedAt: '2026-06-09T16:00:00Z', summary: 'Acheminement du sable et du gravier, déchargement sur site.' },
  { id: 'ws-3', workerId: BABA.id, taskId: 'task-3', startedAt: '2026-06-10T08:00:00Z', summary: 'Coordination des maçons pour le démarrage de l’élévation (en cours).' },
];

export const SEED_FIELD_REPORTS: FieldReport[] = [
  {
    id: 'fr-1', taskId: 'task-1', workerId: SEGA.id, workerName: SEGA.name,
    amountRemaining: 30_000, workDone: 'Ciment acheté (70 sacs) et livré sur le chantier, conforme à la commande.',
    workRemaining: 'Rien à signaler.', submittedAt: '2026-06-08T13:00:00Z', status: 'submitted',
  },
  {
    id: 'fr-2', taskId: 'task-2', workerId: BABA.id, workerName: BABA.name,
    amountRemaining: 50_000, workDone: 'Sable et gravier livrés sur site.',
    workRemaining: 'Régulariser le reçu manquant et restituer le solde de 50 000 F.',
    submittedAt: '2026-06-09T17:00:00Z', status: 'submitted',
  },
];

export const SEED_INCIDENTS: Incident[] = [
  {
    id: 'inc-1', reportId: 'fr-2', projectId: PROJECT_ID, projectName: PROJECT_NAME, raisedByName: BABA.name,
    description: 'Camion bloqué par les pluies, livraison du sable retardée d’une journée.',
    location: 'Route de la Cité Keur Gorgui', geo: { lat: 14.7160, lng: -17.4682 },
    priority: 'medium', occurredAt: '2026-06-09T11:00:00Z', status: 'resolved', createdAt: '2026-06-09T11:30:00Z',
  },
  {
    id: 'inc-2', projectId: PROJECT_ID, projectName: PROJECT_NAME, raisedByName: BABA.name,
    description: 'Vol suspecté : 3 sacs de ciment manquants à l’inventaire du matin.',
    location: 'Magasin de chantier', geo: { lat: 14.7168, lng: -17.4676 },
    priority: 'high', occurredAt: '2026-06-10T07:30:00Z', status: 'to_resolve', createdAt: '2026-06-10T07:45:00Z',
  },
];
