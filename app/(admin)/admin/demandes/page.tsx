import { Inbox, Store, HardHat, ShieldCheck, AlertCircle } from 'lucide-react';
import { listPendingAccounts, type PendingAccount } from '@/lib/admin/pending-accounts';
import { validateAccountRequest } from '@/app/(admin)/admin/actions';
import { FormButton } from '@/components/admin/FormButton';
import { formatDateShort } from '@/lib/utils';

// Données réelles (comptes auth Supabase) qui changent à chaque validation —
// jamais de cache statique : on relit à chaque affichage.
export const dynamic = 'force-dynamic';

const STAGE_LABEL: Record<string, string> = {
  plans: 'Plans/permis — pas commencé',
  permis: 'Permis obtenu',
  fondation: 'Fondation réalisée',
  elevation: 'Élévation en cours',
  autre: 'Autre',
};

const METHOD_LABEL: Record<string, string> = {
  wave: 'Wave', mastercard: 'Carte', paypal: 'PayPal', stripe: 'Stripe',
};

const BTN_PRIMARY =
  'text-xs font-semibold bg-accent text-white px-3.5 py-2 rounded-lg hover:bg-accent-bright transition-colors';

function TypeBadge({ type }: { type: PendingAccount['type'] }) {
  return type === 'owner' ? (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
      <HardHat size={12} /> Client Mustaf
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
      <Store size={12} /> Vendeur Sara
    </span>
  );
}

export default async function DemandesPage() {
  const result = await listPendingAccounts();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-text flex items-center gap-2.5">
          <Inbox size={26} className="text-accent" />
          Demandes à valider
        </h1>
        <p className="text-muted text-sm mt-1">
          Nouveaux comptes (vendeurs Sara et clients Mustaf) en attente de contrôle du paiement.
          Validez la demande pour débloquer leur tableau de bord.
        </p>
      </div>

      <div className="flex items-start gap-2.5 rounded-xl bg-stone-50 border border-stone-100 px-4 py-3 text-xs text-muted">
        <ShieldCheck size={15} className="mt-0.5 shrink-0 text-accent" />
        <span>
          Vérifiez que le paiement a bien été reçu <strong>avant</strong> de valider. La validation
          lève le verrou de publication et est tracée dans le journal d’audit.
        </span>
      </div>

      {!result.ok ? (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900">
          <AlertCircle size={18} className="shrink-0 mt-0.5 text-amber-700" />
          <div>
            {result.reason === 'not_configured' ? (
              <>
                <p className="font-semibold">Service de validation non configuré</p>
                <p className="mt-1 text-amber-800">
                  Définissez <code className="font-mono">SUPABASE_SERVICE_ROLE_KEY</code> dans
                  <code className="font-mono"> .env.local</code> pour lister et valider les vrais comptes.
                </p>
              </>
            ) : (
              <>
                <p className="font-semibold">Lecture impossible</p>
                <p className="mt-1 text-amber-800">{result.message}</p>
              </>
            )}
          </div>
        </div>
      ) : result.accounts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-stone-100">
          <Inbox size={32} className="mx-auto text-muted/50" />
          <p className="text-sm font-medium text-text mt-3">Aucune demande en attente</p>
          <p className="text-xs text-muted mt-1">Les nouveaux paiements apparaîtront ici pour validation.</p>
        </div>
      ) : (
        <>
          {/* Desktop */}
          <div className="hidden md:block bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted border-b border-stone-100 bg-stone-50/50">
                  <th className="px-5 py-3 font-medium">Demandeur</th>
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 font-medium">Paiement</th>
                  <th className="px-5 py-3 font-medium">Reçu le</th>
                  <th className="px-5 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {result.accounts.map((a) => (
                  <tr key={a.id} className="hover:bg-stone-50/50 align-top">
                    <td className="px-5 py-4">
                      <p className="font-medium text-text">{a.name}</p>
                      <p className="text-[11px] text-muted">{a.email}{a.phone ? ` · ${a.phone}` : ''}</p>
                      {a.businessName && <p className="text-[11px] text-muted">Activité : {a.businessName}</p>}
                      {a.type === 'owner' && a.reason && (
                        <p className="text-[11px] text-muted mt-1 max-w-md">
                          <span className="font-semibold">Sans Phase 0 :</span> {a.reason}
                        </p>
                      )}
                      {a.type === 'owner' && a.worksStarted && (
                        <p className="text-[11px] text-amber-700 mt-0.5">
                          Travaux : {STAGE_LABEL[a.worksStage ?? ''] ?? a.worksStage}
                          {a.worksStageDetail ? ` — ${a.worksStageDetail}` : ''}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4"><TypeBadge type={a.type} /></td>
                    <td className="px-5 py-4 text-muted">{a.paymentMethod ? (METHOD_LABEL[a.paymentMethod] ?? a.paymentMethod) : '—'}</td>
                    <td className="px-5 py-4 text-muted">{formatDateShort(a.createdAt)}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end">
                        <FormButton action={validateAccountRequest} fields={{ id: a.id }} className={BTN_PRIMARY} pendingLabel="Validation…">
                          Valider la demande
                        </FormButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="md:hidden space-y-3">
            {result.accounts.map((a) => (
              <div key={a.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-text truncate">{a.name}</p>
                    <p className="text-[11px] text-muted truncate">{a.email}</p>
                    {a.phone && <p className="text-[11px] text-muted">{a.phone}</p>}
                  </div>
                  <TypeBadge type={a.type} />
                </div>
                {a.type === 'owner' && a.reason && (
                  <p className="text-xs text-muted"><span className="font-semibold">Sans Phase 0 :</span> {a.reason}</p>
                )}
                {a.type === 'owner' && a.worksStarted && (
                  <p className="text-xs text-amber-700">
                    Travaux : {STAGE_LABEL[a.worksStage ?? ''] ?? a.worksStage}
                    {a.worksStageDetail ? ` — ${a.worksStageDetail}` : ''}
                  </p>
                )}
                <div className="flex items-center justify-between text-[11px] text-muted">
                  <span>Paiement : {a.paymentMethod ? (METHOD_LABEL[a.paymentMethod] ?? a.paymentMethod) : '—'}</span>
                  <span>{formatDateShort(a.createdAt)}</span>
                </div>
                <FormButton action={validateAccountRequest} fields={{ id: a.id }} className={`${BTN_PRIMARY} w-full text-center`} pendingLabel="Validation…">
                  Valider la demande
                </FormButton>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
