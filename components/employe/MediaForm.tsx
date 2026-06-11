'use client';

import { useActionState, useEffect, useRef } from 'react';
import { Camera, Plus } from 'lucide-react';
import { addMediaAction } from '@/app/(employe)/equipe/actions';
import { GeoCapture } from './GeoCapture';

const INPUT = 'w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent';
const LABEL = 'block text-xs font-medium text-text mb-1';

interface Props {
  phases: { id: string; label: string }[];
}

/** site_agent / inspector — photo de chantier géolocalisée + horodatée (preuve §3.11). */
export function MediaForm({ phases }: Props) {
  const [state, action, pending] = useActionState(addMediaAction, null);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state?.ok) ref.current?.reset(); }, [state]);

  return (
    <form ref={ref} action={action} className="space-y-3 bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
      <p className="flex items-center gap-2 text-sm font-semibold text-text">
        <Camera size={16} className="text-accent" /> Ajouter une photo de chantier
      </p>

      <div>
        <label className={LABEL} htmlFor="m-phase">Phase</label>
        <select id="m-phase" name="phaseId" required className={INPUT}>
          {phases.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
        </select>
      </div>

      <input type="hidden" name="type" value="photo" />

      <label className="flex items-center gap-2 text-xs text-muted cursor-pointer">
        <input type="file" name="photo" accept="image/*" capture="environment" className="text-xs file:mr-2 file:rounded-lg file:border-0 file:bg-stone-100 file:px-3 file:py-1.5 file:text-xs file:text-text" />
      </label>

      <div>
        <label className={LABEL} htmlFor="m-caption">Légende</label>
        <input id="m-caption" name="caption" placeholder="Ex. ferraillage avant coulage" className={INPUT} />
      </div>

      <GeoCapture />

      <p className="text-[11px] text-muted">Prends la photo avec l’appareil de l’app : sans géoloc + horodatage, elle est acceptée mais marquée « non vérifiée ».</p>
      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
      {state?.ok && <p className="text-xs text-emerald-700">Photo ajoutée au suivi du chantier.</p>}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-1.5 text-sm font-semibold bg-accent text-white px-4 py-2.5 rounded-xl hover:bg-accent-bright transition-colors cursor-pointer disabled:opacity-60"
      >
        <Plus size={14} /> {pending ? 'Ajout…' : 'Ajouter la photo'}
      </button>
    </form>
  );
}
