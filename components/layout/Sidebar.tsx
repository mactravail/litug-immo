'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Map, Users, Settings, LifeBuoy, CalendarDays, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { logout } from '@/app/(auth)/login/actions';

const NAV = [
  { href: '/dashboard',  label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/terrains',   label: 'Terrains',         icon: Map },
  { href: '/clients',    label: 'Clients',          icon: Users },
  { href: '/visites',    label: 'Visites',          icon: CalendarDays },
  { href: '/parametres', label: 'Paramètres',  icon: Settings },
  { href: '/aide',       label: 'Aide et support',  icon: LifeBuoy },
];

const SUB_LABELS: Record<string, string> = {
  trial:    'Essai gratuit',
  active:   'Abonnement actif',
  past_due: 'Paiement en retard',
};

interface Props {
  businessName: string;
  subscriptionStatus: 'trial' | 'active' | 'past_due';
}

function initials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('');
}

export function Sidebar({ businessName, subscriptionStatus }: Props) {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen bg-white border-r border-stone-100 px-4 py-6 shrink-0">
      {/* Logo */}
      <div className="px-3 mb-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Litug" className="h-12 w-auto" />
        <p className="text-[11px] text-muted mt-1">Tableau de bord vendeur</p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                active
                  ? 'bg-accent-light text-accent'
                  : 'text-muted hover:bg-stone-50 hover:text-text'
              )}
            >
              <Icon size={17} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Profil vendeur */}
      <div className="border-t border-stone-100 pt-4 mt-4 space-y-1">
        <Link href="/parametres" className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-stone-50 transition-colors group">
          <div className="w-8 h-8 rounded-full bg-accent-light flex items-center justify-center text-accent text-xs font-bold shrink-0">
            {initials(businessName)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-text truncate group-hover:text-accent transition-colors">
              {businessName}
            </p>
            <p className="text-[11px] text-muted">{SUB_LABELS[subscriptionStatus]}</p>
          </div>
        </Link>
        <form action={logout}>
          <button
            type="submit"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted hover:bg-stone-50 hover:text-red-500 transition-colors w-full cursor-pointer"
          >
            <LogOut size={16} />
            Se déconnecter
          </button>
        </form>
      </div>
    </aside>
  );
}
