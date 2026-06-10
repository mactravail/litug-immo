import { Camera, Video } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ConstructionMedia } from '@/lib/mustaf/types';

/**
 * Site media thumbnail. URLs are mock ('#') for now → renders a styled
 * placeholder; swap to <img>/<video> once Storage signed URLs are wired.
 */
export function MediaThumb({ media, className }: { media: ConstructionMedia; className?: string }) {
  const hasRealUrl = media.url && media.url !== '#';
  const Icon = media.type === 'video' ? Video : Camera;

  return (
    <div className={cn('relative aspect-[4/3] w-full overflow-hidden rounded-xl', className)}>
      {hasRealUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={media.url} alt={media.caption ?? 'Photo de chantier'} className="h-full w-full object-cover" />
      ) : (
        <div className="h-full w-full bg-gradient-to-br from-paper-2 to-stone-200 flex items-center justify-center">
          <Icon size={26} className="text-muted/60" />
        </div>
      )}
      {media.caption && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/70 to-transparent px-3 py-2">
          <p className="text-[11px] font-medium text-white truncate">{media.caption}</p>
        </div>
      )}
    </div>
  );
}
