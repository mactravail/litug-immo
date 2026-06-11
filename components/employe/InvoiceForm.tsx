'use client';

import { useActionState, useEffect, useRef } from 'react';
import { ReceiptText, Plus } from 'lucide-react';
import { addInvoiceAction } from '@/app/(employe)/equipe/actions';
import { EXPENSE_CATEGORY_LABEL } from '@/lib/mustaf/labels';
import type { ExpenseCategory } from '@/lib/mustaf/types';

const INPUT = 'w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent';
const LABEL = 'block text-xs font-medium text-text mb-1';

interface Props {
  phases: { id: string; label: string }[];
}

/** procurement — ajoute une facture fournisseur (prix réel, zéro marge §3.9). */
export function InvoiceForm({ phases }: Props) {
  const [state, action, pending] = useActionState(addInvoiceAction, null);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state?.ok) ref.current?.reset(); }, [state]);

  return (
    <form ref={ref} action={action} className="space-y-3 bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
      <p className="flex items-center gap-2 text-sm font-semibold text-text">
        <ReceiptText size={16} className="text-accent" /> Ajouter une facture
      </p>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className={LABEL} htmlFor="i-phase">Phase</label>
          <select id="i-phase" name="phaseId" required className={INPUT}>
            {phases.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
        </div>
        <div>
          <label className={LABEL} htmlFor="i-cat">Catégorie</label>
          <select id="i-cat" name="category" defaultValue="materials" className={INPUT}>
            {(Object.keys(EXPENSE_CATEGORY_LABEL) as ExpenseCategory[])
              .filter(c => c !== 'management_fee' && c !== 'phase_zero')
              .map(c => <option key={c} value={c}>{EXPENSE_CATEGORY_LABEL[c]}</option>)}
          </select>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className={LABEL} htmlFor="i-label">Libellé</label>
          <input id="i-label" name="label" required placeholder="Ex. 70 sacs de ciment" className={INPUT} />
        </div>
        <div>
          <label className={LABEL} htmlFor="i-amount">Montant (FCFA)</label>
          <input id="i-amount" name="amount" type="number" min={1} inputMode="numeric" required placeholder="300000" className={INPUT} />
        </div>
      </div>

      <div>
        <label className={LABEL} htmlFor="i-supplier">Fournisseur</label>
        <input id="i-supplier" name="supplierName" placeholder="Ex. Sococim" className={INPUT} />
      </div>

      <p className="text-[11px] text-muted">Prix de gros réel, sans marge. La facture est visible par le client sur son tableau de bord.</p>
      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
      {state?.ok && <p className="text-xs text-emerald-700">Facture ajoutée — visible côté client.</p>}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-1.5 text-sm font-semibold bg-accent text-white px-4 py-2.5 rounded-xl hover:bg-accent-bright transition-colors cursor-pointer disabled:opacity-60"
      >
        <Plus size={14} /> {pending ? 'Ajout…' : 'Ajouter la facture'}
      </button>
    </form>
  );
}
