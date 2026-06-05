import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

interface Props {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; href: string };
}

export function EmptyState({ icon: Icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-6">
      <div className="p-4 rounded-2xl bg-stone-50 text-muted mb-4">
        <Icon size={32} />
      </div>
      <h3 className="font-serif text-xl font-semibold text-text mb-2">{title}</h3>
      <p className="text-muted text-sm max-w-xs">{description}</p>
      {action && (
        <Link
          href={action.href}
          className="mt-6 inline-flex items-center gap-2 bg-accent text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-accent/90 transition-colors"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
