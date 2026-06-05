'use client';

import { useTransition } from 'react';
import type { VisitStatus } from '@/lib/data/types';
import { updateVisitStatus } from '@/app/actions';
import { CheckCheck, XCircle, ThumbsUp } from 'lucide-react';

interface Props {
  visitId: string;
  status: VisitStatus;
}

export function VisitActions({ visitId, status }: Props) {
  const [pending, startTransition] = useTransition();

  function update(s: VisitStatus) {
    startTransition(() => updateVisitStatus(visitId, s));
  }

  if (status === 'annulee' || status === 'effectuee') return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {status === 'planifiee' && (
        <button
          onClick={() => update('confirmee')}
          disabled={pending}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent bg-accent-light px-3 py-1.5 rounded-lg hover:bg-accent/10 transition-colors disabled:opacity-50"
        >
          <ThumbsUp size={12} />
          Confirmer
        </button>
      )}
      <button
        onClick={() => update('effectuee')}
        disabled={pending}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-50"
      >
        <CheckCheck size={12} />
        Effectuée
      </button>
      <button
        onClick={() => update('annulee')}
        disabled={pending}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
      >
        <XCircle size={12} />
        Annuler
      </button>
    </div>
  );
}
