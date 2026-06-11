import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn, formatFcfa } from '@/lib/utils';
import type { AdvanceReconciliation, AdvanceReceipt } from '@/lib/admin/types';

interface Props {
  reconciliation: AdvanceReconciliation;
  purpose: string;
  receipts: AdvanceReceipt[];
}

/**
 * Cash-advance reconciliation — donné / dépensé / rendu, with the gap and any
 * missing receipt flagged in red (the anti-fraud heart of Volet B, prompt §2.4).
 */
export function ReconciliationCard({ reconciliation: r, purpose, receipts }: Props) {
  const flagged = r.hasGap || r.missingReceipts;

  return (
    <div className={cn('rounded-2xl border p-4 space-y-3', flagged ? 'border-red-200 bg-red-50/50' : 'border-emerald-200 bg-emerald-50/40')}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-text">Réconciliation de l’avance</p>
        {flagged ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600"><AlertTriangle size={13} /> Écart détecté</span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700"><CheckCircle2 size={13} /> Conforme</span>
        )}
      </div>
      <p className="text-[11px] text-muted">{purpose}</p>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-white border border-line py-2">
          <p className="text-[10px] text-muted uppercase tracking-wide">Donné</p>
          <p className="text-sm font-semibold text-text mt-0.5">{formatFcfa(r.given)}</p>
        </div>
        <div className="rounded-xl bg-white border border-line py-2">
          <p className="text-[10px] text-muted uppercase tracking-wide">Dépensé</p>
          <p className="text-sm font-semibold text-text mt-0.5">{formatFcfa(r.spent)}</p>
        </div>
        <div className="rounded-xl bg-white border border-line py-2">
          <p className="text-[10px] text-muted uppercase tracking-wide">Rendu</p>
          <p className="text-sm font-semibold text-text mt-0.5">{formatFcfa(r.returned)}</p>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted">Écart (donné − dépensé − rendu)</span>
        <span className={cn('font-bold', r.hasGap ? 'text-red-600' : 'text-emerald-700')}>{formatFcfa(r.gap)}</span>
      </div>

      {r.missingReceipts && (
        <p className="flex items-start gap-1.5 text-[11px] text-red-600">
          <AlertTriangle size={12} className="mt-0.5 shrink-0" />
          Dépense sans reçu : {formatFcfa(r.spent - receipts.reduce((s, x) => s + x.amount, 0))} non justifié(s).
        </p>
      )}

      {receipts.length > 0 && (
        <div className="border-t border-line pt-2 space-y-1">
          <p className="text-[11px] font-medium text-text">Reçus ({receipts.length})</p>
          {receipts.map(rec => (
            <div key={rec.id} className="flex items-center justify-between text-[11px]">
              <a href={rec.fileUrl ?? '#'} className="text-accent hover:underline truncate">{rec.label}</a>
              <span className="text-muted shrink-0">{formatFcfa(rec.amount)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
