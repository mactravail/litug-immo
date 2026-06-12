import { Target, MessageSquare, CalendarDays } from 'lucide-react';
import { getCurrentProspector } from '@/lib/employe/current';
import { listMyProspects, countDraftProspects } from '@/lib/employe/provider';
import { ProspectForm } from '@/components/employe/ProspectForm';
import { SendToSupervisor } from '@/components/employe/SendToSupervisor';
import {
  PROSPECT_NETWORK_LABEL, PROSPECT_CONTACT_LABEL,
  PROSPECT_OUTCOME_LABEL, PROSPECT_OUTCOME_STYLE,
  PROSPECT_STATUS_LABEL, PROSPECT_STATUS_STYLE,
} from '@/lib/admin/labels';
import { formatDate } from '@/lib/utils';
import type { ProspectEntry } from '@/lib/admin/types';

export const dynamic = 'force-dynamic';

function groupByDay(entries: ProspectEntry[]): { day: string; rows: ProspectEntry[] }[] {
  const map = new Map<string, ProspectEntry[]>();
  for (const e of entries) {
    const list = map.get(e.prospectedAt) ?? [];
    list.push(e);
    map.set(e.prospectedAt, list);
  }
  return [...map.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([day, rows]) => ({ day, rows }));
}

export default async function ProspectionPage() {
  const worker = await getCurrentProspector();
  const entries = listMyProspects(worker.id);
  const today = new Date().toISOString().slice(0, 10);

  const todayCount = entries.filter(e => e.prospectedAt === today).length;
  const interested = entries.filter(e => e.outcome === 'interested').length;
  const draftCount = countDraftProspects(worker.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-text">Prospection</h1>
        <p className="text-muted text-sm mt-1">
          Note chaque vendeur que tu démarches pour Sara : le réseau, s’il a répondu, et son retour.
        </p>
      </div>

      {/* Synthèse */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-stone-100 bg-white p-4 text-center">
          <p className="text-2xl font-bold text-text">{todayCount}</p>
          <p className="text-[11px] text-muted mt-0.5">Aujourd’hui</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 text-center">
          <p className="text-2xl font-bold text-emerald-700">{interested}</p>
          <p className="text-[11px] text-muted mt-0.5">Intéressés</p>
        </div>
        <div className="rounded-2xl border border-stone-100 bg-white p-4 text-center">
          <p className="text-2xl font-bold text-text">{entries.length}</p>
          <p className="text-[11px] text-muted mt-0.5">Au total</p>
        </div>
      </div>

      {/* Nouvelle prospection */}
      <section className="space-y-2">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-muted uppercase tracking-wide">
          <Target size={14} className="text-accent" /> Nouvelle prospection
        </p>
        <ProspectForm today={today} />
      </section>

      {/* Envoi au superviseur */}
      <SendToSupervisor draftCount={draftCount} />

      {/* Mon carnet */}
      <section className="space-y-4">
        <p className="text-xs font-semibold text-muted uppercase tracking-wide">Mon carnet</p>

        {entries.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-100 p-10 text-center">
            <Target size={28} className="text-muted mx-auto mb-3" />
            <p className="text-sm text-muted">Aucune prospection encore. Saisis ta première au-dessus.</p>
          </div>
        ) : (
          groupByDay(entries).map(({ day, rows }) => (
            <div key={day} className="space-y-2">
              <p className="flex items-center gap-1.5 text-xs font-medium text-muted">
                <CalendarDays size={13} /> {formatDate(day)} · {rows.length} prospect{rows.length > 1 ? 's' : ''}
              </p>
              <div className="space-y-2">
                {rows.map(e => (
                  <div key={e.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
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
                    {e.concern && (
                      <p className="flex items-start gap-1.5 text-xs text-muted mt-2">
                        <MessageSquare size={13} className="mt-0.5 shrink-0" /> {e.concern}
                      </p>
                    )}
                    {e.notes && <p className="text-[11px] text-muted/80 mt-1">{e.notes}</p>}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
