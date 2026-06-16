import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, Settings } from 'lucide-react';
import '../landing.css';
import './offer.css';
import SiteHeader from '../components/SiteHeader';
import PricingCards from './PricingCards';

export const metadata: Metadata = {
  title: 'Activer Sara — Offre & tarifs | Litug',
  description:
    "Deux formules pour activer Sara, l'agent IA WhatsApp qui qualifie tes prospects 24h/24 : essai sans abonnement, ou tout compris avec prix garanti 2 ans.",
};

const SETUP = [
  'Configuration de ton numéro WhatsApp Business officiel',
  'Paramétrage et personnalisation de Sara à ton activité',
  'Import de tes premiers terrains',
  'Formation à la prise en main du tableau de bord',
];

const FAQ = [
  {
    q: "Que comprend l'essai gratuit ?",
    a: "Tu paies une seule fois les frais de mise en service (100 000 FCFA). En retour, tu accèdes à Sara, à ton tableau de bord vendeur, et tu peux charger et vendre tes terrains sur la plateforme — sans abonnement mensuel.",
  },
  {
    q: "Quelle est la différence avec l'abonnement Tout compris ?",
    a: "L'abonnement Tout compris engage un tarif mensuel (modulable sur 1 mois, 6 mois ou 1 an). La différence principale : ton tarif est garanti pendant 2 ans. Si Sara augmente ses prix demain, toi tu restes au tarif souscrit aujourd'hui pendant toute cette période.",
  },
  {
    q: "Comment fonctionne la garantie de prix pendant 2 ans ?",
    a: "Dès que tu souscris un abonnement, le tarif en vigueur est figé pour ton compte pendant 2 ans. Si Litug revoit ses prix à la hausse, ton abonnement continue au même montant jusqu'à l'échéance. C'est notre engagement envers les premiers adoptants.",
  },
  {
    q: "Quelle formule choisir : mensuelle, 6 mois ou annuelle ?",
    a: "La formule annuelle offre la plus grande réduction (-20%) et garantit ton prix sur 12 mois. La formule 6 mois est un bon compromis (-10%). La formule mensuelle reste la plus flexible — mais le tarif peut évoluer à chaque renouvellement.",
  },
  {
    q: "Utilisez-vous une automatisation WhatsApp non officielle ?",
    a: "Non. Sara fonctionne uniquement via l'API WhatsApp Business officielle, pour ne jamais risquer le bannissement de ton numéro.",
  },
  {
    q: "Comment se passe l'activation ?",
    a: "Tu crées ton compte lors du paiement, puis notre équipe te contacte sous 24 h pour la mise en service de Sara sur ton numéro. Tu commences à recevoir des prospects qualifiés dès que tout est en place.",
  },
];

export default function SaraOfferPage() {
  return (
    <div className="landing-root">
      <SiteHeader cta={{ label: 'Créer mon compte', href: '/register' }} />

      {/* Hero */}
      <header className="wrap offer-hero">
        <span className="eyebrow">Agent terrain IA · Deux formules</span>
        <h1>
          Active <span className="accent">Sara</span> et ne rate plus jamais un client
        </h1>
        <p>
          Commence avec l&apos;essai gratuit ou engage-toi maintenant et verrouille ton tarif 2 ans —
          même si nos prix augmentent.
        </p>
      </header>

      {/* Deux offres */}
      <section className="section wrap" style={{ paddingTop: 0 }}>
        <PricingCards />
      </section>

      {/* Mise en service */}
      <section className="section wrap" style={{ paddingTop: 0 }}>
        <div className="offer-setup-box">
          <h2><Settings size={18} /> Inclus dans les deux offres : la mise en service</h2>
          <ul className="setup-list">
            {SETUP.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section className="section wrap" style={{ paddingTop: 0 }}>
        <div className="offer-faq">
          <h2>Questions fréquentes</h2>
          {FAQ.map((item, i) => (
            <div className="faq-item" key={i}>
              <h4>{item.q}</h4>
              <p>{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="offer-foot">
        <p>
          <ShieldCheck
            size={15}
            style={{ display: 'inline', verticalAlign: '-2px', marginRight: 6, color: 'var(--green)' }}
          />
          WhatsApp Business officiel · Plateforme bâtie sur la confiance.
        </p>
        <p style={{ marginTop: 10 }}>
          <Link href="/">← Retour à l&apos;accueil</Link>
        </p>
      </footer>
    </div>
  );
}
