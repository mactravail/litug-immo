'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, TrendingUp, Store, HardHat, TriangleAlert, ScrollText, LogOut,
  Users, ClipboardList, ClipboardCheck, Construction, UserCog, ShieldCheck, Inbox, Receipt, Target, Home,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { logout } from '@/app/(auth)/login/actions';

const GROUPS: { title: string; items: { href: string; label: string; icon: typeof LayoutDashboard }[] }[] = [
  {
    title: 'Plateforme',
    items: [
      { href: '/admin',             label: 'Vue d’ensemble',  icon: LayoutDashboard },
      { href: '/admin/demandes',    label: 'Demandes',        icon: Inbox },
      { href: '/admin/statistiques', label: 'Statistiques',   icon: TrendingUp },
      { href: '/admin/factures',    label: 'Factures',        icon: Receipt },
      { href: '/admin/vendeurs',    label: 'Vendeurs (Sara)', icon: Store },
      { href: '/admin/mustaf',      label: 'Projets Mustaf',  icon: HardHat },
      { href: '/admin/maisons',     label: 'Exemples maisons', icon: Home },
      { href: '/admin/anomalies',   label: 'Anomalies',       icon: TriangleAlert },
      { href: '/admin/audit',       label: 'Journal d’audit', icon: ScrollText },
    ],
  },
  {
    title: 'Équipe',
    items: [
      { href: '/admin/employes',    label: 'Employés',         icon: Users },
      { href: '/admin/prospection', label: 'Prospection',      icon: Target },
      { href: '/admin/taches',      label: 'Tâches & avances', icon: ClipboardList },
      { href: '/admin/redditions',  label: 'Redditions',       icon: ClipboardCheck },
      { href: '/admin/problemes',   label: 'Problèmes',        icon: Construction },
      { href: '/admin/equipe',      label: 'Rôles & rotation', icon: UserCog },
    ],
  },
  {
    title: 'Compte',
    items: [
      { href: '/admin/securite',    label: 'Sécurité',         icon: ShieldCheck },
    ],
  },
];

export function AdminSidebar({ adminName, pendingCount = 0, prospectionCount = 0 }: { adminName: string; pendingCount?: number; prospectionCount?: number }) {
  const pathname = usePathname();

  return (
    <aside className="a-side hidden lg:flex flex-col w-64 h-screen px-4 py-6 shrink-0">
      <div className="px-3 mb-7">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Litug" className="h-10 w-auto invert" />
        <p className="a-side-sub mt-1">Back-office · Administration</p>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto">
        {GROUPS.map(group => (
          <div key={group.title} className="space-y-0.5">
            <p className="a-nav-h px-3 mb-1.5">{group.title}</p>
            {group.items.map(({ href, label, icon: Icon }) => {
              const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
              return (
                <Link key={href} href={href} className={cn('a-nav-link', active && 'a-active')}>
                  <Icon size={17} />
                  <span className="flex-1">{label}</span>
                  {href === '/admin/demandes' && pendingCount > 0 && (
                    <span className="a-nav-badge">{pendingCount > 99 ? '99+' : pendingCount}</span>
                  )}
                  {href === '/admin/prospection' && prospectionCount > 0 && (
                    <span className="a-nav-badge">{prospectionCount > 99 ? '99+' : prospectionCount}</span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="mt-4 pt-4 space-y-1" style={{ borderTop: '1px solid var(--a-line)' }}>
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="a-profile-av">{adminName.slice(0, 2).toUpperCase()}</div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: 'var(--a-txt)' }}>{adminName}</p>
            <p className="text-[11px]" style={{ color: 'var(--a-mut)' }}>Administrateur</p>
          </div>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="a-nav-link w-full cursor-pointer"
          >
            <LogOut size={16} />
            Se déconnecter
          </button>
        </form>
      </div>
    </aside>
  );
}
