'use client';

import { useEffect, useMemo, useState } from 'react';
import { Target, MessageSquare, Phone, User, Users, CalendarDays, Search } from 'lucide-react';
import {
  PROSPECT_NETWORK_LABEL, PROSPECT_CONTACT_LABEL,
  PROSPECT_OUTCOME_LABEL, PROSPECT_OUTCOME_STYLE, PROSPECT_OUTCOME_TAB_LABEL,
  PROSPECT_STATUS_LABEL, PROSPECT_STATUS_STYLE,
} from '@/lib/admin/labels';
import { formatDate, formatFollowers, cn } from '@/lib/utils';
import type { ProspectEntry, ProspectOutcome } from '@/lib/admin/types';

type Filter = 'all' | ProspectOutcome;
type Sort = 'recent' | 'followers' | 'name';

/** Ordre de l'entonnoir : à prospecter → prospectés → ont accepté → ont refusé. */
const OUTCOME_ORDER: ProspectOutcome[] = ['to_contact', 'no_response', 'interested', 'refused'];

const SORT_LABEL: Record<Sort, string> = {
  recent:    'Plus récents',
  followers: 'Plus d’abonnés',
  name:      'Nom (A–Z)',
};

/** Lien d'appel propre à partir d'un numéro affiché (espaces retirés). */
const telHref = (phone: string) => `tel:${phone.replace(/[^+0-9]/g, '')}`;

export function ProspectPipeline({ entries, focusId }: { entries: ProspectEntry[]; focusId?: string }) {
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<Sort>('recent');
  const [highlighted, setHighlighted] = useState<string | null>(null);

  // Arrivée depuis la liste de la sidebar (?focus=id) : on montre tout, on met en
  // évidence l'entreprise visée et on défile jusqu'à elle. Les setState passent par
  // un timer (hors corps synchrone de l'effet) puis on défile une fois rendu.
  useEffect(() => {
    if (!focusId) return;
    const reveal = setTimeout(() => {
      setFilter('all');
      setQuery('');
      setHighlighted(focusId);
    }, 0);
    const scroll = setTimeout(() => {
      document.getElementById(`prosp-${focusId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 120);
    const clear = setTimeout(() => setHighlighted(null), 2600);
    return () => { clearTimeout(reveal); clearTimeout(scroll); clearTimeout(clear); };
  }, [focusId]);

  const counts = Object.fromEntries(
    OUTCOME_ORDER.map(o => [o, entries.filter(e => e.outcome === o).length]),
  ) as Record<ProspectOutcome, number>;

  const tabs: { key: Filter; label: string; count: number }[] = [
    { key: 'all', label: 'Tous', count: entries.length },
    ...OUTCOME_ORDER.map(o => ({ key: o, label: PROSPECT_OUTCOME_TAB_LABEL[o], count: counts[o] })),
  ];

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = entries.filter(e => {
      if (filter !== 'all' && e.outcome !== filter) return false;
      if (!q) return true;
      return (
        e.companyName.toLowerCase().includes(q) ||
        e.contactName?.toLowerCase().includes(q) ||
        e.contactPhone?.toLowerCase().includes(q)
      );
    });
    if (sort === 'followers') rows.sort((a, b) => (b.followers ?? 0) - (a.followers ?? 0));
    else if (sort === 'name') rows.sort((a, b) => a.companyName.localeCompare(b.companyName));
    // 'recent' : on garde l'ordre fourni (déjà trié par jour puis saisie).
    return rows;
  }, [entries, filter, query, sort]);

  return (
    <div className="space-y-4">
      {/* Recherche + tri */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Rechercher une entreprise, un contact, un numéro…"
            className="w-full border border-stone-200 rounded-xl pl-9 pr-3 py-2.5 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          />
        </div>
        <select
          value={sort}
          onChange={e => setSort(e.target.value as Sort)}
          aria-label="Classer les prospects"
          className="border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent shrink-0"
        >
          {(Object.keys(SORT_LABEL) as Sort[]).map(s => (
            <option key={s} value={s}>{SORT_LABEL[s]}</option>
          ))}
        </select>
      </div>

      {/* Onglets — les 4 listes : à prospecter / prospectés / ont accepté / ont refusé */}
      <div className="flex flex-wrap gap-2">
        {tabs.map(({ key, label, count }) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer',
              filter === key
                ? 'bg-accent text-white border-accent'
                : 'bg-white text-muted border-stone-200 hover:bg-stone-50 hover:text-text',
            )}
          >
            {label}
            <span className={cn(
              'rounded-full px-1.5 text-[10px] font-semibold',
              filter === key ? 'bg-white/20 text-white' : 'bg-stone-100 text-muted',
            )}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-100 p-10 text-center">
          <Target size={28} className="text-muted mx-auto mb-3" />
          <p className="text-sm text-muted">
            {entries.length === 0
              ? 'Aucune prospection encore. Saisis ta première au-dessus.'
              : query.trim()
                ? 'Aucune entreprise ne correspond à ta recherche.'
                : 'Aucune entreprise dans cette liste pour l’instant.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {visible.map(e => (
            <div
              key={e.id}
              id={`prosp-${e.id}`}
              className={cn(
                'bg-white rounded-2xl border shadow-sm p-4 transition-shadow scroll-mt-24',
                highlighted === e.id ? 'border-accent ring-2 ring-accent/30' : 'border-stone-100',
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-text truncate">{e.companyName}</p>
                  <p className="text-[11px] text-muted">
                    {PROSPECT_NETWORK_LABEL[e.network]}
                    {e.contactMethod && <> · {PROSPECT_CONTACT_LABEL[e.contactMethod]}</>}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${PROSPECT_OUTCOME_STYLE[e.outcome]}`}>
                    {PROSPECT_OUTCOME_LABEL[e.outcome]}
                  </span>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${PROSPECT_STATUS_STYLE[e.status]}`}>
                    {PROSPECT_STATUS_LABEL[e.status]}
                  </span>
                </div>
              </div>

              {/* Contact + audience */}
              {(e.contactName || e.contactPhone || e.followers != null) && (
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-muted">
                  {e.contactName && (
                    <span className="inline-flex items-center gap-1.5">
                      <User size={13} className="shrink-0" /> {e.contactName}
                    </span>
                  )}
                  {e.contactPhone && (
                    <a href={telHref(e.contactPhone)} className="inline-flex items-center gap-1.5 text-accent font-medium hover:underline">
                      <Phone size={13} className="shrink-0" /> {e.contactPhone}
                    </a>
                  )}
                  {e.followers != null && (
                    <span className="inline-flex items-center gap-1.5">
                      <Users size={13} className="shrink-0" /> {formatFollowers(e.followers)} abonnés
                    </span>
                  )}
                </div>
              )}

              {e.concern && (
                <p className="flex items-start gap-1.5 text-xs text-muted mt-2">
                  <MessageSquare size={13} className="mt-0.5 shrink-0" /> {e.concern}
                </p>
              )}
              {e.notes && <p className="text-[11px] text-muted/80 mt-1">{e.notes}</p>}

              <p className="flex items-center gap-1.5 text-[11px] text-muted/80 mt-2">
                <CalendarDays size={12} /> {formatDate(e.prospectedAt)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
