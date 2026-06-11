'use client';

import { useActionState, useEffect, useRef } from 'react';
import { TriangleAlert, Send } from 'lucide-react';
import { raiseIncidentAction } from '@/app/(employe)/equipe/actions';
import { TASK_PRIORITY_LABEL } from '@/lib/admin/labels';
import type { TaskPriority } from '@/lib/admin/types';
import { GeoCapture } from './GeoCapture';

const INPUT = 'w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent';
const LABEL = 'block text-xs font-medium text-text mb-1';

interface Props {
  taskId?: string;
  reportId?: string;
}

/** Signaler un problème terrain (répétable) — remonte aussitôt côté admin. */
export function IncidentForm({ taskId, reportId }: Props) {
  const [state, action, pending] = useActionState(raiseIncidentAction, null);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state?.ok) ref.current?.reset(); }, [state]);

  return (
    <form ref={ref} action={action} className="space-y-3 rounded-2xl border border-red-200 bg-red-50/40 p-4">
      {taskId && <input type="hidden" name="taskId" value={taskId} />}
      {reportId && <input type="hidden" name="reportId" value={reportId} />}
      <p className="flex items-center gap-1.5 text-sm font-semibold text-red-700">
        <TriangleAlert size={15} /> Signaler un problème
      </p>

      <div>
        <label className={LABEL} htmlFor="i-desc">Description</label>
        <textarea id="i-desc" name="description" rows={2} required placeholder="Ce qui ne va pas…" className={INPUT} />
      </div>

      <div className="grid sm:grid-cols-2 gap-2">
        <div>
          <label className={LABEL} htmlFor="i-loc">Lieu</label>
          <input id="i-loc" name="location" placeholder="Ex. magasin de chantier" className={INPUT} />
        </div>
        <div>
          <label className={LABEL} htmlFor="i-prio">Priorité</label>
          <select id="i-prio" name="priority" defaultValue="medium" className={INPUT}>
            {(Object.keys(TASK_PRIORITY_LABEL) as TaskPriority[]).map(p => (
              <option key={p} value={p}>{TASK_PRIORITY_LABEL[p]}</option>
            ))}
          </select>
        </div>
      </div>

      <GeoCapture />

      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
      {state?.ok && <p className="text-xs text-emerald-700">Problème signalé — l’équipe a été alertée.</p>}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-1.5 text-xs font-semibold bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-60"
      >
        <Send size={13} /> {pending ? 'Envoi…' : 'Envoyer le signalement'}
      </button>
    </form>
  );
}
