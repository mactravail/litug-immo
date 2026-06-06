import type { Metadata } from 'next';
import Link from 'next/link';
import { Check, ShieldCheck, Sparkles, ArrowRight, Info, Settings } from 'lucide-react';
import '../landing.css';
import './offer.css';

export const metadata: Metadata = {
  title: 'Activer Sara — Offre & tarifs | Litug',
  description:
    "L'abonnement à Sara, l'agent IA WhatsApp qui répond à tes clients 24/7, qualifie les prospects et alimente ton tableau de bord vendeur.",
};

const INCLUDED = [
  'Agent IA WhatsApp disponible 24h/24, 7j/7',
  'Réponses automatiques et instantanées à chaque client',
  'Qualification automatique : budget, zone, superficie, type de terrain',
  'Envoi automatique des photos et des fiches d’information',
  'Transfert vers toi uniquement des prospects sérieux',
  'Tableau de bord vendeur : terrains, clients, visites',
  'Collecte de témoignages liés à des transactions réelles',
];

const SETUP = [
  'Configuration de ton numéro WhatsApp Business officiel',
  'Paramétrage et personnalisation de Sara à ton activité',
  'Import de tes premiers terrains',
  'Formation à la prise en main',
];

const FAQ = [
  {
    q: 'Que comprend exactement l’abonnement mensuel ?',
    a: 'L’accès complet à Sara (l’agent IA WhatsApp) et à ton tableau de bord vendeur pour gérer tes terrains, tes clients et tes visites. Le tarif est mensuel, sans engagement de durée.',
  },
  {
    q: 'À quoi sert le frais d’installation unique ?',
    a: 'Il couvre la mise en service : connexion de ton numéro WhatsApp Business officiel, personnalisation de Sara à ton activité, import de tes premiers terrains et formation. Il n’est facturé qu’une seule fois.',
  },
  {
    q: 'Utilisez-vous une automatisation WhatsApp non officielle ?',
    a: 'Non. Sara fonctionne uniquement via l’API WhatsApp Business officielle, pour ne jamais risquer le bannissement de ton numéro.',
  },
  {
    q: 'Comment se passe l’activation ?',
    a: 'Tu crées ton compte vendeur, puis notre équipe te contacte pour la mise en service de Sara sur ton numéro. Tu commences à recevoir des prospects qualifiés dès que tout est en place.',
  },
];

export default function SaraOfferPage() {
  return (
    <div className="landing-root">
      {/* Nav simple */}
      <nav className="offer-nav">
        <Link className="brand" href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Litug" />
        </Link>
        <div className="offer-nav-right">
          <Link className="btn btn-ghost" href="/login">Se connecter</Link>
          <Link className="btn btn-primary" href="/register">
            Créer mon compte <ArrowRight size={16} className="arr" />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <header className="wrap offer-hero">
        <span className="eyebrow">Agent terrain IA · Abonnement vendeur</span>
        <h1>
          Active <span className="accent">Sara</span> et ne rate plus jamais un client
        </h1>
        <p>
          Une offre unique, claire et sans engagement. Sara répond, qualifie et te transfère
          uniquement les prospects sérieux — pendant que tu te concentres sur la vente.
        </p>
      </header>

      {/* Offre + carte tarif */}
      <section className="section wrap" style={{ paddingTop: 0 }}>
        <div className="offer-grid">
          {/* Ce qui est inclus */}
          <div className="offer-included">
            <h2>Tout ce que Sara fait pour toi</h2>
            <ul className="offer-list">
              {INCLUDED.map((item, i) => (
                <li key={i}>
                  <span className="tick"><Check size={14} strokeWidth={2.5} /></span>
                  {item}
                </li>
              ))}
            </ul>

            <div className="offer-sub">
              <h3><Settings size={16} /> Inclus dans la mise en service (setup)</h3>
              <ul>
                {SETUP.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Carte tarif */}
          <aside className="price-card">
            <span className="price-badge"><Sparkles size={14} /> Offre unique</span>
            <p className="price-name">Abonnement <span>Sara</span></p>

            <div className="price-amount">
              <span className="num">50 000</span>
              <span className="unit">FCFA / mois</span>
            </div>
            <p className="price-eur">≈ 76 € par mois · sans engagement</p>

            <div className="price-setup">
              <span className="lbl">
                Mise en service
                <small>Frais d&apos;installation unique</small>
              </span>
              <span className="amt">
                100 000 FCFA
                <small>≈ 152 € · une seule fois</small>
              </span>
            </div>

            <Link className="btn btn-primary btn-lg" href="/sara/paiement">
              Activer Sara <ArrowRight size={17} className="arr" />
            </Link>
            <Link className="secondary" href="/#contact">Parler à un conseiller d&apos;abord</Link>

            <p className="price-note">
              <Info size={15} />
              Après la création de ton compte, notre équipe te contacte pour la mise en service
              de Sara sur ton numéro WhatsApp officiel.
            </p>
          </aside>
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

      {/* Pied */}
      <footer className="offer-foot">
        <p>
          <ShieldCheck size={15} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 6, color: 'var(--green)' }} />
          WhatsApp Business officiel · Plateforme bâtie sur la confiance.
        </p>
        <p style={{ marginTop: 10 }}>
          <Link href="/">← Retour à l&apos;accueil</Link>
        </p>
      </footer>
    </div>
  );
}
