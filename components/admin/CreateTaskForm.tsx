'use client';

import { useActionState, useEffect, useRef } from 'react';
import { ClipboardPlus } from 'lucide-react';
import { createTask } from '@/app/(admin)/admin/actions';
import { TASK_PRIORITY_LABEL } from '@/lib/admin/labels';
import type { TaskPriority } from '@/lib/admin/types';

const INPUT = 'w-full border border-stone-200 rounded-xl px-3 py-2 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent';
const LABEL = 'block text-xs font-medium text-text mb-1';

interface Props {
  project: { id: string; name: string; landRef: string };
  employees: { id: string; name: string; role: string }[];
}

export function CreateTaskForm({ project, employees }: Props) {
  const [state, action, pending] = useActionState(createTask, null);
  const formRef = useRef<HTMLFormElement>(null);

  // Reset the form (incl. the advance toggle) on success — no React state needed.
  useEffect(() => { if (state?.ok) formRef.current?.reset(); }, [state]);

  return (
    <form ref={formRef} action={action} className="space-y-3">
      <input type="hidden" name="projectId" value={project.id} />
      <input type="hidden" name="projectName" value={project.name} />
      <input type="hidden" name="landRef" value={project.landRef} />

      {/* Terrain concerné — même identifiant que chez le propriétaire (anti-confusion) */}
      <div className="flex items-center justify-between gap-3 rounded-xl bg-paper-2/50 border border-line px-3 py-2.5">
        <span className="text-xs text-muted">Chantier du propriétaire</span>
        <span className="text-sm font-semibold text-text">
          {project.name} · <span className="font-mono text-accent">{project.landRef}</span>
        </span>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className={LABEL} htmlFor="t-worker">Employé</label>
          <select id="t-worker" name="assignedTo" required className={INPUT}>
            {employees.map(e => <option key={e.id} value={e.id}>{e.name} — {e.role}</option>)}
          </select>
        </div>
        <div>
          <label className={LABEL} htmlFor="t-priority">Priorité</label>
          <select id="t-priority" name="priority" defaultValue="medium" className={INPUT}>
            {(Object.keys(TASK_PRIORITY_LABEL) as TaskPriority[]).map(p => (
              <option key={p} value={p}>{TASK_PRIORITY_LABEL[p]}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={LABEL} htmlFor="t-title">Titre de la tâche</label>
        <input id="t-title" name="title" required placeholder="Achat ciment — phase murs" className={INPUT} />
      </div>

      <div>
        <label className={LABEL} htmlFor="t-desc">Description</label>
        <textarea id="t-desc" name="description" rows={2} placeholder="Détail de ce qui est attendu…" className={INPUT} />
      </div>

      <div>
        <label className={LABEL} htmlFor="t-due">Délai (échéance)</label>
        <input id="t-due" name="dueDate" type="date" className={INPUT} />
      </div>

      {/* Avance d'argent optionnelle — bascule CSS (peer), pas d'état React */}
      <div>
        <input id="t-use-advance" type="checkbox" name="useAdvance" className="peer align-middle accent-accent mr-2" />
        <label htmlFor="t-use-advance" className="text-sm text-text cursor-pointer select-none align-middle">
          Joindre une avance d’argent
        </label>

        <div className="hidden peer-checked:grid sm:grid-cols-2 gap-3 rounded-xl bg-paper-2/50 border border-line p-3 mt-3">
          <div>
            <label className={LABEL} htmlFor="t-amount">Montant donné (FCFA)</label>
            <input id="t-amount" name="advanceAmount" type="number" min={1} placeholder="200000" className={INPUT} />
          </div>
          <div>
            <label className={LABEL} htmlFor="t-purpose">Motif</label>
            <input id="t-purpose" name="advancePurpose" placeholder="Achat ciment, transport…" className={INPUT} />
          </div>
          <p className="sm:col-span-2 text-[11px] text-muted">
            Règle anti-fuite : impossible si l’employé a déjà une avance non réconciliée. Privilégier le paiement direct du fournisseur sur facture.
          </p>
        </div>
      </div>

      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
      {state?.ok && <p className="text-xs text-emerald-700">Tâche assignée — visible dans le compte de l’employé.</p>}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 text-sm font-semibold bg-accent text-white px-4 py-2.5 rounded-xl hover:bg-accent-bright transition-colors cursor-pointer disabled:opacity-60"
      >
        <ClipboardPlus size={15} />
        {pending ? 'Assignation…' : 'Assigner la tâche'}
      </button>
    </form>
  );
}
