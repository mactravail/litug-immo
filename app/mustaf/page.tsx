import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Check,
  ArrowRight,
  Lightbulb,
  Compass,
  HardHat,
  Key,
  MessageSquare,
  Star,
  Building2,
  ShieldCheck,
} from 'lucide-react';
import '../landing.css';
import './pricing.css';
import FaqPanel from './FaqPanel';

export const metadata: Metadata = {
  title: 'Mustaf — Du terrain à la maison | Litug',
  description:
    "Mustaf accompagne les propriétaires de terrain de la première idée jusqu'à la livraison. Concepts AI, architectes, suivi de chantier.",
};

const PLANS = [
  {
    name: 'Mustaf Starter',
    tagline: 'Visualise ton futur avant de construire.',
    price: '19 000',
    priceNote: '≈ 29€ / mois',
    cta: 'Commencer',
    ctaHref: '/#contact',
    featured: false,
    badge: null as string | null,
    features: [
      'Assistant AI Mustaf',
      'Questions personnalisées sur le projet',
      'Génération de concepts de maisons',
      'Maquettes AI',
      'Styles : africain, moderne, européen',
      'Estimation basique du projet',
    ],
    ideal: 'Pour explorer des idées avant de s\'engager.',
  },
  {
    name: 'Mustaf Build',
    tagline: 'Passe de l\'idée au vrai projet.',
    price: '49 000',
    priceNote: '≈ 75€ / mois',
    cta: 'Construire mon projet',
    ctaHref: '/#contact',
    featured: true,
    badge: 'Le plus populaire',
    features: [
      'Tout ce qui est dans Starter',
      'Mise en relation architectes',
      'Pré-plans personnalisés',
      'Conseils construction',
      'Support projet dédié',
      'Réseau d\'architectes sénégalais et italiens',
      'Estimation précise du projet',
    ],
    ideal: 'Pour ceux qui veulent réellement construire.',
  },
  {
    name: 'Mustaf Complete',
    tagline: 'Du terrain à la maison terminée.',
    price: null as string | null,
    priceLabel: 'Sur devis',
    priceNote: 'Accompagnement sur mesure',
    cta: 'Parler à un expert',
    ctaHref: '/#contact',
    featured: false,
    badge: 'Diaspora & grands projets',
    features: [
      'Tout ce qui est dans Build',
      'Accompagnement chantier complet',
      'Ingénieurs & techniciens',
      'Visites chantier à distance',
      'Vidéos et appels réguliers',
      'Accompagnement jusqu\'à la livraison',
      'Accès partenaires mobilier',
      'Carrelage, luminaires, meubles',
    ],
    ideal: 'Pour la diaspora et les grands projets clés en main.',
  },
];

const STEPS = [
  {
    num: '01',
    Icon: MessageSquare,
    title: 'Décris ton terrain et ton projet',
    desc: 'Mustaf t\'écoute : zone, superficie, style souhaité, budget. Tout commence par une conversation.',
  },
  {
    num: '02',
    Icon: Lightbulb,
    title: 'Mustaf génère idées et concepts',
    desc: 'L\'assistant AI crée des maquettes visuelles et des concepts 3D adaptés à ton terrain et à tes goûts.',
  },
  {
    num: '03',
    Icon: Compass,
    title: 'Les architectes créent le projet',
    desc: 'Notre réseau d\'architectes sénégalais et italiens transforme les concepts en plans réels et études techniques.',
  },
  {
    num: '04',
    Icon: HardHat,
    title: 'Construction et accompagnement',
    desc: 'Le chantier démarre avec un suivi rigoureux : visites régulières, appels, rapports photo par notre géomètre.',
  },
  {
    num: '05',
    Icon: Key,
    title: 'Maison terminée',
    desc: 'Tu reçois les clés de ta maison. Construite selon tes choix, dans les délais et sans mauvaises surprises.',
  },
];

export default function MustafPricingPage() {
  return (
    <div className="landing-root">

      {/* ── Nav ─────────────────────────────────────────────────── */}
      <nav className="mustaf-nav">
        <Link className="brand" href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Litug" />
        </Link>
        <div className="mustaf-nav-right">
          <Link className="btn btn-ghost" href="/login">Se connecter</Link>
          <Link className="btn btn-primary" href="/#contact">
            Parler à Mustaf <ArrowRight size={16} className="arr" />
          </Link>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────── */}
      <header className="mustaf-hero">
        <div className="hero-bg">
          <div className="hero-grid-tex"></div>
          <div className="glow g1"></div>
          <div className="glow g2"></div>
        </div>
        <div className="wrap mustaf-hero-inner">
          <div className="mustaf-hero-badge">
            <Building2 size={14} />
            Assistant construction · Architecture · Suivi de chantier
          </div>
          <h1>
            Construire une maison<br />
            ne devrait pas être{' '}
            <span className="mustaf-accent">compliqué.</span>
          </h1>
          <p className="mustaf-hero-sub">
            Mustaf transforme ton terrain en projet concret — de la première idée aux clés en main.
          </p>
          <div className="mustaf-hero-ctas">
            <a className="btn btn-gold btn-lg" href="#pricing">
              Voir les plans <ArrowRight size={17} className="arr" />
            </a>
            <a className="btn btn-ghost btn-lg" href="#how-it-works">
              Comment ça marche
            </a>
          </div>
        </div>
      </header>

      {/* ── Pricing ─────────────────────────────────────────────── */}
      <section className="section mustaf-pricing-sec" id="pricing">
        <div className="wrap">
          <div className="mustaf-pricing-head">
            <span className="eyebrow">Abonnement Mustaf</span>
            <h2 className="section-title">Un plan adapté à chaque étape</h2>
            <p className="section-sub">
              Que tu veuilles explorer des idées ou construire clés en main, Mustaf t&apos;accompagne.
            </p>
          </div>

          <div className="mustaf-pricing-grid" id="mustaf-plans">
            {PLANS.map((plan, i) => (
              <article
                key={i}
                className={`mustaf-plan-card${plan.featured ? ' featured' : ''}`}
              >
                {plan.badge && (
                  <div className="mustaf-plan-badge">{plan.badge}</div>
                )}

                <div className="mustaf-plan-header">
                  <h3 className="mustaf-plan-name">{plan.name}</h3>
                  <p className="mustaf-plan-tagline">{plan.tagline}</p>
                </div>

                <div className="mustaf-plan-price">
                  {plan.price ? (
                    <div className="price-row">
                      <span className="price-num">{plan.price}</span>
                      <span className="price-unit">FCFA<br />/mois</span>
                    </div>
                  ) : (
                    <div className="price-row">
                      <span className="price-custom">{(plan as typeof plan & { priceLabel: string }).priceLabel}</span>
                    </div>
                  )}
                  <div className="price-note-small">{plan.priceNote}</div>
                </div>

                <a
                  href={plan.ctaHref}
                  className={`btn btn-lg${plan.featured ? ' btn-gold' : ' btn-primary'}`}
                >
                  {plan.cta} <ArrowRight size={16} className="arr" />
                </a>

                <ul className="mustaf-plan-features">
                  {plan.features.map((f, j) => (
                    <li key={j}>
                      <span className="plan-tick">
                        <Check size={12} strokeWidth={2.8} />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>

                <div className="mustaf-plan-ideal">
                  <Star size={12} />
                  {plan.ideal}
                </div>
              </article>
            ))}
          </div>

          {/* FAQ trigger — centré sous les cartes */}
          <div className="mustaf-faq-row">
            <FaqPanel />
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────── */}
      <section className="section on-ink mustaf-how" id="how-it-works">
        <div className="hero-bg">
          <div className="glow g1" style={{ opacity: 0.22 }}></div>
          <div className="glow g2" style={{ opacity: 0.28 }}></div>
        </div>
        <div className="wrap">
          <div className="mustaf-how-head">
            <span className="eyebrow">Processus</span>
            <h2 className="section-title">Comment fonctionne Mustaf ?</h2>
            <p className="section-sub">
              Cinq étapes claires, du premier message aux clés en main.
            </p>
          </div>

          <div className="mustaf-steps-grid">
            {STEPS.map(({ num, Icon, title, desc }, i) => (
              <div key={i} className="mustaf-step">
                <div className="step-top">
                  <span className="step-num">{num}</span>
                  <div className="step-icon-wrap">
                    <Icon size={20} />
                  </div>
                </div>
                <h4 className="step-title">{title}</h4>
                <p className="step-desc">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA band ────────────────────────────────────────────── */}
      <section className="section mustaf-cta-band">
        <div className="wrap mustaf-cta-inner">
          <div className="mustaf-cta-text">
            <h2>Prêt à construire ta maison ?</h2>
            <p>Rejoins les propriétaires qui ont transformé leur terrain avec Mustaf.</p>
          </div>
          <div className="mustaf-cta-btns">
            <a className="btn btn-primary btn-lg" href="#pricing">
              Voir les plans <ArrowRight size={17} className="arr" />
            </a>
            <Link className="btn btn-ghost btn-lg" href="/#contact">
              Parler à l&apos;équipe
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="offer-foot">
        <p>
          <ShieldCheck
            size={15}
            style={{ display: 'inline', verticalAlign: '-2px', marginRight: 6, color: 'var(--green)' }}
          />
          Architectes certifiés · Géomètre agréé · Paiement par étapes de chantier
        </p>
        <p style={{ marginTop: 10 }}>
          <Link href="/">← Retour à l&apos;accueil</Link>
        </p>
      </footer>

    </div>
  );
}
