'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Inbox, Receipt, HardHat, Users, ClipboardCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/admin',            label: 'Accueil',    icon: LayoutDashboard },
  { href: '/admin/demandes',   label: 'Demandes',   icon: Inbox },
  { href: '/admin/factures',   label: 'Factures',   icon: Receipt },
  { href: '/admin/mustaf',     label: 'Mustaf',     icon: HardHat },
  { href: '/admin/employes',   label: 'Employés',   icon: Users },
  { href: '/admin/redditions', label: 'Redditions', icon: ClipboardCheck },
];

export function AdminMobileNav({ pendingCount = 0 }: { pendingCount?: number }) {
  const pathname = usePathname();

  return (
    <nav className="a-mobnav lg:hidden fixed bottom-0 inset-x-0 z-50">
      <div className="flex">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
          const badge = href === '/admin/demandes' && pendingCount > 0;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-medium transition-colors',
                active && 'a-active',
              )}
            >
              <span className="relative">
                <Icon size={20} />
                {badge && (
                  <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 inline-flex items-center justify-center rounded-full bg-accent text-white text-[9px] font-bold">
                    {pendingCount > 9 ? '9+' : pendingCount}
                  </span>
                )}
              </span>
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
