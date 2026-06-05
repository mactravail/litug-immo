import type { DocumentType } from '@/lib/data/types';
import { cn } from '@/lib/utils';

const CONFIG: Record<DocumentType, { label: string; dot: string; bg: string; text: string }> = {
  tf: { label: 'Titre Foncier', dot: '🟢', bg: 'bg-emerald-50', text: 'text-emerald-800' },
  bail: { label: 'Bail', dot: '🟡', bg: 'bg-amber-50', text: 'text-amber-800' },
  deliberation: { label: 'Délibération', dot: '🔴', bg: 'bg-red-50', text: 'text-red-800' },
};

interface Props {
  type: DocumentType;
  className?: string;
}

export function DocumentTypeBadge({ type, className }: Props) {
  const c = CONFIG[type];
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium', c.bg, c.text, className)}>
      <span aria-hidden="true">{c.dot}</span>
      {c.label}
    </span>
  );
}
