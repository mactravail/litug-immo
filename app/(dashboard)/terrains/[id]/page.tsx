import { notFound } from 'next/navigation';
import { MapPin, Maximize2, Calendar, FileText } from 'lucide-react';
import { getDataProvider } from '@/lib/data/provider';
import { DocumentTypeBadge } from '@/components/ui/DocumentTypeBadge';
import { VerificationBadge } from '@/components/ui/VerificationBadge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PublishBadge } from '@/components/ui/PublishBadge';
import { PageHeader } from '@/components/ui/PageHeader';
import { SaleStatusActions } from './SaleStatusActions';
import { VerificationActions } from './VerificationActions';
import { PublishActions } from './PublishActions';
import { PhotoManager } from './PhotoManager';
import { formatFcfa, formatEur, formatDate } from '@/lib/utils';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function LandDetailPage({ params }: Props) {
  const { id } = await params;
  const land = await getDataProvider().getLand(id);
  if (!land) notFound();

  return (
    <div>
      <PageHeader
        title={land.title}
        breadcrumbs={[{ label: 'Terrains', href: '/terrains' }, { label: land.zone }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Photo principale + galerie */}
          <div className="space-y-2">
            <div className="relative rounded-2xl overflow-hidden bg-stone-100 aspect-video">
              {land.photos.length > 0 ? (
                <img src={land.photos[0]} alt={land.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                  <MapPin size={28} className="text-stone-300" />
                  <p className="text-sm text-muted">Aucune photo — ajoutez-en ci-dessous</p>
                </div>
              )}
              {land.saleStatus === 'vendu' && (
                <div className="absolute inset-0 bg-stone-900/40 flex items-center justify-center">
                  <span className="bg-stone-900/80 text-white font-bold text-xl px-6 py-2 rounded-full tracking-widest">
                    VENDU
                  </span>
                </div>
              )}
            </div>

            {/* Galerie miniatures (si + d'une photo) */}
            {land.photos.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {land.photos.slice(1).map((src, i) => (
                  <div key={i} className="aspect-square rounded-xl overflow-hidden bg-stone-100">
                    <img src={src} alt={`Photo ${i + 2}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <PublishBadge published={land.published} />
            <DocumentTypeBadge type={land.documentType} />
            <VerificationBadge
              status={land.verificationStatus}
              notaire={land.verifiedByNotaire}
              date={land.verifiedAt}
            />
            <StatusBadge type="sale" status={land.saleStatus} />
          </div>

          {/* Détails vérification officielle */}
          {land.verificationStatus === 'verifie' && land.verifiedByNotaire && (
            <div className="bg-accent-light border border-accent/10 rounded-2xl p-5">
              <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-3">Vérification officielle</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted text-xs mb-1">Notaire</p>
                  <p className="font-medium text-text">{land.verifiedByNotaire}</p>
                </div>
                <div>
                  <p className="text-muted text-xs mb-1">Date du contrôle</p>
                  <p className="font-medium text-text">{formatDate(land.verifiedAt!)}</p>
                </div>
                <div>
                  <p className="text-muted text-xs mb-1">Registre consulté</p>
                  <p className="font-medium text-text">{land.registryChecked}</p>
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          {land.description && (
            <div>
              <h2 className="font-serif text-lg font-semibold text-text mb-2">Description</h2>
              <p className="text-muted text-sm leading-relaxed">{land.description}</p>
            </div>
          )}

          {/* Gestion des photos */}
          <PhotoManager landId={land.id} initialPhotos={land.photos} />
        </div>

        {/* Colonne latérale */}
        <div className="space-y-5">
          {/* Prix */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
            <p className="text-xs text-muted font-medium mb-2">Prix</p>
            <p className="text-3xl font-bold text-text">{formatFcfa(land.priceFcfa)}</p>
            <p className="text-sm text-muted mt-1">{formatEur(land.priceFcfa)}</p>
          </div>

          {/* Infos */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 space-y-4">
            <p className="text-xs text-muted font-semibold uppercase tracking-wider">Informations</p>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-text">
                <MapPin size={15} className="text-muted shrink-0" />
                <span>{land.zone}</span>
              </div>
              {land.surface && (
                <div className="flex items-center gap-3 text-text">
                  <Maximize2 size={15} className="text-muted shrink-0" />
                  <span>{land.surface} m²</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-text">
                <Calendar size={15} className="text-muted shrink-0" />
                <span>Ajouté le {formatDate(land.createdAt)}</span>
              </div>
              <div className="flex items-center gap-3 text-text">
                <FileText size={15} className="text-muted shrink-0" />
                <DocumentTypeBadge type={land.documentType} />
              </div>
            </div>
          </div>

          {/* Publication (visible par le public ou non) */}
          <PublishActions landId={land.id} published={land.published ?? false} />

          {/* Actions vente */}
          <SaleStatusActions landId={land.id} currentStatus={land.saleStatus} />

          {/* Actions vérification */}
          <VerificationActions landId={land.id} currentStatus={land.verificationStatus} />
        </div>
      </div>
    </div>
  );
}
