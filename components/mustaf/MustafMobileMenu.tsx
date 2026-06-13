'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);

  // Le portail ne peut viser document.body qu'après le montage côté client.
  useEffect(() => setMounted(true), []);

  // Verrouille le scroll de l'arrière-plan quand le panneau est ouvert.
  // Dans ce layout, ce n'est PAS le <body> qui défile mais la colonne
  // `flex-1 overflow-y-auto` du layout — on remonte donc le DOM pour geler
  // chaque ancêtre réellement scrollable (sinon le fond continue de bouger sur iOS).
  useEffect(() => {
    if (!open) return;
    const scrollers: HTMLElement[] = [];
    let el = triggerRef.current?.parentElement ?? null;
    while (el) {
      const oy = getComputedStyle(el).overflowY;
      if (oy === 'auto' || oy === 'scroll') scrollers.push(el);
      el = el.parentElement;
    }
    const previous = scrollers.map(s => s.style.overflow);
    scrollers.forEach(s => { s.style.overflow = 'hidden'; });
    document.body.style.overflow = 'hidden';
    return () => {
      scrollers.forEach((s, i) => { s.style.overflow = previous[i]; });
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <div ref={triggerRef} className="lg:hidden">
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

      {/* Panneau coulissant + fond — rendu via un portail sur <body> pour
          échapper au contexte d'empilement du <header> sticky (sinon le menu
          reste piégé sous la barre de navigation du bas). */}
      {open && mounted && createPortal(
        <div className="mustaf-shell fixed inset-0 z-[100] lg:hidden" role="dialog" aria-modal="true">
          {/* Fond cliquable pour fermer */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />

          {/* Panneau — h-dvh suit le viewport visible (barre d'outils Safari incluse)
              pour que le bas (déconnexion) ne soit jamais coupé. */}
          <aside className="absolute left-0 top-0 h-dvh w-72 max-w-[82%] bg-white shadow-xl flex flex-col px-4 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            {/* En-tête du panneau */}
            <div className="flex items-center justify-between mb-6">
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="Litug" className="h-10 w-auto invert" />
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

            {/* Navigation — seule cette zone défile (overscroll-contain évite
                que le scroll se propage à l'arrière-plan sur iOS). */}
            <nav className="flex-1 space-y-1 overflow-y-auto overscroll-contain">
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
        </div>,
        document.body,
      )}
    </div>
  );
}
