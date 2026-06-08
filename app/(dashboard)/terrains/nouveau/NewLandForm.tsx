'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createLand } from '@/app/actions';
import type { DocumentType } from '@/lib/data/types';
import { PhotoUploader } from '@/components/ui/PhotoUploader';

const DOCUMENT_TYPES: { value: DocumentType; label: string; description: string }[] = [
  { value: 'tf',          label: '🟢 Titre Foncier', description: 'Propriété pleinement enregistrée' },
  { value: 'bail',        label: '🟡 Bail',           description: 'Bail emphytéotique de l\'État' },
  { value: 'deliberation',label: '🔴 Délibération',  description: 'Attribution municipale (précaire)' },
];

export function NewLandForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [docType, setDocType] = useState<DocumentType>('tf');
  const [photos, setPhotos] = useState<string[]>([]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const input = {
      title:        fd.get('title') as string,
      zone:         fd.get('zone') as string,
      surface:      fd.get('surface') ? Number(fd.get('surface')) : undefined,
      priceFcfa:    Number(fd.get('priceFcfa')),
      documentType: docType,
      description:  fd.get('description') as string,
      photos,
    };
    startTransition(async () => {
      const land = await createLand(input);
      router.push(`/terrains/${land.id}`);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informations générales */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 space-y-5">
        <h2 className="font-serif text-lg font-semibold text-text">Informations générales</h2>

        <div>
          <label className="block text-sm font-medium text-text mb-1.5" htmlFor="title">
            Titre du terrain <span className="text-red-500">*</span>
          </label>
          <input
            id="title" name="title" type="text" required
            placeholder="Ex : Terrain résidentiel face mer — Saly Portudal"
            className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1.5" htmlFor="zone">
              Zone / Ville <span className="text-red-500">*</span>
            </label>
            <input
              id="zone" name="zone" type="text" required
              placeholder="Ex : Saly, Dakar, Thiès…"
              className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1.5" htmlFor="surface">
              Surface (m²)
            </label>
            <input
              id="surface" name="surface" type="number" min="1"
              placeholder="Ex : 300"
              className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-1.5" htmlFor="priceFcfa">
            Prix (FCFA) <span className="text-red-500">*</span>
          </label>
          <input
            id="priceFcfa" name="priceFcfa" type="number" required min="1"
            placeholder="Ex : 25000000"
            className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-2">
            Type de document <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            {DOCUMENT_TYPES.map(dt => (
              <label
                key={dt.value}
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
                  docType === dt.value
                    ? 'border-accent bg-accent-light'
                    : 'border-stone-200 bg-white hover:border-stone-300'
                }`}
              >
                <input
                  type="radio" name="documentType" value={dt.value}
                  checked={docType === dt.value}
                  onChange={() => setDocType(dt.value)}
                  className="mt-0.5 accent-accent"
                />
                <div>
                  <p className="text-sm font-medium text-text">{dt.label}</p>
                  <p className="text-xs text-muted">{dt.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-1.5" htmlFor="description">
            Description
          </label>
          <textarea
            id="description" name="description" rows={4}
            placeholder="Décrivez le terrain, son environnement, l'état du titre…"
            className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent resize-none"
          />
        </div>
      </div>

      {/* Section photos */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 space-y-4">
        <div>
          <h2 className="font-serif text-lg font-semibold text-text">Photos du terrain</h2>
          <p className="text-xs text-muted mt-0.5">La première photo sera utilisée comme image principale.</p>
        </div>
        <PhotoUploader value={photos} onChange={setPhotos} />
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 text-sm font-semibold border border-stone-200 text-text px-4 py-2.5 rounded-xl hover:bg-stone-50 transition-colors"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={pending}
          className="flex-1 text-sm font-semibold bg-accent text-white px-4 py-2.5 rounded-xl hover:bg-accent/90 transition-colors disabled:opacity-50"
        >
          {pending ? 'Enregistrement…' : 'Enregistrer le terrain'}
        </button>
      </div>
    </form>
  );
}
