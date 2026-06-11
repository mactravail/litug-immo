'use client';

import { useActionState } from 'react';
import { Play, Square } from 'lucide-react';
import { startTaskAction, endTaskAction } from '@/app/(employe)/equipe/actions';
import { formatTime, formatDateShort } from '@/lib/utils';

interface Props {
  taskId: string;
  active: boolean;          // un pointage est en cours
  activeStartedAt?: string;
}

/** Pointage début / fin d'une tâche (work_sessions). */
export function TaskClock({ taskId, active, activeStartedAt }: Props) {
  const [startState, startAction, startPending] = useActionState(startTaskAction, null);
  const [endState, endAction, endPending] = useActionState(endTaskAction, null);

  if (!active) {
    return (
      <form action={startAction}>
        <input type="hidden" name="taskId" value={taskId} />
        <button
          type="submit"
          disabled={startPending}
          className="inline-flex items-center justify-center gap-2 w-full sm:w-auto text-sm font-semibold bg-accent text-white px-5 py-3 rounded-xl hover:bg-accent-bright transition-colors cursor-pointer disabled:opacity-60"
        >
          <Play size={16} /> {startPending ? 'Démarrage…' : 'Démarrer'}
        </button>
        {startState?.error && <p className="text-xs text-red-600 mt-2">{startState.error}</p>}
      </form>
    );
  }

  return (
    <form action={endAction} className="space-y-2">
      <input type="hidden" name="taskId" value={taskId} />
      {activeStartedAt && (
        <p className="text-xs text-emerald-700 font-medium">
          ● En cours depuis le {formatDateShort(activeStartedAt)} à {formatTime(activeStartedAt)}
        </p>
      )}
      <textarea
        name="summary"
        rows={2}
        placeholder="Ce que tu as fait (optionnel)…"
        className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
      />
      <button
        type="submit"
        disabled={endPending}
        className="inline-flex items-center justify-center gap-2 w-full sm:w-auto text-sm font-semibold bg-ink text-on-ink px-5 py-3 rounded-xl hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-60"
      >
        <Square size={15} /> {endPending ? 'Clôture…' : 'Terminer'}
      </button>
      {endState?.error && <p className="text-xs text-red-600 mt-1">{endState.error}</p>}
    </form>
  );
}
