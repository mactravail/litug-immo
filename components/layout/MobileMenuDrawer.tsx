'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu, X, LayoutDashboard, Map, Users,
  Settings, LifeBuoy, CalendarDays, LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { logout } from '@/app/(auth)/login/actions';

const SUB_LABELS: Record<string, string> = {
  trial:    'Essai gratuit',
  active:   'Abonnement actif',
  past_due: 'Paiement en retard',
};

function initials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('');
}

interface Props {
  businessName: string;
  subscriptionStatus: 'trial' | 'active' | 'past_due';
  landsCount?: number;
  leadsCount?: number;
  visitsCount?: number;
}

export function MobileMenuDrawer({
  businessName,
  subscriptionStatus,
  landsCount,
  leadsCount,
  visitsCount,
}: Props) {
  const [open, setOpen]       = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname              = usePathname();

  // Monter le portail côté client uniquement
  useEffect(() => { setMounted(true); }, []);

  // Fermer quand la route change
  useEffect(() => { setOpen(false); }, [pathname]);

  // Bloquer le scroll du body quand ouvert
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const nav = [
    { href: '/dashboard',  label: 'Tableau de bord', icon: LayoutDashboard },
    { href: '/clients',    label: 'Prospects',        icon: Users,         count: leadsCount },
    { href: '/terrains',   label: 'Terrains',         icon: Map,           count: landsCount },
    { href: '/visites',    label: 'Visites',          icon: CalendarDays,  count: visitsCount },
    { href: '/parametres', label: 'Paramètres',       icon: Settings },
    { href: '/aide',       label: 'Aide et support',  icon: LifeBuoy },
  ];

  const drawer = (
    /* Le portail sort du contexte d'empilement du <header sticky z-40>
       pour que z-[200] soit bien au-dessus de la MobileNav z-50. */
    <div className="sara-shell lg:hidden">
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-[200] bg-black/60 transition-opacity duration-200',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
        onClick={() => setOpen(false)}
      />

      {/* Panneau */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-[210] flex flex-col w-72',
          'transition-transform duration-200 ease-out',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
        style={{
          background:  'var(--s-bg2)',
          borderRight: '1px solid var(--s-line)',
        }}
      >
        {/* En-tête */}
        <div
          className="flex items-center justify-between px-4 py-4 shrink-0"
          style={{ borderBottom: '1px solid var(--s-line)' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Litug" className="h-8 w-auto invert" />
          <button
            className="s-icon-btn cursor-pointer"
            aria-label="Fermer le menu"
            onClick={() => setOpen(false)}
          >
            <X />
          </button>
        </div>

        <div className="s-space-lbl px-5 pt-4 pb-2 shrink-0">Espace vendeur</div>

        {/* Navigation (scrollable si besoin) */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {nav.map(({ href, label, icon: Icon, count }) => {
            const active =
              href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn('s-nav-link', active && 's-active')}
              >
                <Icon size={17} />
                {label}
                {count != null && count > 0 && (
                  <span className="s-ct">{count}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Pied : Sara + profil + déconnexion */}
        <div
          className="shrink-0 pt-4 pb-6 px-3 space-y-3"
          style={{ borderTop: '1px solid var(--s-line)' }}
        >
          {/* Statut Sara */}
          <div className="s-sara-status">
            <div
              className="s-av"
              style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#34c77b,#1f8f55)', fontSize: 13 }}
            >
              S<span className="s-on" />
            </div>
            <div className="min-w-0">
              <div className="s-t">Sara est active</div>
              <div className="s-s">En ligne 24/7</div>
            </div>
          </div>

          {/* Profil vendeur */}
          <Link href="/parametres" className="flex items-center gap-2.5 px-1 min-w-0">
            <div
              className="s-av shrink-0"
              style={{
                width: 34, height: 34, fontSize: 13,
                background: 'linear-gradient(135deg,#E2A53F,#b07a1f)',
                color: '#1a1206',
              }}
            >
              {initials(businessName)}
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold truncate" style={{ color: 'var(--s-txt)' }}>
                {businessName}
              </p>
              <p className="text-[11px]" style={{ color: 'var(--s-mut)' }}>
                {SUB_LABELS[subscriptionStatus]}
              </p>
            </div>
          </Link>

          {/* Bouton Se déconnecter — toujours visible, pleine largeur */}
          <form action={logout} className="px-1">
            <button
              type="submit"
              className="s-nav-link w-full cursor-pointer"
              style={{ color: 'var(--s-red)', justifyContent: 'flex-start' }}
            >
              <LogOut size={17} />
              Se déconnecter
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Bouton hamburger dans le header — mobile uniquement */}
      <button
        className="s-icon-btn shrink-0 lg:hidden cursor-pointer"
        aria-label="Ouvrir le menu"
        onClick={() => setOpen(true)}
      >
        <Menu />
      </button>

      {/* Portail : tiroir rendu directement sous <body>, hors du contexte
          d'empilement du <header sticky z-40>, au-dessus de tout. */}
      {mounted && createPortal(drawer, document.body)}
    </>
  );
}
