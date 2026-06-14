import {
  Banknote, Store, FileText, HardHat, ShieldCheck, TrendingUp,
  Map, Users, CalendarDays, Layers, Wallet, UserMinus,
} from 'lucide-react';
import { getAdminProvider } from '@/lib/admin/provider';
import { StatCard } from '@/components/ui/StatCard';
import { BreakdownBar } from '@/components/admin/BreakdownBar';
import { MiniBarChart } from '@/components/admin/MiniBarChart';
import { formatFcfa, formatEur } from '@/lib/utils';

// Compact FCFA for chart labels (e.g. "1,8 M").
function fcfaShort(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)} k`;
  return String(n);
}

const REVENUE_COLORS = ['bg-accent', 'bg-gold', 'bg-emerald-500', 'bg-sky-500'];
const TIER_COLORS = ['bg-accent', 'bg-gold', 'bg-sky-500', 'bg-emerald-500'];

export default async function AdminStatistiquesPage() {
  const stats = await getAdminProvider().getSiteStats();
  const { revenue, subscriptions: subs, activity, mustaf, monthly } = stats;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-text">Statistiques & revenus</h1>
        <p className="text-muted text-sm mt-1">Toutes les entrées d’argent et la santé de la plateforme, d’un coup d’œil.</p>
      </div>

      {/* 1 — Entrées d'argent */}
      <section className="space-y-4">
        <h2 className="font-display text-lg font-semibold text-text flex items-center gap-2"><Banknote size={18} className="text-accent" /> Entrées d’argent</h2>

        <div className="rounded-2xl bg-ink text-on-ink p-6">
          <p className="text-xs text-on-ink-muted">Revenu total cumulé</p>
          <p className="font-display text-4xl font-semibold tracking-tight mt-1">{formatFcfa(revenue.total)}</p>
          <p className="text-sm text-on-ink-muted mt-1">{formatEur(revenue.total)}</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Abonnements Sara (par mois)" value={formatFcfa(revenue.sellerMrr)} icon={Store} variant="blue" sub={formatEur(revenue.sellerMrr)} />
          <StatCard label="Forfaits Phase 0" value={formatFcfa(revenue.phaseZero)} icon={FileText} variant="orange" sub={formatEur(revenue.phaseZero)} />
          <StatCard label="Commissions Mustaf" value={formatFcfa(revenue.mustafCommission)} icon={HardHat} variant="success" sub={formatEur(revenue.mustafCommission)} />
          <StatCard label="Frais de vérification" value={formatFcfa(revenue.verification)} icon={ShieldCheck} variant="violet" sub={formatEur(revenue.verification)} />
        </div>

        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
          <p className="text-sm font-semibold text-text mb-4">Répartition par source</p>
          <BreakdownBar
            format={formatFcfa}
            segments={revenue.bySource.map((s, i) => ({ label: s.label, value: s.amount, colorClass: REVENUE_COLORS[i % REVENUE_COLORS.length] }))}
          />
        </div>
      </section>

      {/* 2 — Abonnements */}
      <section className="space-y-4">
        <h2 className="font-display text-lg font-semibold text-text flex items-center gap-2"><Store size={18} className="text-accent" /> Abonnements</h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Abonnements vendus" value={subs.sold} icon={TrendingUp} variant="blue" />
          <StatCard label="Actifs" value={subs.active} icon={Store} variant="success" />
          <StatCard label="En attente" value={subs.pending} icon={CalendarDays} variant="yellow" />
          <StatCard label="Taux de churn" value={`${Math.round(subs.churnRate)} %`} icon={UserMinus} variant="default" sub={`${subs.churnCount} annulés/suspendus`} />
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
            <p className="text-sm font-semibold text-text mb-4">Par type d’abonnement (actifs)</p>
            {subs.byTier.length === 0 ? (
              <p className="text-sm text-muted">Aucun abonnement actif.</p>
            ) : (
              <BreakdownBar segments={subs.byTier.map((t, i) => ({ label: t.tier, value: t.count, colorClass: TIER_COLORS[i % TIER_COLORS.length] }))} />
            )}
          </div>

          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
            <p className="text-sm font-semibold text-text mb-4">Annulations & suspensions</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-muted"><span className="w-2.5 h-2.5 rounded-full bg-stone-400" /> Suspendus</span>
                <span className="text-sm font-semibold text-text">{subs.suspended}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-muted"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Révoqués</span>
                <span className="text-sm font-semibold text-text">{subs.revoked}</span>
              </div>
              <div className="border-t border-stone-100 pt-3 flex items-center justify-between">
                <span className="text-sm font-medium text-text">Churn total</span>
                <span className="text-sm font-semibold text-red-600">{subs.churnCount} · {Math.round(subs.churnRate)} %</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 — Évolution mensuelle */}
      <section className="space-y-4">
        <h2 className="font-display text-lg font-semibold text-text flex items-center gap-2"><TrendingUp size={18} className="text-accent" /> Évolution mensuelle</h2>
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
            <p className="text-sm font-semibold text-text mb-4">Revenus encaissés / mois</p>
            <MiniBarChart points={monthly.map(m => ({ label: m.label, value: m.revenue }))} format={fcfaShort} />
          </div>
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
            <p className="text-sm font-semibold text-text mb-4">Nouveaux abonnements / mois</p>
            <MiniBarChart points={monthly.map(m => ({ label: m.label, value: m.newSubs }))} barClassName="bg-gold" />
          </div>
        </div>
        <p className="text-[11px] text-muted">Les revenus mensuels comptent les encaissements datés (commissions Mustaf, forfaits Phase 0, vérifications).</p>
      </section>

      {/* 4 — Activité du site */}
      <section className="space-y-4">
        <h2 className="font-display text-lg font-semibold text-text flex items-center gap-2"><Map size={18} className="text-accent" /> Activité du site</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Terrains listés" value={activity.landsTotal} icon={Map} variant="blue" sub={`${activity.landsAvailable} dispo · ${activity.landsSold} vendus`} />
          <StatCard label="Terrains vérifiés" value={activity.landsVerified} icon={ShieldCheck} variant="success" />
          <StatCard label="Leads captés" value={activity.leadsTotal} icon={Users} variant="orange" sub={`${activity.leadsQualified} qualifiés`} />
          <StatCard label="Taux de conversion" value={`${Math.round(activity.conversionRate)} %`} icon={TrendingUp} variant="violet" sub={`${activity.leadsConverted} convertis · ${activity.visitsTotal} visites`} />
        </div>
      </section>

      {/* 5 — Projets Mustaf */}
      <section className="space-y-4">
        <h2 className="font-display text-lg font-semibold text-text flex items-center gap-2"><HardHat size={18} className="text-accent" /> Projets Mustaf</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Projets" value={mustaf.projects} icon={HardHat} variant="blue" />
          <StatCard label="Avancement global" value={`${Math.round(mustaf.progressPct)} %`} icon={Layers} variant="success" />
          <StatCard label="Solde séquestre" value={formatFcfa(mustaf.escrowBalance)} icon={Wallet} variant="orange" sub={formatEur(mustaf.escrowBalance)} />
          <StatCard label="Total versé" value={formatFcfa(mustaf.totalDeposited)} icon={Banknote} variant="violet" sub={formatEur(mustaf.totalDeposited)} />
        </div>
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
          <p className="text-sm font-semibold text-text mb-3">Phases par statut</p>
          <div className="flex flex-wrap gap-2">
            {mustaf.phasesByStatus.map((p, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-stone-50 border border-line text-text">
                {p.label} <span className="font-bold text-accent">{p.count}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      <p className="flex items-start gap-2 text-[11px] text-muted">
        <ShieldCheck size={14} className="text-accent mt-0.5 shrink-0" />
        Chiffres calculés sur les données réelles (abonnements, terrains, leads, visites) ; le volet construction (Mustaf) reste en démonstration. Tarifs d’abonnement éditables dans la config. Séquestre simulé, aucun vrai paiement.
      </p>
    </div>
  );
}
