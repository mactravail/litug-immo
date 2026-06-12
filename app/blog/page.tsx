import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Clock, Calendar, BookOpen, ShieldCheck } from 'lucide-react';
import '../landing.css';
import './blog.css';
import SiteHeader from '../components/SiteHeader';
import NewsletterBandForm from './NewsletterBandForm';
import { CATEGORIES, ARTICLES } from './articles';

export const metadata: Metadata = {
  title: 'Blog — Guides & conseils immobiliers au Sénégal | Litug',
  description:
    "Guides pratiques, conseils anti-arnaques et actualités immobilières pour la diaspora sénégalaise.",
};

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
            <NewsletterBandForm />
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
