import { FormButton } from './FormButton';
import { validateSubscription, suspendSubscription, revokeSubscription } from '@/app/(admin)/admin/actions';
import type { SubscriptionStatus } from '@/lib/admin/types';

const BTN_PRIMARY = 'text-xs font-semibold bg-accent text-white px-3 py-1.5 rounded-lg hover:bg-accent-bright transition-colors';
const BTN_GHOST = 'text-xs font-semibold text-muted border border-line px-3 py-1.5 rounded-lg hover:bg-stone-50 transition-colors';
const BTN_DANGER = 'text-xs font-semibold text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors';

/**
 * Contextual subscription actions. « Supprimer » = soft-delete (revoked),
 * never a hard delete (prompt §2.1 / CLAUDE.md §3.7). Each action is audited.
 */
export function SubscriptionActions({ id, status, subjectName }: { id: string; status: SubscriptionStatus; subjectName: string }) {
  if (status === 'revoked') {
    return <span className="text-[11px] text-muted italic">Révoqué — conservé pour l’historique</span>;
  }

  return (
    <div className="flex flex-wrap items-start gap-2">
      {status === 'pending' && (
        <FormButton action={validateSubscription} fields={{ id }} className={BTN_PRIMARY} pendingLabel="Validation…">
          Valider
        </FormButton>
      )}
      {status === 'suspended' && (
        <FormButton action={validateSubscription} fields={{ id }} className={BTN_PRIMARY} pendingLabel="…">
          Réactiver
        </FormButton>
      )}
      {status === 'active' && (
        <FormButton action={suspendSubscription} fields={{ id }} className={BTN_GHOST} pendingLabel="…">
          Suspendre
        </FormButton>
      )}
      <FormButton
        action={revokeSubscription}
        fields={{ id }}
        className={BTN_DANGER}
        confirm={`Révoquer l’abonnement de « ${subjectName} » ? Il sera conservé dans l’historique (suppression douce).`}
        pendingLabel="…"
      >
        Révoquer
      </FormButton>
    </div>
  );
}
