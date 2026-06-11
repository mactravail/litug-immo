'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, TrendingUp, Store, HardHat, TriangleAlert, ScrollText, LogOut,
  Users, ClipboardList, ClipboardCheck, Construction, UserCog,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { logout } from '@/app/(auth)/login/actions';

const GROUPS: { title: string; items: { href: string; label: string; icon: typeof LayoutDashboard }[] }[] = [
  {
    title: 'Plateforme',
    items: [
      { href: '/admin',             label: 'Vue d’ensemble',  icon: LayoutDashboard },
      { href: '/admin/statistiques', label: 'Statistiques',   icon: TrendingUp },
      { href: '/admin/vendeurs',    label: 'Vendeurs (Sara)', icon: Store },
      { href: '/admin/mustaf',      label: 'Projets Mustaf',  icon: HardHat },
      { href: '/admin/anomalies',   label: 'Anomalies',       icon: TriangleAlert },
      { href: '/admin/audit',       label: 'Journal d’audit', icon: ScrollText },
    ],
  },
  {
    title: 'Équipe',
    items: [
      { href: '/admin/employes',    label: 'Employés',         icon: Users },
      { href: '/admin/taches',      label: 'Tâches & avances', icon: ClipboardList },
      { href: '/admin/redditions',  label: 'Redditions',       icon: ClipboardCheck },
      { href: '/admin/problemes',   label: 'Problèmes',        icon: Construction },
      { href: '/admin/equipe',      label: 'Rôles & rotation', icon: UserCog },
    ],
  },
];

export function AdminSidebar({ adminName }: { adminName: string }) {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-white border-r border-stone-100 px-4 py-6 shrink-0">
      <div className="px-3 mb-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Litug" className="h-12 w-auto" />
        <p className="text-[11px] text-muted mt-1">Back-office · Administration</p>
      </div>

      <nav className="flex-1 space-y-6">
        {GROUPS.map(group => (
          <div key={group.title} className="space-y-1">
            <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted/70">{group.title}</p>
            {group.items.map(({ href, label, icon: Icon }) => {
              const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                    active ? 'bg-accent-light text-accent' : 'text-muted hover:bg-stone-50 hover:text-text',
                  )}
                >
                  <Icon size={17} />
                  {label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="border-t border-stone-100 pt-4 mt-4 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-ink flex items-center justify-center text-on-ink text-xs font-bold shrink-0">
            {adminName.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-text truncate">{adminName}</p>
            <p className="text-[11px] text-muted">Administrateur</p>
          </div>
        </div>
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
