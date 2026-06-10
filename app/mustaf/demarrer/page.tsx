import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, MapPin, Phone } from 'lucide-react';
import '../../landing.css';
import '../pricing.css';
import SiteHeader from '../../components/SiteHeader';

export const metadata: Metadata = {
  title: 'Démarrer mon projet — Mustaf | Litug',
  description:
    'Lancez votre projet de construction avec Mustaf : un tiers de confiance qui sécurise votre argent et suit votre chantier, depuis l’étranger.',
};

export default function DemarrerPage() {
  return (
    <div className="landing-root">
      <SiteHeader cta={{ label: 'Voir les offres', href: '/mustaf#offres' }} />

      <header className="mustaf-hero">
        <div className="hero-bg">
          <div className="hero-grid-tex"></div>
          <div className="glow g1"></div>
          <div className="glow g2"></div>
        </div>
        <div className="wrap mustaf-hero-inner">
          <div className="mustaf-hero-badge">
            <ShieldCheck size={14} />
            Tiers de confiance · Construction · Diaspora
          </div>
          <h1>
            Lançons votre projet,<br />
            <span className="mustaf-accent">étape par étape.</span>
          </h1>
          <p className="mustaf-hero-sub">
            Laissez-nous vos coordonnées : un conseiller Mustaf vous rappelle pour cadrer votre terrain,
            votre budget et la Phase 0 (plan, permis, étude de sol). Sans engagement.
          </p>
        </div>
      </header>

      <section className="section mustaf-pricing-sec">
        <div className="wrap demarrer-wrap">
          <div className="demarrer-steps">
            <div className="demarrer-step">
              <span className="demarrer-step-num">1</span>
              <p>Vous nous décrivez votre terrain et votre projet.</p>
            </div>
            <div className="demarrer-step">
              <span className="demarrer-step-num">2</span>
              <p>On prépare la Phase 0 : plan d’architecte, permis, étude de sol.</p>
            </div>
            <div className="demarrer-step">
              <span className="demarrer-step-num">3</span>
              <p>Vous épargnez à votre rythme ; on construit phase par phase.</p>
            </div>
          </div>

          <div className="demarrer-card">
            <h2 className="section-title" style={{ fontSize: '24px' }}>Commencer par la Phase 0</h2>
            <p className="section-sub" style={{ marginTop: 8 }}>
              Réglez le forfait Phase 0 (plan d’architecte, dossier de permis, étude de sol) et on lance votre projet.
            </p>
            <div className="demarrer-actions">
              <Link className="btn btn-primary btn-lg" href="/mustaf/demarrer/paiement">
                Commencer par la Phase 0 <ArrowRight size={17} className="arr" />
              </Link>
              <a className="btn btn-ghost btn-lg" href="https://wa.me/221000000000" target="_blank" rel="noopener noreferrer">
                <Phone size={16} /> Une question ? WhatsApp
              </a>
            </div>
            <p className="demarrer-note">
              <MapPin size={13} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 5 }} />
              Vous devez déjà posséder un terrain — ou en acheter un via Litug. On vérifie le titre avant de construire.
            </p>
          </div>
        </div>
      </section>

      <footer className="offer-foot">
        <p>
          <ShieldCheck size={15} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 6, color: 'var(--green)' }} />
          Argent bloqué chez un tiers de confiance · Inspecteur indépendant · Paiement par phase
        </p>
        <p style={{ marginTop: 10 }}>
          <Link href="/mustaf">← Retour aux offres Mustaf</Link>
        </p>
      </footer>
    </div>
  );
}
