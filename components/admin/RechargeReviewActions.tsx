'use client';

import { useActionState, useState } from 'react';
import { Check } from 'lucide-react';
import { reviewRecharge, type ActionState } from '@/app/(admin)/admin/actions';

const BTN_PRIMARY = 'text-xs font-semibold bg-accent text-white px-3 py-1.5 rounded-lg hover:bg-accent-bright transition-colors disabled:opacity-50 cursor-pointer';
const BTN_GHOST = 'text-xs font-semibold text-muted border border-line px-3 py-1.5 rounded-lg hover:bg-stone-50 transition-colors disabled:opacity-50 cursor-pointer';
const BTN_DANGER = 'text-xs font-semibold bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 cursor-pointer';

/** Motifs de refus proposés (le client les verra). */
const REASONS = ['Argent non reçu', 'Montant déclaré incorrect', 'Autre motif'] as const;

/**
 * Actions admin sur une recharge en attente : Valider (→ crée le dépôt, le solde
 * monte) ou Refuser. Le refus déplie un motif obligatoire (préréglage + commentaire
 * libre) — le solde du client ne bouge jamais au refus. Tout passe par l'action
 * serveur `reviewRecharge` (audit + revalidation des deux espaces).
 */
export function RechargeReviewActions({ id, contributorName, amountLabel }: {
  id: string; contributorName: string; amountLabel: string;
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(reviewRecharge, null);
  const [rejecting, setRejecting] = useState(false);
  const [preset, setPreset] = useState<string>(REASONS[0]);

  // En mode refus : formulaire de motif.
  if (rejecting) {
    return (
      <form action={action} className="w-full sm:w-72 space-y-2">
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="decision" value="reject" />
        <p className="text-[11px] text-muted">
          Motif du refus de la recharge de <span className="font-medium text-text">{contributorName}</span> ({amountLabel})
        </p>
        <select
          name="reasonPreset"
          value={preset}
          onChange={(e) => setPreset(e.target.value)}
          className="w-full rounded-lg border border-line bg-white px-2.5 py-2 text-xs text-text focus:outline-none focus:border-ink"
        >
          {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <textarea
          name="comment"
          rows={2}
          placeholder={preset === 'Autre motif' ? 'Précisez le motif…' : 'Commentaire (facultatif)'}
          required={preset === 'Autre motif'}
          className="w-full rounded-lg border border-line bg-white px-2.5 py-2 text-xs text-text placeholder:text-muted/70 focus:outline-none focus:border-ink resize-none"
        />
        {state?.error && <p className="text-[11px] text-red-600">{state.error}</p>}
        <div className="flex items-center gap-2">
          <button type="submit" disabled={pending} className={BTN_DANGER}>
            {pending ? '…' : 'Confirmer le refus'}
          </button>
          <button type="button" onClick={() => setRejecting(false)} className={BTN_GHOST}>
            Annuler
          </button>
        </div>
      </form>
    );
  }

  // Vue par défaut : Valider / Refuser.
  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        <form action={action}>
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="decision" value="approve" />
          <button type="submit" disabled={pending} className={BTN_PRIMARY}>
            {pending ? '…' : <span className="inline-flex items-center gap-1"><Check size={13} /> Valider</span>}
          </button>
        </form>
        <button type="button" onClick={() => setRejecting(true)} disabled={pending} className={BTN_GHOST}>
          Refuser
        </button>
      </div>
      {state?.error && <p className="text-[11px] text-red-600">{state.error}</p>}
    </div>
  );
}
