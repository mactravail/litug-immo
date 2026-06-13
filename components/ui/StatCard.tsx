import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type Variant = 'default' | 'blue' | 'violet' | 'orange' | 'yellow' | 'success' | 'emerald' | 'sky';

// Palette Sahel sobre : carte claire + pastille d'icône teintée (vert/or/neutre/ambre).
// On garde les noms de variantes pour ne pas toucher aux pages appelantes.
const VARIANTS: Record<Variant, { chip: string }> = {
  default: { chip: 'bg-stone-100 text-stone-600' },
  blue:    { chip: 'bg-accent-light text-accent' },
  violet:  { chip: 'bg-stone-100 text-ink' },
  orange:  { chip: 'bg-gold-soft text-ink' },
  yellow:  { chip: 'bg-amber-50 text-amber-700' },
  success: { chip: 'bg-accent-light text-accent' },
  emerald: { chip: 'bg-accent-light text-accent' },
  sky:     { chip: 'bg-stone-100 text-stone-600' },
};

interface Props {
  label: string;
  value: string | number;
  icon: LucideIcon;
  variant?: Variant;
  sub?: string;
  className?: string;
}

export function StatCard({ label, value, icon: Icon, variant = 'default', sub, className }: Props) {
  const v = VARIANTS[variant];
  return (
    <div
      className={cn(
        'rounded-2xl p-5 flex flex-col gap-3 bg-surface border border-line shadow-sm min-w-0',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-muted font-medium min-w-0 break-words">{label}</p>
        <span className={cn('p-2 rounded-xl shrink-0', v.chip)}>
          <Icon size={16} />
        </span>
      </div>
      <div className="min-w-0">
        {/* Police réduite sur mobile + coupure autorisée : un grand montant
            FCFA (séparateur insécable U+202F) ne peut plus déborder la carte. */}
        <p className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-text break-words">{value}</p>
        {sub && <p className="text-xs text-muted mt-1 break-words">{sub}</p>}
      </div>
    </div>
  );
}
