import { cn } from '@/lib/utils';

interface Point { label: string; value: number; }

interface Props {
  points: Point[];
  /** Formats the value shown on hover / under the tallest bars. */
  format?: (n: number) => string;
  /** Bar fill class (Sahel). Defaults to the trust accent. */
  barClassName?: string;
  className?: string;
}

/** Lightweight monthly bar chart — pure CSS, no charting dependency. */
export function MiniBarChart({ points, format, barClassName = 'bg-accent', className }: Props) {
  const max = Math.max(1, ...points.map(p => p.value));

  return (
    <div className={cn('flex items-end gap-2 sm:gap-3 h-40', className)}>
      {points.map((p, i) => {
        const h = Math.round((p.value / max) * 100);
        return (
          <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1.5 min-w-0">
            <span className="text-[10px] font-semibold text-text tabular-nums truncate w-full text-center">
              {p.value > 0 ? (format ? format(p.value) : p.value) : ''}
            </span>
            <div
              className={cn('w-full rounded-t-md transition-all', barClassName)}
              style={{ height: `${Math.max(h, p.value > 0 ? 4 : 0)}%` }}
              title={`${p.label} — ${format ? format(p.value) : p.value}`}
            />
            <span className="text-[10px] text-muted truncate w-full text-center">{p.label}</span>
          </div>
        );
      })}
    </div>
  );
}
