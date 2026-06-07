import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Clock, Calendar, BookOpen, ShieldCheck } from 'lucide-react';
import '../landing.css';
import './blog.css';
import SiteHeader from '../components/SiteHeader';

export const metadata: Metadata = {
  title: 'Blog — Guides & conseils immobiliers au Sénégal | Litug',
  description:
    "Guides pratiques, conseils anti-arnaques et actualités immobilières pour la diaspora sénégalaise.",
};

const CATEGORIES = ['Tous', 'Immobilier', 'Guides', 'Diaspora', 'Construction'];

type CatColor = 'green' | 'gold' | 'blue' | 'sienna';

type Article = {
  slug: string;
  category: string;
  catColor: CatColor;
  title: string;
  excerpt: string;
  date: string;
  readTime: number;
  gradient: string;
  featured?: boolean;
};

const ARTICLES: Article[] = [
  {
    slug: 'eviter-arnaques-immobilieres-senegal',
    category: 'Immobilier',
    catColor: 'green',
    title: 'Comment éviter les arnaques immobilières au Sénégal',
    excerpt:
      "La fraude foncière touche des milliers de familles chaque année. Voici les 7 signaux d'alarme à ne jamais ignorer avant d'acheter un terrain.",
    date: '28 mai 2026',
    readTime: 8,
    gradient: 'linear-gradient(140deg, #200B11 0%, #7A2233 100%)',
    featured: true,
  },
  {
    slug: 'titre-foncier-bail-deliberation',
    category: 'Guides',
    catColor: 'gold',
    title: 'Titre Foncier, Bail, Délibération : quelles différences ?',
    excerpt:
      "Tout acheteur doit comprendre ces trois types de documents. Droits, risques et précautions pour chacun — expliqués clairement.",
    date: '20 mai 2026',
    readTime: 6,
    gradient: 'linear-gradient(140deg, #1a1208 0%, #8a6210 100%)',
  },
  {
    slug: 'construire-depuis-diaspora-guide-2026',
    category: 'Diaspora',
    catColor: 'blue',
    title: 'Construire depuis la diaspora : le guide complet 2026',
    excerpt:
      "Depuis l'Italie ou la France, acheter et construire au Sénégal est possible. Comment faire sans se faire piéger.",
    date: '14 mai 2026',
    readTime: 12,
    gradient: 'linear-gradient(140deg, #071428 0%, #0f3460 100%)',
  },
  {
    slug: 'mutation-fonciere-etapes',
    category: 'Guides',
    catColor: 'gold',
    title: 'La mutation foncière expliquée étape par étape',
    excerpt:
      "La mutation, c'est le transfert officiel du titre à votre nom. Un passage obligatoire que beaucoup négligent — et qui coûte cher.",
    date: '7 mai 2026',
    readTime: 5,
    gradient: 'linear-gradient(140deg, #1a0e00 0%, #6b3e00 100%)',
  },
  {
    slug: '5-questions-avant-acheter-terrain',
    category: 'Immobilier',
    catColor: 'green',
    title: "5 questions à poser avant d'acheter un terrain",
    excerpt:
      "Avant de signer, ces cinq questions simples peuvent vous épargner des mois de procédures et des pertes importantes.",
    date: '29 avril 2026',
    readTime: 4,
    gradient: 'linear-gradient(140deg, #1A070C 0%, #973047 100%)',
  },
  {
    slug: 'sequestre-notarial-senegal',
    category: 'Immobilier',
    catColor: 'green',
    title: 'Comment fonctionne le séquestre notarial au Sénégal',
    excerpt:
      "Le séquestre est la protection ultime de l'acheteur. Les fonds sont libérés uniquement à la mutation — jamais avant.",
    date: '22 avril 2026',
    readTime: 7,
    gradient: 'linear-gradient(140deg, #160609 0%, #7A2233 60%)',
  },
  {
    slug: 'choisir-architecte-senegalais',
    category: 'Construction',
    catColor: 'sienna',
    title: "Choisir un architecte au Sénégal : notre guide",
    excerpt:
      "Pas tous les architectes ne sont agréés, ni disponibles à distance. Le bon professionnel pour votre projet existe — voici comment le trouver.",
    date: '15 avril 2026',
    readTime: 6,
    gradient: 'linear-gradient(140deg, #170606 0%, #6b2020 100%)',
  },
  {
    slug: 'diaspora-immobilier-2026',
    category: 'Diaspora',
    catColor: 'blue',
    title: "La diaspora et l'immobilier sénégalais en 2026",
    excerpt:
      "Plus de 4 milliards de FCFA investis chaque année dans la pierre. Zones prisées, nouveaux risques et opportunités pour 2026.",
    date: '8 avril 2026',
    readTime: 9,
    gradient: 'linear-gradient(140deg, #050520 0%, #1a1a5e 100%)',
  },
  {
    slug: 'suivi-chantier-distance',
    category: 'Construction',
    catColor: 'sienna',
    title: 'Suivi de chantier à distance : nos conseils',
    excerpt:
      "Appels vidéo, rapports photos hebdomadaires, géomètre agréé — comment garder le contrôle sur votre chantier depuis l'Europe.",
    date: '1 avril 2026',
    readTime: 5,
    gradient: 'linear-gradient(140deg, #1a0808 0%, #8b3a3a 100%)',
  },
];

const FEATURED = ARTICLES.find(a => a.featured)!;
const REST = ARTICLES.filter(a => !a.featured);

export default function BlogPage() {
  return (
    <div className="landing-root">

      {/* ── Nav ─────────────────────────────────────────────────── */}
      <SiteHeader cta={{ label: 'Commencer', href: '/#contact' }} />

      {/* ── Hero ────────────────────────────────────────────────── */}
      <header className="blog-hero">
        <div className="hero-bg">
          <div className="glow g1" />
          <div className="glow g2" />
        </div>
        <div className="wrap blog-hero-inner">
          <div className="blog-hero-badge">
            <BookOpen size={14} />
            Guides · Conseils · Actualités
          </div>
          <h1>
            Le guide de<br />
            l&apos;acheteur sénégalais
          </h1>
          <p className="blog-hero-sub">
            Arnaques foncières, types de titres, construction depuis la diaspora —
            tout ce qu&apos;il faut savoir avant d&apos;investir.
          </p>
        </div>
      </header>

      {/* ── Article à la une ────────────────────────────────────── */}
      <section className="section blog-featured-sec">
        <div className="wrap">
          <span className="eyebrow">Article à la une</span>
          <Link href={`/blog/${FEATURED.slug}`} className="blog-featured-card">
            <div
              className="blog-featured-img"
              style={{ background: FEATURED.gradient }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/blog/${FEATURED.slug}.jpg`}
                alt={FEATURED.title}
                className="blog-img"
                loading="lazy"
              />
              <span className={`blog-cat blog-cat-${FEATURED.catColor}`}>
                {FEATURED.category}
              </span>
            </div>
            <div className="blog-featured-body">
              <h2 className="blog-featured-title">{FEATURED.title}</h2>
              <p className="blog-featured-excerpt">{FEATURED.excerpt}</p>
              <div className="blog-card-meta">
                <span><Calendar size={13} /> {FEATURED.date}</span>
                <span><Clock size={13} /> {FEATURED.readTime} min de lecture</span>
              </div>
              <span className="blog-readmore">
                Lire l&apos;article <ArrowRight size={14} />
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* ── Filtres catégories ───────────────────────────────────── */}
      <div className="wrap blog-cats-row">
        {CATEGORIES.map((c, i) => (
          <span key={i} className={`blog-cat-pill${i === 0 ? ' active' : ''}`}>
            {c}
          </span>
        ))}
      </div>

      {/* ── Grille articles ─────────────────────────────────────── */}
      <section className="section blog-grid-sec">
        <div className="wrap">
          <div className="blog-grid">
            {REST.map((a, i) => (
              <Link key={i} href={`/blog/${a.slug}`} className="blog-card">
                <div
                  className="blog-card-img"
                  style={{ background: a.gradient }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/blog/${a.slug}.jpg`}
                    alt={a.title}
                    className="blog-img"
                    loading="lazy"
                  />
                  <span className={`blog-cat blog-cat-${a.catColor}`}>
                    {a.category}
                  </span>
                </div>
                <div className="blog-card-body">
                  <h3 className="blog-card-title">{a.title}</h3>
                  <p className="blog-card-excerpt">{a.excerpt}</p>
                  <div className="blog-card-meta">
                    <span><Calendar size={12} /> {a.date}</span>
                    <span><Clock size={12} /> {a.readTime} min</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Newsletter ──────────────────────────────────────────── */}
      <section className="section on-ink blog-nl-band">
        <div className="hero-bg">
          <div className="glow g1" style={{ opacity: 0.2 }} />
        </div>
        <div className="wrap blog-nl-inner">
          <div className="blog-nl-text">
            <span className="eyebrow">Newsletter</span>
            <h2 className="section-title">Nouveaux articles chaque semaine</h2>
            <p className="section-sub">
              Conseils anti-arnaques, actualités foncières et nouveaux terrains
              disponibles — une fois par semaine, pas plus.
            </p>
          </div>
          <div className="blog-nl-cta">
            <p className="blog-nl-cta-label">Rejoindre la liste</p>
            <Link href="/#contact" className="btn btn-gold btn-lg">
              S&apos;abonner <ArrowRight size={16} className="arr" />
            </Link>
            <p className="blog-nl-note">Pas de spam. Désabonnement en 1 clic.</p>
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
          Guides rédigés par notre équipe · Vérification notariale · Zéro commission cachée
        </p>
        <p style={{ marginTop: 10 }}>
          <Link href="/">← Retour à l&apos;accueil</Link>
        </p>
      </footer>

    </div>
  );
}
