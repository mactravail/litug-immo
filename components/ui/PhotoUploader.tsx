'use client';

import { useRef, useState } from 'react';
import { ImagePlus, X, Upload } from 'lucide-react';

interface Props {
  value: string[];
  onChange: (photos: string[]) => void;
  maxPhotos?: number;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const MAX = 1200;
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        if (width > height) { height = Math.round(height * MAX / width); width = MAX; }
        else { width = Math.round(width * MAX / height); height = MAX; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = reject;
    img.src = objectUrl;
  });
}

export function PhotoUploader({ value, onChange, maxPhotos = 8 }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  async function addFiles(files: FileList | null) {
    if (!files) return;
    const allowed = maxPhotos - value.length;
    if (allowed <= 0) return;
    const toProcess = Array.from(files).slice(0, allowed);
    const dataUrls = await Promise.all(toProcess.map(fileToDataUrl));
    onChange([...value, ...dataUrls]);
  }

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      {/* Zone de dépôt */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className={`
          relative flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-2xl
          p-8 cursor-pointer transition-colors select-none
          ${dragging
            ? 'border-accent bg-accent-light'
            : 'border-stone-200 bg-stone-50 hover:border-stone-300 hover:bg-stone-100'
          }
          ${value.length >= maxPhotos ? 'opacity-50 pointer-events-none' : ''}
        `}
      >
        <Upload size={22} className={dragging ? 'text-accent' : 'text-muted'} />
        <p className="text-sm font-medium text-muted">
          {value.length >= maxPhotos
            ? `Maximum ${maxPhotos} photos atteint`
            : 'Cliquez ou glissez des photos ici'}
        </p>
        <p className="text-xs text-muted/70">JPG, PNG · max {maxPhotos} photos</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={e => addFiles(e.target.files)}
        />
      </div>

      {/* Grille de prévisualisation */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {value.map((src, i) => (
            <div key={i} className="relative group aspect-square rounded-xl overflow-hidden bg-stone-100">
              <img src={src} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={e => { e.stopPropagation(); remove(i); }}
                className="absolute top-1 right-1 p-1 rounded-lg bg-stone-900/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={12} />
              </button>
              {i === 0 && (
                <span className="absolute bottom-1 left-1 text-[10px] font-semibold bg-stone-900/60 text-white px-1.5 py-0.5 rounded-md">
                  Principale
                </span>
              )}
            </div>
          ))}
          {value.length < maxPhotos && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="aspect-square rounded-xl border-2 border-dashed border-stone-200 flex items-center justify-center text-muted hover:border-stone-300 hover:text-stone-500 transition-colors"
            >
              <ImagePlus size={20} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
