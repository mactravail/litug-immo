import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  Check,
  MessageCircle,
  Clock,
  Filter,
  Send,
  BarChart3,
  Users,
  ShieldCheck,
  Zap,
  Lock,
  Layers,
  ReceiptText,
  UserCheck,
  Smartphone,
} from 'lucide-react';
import '../landing.css';
import './products.css';
import SiteHeader from '../components/SiteHeader';

export const metadata: Metadata = {
  title: 'Nos produits — Sara & Mustaf | Litug',
  description:
    "Sara automatise tes ventes immobilières sur WhatsApp. Mustaf accompagne la construction de ta maison. Deux outils, un seul objectif.",
};

const SARA_FEATURES = [
  { Icon: Clock,         text: 'Répond automatiquement à chaque message, 24h/24, 7j/7' },
  { Icon: Filter,        text: 'Qualifie les prospects : budget, zone, superficie, type de terrain' },
  { Icon: Send,          text: 'Envoie photos et fiches terrain automatiquement' },
  { Icon: Users,         text: 'Ne te transfère que les acheteurs sérieux' },
  { Icon: BarChart3,     text: 'Tableau de bord vendeur : terrains, clients, visites' },
  { Icon: MessageCircle, text: 'API WhatsApp Business officielle — zéro risque de bannissement' },
];

const MUSTAF_FEATURES = [
  { Icon: Lock,        text: 'Votre argent bloqué chez un tiers de confiance — jamais chez nous' },
  { Icon: Layers,      text: 'Une phase ne démarre que lorsqu\'elle est entièrement financée' },
  { Icon: ReceiptText, text: 'Chaque dépense détaillée avec sa facture — zéro marge sur les matériaux' },
  { Icon: UserCheck,   text: 'Inspecteur indépendant : il vérifie avant chaque paiement' },
  { Icon: Smartphone,  text: 'Photos géolocalisées et datées, suivies depuis votre téléphone' },
  { Icon: Users,       text: 'Toute la famille peut cotiser — la participation de chacun est visible' },
];

const SARA_CHAT = [
  { side: 'them', text: 'Bonjour, je cherche un terrain à Saly 🌴' },
  { side: 'sara', text: 'Bonjour 👋 Quel est votre budget approximatif ?' },
  { side: 'them', text: 'Autour de 25 millions FCFA' },
  { side: 'sara', text: 'Superficie souhaitée ? Bord de mer si possible ?' },
  { side: 'them', text: '500 m², oui si possible' },
  { side: 'sara', text: "J'ai 2 terrains qui correspondent. Je vous envoie les fiches 📍" },
];

export default function ProduitsPage() {
  return (
    <div className="landing-root">

      {/* ── Nav ──────────────────────────────────────────────── */}
      <SiteHeader cta={{ label: 'Commencer', href: '/#contact' }} />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <header className="prod-hero">
        <div className="wrap prod-hero-inner">
          <span className="eyebrow">Nos produits</span>
          <h1>
            Deux outils.<br />
            <span className="prod-accent">Un seul objectif.</span>
          </h1>
          <p className="prod-hero-sub">
            Sara automatise tes ventes immobilières sur WhatsApp.
            Mustaf accompagne la construction de ta maison.
            Ensemble, ils couvrent tout le parcours immobilier sénégalais.
          </p>
          <div className="prod-hero-pills">
            <a href="#sara"   className="prod-pill sara-pill">Sara — Vendeurs</a>
            <a href="#mustaf" className="prod-pill mustaf-pill">Mustaf — Construction</a>
          </div>
        </div>
      </header>

      {/* ── Sara ─────────────────────────────────────────────── */}
      <section className="prod-section prod-sara on-ink" id="sara">
        <div className="hero-bg">
          <div className="hero-grid-tex"></div>
          <div className="glow g1"></div>
          <div className="glow g2" style={{ opacity: 0.3 }}></div>
        </div>
        <div className="wrap prod-section-inner">

          {/* Texte */}
          <div className="prod-text">
            <div className="prod-product-badge sara-badge">
              <Zap size={13} />
              Agent IA WhatsApp · Vendeurs &amp; Promoteurs
            </div>
            <h2>
              <span className="prod-name-sara">Sara</span>
              <br />Ton commercial qui ne dort jamais
            </h2>
            <p className="prod-desc">
              Sara est un agent IA branché sur ton numéro WhatsApp Business officiel.
              Elle répond à chaque client entrant, qualifie ses besoins et ne te transfère
              que les prospects sérieux — pendant que tu te concentres sur la vente.
            </p>
            <ul className="prod-features">
              {SARA_FEATURES.map(({ Icon, text }, i) => (
                <li key={i}>
                  <span className="prod-tick">
                    <Icon size={13} strokeWidth={2.2} />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
            <div className="prod-price-hint">
              À partir de <strong>50 000 FCFA</strong> / mois&ensp;·&ensp;≈ 76 €
            </div>
            <div className="prod-ctas">
              <Link className="btn btn-gold btn-lg" href="/sara">
                Activer Sara <ArrowRight size={17} className="arr" />
              </Link>
              <a className="btn btn-ghost btn-lg prod-ghost-light" href="/sara#faq">
                Questions fréquentes
              </a>
            </div>
          </div>

          {/* Visual — téléphone statique */}
          <div className="prod-visual">
            <div className="phone prod-phone">
              <div className="phone-screen">
                <div className="wa-head">
                  <div className="av">S</div>
                  <div className="meta">
                    <b>Sara · Litug</b>
                    <small>en ligne</small>
                  </div>
                </div>
                <div className="wa-body prod-wa-body">
                  {SARA_CHAT.map((m, i) => (
                    <div
                      key={i}
                      className={`bubble ${m.side === 'sara' ? 'sara' : 'them'}`}
                      style={{ animationDelay: `${i * 0.12}s` }}
                    >
                      {m.side === 'sara' && <span className="sara-tag">Sara AI</span>}
                      {m.text}
                      {m.side === 'sara' && <small>✓✓</small>}
                    </div>
                  ))}
                  <div className="prod-qualified-chip">
                    <Check size={12} strokeWidth={2.5} />
                    Prospect qualifié · Transfert vendeur
                  </div>
                </div>
                <div className="wa-foot">
                  <div className="inp">Écrire un message…</div>
                  <div className="snd">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            {/* floating badges */}
            <div className="prod-float pf1">
              <span className="pf-ic"><Clock size={14} /></span>
              <div><b>Réponse &lt; 1 sec</b><small>disponible 24/7</small></div>
            </div>
            <div className="prod-float pf2">
              <span className="pf-ic"><Check size={14} /></span>
              <div><b>Prospect qualifié</b><small>budget · zone · m²</small></div>
            </div>
          </div>

        </div>
      </section>

      {/* ── Mustaf ───────────────────────────────────────────── */}
      <section className="prod-section prod-mustaf" id="mustaf">
        <div className="wrap prod-section-inner prod-reverse">

          {/* Visual — blueprint */}
          <div className="prod-visual prod-visual-mustaf">
            <div className="blueprint">
              <div className="grid-lines"></div>
              <div className="plan">
                <div className="room lbl" data-l="SÉJOUR"  style={{ left: 0,    top: 0,    width: '58%', height: '52%' }}></div>
                <div className="room lbl" data-l="CUISINE" style={{ right: 0,   top: 0,    width: '38%', height: '30%' }}></div>
                <div className="room lbl" data-l="CH. 1"   style={{ left: 0,    bottom: 0, width: '44%', height: '42%' }}></div>
                <div className="room lbl" data-l="CH. 2"   style={{ right: 0,   bottom: 0, width: '52%', height: '62%' }}></div>
                <div className="dim" style={{ top: '-22px', left: '0' }}>12.4 m</div>
                <div className="dim" style={{ right: '-8px', top: '44%', transform: 'rotate(90deg)' }}>9.8 m</div>
              </div>
              <div className="bp-badge">
                <div className="stp"><i></i><i></i><i></i><i className="off"></i></div>
                <span>Plan → Étude → Chantier → Livraison</span>
              </div>
            </div>
            {/* Cartes confiance flottantes */}
            <div className="prod-float mustaf-f1">
              <span className="pf-ic mustaf-ic"><Lock size={14} /></span>
              <div><b>Argent séquestré</b><small>tiers de confiance</small></div>
            </div>
            <div className="prod-float mustaf-f2">
              <span className="pf-ic mustaf-ic"><UserCheck size={14} /></span>
              <div><b>Inspecteur indépendant</b><small>vérifie avant paiement</small></div>
            </div>
          </div>

          {/* Texte */}
          <div className="prod-text">
            <div className="prod-product-badge mustaf-badge">
              <ShieldCheck size={13} />
              Tiers de confiance · Construction · Diaspora
            </div>
            <h2>
              <span className="prod-name-mustaf">Mustaf</span>
              <br />Construire au pays, sans se faire voler
            </h2>
            <p className="prod-desc">
              Vous envoyez de l'argent au pays pour construire, et de loin, impossible de surveiller.
              Mustaf gère votre chantier de A à Z et vous montre chaque franc dépensé et chaque étape,
              en photo, depuis votre téléphone — l'argent reste bloqué chez un tiers de confiance.
            </p>
            <ul className="prod-features prod-features-mustaf">
              {MUSTAF_FEATURES.map(({ Icon, text }, i) => (
                <li key={i}>
                  <span className="prod-tick prod-tick-gold">
                    <Icon size={13} strokeWidth={2.2} />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
            <div className="prod-price-hint mustaf-price-hint">
              Honoraires dès <strong>8 %</strong> du budget&ensp;·&ensp;Phase 0 forfait <strong>500 000 FCFA</strong> (≈ 762 €)
            </div>
            <div className="prod-ctas">
              <Link className="btn btn-primary btn-lg" href="/mustaf">
                Démarrer avec Mustaf <ArrowRight size={17} className="arr" />
              </Link>
              <a className="btn btn-ghost btn-lg" href="/mustaf#offres">
                Voir les offres
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* ── Comparaison / Choix ───────────────────────────────── */}
      <section className="prod-choice section on-ink" id="choix">
        <div className="hero-bg">
          <div className="glow g1" style={{ opacity: 0.18 }}></div>
          <div className="glow g2" style={{ opacity: 0.22 }}></div>
        </div>
        <div className="wrap">
          <div className="prod-choice-head">
            <span className="eyebrow">Quel produit vous convient ?</span>
            <h2 className="section-title">Choisissez votre parcours</h2>
            <p className="section-sub">
              Les deux produits sont complémentaires. Certains clients utilisent les deux.
            </p>
          </div>
          <div className="prod-choice-grid">

            {/* Sara card */}
            <div className="prod-choice-card">
              <div className="pcc-top">
                <div className="pcc-dot sara-dot"></div>
                <span className="pcc-tag">Sara</span>
              </div>
              <h3>Tu vends des terrains</h3>
              <p>Tu reçois des messages WhatsApp tous les jours et tu perds du temps à répondre aux mêmes questions.</p>
              <ul>
                <li><Check size={14} /> Vendeurs individuels</li>
                <li><Check size={14} /> Agents immobiliers</li>
                <li><Check size={14} /> Promoteurs fonciers</li>
              </ul>
              <Link className="btn btn-primary pcc-btn" href="/sara">
                Activer Sara <ArrowRight size={15} className="arr" />
              </Link>
            </div>

            {/* Divider */}
            <div className="pcc-divider">
              <span>ou</span>
            </div>

            {/* Mustaf card */}
            <div className="prod-choice-card mustaf-choice">
              <div className="pcc-top">
                <div className="pcc-dot mustaf-dot"></div>
                <span className="pcc-tag">Mustaf</span>
              </div>
              <h3>Tu veux construire ta maison</h3>
              <p>Tu possèdes un terrain et tu veux bâtir au pays — mais de loin, tu as peur que l&apos;argent s&apos;évapore et que le chantier s&apos;arrête à moitié.</p>
              <ul>
                <li><Check size={14} /> Propriétaires de terrain</li>
                <li><Check size={14} /> Diaspora sénégalaise</li>
                <li><Check size={14} /> Porteurs de projet maison</li>
              </ul>
              <Link className="btn btn-gold pcc-btn" href="/mustaf">
                Démarrer Mustaf <ArrowRight size={15} className="arr" />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ── CTA finale ───────────────────────────────────────── */}
      <section className="prod-final-cta section">
        <div className="wrap prod-final-inner">
          <h2>Pas encore sûr par où commencer ?</h2>
          <p>Parlez-nous de votre projet — notre équipe vous oriente vers le bon produit en moins de 24h.</p>
          <Link className="btn btn-primary btn-lg" href="/#contact">
            Parler à l&apos;équipe <ArrowRight size={17} className="arr" />
          </Link>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="offer-foot prod-foot">
        <p>
          <ShieldCheck
            size={15}
            style={{ display: 'inline', verticalAlign: '-2px', marginRight: 6, color: 'var(--green)' }}
          />
          Plateforme bâtie sur la confiance · WhatsApp Business officiel · Architectes certifiés
        </p>
        <p style={{ marginTop: 10 }}>
          <Link href="/">← Retour à l&apos;accueil</Link>
        </p>
      </footer>

    </div>
  );
}
