import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import SiteHeader from '@/app/components/SiteHeader';

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
      <SiteHeader cta={{ label: 'Commencer', href: '/#contact' }} />

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
