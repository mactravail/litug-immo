import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, FileText, FileCheck2, Layers } from 'lucide-react';
import { formatFcfa, formatEur } from '@/lib/utils';
import { PHASE_ZERO_FEE } from '../../offers';
import PaiementForm from './PaiementForm';
import '../../../landing.css';
import './paiement.css';

export const metadata: Metadata = {
  title: 'Paiement Phase 0 — Mustaf | Litug',
  description:
    'Réglez le forfait Phase 0 de Mustaf (plan d’architecte, dossier de permis, étude de sol) pour lancer votre projet de construction.',
};

// Détail du forfait Phase 0 (§8.1) — frais fixe payé une fois.
const PHASE_ZERO_ITEMS = [
  { icon: FileText, label: 'Plan d’architecte', note: 'Conçu selon votre terrain et votre budget' },
  { icon: FileCheck2, label: 'Dossier de permis de construire', note: 'Montage et dépôt du dossier' },
  { icon: Layers, label: 'Étude de sol', note: 'Fondations dimensionnées sans surprise' },
];

export default function PaiementPhaseZeroPage() {
  return (
    <div className="landing-root">
      {/* Nav simple */}
      <nav className="offer-nav">
        <Link className="brand" href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Litug" />
        </Link>
        <Link className="btn btn-ghost" href="/mustaf/demarrer">
          <ArrowLeft size={16} /> Retour
        </Link>
      </nav>

      <header className="wrap offer-hero" style={{ paddingTop: 'clamp(32px,5vw,56px)' }}>
        <span className="eyebrow">Paiement sécurisé · Phase 0</span>
        <h1>Lancez votre projet <span className="accent">Mustaf</span></h1>
        <p>
          Le forfait Phase 0 couvre tout ce qu’il faut avant de construire : plan, permis et étude de sol.
          C’est un frais fixe, payé une seule fois — jamais prélevé sur l’argent de votre chantier.
        </p>
      </header>

      <section className="section wrap" style={{ paddingTop: 'clamp(24px,3vw,36px)' }}>
        <div className="pay-grid">
          {/* Colonne formulaire de paiement */}
          <div className="pay-form-col">
            <PaiementForm />
          </div>

          {/* Colonne récap commande */}
          <div className="pay-summary-col">
            <div className="pay-card">
              <h2>Forfait Phase 0</h2>
              <ul className="pay-includes">
                {PHASE_ZERO_ITEMS.map(({ icon: Icon, label, note }) => (
                  <li key={label}>
                    <span className="pay-includes-ic"><Icon size={17} /></span>
                    <span>
                      <b>{label}</b>
                      <small>{note}</small>
                    </span>
                  </li>
                ))}
              </ul>

              <div className="pay-total">
                <span className="lbl">À payer aujourd’hui</span>
                <span className="val">
                  <span className="big">{formatFcfa(PHASE_ZERO_FEE)}</span>
                  <small>≈ {formatEur(PHASE_ZERO_FEE)}</small>
                </span>
              </div>
              <p className="pay-recurring">
                Frais fixe unique. Les honoraires de gestion (8 à 16 %) ne démarrent qu’au lancement
                du chantier, étalés phase par phase.
              </p>
            </div>

            <div className="pay-trust">
              <p>
                <ShieldCheck size={15} />
                Paiement chiffré. Votre argent de construction, lui, reste bloqué chez un tiers de
                confiance et n’est libéré qu’après vérification sur le chantier.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="offer-foot">
        <p>
          <ShieldCheck size={15} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 6, color: 'var(--green)' }} />
          Tiers de confiance · Inspecteur indépendant · Paiement par phase
        </p>
        <p style={{ marginTop: 10 }}>
          <Link href="/mustaf">← Retour aux offres Mustaf</Link>
        </p>
      </footer>
    </div>
  );
}
