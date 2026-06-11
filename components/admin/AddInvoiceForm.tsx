'use client';

import { useActionState, useEffect, useRef } from 'react';
import { ReceiptText } from 'lucide-react';
import { addInvoice } from '@/app/(admin)/admin/actions';
import { EXPENSE_CATEGORY_LABEL } from '@/lib/mustaf/labels';
import type { ExpenseCategory } from '@/lib/mustaf/types';

const INPUT = 'w-full border border-stone-200 rounded-xl px-3 py-2 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent';
const LABEL = 'block text-xs font-medium text-text mb-1';

export function AddInvoiceForm({ projectId, phases }: { projectId: string; phases: { id: string; label: string }[] }) {
  const [state, action, pending] = useActionState(addInvoice, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => { if (state?.ok) formRef.current?.reset(); }, [state]);

  return (
    <form ref={formRef} action={action} className="space-y-3">
      <input type="hidden" name="projectId" value={projectId} />

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className={LABEL} htmlFor="inv-phase">Phase</label>
          <select id="inv-phase" name="phaseId" required className={INPUT}>
            {phases.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
        </div>
        <div>
          <label className={LABEL} htmlFor="inv-cat">Poste</label>
          <select id="inv-cat" name="category" required className={INPUT} defaultValue="materials">
            {(Object.keys(EXPENSE_CATEGORY_LABEL) as ExpenseCategory[]).map(c => (
              <option key={c} value={c}>{EXPENSE_CATEGORY_LABEL[c]}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={LABEL} htmlFor="inv-label">Libellé</label>
        <input id="inv-label" name="label" required placeholder="Ciment (50 sacs)" className={INPUT} />
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className={LABEL} htmlFor="inv-amount">Montant (FCFA)</label>
          <input id="inv-amount" name="amount" type="number" min={1} required placeholder="470000" className={INPUT} />
        </div>
        <div>
          <label className={LABEL} htmlFor="inv-supplier">Fournisseur</label>
          <input id="inv-supplier" name="supplierName" placeholder="Sococim" className={INPUT} />
        </div>
      </div>

      <p className="text-[11px] text-muted">
        Zéro marge matériaux : le montant saisi = la facture réelle, visible par le client (§3.9).
      </p>

      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
      {state?.ok && <p className="text-xs text-emerald-700">Facture ajoutée — visible côté client.</p>}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 text-sm font-semibold bg-accent text-white px-4 py-2.5 rounded-xl hover:bg-accent-bright transition-colors cursor-pointer disabled:opacity-60"
      >
        <ReceiptText size={15} />
        {pending ? 'Ajout…' : 'Ajouter la facture'}
      </button>
    </form>
  );
}
