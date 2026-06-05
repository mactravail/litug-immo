'use client';

import { useTransition } from 'react';
import type { SaleStatus } from '@/lib/data/types';
import { updateLandSaleStatus } from '@/app/actions';

const TRANSITIONS: Record<SaleStatus, { next: SaleStatus; label: string } | null> = {
  disponible: { next: 'en_cours_de_vente', label: 'Passer en cours de vente' },
  en_cours_de_vente: { next: 'vendu', label: 'Marquer comme vendu' },
  vendu: null,
};

interface Props {
  landId: string;
  currentStatus: SaleStatus;
}

export function SaleStatusActions({ landId, currentStatus }: Props) {
  const [pending, startTransition] = useTransition();
  const transition = TRANSITIONS[currentStatus];

  if (!transition) {
    return (
      <div className="bg-stone-50 rounded-2xl border border-stone-100 p-5">
        <p className="text-xs text-muted font-semibold uppercase tracking-wider mb-2">Statut de vente</p>
        <p className="text-sm text-muted">Ce terrain est marqué <strong>Vendu</strong>. Il reste visible pour éviter les ventes doubles.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
      <p className="text-xs text-muted font-semibold uppercase tracking-wider mb-3">Statut de vente</p>
      <button
        disabled={pending}
        onClick={() => startTransition(() => updateLandSaleStatus(landId, transition.next))}
        className="w-full text-sm font-semibold bg-text text-white px-4 py-2.5 rounded-xl hover:bg-text/80 transition-colors disabled:opacity-50"
      >
        {pending ? 'Mise à jour…' : transition.label}
      </button>
    </div>
  );
}
