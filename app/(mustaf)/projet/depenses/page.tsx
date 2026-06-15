import { Receipt, FileText, AlertTriangle } from 'lucide-react';
import { getMustafProvider } from '@/lib/mustaf/provider';
import { PageHeader } from '@/components/ui/PageHeader';
import { AnomalyButton } from '@/components/mustaf/AnomalyButton';
import { EXPENSE_CATEGORY_LABEL } from '@/lib/mustaf/labels';
import { formatFcfa, formatEur, formatDateShort } from '@/lib/utils';

export default async function DepensesPage() {
  const mp = getMustafProvider();
  const [expenses, orders] = await Promise.all([
    mp.getExpenses(),
    mp.getMaterialOrders(),
  ]);

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dépenses"
        breadcrumbs={[{ label: 'Mon projet', href: '/projet' }, { label: 'Dépenses' }]}
      />

      {/* Total */}
      <section className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-accent-light flex items-center justify-center shrink-0">
          <Receipt size={20} className="text-accent" />
        </div>
        <div>
          <p className="text-sm text-muted">Total dépensé à ce jour</p>
          <p className="font-display text-2xl font-semibold text-text">{formatFcfa(total)}</p>
          <p className="text-xs text-muted">{formatEur(total)}</p>
        </div>
      </section>

      {/* Détail par poste */}
      <section>
        <h2 className="font-serif text-lg font-semibold text-text mb-4">Détail par poste</h2>
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm divide-y divide-stone-50">
          {expenses.map(e => (
            <div key={e.id} className="px-4 py-3.5 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium text-text">{e.label}</p>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                    {EXPENSE_CATEGORY_LABEL[e.category]}
                  </span>
                </div>
                <p className="text-xs text-muted mt-0.5">
                  {e.supplierName ? `${e.supplierName} · ` : ''}{formatDateShort(e.createdAt)}
                </p>
                <div className="flex items-center gap-4 mt-1.5">
                  {e.invoiceUrl && (
                    <a href={e.invoiceUrl} className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent hover:underline">
                      <FileText size={12} /> Voir la facture
                    </a>
                  )}
                  <AnomalyButton target="expense" />
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-text">{formatFcfa(e.amount)}</p>
                <p className="text-[11px] text-muted">{formatEur(e.amount)}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted mt-3">
          Zéro marge sur les matériaux : chaque montant correspond à la facture du fournisseur. Le revenu de Litug
          se limite à la commission de gestion.
        </p>
      </section>

      {/* Réconciliation des quantités */}
      <section>
        <h2 className="font-serif text-lg font-semibold text-text mb-4">Réconciliation des matériaux</h2>
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-50 bg-stone-50/50 text-left">
                <th className="px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Matériau</th>
                <th className="px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Commandé</th>
                <th className="px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Utilisé</th>
                <th className="px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Écart</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {orders.map(o => {
                const gap = +(o.qtyOrdered - o.qtyUsed).toFixed(2);
                const flagged = gap > 0;
                return (
                  <tr key={o.id}>
                    <td className="px-4 py-3 font-medium text-text">{o.item}</td>
                    <td className="px-4 py-3 text-muted">{o.qtyOrdered} {o.unit}</td>
                    <td className="px-4 py-3 text-muted">{o.qtyUsed} {o.unit}</td>
                    <td className="px-4 py-3">
                      {flagged ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700">
                          <AlertTriangle size={12} /> {gap} {o.unit}
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-emerald-600">Conforme</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted mt-3">
          Tout écart entre la quantité commandée et la quantité réellement utilisée est signalé automatiquement.
        </p>
      </section>
    </div>
  );
}
