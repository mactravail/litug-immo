import Link from 'next/link';
import { ClipboardCheck, ChevronRight, Wrench } from 'lucide-react';
import { getCurrentWorkerId } from '@/lib/employe/current';
import { listMyReports } from '@/lib/employe/provider';
import { ReportBadge } from '@/components/admin/WorkforceBadges';
import { formatDateShort, formatTime, formatFcfa } from '@/lib/utils';

export default async function MyReportsPage() {
  const workerId = await getCurrentWorkerId();
  const reports = listMyReports(workerId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-text">Mes redditions</h1>
        <p className="text-muted text-sm mt-1">L’historique de tes missions rendues et leur statut.</p>
      </div>

      {reports.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-100 p-10 text-center">
          <ClipboardCheck size={28} className="text-muted mx-auto mb-3" />
          <p className="text-sm text-muted">Aucun rendu-compte encore. Ils apparaîtront ici une fois soumis.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map(({ report, task }) => (
            <Link
              key={report.id}
              href={`/equipe/taches/${report.taskId}`}
              className="block bg-white rounded-2xl border border-stone-100 shadow-sm p-4 hover:border-accent/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-text">{task?.title ?? 'Tâche'}</p>
                  <p className="text-[11px] text-muted mt-0.5">
                    Soumis le {formatDateShort(report.submittedAt)} à {formatTime(report.submittedAt)}
                  </p>
                </div>
                <ReportBadge status={report.status} />
              </div>

              <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-line">
                <span className="text-xs text-muted">
                  Solde restitué : <strong className="text-text">{formatFcfa(report.amountRemaining)}</strong>
                </span>
                {report.status === 'needs_fix' ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600">
                    <Wrench size={13} /> À corriger
                  </span>
                ) : (
                  <ChevronRight size={16} className="text-muted" />
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
