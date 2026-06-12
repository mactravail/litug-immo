'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ListTodo, ClipboardCheck, Wrench, Wallet, LogOut, ShieldCheck, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { logout } from '@/app/(auth)/login/actions';
import { TEAM_ROLE_LABEL } from '@/lib/admin/labels';
import type { TeamRole } from '@/lib/admin/types';
import { WorkerSwitcher } from './WorkerSwitcher';

/** Navigation terrain (chantier) — pour procurement / site_agent / inspector / controller. */
const FIELD_NAV = [
  { href: '/equipe',             label: 'Mes tâches',     icon: ListTodo },
  { href: '/equipe/portefeuille', label: 'Mon argent',    icon: Wallet },
  { href: '/equipe/redditions',  label: 'Mes redditions', icon: ClipboardCheck },
  { href: '/equipe/action',      label: 'Action métier',  icon: Wrench },
];

/** Navigation prospecteur commercial — son seul métier, c'est la prospection. */
const PROSPECT_NAV = [
  { href: '/equipe/prospection', label: 'Prospection', icon: Target },
];

function navFor(role: TeamRole) {
  return role === 'prospector' ? PROSPECT_NAV : FIELD_NAV;
}

interface Props {
  workerName: string;
  role: TeamRole;
  workers: { id: string; name: string; role: string }[];
  currentId: string;
}

export function EmployeSidebar({ workerName, role, workers, currentId }: Props) {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen bg-white border-r border-stone-100 px-4 py-6 shrink-0">
      <div className="px-3 mb-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Litug" className="h-12 w-auto" />
        <p className="text-[11px] text-muted mt-1">Espace équipe · Terrain</p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto">
        {navFor(role).map(({ href, label, icon: Icon }) => {
          const active = href === '/equipe' ? pathname === '/equipe' : pathname.startsWith(href);
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
      </nav>

      <div className="border-t border-stone-100 pt-4 mt-4 space-y-3">
        <div className="flex items-center gap-3 px-3">
          <div className="w-8 h-8 rounded-full bg-ink flex items-center justify-center text-on-ink text-xs font-bold shrink-0">
            {workerName.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-text truncate">{workerName}</p>
            <p className="text-[11px] text-muted">{TEAM_ROLE_LABEL[role]}</p>
          </div>
        </div>

        <WorkerSwitcher workers={workers} currentId={currentId} />

        <Link
          href="/equipe/securite"
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors',
            pathname.startsWith('/equipe/securite') ? 'bg-accent-light text-accent' : 'text-muted hover:bg-stone-50 hover:text-text',
          )}
        >
          <ShieldCheck size={16} />
          Sécurité
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
