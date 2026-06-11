'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, HardHat, Users, ClipboardCheck, Construction } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/admin',            label: 'Accueil',    icon: LayoutDashboard },
  { href: '/admin/mustaf',     label: 'Mustaf',     icon: HardHat },
  { href: '/admin/employes',   label: 'Employés',   icon: Users },
  { href: '/admin/redditions', label: 'Redditions', icon: ClipboardCheck },
  { href: '/admin/problemes',  label: 'Problèmes',  icon: Construction },
];

export function AdminMobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-stone-100 z-50">
      <div className="flex">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-medium transition-colors',
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
