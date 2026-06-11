import { cn } from '@/lib/utils';
import { SUBSCRIPTION_STATUS_LABEL, SUBSCRIPTION_STATUS_STYLE } from '@/lib/admin/labels';
import type { SubscriptionStatus } from '@/lib/admin/types';

export function SubscriptionBadge({ status, className }: { status: SubscriptionStatus; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-full border',
        SUBSCRIPTION_STATUS_STYLE[status],
        className,
      )}
    >
      {SUBSCRIPTION_STATUS_LABEL[status]}
    </span>
  );
}
