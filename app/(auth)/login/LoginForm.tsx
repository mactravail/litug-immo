'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { login } from './actions';

export function LoginForm() {
  const [state, action, isPending] = useActionState(login, null);
  const [email, setEmail] = useState('');

  return (
    <form action={action} className="space-y-4">
      {state?.error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {state.error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-text mb-1.5" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="vous@exemple.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-sm font-medium text-text" htmlFor="password">
            Mot de passe
          </label>
          <Link href="/forgot-password" className="text-xs text-accent hover:underline">
            Mot de passe oublié ?
          </Link>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="block w-full text-center text-sm font-semibold bg-accent text-white px-4 py-3 rounded-xl hover:bg-accent/90 transition-colors mt-2 cursor-pointer disabled:opacity-60"
      >
        {isPending ? 'Connexion…' : 'Se connecter'}
      </button>
    </form>
  );
}
