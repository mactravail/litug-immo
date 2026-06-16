import { Clock, CalendarDays } from 'lucide-react';
import { getCurrentProspector, getRealProspectorId } from '@/lib/employe/current';
import { listMyWorkDays, countDraftProspects } from '@/lib/employe/provider';
import { dbListWorkDays, dbCountDrafts } from '@/lib/employe/prospection-db';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { WorkDayForm } from '@/components/employe/WorkDayForm';
import { SendToSupervisor } from '@/components/employe/SendToSupervisor';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

function formatHours(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, '0')}`;
}

export default async function JourneesPage() {
  const worker = await getCurrentProspector();
  const realId = await getRealProspectorId();
  const today  = new Date().toISOString().slice(0, 10);

  let days, draftCount: number;
  if (realId) {
    const supabase = await createSupabaseServerClient();
    [days, draftCount] = await Promise.all([
      dbListWorkDays(supabase, realId),
      dbCountDrafts(supabase, realId),
    ]);
  } else {
    days       = listMyWorkDays(worker.id);
    draftCount = countDraftProspects(worker.id);
  }

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 6);
  const weekAgo      = weekStart.toISOString().slice(0, 10);
  const monthStart   = today.slice(0, 7) + '-01';
  const hoursThisWeek  = days.filter(d => d.workDate >= weekAgo).reduce((s, d) => s + d.hours, 0);
  const hoursThisMonth = days.filter(d => d.workDate >= monthStart).reduce((s, d) => s + d.hours, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-text">Mes journées de travail</h1>
        <p className="text-muted text-sm mt-1">
          Note chaque jour travaillé : la date et le nombre d'heures faites. Une saisie par jour.
        </p>
      </div>

      {/* Synthèse */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-stone-100 bg-white p-4 text-center">
          <p className="text-2xl font-bold text-text">{formatHours(hoursThisWeek)}</p>
          <p className="text-[11px] text-muted mt-0.5">Cette semaine</p>
        </div>
        <div className="rounded-2xl border border-stone-100 bg-white p-4 text-center">
          <p className="text-2xl font-bold text-text">{formatHours(hoursThisMonth)}</p>
          <p className="text-[11px] text-muted mt-0.5">Ce mois-ci</p>
        </div>
        <div className="rounded-2xl border border-stone-100 bg-white p-4 text-center">
          <p className="text-2xl font-bold text-text">{days.length}</p>
          <p className="text-[11px] text-muted mt-0.5">Jours saisis</p>
        </div>
      </div>

      {/* Nouvelle journée */}
      <section className="space-y-2">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-muted uppercase tracking-wide">
          <Clock size={14} className="text-accent" /> Enregistrer une journée
        </p>
        <WorkDayForm today={today} />
      </section>

      {/* Envoyer les prospections au superviseur */}
      <SendToSupervisor draftCount={draftCount} />

      {/* Historique */}
      <section className="space-y-3">
        <p className="text-xs font-semibold text-muted uppercase tracking-wide">Historique</p>

        {days.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-100 p-10 text-center">
            <CalendarDays size={28} className="text-muted mx-auto mb-3" />
            <p className="text-sm text-muted">Aucune journée enregistrée. Saisis ta première au-dessus.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {days.map(d => (
              <div key={d.id} className="flex items-start justify-between gap-3 bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 font-medium text-text">
                    <CalendarDays size={14} className="text-muted shrink-0" /> {formatDate(d.workDate)}
                  </p>
                  {d.note && <p className="text-xs text-muted mt-1">{d.note}</p>}
                </div>
                <span className="inline-flex items-center gap-1.5 shrink-0 rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-sm font-semibold text-text">
                  <Clock size={13} className="text-muted" /> {formatHours(d.hours)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
