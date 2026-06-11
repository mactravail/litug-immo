import { TriangleAlert } from 'lucide-react';
import { getAdminProvider } from '@/lib/admin/provider';
import { FormButton } from '@/components/admin/FormButton';
import { setAnomalyStatus } from '@/app/(admin)/admin/actions';
import { formatDateShort } from '@/lib/utils';
import type { AnomalyStatus, AnomalyTarget } from '@/lib/mustaf/types';

const STATUS_LABEL: Record<AnomalyStatus, string> = {
  open: 'Ouverte', reviewing: 'En cours d’examen', resolved: 'Résolue',
};
const STATUS_STYLE: Record<AnomalyStatus, string> = {
  open: 'bg-red-50 text-red-600 border-red-200',
  reviewing: 'bg-amber-50 text-amber-700 border-amber-200',
  resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};
const TARGET_LABEL: Record<AnomalyTarget, string> = {
  expense: 'Dépense', phase: 'Phase', media: 'Média',
};

const BTN = 'text-xs font-semibold border border-line px-3 py-1.5 rounded-lg hover:bg-stone-50 transition-colors';
const BTN_PRIMARY = 'text-xs font-semibold bg-accent text-white px-3 py-1.5 rounded-lg hover:bg-accent-bright transition-colors';

export default async function AdminAnomaliesPage() {
  const anomalies = await getAdminProvider().listAnomalies();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-text">Anomalies</h1>
        <p className="text-muted text-sm mt-1">Signalements des clients — le client est un auditeur libre, en un clic (§8.4).</p>
      </div>

      {anomalies.length === 0 ? (
        <p className="text-sm text-muted">Aucune anomalie signalée.</p>
      ) : (
        <div className="space-y-3">
          {anomalies.map(a => (
            <div key={a.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-text flex items-start gap-2">
                    <TriangleAlert size={15} className="text-red-500 mt-0.5 shrink-0" />
                    {a.message}
                  </p>
                  <p className="text-[11px] text-muted mt-1 ml-7">
                    {TARGET_LABEL[a.targetType]} · signalée par {a.raisedByName} · {formatDateShort(a.createdAt)}
                  </p>
                </div>
                <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border shrink-0 ${STATUS_STYLE[a.status]}`}>
                  {STATUS_LABEL[a.status]}
                </span>
              </div>

              {a.status !== 'resolved' && (
                <div className="flex flex-wrap gap-2 ml-7">
                  {a.status === 'open' && (
                    <FormButton action={setAnomalyStatus} fields={{ id: a.id, status: 'reviewing' }} className={BTN}>
                      Prendre en charge
                    </FormButton>
                  )}
                  <FormButton action={setAnomalyStatus} fields={{ id: a.id, status: 'resolved' }} className={BTN_PRIMARY}>
                    Marquer résolue
                  </FormButton>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
