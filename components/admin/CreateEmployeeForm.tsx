'use client';

import { useActionState, useState } from 'react';
import { UserPlus, CheckCircle2, Copy, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { createEmployee } from '@/lib/admin/invite-employee';
import { TEAM_ROLE_LABEL } from '@/lib/admin/labels';
import type { TeamRole } from '@/lib/admin/types';

const INPUT =
  'w-full border border-stone-200 rounded-xl px-3 py-2 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent';
const LABEL = 'block text-xs font-medium text-text mb-1';

/** Rôles terrain attribuables dans le menu (jamais `admin`). Le prospecteur se crée
 *  depuis sa propre page (/admin/prospection) via le rôle verrouillé `lockedRole`. */
const FIELD_ROLES = ['site_agent', 'procurement', 'inspector', 'controller'] as const;

/**
 * Mot de passe provisoire lisible (évite 0/O, 1/l) — l'admin le dicte à l'employé.
 * Respecte la politique : 8+ caractères, majuscule, minuscule, chiffre, caractère spécial.
 */
function generatePassword(): string {
  const upper = 'ABCDEFGHJKMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnpqrstuvwxyz';
  const digits = '23456789';
  const special = '!@#$%&*';
  const all = upper + lower + digits + special;

  const arr = new Uint32Array(10);
  crypto.getRandomValues(arr);

  const chars = [
    upper[arr[0] % upper.length],
    lower[arr[1] % lower.length],
    digits[arr[2] % digits.length],
    special[arr[3] % special.length],
    ...Array.from(arr.slice(4), n => all[n % all.length]),
  ];

  // Mélange pour ne pas avoir un ordre prévisible (Maj, min, chiffre, spécial, ...).
  for (let i = chars.length - 1; i > 0; i--) {
    const j = arr[i % arr.length] % (i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join('');
}

/**
 * Formulaire de création d'accès staff.
 * - sans `lockedRole` : employé terrain (menu déroulant des rôles chantier).
 * - avec `lockedRole` (ex. `prospector`) : le rôle est imposé, le menu disparaît.
 */
export function CreateEmployeeForm({ lockedRole }: { lockedRole?: TeamRole } = {}) {
  const [state, action, pending] = useActionState(createEmployee, null);
  const [pwd, setPwd] = useState(generatePassword);
  const [copied, setCopied] = useState(false);
  // Mot de passe provisoire visible par défaut (l'admin doit le lire pour le dicter) ;
  // l'œil permet de le masquer si quelqu'un regarde par-dessus l'épaule.
  const [showPwd, setShowPwd] = useState(true);

  if (state?.ok) {
    const block = `Espace Litug\nEmail : ${state.email}\nMot de passe provisoire : ${state.password}\nÀ changer à la première connexion.`;
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-2.5 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800">
          <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
          <span>Compte créé. Communiquez ces identifiants à l’employé — ils ne seront plus affichés.</span>
        </div>

        <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm">
          <p className="text-text"><span className="text-muted">Email :</span> <strong>{state.email}</strong></p>
          <p className="text-text mt-1"><span className="text-muted">Mot de passe provisoire :</span> <strong className="font-mono">{state.password}</strong></p>
          <button
            type="button"
            onClick={() => { navigator.clipboard?.writeText(block); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:underline cursor-pointer"
          >
            <Copy size={13} /> {copied ? 'Copié !' : 'Copier les identifiants'}
          </button>
        </div>

        <p className="text-[11px] text-muted">
          L’employé se connecte sur la page de connexion avec ces identifiants ; il devra choisir
          son propre mot de passe avant d’accéder à son espace.
        </p>

        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 text-sm font-semibold border border-stone-200 text-text px-4 py-2.5 rounded-xl hover:bg-stone-50 transition-colors cursor-pointer"
        >
          <UserPlus size={15} /> Créer un autre accès
        </button>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className={LABEL} htmlFor="full_name">Nom complet</label>
        <input id="full_name" name="full_name" type="text" required placeholder="ex. Séga Diop" className={INPUT} />
      </div>

      <div>
        <label className={LABEL} htmlFor="email">Email (identifiant de connexion)</label>
        <input id="email" name="email" type="email" required placeholder="employe@exemple.com" autoComplete="off" className={INPUT} />
      </div>

      <div>
        <label className={LABEL} htmlFor="phone">Téléphone</label>
        <input id="phone" name="phone" type="tel" placeholder="+221 77 000 00 00" className={INPUT} />
      </div>

      {lockedRole ? (
        <div>
          <span className={LABEL}>Rôle</span>
          <input type="hidden" name="role" value={lockedRole} />
          <p className="border border-stone-200 rounded-xl px-3 py-2 text-sm text-text bg-stone-50">
            {TEAM_ROLE_LABEL[lockedRole]}
          </p>
        </div>
      ) : (
        <div>
          <label className={LABEL} htmlFor="role">Rôle terrain</label>
          <select id="role" name="role" required defaultValue="" className={INPUT}>
            <option value="" disabled>Choisir un rôle…</option>
            {FIELD_ROLES.map(r => (
              <option key={r} value={r}>{TEAM_ROLE_LABEL[r]}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className={LABEL} htmlFor="password">Mot de passe provisoire</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              id="password"
              name="password"
              type={showPwd ? 'text' : 'password'}
              required
              minLength={8}
              value={pwd}
              onChange={e => setPwd(e.target.value)}
              suppressHydrationWarning
              className={`${INPUT} pr-10 font-mono`}
            />
            <button
              type="button"
              onClick={() => setShowPwd(s => !s)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-text cursor-pointer"
              aria-label={showPwd ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            >
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <button
            type="button"
            onClick={() => setPwd(generatePassword())}
            className="shrink-0 inline-flex items-center gap-1.5 text-xs font-medium border border-stone-200 text-text px-3 rounded-xl hover:bg-stone-50 transition-colors cursor-pointer"
          >
            <RefreshCw size={13} /> Générer
          </button>
        </div>
        <p className="text-[11px] text-muted mt-1">
          8 caractères minimum, avec au moins une <strong>majuscule</strong>, une minuscule, un <strong>chiffre</strong> et un <strong>caractère spécial</strong> (ex. ! ? # $ % * . , : ; / =).
        </p>
        <p className="text-[11px] text-muted mt-1">Vous le communiquez à l’employé. Il devra le changer à sa première connexion.</p>
      </div>

      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 text-sm font-semibold bg-accent text-white px-4 py-2.5 rounded-xl hover:bg-accent-bright transition-colors cursor-pointer disabled:opacity-60"
        >
          <UserPlus size={15} />
          {pending ? 'Création…' : 'Créer le compte'}
        </button>
        {state?.error && <span className="text-xs text-red-600">{state.error}</span>}
      </div>
    </form>
  );
}
