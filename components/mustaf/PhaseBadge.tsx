import { cn } from '@/lib/utils';
import { PHASE_STATUS_LABEL, PHASE_STATUS_STYLE } from '@/lib/mustaf/labels';
import type { PhaseStatus } from '@/lib/mustaf/types';

export function PhaseBadge({ status, className }: { status: PhaseStatus; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-full border',
        PHASE_STATUS_STYLE[status],
        className,
      )}
    >
      {PHASE_STATUS_LABEL[status]}
    </span>
  );
}
