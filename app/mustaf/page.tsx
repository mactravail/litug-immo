import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight, Check, ShieldCheck, Lock, Layers, ReceiptText, UserCheck, Users,
  FileCheck2, FileText, Wallet, HardHat, Smartphone, Star, Building2, Eye,
} from 'lucide-react';
import '../landing.css';
import './pricing.css';
import SiteHeader from '../components/SiteHeader';
import FaqPanel from './FaqPanel';
import FeesSimulator from './FeesSimulator';
import { TIERS, COMMON_FEATURES, PHASE_ZERO_FEE, DASHBOARD_FEE, DASHBOARD_FEE_EUR, SIM_DEFAULT } from './offers';
import { formatFcfa, formatEur } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Mustaf — Construisez au pays en toute sérénité | Litug',
  description:
    "Mustaf gère votre chantier au Sénégal et vous montre chaque franc dépensé et chaque étape, en photo, depuis votre téléphone. Argent bloqué chez un tiers de confiance, inspecteur indépendant, paiement par phase.",
};

const PILLARS = [
  {
    Icon: Lock,
    title: 'Votre argent n’est jamais chez nous',
    desc: 'Il est bloqué chez un tiers de confiance (notaire ou banque partenaire), sur un compte dédié à votre seul projet. Litug ne le touche jamais.',
  },
  {
    Icon: Layers,
    title: 'On ne commence jamais ce qu’on ne peut pas finir',
    desc: 'Une étape ne démarre que lorsqu’elle est entièrement financée. Fini les chantiers abandonnés à moitié.',
  },
  {
    Icon: ReceiptText,
    title: 'Vous voyez chaque franc',
    desc: 'Ciment, fer, sable, main-d’œuvre, notre commission : chaque dépense est détaillée, avec sa facture. Zéro marge sur les matériaux — toute l’économie vous revient.',
  },
  {
    Icon: UserCheck,
    title: 'Un inspecteur indépendant vérifie tout',
    desc: 'Avant chaque paiement, et avant chaque coulage de béton. Celui qui dépense l’argent n’est jamais celui qui valide le travail.',
  },
  {
    Icon: Users,
    title: 'Toute la famille peut participer',
    desc: 'Plusieurs proches peuvent cotiser sur le même projet ; chaque versement est visible et la participation de chacun est affichée.',
  },
];

const STEPS = [
  { num: '01', Icon: FileCheck2, title: 'On prépare votre projet (Phase 0)', desc: 'Plan d’architecte, dossier de permis, étude de sol. Un forfait fixe payé une fois au départ.' },
  { num: '02', Icon: Wallet,     title: 'Vous épargnez à votre rythme', desc: 'Comme une tontine, quand vous voulez, sur votre compte séquestre dédié chez le tiers de confiance.' },
  { num: '03', Icon: HardHat,    title: 'On construit, étape par étape', desc: 'Chaque phase démarre une fois financée ; on achète les matériaux au prix de gros et on coordonne les artisans.' },
  { num: '04', Icon: Smartphone, title: 'Vous suivez tout depuis votre téléphone', desc: 'Photos géolocalisées et datées, dépenses détaillées, avancement — en temps réel.' },
];

export default function MustafProductPage() {
  return (
    <div className="landing-root">
      <SiteHeader cta={{ label: 'Démarrer mon projet', href: '/mustaf#offres' }} />

      {/* ── Hero ──────────────────────────────────────────────── */}
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
            Construisez votre maison au pays,<br />
            <span className="mustaf-accent">en toute sérénité.</span>
          </h1>
          <p className="mustaf-hero-sub">
            Mustaf gère votre chantier de A à Z et vous montre chaque franc dépensé et chaque étape,
            en photo, depuis votre téléphone — où que vous soyez.
          </p>
          <div className="mustaf-hero-ctas">
            <Link className="btn btn-primary btn-lg" href="/mustaf#offres">
              Démarrer mon projet <ArrowRight size={17} className="arr" />
            </Link>
            <a className="btn btn-ghost btn-lg" href="#offres">Voir les offres</a>
          </div>
        </div>
      </header>

      {/* ── Le problème ───────────────────────────────────────── */}
      <section className="section mustaf-problem">
        <div className="wrap mustaf-problem-inner">
          <span className="eyebrow">La vraie peur</span>
          <p className="mustaf-problem-text">
            Vous envoyez de l’argent au pays pour construire, et de loin, impossible de surveiller.
            L’argent s’évapore, les matériaux disparaissent, le chantier s’arrête à moitié.
          </p>
          <p className="mustaf-problem-tag">Mustaf est né pour ça.</p>
        </div>
      </section>

      {/* ── Piliers de confiance ──────────────────────────────── */}
      <section className="section mustaf-pillars-sec">
        <div className="wrap">
          <div className="mustaf-pricing-head">
            <span className="eyebrow">Comment Mustaf vous protège</span>
            <h2 className="section-title">Le vol devient presque impossible</h2>
            <p className="section-sub">
              Pas une promesse magique : des mécanismes concrets, vérifiables, visibles depuis votre téléphone.
            </p>
          </div>
          <div className="mustaf-pillars">
            {PILLARS.map(({ Icon, title, desc }, i) => (
              <article key={i} className="mustaf-pillar">
                <div className="mustaf-pillar-icon"><Icon size={20} /></div>
                <h3 className="mustaf-pillar-title">{title}</h3>
                <p className="mustaf-pillar-desc">{desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Comment ça marche ─────────────────────────────────── */}
      <section className="section on-ink mustaf-how" id="how-it-works">
        <div className="hero-bg">
          <div className="glow g1" style={{ opacity: 0.22 }}></div>
          <div className="glow g2" style={{ opacity: 0.28 }}></div>
        </div>
        <div className="wrap">
          <div className="mustaf-how-head">
            <span className="eyebrow">Le parcours</span>
            <h2 className="section-title">Comment ça marche ?</h2>
            <p className="section-sub">Quatre étapes claires, du premier plan aux clés en main.</p>
          </div>
          <div className="mustaf-steps-grid mustaf-steps-4">
            {STEPS.map(({ num, Icon, title, desc }, i) => (
              <div key={i} className="mustaf-step">
                <div className="step-top">
                  <span className="step-num">{num}</span>
                  <div className="step-icon-wrap"><Icon size={20} /></div>
                </div>
                <h4 className="step-title">{title}</h4>
                <p className="step-desc">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Les 3 offres ──────────────────────────────────────── */}
      <section className="section mustaf-pricing-sec" id="offres">
        <div className="wrap">
          <div className="mustaf-pricing-head">
            <span className="eyebrow">Abonnement Mustaf</span>
            <h2 className="section-title">Choisissez votre niveau de sérénité</h2>
            <p className="section-sub">
              Nos honoraires sont un pourcentage de votre budget, étalé sur les phases — pas un forfait payé d’avance.
            </p>
          </div>

          {/* Socle commun */}
          <div className="mustaf-socle">
            <p className="mustaf-socle-title">
              <ShieldCheck size={16} /> Toutes les offres incluent
            </p>
            <ul className="mustaf-socle-list">
              {COMMON_FEATURES.map((f, i) => (
                <li key={i}><span className="plan-tick"><Check size={12} strokeWidth={2.8} /></span>{f}</li>
              ))}
            </ul>
          </div>

          {/* Forfait Phase 0 */}
          <div className="mustaf-phase0">
            <div>
              <p className="mustaf-phase0-label">Phase 0 — plan d’architecte + permis + étude de sol</p>
              <p className="mustaf-phase0-note">Forfait fixe, payé une fois au départ, séparé du pourcentage.</p>
              <ul className="mustaf-phase0-list">
                <li><span className="plan-tick"><FileText size={12} strokeWidth={2.8} /></span>Plan d’architecte conçu selon votre terrain et votre budget</li>
                <li><span className="plan-tick"><FileCheck2 size={12} strokeWidth={2.8} /></span>Montage et dépôt du dossier de permis de construire</li>
                <li><span className="plan-tick"><Layers size={12} strokeWidth={2.8} /></span>Étude de sol pour dimensionner les fondations sans surprise</li>
              </ul>
            </div>
            <div className="mustaf-phase0-price">
              <span>{formatFcfa(PHASE_ZERO_FEE)}</span>
              <small>≈ {formatEur(PHASE_ZERO_FEE)}</small>
            </div>
          </div>

          {/* Contre-offre : pas besoin de la Phase 0 */}
          <div className="mustaf-phase0 mustaf-phase0-alt">
            <div>
              <p className="mustaf-phase0-label">Vous avez déjà ces papiers ?</p>
              <p className="mustaf-phase0-note">
                Pas besoin de la Phase 0 : accédez directement au tableau de bord. Les {DASHBOARD_FEE_EUR} €
                couvrent l’étude de votre dossier par notre équipe et la création de votre espace
                personnel — hors abonnement de gestion (8 à 16 % selon le palier choisi).
              </p>
            </div>
            <div className="mustaf-phase0-price">
              <span>{DASHBOARD_FEE_EUR} €</span>
              <small>≈ {formatFcfa(DASHBOARD_FEE)}</small>
            </div>
          </div>

          {/* Cartes offres */}
          <div className="mustaf-pricing-grid" id="mustaf-plans">
            {TIERS.map((tier) => {
              const example = Math.round((SIM_DEFAULT * tier.pct) / 100);
              return (
                <article key={tier.id} className={`mustaf-plan-card${tier.featured ? ' featured' : ''}`}>
                  {tier.badge && <div className="mustaf-plan-badge">{tier.badge}</div>}

                  <div className="mustaf-plan-header">
                    <h3 className="mustaf-plan-name">{tier.name}</h3>
                    <p className="mustaf-plan-tagline">{tier.forWhom}</p>
                  </div>

                  <div className="mustaf-plan-price">
                    <div className="price-row">
                      <span className="price-num">{tier.pct} %</span>
                      <span className="price-unit">du budget<br />de construction</span>
                    </div>
                    <div className="mustaf-plan-example">
                      Ex. : sur {formatFcfa(SIM_DEFAULT)} → <strong>{formatFcfa(example)}</strong> d’honoraires
                    </div>
                  </div>

                  <Link
                    href={`/mustaf/demarrer/paiement?tier=${tier.id}`}
                    className={`btn btn-lg${tier.featured ? ' btn-gold' : ' btn-primary'}`}
                  >
                    Démarrer mon projet <ArrowRight size={16} className="arr" />
                  </Link>

                  {tier.inherits && <p className="mustaf-plan-inherits">{tier.inherits}</p>}
                  <ul className="mustaf-plan-features">
                    {tier.features.map((f, j) => (
                      <li key={j}><span className="plan-tick"><Check size={12} strokeWidth={2.8} /></span>{f}</li>
                    ))}
                  </ul>

                  <div className="mustaf-plan-ideal">
                    <Star size={12} />
                    {tier.forWhom}
                  </div>
                </article>
              );
            })}
          </div>

          {/* Simulateur */}
          <div className="mustaf-sim-wrap">
            <FeesSimulator />
          </div>

          {/* Cadrage du prix */}
          <p className="mustaf-price-frame">
            Vous engagez plusieurs millions dans votre maison. Nos honoraires garantissent que chaque franc
            y va vraiment — et que vous le voyez, à chaque étape.
          </p>

          {/* FAQ */}
          <div className="mustaf-faq-row">
            <FaqPanel />
          </div>
        </div>
      </section>

      {/* ── Bande transparence ────────────────────────────────── */}
      <section className="section on-ink mustaf-transparency">
        <div className="wrap mustaf-transparency-inner">
          <div className="mustaf-transparency-item">
            <Lock size={20} /><p>Votre argent n’est jamais sur nos comptes.</p>
          </div>
          <div className="mustaf-transparency-item">
            <Building2 size={20} /><p>Zéro marge sur les matériaux.</p>
          </div>
          <div className="mustaf-transparency-item">
            <Eye size={20} /><p>Chaque dépense, chaque photo, datée et tracée.</p>
          </div>
        </div>
      </section>

      {/* ── CTA final ─────────────────────────────────────────── */}
      <section className="section mustaf-cta-band">
        <div className="wrap mustaf-cta-inner">
          <div className="mustaf-cta-text">
            <h2>Prêt à construire votre maison ?</h2>
            <p>Rejoignez les familles de la diaspora qui bâtissent au pays, en toute confiance.</p>
          </div>
          <div className="mustaf-cta-btns">
            <Link className="btn btn-primary btn-lg" href="/mustaf#offres">
              Démarrer mon projet <ArrowRight size={17} className="arr" />
            </Link>
            <Link className="btn btn-ghost btn-lg" href="/#contact">Parler à l’équipe</Link>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="offer-foot">
        <p>
          <ShieldCheck size={15} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 6, color: 'var(--green)' }} />
          Argent bloqué chez un tiers de confiance · Inspecteur indépendant · Paiement par phase
        </p>
        <p style={{ marginTop: 10 }}>
          <Link href="/">← Retour à l’accueil</Link>
        </p>
      </footer>
    </div>
  );
}
