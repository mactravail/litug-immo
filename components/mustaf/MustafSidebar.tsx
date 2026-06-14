'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Wallet, ReceiptText, Camera, Users, FileText, LogOut, ChevronDown, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { logout } from '@/app/(auth)/login/actions';

const NAV = [
  { href: '/projet',                label: "Vue d'ensemble",    icon: Home },
  { href: '/projet/depenses',       label: 'Dépenses',          icon: ReceiptText },
  { href: '/projet/chantier',       label: 'Photos du chantier', icon: Camera },
  { href: '/projet/epargne',        label: 'Compte épargne',    icon: Wallet },
  { href: '/projet/contributions',  label: 'Famille & financement', icon: Users },
  { href: '/projet/documents',      label: 'Documents',         icon: FileText },
];

interface Props {
  ownerName: string;
  tierLabel: string;
  projectName: string;
}

function initials(name: string) {
  return name.split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('');
}

export function MustafSidebar({ ownerName, tierLabel, projectName }: Props) {
  const pathname = usePathname();

  return (
    <aside className="m-side hidden lg:flex flex-col fixed inset-y-0 left-0 z-30 w-64 h-screen px-4 py-5">
      {/* Logo */}
      <div className="px-2 mb-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Litug" className="h-9 w-auto invert" />
      </div>

      {/* Sélecteur de projet */}
      <div className="m-proj-switch mb-4">
        <div className="m-lbl">Projet en cours</div>
        <div className="m-nm">
          <span className="truncate">{projectName}</span>
          <ChevronDown size={14} className="shrink-0" style={{ color: 'var(--m-mut)' }} />
        </div>
      </div>

      <div className="m-nav-h">Mustaf · Chantier</div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === '/projet' ? pathname === '/projet' : pathname.startsWith(href);
          return (
            <Link key={href} href={href} className={cn('m-nav-link', active && 'm-active')}>
              <Icon size={17} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Pied : confiance + profil */}
      <div className="mt-auto pt-4 space-y-3">
        <div className="m-trust-mini">
          <div className="m-t">
            <ShieldCheck size={15} />
            Argent sécurisé
          </div>
          <div className="m-s">Bloqué chez le notaire séquestre — jamais chez Litug.</div>
        </div>

        <div className="flex items-center gap-2.5 px-1">
          <div className="m-av" style={{ width: 34, height: 34, fontSize: 13, background: 'linear-gradient(135deg,#5B9DF9,#3a6fb0)' }}>
            {initials(ownerName)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold truncate" style={{ color: 'var(--m-txt)' }}>{ownerName}</p>
            <p className="text-[11px]" style={{ color: 'var(--m-mut)' }}>Formule {tierLabel}</p>
          </div>
          <form action={logout}>
            <button
              type="submit"
              aria-label="Se déconnecter"
              className="m-icon-btn cursor-pointer"
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
