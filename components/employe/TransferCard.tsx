'use client';

import { useActionState, useState } from 'react';
import { CheckCircle2, XCircle, ChevronDown } from 'lucide-react';
import { confirmTransferAction, denyTransferAction } from '@/app/(employe)/equipe/actions';
import { formatFcfa, formatEur, formatDateShort } from '@/lib/utils';
import type { ProspectorTransfer } from '@/lib/admin/types';
import type { ActionState } from '@/app/(employe)/equipe/actions';

export function TransferCard({ transfer: t }: { transfer: ProspectorTransfer }) {
  const [showDenyForm, setShowDenyForm] = useState(false);
  const [confirmState, confirmAction, confirmPending] = useActionState<ActionState, FormData>(confirmTransferAction, null);
  const [denyState, denyAction, denyPending]         = useActionState<ActionState, FormData>(denyTransferAction, null);

  if (confirmState?.ok || denyState?.ok) {
    const confirmed = !!confirmState?.ok;
    return (
      <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm ${confirmed ? 'border-emerald-200 bg-emerald-50/60 text-emerald-700' : 'border-red-200 bg-red-50/60 text-red-700'}`}>
        {confirmed ? <CheckCircle2 size={16} className="shrink-0" /> : <XCircle size={16} className="shrink-0" />}
        {confirmed ? 'Réception confirmée. Merci !' : 'Signalement envoyé au superviseur.'}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-amber-200 shadow-sm p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-text">{t.motif}</p>
          <p className="text-[11px] text-muted mt-0.5">Envoyé le {formatDateShort(t.sentAt)}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-base font-bold text-text">{formatFcfa(t.amount)}</p>
          <p className="text-[11px] text-muted">≈ {formatEur(t.amount)}</p>
        </div>
      </div>

      {(confirmState?.error || denyState?.error) && (
        <p className="text-[11px] text-red-600">{confirmState?.error ?? denyState?.error}</p>
      )}

      {!showDenyForm ? (
        <div className="flex gap-2 flex-wrap">
          {/* Confirmer */}
          <form action={confirmAction} className="contents">
            <input type="hidden" name="transferId" value={t.id} />
            <button
              type="submit"
              disabled={confirmPending || denyPending}
              className="inline-flex items-center gap-1.5 text-sm font-semibold bg-ink text-on-ink px-4 py-2 rounded-xl hover:bg-ink-soft transition-colors cursor-pointer disabled:opacity-60"
            >
              <CheckCircle2 size={15} /> {confirmPending ? 'Envoi…' : "J'ai bien reçu"}
            </button>
          </form>

          {/* Ouvrir formulaire de refus */}
          <button
            type="button"
            onClick={() => setShowDenyForm(true)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600 border border-red-200 bg-red-50 px-4 py-2 rounded-xl hover:bg-red-100 transition-colors cursor-pointer"
          >
            <XCircle size={15} /> Je n&apos;ai pas reçu
          </button>
        </div>
      ) : (
        <form action={denyAction} className="space-y-2">
          <input type="hidden" name="transferId" value={t.id} />
          <label className="block text-xs font-medium text-text">
            Précise ce qui s&apos;est passé (facultatif) :
          </label>
          <textarea
            name="reason"
            rows={2}
            placeholder="Ex. : je n'ai reçu aucun virement Wave ce jour-là."
            className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 resize-none"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={denyPending}
              className="inline-flex items-center gap-1.5 text-sm font-semibold bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-60"
            >
              <XCircle size={15} /> {denyPending ? 'Envoi…' : 'Confirmer le signalement'}
            </button>
            <button
              type="button"
              onClick={() => setShowDenyForm(false)}
              className="text-sm text-muted px-3 py-2 rounded-xl hover:bg-stone-50 transition-colors cursor-pointer"
            >
              Annuler
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
