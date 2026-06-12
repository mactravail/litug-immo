'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

/* Shared public header — solid light bar with a hamburger mobile menu.
   Used across every marketing page so the mobile experience is consistent. */

const LINKS = [
  { label: 'Terrains', href: '/nos-terrains' },
  { label: 'Vendeur', href: '/sara' },
  { label: 'Construction', href: '/mustaf' },
  { label: 'Tarifs', href: '/produits' },
  { label: 'Blog', href: '/blog' },
];

type Cta = { label: string; href: string };

export default function SiteHeader({ cta = { label: 'Nous contacter', href: '/#contact' } }: { cta?: Cta }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className={`site-header${open ? ' menu-open' : ''}`}>
      <div className="site-header-inner">
        <Link className="brand" href="/" onClick={close}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Litug" />
        </Link>

        <nav className="sh-links">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href}>{l.label}</Link>
          ))}
        </nav>

        <div className="sh-actions">
          <Link className="btn btn-ghost" href="/login">Se connecter</Link>
          <Link className="btn btn-primary" href={cta.href}>
            {cta.label} <ArrowRight size={16} className="arr" />
          </Link>
        </div>

        <button
          className="sh-burger"
          aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span></span><span></span><span></span>
        </button>
      </div>

      {/* Mobile menu */}
      <div className={`sh-mobile${open ? ' open' : ''}`} role="dialog" aria-modal="true">
        <nav className="sh-mobile-links">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={close}>{l.label}</Link>
          ))}
        </nav>
        <div className="sh-mobile-actions">
          <Link className="btn btn-ghost btn-lg" href="/login" onClick={close}>Se connecter</Link>
          <Link className="btn btn-primary btn-lg" href={cta.href} onClick={close}>
            {cta.label} <ArrowRight size={17} className="arr" />
          </Link>
        </div>
      </div>
      <div className={`sh-scrim${open ? ' open' : ''}`} onClick={close}></div>
    </header>
  );
}
