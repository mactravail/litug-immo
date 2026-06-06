import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft, ArrowRight, MapPin, Maximize2, ShieldCheck, ShieldAlert,
  CalendarClock, User, FileText, MessageCircle,
} from 'lucide-react';
import '../../landing.css';
import '../terrains.css';
import { getDataProvider } from '@/lib/data/provider';
import type { DocumentType, PublicLand } from '@/lib/data/types';
import { formatFcfa, formatEur, formatDate, formatVisitDate, formatTime } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const DOC_LABEL: Record<DocumentType, string> = {
  tf: 'Titre Foncier',
  bail: 'Bail',
  deliberation: 'Délibération',
};
const DOC_ICON: Record<DocumentType, string> = {
  tf: '🟢',
  bail: '🟡',
  deliberation: '🔴',
};
const DOC_GRADIENT: Record<DocumentType, string> = {
  tf: 'linear-gradient(140deg, #0b1a10 0%, #1F5A43 100%)',
  bail: 'linear-gradient(140deg, #1a1208 0%, #7a5510 100%)',
  deliberation: 'linear-gradient(140deg, #170606 0%, #6b2020 100%)',
};
const VISIT_STATUS_LABEL = { planifiee: 'Planifiée', confirmee: 'Confirmée' } as const;

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const detail = await getDataProvider().getPublicLandDetail(id);
  if (!detail) return { title: 'Terrain introuvable | Litug' };
  return {
    title: `${detail.land.title} — ${detail.land.zone} | Litug`,
    description: `${DOC_LABEL[detail.land.documentType]} · ${formatFcfa(detail.land.priceFcfa)} · ${detail.land.zone}.`,
  };
}

// Builds the "Fixer une visite avec Sara" link.
// Uses WhatsApp (wa.me) if a number is configured, else falls back to the contact form.
function saraVisitLink(land: PublicLand): { href: string; external: boolean } {
  const num = process.env.NEXT_PUBLIC_SARA_WHATSAPP?.replace(/\D/g, '');
  if (!num) return { href: '/#contact', external: false };
  const msg =
    `Bonjour Sara 👋 Je suis intéressé(e) par le terrain « ${land.title} » à ${land.zone} ` +
    `(réf. ${land.id.slice(0, 8)} · ${formatFcfa(land.priceFcfa)}). J'aimerais fixer une visite.`;
  return { href: `https://wa.me/${num}?text=${encodeURIComponent(msg)}`, external: true };
}

export default async function TerrainDetailPage({ params }: Props) {
  const { id } = await params;
  const detail = await getDataProvider().getPublicLandDetail(id);
  if (!detail) notFound();

  const { land, upcomingVisits } = detail;
  const photos = land.photos;
  const isVendu = land.saleStatus === 'vendu';
  const isVerified = land.verificationStatus === 'verifie';
  const sara = saraVisitLink(land);

  return (
    <div className="landing-root">

      {/* ── Nav ─────────────────────────────────────────────────── */}
      <nav className="terrains-nav">
        <Link className="brand" href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Litug" />
        </Link>
        <div className="terrains-nav-right">
          <Link className="btn btn-ghost" href="/nos-terrains">
            <ArrowLeft size={16} /> Tous les terrains
          </Link>
          <Link className="btn btn-primary" href="/login">Se connecter</Link>
        </div>
      </nav>

      <main className="td-page">
        <div className="wrap">

          {/* Breadcrumb */}
          <div className="td-breadcrumb">
            <Link href="/nos-terrains">Nos terrains</Link>
            <span>/</span>
            <span>{land.zone}</span>
          </div>

          <div className="td-grid">

            {/* ── Colonne principale ──────────────────────────── */}
            <div className="td-main">

              {/* Galerie */}
              <div className="td-gallery">
                <div
                  className={`td-main-photo${isVendu ? ' sold' : ''}`}
                  style={photos[0] ? undefined : { background: DOC_GRADIENT[land.documentType] }}
                >
                  {photos[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photos[0]} alt={land.title} />
                  ) : (
                    <div className="td-photo-empty"><MapPin size={28} /><span>Photo à venir</span></div>
                  )}
                  {isVendu && <span className="td-sold-overlay">VENDU</span>}
                </div>
                {photos.length > 1 && (
                  <div className="td-thumbs">
                    {photos.slice(1).map((src, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={i} src={src} alt={`${land.title} ${i + 2}`} />
                    ))}
                  </div>
                )}
              </div>

              {/* Titre + localisation */}
              <div className="td-headline">
                <h1>{land.title}</h1>
                <p className="td-loc"><MapPin size={15} /> {land.zone}</p>
              </div>

              {/* Badges document + vérification */}
              <div className="td-badges">
                <span className={`terrain-doc-badge badge-${land.documentType}`}>
                  {DOC_ICON[land.documentType]} {DOC_LABEL[land.documentType]}
                </span>
                {isVerified ? (
                  <span className="td-verif-badge verified"><ShieldCheck size={14} /> Vérifié</span>
                ) : (
                  <span className="td-verif-badge unverified"><ShieldAlert size={14} /> Non vérifié</span>
                )}
              </div>

              {/* Bloc vérification officielle (uniquement si réellement vérifié) */}
              {isVerified && land.verifiedByNotaire && (
                <div className="td-verif-card">
                  <p className="td-verif-title"><ShieldCheck size={15} /> Vérification officielle</p>
                  <div className="td-verif-grid">
                    <div>
                      <span className="td-verif-k">Notaire</span>
                      <span className="td-verif-v">{land.verifiedByNotaire}</span>
                    </div>
                    {land.verifiedAt && (
                      <div>
                        <span className="td-verif-k">Date du contrôle</span>
                        <span className="td-verif-v">{formatDate(land.verifiedAt)}</span>
                      </div>
                    )}
                    {land.registryChecked && (
                      <div>
                        <span className="td-verif-k">Registre consulté</span>
                        <span className="td-verif-v">{land.registryChecked}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Avertissement honnête si non vérifié */}
              {!isVerified && (
                <div className="td-warn">
                  <ShieldAlert size={16} />
                  <p>
                    Ce terrain n&apos;a pas encore été vérifié par notre notaire à la Conservation Foncière.
                    Demandez une vérification avant tout engagement — Sara vous explique la démarche.
                  </p>
                </div>
              )}

              {/* Description */}
              {land.description && (
                <div className="td-desc">
                  <h2>Description</h2>
                  <p>{land.description}</p>
                </div>
              )}
            </div>

            {/* ── Colonne latérale ────────────────────────────── */}
            <aside className="td-aside">

              {/* Prix */}
              <div className="td-card td-price-card">
                <span className="td-card-label">Prix</span>
                <p className="td-price">{formatFcfa(land.priceFcfa)}</p>
                <p className="td-price-eur">≈ {formatEur(land.priceFcfa)}</p>
              </div>

              {/* Infos clés */}
              <div className="td-card">
                <span className="td-card-label">Informations</span>
                <ul className="td-info-list">
                  <li><MapPin size={15} /> {land.zone}</li>
                  {land.surface != null && <li><Maximize2 size={15} /> {land.surface.toLocaleString('fr-FR')} m²</li>}
                  <li><FileText size={15} /> {DOC_LABEL[land.documentType]}</li>
                  <li><User size={15} /> Vendeur : {land.sellerName || 'Vendeur Litug'}</li>
                </ul>
              </div>

              {/* Prochaines visites */}
              <div className="td-card">
                <span className="td-card-label"><CalendarClock size={14} /> Prochaines visites</span>
                {upcomingVisits.length > 0 ? (
                  <ul className="td-visits">
                    {upcomingVisits.map(v => (
                      <li key={v.id} className="td-visit-row">
                        <div>
                          <span className="td-visit-date">{formatVisitDate(v.visitDate)}</span>
                          <span className="td-visit-time">{formatTime(v.visitDate)}</span>
                        </div>
                        <span className={`td-visit-status ${v.status}`}>{VISIT_STATUS_LABEL[v.status]}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="td-visits-empty">Aucune visite programmée pour le moment. Fixez la vôtre avec Sara.</p>
                )}
              </div>

              {/* CTA Sara */}
              <a
                className="td-cta"
                href={sara.href}
                {...(sara.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                <MessageCircle size={17} />
                Fixer une visite avec Sara
                <ArrowRight size={15} className="arr" />
              </a>
              <p className="td-cta-note">
                Sara, notre agent IA, répond sur WhatsApp 24h/24 — sans intermédiaire.
              </p>
            </aside>

          </div>
        </div>
      </main>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="offer-foot">
        <p>
          <ShieldCheck
            size={15}
            style={{ display: 'inline', verticalAlign: '-2px', marginRight: 6, color: 'var(--green)' }}
          />
          Type de document affiché sans filtre · Vérification via la Conservation Foncière · Séquestre notarial
        </p>
        <p style={{ marginTop: 10 }}>
          <Link href="/nos-terrains">← Retour à tous les terrains</Link>
        </p>
      </footer>

    </div>
  );
}
