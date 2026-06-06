'use client';

import { useTransition } from 'react';
import Link from 'next/link';
import { Globe, EyeOff, ExternalLink } from 'lucide-react';
import { setLandPublished } from '@/app/actions';

interface Props {
  landId: string;
  published: boolean;
}

export function PublishActions({ landId, published }: Props) {
  const [pending, startTransition] = useTransition();

  if (published) {
    return (
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
        <p className="text-xs text-muted font-semibold uppercase tracking-wider mb-2">Publication</p>
        <p className="text-sm text-text mb-3 flex items-center gap-2">
          <Globe size={15} className="text-accent shrink-0" />
          <span>Publié — visible par le public sur le site.</span>
        </p>
        <Link
          href={`/nos-terrains/${landId}`}
          target="_blank"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline mb-4"
        >
          Voir la fiche publique <ExternalLink size={13} />
        </Link>
        <button
          disabled={pending}
          onClick={() => startTransition(() => setLandPublished(landId, false))}
          className="w-full text-sm font-semibold bg-stone-100 text-text px-4 py-2.5 rounded-xl hover:bg-stone-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <EyeOff size={15} />
          {pending ? 'Mise à jour…' : 'Dépublier'}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
      <p className="text-xs text-muted font-semibold uppercase tracking-wider mb-2">Publication</p>
      <p className="text-sm text-muted mb-3">
        Ce terrain est un <strong className="text-text">brouillon</strong> : visible uniquement par vous.
        Publiez-le pour qu&apos;il apparaisse sur la page d&apos;accueil et dans « Nos terrains ».
      </p>
      <button
        disabled={pending}
        onClick={() => startTransition(() => setLandPublished(landId, true))}
        className="w-full text-sm font-semibold bg-accent text-white px-4 py-2.5 rounded-xl hover:bg-accent/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <Globe size={15} />
        {pending ? 'Publication…' : 'Publier'}
      </button>
    </div>
  );
}
