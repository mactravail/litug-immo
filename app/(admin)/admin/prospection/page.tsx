import Link from 'next/link';
import {
  MessageSquare, UserPlus, CheckCircle2, XCircle, Clock3,
  Clock, CalendarDays, Phone, Mail, User, Banknote,
} from 'lucide-react';
import { getAdminProvider } from '@/lib/admin/provider';
import { ProspectionMarkRead } from '@/components/admin/ProspectionMarkRead';
import { SendTransferForm } from '@/components/admin/SendTransferForm';
import {
  PROSPECT_NETWORK_LABEL, PROSPECT_CONTACT_LABEL,
  PROSPECT_OUTCOME_LABEL, PROSPECT_OUTCOME_STYLE,
} from '@/lib/admin/labels';
import { formatDate, formatFollowers, formatFcfa, formatDateShort } from '@/lib/utils';
import type { ProspectEntry, ProspectorTransfer, ProspectorWorkDay } from '@/lib/admin/types';

export const dynamic = 'force-dynamic';

function summarize(entries: ProspectEntry[]) {
  return {
    total:      entries.length,
    toContact:  entries.filter(e => e.outcome === 'to_contact').length,
    interested: entries.filter(e => e.outcome === 'interested').length,
    refused:    entries.filter(e => e.outcome === 'refused').length,
    noResponse: entries.filter(e => e.outcome === 'no_response').length,
  };
}

function formatHours(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, '0')}`;
}

function isEmail(contact: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
}

function confirmedTotal(transfers: ProspectorTransfer[]): number {
  return transfers.filter(t => t.status === 'confirmed').reduce((s, t) => s + t.amount, 0);
}

export default async function AdminProspectionPage() {
  const [entries, transfers, team, workDays] = await Promise.all([
    getAdminProvider().listProspectEntries({ status: 'sent' }),
    getAdminProvider().listProspectorTransfers(),
    getAdminProvider().listTeam(),
    getAdminProvider().listProspectorWorkDays(),
  ]);

  const all = summarize(entries);

  // Tous les prospecteurs de l'équipe (source de vérité : user_roles).
  const prospectors = team.filter(m => m.role === 'prospector');

  // Index rapide des fiches envoyées par prospecteur.
  const entriesByProspector = new Map<string, ProspectEntry[]>();
  for (const e of entries) {
    const cur = entriesByProspector.get(e.prospectorId) ?? [];
    cur.push(e);
    entriesByProspector.set(e.prospectorId, cur);
  }

  return (
    <div className="space-y-8">
      <ProspectionMarkRead />

      {/* ── En-tête ── */}
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

      {/* ══════════════════════════════════════════
          MES PROSPECTEURS — section principale
          ══════════════════════════════════════════ */}
      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-text">Mes prospecteurs</h2>

        {prospectors.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-100 p-8 text-center">
            <User size={24} className="text-muted mx-auto mb-2" />
            <p className="text-sm text-muted">
              Aucun prospecteur enregistré.{' '}
              <Link href="/admin/prospection/nouveau" className="underline">Créer un compte</Link>.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {prospectors.map(m => {
              const myTransfers = transfers.filter(t => t.prospectorId === m.id);
              const myWorkDays  = workDays.filter(d => d.workerId === m.id);
              const myEntries   = entriesByProspector.get(m.id) ?? [];
              const confirmed   = confirmedTotal(myTransfers);
              const pending     = myTransfers.filter(t => t.status === 'pending').length;
              const totalHours  = myWorkDays.reduce((s, d) => s + d.hours, 0);
              const contact     = m.contact;
              const contactIsEmail = contact ? isEmail(contact) : false;
              const s = summarize(myEntries);

              return (
                <div key={m.id} className="rounded-2xl border border-stone-100 bg-white shadow-sm overflow-hidden">

                  {/* Profil */}
                  <div className="p-4 border-b border-stone-100">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center shrink-0">
                            <User size={15} className="text-muted" />
                          </div>
                          <p className="font-semibold text-text truncate">{m.displayName}</p>
                        </div>
                        {contact && (
                          <div className="flex items-center gap-1.5 mt-1.5 ml-10">
                            {contactIsEmail
                              ? <Mail  size={12} className="text-muted shrink-0" />
                              : <Phone size={12} className="text-muted shrink-0" />}
                            <p className="text-xs text-muted">{contact}</p>
                          </div>
                        )}
                      </div>
                      {totalHours > 0 && (
                        <div className="shrink-0 text-right">
                          <p className="text-base font-bold text-text">{formatHours(totalHours)}</p>
                          <p className="text-[10px] text-muted">travaillées</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Argent confirmé reçu */}
                  <div className="px-4 py-3 border-b border-stone-100 bg-stone-50/40">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-1.5">
                        <Banknote size={14} className="text-muted shrink-0" />
                        <p className="text-xs text-muted">Argent confirmé reçu</p>
                      </div>
                      <p className={`text-sm font-bold ${confirmed > 0 ? 'text-emerald-700' : 'text-muted'}`}>
                        {confirmed > 0 ? formatFcfa(confirmed) : '—'}
                      </p>
                    </div>
                    {pending > 0 && (
                      <p className="text-[11px] text-amber-700 mt-1 flex items-center gap-1">
                        <Clock3 size={11} /> {pending} virement{pending > 1 ? 's' : ''} en attente de confirmation
                      </p>
                    )}

                    {/* Historique compact des virements */}
                    {myTransfers.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {myTransfers.slice(0, 3).map(t => (
                          <div key={t.id} className="flex items-center justify-between gap-2 text-xs">
                            <span className="text-muted truncate capitalize">{t.motif}</span>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="font-medium text-text">{formatFcfa(t.amount)}</span>
                              {t.status === 'confirmed' && <CheckCircle2 size={11} className="text-emerald-600" />}
                              {t.status === 'denied'    && <XCircle      size={11} className="text-red-500"     />}
                              {t.status === 'pending'   && <Clock3       size={11} className="text-amber-500"   />}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Activité prospection */}
                  {myEntries.length > 0 && (
                    <div className="px-4 py-3 border-b border-stone-100">
                      <p className="text-[11px] text-muted uppercase tracking-wide font-semibold mb-1">Prospections envoyées</p>
                      <p className="text-xs text-muted">
                        {s.total} fiche{s.total > 1 ? 's' : ''} ·{' '}
                        <span className="text-emerald-700 font-medium">{s.interested} intéressé{s.interested > 1 ? 's' : ''}</span> ·{' '}
                        {s.refused} refus · {s.toContact} à prospecter
                      </p>
                    </div>
                  )}

                  {/* Envoyer un paiement */}
                  <div className="px-4 py-3">
                    <SendTransferForm prospectorId={m.id} prospectorName={m.displayName} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Synthèse globale des prospections ── */}
      {entries.length > 0 && (
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
      )}

      {/* ── Réponses des employés (confirmations / signalements) ── */}
      {(() => {
        const responses = transfers
          .filter(t => t.status === 'confirmed' || t.status === 'denied')
          .sort((a, b) => {
            const aDate = a.confirmedAt ?? a.deniedAt ?? a.sentAt;
            const bDate = b.confirmedAt ?? b.deniedAt ?? b.sentAt;
            return new Date(bDate).getTime() - new Date(aDate).getTime();
          });
        if (responses.length === 0) return null;
        return (
          <section className="space-y-2">
            <h2 className="font-display text-lg font-semibold text-text">Réponses des employés</h2>
            <div className="space-y-2">
              {responses.map(t => (
                <div
                  key={t.id}
                  className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${
                    t.status === 'confirmed'
                      ? 'border-emerald-200 bg-emerald-50/60'
                      : 'border-red-200 bg-red-50/60'
                  }`}
                >
                  {t.status === 'confirmed'
                    ? <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                    : <XCircle      size={16} className="text-red-500 mt-0.5 shrink-0" />}
                  <div className="min-w-0">
                    <p className={`font-medium ${t.status === 'confirmed' ? 'text-emerald-800' : 'text-red-700'}`}>
                      <span className="font-semibold">{t.prospectorName}</span>{' '}
                      {t.status === 'confirmed' ? 'a confirmé avoir reçu' : 'nie avoir reçu'}{' '}
                      <span className="font-semibold">{formatFcfa(t.amount)}</span>
                    </p>
                    <p className="text-xs text-muted mt-0.5">
                      {t.motif}
                      {t.status === 'confirmed' && t.confirmedAt && <> · Confirmé le {formatDateShort(t.confirmedAt)}</>}
                      {t.status === 'denied'    && t.deniedAt    && <> · Signalé le {formatDateShort(t.deniedAt)}</>}
                    </p>
                    {t.denialReason && (
                      <p className="text-xs text-red-600 mt-1 italic">« {t.denialReason} »</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })()}

      {/* ── Détail de toutes les fiches envoyées ── */}
      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-text">Fiches envoyées</h2>

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
