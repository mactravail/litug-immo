'use client';

import { useActionState, useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { sendTransferAction, type SendTransferState } from '@/app/(admin)/admin/prospection/actions';

interface Props {
  prospectorId: string;
  prospectorName: string;
}

const MOTIF_OPTIONS = [
  { value: 'salaire',    label: 'Salaire' },
  { value: 'connexion',  label: 'Connexion internet' },
  { value: 'bonus',      label: 'Bonus' },
];

export function SendTransferForm({ prospectorId, prospectorName }: Props) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<SendTransferState, FormData>(sendTransferAction, null);

  if (state?.ok && !open) {
    return (
      <div className="flex items-center gap-2 text-xs text-emerald-700">
        <CheckCircle2 size={13} /> Paiement enregistré — l&apos;employé doit confirmer la réception.
      </div>
    );
  }

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 text-xs font-medium text-accent hover:underline cursor-pointer"
      >
        {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        Saisir un paiement reçu
      </button>

      {open && (
        <form action={action} className="mt-2 space-y-2 p-3 rounded-xl border border-stone-100 bg-stone-50">
          <input type="hidden" name="prospectorId"   value={prospectorId} />
          <input type="hidden" name="prospectorName" value={prospectorName} />

          <p className="text-[11px] text-muted italic">
            Argent déjà versé — saisie pour traçabilité uniquement.
          </p>

          <div className="flex gap-2">
            <div className="flex-1 min-w-0">
              <label className="block text-[11px] font-medium text-muted mb-1">Montant (FCFA)</label>
              <input
                type="number"
                name="amount"
                min={1}
                step={1}
                placeholder="10000"
                required
                className="w-full rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-muted mb-1">Type</label>
            <select
              name="motif"
              required
              defaultValue=""
              className="w-full rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent/30"
            >
              <option value="" disabled>— Choisir —</option>
              {MOTIF_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {state?.error && <p className="text-[11px] text-red-600">{state.error}</p>}
          {state?.ok   && <p className="text-[11px] text-emerald-700">Paiement enregistré !</p>}

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={pending}
              className="inline-flex items-center gap-1.5 text-xs font-semibold bg-accent text-white px-3 py-1.5 rounded-lg hover:bg-accent-bright transition-colors cursor-pointer disabled:opacity-60"
            >
              <CheckCircle2 size={12} /> {pending ? 'Enregistrement…' : 'Enregistrer'}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xs text-muted px-3 py-1.5 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
            >
              Annuler
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
