'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Wallet, ReceiptText, Camera, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/projet',               label: 'Projet',     icon: Home },
  { href: '/projet/epargne',       label: 'Épargne',    icon: Wallet },
  { href: '/projet/depenses',      label: 'Dépenses',   icon: ReceiptText },
  { href: '/projet/chantier',      label: 'Chantier',   icon: Camera },
  { href: '/projet/contributions', label: 'Famille',    icon: Users },
];

export function MustafMobileNav() {
  const pathname = usePathname();

  return (
    <nav className="m-mobnav lg:hidden fixed bottom-0 inset-x-0 z-50">
      <div className="flex">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === '/projet' ? pathname === '/projet' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-medium transition-colors',
                active && 'm-active',
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
