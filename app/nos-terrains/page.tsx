import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, MessageCircle } from 'lucide-react';
import '../landing.css';
import './terrains.css';
import TerrainGrid from './TerrainGrid';
import { getDataProvider } from '@/lib/data/provider';

export const metadata: Metadata = {
  title: 'Nos terrains — Parcelles disponibles au Sénégal | Litug',
  description:
    "Parcourez les terrains disponibles au Sénégal. Chaque fiche affiche le type de document réel — Titre Foncier, Bail ou Délibération — sans filtre.",
};

// Reads live seller listings from Supabase (public views) — render per request.
export const dynamic = 'force-dynamic';

export default async function TerrainsPage() {
  const terrains = await getDataProvider().listPublicLands();
  const available = terrains.filter(t => t.saleStatus === 'disponible').length;
  const zones = new Set(terrains.map(t => t.zone.trim().toLowerCase())).size;

  return (
    <div className="landing-root">

      {/* ── Nav ─────────────────────────────────────────────────── */}
      <nav className="terrains-nav">
        <Link className="brand" href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Litug" />
        </Link>
        <div className="terrains-nav-right">
          <Link className="btn btn-ghost" href="/login">Se connecter</Link>
          <Link className="btn btn-primary" href="/#contact">
            Parler à Sara <ArrowRight size={16} className="arr" />
          </Link>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────── */}
      <header className="terrains-hero">
        <div className="wrap terrains-hero-inner">
          <div className="terrains-hero-text">
            <span className="eyebrow">Annonces · Sénégal</span>
            <h1>Nos terrains disponibles</h1>
            <p className="terrains-hero-sub">
              Chaque fiche affiche le type de document réel sans filtre.
              Titre Foncier, Bail ou Délibération — toujours visible, jamais caché.
            </p>
          </div>
          <div className="terrains-hero-stats">
            <div className="th-stat">
              <span className="th-stat-val">{terrains.length}</span>
              <span className="th-stat-label">annonces</span>
            </div>
            <div className="th-stat-sep" />
            <div className="th-stat">
              <span className="th-stat-val">{available}</span>
              <span className="th-stat-label">disponibles</span>
            </div>
            <div className="th-stat-sep" />
            <div className="th-stat">
              <span className="th-stat-val">{zones}</span>
              <span className="th-stat-label">zone{zones > 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Grille avec filtres (client) ─────────────────────────── */}
      <TerrainGrid terrains={terrains} />

      {/* ── CTA band ────────────────────────────────────────────── */}
      <section className="section on-ink terrains-cta-band">
        <div className="hero-bg">
          <div className="glow g1" style={{ opacity: 0.18 }} />
          <div className="glow g2" style={{ opacity: 0.22 }} />
        </div>
        <div className="wrap terrains-cta-inner">
          <div className="terrains-cta-text">
            <h2>Un terrain vous intéresse ?</h2>
            <p>
              Sara, notre agent IA, répond à vos questions 24h/24 sur WhatsApp —
              budget, localisation, type de document. Aucune attente, aucun intermédiaire.
            </p>
          </div>
          <div className="terrains-cta-btns">
            <a href="/#contact" className="btn btn-gold btn-lg">
              <MessageCircle size={17} />
              Parler à Sara <ArrowRight size={16} className="arr" />
            </a>
            <Link href="/sara" className="btn btn-ghost btn-lg">
              En savoir plus sur Sara
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
          Types de documents affichés sans filtre · Vérification via la Conservation Foncière · Séquestre notarial
        </p>
        <p style={{ marginTop: 10 }}>
          <Link href="/">← Retour à l&apos;accueil</Link>
        </p>
      </footer>

    </div>
  );
}
