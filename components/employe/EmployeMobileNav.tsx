'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ListTodo, ClipboardCheck, Wrench, Wallet, ShieldCheck, Target, Clock, UserCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TeamRole } from '@/lib/admin/types';

const FIELD_NAV = [
  { href: '/equipe',              label: 'Tâches',     icon: ListTodo },
  { href: '/equipe/portefeuille', label: 'Argent',     icon: Wallet },
  { href: '/equipe/redditions',   label: 'Redditions', icon: ClipboardCheck },
  { href: '/equipe/action',       label: 'Métier',     icon: Wrench },
  { href: '/equipe/securite',     label: 'Sécurité',   icon: ShieldCheck },
];

const PROSPECT_NAV = [
  { href: '/equipe/prospection', label: 'Prospection', icon: Target },
  { href: '/equipe/journees',    label: 'Journées',    icon: Clock },
  { href: '/equipe/mon-compte',  label: 'Mon compte',  icon: UserCircle },
  { href: '/equipe/securite',    label: 'Sécurité',    icon: ShieldCheck },
];

export function EmployeMobileNav({ role, pendingTransfers = 0 }: { role: TeamRole; pendingTransfers?: number }) {
  const pathname = usePathname();
  const NAV = role === 'prospector' ? PROSPECT_NAV : FIELD_NAV;

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-stone-100 z-50">
      <div className="flex">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === '/equipe' ? pathname === '/equipe' : pathname.startsWith(href);
          const showBadge = href === '/equipe/mon-compte' && pendingTransfers > 0;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex-1 flex flex-col items-center gap-1 py-3 text-[11px] font-medium transition-colors',
                active ? 'text-accent' : 'text-muted',
              )}
            >
              <span className="relative">
                <Icon size={20} />
                {showBadge && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 flex items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full px-1 leading-none">
                    {pendingTransfers > 9 ? '9+' : pendingTransfers}
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
