import Link from 'next/link';
import { Store, HardHat, ClipboardCheck, Banknote, TriangleAlert, ArrowRight, TrendingUp, Wallet, Construction } from 'lucide-react';
import { getAdminProvider } from '@/lib/admin/provider';
import { StatCard } from '@/components/ui/StatCard';
import { SubscriptionBadge } from '@/components/admin/SubscriptionBadge';
import { RechargeReviewActions } from '@/components/admin/RechargeReviewActions';
import { SUBJECT_TYPE_LABEL } from '@/lib/admin/labels';
import { formatFcfa, formatEur, formatDateShort } from '@/lib/utils';

export default async function AdminHomePage() {
  const ap = getAdminProvider();
  const [overview, stats] = await Promise.all([ap.getOverview(), ap.getSiteStats()]);
  const { queue } = overview;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-text">Vue d’ensemble</h1>
        <p className="text-muted text-sm mt-1">Le poste de commande Litug — vendeurs Sara et projets de construction Mustaf.</p>
      </div>

      {/* Bandeau revenus → statistiques */}
      <Link
        href="/admin/statistiques"
        className="flex items-center justify-between gap-4 rounded-2xl bg-ink text-on-ink p-5 hover:opacity-95 transition-opacity"
      >
        <div>
          <p className="text-xs text-on-ink-muted flex items-center gap-1.5"><TrendingUp size={13} className="text-gold" /> Revenu total cumulé</p>
          <p className="font-display text-3xl font-semibold tracking-tight mt-1">{formatFcfa(stats.revenue.total)}</p>
          <p className="text-sm text-on-ink-muted">{formatEur(stats.revenue.total)}</p>
        </div>
        <span className="text-sm font-semibold inline-flex items-center gap-1 shrink-0">Voir les statistiques <ArrowRight size={15} /></span>
      </Link>

      {/* KPIs */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Vendeurs actifs" value={overview.sellersActive} icon={Store} variant="success" sub={`${overview.sellersPending} en attente`} />
        <StatCard label="Phases en attente de financement" value={overview.mustafByStatus.pendingFunding} icon={HardHat} variant="orange" />
        <StatCard label="Phases en cours" value={overview.mustafByStatus.inProgress} icon={ClipboardCheck} variant="blue" />
        <StatCard label="Phases terminées" value={overview.mustafByStatus.completed} icon={Banknote} variant="emerald" />
      </section>

      {/* File des actions à faire */}
      <section className="space-y-4">
        <h2 className="font-display text-lg font-semibold text-text">À traiter</h2>

        {/* Abonnements à valider */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-stone-100">
            <h3 className="text-sm font-semibold text-text flex items-center gap-2">
              <ClipboardCheck size={16} className="text-accent" />
              Abonnements à valider
            </h3>
            <span className="text-xs text-muted">{queue.subsToValidate.length}</span>
          </div>
          {queue.subsToValidate.length === 0 ? (
            <p className="px-5 py-4 text-sm text-muted">Aucun abonnement en attente.</p>
          ) : (
            <ul className="divide-y divide-stone-100">
              {queue.subsToValidate.map(sub => (
                <li key={sub.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text truncate">{sub.subjectName}</p>
                    <p className="text-[11px] text-muted">{SUBJECT_TYPE_LABEL[sub.subjectType]} · {sub.contact}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <SubscriptionBadge status={sub.status} />
                    <Link
                      href={sub.subjectType === 'seller' ? '/admin/vendeurs' : '/admin/mustaf'}
                      className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
                    >
                      Traiter <ArrowRight size={13} />
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recharges Mustaf à valider (le solde du client ne bouge qu'ici) */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-stone-100">
            <h3 className="text-sm font-semibold text-text flex items-center gap-2">
              <Wallet size={16} className="text-accent" />
              Recharges à valider
            </h3>
            <span className="text-xs text-muted">{queue.rechargesToValidate.length}</span>
          </div>
          {queue.rechargesToValidate.length === 0 ? (
            <p className="px-5 py-4 text-sm text-muted">Aucune recharge en attente.</p>
          ) : (
            <ul className="divide-y divide-stone-100">
              {queue.rechargesToValidate.map(r => (
                <li key={r.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text truncate">
                      {r.contributorName} · <span className="font-semibold">{formatFcfa(r.amount)}</span>
                    </p>
                    <p className="text-[11px] text-muted">
                      {formatEur(r.amount)} · Wave · déclarée le {formatDateShort(r.requestedAt)}
                    </p>
                  </div>
                  <div className="shrink-0">
                    <RechargeReviewActions id={r.id} contributorName={r.contributorName} amountLabel={formatFcfa(r.amount)} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Phases en attente de déblocage */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-stone-100">
            <h3 className="text-sm font-semibold text-text flex items-center gap-2">
              <Banknote size={16} className="text-accent" />
              Phases en attente de déblocage
            </h3>
            <span className="text-xs text-muted">{queue.phasesAwaitingRelease.length}</span>
          </div>
          {queue.phasesAwaitingRelease.length === 0 ? (
            <p className="px-5 py-4 text-sm text-muted">Aucune phase prête à débloquer.</p>
          ) : (
            <ul className="divide-y divide-stone-100">
              {queue.phasesAwaitingRelease.map(p => (
                <li key={p.phaseId} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text truncate">{p.phaseLabel} — {p.projectName}</p>
                    <p className="text-[11px] text-muted">{formatFcfa(p.amount)} · {formatEur(p.amount)}</p>
                  </div>
                  <Link href={`/admin/mustaf/${p.projectId}`} className="text-xs font-semibold text-accent hover:underline flex items-center gap-1 shrink-0">
                    Vérifier <ArrowRight size={13} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Anomalies ouvertes */}
        <Link
          href="/admin/anomalies"
          className="flex items-center justify-between gap-3 bg-white rounded-2xl border border-stone-100 shadow-sm px-5 py-4 hover:border-accent/30 transition-colors"
        >
          <span className="text-sm font-semibold text-text flex items-center gap-2">
            <TriangleAlert size={16} className={queue.openAnomalies > 0 ? 'text-red-500' : 'text-muted'} />
            Anomalies ouvertes signalées par les clients
          </span>
          <span className={`text-sm font-bold ${queue.openAnomalies > 0 ? 'text-red-600' : 'text-muted'}`}>{queue.openAnomalies}</span>
        </Link>

        {/* Volet B — pilotage des employés */}
        <div className="grid sm:grid-cols-3 gap-3">
          <Link href="/admin/redditions" className="flex items-center justify-between gap-2 bg-white rounded-2xl border border-stone-100 shadow-sm px-4 py-3 hover:border-accent/30 transition-colors">
            <span className="text-sm font-semibold text-text flex items-center gap-2"><ClipboardCheck size={16} className="text-accent" /> Redditions à examiner</span>
            <span className="text-sm font-bold text-text">{queue.reportsToReview}</span>
          </Link>
          <Link href="/admin/employes" className="flex items-center justify-between gap-2 bg-white rounded-2xl border border-stone-100 shadow-sm px-4 py-3 hover:border-accent/30 transition-colors">
            <span className="text-sm font-semibold text-text flex items-center gap-2"><Wallet size={16} className={queue.unreconciledAdvances > 0 ? 'text-red-500' : 'text-muted'} /> Avances non réconciliées</span>
            <span className={`text-sm font-bold ${queue.unreconciledAdvances > 0 ? 'text-red-600' : 'text-muted'}`}>{queue.unreconciledAdvances}</span>
          </Link>
          <Link href="/admin/problemes" className="flex items-center justify-between gap-2 bg-white rounded-2xl border border-stone-100 shadow-sm px-4 py-3 hover:border-accent/30 transition-colors">
            <span className="text-sm font-semibold text-text flex items-center gap-2"><Construction size={16} className={queue.openIncidents > 0 ? 'text-red-500' : 'text-muted'} /> Problèmes à résoudre</span>
            <span className={`text-sm font-bold ${queue.openIncidents > 0 ? 'text-red-600' : 'text-muted'}`}>{queue.openIncidents}</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
