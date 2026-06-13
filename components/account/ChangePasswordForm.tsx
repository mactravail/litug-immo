'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { KeyRound, Eye, EyeOff } from 'lucide-react';
import { changePassword } from '@/lib/auth/password-action';

const INPUT = 'w-full border border-stone-200 rounded-xl px-3 py-2 pr-10 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent';
const LABEL = 'block text-xs font-medium text-text mb-1';

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState(changePassword, null);
  const [show, setShow] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => { if (state?.ok) formRef.current?.reset(); }, [state]);

  const type = show ? 'text' : 'password';

  return (
    <form ref={formRef} action={action} className="space-y-4 max-w-sm">
      <div>
        <label className={LABEL} htmlFor="pwd-current">Mot de passe actuel</label>
        <div className="relative">
          <input id="pwd-current" name="current" type={type} required autoComplete="current-password" className={INPUT} />
        </div>
      </div>

      <div>
        <label className={LABEL} htmlFor="pwd-new">Nouveau mot de passe</label>
        <div className="relative">
          <input id="pwd-new" name="password" type={type} required minLength={8} autoComplete="new-password" placeholder="8 caractères : Maj, min, chiffre, spécial" className={INPUT} />
          <button
            type="button"
            onClick={() => setShow(s => !s)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-text cursor-pointer"
            aria-label={show ? 'Masquer les mots de passe' : 'Afficher les mots de passe'}
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <p className="text-xs text-muted mt-1">8 caractères minimum, avec majuscule, minuscule, chiffre et caractère spécial.</p>
      </div>

      <div>
        <label className={LABEL} htmlFor="pwd-confirm">Confirmer le nouveau mot de passe</label>
        <div className="relative">
          <input id="pwd-confirm" name="confirm" type={type} required minLength={8} autoComplete="new-password" className={INPUT} />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 text-sm font-semibold bg-accent text-white px-4 py-2.5 rounded-xl hover:bg-accent-bright transition-colors cursor-pointer disabled:opacity-60"
        >
          <KeyRound size={15} />
          {pending ? 'Modification…' : 'Changer le mot de passe'}
        </button>
        {state?.error && <span className="text-xs text-red-600">{state.error}</span>}
        {state?.ok && <span className="text-xs text-emerald-700">Mot de passe mis à jour.</span>}
      </div>
    </form>
  );
}
