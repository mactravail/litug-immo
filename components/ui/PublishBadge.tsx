import { Globe, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  published?: boolean;
  className?: string;
}

export function PublishBadge({ published, className }: Props) {
  if (published) {
    return (
      <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-accent-light text-accent', className)}>
        <Globe size={11} />
        Publié
      </span>
    );
  }
  return (
    <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700', className)}>
      <EyeOff size={11} />
      Brouillon
    </span>
  );
}
