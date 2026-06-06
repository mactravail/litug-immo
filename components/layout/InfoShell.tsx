import Link from 'next/link';
import { ArrowRight, ShieldCheck } from 'lucide-react';

/**
 * Shell partagé pour les pages informationnelles (À propos, Carrières,
 * Mentions légales, Confidentialité, Conditions).
 * Reprend la nav + le footer simple, palette Sahel.
 * Les classes vivent dans app/legal.css — la page hôte doit importer
 * `../landing.css` (boutons/tokens) et `../legal.css`.
 */
export default function InfoShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="landing-root">
      {/* ── Nav ────────────────────────────────────────────── */}
      <nav className="info-nav">
        <Link className="brand" href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Litug" />
        </Link>
        <div className="info-nav-links">
          <Link className="info-nav-link" href="/nos-terrains">Nos terrains</Link>
          <Link className="info-nav-link" href="/produits">Produits</Link>
          <Link className="info-nav-link" href="/blog">Blog</Link>
        </div>
        <div className="info-nav-right">
          <Link className="btn btn-ghost" href="/login">Se connecter</Link>
          <Link className="btn btn-primary" href="/#contact">
            Commencer <ArrowRight size={15} className="arr" />
          </Link>
        </div>
      </nav>

      {children}

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="info-foot">
        <p>
          <ShieldCheck
            size={15}
            style={{ display: 'inline', verticalAlign: '-2px', marginRight: 6, color: 'var(--green)' }}
          />
          Plateforme bâtie sur la confiance · WhatsApp Business officiel · Notaires &amp; géomètres partenaires
        </p>
        <p style={{ marginTop: 10 }}>
          <Link href="/">← Retour à l&apos;accueil</Link>
        </p>
      </footer>
    </div>
  );
}
