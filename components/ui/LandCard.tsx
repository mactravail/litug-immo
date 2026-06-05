import Link from 'next/link';
import { MapPin, Maximize2 } from 'lucide-react';
import type { Land } from '@/lib/data/types';
import { formatFcfa, formatEur } from '@/lib/utils';
import { DocumentTypeBadge } from './DocumentTypeBadge';
import { VerificationBadge } from './VerificationBadge';
import { StatusBadge } from './StatusBadge';

interface Props {
  land: Land;
}

export function LandCard({ land }: Props) {
  const isVendu = land.saleStatus === 'vendu';

  return (
    <Link href={`/terrains/${land.id}`} className="block group">
      <article className="bg-white rounded-2xl overflow-hidden border border-stone-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="relative h-44 bg-stone-100">
          {land.photos.length > 0 ? (
            <img
              src={land.photos[0]}
              alt={land.title}
              className={`w-full h-full object-cover transition-transform group-hover:scale-[1.02] ${isVendu ? 'grayscale opacity-70' : ''}`}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-stone-100 to-stone-200">
              <MapPin size={24} className="text-stone-300" />
              <span className="text-xs text-stone-400">Photo à venir</span>
            </div>
          )}
          {isVendu && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-stone-800/70 text-white text-sm font-semibold px-4 py-1.5 rounded-full tracking-wide">
                VENDU
              </span>
            </div>
          )}
        </div>

        <div className="p-4 space-y-3">
          <div className="flex flex-wrap gap-1.5">
            <DocumentTypeBadge type={land.documentType} />
            <VerificationBadge
              status={land.verificationStatus}
              notaire={land.verifiedByNotaire}
              date={land.verifiedAt}
            />
            <StatusBadge type="sale" status={land.saleStatus} />
          </div>

          <h3 className="font-semibold text-text text-sm leading-snug line-clamp-2 group-hover:text-accent transition-colors">
            {land.title}
          </h3>

          <div className="flex items-center gap-3 text-xs text-muted">
            <span className="flex items-center gap-1">
              <MapPin size={11} />
              {land.zone}
            </span>
            {land.surface && (
              <span className="flex items-center gap-1">
                <Maximize2 size={11} />
                {land.surface} m²
              </span>
            )}
          </div>

          <div className="pt-1 border-t border-stone-50">
            <p className="text-base font-bold text-text">{formatFcfa(land.priceFcfa)}</p>
            <p className="text-xs text-muted">{formatEur(land.priceFcfa)}</p>
          </div>
        </div>
      </article>
    </Link>
  );
}
