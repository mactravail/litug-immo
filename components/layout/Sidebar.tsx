'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Map, Users, Settings, LifeBuoy, CalendarDays, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { logout } from '@/app/(auth)/login/actions';

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  count?: number;
}

const SUB_LABELS: Record<string, string> = {
  trial:    'Essai gratuit',
  active:   'Abonnement actif',
  past_due: 'Paiement en retard',
};

interface Props {
  businessName: string;
  subscriptionStatus: 'trial' | 'active' | 'past_due';
  landsCount?: number;
  leadsCount?: number;
  visitsCount?: number;
}

function initials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('');
}

export function Sidebar({ businessName, subscriptionStatus, landsCount, leadsCount, visitsCount }: Props) {
  const pathname = usePathname();

  const nav: NavItem[] = [
    { href: '/dashboard',  label: 'Tableau de bord', icon: LayoutDashboard },
    { href: '/clients',    label: 'Prospects',        icon: Users,        count: leadsCount },
    { href: '/terrains',   label: 'Terrains',         icon: Map,          count: landsCount },
    { href: '/visites',    label: 'Visites',          icon: CalendarDays, count: visitsCount },
    { href: '/parametres', label: 'Paramètres',       icon: Settings },
    { href: '/aide',       label: 'Aide et support',  icon: LifeBuoy },
  ];

  return (
    <aside className="s-side hidden lg:flex flex-col w-64 h-screen px-4 py-6 shrink-0">
      {/* Logo */}
      <div className="px-3 mb-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Litug" className="h-10 w-auto invert" />
      </div>
      <div className="s-space-lbl px-3 mb-3">Espace vendeur</div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto">
        {nav.map(({ href, label, icon: Icon, count }) => {
          const active = href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);
          return (
            <Link key={href} href={href} className={cn('s-nav-link', active && 's-active')}>
              <Icon size={17} />
              {label}
              {count != null && count > 0 && <span className="s-ct">{count}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Pied : statut Sara + profil */}
      <div className="mt-auto pt-4 space-y-3">
        <div className="s-sara-status">
          <div className="s-av">S<span className="s-on" /></div>
          <div className="min-w-0">
            <div className="s-t">Sara est active</div>
            <div className="s-s">En ligne 24/7</div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-1">
          <Link href="/parametres" className="flex items-center gap-2.5 min-w-0 flex-1 group">
            <div className="s-av" style={{ width: 34, height: 34, fontSize: 13, background: 'linear-gradient(135deg,#E2A53F,#b07a1f)', color: '#1a1206' }}>
              {initials(businessName)}
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold truncate" style={{ color: 'var(--s-txt)' }}>{businessName}</p>
              <p className="text-[11px]" style={{ color: 'var(--s-mut)' }}>{SUB_LABELS[subscriptionStatus]}</p>
            </div>
          </Link>
          <form action={logout}>
            <button
              type="submit"
              aria-label="Se déconnecter"
              className="s-icon-btn cursor-pointer"
              style={{ width: 30, height: 30 }}
            >
              <LogOut />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
