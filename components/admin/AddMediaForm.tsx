'use client';

import { useActionState, useEffect, useRef } from 'react';
import { Camera } from 'lucide-react';
import { addMedia } from '@/app/(admin)/admin/actions';

const INPUT = 'w-full border border-stone-200 rounded-xl px-3 py-2 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent';
const LABEL = 'block text-xs font-medium text-text mb-1';

export function AddMediaForm({ projectId, phases }: { projectId: string; phases: { id: string; label: string }[] }) {
  const [state, action, pending] = useActionState(addMedia, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => { if (state?.ok) formRef.current?.reset(); }, [state]);

  return (
    <form ref={formRef} action={action} className="space-y-3">
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="type" value="photo" />

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className={LABEL} htmlFor="med-phase">Phase</label>
          <select id="med-phase" name="phaseId" required className={INPUT}>
            {phases.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
        </div>
        <div>
          <label className={LABEL} htmlFor="med-caption">Légende</label>
          <input id="med-caption" name="caption" placeholder="Coulage de la fondation" className={INPUT} />
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <div>
          <label className={LABEL} htmlFor="med-date">Date de capture</label>
          <input id="med-date" name="capturedAt" type="datetime-local" className={INPUT} />
        </div>
        <div>
          <label className={LABEL} htmlFor="med-lat">Latitude</label>
          <input id="med-lat" name="lat" type="number" step="any" placeholder="14.7167" className={INPUT} />
        </div>
        <div>
          <label className={LABEL} htmlFor="med-lng">Longitude</label>
          <input id="med-lng" name="lng" type="number" step="any" placeholder="-17.4677" className={INPUT} />
        </div>
      </div>

      <p className="text-[11px] text-muted">
        Métadonnées sacrées (§4) : une photo sans date + GPS est acceptée mais <span className="font-semibold text-amber-700">marquée « métadonnée manquante »</span> — jamais masquée.
      </p>

      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
      {state?.ok && <p className="text-xs text-emerald-700">Média ajouté — visible côté client.</p>}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 text-sm font-semibold bg-accent text-white px-4 py-2.5 rounded-xl hover:bg-accent-bright transition-colors cursor-pointer disabled:opacity-60"
      >
        <Camera size={15} />
        {pending ? 'Ajout…' : 'Ajouter le média'}
      </button>
    </form>
  );
}
