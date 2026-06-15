import { Target, Clock } from 'lucide-react';
import Link from 'next/link';
import { getCurrentProspector } from '@/lib/employe/current';
import { listMyProspects, countDraftProspects, listMyWorkDays } from '@/lib/employe/provider';
import { ProspectForm } from '@/components/employe/ProspectForm';
import { ProspectPipeline } from '@/components/employe/ProspectPipeline';
import { SendToSupervisor } from '@/components/employe/SendToSupervisor';

export const dynamic = 'force-dynamic';

export default async function ProspectionPage({ searchParams }: { searchParams: Promise<{ focus?: string }> }) {
  const { focus } = await searchParams;
  const worker = await getCurrentProspector();
  const entries = listMyProspects(worker.id);
  const today = new Date().toISOString().slice(0, 10);

  const toContact = entries.filter(e => e.outcome === 'to_contact').length;
  const interested = entries.filter(e => e.outcome === 'interested').length;
  const refused = entries.filter(e => e.outcome === 'refused').length;
  const draftCount = countDraftProspects(worker.id);

  // Heures travaillées sur les 7 derniers jours (rappel discret du pointage).
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 6);
  const weekAgo = weekStart.toISOString().slice(0, 10);
  const hoursThisWeek = listMyWorkDays(worker.id)
    .filter(d => d.workDate >= weekAgo)
    .reduce((s, d) => s + d.hours, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-text">Prospection</h1>
        <p className="text-muted text-sm mt-1">
          Note chaque entreprise que tu démarches pour Sara : son contact, son numéro, et où elle en est.
        </p>
      </div>

      {/* Synthèse — les listes en un coup d'œil */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-sky-200 bg-sky-50/50 p-4 text-center">
          <p className="text-2xl font-bold text-sky-700">{toContact}</p>
          <p className="text-[11px] text-muted mt-0.5">À prospecter</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 text-center">
          <p className="text-2xl font-bold text-emerald-700">{interested}</p>
          <p className="text-[11px] text-muted mt-0.5">Ont accepté</p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 text-center">
          <p className="text-2xl font-bold text-amber-700">{refused}</p>
          <p className="text-[11px] text-muted mt-0.5">Ont refusé</p>
        </div>
        <div className="rounded-2xl border border-stone-100 bg-white p-4 text-center">
          <p className="text-2xl font-bold text-text">{entries.length}</p>
          <p className="text-[11px] text-muted mt-0.5">Au total</p>
        </div>
      </div>

      {/* Rappel pointage */}
      <Link
        href="/equipe/journees"
        className="flex items-center gap-3 rounded-2xl border border-stone-100 bg-white px-4 py-3 text-sm hover:bg-stone-50 transition-colors"
      >
        <Clock size={18} className="text-accent shrink-0" />
        <span className="flex-1 min-w-0 text-text">
          {hoursThisWeek > 0
            ? <><strong className="font-semibold">{hoursThisWeek}h</strong> cette semaine</>
            : 'Aucune heure enregistrée cette semaine'}
        </span>
        <span className="text-accent font-medium shrink-0">Mes journées →</span>
      </Link>

      {/* Nouvelle prospection */}
      <section className="space-y-2">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-muted uppercase tracking-wide">
          <Target size={14} className="text-accent" /> Nouvelle entreprise
        </p>
        <ProspectForm today={today} />
      </section>

      {/* Envoi au superviseur */}
      <SendToSupervisor draftCount={draftCount} />

      {/* Mon carnet — organisé par liste */}
      <section className="space-y-3">
        <p className="text-xs font-semibold text-muted uppercase tracking-wide">Mon carnet</p>
        <ProspectPipeline entries={entries} focusId={focus} />
      </section>
    </div>
  );
}
