'use client';

import { useActionState, useState } from 'react';
import { Check, ShieldCheck, ArrowRight, Plus, Clock } from 'lucide-react';
import { formatFcfa, formatEur } from '@/lib/utils';
import { rechargeAccount, type RechargeState } from './actions';

/** Parse un montant tapé librement (« 50 000 », « 50000 ») en entier FCFA. */
function parseAmount(v: string): number {
  return Number(v.replace(/[^\d]/g, '')) || 0;
}

/**
 * Recharge du compte séquestre par Wave (simulée — mustaf.md §4/§12).
 * Étape 1 : le client saisit le nom du contributeur et le montant.
 * Étape 2 : il scanne le QR Wave et envoie la somme.
 * Étape 3 : il confirme ; le dépôt s'ajoute et le nouveau solde s'affiche.
 */
export default function RechargeForm({ memberNames }: { memberNames: string[] }) {
  const [state, action, isPending] = useActionState<RechargeState, FormData>(rechargeAccount, null);

  const [name, setName] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const amount = parseAmount(amountStr);
  const detailsOk = name.trim().length > 0 && amount >= 1000;
  const canSubmit = detailsOk && confirmed && !isPending;

  // ── Succès : la recharge est DÉCLARÉE et part en validation (le solde ne bouge
  //    pas encore). On le dit clairement pour ne pas faire croire que c'est crédité. ──
  if (state && 'ok' in state) {
    return (
      <section className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mx-auto">
          <Clock size={24} className="text-amber-600" strokeWidth={2.5} />
        </div>
        <h2 className="font-serif text-lg font-semibold text-text mt-3">Recharge envoyée pour validation</h2>
        <p className="text-sm text-muted mt-1">
          <span className="font-medium text-text">{state.name}</span> a déclaré{' '}
          <span className="font-semibold text-text">{formatFcfa(state.amount)}</span>{' '}
          <span className="text-muted">({formatEur(state.amount)})</span>.
        </p>
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-left">
          <p className="flex items-start gap-2 text-xs text-amber-800 leading-relaxed">
            <ShieldCheck size={15} className="text-amber-600 shrink-0 mt-0.5" />
            <span>
              Votre solde <span className="font-semibold">ne change pas encore</span>. Litug vérifie
              que le virement Wave a bien été reçu chez le notaire, puis valide la recharge — votre
              solde sera alors mis à jour. Vous gardez la trace de votre demande ci-dessous.
            </span>
          </p>
        </div>
        <a
          href="/projet/epargne"
          className="inline-flex items-center gap-1.5 mt-5 text-sm font-semibold text-accent"
        >
          <Plus size={15} /> Faire une autre recharge
        </a>
      </section>
    );
  }

  return (
    <form
      action={action}
      className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 sm:p-6 space-y-5"
    >
      <div>
        <h2 className="font-serif text-lg font-semibold text-text">Recharger par Wave</h2>
        <p className="text-sm text-muted mt-0.5">
          Indiquez qui recharge et le montant, puis scannez le QR code Wave.
        </p>
      </div>

      {state?.error && (
        <div className="rounded-lg bg-red-50 border border-red-100 text-red-700 text-sm px-3 py-2">
          {state.error}
        </div>
      )}

      {/* ── Étape 1 : nom + montant ── */}
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-text mb-1.5">
            Nom de la personne qui recharge
          </label>
          <input
            id="name"
            name="name"
            list="member-names"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex. Modou Fall"
            autoComplete="off"
            className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-text placeholder:text-muted/70 focus:outline-none focus:border-ink"
          />
          <datalist id="member-names">
            {memberNames.map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-text mb-1.5">
            Montant à recharger (FCFA)
          </label>
          <input
            id="amount"
            name="amount"
            inputMode="numeric"
            required
            value={amountStr}
            onChange={(e) => setAmountStr(e.target.value)}
            placeholder="Ex. 50 000"
            className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-text placeholder:text-muted/70 focus:outline-none focus:border-ink"
          />
          {amount > 0 && (
            <p className="text-xs text-muted mt-1">≈ {formatEur(amount)}</p>
          )}
        </div>
      </div>

      {/* ── Étape 2 : QR Wave (révélé quand le nom + le montant sont saisis) ── */}
      {detailsOk && (
        <div className="rounded-xl bg-paper-2/40 border border-line p-4 text-center">
          <div className="bg-white rounded-lg p-3 inline-block shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/wave-qr.png" alt="QR code Wave — Litug" className="w-40 h-40 object-contain mx-auto" />
          </div>
          <p className="text-sm text-text mt-3">
            Scannez ce code avec l’application <b>Wave</b> et envoyez{' '}
            <b>{formatFcfa(amount)}</b>.
          </p>
          <p className="flex items-start gap-1.5 justify-center text-xs text-muted mt-2">
            <ShieldCheck size={14} className="text-accent shrink-0 mt-0.5" />
            <span>Le compte séquestre est tenu par un tiers — votre argent n’est jamais détenu par Litug.</span>
          </p>
        </div>
      )}

      {/* ── Étape 3 : confirmation + envoi ── */}
      <label
        className={`flex items-center gap-2.5 rounded-lg border px-3 py-2.5 cursor-pointer transition ${
          confirmed ? 'border-ink bg-stone-50' : 'border-line'
        } ${!detailsOk ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <input
          type="checkbox"
          name="confirmed"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          className="sr-only"
        />
        <span
          className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${
            confirmed ? 'bg-ink border-ink text-white' : 'border-line bg-white'
          }`}
        >
          {confirmed && <Check size={14} strokeWidth={3} />}
        </span>
        <span className="text-sm text-text">J’ai envoyé le paiement via Wave</span>
      </label>

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-ink text-white text-sm font-semibold px-4 py-3 disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        {isPending ? 'Validation…' : (
          <>Valider la recharge {amount > 0 && `de ${formatFcfa(amount)}`} <ArrowRight size={16} /></>
        )}
      </button>
    </form>
  );
}
