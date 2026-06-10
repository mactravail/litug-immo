import { cn, formatFcfa } from '@/lib/utils';

interface Props {
  current: number;
  target: number;
  /** Optional phase name shown in the "il manque X" line. */
  phaseLabel?: string;
  className?: string;
}

/**
 * Progress toward fully funding a phase (mustaf.md §6 — funding gate).
 * Surfaces "il manque X FCFA pour démarrer la phase …" until covered.
 */
export function FundingBar({ current, target, phaseLabel, className }: Props) {
  const pct = target > 0 ? Math.min(100, (current / target) * 100) : 100;
  const funded = current >= target;
  const shortfall = Math.max(0, target - current);

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted">
          {formatFcfa(current)} <span className="text-muted/70">/ {formatFcfa(target)}</span>
        </span>
        <span className={cn('font-semibold', funded ? 'text-emerald-600' : 'text-accent')}>
          {Math.round(pct)}%
        </span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-stone-100 overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', funded ? 'bg-emerald-500' : 'bg-accent')}
          style={{ width: `${pct}%` }}
        />
      </div>
      {funded ? (
        <p className="text-xs font-medium text-emerald-700">
          Phase entièrement financée — elle peut démarrer.
        </p>
      ) : (
        <p className="text-xs text-muted">
          Il manque <span className="font-semibold text-text">{formatFcfa(shortfall)}</span>
          {phaseLabel ? <> pour démarrer la phase <span className="font-medium">{phaseLabel}</span>.</> : '.'}
        </p>
      )}
    </div>
  );
}
