'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Wallet, ReceiptText, Camera, Users, FileText, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/projet',                label: 'Mon projet',        icon: Home },
  { href: '/projet/epargne',        label: 'Compte épargne',    icon: Wallet },
  { href: '/projet/depenses',       label: 'Dépenses',          icon: ReceiptText },
  { href: '/projet/chantier',       label: 'Suivi du chantier', icon: Camera },
  { href: '/projet/contributions',  label: 'Contributions',     icon: Users },
  { href: '/projet/documents',      label: 'Documents',         icon: FileText },
];

interface Props {
  ownerName: string;
  tierLabel: string;
}

function initials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('');
}

export function MustafSidebar({ ownerName, tierLabel }: Props) {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-white border-r border-stone-100 px-4 py-6 shrink-0">
      {/* Logo */}
      <div className="px-3 mb-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Litug" className="h-12 w-auto" />
        <p className="text-[11px] text-muted mt-1">Espace construction · Mustaf</p>
      </div>

      <nav className="flex-1 space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === '/projet' ? pathname === '/projet' : pathname.startsWith(href);
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

      {/* Profil client */}
      <div className="border-t border-stone-100 pt-4 mt-4 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-accent-light flex items-center justify-center text-accent text-xs font-bold shrink-0">
            {initials(ownerName)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-text truncate">{ownerName}</p>
            <p className="text-[11px] text-muted">Formule {tierLabel}</p>
          </div>
        </div>
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted hover:bg-stone-50 hover:text-text transition-colors"
        >
          <ArrowLeft size={16} />
          Retour à l’accueil
        </Link>
      </div>
    </aside>
  );
}
