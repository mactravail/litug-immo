import { ClipboardCheck, CheckCircle2, Wrench } from 'lucide-react';
import { getAdminProvider } from '@/lib/admin/provider';
import { ReportBadge } from '@/components/admin/WorkforceBadges';
import { ReconciliationCard } from '@/components/admin/ReconciliationCard';
import { FormButton } from '@/components/admin/FormButton';
import { validateReport, requestReportFix } from '@/app/(admin)/admin/actions';
import { formatDateShort, formatTime } from '@/lib/utils';

export default async function AdminRedditionsPage() {
  const reviews = await getAdminProvider().listReportReviews();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-text">Reddition de comptes</h1>
        <p className="text-muted text-sm mt-1">Contrôler le travail et l’argent rendu par chaque employé. L’écart de caisse est signalé en rouge.</p>
      </div>

      {reviews.length === 0 ? (
        <p className="text-sm text-muted">Aucun rendu-compte.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map(({ report, task, advance, receipts, reconciliation }) => (
            <div key={report.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 space-y-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-text">{task.title}</p>
                  <p className="text-[11px] text-muted">
                    {report.workerName} · {task.projectName} · soumis le {formatDateShort(report.submittedAt)} à {formatTime(report.submittedAt)}
                  </p>
                </div>
                <ReportBadge status={report.status} />
              </div>

              {/* Argent : réconciliation */}
              {advance && reconciliation && (
                <ReconciliationCard reconciliation={reconciliation} purpose={advance.purpose} receipts={receipts} />
              )}

              {/* Travail */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="rounded-xl bg-stone-50 border border-line p-3">
                  <p className="text-[11px] font-semibold text-text mb-1">Travail fait</p>
                  <p className="text-xs text-muted">{report.workDone}</p>
                </div>
                <div className="rounded-xl bg-stone-50 border border-line p-3">
                  <p className="text-[11px] font-semibold text-text mb-1">Reste à faire</p>
                  <p className="text-xs text-muted">{report.workRemaining ?? 'Rien à signaler.'}</p>
                </div>
              </div>

              {/* Actions */}
              {report.status === 'submitted' && (
                <div className="flex flex-wrap gap-2 pt-1">
                  <FormButton
                    action={validateReport}
                    fields={{ id: report.id }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold bg-accent text-white px-3 py-1.5 rounded-lg hover:bg-accent-bright transition-colors"
                  >
                    <CheckCircle2 size={13} /> Valider (clôture + réconcilie)
                  </FormButton>
                  <FormButton
                    action={requestReportFix}
                    fields={{ id: report.id }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted border border-line px-3 py-1.5 rounded-lg hover:bg-stone-50 transition-colors"
                  >
                    <Wrench size={13} /> Demander une correction
                  </FormButton>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="flex items-start gap-2 text-[11px] text-muted">
        <ClipboardCheck size={14} className="text-accent mt-0.5 shrink-0" />
        Valider un rendu-compte clôture la tâche et réconcilie l’avance. Tant que l’avance n’est pas réconciliée, l’employé ne peut pas en recevoir une nouvelle.
      </p>
    </div>
  );
}
