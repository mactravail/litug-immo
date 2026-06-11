import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Clock, ClipboardList, Wallet } from 'lucide-react';
import { getAdminProvider } from '@/lib/admin/provider';
import { TEAM_ROLE_LABEL } from '@/lib/admin/labels';
import { TaskBadge, PriorityBadge } from '@/components/admin/WorkforceBadges';
import { ReconciliationCard } from '@/components/admin/ReconciliationCard';
import { formatDateShort, formatTime } from '@/lib/utils';

export default async function AdminEmployeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getAdminProvider().getEmployee(id);
  if (!data) notFound();
  const { member, tasks, sessions, totalHours, advances } = data;

  return (
    <div className="space-y-6">
      <Link href="/admin/employes" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-text transition-colors">
        <ArrowLeft size={15} /> Retour aux employés
      </Link>

      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
        <h1 className="font-display text-2xl font-semibold text-text">{member.displayName}</h1>
        <p className="text-sm text-muted mt-1">{TEAM_ROLE_LABEL[member.role]} · {member.contact ?? '—'}</p>
        <p className="text-xs text-muted mt-2">
          <Clock size={12} className="inline text-accent" /> {totalHours.toFixed(1)} h travaillées · {sessions.length} session(s)
        </p>
      </div>

      {/* Tâches */}
      <section>
        <h2 className="font-display text-lg font-semibold text-text mb-3 flex items-center gap-2"><ClipboardList size={17} className="text-accent" /> Tâches</h2>
        <div className="space-y-2">
          {tasks.length === 0 && <p className="text-sm text-muted">Aucune tâche.</p>}
          {tasks.map(t => (
            <div key={t.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-text">{t.title}</p>
                <p className="text-[11px] text-muted">{t.projectName} · <span className="font-mono text-accent">{t.landRef}</span>{t.dueDate ? ` · échéance ${formatDateShort(t.dueDate)}` : ''}</p>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <TaskBadge status={t.status} />
                <PriorityBadge priority={t.priority} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Temps de travail */}
      <section>
        <h2 className="font-display text-lg font-semibold text-text mb-3 flex items-center gap-2"><Clock size={17} className="text-accent" /> Temps de travail</h2>
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm divide-y divide-stone-100">
          {sessions.length === 0 && <p className="px-4 py-3 text-sm text-muted">Aucune session pointée.</p>}
          {sessions.map(s => (
            <div key={s.id} className="px-4 py-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text font-medium">{formatDateShort(s.startedAt)}</span>
                <span className="text-muted">
                  {formatTime(s.startedAt)} – {s.endedAt ? formatTime(s.endedAt) : 'en cours'}
                </span>
              </div>
              {s.summary && <p className="text-[11px] text-muted mt-1">{s.summary}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* Avances */}
      <section>
        <h2 className="font-display text-lg font-semibold text-text mb-3 flex items-center gap-2"><Wallet size={17} className="text-accent" /> Avances d’argent</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {advances.length === 0 && <p className="text-sm text-muted">Aucune avance.</p>}
          {advances.map(({ advance, reconciliation, receipts }) => (
            <ReconciliationCard
              key={advance.id}
              reconciliation={reconciliation}
              purpose={`${advance.purpose}${advance.reconciled ? ' · réconciliée' : ''}`}
              receipts={receipts}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
