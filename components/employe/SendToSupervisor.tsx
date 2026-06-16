'use client';

import { useActionState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';
import { sendProspectsAction } from '@/app/(employe)/equipe/actions';

export function SendToSupervisor({ draftCount }: { draftCount: number }) {
  const [state, action, pending] = useActionState(sendProspectsAction, null);

  if (draftCount === 0) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-stone-100 bg-white px-4 py-3 text-sm text-muted">
        <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
        {state?.ok
          ? 'Prospections envoyées au superviseur. Le superviseur les voit maintenant.'
          : 'Tout est envoyé — aucune prospection en attente.'}
      </div>
    );
  }

  const plural = draftCount > 1;

  return (
    <form action={action} className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl border border-accent/20 bg-accent-light/40 px-4 py-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text">
          {draftCount} {plural ? 'prospections non envoyées' : 'prospection non envoyée'}
        </p>
        <p className="text-[11px] text-muted">Le superviseur ne les verra qu&apos;une fois envoyées.</p>
        {state?.error && <p className="text-[11px] text-red-600 mt-0.5">{state.error}</p>}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center gap-2 text-sm font-semibold bg-accent text-white px-4 py-2.5 rounded-xl hover:bg-accent-bright transition-colors cursor-pointer disabled:opacity-60 shrink-0"
      >
        <Send size={15} /> {pending ? 'Envoi...' : 'Envoyer au superviseur'}
      </button>
    </form>
  );
}
