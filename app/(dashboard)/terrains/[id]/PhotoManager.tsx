'use client';

import { useState, useTransition } from 'react';
import { Camera } from 'lucide-react';
import { PhotoUploader } from '@/components/ui/PhotoUploader';
import { updateLandPhotos } from '@/app/actions';

interface Props {
  landId: string;
  initialPhotos: string[];
}

export function PhotoManager({ landId, initialPhotos }: Props) {
  const [photos, setPhotos] = useState<string[]>(initialPhotos);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function handleChange(next: string[]) {
    setPhotos(next);
    setSaved(false);
  }

  function handleSave() {
    startTransition(async () => {
      await updateLandPhotos(landId, photos);
      setSaved(true);
    });
  }

  const dirty = JSON.stringify(photos) !== JSON.stringify(initialPhotos);

  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Camera size={16} className="text-muted" />
          <p className="text-xs text-muted font-semibold uppercase tracking-wider">Photos du terrain</p>
        </div>
        {dirty && (
          <button
            onClick={handleSave}
            disabled={pending}
            className="text-xs font-semibold bg-accent text-white px-3 py-1.5 rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            {pending ? 'Sauvegarde…' : 'Enregistrer'}
          </button>
        )}
        {saved && !dirty && (
          <span className="text-xs text-accent font-medium">Enregistré ✓</span>
        )}
      </div>
      <PhotoUploader value={photos} onChange={handleChange} />
    </div>
  );
}
