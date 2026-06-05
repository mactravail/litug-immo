'use client';

import { useState, useTransition } from 'react';
import { updateSellerProfile } from '@/app/actions';
import type { Seller } from '@/lib/data/types';

interface Props {
  seller: Seller;
}

export function ProfileForm({ seller }: Props) {
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [values, setValues] = useState({
    businessName: seller.businessName,
    phone:        seller.phone,
    email:        seller.email,
  });

  const dirty =
    values.businessName !== seller.businessName ||
    values.phone        !== seller.phone        ||
    values.email        !== seller.email;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSaved(false);
    setValues(v => ({ ...v, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      await updateSellerProfile(values);
      setSaved(true);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5" htmlFor="businessName">
          Nom / Entreprise
        </label>
        <input
          id="businessName" name="businessName" type="text" required
          value={values.businessName}
          onChange={handleChange}
          className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-text bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5" htmlFor="email">
          Email
        </label>
        <input
          id="email" name="email" type="email" required
          value={values.email}
          onChange={handleChange}
          className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-text bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5" htmlFor="phone">
          Téléphone
        </label>
        <input
          id="phone" name="phone" type="tel" required
          value={values.phone}
          onChange={handleChange}
          className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-text bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
        />
      </div>

      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={!dirty || pending}
          className="text-sm font-semibold bg-accent text-white px-5 py-2.5 rounded-xl hover:bg-accent/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {pending ? 'Enregistrement…' : 'Enregistrer les modifications'}
        </button>
        {saved && !dirty && (
          <span className="text-sm text-accent font-medium">Modifications enregistrées ✓</span>
        )}
      </div>
    </form>
  );
}
