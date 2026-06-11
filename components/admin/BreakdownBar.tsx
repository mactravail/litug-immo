import { cn } from '@/lib/utils';

export interface Segment {
  label: string;
  value: number;
  /** Tailwind bg-* class for the segment + its legend dot. */
  colorClass: string;
}

interface Props {
  segments: Segment[];
  format?: (n: number) => string;
  className?: string;
}

/** Segmented proportion bar + legend — pure CSS. Used for revenue mix / tier mix. */
export function BreakdownBar({ segments, format, className }: Props) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const shown = segments.filter(s => s.value > 0);

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex h-3 w-full rounded-full overflow-hidden bg-stone-100">
        {shown.map((s, i) => (
          <div
            key={i}
            className={s.colorClass}
            style={{ width: `${(s.value / total) * 100}%` }}
            title={`${s.label} — ${format ? format(s.value) : s.value}`}
          />
        ))}
      </div>
      <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5">
        {segments.map((s, i) => (
          <li key={i} className="flex items-center justify-between gap-2 text-sm">
            <span className="flex items-center gap-2 min-w-0">
              <span className={cn('w-2.5 h-2.5 rounded-full shrink-0', s.colorClass)} />
              <span className="text-muted truncate">{s.label}</span>
            </span>
            <span className="text-text font-medium tabular-nums shrink-0">
              {format ? format(s.value) : s.value}
              <span className="text-muted font-normal"> · {Math.round((s.value / total) * 100)}%</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
