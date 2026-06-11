import { ScrollText } from 'lucide-react';
import { getAdminProvider } from '@/lib/admin/provider';
import { AUDIT_ACTION_LABEL } from '@/lib/admin/labels';
import { formatDateShort, formatTime } from '@/lib/utils';

export default async function AdminAuditPage() {
  const entries = await getAdminProvider().listAudit();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-text">Journal d’audit</h1>
        <p className="text-muted text-sm mt-1">Qui · quoi · quand · sur quel objet. Écriture seule — aucune ligne ne peut être modifiée ni effacée.</p>
      </div>

      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
        <ul className="divide-y divide-stone-100">
          {entries.map(e => (
            <li key={e.id} className="flex items-start gap-3 px-4 py-3">
              <span className="mt-0.5 p-1.5 rounded-lg bg-accent-light text-accent shrink-0"><ScrollText size={14} /></span>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-text">
                  <span className="font-semibold">{e.actorName}</span> {AUDIT_ACTION_LABEL[e.action]}
                  {e.targetLabel ? <> — <span className="text-muted">{e.targetLabel}</span></> : null}
                </p>
                {e.metadata && (
                  <p className="text-[11px] text-muted mt-0.5">
                    {Object.entries(e.metadata).map(([k, v]) => `${k}: ${String(v)}`).join(' · ')}
                  </p>
                )}
              </div>
              <span className="text-[11px] text-muted shrink-0 text-right">
                {formatDateShort(e.createdAt)}<br />{formatTime(e.createdAt)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
