import Link from 'next/link';
import { ListTodo, MapPin, Wallet, CalendarClock, ChevronRight, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { getCurrentWorkerId } from '@/lib/employe/current';
import { listMyTasks } from '@/lib/employe/provider';
import { PriorityBadge, TaskBadge } from '@/components/admin/WorkforceBadges';
import { formatFcfa, formatEur, formatDateShort, cn } from '@/lib/utils';
import type { MyTaskRow } from '@/lib/employe/types';

/** Carte d'une tâche, réutilisée dans chaque section. */
function TaskCard({ row }: { row: MyTaskRow }) {
  const { task, advance, overdue, dueSoon } = row;
  return (
    <Link
      href={`/equipe/taches/${task.id}`}
      className={cn(
        'block bg-white rounded-2xl border shadow-sm p-4 sm:p-5 transition-colors hover:border-accent/30',
        overdue ? 'border-red-200' : 'border-stone-100',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <PriorityBadge priority={task.priority} />
            <TaskBadge status={task.status} />
          </div>
          <p className="text-base font-semibold text-text leading-tight">{task.title}</p>
          <p className="flex items-center gap-1.5 text-xs text-muted">
            <MapPin size={13} className="shrink-0" />
            {task.projectName} · <span className="font-mono text-accent">{task.landRef}</span>
          </p>
        </div>
        <ChevronRight size={18} className="text-muted shrink-0 mt-1" />
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-3 pt-3 border-t border-line">
        {advance ? (
          <span className="inline-flex items-center gap-1.5 text-sm">
            <Wallet size={14} className="text-accent" />
            <span className="font-semibold text-text">{formatFcfa(advance.amountGiven)}</span>
            <span className="text-[11px] text-muted">≈ {formatEur(advance.amountGiven)}</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs text-muted">
            <Wallet size={14} /> Sans avance d’argent
          </span>
        )}

        {task.dueDate && (
          <span className={cn(
            'inline-flex items-center gap-1.5 text-xs font-medium',
            overdue ? 'text-red-600' : dueSoon ? 'text-amber-600' : 'text-muted',
          )}>
            {overdue ? <AlertTriangle size={13} /> : <CalendarClock size={13} />}
            {overdue ? 'En retard — ' : dueSoon ? 'Bientôt — ' : 'Délai '}
            {formatDateShort(task.dueDate)}
          </span>
        )}
      </div>
    </Link>
  );
}

function StatCard({ value, label, tone }: { value: number; label: string; tone: 'neutral' | 'danger' | 'done' }) {
  return (
    <div className={cn(
      'rounded-2xl border p-4 text-center',
      tone === 'danger' ? 'bg-red-50/60 border-red-200' : tone === 'done' ? 'bg-emerald-50/50 border-emerald-200' : 'bg-white border-stone-100',
    )}>
      <p className={cn('text-2xl font-bold', tone === 'danger' ? 'text-red-600' : tone === 'done' ? 'text-emerald-700' : 'text-text')}>{value}</p>
      <p className="text-[11px] text-muted mt-0.5">{label}</p>
    </div>
  );
}

export default async function MyTasksPage() {
  const workerId = await getCurrentWorkerId();
  const rows = listMyTasks(workerId);

  const todo = rows.filter(r => r.task.status === 'assigned' || r.task.status === 'in_progress');
  const urgent = todo.filter(r => r.overdue || r.dueSoon);
  const normal = todo.filter(r => !r.overdue && !r.dueSoon);
  const done = rows.filter(r => r.task.status === 'reported' || r.task.status === 'validated');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-text">Mes tâches</h1>
        <p className="text-muted text-sm mt-1">Tes tâches, triées par priorité puis par délai. L’urgent est en rouge.</p>
      </div>

      {/* Synthèse */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard value={todo.length} label="À faire" tone="neutral" />
        <StatCard value={urgent.filter(r => r.overdue).length} label="En retard" tone="danger" />
        <StatCard value={done.length} label="Accomplies" tone="done" />
      </div>

      {rows.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-100 p-10 text-center">
          <ListTodo size={28} className="text-muted mx-auto mb-3" />
          <p className="text-sm text-muted">Rien à faire pour l’instant. Tes tâches apparaîtront ici dès qu’on t’en assigne.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Urgent — proche ou dépassé */}
          {urgent.length > 0 && (
            <section className="space-y-3">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-red-600 uppercase tracking-wide">
                <AlertTriangle size={14} /> Urgent — délai proche ou dépassé
              </p>
              {urgent.map(row => <TaskCard key={row.task.id} row={row} />)}
            </section>
          )}

          {/* À faire */}
          {normal.length > 0 && (
            <section className="space-y-3">
              <p className="text-xs font-semibold text-muted uppercase tracking-wide">À faire</p>
              {normal.map(row => <TaskCard key={row.task.id} row={row} />)}
            </section>
          )}

          {/* Accomplies */}
          {done.length > 0 && (
            <section className="space-y-3">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 uppercase tracking-wide">
                <CheckCircle2 size={14} /> Accomplies
              </p>
              {done.map(row => <TaskCard key={row.task.id} row={row} />)}
            </section>
          )}
        </div>
      )}
    </div>
  );
}
