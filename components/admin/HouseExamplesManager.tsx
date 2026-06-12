'use client';

import { useState, useRef, useTransition } from 'react';
import Image from 'next/image';
import { ImagePlus, Trash2, Loader2, Home } from 'lucide-react';
import { addHouseExample, deleteHouseExample } from '@/app/(admin)/admin/maisons/actions';

export type HouseExample = {
  id: string;
  title: string | null;
  surface: string | null;
  photo: string;
};

/** Redimensionne une image (max 1000px) et renvoie une data URL JPEG (~0.8). */
function fileToResizedDataUrl(file: File, maxSize = 1000, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Lecture du fichier impossible.'));
    reader.onload = () => {
      const img = new window.Image();
      img.onerror = () => reject(new Error('Image illisible.'));
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas indisponible.'));
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function HouseExamplesManager({ items }: { items: HouseExample[] }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [surface, setSurface] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    try {
      const dataUrl = await fileToResizedDataUrl(file);
      setPreview(dataUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Image invalide.');
    }
  }

  function reset() {
    setPreview(null);
    setTitle('');
    setSurface('');
    if (fileRef.current) fileRef.current.value = '';
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!preview) {
      setError('Choisissez d’abord une photo.');
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await addHouseExample({ title, surface, photo: preview });
      if (res.ok) {
        reset();
      } else {
        setError(res.error);
      }
    });
  }

  function onDelete(id: string) {
    setDeletingId(id);
    startTransition(async () => {
      const res = await deleteHouseExample(id);
      if (!res.ok) setError(res.error);
      setDeletingId(null);
    });
  }

  return (
    <div className="space-y-8">
      {/* Formulaire d'ajout */}
      <form onSubmit={onSubmit} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 max-w-2xl">
        <h2 className="font-display text-lg font-semibold text-text mb-4 flex items-center gap-2">
          <ImagePlus size={17} className="text-accent" /> Ajouter un exemple de maison
        </h2>

        <div className="flex flex-col sm:flex-row gap-5">
          {/* Zone photo */}
          <div className="shrink-0">
            <label className="block w-full sm:w-44">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={onPick}
                className="hidden"
              />
              <span className="flex flex-col items-center justify-center gap-2 cursor-pointer rounded-xl border-2 border-dashed border-stone-200 hover:border-accent/50 transition-colors aspect-[4/3] w-full sm:w-44 overflow-hidden bg-stone-50">
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={preview} alt="Aperçu" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <ImagePlus size={22} className="text-muted" />
                    <span className="text-xs text-muted">Choisir une photo</span>
                  </>
                )}
              </span>
            </label>
          </div>

          {/* Champs */}
          <div className="flex-1 space-y-3">
            <div>
              <label className="block text-xs font-medium text-muted mb-1">Titre (optionnel)</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex. Villa moderne — Saly"
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm text-text focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">Surface (optionnel)</label>
              <input
                type="text"
                value={surface}
                onChange={(e) => setSurface(e.target.value)}
                placeholder="Ex. 250 m²"
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm text-text focus:outline-none focus:border-accent"
              />
            </div>
            <button
              type="submit"
              disabled={pending || !preview}
              className="inline-flex items-center gap-2 rounded-lg bg-ink text-white text-sm font-medium px-4 py-2.5 hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer"
            >
              {pending ? <Loader2 size={15} className="animate-spin" /> : <ImagePlus size={15} />}
              {pending ? 'Ajout…' : 'Ajouter à la vitrine'}
            </button>
          </div>
        </div>

        {error && <p className="text-xs text-red-600 mt-3">{error}</p>}
        <p className="text-[11px] text-muted mt-3">
          La photo est automatiquement compressée. Elle apparaît immédiatement sur la page d’accueil,
          onglet « Exemple de maison ».
        </p>
      </form>

      {/* Galerie existante */}
      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-text flex items-center gap-2">
          <Home size={17} className="text-accent" /> Exemples publiés ({items.length})
        </h2>

        {items.length === 0 ? (
          <p className="bg-white rounded-2xl border border-stone-100 shadow-sm px-5 py-6 text-sm text-muted">
            Aucun exemple pour le moment. Ajoutez une première maison ci-dessus.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((h) => (
              <div key={h.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden group">
                <div className="relative aspect-[4/3] bg-stone-100">
                  <Image src={h.photo} alt={h.title ?? 'Exemple de maison'} fill className="object-cover" unoptimized />
                  <button
                    onClick={() => onDelete(h.id)}
                    disabled={pending && deletingId === h.id}
                    aria-label="Supprimer"
                    className="absolute top-2 right-2 inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/90 text-red-600 shadow-sm hover:bg-white disabled:opacity-50 cursor-pointer"
                  >
                    {pending && deletingId === h.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                  </button>
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-text truncate">{h.title || 'Maison'}</p>
                  {h.surface && <p className="text-[11px] text-muted">{h.surface}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
