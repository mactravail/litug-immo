'use client';

import { useActionState, useEffect, useRef } from 'react';
import { Plus, Receipt } from 'lucide-react';
import { addReceiptAction } from '@/app/(employe)/equipe/actions';

const INPUT = 'w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent';

interface Props {
  advanceId: string;
  taskId: string;
}

/** Ajoute un reçu (libellé + montant + photo) — recalcule la dépense justifiée. */
export function AddReceiptForm({ advanceId, taskId }: Props) {
  const [state, action, pending] = useActionState(addReceiptAction, null);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state?.ok) ref.current?.reset(); }, [state]);

  return (
    <form ref={ref} action={action} className="space-y-3 rounded-xl bg-paper-2/40 border border-line p-3">
      <input type="hidden" name="advanceId" value={advanceId} />
      <input type="hidden" name="taskId" value={taskId} />
      <p className="flex items-center gap-1.5 text-xs font-semibold text-text">
        <Receipt size={14} className="text-accent" /> Ajouter un reçu
      </p>
      <div className="grid sm:grid-cols-2 gap-2">
        <input name="label" required placeholder="Libellé (ex. ciment Sococim)" className={INPUT} />
        <input name="amount" type="number" min={1} inputMode="numeric" required placeholder="Montant FCFA" className={INPUT} />
      </div>
      {/* Capture caméra pour conserver géoloc + horodatage (preuve) */}
      <label className="flex items-center gap-2 text-xs text-muted cursor-pointer">
        <input type="file" name="photo" accept="image/*" capture="environment" className="text-xs file:mr-2 file:rounded-lg file:border-0 file:bg-stone-100 file:px-3 file:py-1.5 file:text-xs file:text-text" />
      </label>
      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-1.5 text-xs font-semibold bg-accent text-white px-3 py-2 rounded-lg hover:bg-accent-bright transition-colors cursor-pointer disabled:opacity-60"
      >
        <Plus size={13} /> {pending ? 'Ajout…' : 'Ajouter le reçu'}
      </button>
    </form>
  );
}
