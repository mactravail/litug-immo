import Link from 'next/link';
import { MessageSquare, UserPlus } from 'lucide-react';
import { getAdminProvider } from '@/lib/admin/provider';

// Données en mémoire (mock) : on relit l'état à chaque visite, jamais de cache statique.
export const dynamic = 'force-dynamic';
import {
  PROSPECT_NETWORK_LABEL, PROSPECT_CONTACT_LABEL,
  PROSPECT_OUTCOME_LABEL, PROSPECT_OUTCOME_STYLE,
} from '@/lib/admin/labels';
import { formatDate, formatFollowers } from '@/lib/utils';
import type { ProspectEntry } from '@/lib/admin/types';

function summarize(entries: ProspectEntry[]) {
  return {
    total: entries.length,
    toContact: entries.filter(e => e.outcome === 'to_contact').length,
    interested: entries.filter(e => e.outcome === 'interested').length,
    refused: entries.filter(e => e.outcome === 'refused').length,
    noResponse: entries.filter(e => e.outcome === 'no_response').length,
  };
}

export default async function AdminProspectionPage() {
  // On ne voit que les prospections que le prospecteur a envoyées (statut « sent »).
  const entries = await getAdminProvider().listProspectEntries({ status: 'sent' });
  const all = summarize(entries);

  // Récapitulatif par prospecteur.
  const byProspector = new Map<string, { name: string; rows: ProspectEntry[] }>();
  for (const e of entries) {
    const cur = byProspector.get(e.prospectorId) ?? { name: e.prospectorName, rows: [] };
    cur.rows.push(e);
    byProspector.set(e.prospectorId, cur);
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-text">Prospection commerciale</h1>
          <p className="text-muted text-sm mt-1">
            Le carnet de bord des prospecteurs : qui a été démarché pour Sara, sur quel réseau, et le résultat.
          </p>
        </div>
        <Link
          href="/admin/prospection/nouveau"
          className="inline-flex items-center gap-2 text-sm font-semibold bg-accent text-white px-4 py-2.5 rounded-xl hover:bg-accent-bright transition-colors shrink-0"
        >
          <UserPlus size={15} /> Créer un compte prospection
        </Link>
      </div>

      {/* Synthèse globale */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-sky-200 bg-sky-50/50 p-4">
          <p className="text-2xl font-bold text-sky-700">{all.toContact}</p>
          <p className="text-[11px] text-muted mt-0.5">À prospecter</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
          <p className="text-2xl font-bold text-emerald-700">{all.interested}</p>
          <p className="text-[11px] text-muted mt-0.5">Ont accepté</p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4">
          <p className="text-2xl font-bold text-amber-700">{all.refused}</p>
          <p className="text-[11px] text-muted mt-0.5">Ont refusé</p>
        </div>
        <div className="rounded-2xl border border-stone-100 bg-white p-4">
          <p className="text-2xl font-bold text-text">{all.noResponse}</p>
          <p className="text-[11px] text-muted mt-0.5">Sans réponse</p>
        </div>
      </section>

      {/* Par prospecteur */}
      {byProspector.size > 0 && (
        <section className="space-y-2">
          <h2 className="font-display text-lg font-semibold text-text">Par prospecteur</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[...byProspector.values()].map(({ name, rows }) => {
              const s = summarize(rows);
              return (
                <div key={name} className="rounded-2xl border border-stone-100 bg-white shadow-sm p-4">
                  <p className="font-medium text-text">{name}</p>
                  <p className="text-[11px] text-muted mt-0.5">
                    {s.total} prospect{s.total > 1 ? 's' : ''} · <span className="text-emerald-700">{s.interested} accepté{s.interested > 1 ? 's' : ''}</span> · {s.refused} refus · {s.toContact} à prospecter · {s.noResponse} sans réponse
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Détail */}
      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-text">Détail des prospections</h2>

        {entries.length === 0 ? (
          <p className="bg-white rounded-2xl border border-stone-100 shadow-sm px-5 py-6 text-sm text-muted">
            Aucune prospection envoyée par les prospecteurs pour le moment.
          </p>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted border-b border-stone-100 bg-stone-50/50">
                    <th className="px-5 py-3 font-medium">Entreprise</th>
                    <th className="px-5 py-3 font-medium">Réseau</th>
                    <th className="px-5 py-3 font-medium">Résultat</th>
                    <th className="px-5 py-3 font-medium">Contact</th>
                    <th className="px-5 py-3 font-medium">Souci / remarque</th>
                    <th className="px-5 py-3 font-medium">Prospecteur</th>
                    <th className="px-5 py-3 font-medium">Jour</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {entries.map(e => (
                    <tr key={e.id} className="hover:bg-stone-50/50 align-top">
                      <td className="px-5 py-3 text-text">
                        <span className="font-medium">{e.companyName}</span>
                        {(e.contactName || e.contactPhone) && (
                          <span className="block text-[11px] text-muted mt-0.5">
                            {[e.contactName, e.contactPhone].filter(Boolean).join(' · ')}
                          </span>
                        )}
                        {e.followers != null && (
                          <span className="block text-[11px] text-muted">{formatFollowers(e.followers)} abonnés</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-muted">{PROSPECT_NETWORK_LABEL[e.network]}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-full border ${PROSPECT_OUTCOME_STYLE[e.outcome]}`}>
                          {PROSPECT_OUTCOME_LABEL[e.outcome]}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-muted">{e.contactMethod ? PROSPECT_CONTACT_LABEL[e.contactMethod] : '—'}</td>
                      <td className="px-5 py-3 text-muted max-w-xs">{e.concern ?? e.notes ?? '—'}</td>
                      <td className="px-5 py-3 text-muted">{e.prospectorName}</td>
                      <td className="px-5 py-3 text-muted whitespace-nowrap">{formatDate(e.prospectedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="md:hidden space-y-3">
              {entries.map(e => (
                <div key={e.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-text truncate">{e.companyName}</p>
                      <p className="text-[11px] text-muted">
                        {PROSPECT_NETWORK_LABEL[e.network]}
                        {e.contactMethod && <> · {PROSPECT_CONTACT_LABEL[e.contactMethod]}</>}
                      </p>
                      {(e.contactName || e.contactPhone) && (
                        <p className="text-[11px] text-muted mt-0.5">
                          {[e.contactName, e.contactPhone].filter(Boolean).join(' · ')}
                        </p>
                      )}
                      {e.followers != null && (
                        <p className="text-[11px] text-muted">{formatFollowers(e.followers)} abonnés</p>
                      )}
                    </div>
                    <span className={`shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full border ${PROSPECT_OUTCOME_STYLE[e.outcome]}`}>
                      {PROSPECT_OUTCOME_LABEL[e.outcome]}
                    </span>
                  </div>
                  {(e.concern || e.notes) && (
                    <p className="flex items-start gap-1.5 text-xs text-muted mt-2">
                      <MessageSquare size={13} className="mt-0.5 shrink-0" /> {e.concern ?? e.notes}
                    </p>
                  )}
                  <p className="text-[11px] text-muted/80 mt-2">{e.prospectorName} · {formatDate(e.prospectedAt)}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
