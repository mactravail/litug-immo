import { Wallet, ShoppingCart, HandCoins, Undo2, AlertTriangle, CheckCircle2, Banknote } from 'lucide-react';
import { getCurrentWorkerId } from '@/lib/employe/current';
import { getWallet, listMyAdvances, listMyPayments } from '@/lib/employe/provider';
import { PAYMENT_METHOD_LABEL } from '@/lib/employe/labels';
import { formatFcfa, formatEur, formatDateShort, cn } from '@/lib/utils';

function FlowCard({ icon: Icon, label, amount, hint, tone }: {
  icon: typeof Wallet; label: string; amount: number; hint: string; tone: 'buy' | 'pay' | 'return';
}) {
  const ring = tone === 'pay' ? 'border-emerald-200 bg-emerald-50/50' : tone === 'return' ? 'border-stone-200 bg-paper-2/40' : 'border-accent/20 bg-accent-light';
  const color = tone === 'pay' ? 'text-emerald-700' : tone === 'return' ? 'text-text' : 'text-accent';
  return (
    <div className={cn('rounded-2xl border p-4 space-y-1', ring)}>
      <div className={cn('flex items-center gap-1.5 text-xs font-medium', color)}>
        <Icon size={14} /> {label}
      </div>
      <p className="text-xl font-bold text-text">{formatFcfa(amount)}</p>
      <p className="text-[11px] text-muted">≈ {formatEur(amount)} · {hint}</p>
    </div>
  );
}

export default async function WalletPage() {
  const workerId = await getCurrentWorkerId();
  const wallet = getWallet(workerId);
  const advances = listMyAdvances(workerId);
  const payments = listMyPayments(workerId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-text">Mon argent</h1>
        <p className="text-muted text-sm mt-1">Ce qu’on t’a confié pour acheter, ce que tu as reçu en paiement, et ce que tu as rendu.</p>
      </div>

      {/* Les 3 flux */}
      <div className="grid sm:grid-cols-3 gap-3">
        <FlowCard icon={ShoppingCart} label="Reçu pour acheter" amount={wallet.advancesReceived} hint="à justifier par reçus" tone="buy" />
        <FlowCard icon={HandCoins} label="Reçu en paiement" amount={wallet.paymentsReceived} hint="ta rémunération" tone="pay" />
        <FlowCard icon={Undo2} label="Argent rendu" amount={wallet.advancesReturned} hint="solde restitué" tone="return" />
      </div>

      {/* Alerte si argent encore à régulariser */}
      {wallet.advancesOutstanding > 0 && (
        <p className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">
          <AlertTriangle size={15} className="mt-0.5 shrink-0" />
          Il te reste <strong className="mx-1">{formatFcfa(wallet.advancesOutstanding)}</strong> à régulariser (reçus manquants ou solde à rendre). Tu ne pourras pas recevoir de nouvelle avance tant que ce n’est pas réglé.
        </p>
      )}

      {/* Avances reçues pour acheter */}
      <section className="space-y-3">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-muted uppercase tracking-wide">
          <Wallet size={14} /> Avances reçues pour acheter
        </p>
        {advances.length === 0 ? (
          <p className="text-sm text-muted">Aucune avance.</p>
        ) : advances.map(({ advance, reconciliation, taskTitle }) => {
          const flagged = reconciliation.hasGap || reconciliation.missingReceipts;
          return (
            <div key={advance.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-text">{advance.purpose}</p>
                  {taskTitle && <p className="text-[11px] text-muted">{taskTitle} · {formatDateShort(advance.createdAt)}</p>}
                </div>
                {advance.reconciled ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700"><CheckCircle2 size={13} /> Clôturée</span>
                ) : flagged ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600"><AlertTriangle size={13} /> À régulariser</span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700"><CheckCircle2 size={13} /> Conforme</span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-stone-50 border border-line py-2">
                  <p className="text-[10px] text-muted uppercase">Donné</p>
                  <p className="text-sm font-semibold text-text mt-0.5">{formatFcfa(advance.amountGiven)}</p>
                </div>
                <div className="rounded-xl bg-stone-50 border border-line py-2">
                  <p className="text-[10px] text-muted uppercase">Dépensé</p>
                  <p className="text-sm font-semibold text-text mt-0.5">{formatFcfa(advance.amountSpent)}</p>
                </div>
                <div className="rounded-xl bg-stone-50 border border-line py-2">
                  <p className="text-[10px] text-muted uppercase">Rendu</p>
                  <p className="text-sm font-semibold text-text mt-0.5">{formatFcfa(advance.amountReturned)}</p>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Paiements reçus pour le travail */}
      <section className="space-y-3">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-muted uppercase tracking-wide">
          <Banknote size={14} /> Paiements reçus (ma rémunération)
        </p>
        {payments.length === 0 ? (
          <p className="text-sm text-muted">Aucun paiement enregistré.</p>
        ) : (
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm divide-y divide-line">
            {payments.map(p => (
              <div key={p.id} className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text">{p.label}</p>
                  <p className="text-[11px] text-muted">{formatDateShort(p.paidAt)} · {PAYMENT_METHOD_LABEL[p.method]}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-emerald-700">{formatFcfa(p.amount)}</p>
                  <p className="text-[11px] text-muted">≈ {formatEur(p.amount)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <p className="text-[11px] text-muted">
        Rappel : une <strong>avance</strong> est de l’argent confié pour acheter — elle se justifie par des reçus et le solde se rend.
        Un <strong>paiement</strong> est ta rémunération, il te reste acquis.
      </p>
    </div>
  );
}
