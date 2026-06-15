'use client';

import { useActionState, useEffect, useRef } from 'react';
import { Clock, CheckCircle2 } from 'lucide-react';
import { logWorkDayAction } from '@/app/(employe)/equipe/actions';

const INPUT = 'w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent';
const LABEL = 'block text-xs font-medium text-text mb-1';

export function WorkDayForm({ today }: { today: string }) {
  const [state, action, pending] = useActionState(logWorkDayAction, null);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => { if (state?.ok) ref.current?.reset(); }, [state]);

  return (
    <form ref={ref} action={action} className="space-y-4 bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={LABEL} htmlFor="workDate">Jour travaillé</label>
          <input id="workDate" name="workDate" type="date" required defaultValue={today} max={today} className={INPUT} />
        </div>
        <div>
          <label className={LABEL} htmlFor="hours">Heures faites</label>
          <input id="hours" name="hours" type="number" required min="0.5" max="24" step="0.5" placeholder="ex. 6" className={INPUT} />
        </div>
      </div>

      <div>
        <label className={LABEL} htmlFor="note">Ce que tu as fait (optionnel)</label>
        <input id="note" name="note" type="text" placeholder="ex. Démarchage Facebook, 5 prospects" className={INPUT} />
      </div>

      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
      {state?.ok && (
        <p className="flex items-center gap-1.5 text-xs text-emerald-700">
          <CheckCircle2 size={14} /> Journée enregistrée.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 text-sm font-semibold bg-accent text-white px-4 py-2.5 rounded-xl hover:bg-accent-bright transition-colors cursor-pointer disabled:opacity-60"
      >
        <Clock size={15} /> {pending ? 'Enregistrement…' : 'Enregistrer ma journée'}
      </button>
    </form>
  );
}
