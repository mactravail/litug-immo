'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { forgotPassword } from './actions';

export function ForgotPasswordForm() {
  const [state, action, isPending] = useActionState(forgotPassword, null);

  if (state?.success) {
    return (
      <div className="rounded-xl bg-accent/10 border border-accent/20 px-4 py-5 text-sm text-accent text-center space-y-1">
        <p className="font-semibold">Email envoyé !</p>
        <p className="text-muted text-xs">Vérifiez votre boîte mail et cliquez sur le lien pour réinitialiser votre mot de passe.</p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      {state?.error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {state.error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-text mb-1.5" htmlFor="email">
          Email de votre compte
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="vous@exemple.com"
          className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="block w-full text-center text-sm font-semibold bg-accent text-white px-4 py-3 rounded-xl hover:bg-accent/90 transition-colors mt-2 cursor-pointer disabled:opacity-60"
      >
        {isPending ? 'Envoi…' : 'Envoyer le lien de réinitialisation'}
      </button>

      <p className="text-center text-sm text-muted">
        <Link href="/login" className="text-accent font-medium hover:underline">
          ← Retour à la connexion
        </Link>
      </p>
    </form>
  );
}
