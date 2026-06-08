import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface Crumb { label: string; href?: string }

interface Props {
  title: string;
  breadcrumbs?: Crumb[];
  action?: React.ReactNode;
}

export function PageHeader({ title, breadcrumbs, action }: Props) {
  return (
    <div className="flex flex-col gap-3 mb-8 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <div className="min-w-0">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center flex-wrap gap-1 text-xs text-muted mb-2">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <ChevronRight size={11} />}
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-text transition-colors">{crumb.label}</Link>
                ) : (
                  <span className="text-text">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-text break-words">{title}</h1>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
