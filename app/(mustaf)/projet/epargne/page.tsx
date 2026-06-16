import { Wallet, ArrowDownToLine, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { getMustafProvider } from '@/lib/mustaf/provider';
import type { RechargeStatus } from '@/lib/mustaf/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { FundingBar } from '@/components/mustaf/FundingBar';
import { EscrowNote } from '@/components/mustaf/Notices';
import { formatFcfa, formatEur, formatDateShort } from '@/lib/utils';
import RechargeForm from './RechargeForm';

/** Présentation par statut d'une recharge déclarée (le client suit son sort). */
const RECHARGE_UI: Record<RechargeStatus, { label: string; Icon: typeof Clock; iconWrap: string; badge: string }> = {
  pending:   { label: 'En attente', Icon: Clock,        iconWrap: 'bg-amber-50 text-amber-600',     badge: 'text-amber-700 bg-amber-50 border-amber-100' },
  validated: { label: 'Validée',    Icon: CheckCircle2, iconWrap: 'bg-emerald-50 text-emerald-600', badge: 'text-emerald-700 bg-emerald-50 border-emerald-100' },
  rejected:  { label: 'Refusée',    Icon: XCircle,      iconWrap: 'bg-red-50 text-red-600',          badge: 'text-red-700 bg-red-50 border-red-100' },
};

export default async function EpargnePage() {
  const mp = getMustafProvider();
  const [escrow, deposits, members, rechargeRequests] = await Promise.all([
    mp.getEscrowSummary(),
    mp.getDeposits(),
    mp.getMembers(),
    mp.getRechargeRequests(),
  ]);
  const pendingTotal = rechargeRequests
    .filter(r => r.status === 'pending')
    .reduce((s, r) => s + r.amount, 0);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Compte épargne"
        breadcrumbs={[{ label: 'Mon projet', href: '/projet' }, { label: 'Compte épargne' }]}
      />

      {/* Solde — version claire : carte blanche, palette monochrome du projet */}
      <section className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm">
        <div className="flex items-center gap-2 text-muted text-sm">
          <Wallet size={16} className="text-accent" />
          Solde du compte séquestre
        </div>
        <p className="font-display text-3xl sm:text-4xl font-semibold tracking-tight mt-2 break-words text-text">{formatFcfa(escrow.balance)}</p>
        <p className="text-muted text-sm mt-1">{formatEur(escrow.balance)}</p>
        <div className="mt-4 pt-4 border-t border-stone-100 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted text-xs">Total versé</p>
            <p className="font-semibold mt-0.5 text-text">{formatFcfa(escrow.totalDeposited)}</p>
          </div>
          <div>
            <p className="text-muted text-xs">Déjà débloqué (phases payées)</p>
            <p className="font-semibold mt-0.5 text-text">{formatFcfa(escrow.totalReleased)}</p>
          </div>
        </div>
        {pendingTotal > 0 && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-100 px-3 py-2.5 text-xs text-amber-700">
            <Clock size={14} className="shrink-0 text-amber-600" />
            <span>
              <span className="font-semibold">{formatFcfa(pendingTotal)}</span> en attente de validation —
              non compté dans le solde tant que Litug n’a pas confirmé le virement.
            </span>
          </div>
        )}
      </section>

      <EscrowNote custodianName={escrow.custodianName} />

      {/* Suivi des recharges déclarées : en attente → validée (ajoutée au solde) ou refusée (motif) */}
      {rechargeRequests.length > 0 && (
        <section>
          <h2 className="font-serif text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <Wallet size={17} className="text-accent" />
            Suivi de mes recharges
          </h2>
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm divide-y divide-stone-50">
            {rechargeRequests.map(r => {
              const ui = RECHARGE_UI[r.status];
              return (
                <div key={r.id} className="flex items-center gap-3 px-4 py-3.5">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${ui.iconWrap}`}>
                    <ui.Icon size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-text truncate">
                      {r.contributorName} <span className="font-semibold">{formatFcfa(r.amount)}</span>
                    </p>
                    <p className="text-xs text-muted">
                      {r.status === 'pending' && <>Déclarée le {formatDateShort(r.requestedAt)} · en cours de vérification</>}
                      {r.status === 'validated' && <>Validée le {formatDateShort(r.reviewedAt ?? r.requestedAt)} · ajoutée à votre solde</>}
                      {r.status === 'rejected' && (
                        <>Refusée le {formatDateShort(r.reviewedAt ?? r.requestedAt)}{r.rejectionReason ? ` · ${r.rejectionReason}` : ''}</>
                      )}
                    </p>
                  </div>
                  <span className={`text-[11px] font-semibold rounded-full border px-2.5 py-1 shrink-0 ${ui.badge}`}>
                    {ui.label}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Recharger le compte par Wave (simulé — §4/§12) */}
      <RechargeForm memberNames={members.map(m => m.displayName)} />

      {/* Objectif prochaine phase */}
      {escrow.nextPhase && (
        <section className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 space-y-3">
          <h2 className="font-serif text-lg font-semibold text-text">
            Financement de la phase « {escrow.nextPhase.label} »
          </h2>
          <FundingBar current={escrow.balance} target={escrow.nextPhase.estimate} phaseLabel={escrow.nextPhase.label} />
          <p className="text-xs text-muted">
            La phase ne démarre qu’une fois <span className="font-medium text-text">entièrement financée</span> —
            c’est la règle qui protège votre argent.
          </p>
        </section>
      )}

      {/* Historique des dépôts */}
      <section>
        <h2 className="font-serif text-lg font-semibold text-text mb-4">Historique des dépôts</h2>
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm divide-y divide-stone-50">
          {deposits.map(d => (
            <div key={d.id} className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-9 h-9 rounded-full bg-accent-light flex items-center justify-center shrink-0">
                <ArrowDownToLine size={16} className="text-accent" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-text truncate">
                  {d.contributorName} <span className="text-emerald-600 font-semibold">+{formatFcfa(d.amount)}</span>
                </p>
                <p className="text-xs text-muted">
                  {formatDateShort(d.depositedAt)}{d.note ? ` · ${d.note}` : ''}
                </p>
              </div>
              <p className="text-xs text-muted shrink-0 hidden sm:block">{formatEur(d.amount)}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
