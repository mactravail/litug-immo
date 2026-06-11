import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, Wallet, ClipboardCheck } from 'lucide-react';
import { getCurrentWorkerId } from '@/lib/employe/current';
import { getTaskDetail } from '@/lib/employe/provider';
import { ReconciliationCard } from '@/components/admin/ReconciliationCard';
import { AddReceiptForm } from '@/components/employe/AddReceiptForm';
import { ReportForm } from '@/components/employe/ReportForm';
import { IncidentForm } from '@/components/employe/IncidentForm';

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const workerId = await getCurrentWorkerId();
  const detail = getTaskDetail(workerId, id);
  if (!detail) notFound();

  const { task, advance, receipts, reconciliation, report } = detail;
  // Rendu déjà soumis et en attente / validé → retour au détail (pas de double envoi).
  if (report && report.status !== 'needs_fix') redirect(`/equipe/taches/${id}`);

  const suggestedReturn = reconciliation ? Math.max(0, reconciliation.given - reconciliation.spent - reconciliation.returned) : 0;

  return (
    <div className="space-y-6">
      <Link href={`/equipe/taches/${id}`} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-text transition-colors">
        <ArrowLeft size={15} /> Retour à la tâche
      </Link>

      <div>
        <h1 className="font-display text-xl sm:text-2xl font-semibold text-text">Mon rendu-compte</h1>
        <p className="text-muted text-sm mt-1">{task.title}</p>
      </div>

      {/* 1. Argent — reçus + réconciliation */}
      {advance && (
        <section className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 space-y-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-text">
            <Wallet size={16} className="text-accent" /> Justifier l’argent reçu
          </p>

          {reconciliation && (
            <ReconciliationCard reconciliation={reconciliation} purpose={advance.purpose} receipts={receipts} />
          )}

          <AddReceiptForm advanceId={advance.id} taskId={task.id} />
        </section>
      )}

      {/* 2. Travail + solde rendu */}
      <section className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 space-y-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-text">
          <ClipboardCheck size={16} className="text-accent" /> Compte rendu du travail
        </p>
        <ReportForm
          taskId={task.id}
          hasAdvance={!!advance}
          suggestedReturn={suggestedReturn}
          defaults={report?.status === 'needs_fix' ? { workDone: report.workDone, workRemaining: report.workRemaining } : undefined}
        />
      </section>

      {/* 3. Problèmes (répétable) */}
      <section className="space-y-2">
        <p className="text-xs font-semibold text-muted uppercase tracking-wide">Un souci sur le chantier ?</p>
        <IncidentForm taskId={task.id} reportId={report?.id} />
      </section>
    </div>
  );
}
