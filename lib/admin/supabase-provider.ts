/* ============================================================
   Admin back-office — Supabase provider (vraie base).
   Branché quand NEXT_PUBLIC_DATA_SOURCE='supabase' (lib/admin/provider.ts).

   100 % réel pour tout ce qui est dans Supabase :
   - abonnements (`subscriptions`), équipe (`user_roles` + auth.users),
     employés (user_roles → liste sans tâches/avances), audit (`audit_log`),
     statistiques (subscriptions/lands/leads/visits), prospection (`prospect_entries`).
   - Mustaf (construction) et Volet B (tâches/avances/redditions) :
     pas encore en base → retournent des listes vides / zéros (aucune donnée fictive).
     Le mock en fallback (adminMockProvider) est conservé uniquement pour les
     méthodes non encore surchargées ici.

   Lectures transverses (tous les vendeurs/utilisateurs) via la clé service_role
   (back-office serveur de confiance), comme lib/admin/pending-accounts.ts.
   Écritures sensibles : actor_id = l'admin connecté, tracé dans `audit_log` (§2).
   ============================================================ */

import 'server-only';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { adminMockProvider } from './provider';
import type { AdminProvider } from './provider';
import type {
  Subscription, SubscriptionStatus, AuditLogEntry, AuditAction,
  TeamMember, TeamRole, AdminOverview, SiteStats, MonthlyPoint, BillableParty,
  ProspectEntry, ProspectNetwork, ProspectOutcome, ProspectContactMethod,
  EmployeeRow, ProspectorWorkDay, ProspectorTransfer,
} from './types';
import { sellerPlanPrice, VERIFICATION_FEE } from './pricing';
import { TEAM_ROLE_LABEL, SUBSCRIPTION_STATUS_LABEL } from './labels';

/** Un contact connu est-il un email exploitable pour pré-remplir une facture ? */
const looksLikeEmail = (contact?: string): boolean =>
  !!contact && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);

/** L'admin agissant (pour actor_id de l'audit). Échoue si personne n'est connecté. */
async function currentActor(): Promise<{ id: string; name: string }> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Action réservée à un administrateur connecté.');
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  return { id: user.id, name: (meta.full_name as string) || user.email?.split('@')[0] || 'Admin' };
}

/** Insère une ligne d'audit (insert-only). Best-effort : ne casse pas l'action métier. */
async function appendAudit(entry: {
  actorId: string; actorName?: string; action: AuditAction;
  targetType: AuditLogEntry['targetType']; targetId: string; targetLabel?: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    const admin = createSupabaseAdminClient();
    await admin.from('audit_log').insert({
      actor_id: entry.actorId,
      action: entry.action,
      target_type: entry.targetType,
      target_id: entry.targetId,
      target_label: entry.targetLabel,
      metadata: entry.metadata ?? null,
    });
  } catch {
    /* le journal est secondaire au regard de l'action déjà actée en base */
  }
}

function mapSubscription(row: Record<string, unknown>, name: string, contact?: string): Subscription {
  return {
    id: row.id as string,
    subjectType: row.subject_type as Subscription['subjectType'],
    subjectId: row.subject_id as string,
    subjectName: name,
    contact,
    tier: row.tier as string,
    status: row.status as SubscriptionStatus,
    validatedBy: (row.validated_by as string | null) ?? undefined,
    validatedAt: (row.validated_at as string | null) ?? undefined,
    createdAt: row.created_at as string,
  };
}

/** Résout les noms/contacts dénormalisés des abonnés (vendeurs via `sellers`,
 *  clients Mustaf via auth.users). */
async function resolveSubjects(rows: Record<string, unknown>[]): Promise<Subscription[]> {
  const admin = createSupabaseAdminClient();
  const sellerIds = rows.filter(r => r.subject_type === 'seller').map(r => r.subject_id as string);

  const sellerMap = new Map<string, { name: string; contact?: string }>();
  if (sellerIds.length) {
    const { data } = await admin.from('sellers').select('id, business_name, phone, email').in('id', sellerIds);
    for (const s of data ?? []) {
      sellerMap.set(s.id as string, {
        name: (s.business_name as string) || 'Vendeur',
        contact: (s.phone as string) || (s.email as string) || undefined,
      });
    }
  }

  // Clients Mustaf : nom depuis auth.users (métadonnées), best-effort.
  const ownerIds = rows.filter(r => r.subject_type === 'mustaf').map(r => r.subject_id as string);
  const ownerMap = new Map<string, { name: string; contact?: string }>();
  for (const id of ownerIds) {
    try {
      const { data } = await admin.auth.admin.getUserById(id);
      const m = (data?.user?.user_metadata ?? {}) as Record<string, unknown>;
      ownerMap.set(id, {
        name: (m.full_name as string) || (m.business_name as string) || data?.user?.email?.split('@')[0] || 'Client Mustaf',
        contact: (m.phone as string) || data?.user?.email || undefined,
      });
    } catch { /* compte introuvable : on retombe sur un libellé générique */ }
  }

  return rows.map(r => {
    const resolved = r.subject_type === 'seller'
      ? sellerMap.get(r.subject_id as string)
      : ownerMap.get(r.subject_id as string);
    return mapSubscription(r, resolved?.name ?? (r.subject_type === 'seller' ? 'Vendeur' : 'Client Mustaf'), resolved?.contact);
  });
}

const ROLE_PRIORITY: TeamRole[] = ['admin', 'controller', 'inspector', 'site_agent', 'procurement', 'prospector'];

/** Dernières 6 mois : revenus datables (vérifications) + nouveaux abonnements (réel). */
function monthlySeries(subs: Subscription[], verifiedDates: string[]): MonthlyPoint[] {
  const now = new Date();
  const months: { key: string; label: string }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    months.push({ key, label: new Intl.DateTimeFormat('fr-FR', { month: 'short', year: '2-digit' }).format(d) });
  }
  return months.map(({ key, label }) => ({
    label,
    revenue: verifiedDates.filter(dt => dt?.slice(0, 7) === key).length * VERIFICATION_FEE,
    newSubs: subs.filter(s => s.createdAt.slice(0, 7) === key).length,
  }));
}

export const supabaseAdminProvider: AdminProvider = {
  ...adminMockProvider,

  /* ---------------- Abonnements (réel) ---------------- */

  async listSubscriptions(subjectType) {
    const admin = createSupabaseAdminClient();
    let query = admin.from('subscriptions').select('*');
    if (subjectType) query = query.eq('subject_type', subjectType);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return resolveSubjects(data ?? []);
  },

  async getSubscription(id) {
    const admin = createSupabaseAdminClient();
    const { data } = await admin.from('subscriptions').select('*').eq('id', id).single();
    if (!data) return null;
    return (await resolveSubjects([data]))[0];
  },

  async getSubscriptionBySubject(subjectId) {
    const admin = createSupabaseAdminClient();
    const { data } = await admin.from('subscriptions').select('*').eq('subject_id', subjectId).maybeSingle();
    if (!data) return null;
    return (await resolveSubjects([data]))[0];
  },

  async setSubscriptionStatus(id, status) {
    const admin = createSupabaseAdminClient();
    const actor = await currentActor();
    const { data: existing } = await admin.from('subscriptions').select('*').eq('id', id).single();
    if (!existing) throw new Error('Abonnement introuvable.');

    const update: Record<string, unknown> = { status };
    if (status === 'active' && !existing.validated_at) {
      update.validated_by = actor.id;
      update.validated_at = new Date().toISOString();
    }
    const { data, error } = await admin.from('subscriptions').update(update).eq('id', id).select('*').single();
    if (error || !data) throw new Error(error?.message ?? 'Mise à jour impossible.');

    // Synchronise le statut côté vendeur (son propre dashboard lit sellers.subscription_status).
    if (data.subject_type === 'seller') {
      const sellerStatus = status === 'active' ? 'active' : status === 'pending' ? 'trial' : 'past_due';
      await admin.from('sellers').update({ subscription_status: sellerStatus }).eq('id', data.subject_id);
    }

    const [resolved] = await resolveSubjects([data]);
    const action: AuditAction = status === 'active' ? 'validate_sub' : status === 'suspended' ? 'suspend_sub' : 'revoke_sub';
    await appendAudit({
      actorId: actor.id, actorName: actor.name, action,
      targetType: 'subscription', targetId: id, targetLabel: resolved.subjectName,
      metadata: { from: existing.status, to: status },
    });
    return resolved;
  },

  async changeSubscriptionTier(id, tier) {
    const admin = createSupabaseAdminClient();
    const actor = await currentActor();
    const { data: existing } = await admin.from('subscriptions').select('*').eq('id', id).single();
    if (!existing) throw new Error('Abonnement introuvable.');
    const { data, error } = await admin.from('subscriptions').update({ tier }).eq('id', id).select('*').single();
    if (error || !data) throw new Error(error?.message ?? 'Mise à jour impossible.');
    const [resolved] = await resolveSubjects([data]);
    await appendAudit({
      actorId: actor.id, actorName: actor.name, action: 'change_tier',
      targetType: 'subscription', targetId: id, targetLabel: resolved.subjectName,
      metadata: { from: existing.tier, to: tier },
    });
    return resolved;
  },

  /* ---------------- Parties facturables (réel : abonnés + employés) ---------------- */

  async listBillableParties() {
    const [subs, team] = await Promise.all([this.listSubscriptions(), this.listTeam()]);
    const parties: BillableParty[] = [];
    for (const sub of subs) {
      if (sub.status === 'revoked') continue;
      const isEmail = looksLikeEmail(sub.contact);
      parties.push({
        type: sub.subjectType === 'seller' ? 'seller' : 'mustaf',
        refId: sub.id,
        name: sub.subjectName,
        detail: `${String(sub.tier)} · ${SUBSCRIPTION_STATUS_LABEL[sub.status]}`,
        email: isEmail ? sub.contact : undefined,
        suggestedAmount: sub.subjectType === 'seller' ? sellerPlanPrice(String(sub.tier)) : undefined,
      });
    }
    for (const m of team) {
      if (m.role === 'admin' || m.status !== 'active') continue;
      parties.push({
        type: 'employee', refId: m.id, name: m.displayName,
        detail: TEAM_ROLE_LABEL[m.role],
        email: looksLikeEmail(m.contact) ? m.contact : undefined,
      });
    }
    return parties;
  },

  /* ---------------- Équipe & rôles (réel : user_roles + auth.users) ---------------- */

  async listTeam() {
    const admin = createSupabaseAdminClient();
    const [{ data: roleRows }, usersList] = await Promise.all([
      admin.from('user_roles').select('user_id, role, created_at'),
      admin.auth.admin.listUsers({ page: 1, perPage: 200 }),
    ]);
    const userMap = new Map((usersList.data?.users ?? []).map(u => [u.id, u]));

    const byUser = new Map<string, { roles: TeamRole[]; createdAt: string }>();
    for (const r of roleRows ?? []) {
      const e = byUser.get(r.user_id as string) ?? { roles: [], createdAt: r.created_at as string };
      e.roles.push(r.role as TeamRole);
      byUser.set(r.user_id as string, e);
    }

    const members: TeamMember[] = [];
    for (const [userId, info] of byUser) {
      const u = userMap.get(userId);
      const meta = (u?.user_metadata ?? {}) as Record<string, unknown>;
      const role = ROLE_PRIORITY.find(r => info.roles.includes(r)) ?? info.roles[0];
      members.push({
        id: userId,
        displayName: (meta.full_name as string) || u?.email?.split('@')[0] || 'Membre',
        role,
        contact: (meta.phone as string) || u?.email || undefined,
        assignedProjectIds: [],
        status: 'active',
        createdAt: info.createdAt,
      });
    }
    return members.sort((a, b) => a.role.localeCompare(b.role));
  },

  /* ---------------- Audit (réel : audit_log) ---------------- */

  async listAudit(filter) {
    const admin = createSupabaseAdminClient();
    let query = admin.from('audit_log').select('*').order('created_at', { ascending: false }).limit(300);
    if (filter?.actorId) query = query.eq('actor_id', filter.actorId);
    const { data, error } = await query;
    if (error) throw new Error(error.message);

    // Nom de l'acteur dénormalisé depuis auth.users.
    const actorIds = [...new Set((data ?? []).map(r => r.actor_id as string))];
    const nameMap = new Map<string, string>();
    if (actorIds.length) {
      const usersList = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
      for (const u of usersList.data?.users ?? []) {
        const m = (u.user_metadata ?? {}) as Record<string, unknown>;
        nameMap.set(u.id, (m.full_name as string) || u.email?.split('@')[0] || 'Membre');
      }
    }
    return (data ?? []).map(r => ({
      id: r.id as string,
      actorId: r.actor_id as string,
      actorName: nameMap.get(r.actor_id as string) ?? 'Membre',
      action: r.action as AuditAction,
      targetType: r.target_type as AuditLogEntry['targetType'],
      targetId: r.target_id as string,
      targetLabel: (r.target_label as string | null) ?? undefined,
      metadata: (r.metadata as Record<string, unknown> | null) ?? undefined,
      createdAt: r.created_at as string,
    }));
  },

  /* ---------------- Mustaf (pas encore dans Supabase) ---------------- */

  async listMustafProjects() {
    return [];
  },

  /* ---------------- Accueil & statistiques (100 % réel) ---------------- */

  async getOverview() {
    const subs = await this.listSubscriptions();
    return {
      sellersActive: subs.filter(s => s.subjectType === 'seller' && s.status === 'active').length,
      sellersPending: subs.filter(s => s.subjectType === 'seller' && s.status === 'pending').length,
      mustafByStatus: { pendingFunding: 0, inProgress: 0, awaitingInspection: 0, completed: 0 },
      queue: {
        subsToValidate: subs.filter(s => s.status === 'pending'),
        rechargesToValidate: [],
        phasesAwaitingRelease: [],
        openAnomalies: 0,
        reportsToReview: 0,
        unreconciledAdvances: 0,
        openIncidents: 0,
      },
    } satisfies AdminOverview;
  },

  /* ---------------- Employés (réel : user_roles + auth.users) ---------------- */

  async listEmployees() {
    const members = await this.listTeam();
    return members
      .filter(m => m.role !== 'admin')
      .map(member => ({
        member,
        activeTasks: 0,
        unreconciledAdvances: 0,
        outstandingAmount: 0,
      } satisfies EmployeeRow))
      .sort((a, b) => a.member.displayName.localeCompare(b.member.displayName));
  },

  async getEmployee(id) {
    const members = await this.listTeam();
    const member = members.find(m => m.id === id);
    if (!member) return null;
    return { member, tasks: [], sessions: [], totalHours: 0, advances: [] };
  },

  /* ---------------- Prospection commerciale (réel) ---------------- */

  async countSentProspectEntries(since) {
    const admin = createSupabaseAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query: any = admin
      .from('prospect_entries')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'sent');
    if (since) query = query.gt('created_at', since);
    const { count, error } = await query;
    if (error) return 0;
    return count ?? 0;
  },

  async listProspectEntries(filter) {
    const admin = createSupabaseAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query: any = admin.from('prospect_entries').select('*');
    if (filter?.prospectorId) query = query.eq('prospector_id', filter.prospectorId);
    if (filter?.status) query = query.eq('status', filter.status);
    const { data, error } = await query
      .order('prospected_at', { ascending: false })
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);

    const rows = (data ?? []) as Record<string, unknown>[];

    // Noms des prospecteurs depuis auth.users (user_metadata.full_name).
    const prospectorIds = [...new Set(rows.map(r => r.prospector_id as string))];
    const nameMap = new Map<string, string>();
    if (prospectorIds.length) {
      const usersList = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
      for (const u of usersList.data?.users ?? []) {
        const m = (u.user_metadata ?? {}) as Record<string, unknown>;
        nameMap.set(u.id, (m.full_name as string) || u.email?.split('@')[0] || 'Prospecteur');
      }
    }

    return rows.map(r => ({
      id:            r.id as string,
      prospectorId:  r.prospector_id as string,
      prospectorName: nameMap.get(r.prospector_id as string) ?? 'Prospecteur',
      companyName:   r.company_name as string,
      contactName:   (r.contact_name as string | null) ?? undefined,
      contactPhone:  (r.contact_phone as string | null) ?? undefined,
      followers:     (r.followers as number | null) ?? undefined,
      network:       r.network as ProspectNetwork,
      outcome:       r.outcome as ProspectOutcome,
      contactMethod: (r.contact_method as ProspectContactMethod | null) ?? undefined,
      concern:       (r.concern as string | null) ?? undefined,
      notes:         (r.notes as string | null) ?? undefined,
      status:        r.status as ProspectEntry['status'],
      prospectedAt:  r.prospected_at as string,
      createdAt:     r.created_at as string,
      sentAt:        (r.sent_at as string | null) ?? undefined,
    } satisfies ProspectEntry));
  },

  // Journées de travail (lecture admin cross-prospecteurs via service_role).
  async listProspectorWorkDays(prospectorId) {
    const admin = createSupabaseAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query: any = admin.from('prospector_work_days').select('*');
    if (prospectorId) query = query.eq('worker_id', prospectorId);
    const { data, error } = await query.order('work_date', { ascending: false });
    if (error) return [];
    return (data ?? []).map((r: Record<string, unknown>) => ({
      id:        r.id as string,
      workerId:  r.worker_id as string,
      workerName: (r.worker_name as string | null) ?? '',
      workDate:  r.work_date as string,
      hours:     Number(r.hours),
      note:      (r.note as string | null) ?? undefined,
      createdAt: r.created_at as string,
    } satisfies ProspectorWorkDay));
  },

  // Virements admin → prospecteur (table prospector_transfers, migration 010).
  async listProspectorTransfers(prospectorId) {
    const admin = createSupabaseAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query: any = admin.from('prospector_transfers').select('*');
    if (prospectorId) query = query.eq('prospector_id', prospectorId);
    const { data, error } = await query.order('sent_at', { ascending: false });
    if (error) return [];
    return (data ?? []).map((r: Record<string, unknown>) => ({
      id:             r.id as string,
      prospectorId:   r.prospector_id as string,
      prospectorName: (r.prospector_name as string) ?? '',
      amount:         Number(r.amount),
      motif:          r.motif as string,
      sentAt:         r.sent_at as string,
      status:         r.status as ProspectorTransfer['status'],
      confirmedAt:    (r.confirmed_at as string | null) ?? undefined,
      deniedAt:       (r.denied_at as string | null) ?? undefined,
      denialReason:   (r.denial_reason as string | null) ?? undefined,
    } satisfies ProspectorTransfer));
  },

  async sendTransferToProspector({ prospectorId, prospectorName, amount, motif }) {
    if (!prospectorId) throw new Error('Prospecteur manquant.');
    if (amount <= 0) throw new Error('Montant invalide.');
    if (!motif.trim()) throw new Error('Indique le motif du paiement.');
    const actor = await currentActor();
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin
      .from('prospector_transfers')
      .insert({
        prospector_id:   prospectorId,
        prospector_name: prospectorName,
        amount,
        motif:           motif.trim(),
        status:          'pending',
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    await appendAudit({
      actorId: actor.id, actorName: actor.name,
      action: 'send_transfer', targetType: 'team_member',
      targetId: prospectorId, targetLabel: prospectorName,
      metadata: { amount, motif: motif.trim() },
    });
    return {
      id:             data.id as string,
      prospectorId:   data.prospector_id as string,
      prospectorName: data.prospector_name as string,
      amount:         Number(data.amount),
      motif:          data.motif as string,
      sentAt:         data.sent_at as string,
      status:         'pending' as const,
    } satisfies ProspectorTransfer;
  },

  async getSiteStats() {
    const admin = createSupabaseAdminClient();
    const [subs, landsRes, leadsRes, visitsRes] = await Promise.all([
      this.listSubscriptions(),
      admin.from('lands').select('sale_status, verification_status, verified_at'),
      admin.from('leads').select('status'),
      admin.from('visits').select('id'),
    ]);
    const lands = landsRes.data ?? [];
    const leads = leadsRes.data ?? [];
    const visitsTotal = (visitsRes.data ?? []).length;

    // --- Revenus (réels uniquement : Sara + vérifications) ---
    const sellerMrr = subs.filter(s => s.subjectType === 'seller' && s.status === 'active')
      .reduce((sum, s) => sum + sellerPlanPrice(String(s.tier)), 0);
    const verifiedDates = lands.filter(l => l.verification_status === 'verifie').map(l => (l.verified_at as string) ?? '');
    const verifiedLands = verifiedDates.length;
    const verification = verifiedLands * VERIFICATION_FEE;
    const total = sellerMrr + verification;

    // --- Abonnements ---
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

    // --- Activité ---
    const leadsTotal = leads.length;
    const leadsConverted = leads.filter(l => l.status === 'converti').length;

    return {
      revenue: {
        sellerMrr, phaseZero: 0, mustafCommission: 0, verification, total,
        bySource: [
          { key: 'seller_subscriptions', label: 'Abonnements vendeurs (Sara)', amount: sellerMrr },
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
        landsTotal: lands.length,
        landsAvailable: lands.filter(l => l.sale_status === 'disponible').length,
        landsSold: lands.filter(l => l.sale_status === 'vendu').length,
        landsVerified: verifiedLands,
        leadsTotal,
        leadsQualified: leads.filter(l => l.status === 'qualifie').length,
        leadsConverted,
        conversionRate: leadsTotal ? (leadsConverted / leadsTotal) * 100 : 0,
        visitsTotal,
      },
      mustaf: { projects: 0, phasesByStatus: [], progressPct: 0, escrowBalance: 0, totalDeposited: 0 },
      monthly: monthlySeries(subs, verifiedDates),
    } satisfies SiteStats;
  },
};
