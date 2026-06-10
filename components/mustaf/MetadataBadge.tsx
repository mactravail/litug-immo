import { MapPin, CalendarClock, AlertTriangle } from 'lucide-react';
import { formatDateShort, formatTime } from '@/lib/utils';
import type { ConstructionMedia } from '@/lib/mustaf/types';

/**
 * Media metadata is sacred (mustaf.md §2.7): show date + GPS when present,
 * and visibly flag media that is missing geo/timestamp.
 */
export function MetadataBadge({ media }: { media: ConstructionMedia }) {
  if (media.metadataStatus === 'unverified_metadata') {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
        <AlertTriangle size={12} />
        Métadonnée manquante
      </span>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted">
      {media.capturedAt && (
        <span className="inline-flex items-center gap-1">
          <CalendarClock size={12} className="text-accent" />
          {formatDateShort(media.capturedAt)} · {formatTime(media.capturedAt)}
        </span>
      )}
      {media.geo && (
        <span className="inline-flex items-center gap-1">
          <MapPin size={12} className="text-accent" />
          {media.geo.lat.toFixed(4)}, {media.geo.lng.toFixed(4)}
        </span>
      )}
    </div>
  );
}
