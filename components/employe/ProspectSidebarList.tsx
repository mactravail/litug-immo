'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, Users } from 'lucide-react';
import { cn, formatFollowers } from '@/lib/utils';
import type { ProspectOutcome } from '@/lib/admin/types';

export interface SidebarProspect {
  id: string;
  companyName: string;
  followers?: number;
  outcome: ProspectOutcome;
}

/** Pastille de couleur par étape de l'entonnoir (sémantique, hors palette de marque). */
const DOT: Record<ProspectOutcome, string> = {
  to_contact:  'bg-sky-500',
  no_response: 'bg-stone-400',
  interested:  'bg-emerald-500',
  refused:     'bg-amber-500',
};

/**
 * Liste des entreprises ajoutées par le prospecteur, dans la sidebar.
 * Triée par audience (followers) décroissante pour « classer » les prospects,
 * avec une barre de recherche pour retrouver vite une entreprise.
 */
export function ProspectSidebarList({ prospects }: { prospects: SidebarProspect[] }) {
  const [query, setQuery] = useState('');

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return prospects
      .filter(p => !q || p.companyName.toLowerCase().includes(q))
      .sort((a, b) => (b.followers ?? 0) - (a.followers ?? 0) || a.companyName.localeCompare(b.companyName));
  }, [prospects, query]);

  return (
    <div className="flex flex-col min-h-0 flex-1">
      <p className="px-3 mb-2 text-[11px] font-semibold text-muted uppercase tracking-wide">
        Mon carnet ({prospects.length})
      </p>

      {/* Recherche */}
      <div className="relative px-3 mb-2">
        <Search size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
        <input
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Rechercher…"
          className="w-full border border-stone-200 rounded-xl pl-8 pr-3 py-2 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
        />
      </div>

      {/* Liste — triée par followers, scrollable */}
      <div className="flex-1 overflow-y-auto px-1.5 space-y-0.5">
        {rows.length === 0 ? (
          <p className="px-1.5 py-3 text-xs text-muted">
            {prospects.length === 0 ? 'Aucune entreprise pour l’instant.' : 'Aucun résultat.'}
          </p>
        ) : (
          rows.map(p => (
            <Link
              key={p.id}
              href={`/equipe/prospection?focus=${p.id}`}
              className="flex items-center gap-2 px-1.5 py-1.5 rounded-lg hover:bg-stone-50 transition-colors group"
            >
              <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', DOT[p.outcome])} />
              <span className="text-sm text-text truncate flex-1 min-w-0 group-hover:text-accent">{p.companyName}</span>
              {p.followers != null && (
                <span className="inline-flex items-center gap-0.5 text-[10px] text-muted shrink-0">
                  <Users size={10} /> {formatFollowers(p.followers)}
                </span>
              )}
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
