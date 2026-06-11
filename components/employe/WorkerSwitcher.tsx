'use client';

import { useActionState } from 'react';
import { Repeat } from 'lucide-react';
import { setWorker } from '@/app/(employe)/equipe/actions';

interface Props {
  workers: { id: string; name: string; role: string }[];
  currentId: string;
}

/**
 * Sélecteur de démo (mock-first) : bascule l'employé connecté via un cookie.
 * Disparaît dès que l'auth Supabase est branchée (auth.uid() prend le relais).
 */
export function WorkerSwitcher({ workers, currentId }: Props) {
  const [, action] = useActionState(setWorker, null);

  return (
    <form action={action} className="px-3">
      <label className="flex items-center gap-1.5 text-[10px] font-medium text-muted/70 uppercase tracking-wider mb-1">
        <Repeat size={11} /> Démo — changer d’employé
      </label>
      <select
        name="workerId"
        defaultValue={currentId}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="w-full border border-stone-200 rounded-lg px-2 py-1.5 text-xs text-text bg-paper-2/40 focus:outline-none focus:ring-2 focus:ring-accent/20"
      >
        {workers.map(w => (
          <option key={w.id} value={w.id}>{w.name} — {w.role}</option>
        ))}
      </select>
    </form>
  );
}
