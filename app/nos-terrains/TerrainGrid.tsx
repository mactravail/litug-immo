'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MapPin, Maximize2, ArrowRight, SlidersHorizontal, ShieldCheck } from 'lucide-react';
import type { PublicLand, DocumentType } from '@/lib/data/types';
import { formatFcfa, formatEur } from '@/lib/utils';

const DOC_LABEL: Record<DocumentType, string> = {
  tf:           'Titre Foncier',
  bail:         'Bail',
  deliberation: 'Délibération',
};

const DOC_ICON: Record<DocumentType, string> = {
  tf:           '🟢',
  bail:         '🟡',
  deliberation: '🔴',
};

// Fallback gradient when a land has no photo — semantic doc colors, not brand palette.
const DOC_GRADIENT: Record<DocumentType, string> = {
  tf:           'linear-gradient(140deg, #0b1a10 0%, #1F5A43 100%)',
  bail:         'linear-gradient(140deg, #1a1208 0%, #7a5510 100%)',
  deliberation: 'linear-gradient(140deg, #170606 0%, #6b2020 100%)',
};

const DOC_FILTERS = [
  { value: 'tous',         label: 'Tous' },
  { value: 'tf',           label: '🟢 Titre Foncier' },
  { value: 'bail',         label: '🟡 Bail' },
  { value: 'deliberation', label: '🔴 Délibération' },
] as const;

/* ------------------------------------------------------------------ */

export default function TerrainGrid({ terrains }: { terrains: PublicLand[] }) {
  const [doc, setDoc]             = useState<string>('tous');
  const [availOnly, setAvailOnly] = useState(false);

  const filtered = terrains.filter(t => {
    if (doc !== 'tous' && t.documentType !== doc) return false;
    if (availOnly && t.saleStatus !== 'disponible') return false;
    return true;
  });

  const count = filtered.length;

  return (
    <section className="section terrains-section">
      <div className="wrap">

        {/* Transparence notice */}
        <div className="terrains-notice">
          <SlidersHorizontal size={14} />
          <span>
            Sur chaque fiche, le type de document réel est affiché sans filtre —{' '}
            <span className="tn-green">🟢&nbsp;Titre&nbsp;Foncier</span>,{' '}
            <span className="tn-bail">🟡&nbsp;Bail</span> ou{' '}
            <span className="tn-red">🔴&nbsp;Délibération</span>. Jamais d&apos;annonce trompeuse.
          </span>
        </div>

        {/* Filters */}
        <div className="terrains-filters">
          <div className="terrains-filter-group">
            {DOC_FILTERS.map(f => (
              <button
                key={f.value}
                className={`terrain-filter-pill${doc === f.value ? ' active' : ''}`}
                onClick={() => setDoc(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>
          <button
            className={`terrain-avail-btn${availOnly ? ' active' : ''}`}
            onClick={() => setAvailOnly(v => !v)}
          >
            Disponibles uniquement
          </button>
        </div>

        {/* Count */}
        <p className="terrains-count">
          {count} terrain{count > 1 ? 's' : ''} trouvé{count > 1 ? 's' : ''}
        </p>

        {/* Grid */}
        {count > 0 ? (
          <div className="terrains-grid">
            {filtered.map(t => <TerrainCard key={t.id} t={t} />)}
          </div>
        ) : (
          <div className="terrains-empty">
            <p>Aucun terrain ne correspond à ces filtres.</p>
            <button
              className="btn btn-ghost"
              onClick={() => { setDoc('tous'); setAvailOnly(false); }}
            >
              Réinitialiser
            </button>
          </div>
        )}

      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function TerrainCard({ t }: { t: PublicLand }) {
  const isVendu = t.saleStatus === 'vendu';
  const isEnCours = t.saleStatus === 'en_cours_de_vente';
  const photo = t.photos[0];

  return (
    <Link href={`/nos-terrains/${t.id}`} className={`terrain-card${isVendu ? ' sold' : ''}`}>

      {/* Image (real photo or doc-colored fallback) */}
      <div
        className="terrain-card-img"
        style={photo ? undefined : { background: DOC_GRADIENT[t.documentType] }}
      >
        {photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt={t.title} className="terrain-card-photo" />
        )}
        <span className={`terrain-doc-badge badge-${t.documentType}`}>
          {DOC_ICON[t.documentType]} {DOC_LABEL[t.documentType]}
        </span>
        {t.verificationStatus === 'verifie' && (
          <span className="terrain-verif-tag"><ShieldCheck size={12} /> Vérifié</span>
        )}
        {isVendu && <div className="terrain-sold-tag">Vendu</div>}
        {isEnCours && <div className="terrain-sold-tag">En cours de vente</div>}
      </div>

      {/* Body */}
      <div className="terrain-card-body">
        <div className="terrain-card-loc">
          <MapPin size={12} />
          {t.zone}
        </div>
        <h3 className="terrain-card-title">{t.title}</h3>
        {t.surface != null && (
          <div className="terrain-card-area">
            <Maximize2 size={12} />
            {t.surface.toLocaleString('fr-FR')} m²
          </div>
        )}
        <div className="terrain-card-price">
          <span className="tcp-main">{formatFcfa(t.priceFcfa)}</span>
          <span className="tcp-eur">≈ {formatEur(t.priceFcfa)}</span>
        </div>
        <span className="terrain-card-cta">
          Voir la fiche
          <ArrowRight size={13} className="arr" />
        </span>
      </div>

    </Link>
  );
}
