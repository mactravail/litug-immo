'use client';

import { useState } from 'react';
import { Flag, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * One-click anomaly flag (mustaf.md §6) — present on any expense, phase or photo.
 * Mock-first: clicking confirms the alert was sent to head office (no persistence yet).
 */
export function AnomalyButton({ label = 'Signaler une anomalie', className }: { label?: string; className?: string }) {
  const [flagged, setFlagged] = useState(false);

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
