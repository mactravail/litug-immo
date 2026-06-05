import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type Variant = 'default' | 'blue' | 'violet' | 'orange' | 'yellow' | 'success' | 'emerald' | 'sky';

const VARIANTS: Record<Variant, { cardBg: string }> = {
  default:  { cardBg: 'bg-stone-700'   },
  blue:     { cardBg: 'bg-blue-600'    },
  violet:   { cardBg: 'bg-violet-600'  },
  orange:   { cardBg: 'bg-orange-500'  },
  yellow:   { cardBg: 'bg-amber-500'   },
  success:  { cardBg: 'bg-emerald-700' },
  emerald:  { cardBg: 'bg-emerald-500' },
  sky:      { cardBg: 'bg-sky-500'     },
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
    <div className={cn('rounded-2xl p-5 flex flex-col gap-3 shadow-sm', v.cardBg, className)}>
      <div className="flex items-start justify-between">
        <p className="text-sm text-white/70 font-medium">{label}</p>
        <span className="p-2 rounded-xl bg-white/20 text-white">
          <Icon size={16} />
        </span>
      </div>
      <div>
        <p className="text-3xl font-bold tracking-tight text-white">{value}</p>
        {sub && <p className="text-xs text-white/60 mt-1">{sub}</p>}
      </div>
    </div>
  );
}
