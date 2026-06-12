'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { login } from './actions';

export function LoginForm() {
  const [state, action, isPending] = useActionState(login, null);
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            placeholder="••••••••"
            className="w-full border border-stone-200 rounded-xl px-4 py-2.5 pr-11 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            aria-pressed={showPassword}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-muted hover:text-text transition-colors cursor-pointer"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
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
