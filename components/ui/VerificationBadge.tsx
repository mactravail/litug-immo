import type { VerificationStatus } from '@/lib/data/types';
import { cn } from '@/lib/utils';
import { ShieldCheck, Clock, ShieldOff } from 'lucide-react';

const CONFIG: Record<VerificationStatus, { label: string; Icon: typeof ShieldCheck; bg: string; text: string; border: string }> = {
  verifie: { label: 'Vérifié', Icon: ShieldCheck, bg: 'bg-accent-light', text: 'text-accent', border: 'border-accent/20' },
  a_verifier: { label: 'À vérifier', Icon: Clock, bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  non_verifie: { label: 'Non vérifié', Icon: ShieldOff, bg: 'bg-stone-100', text: 'text-muted', border: 'border-stone-200' },
};

interface Props {
  status: VerificationStatus;
  className?: string;
  notaire?: string;
  date?: string;
}

export function VerificationBadge({ status, className, notaire, date }: Props) {
  const c = CONFIG[status];
  const Icon = c.Icon;

  if (status === 'verifie' && notaire && date) {
    const d = new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    return (
      <span
        className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border', c.bg, c.text, c.border, className)}
        title={`Vérifié par ${notaire} le ${d}`}
      >
        <Icon size={12} />
        Vérifié · {d}
      </span>
    );
  }

  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border', c.bg, c.text, c.border, className)}>
      <Icon size={12} />
      {c.label}
    </span>
  );
}
