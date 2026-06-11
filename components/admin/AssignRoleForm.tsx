'use client';

import { useActionState, useEffect, useRef } from 'react';
import { UserPlus } from 'lucide-react';
import { assignRole } from '@/app/(admin)/admin/actions';
import { TEAM_ROLE_LABEL } from '@/lib/admin/labels';
import type { TeamRole } from '@/lib/admin/types';

const INPUT = 'w-full border border-stone-200 rounded-xl px-3 py-2 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent';
const LABEL = 'block text-xs font-medium text-text mb-1';

export function AssignRoleForm() {
  const [state, action, pending] = useActionState(assignRole, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => { if (state?.ok) formRef.current?.reset(); }, [state]);

  return (
    <form ref={formRef} action={action} className="grid sm:grid-cols-3 gap-3 items-end">
      <div>
        <label className={LABEL} htmlFor="role-name">Nom</label>
        <input id="role-name" name="displayName" required placeholder="Awa Diallo" className={INPUT} />
      </div>
      <div>
        <label className={LABEL} htmlFor="role-role">Rôle</label>
        <select id="role-role" name="role" required className={INPUT} defaultValue="inspector">
          {(Object.keys(TEAM_ROLE_LABEL) as TeamRole[]).map(r => (
            <option key={r} value={r}>{TEAM_ROLE_LABEL[r]}</option>
          ))}
        </select>
      </div>
      <div>
        <label className={LABEL} htmlFor="role-contact">Contact</label>
        <input id="role-contact" name="contact" placeholder="+221 77 …" className={INPUT} />
      </div>

      <div className="sm:col-span-3 flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 text-sm font-semibold bg-accent text-white px-4 py-2.5 rounded-xl hover:bg-accent-bright transition-colors cursor-pointer disabled:opacity-60"
        >
          <UserPlus size={15} />
          {pending ? 'Ajout…' : 'Ajouter au personnel'}
        </button>
        {state?.error && <span className="text-xs text-red-600">{state.error}</span>}
        {state?.ok && <span className="text-xs text-emerald-700">Membre ajouté.</span>}
      </div>
    </form>
  );
}
