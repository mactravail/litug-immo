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
    <div className="flex items-start justify-between mb-8">
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1 text-xs text-muted mb-2">
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
        <h1 className="font-serif text-3xl font-semibold text-text">{title}</h1>
      </div>
      {action && <div className="ml-4 shrink-0">{action}</div>}
    </div>
  );
}
