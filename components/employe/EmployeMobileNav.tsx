'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ListTodo, ClipboardCheck, Wrench, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/equipe',             label: 'Tâches',     icon: ListTodo },
  { href: '/equipe/portefeuille', label: 'Argent',    icon: Wallet },
  { href: '/equipe/redditions',  label: 'Redditions', icon: ClipboardCheck },
  { href: '/equipe/action',      label: 'Métier',     icon: Wrench },
];

export function EmployeMobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-stone-100 z-50">
      <div className="flex">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === '/equipe' ? pathname === '/equipe' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex-1 flex flex-col items-center gap-1 py-3 text-[11px] font-medium transition-colors',
                active ? 'text-accent' : 'text-muted',
              )}
            >
              <Icon size={20} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
