import { UserCircle, Banknote, CheckCircle2, XCircle, Clock3 } from 'lucide-react';
import { getCurrentProspectorId, getRealProspectorId } from '@/lib/employe/current';
import { listMyTransfers } from '@/lib/employe/provider';
import { dbListMyTransfers } from '@/lib/employe/prospection-db';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { formatFcfa, formatEur, formatDateShort } from '@/lib/utils';
import { TransferCard } from '@/components/employe/TransferCard';

export const dynamic = 'force-dynamic';

export default async function MonComptePage() {
  const realId  = await getRealProspectorId();
  const myId    = realId ?? await getCurrentProspectorId();
  const transfers = realId
    ? await dbListMyTransfers(await createSupabaseServerClient(), realId)
    : listMyTransfers(myId);

  const pending   = transfers.filter(t => t.status === 'pending');
  const confirmed = transfers.filter(t => t.status === 'confirmed');
  const denied    = transfers.filter(t => t.status === 'denied');
  const totalReceived = confirmed.reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-text">Mon compte</h1>
        <p className="text-muted text-sm mt-1">
          L&apos;argent que le superviseur t&apos;a envoyé et son motif. Confirme ou signale si tu n&apos;as pas reçu.
        </p>
      </div>

      {/* Synthèse */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-center">
          <p className="text-2xl font-bold text-amber-700">{pending.length}</p>
          <p className="text-[11px] text-muted mt-0.5">À confirmer</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center">
          <p className="text-2xl font-bold text-emerald-700">{formatFcfa(totalReceived)}</p>
          <p className="text-[11px] text-muted mt-0.5">Total reçu</p>
        </div>
        <div className="rounded-2xl border border-stone-100 bg-white p-4 text-center">
          <p className="text-2xl font-bold text-text">{transfers.length}</p>
          <p className="text-[11px] text-muted mt-0.5">Au total</p>
        </div>
      </div>

      {/* En attente de confirmation */}
      {pending.length > 0 && (
        <section className="space-y-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 uppercase tracking-wide">
            <Clock3 size={14} /> À confirmer
          </p>
          {pending.map(t => <TransferCard key={t.id} transfer={t} />)}
        </section>
      )}

      {/* Confirmés */}
      {confirmed.length > 0 && (
        <section className="space-y-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 uppercase tracking-wide">
            <CheckCircle2 size={14} /> Reçus et confirmés
          </p>
          {confirmed.map(t => (
            <div key={t.id} className="flex items-start justify-between gap-3 bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text">{t.motif}</p>
                <p className="text-[11px] text-muted mt-0.5">
                  Envoyé le {formatDateShort(t.sentAt)}
                  {t.confirmedAt && <> · confirmé le {formatDateShort(t.confirmedAt)}</>}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-emerald-700">{formatFcfa(t.amount)}</p>
                <p className="text-[11px] text-muted">≈ {formatEur(t.amount)}</p>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Signalés non reçus */}
      {denied.length > 0 && (
        <section className="space-y-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-red-600 uppercase tracking-wide">
            <XCircle size={14} /> Signalés non reçus
          </p>
          {denied.map(t => (
            <div key={t.id} className="flex items-start justify-between gap-3 bg-white rounded-2xl border border-red-100 shadow-sm p-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text">{t.motif}</p>
                {t.denialReason && <p className="text-xs text-red-600 mt-0.5">Motif : {t.denialReason}</p>}
                <p className="text-[11px] text-muted mt-0.5">
                  Envoyé le {formatDateShort(t.sentAt)}
                  {t.deniedAt && <> · signalé le {formatDateShort(t.deniedAt)}</>}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-red-600">{formatFcfa(t.amount)}</p>
                <p className="text-[11px] text-muted">≈ {formatEur(t.amount)}</p>
              </div>
            </div>
          ))}
        </section>
      )}

      {transfers.length === 0 && (
        <div className="bg-white rounded-2xl border border-stone-100 p-10 text-center">
          <UserCircle size={28} className="text-muted mx-auto mb-3" />
          <p className="text-sm text-muted">Aucun envoi pour l&apos;instant. Les virements du superviseur apparaîtront ici.</p>
        </div>
      )}

      <p className="text-[11px] text-muted">
        <Banknote size={12} className="inline mr-1" />
        Si tu n&apos;as pas reçu un montant mentionné ici, clique <strong>Je n&apos;ai pas reçu</strong>. Le superviseur en sera informé.
      </p>
    </div>
  );
}
