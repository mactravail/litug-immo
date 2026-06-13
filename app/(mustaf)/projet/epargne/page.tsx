import { Wallet, ArrowDownToLine } from 'lucide-react';
import { getMustafProvider } from '@/lib/mustaf/provider';
import { PageHeader } from '@/components/ui/PageHeader';
import { FundingBar } from '@/components/mustaf/FundingBar';
import { EscrowNote } from '@/components/mustaf/Notices';
import { formatFcfa, formatEur, formatDateShort } from '@/lib/utils';

export default async function EpargnePage() {
  const mp = getMustafProvider();
  const [escrow, deposits] = await Promise.all([
    mp.getEscrowSummary(),
    mp.getDeposits(),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Compte épargne"
        breadcrumbs={[{ label: 'Mon projet', href: '/projet' }, { label: 'Compte épargne' }]}
      />

      {/* Solde */}
      <section className="bg-ink text-on-ink rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 text-on-ink-muted text-sm">
          <Wallet size={16} className="text-gold" />
          Solde du compte séquestre
        </div>
        <p className="font-display text-3xl sm:text-4xl font-semibold tracking-tight mt-2 break-words">{formatFcfa(escrow.balance)}</p>
        <p className="text-on-ink-muted text-sm mt-1">{formatEur(escrow.balance)}</p>
        <div className="mt-4 pt-4 border-t border-line-on-ink grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-on-ink-muted text-xs">Total versé</p>
            <p className="font-semibold mt-0.5">{formatFcfa(escrow.totalDeposited)}</p>
          </div>
          <div>
            <p className="text-on-ink-muted text-xs">Déjà débloqué (phases payées)</p>
            <p className="font-semibold mt-0.5">{formatFcfa(escrow.totalReleased)}</p>
          </div>
        </div>
      </section>

      <EscrowNote custodianName={escrow.custodianName} />

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
