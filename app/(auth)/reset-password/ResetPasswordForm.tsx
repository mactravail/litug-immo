'use client';

import { useActionState } from 'react';
import { resetPassword } from './actions';

export function ResetPasswordForm() {
  const [state, action, isPending] = useActionState(resetPassword, null);

  return (
    <form action={action} className="space-y-4">
      {state?.error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {state.error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-text mb-1.5" htmlFor="password">
          Nouveau mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          placeholder="••••••••"
          className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text mb-1.5" htmlFor="confirm">
          Confirmer le mot de passe
        </label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          required
          minLength={6}
          placeholder="••••••••"
          className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="block w-full text-center text-sm font-semibold bg-accent text-white px-4 py-3 rounded-xl hover:bg-accent/90 transition-colors mt-2 cursor-pointer disabled:opacity-60"
      >
        {isPending ? 'Enregistrement…' : 'Enregistrer le nouveau mot de passe'}
      </button>
    </form>
  );
}
