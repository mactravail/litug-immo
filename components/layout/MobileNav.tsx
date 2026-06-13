'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Map, Users, Settings, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/dashboard',  label: 'Accueil',  icon: LayoutDashboard },
  { href: '/terrains',   label: 'Terrains', icon: Map },
  { href: '/clients',    label: 'Clients',  icon: Users },
  { href: '/visites',    label: 'Visites',  icon: CalendarDays },
  { href: '/parametres', label: 'Réglages', icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="s-mobnav lg:hidden fixed bottom-0 inset-x-0 z-50">
      <div className="flex">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-medium transition-colors',
                active && 's-active'
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
