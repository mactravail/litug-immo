'use client';

import { useState } from 'react';
import { Flag, Check, TriangleAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * One-click anomaly flag (mustaf.md §6) — present on any expense, phase or photo.
 * Mock-first: clicking confirms the alert was sent to head office (no persistence yet).
 *
 * `variant="topbar"` rend le bouton proéminent du thème sombre Mustaf
 * (classe `.m-btn-anom`) ; le variant par défaut reste le lien discret
 * réutilisé sur chaque ligne (dépense / photo / phase).
 */
export function AnomalyButton({
  label = 'Signaler une anomalie',
  className,
  variant = 'inline',
}: {
  label?: string;
  className?: string;
  variant?: 'inline' | 'topbar';
}) {
  const [flagged, setFlagged] = useState(false);

  if (variant === 'topbar') {
    if (flagged) {
      return (
        <span className={cn('m-pill m-ok inline-flex items-center gap-1.5', className)}>
          <Check size={13} />
          Transmis au siège
        </span>
      );
    }
    return (
      <button type="button" onClick={() => setFlagged(true)} className={cn('m-btn-anom', className)}>
        <TriangleAlert size={15} />
        <span className="hidden sm:inline">{label}</span>
        <span className="sm:hidden">Anomalie</span>
      </button>
    );
  }

  if (flagged) {
    return (
      <span className={cn('inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700', className)}>
        <Check size={13} />
        Signalement transmis au siège
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setFlagged(true)}
      className={cn(
        'inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted hover:text-red-600 transition-colors cursor-pointer',
        className,
      )}
    >
      <Flag size={13} />
      {label}
    </button>
  );
}
