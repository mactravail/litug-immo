import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { getAdminProvider } from '@/lib/admin/provider';
import {
  PROSPECT_NETWORK_LABEL,
  PROSPECT_CONTACT_LABEL,
  PROSPECT_OUTCOME_LABEL,
  PROSPECT_OUTCOME_STYLE,
} from '@/lib/admin/labels';
import { formatDate, formatFollowers } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function ProspecteurProspectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getAdminProvider().getEmployee(id);
  if (!data) notFound();
  const { member } = data;
  if (member.role !== 'prospector') notFound();

  const entries = await getAdminProvider().listProspectEntries({ prospectorId: id });

  const sent   = entries.filter(e => e.status === 'sent').length;
  const drafts = entries.filter(e => e.status === 'draft').length;
  const interested = entries.filter(e => e.outcome === 'interested').length;
  const refused    = entries.filter(e => e.outcome === 'refused').length;
  const toContact  = entries.filter(e => e.outcome === 'to_contact').length;
  const noResponse = entries.filter(e => e.outcome === 'no_response').length;

  return (
    <div className="space-y-6">
      <Link href="/admin/employes" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-text transition-colors">
        <ArrowLeft size={15} /> Retour aux employés
      </Link>

      {/* En-tête */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-text">{member.displayName}</h1>
          <p className="text-sm text-muted mt-1">Prospecteur commercial · {member.contact ?? '—'}</p>
          <p className="text-xs text-muted mt-1.5">
            {sent} rendu{sent > 1 ? 's' : ''}-compte envoyé{sent > 1 ? 's' : ''}
            {drafts > 0 && <> · <span className="text-amber-600">{drafts} brouillon{drafts > 1 ? 's' : ''} en attente</span></>}
          </p>
        </div>
        <Link href={`/admin/employes/${id}`} className="text-xs text-muted hover:text-text transition-colors shrink-0">
          Fiche complète →
        </Link>
      </div>

      {/* Brouillons non envoyés */}
      {drafts > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 px-4 py-3 text-sm text-amber-800">
          {drafts} entrée{drafts > 1 ? 's' : ''} en brouillon — pas encore envoyée{drafts > 1 ? 's' : ''} au superviseur par le prospecteur.
        </div>
      )}

      {/* Synthèse */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-sky-200 bg-sky-50/50 p-4">
          <p className="text-2xl font-bold text-sky-700">{toContact}</p>
          <p className="text-[11px] text-muted mt-0.5">À prospecter</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
          <p className="text-2xl font-bold text-emerald-700">{interested}</p>
          <p className="text-[11px] text-muted mt-0.5">Ont accepté</p>
        </div>
        <div className="rounded-2xl border border-red-200 bg-red-50/50 p-4">
          <p className="text-2xl font-bold text-red-700">{refused}</p>
          <p className="text-[11px] text-muted mt-0.5">Ont refusé</p>
        </div>
        <div className="rounded-2xl border border-stone-100 bg-white p-4">
          <p className="text-2xl font-bold text-text">{noResponse}</p>
          <p className="text-[11px] text-muted mt-0.5">Sans réponse</p>
        </div>
      </div>

      {/* Rendus-compte */}
      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-text">
          Rendus-compte ({entries.length})
        </h2>

        {entries.length === 0 ? (
          <p className="bg-white rounded-2xl border border-stone-100 shadow-sm px-5 py-8 text-sm text-muted text-center">
            Aucune prospection enregistrée pour le moment.
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
                    <th className="px-5 py-3 font-medium">Mode de contact</th>
                    <th className="px-5 py-3 font-medium">Souci / remarque</th>
                    <th className="px-5 py-3 font-medium">Statut</th>
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
                      <td className="px-5 py-3 text-muted">
                        {e.contactMethod ? PROSPECT_CONTACT_LABEL[e.contactMethod] : '—'}
                      </td>
                      <td className="px-5 py-3 text-muted max-w-xs">{e.concern ?? e.notes ?? '—'}</td>
                      <td className="px-5 py-3">
                        {e.status === 'sent' ? (
                          <span className="inline-block text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">
                            Envoyé
                          </span>
                        ) : (
                          <span className="inline-block text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700">
                            Brouillon
                          </span>
                        )}
                      </td>
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
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${PROSPECT_OUTCOME_STYLE[e.outcome]}`}>
                        {PROSPECT_OUTCOME_LABEL[e.outcome]}
                      </span>
                      {e.status === 'sent' ? (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">
                          Envoyé
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700">
                          Brouillon
                        </span>
                      )}
                    </div>
                  </div>
                  {(e.concern || e.notes) && (
                    <p className="flex items-start gap-1.5 text-xs text-muted mt-2">
                      <MessageSquare size={13} className="mt-0.5 shrink-0" />
                      {e.concern ?? e.notes}
                    </p>
                  )}
                  <p className="text-[11px] text-muted/80 mt-2">{formatDate(e.prospectedAt)}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
