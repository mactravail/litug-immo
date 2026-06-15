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
  // Par défaut : « À prospecter » — on note d'abord le contact, on appelle ensuite.
  const [outcome, setOutcome] = useState<ProspectOutcome>('to_contact');

  // Sur succès : on vide les champs non contrôlés (comme IncidentForm). Le select
  // « statut » est contrôlé et reste sur le dernier choix — pratique pour enchaîner.
  useEffect(() => { if (state?.ok) ref.current?.reset(); }, [state]);

  // « À prospecter » = simple fiche contact ; les autres = entreprise déjà démarchée.
  const contacted = outcome !== 'to_contact';

  return (
    <form ref={ref} action={action} className="space-y-4 bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
      <input type="hidden" name="prospectedAt" value={today} />

      <div>
        <label className={LABEL} htmlFor="companyName">Entreprise / vendeur</label>
        <input id="companyName" name="companyName" type="text" required placeholder="ex. Keur Massar Immobilier" className={INPUT} />
      </div>

      {/* Coordonnées du contact — le cœur de la demande : qui, et quel numéro. */}
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className={LABEL} htmlFor="contactName">Nom du contact</label>
          <input id="contactName" name="contactName" type="text" placeholder="ex. M. Diouf" className={INPUT} />
        </div>
        <div>
          <label className={LABEL} htmlFor="contactPhone">Numéro de téléphone</label>
          <input id="contactPhone" name="contactPhone" type="tel" inputMode="tel" placeholder="ex. +221 77 123 45 67" className={INPUT} />
        </div>
      </div>

      <div>
        <label className={LABEL} htmlFor="followers">Nombre d’abonnés (followers)</label>
        <input id="followers" name="followers" type="number" min="0" step="1" inputMode="numeric" placeholder="ex. 12000" className={INPUT} />
        <p className="text-[11px] text-muted mt-1">Sert à classer les prospects : plus l’audience est grande, plus c’est intéressant pour Sara.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className={LABEL} htmlFor="network">Où l’as-tu trouvé&nbsp;?</label>
          <select id="network" name="network" defaultValue="facebook" className={INPUT}>
            {(Object.keys(PROSPECT_NETWORK_LABEL) as ProspectNetwork[]).map(n => (
              <option key={n} value={n}>{PROSPECT_NETWORK_LABEL[n]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={LABEL} htmlFor="outcome">Statut</label>
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
      </div>

      {/* Moyen de contact — seulement si l'entreprise a été démarchée */}
      {contacted && (
        <div>
          <label className={LABEL} htmlFor="contactMethod">Contact via</label>
          <select id="contactMethod" name="contactMethod" defaultValue="call" className={INPUT}>
            {(Object.keys(PROSPECT_CONTACT_LABEL) as ProspectContactMethod[]).map(c => (
              <option key={c} value={c}>{PROSPECT_CONTACT_LABEL[c]}</option>
            ))}
          </select>
        </div>
      )}

      {/* Objection — surtout utile en cas de refus */}
      {contacted && (
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
        <Send size={15} /> {pending ? 'Enregistrement…' : 'Enregistrer'}
      </button>
    </form>
  );
}
