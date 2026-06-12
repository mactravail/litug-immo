'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';
import { createProspectAction } from '@/app/(employe)/equipe/actions';
import {
  PROSPECT_NETWORK_LABEL, PROSPECT_CONTACT_LABEL, PROSPECT_OUTCOME_LABEL,
} from '@/lib/admin/labels';
import type { ProspectNetwork, ProspectContactMethod, ProspectOutcome } from '@/lib/admin/types';

const INPUT = 'w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent';
const LABEL = 'block text-xs font-medium text-text mb-1';

export function ProspectForm({ today }: { today: string }) {
  const [state, action, pending] = useActionState(createProspectAction, null);
  const ref = useRef<HTMLFormElement>(null);
  const [outcome, setOutcome] = useState<ProspectOutcome>('no_response');

  // Sur succès : on vide les champs non contrôlés (comme IncidentForm). Le select
  // « résultat » est contrôlé et reste sur le dernier choix — cohérent, et pratique
  // pour enchaîner des prospects au même statut.
  useEffect(() => { if (state?.ok) ref.current?.reset(); }, [state]);

  const responded = outcome !== 'no_response';

  return (
    <form ref={ref} action={action} className="space-y-4 bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
      <input type="hidden" name="prospectedAt" value={today} />

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className={LABEL} htmlFor="companyName">Entreprise / vendeur prospecté</label>
          <input id="companyName" name="companyName" type="text" required placeholder="ex. Keur Massar Immobilier" className={INPUT} />
        </div>
        <div>
          <label className={LABEL} htmlFor="network">Réseau social</label>
          <select id="network" name="network" defaultValue="facebook" className={INPUT}>
            {(Object.keys(PROSPECT_NETWORK_LABEL) as ProspectNetwork[]).map(n => (
              <option key={n} value={n}>{PROSPECT_NETWORK_LABEL[n]}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={LABEL} htmlFor="outcome">A-t-il répondu&nbsp;?</label>
        <select
          id="outcome"
          name="outcome"
          value={outcome}
          onChange={e => setOutcome(e.target.value as ProspectOutcome)}
          className={INPUT}
        >
          {(Object.keys(PROSPECT_OUTCOME_LABEL) as ProspectOutcome[]).map(o => (
            <option key={o} value={o}>{PROSPECT_OUTCOME_LABEL[o]}</option>
          ))}
        </select>
      </div>

      {/* Moyen de contact — seulement s'il a répondu */}
      {responded && (
        <div>
          <label className={LABEL} htmlFor="contactMethod">Contact via</label>
          <select id="contactMethod" name="contactMethod" defaultValue="message" className={INPUT}>
            {(Object.keys(PROSPECT_CONTACT_LABEL) as ProspectContactMethod[]).map(c => (
              <option key={c} value={c}>{PROSPECT_CONTACT_LABEL[c]}</option>
            ))}
          </select>
        </div>
      )}

      {/* Objection — surtout utile en cas de refus */}
      {responded && (
        <div>
          <label className={LABEL} htmlFor="concern">
            {outcome === 'refused' ? 'Son souci / pourquoi il refuse Sara' : 'Remarques du prospect (optionnel)'}
          </label>
          <textarea id="concern" name="concern" rows={2} placeholder="ex. Trouve ça trop cher, préfère vendre via WhatsApp…" className={INPUT} />
        </div>
      )}

      <div>
        <label className={LABEL} htmlFor="notes">Notes (optionnel)</label>
        <input id="notes" name="notes" type="text" placeholder="ex. Relancer dans 3 jours, demande des témoignages…" className={INPUT} />
      </div>

      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
      {state?.ok && (
        <p className="flex items-center gap-1.5 text-xs text-emerald-700">
          <CheckCircle2 size={14} /> Prospection enregistrée. Tu peux en saisir une autre.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 text-sm font-semibold bg-accent text-white px-4 py-2.5 rounded-xl hover:bg-accent-bright transition-colors cursor-pointer disabled:opacity-60"
      >
        <Send size={15} /> {pending ? 'Enregistrement…' : 'Enregistrer la prospection'}
      </button>
    </form>
  );
}
