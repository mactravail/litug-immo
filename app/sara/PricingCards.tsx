'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, ArrowRight, Info, Lock, Sparkles, Star } from 'lucide-react';

type Period = 'mensuel' | '6mois' | 'annuel';

const FEATURES = [
  'Sara — agent IA WhatsApp disponible 24h/24, 7j/7',
  'Tableau de bord vendeur dédié sur la plateforme',
  'Chargement et vente de tes terrains gratuitement',
  'Support client 7j/7',
  'Contrôle et suivi complet de tes ventes',
  'Qualification automatique des prospects',
  'Envoi automatique des fiches et photos',
];

const PERIODS: { key: Period; label: string; discount: string | null }[] = [
  { key: 'mensuel', label: 'Mensuel', discount: null },
  { key: '6mois', label: '6 mois', discount: '-10%' },
  { key: 'annuel', label: 'Annuel', discount: '-20%' },
];

type PriceInfo = {
  monthly_fcfa: number;
  monthly_eur: number;
  billing: string;
  save: string | null;
  save_fcfa: number;
};

const PRICES: Record<Period, PriceInfo> = {
  mensuel: {
    monthly_fcfa: 50_000,
    monthly_eur: 76,
    billing: 'facturé mensuellement',
    save: null,
    save_fcfa: 0,
  },
  '6mois': {
    monthly_fcfa: 45_000,
    monthly_eur: 69,
    billing: 'facturé 270 000 FCFA tous les 6 mois',
    save: '-10%',
    save_fcfa: 5_000,
  },
  annuel: {
    monthly_fcfa: 40_000,
    monthly_eur: 61,
    billing: 'facturé 480 000 FCFA par an',
    save: '-20%',
    save_fcfa: 10_000,
  },
};

export default function PricingCards() {
  const [period, setPeriod] = useState<Period>('annuel');
  const price = PRICES[period];

  return (
    <div className="pricing-cards">

      {/* ── Offre 1 : Essai gratuit ── */}
      <div className="price-card price-card--free">
        <div className="price-card-inner">
          <span className="price-badge">
            <Sparkles size={13} /> Essai gratuit
          </span>
          <p className="price-name">Mise en service uniquement</p>
          <p className="price-tagline">Démarre sans abonnement — Sara et la plateforme offerts.</p>

          <div className="price-amount">
            <span className="num">0</span>
            <span className="unit">FCFA / mois</span>
          </div>
          <p className="price-eur">Accès mensuel offert</p>

          <div className="price-setup">
            <span className="lbl">
              Mise en service
              <small>Frais d&apos;installation unique</small>
            </span>
            <span className="amt">
              100&nbsp;000 FCFA
              <small>≈ 152&nbsp;€ · une seule fois</small>
            </span>
          </div>

          <ul className="card-features">
            {FEATURES.map((f, i) => (
              <li key={i}>
                <span className="tick"><Check size={13} strokeWidth={3} /></span>
                {f}
              </li>
            ))}
          </ul>

          <Link className="btn btn-outline btn-lg" href="/sara/paiement?plan=essai">
            Commencer l&apos;essai <ArrowRight size={17} className="arr" />
          </Link>

          <p className="price-note">
            <Info size={14} />
            Sans abonnement mensuel. Tu accèdes à Sara et au tableau de bord dès la mise en service.
          </p>
        </div>
      </div>

      {/* ── Offre 2 : Tout compris ── */}
      <div className="price-card price-card--pro">
        <div className="price-card-inner">
          <span className="price-badge price-badge--pro">
            <Star size={13} /> Tout compris · Recommandé
          </span>
          <p className="price-name">Abonnement Sara</p>
          <p className="price-tagline">Engage-toi maintenant — ton prix reste fixe pendant 2 ans.</p>

          {/* Sélecteur de période */}
          <div className="period-tabs">
            {PERIODS.map((p) => (
              <button
                key={p.key}
                type="button"
                className={`period-tab${period === p.key ? ' active' : ''}`}
                onClick={() => setPeriod(p.key)}
              >
                <span>{p.label}</span>
                {p.discount && <span className="period-badge">{p.discount}</span>}
              </button>
            ))}
          </div>

          <div className="price-amount">
            <span className="num">{price.monthly_fcfa.toLocaleString('fr-FR')}</span>
            <span className="unit">FCFA / mois</span>
          </div>
          <p className="price-eur">≈ {price.monthly_eur}&nbsp;€ / mois · {price.billing}</p>

          {price.save && (
            <p className="price-save">
              Tu économises {price.save_fcfa.toLocaleString('fr-FR')}&nbsp;FCFA/mois vs mensuel ({price.save})
            </p>
          )}

          <div className="price-setup">
            <span className="lbl">
              Mise en service
              <small>Frais d&apos;installation unique</small>
            </span>
            <span className="amt">
              100&nbsp;000 FCFA
              <small>≈ 152&nbsp;€ · une seule fois</small>
            </span>
          </div>

          <div className="price-lock">
            <Lock size={15} />
            <span>
              <strong>Prix garanti 2 ans</strong> — si nos tarifs augmentent,
              tu restes au prix d&apos;aujourd&apos;hui pendant 2 ans.
            </span>
          </div>

          <ul className="card-features">
            {FEATURES.map((f, i) => (
              <li key={i}>
                <span className="tick tick--inv"><Check size={13} strokeWidth={3} /></span>
                {f}
              </li>
            ))}
          </ul>

          <Link
            className="btn btn-inv btn-lg"
            href={`/sara/paiement?plan=pro&period=${period}`}
          >
            Activer Sara <ArrowRight size={17} className="arr" />
          </Link>
          <Link className="secondary secondary--inv" href="/#contact">
            Parler à un conseiller d&apos;abord
          </Link>

          <p className="price-note price-note--inv">
            <Info size={14} />
            Après ta commande, notre équipe te contacte sous 24&nbsp;h pour la mise en service sur
            ton numéro WhatsApp officiel.
          </p>
        </div>
      </div>

    </div>
  );
}
