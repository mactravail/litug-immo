'use client';

import { useActionState } from 'react';
import { Send } from 'lucide-react';
import { submitReportAction } from '@/app/(employe)/equipe/actions';
import { formatFcfa } from '@/lib/utils';

const INPUT = 'w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent';
const LABEL = 'block text-xs font-medium text-text mb-1';

interface Props {
  taskId: string;
  hasAdvance: boolean;
  suggestedReturn: number;     // solde à restituer = donné − dépensé
  defaults?: { workDone?: string; workRemaining?: string };
}

/** Rendu-compte de fin de mission : travail + solde rendu. Les reçus sont ajoutés au-dessus. */
export function ReportForm({ taskId, hasAdvance, suggestedReturn, defaults }: Props) {
  const [state, action, pending] = useActionState(submitReportAction, null);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="taskId" value={taskId} />

      <div>
        <label className={LABEL} htmlFor="r-done">Ce qui a été fait</label>
        <textarea id="r-done" name="workDone" rows={3} required defaultValue={defaults?.workDone}
          placeholder="Décris le travail réalisé…" className={INPUT} />
      </div>

      <div>
        <label className={LABEL} htmlFor="r-remaining">Ce qui reste à faire (optionnel)</label>
        <textarea id="r-remaining" name="workRemaining" rows={2} defaultValue={defaults?.workRemaining}
          placeholder="Rien à signaler, ou ce qui reste…" className={INPUT} />
      </div>

      {hasAdvance && (
        <div>
          <label className={LABEL} htmlFor="r-returned">Solde restitué (FCFA)</label>
          <input id="r-returned" name="amountReturned" type="number" min={0} inputMode="numeric"
            defaultValue={suggestedReturn > 0 ? suggestedReturn : 0} className={INPUT} />
          {suggestedReturn > 0 && (
            <p className="text-[11px] text-muted mt-1">
              D’après tes reçus, il te reste <strong className="text-text">{formatFcfa(suggestedReturn)}</strong> à restituer.
            </p>
          )}
        </div>
      )}

      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center gap-2 w-full text-sm font-semibold bg-accent text-white px-5 py-3.5 rounded-xl hover:bg-accent-bright transition-colors cursor-pointer disabled:opacity-60"
      >
        <Send size={16} /> {pending ? 'Envoi…' : 'Envoyer le rendu-compte'}
      </button>
    </form>
  );
}
