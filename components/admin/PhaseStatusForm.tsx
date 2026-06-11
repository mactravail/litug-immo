'use client';

import { useActionState } from 'react';
import { updatePhaseStatus } from '@/app/(admin)/admin/actions';
import { PHASE_STATUS_LABEL } from '@/lib/mustaf/labels';
import type { PhaseStatus } from '@/lib/mustaf/types';

// 'paid' is excluded on purpose: it is reached only via fund release (maker-checker).
const SELECTABLE: PhaseStatus[] = [
  'pending_funding', 'funded', 'in_progress', 'pre_pour_verified',
  'awaiting_inspection', 'inspected', 'awaiting_release', 'completed',
];

export function PhaseStatusForm({ projectId, phaseId, current }: { projectId: string; phaseId: string; current: PhaseStatus }) {
  const [state, action, pending] = useActionState(updatePhaseStatus, null);

  return (
    <form action={action} className="flex items-center gap-2">
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="phaseId" value={phaseId} />
      <select
        name="status"
        defaultValue={current}
        disabled={pending || current === 'paid'}
        className="border border-stone-200 rounded-lg px-2 py-1.5 text-xs text-text focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent disabled:opacity-60"
      >
        {SELECTABLE.map(s => <option key={s} value={s}>{PHASE_STATUS_LABEL[s]}</option>)}
      </select>
      <button
        type="submit"
        disabled={pending || current === 'paid'}
        className="text-xs font-semibold text-accent border border-accent/30 px-2.5 py-1.5 rounded-lg hover:bg-accent-light transition-colors cursor-pointer disabled:opacity-50"
      >
        {pending ? '…' : 'Appliquer'}
      </button>
      {state?.error && <span className="text-[11px] text-red-600">{state.error}</span>}
    </form>
  );
}
