import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Wallet, MapPin, CalendarClock, ClipboardCheck, Clock, FileText } from 'lucide-react';
import { getCurrentWorkerId } from '@/lib/employe/current';
import { getTaskDetail } from '@/lib/employe/provider';
import { PriorityBadge, TaskBadge, ReportBadge } from '@/components/admin/WorkforceBadges';
import { TaskClock } from '@/components/employe/TaskClock';
import { formatFcfa, formatEur, formatDateShort, formatTime } from '@/lib/utils';

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const workerId = await getCurrentWorkerId();
  const detail = getTaskDetail(workerId, id);
  if (!detail) notFound();

  const { task, advance, reconciliation, sessions, activeSession, report, totalHours } = detail;
  const canReport = task.status === 'in_progress' || task.status === 'assigned' || report?.status === 'needs_fix';

  return (
    <div className="space-y-6">
      <Link href="/equipe" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-text transition-colors">
        <ArrowLeft size={15} /> Mes tâches
      </Link>

      {/* En-tête tâche */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <PriorityBadge priority={task.priority} />
          <TaskBadge status={task.status} />
        </div>
        <h1 className="font-display text-xl sm:text-2xl font-semibold text-text leading-tight">{task.title}</h1>
        {task.description && <p className="text-sm text-muted">{task.description}</p>}

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-2 border-t border-line">
          <span className="inline-flex items-center gap-1.5 text-xs text-muted">
            <MapPin size={13} /> {task.projectName} · <span className="font-mono text-accent">{task.landRef}</span>
          </span>
          {task.dueDate && (
            <span className="inline-flex items-center gap-1.5 text-xs text-muted">
              <CalendarClock size={13} /> Délai {formatDateShort(task.dueDate)}
            </span>
          )}
          {totalHours > 0 && (
            <span className="inline-flex items-center gap-1.5 text-xs text-muted">
              <Clock size={13} /> {totalHours.toFixed(1)} h pointées
            </span>
          )}
        </div>
      </div>

      {/* Argent alloué */}
      {advance && (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 space-y-2">
          <p className="flex items-center gap-2 text-sm font-semibold text-text">
            <Wallet size={16} className="text-accent" /> Argent reçu pour cette tâche
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-text">{formatFcfa(advance.amountGiven)}</span>
            <span className="text-sm text-muted">≈ {formatEur(advance.amountGiven)}</span>
          </div>
          <p className="text-xs text-muted">{advance.purpose}</p>
          {reconciliation && (reconciliation.hasGap || reconciliation.missingReceipts) && (
            <p className="text-[11px] text-amber-600 mt-1">
              À régulariser : ajoute tes reçus et restitue le solde dans le rendu-compte.
            </p>
          )}
        </div>
      )}

      {/* Pointage */}
      {task.status !== 'validated' && task.status !== 'reported' && (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 space-y-3">
          <p className="text-sm font-semibold text-text">Pointage</p>
          <TaskClock taskId={task.id} active={!!activeSession} activeStartedAt={activeSession?.startedAt} />
        </div>
      )}

      {/* Rendu-compte : CTA ou statut */}
      {report && report.status !== 'needs_fix' ? (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-text">Rendu-compte soumis</p>
            <p className="text-[11px] text-muted">le {formatDateShort(report.submittedAt)} à {formatTime(report.submittedAt)}</p>
          </div>
          <ReportBadge status={report.status} />
        </div>
      ) : canReport ? (
        <Link
          href={`/equipe/taches/${task.id}/rendu`}
          className="flex items-center justify-center gap-2 w-full text-sm font-semibold bg-accent text-white px-5 py-3.5 rounded-xl hover:bg-accent-bright transition-colors"
        >
          <ClipboardCheck size={17} />
          {report?.status === 'needs_fix' ? 'Corriger mon rendu-compte' : 'Faire mon rendu-compte'}
        </Link>
      ) : null}

      {report?.status === 'needs_fix' && (
        <p className="flex items-start gap-2 text-xs text-red-600">
          <FileText size={14} className="mt-0.5 shrink-0" />
          Une correction t’a été demandée sur ce rendu-compte. Complète-le puis renvoie-le.
        </p>
      )}

      {/* Historique des pointages */}
      {sessions.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted uppercase tracking-wide">Pointages</p>
          {sessions.map(s => (
            <div key={s.id} className="bg-white rounded-xl border border-stone-100 p-3 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="text-text font-medium">{formatDateShort(s.startedAt)}</span>
                <span className="text-muted">
                  {formatTime(s.startedAt)} → {s.endedAt ? formatTime(s.endedAt) : <span className="text-emerald-700">en cours</span>}
                </span>
              </div>
              {s.summary && <p className="text-muted mt-1">{s.summary}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
