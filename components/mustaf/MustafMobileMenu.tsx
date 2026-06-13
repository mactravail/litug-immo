'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Wallet, ReceiptText, Camera, Users, FileText, LogOut, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { logout } from '@/app/(auth)/login/actions';

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

/**
 * Menu hamburger mobile pour l'espace Mustaf — remplace le bandeau de texte
 * dans l'en-tête. Donne accès à tous les menus + au profil + à la déconnexion
 * (la sidebar desktop porte déjà ce rôle, donc masqué dès `lg`).
 */
export function MustafMobileMenu({ ownerName, tierLabel }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Verrouille le scroll de la page quand le panneau est ouvert.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <div className="lg:hidden">
      {/* Bouton hamburger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Ouvrir le menu"
        className="inline-flex items-center gap-2 text-on-ink-muted hover:text-white transition-colors cursor-pointer"
      >
        <Menu size={20} />
        <span className="font-medium text-on-ink">Menu</span>
      </button>

      {/* Panneau coulissant + fond */}
      {open && (
        <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true">
          {/* Fond cliquable pour fermer */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />

          {/* Panneau */}
          <aside className="absolute left-0 top-0 h-full w-72 max-w-[82%] bg-white shadow-xl flex flex-col px-4 py-5">
            {/* En-tête du panneau */}
            <div className="flex items-center justify-between mb-6">
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="Litug" className="h-10 w-auto" />
                <p className="text-[11px] text-muted mt-1">Espace construction · Mustaf</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fermer le menu"
                className="p-2 -mr-2 rounded-xl text-muted hover:bg-stone-50 hover:text-text transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 overflow-y-auto">
              {NAV.map(({ href, label, icon: Icon }) => {
                const active = href === '/projet' ? pathname === '/projet' : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
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

            {/* Profil + déconnexion */}
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
        </div>
      )}
    </div>
  );
}
