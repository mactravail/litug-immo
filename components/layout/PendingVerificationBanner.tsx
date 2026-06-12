import { Clock } from 'lucide-react';

// Bandeau affiché sur toutes les pages du dashboard tant que le paiement du vendeur
// n'est pas validé par l'équipe Litug. Couleur statut sémantique (ambre = attente),
// pas la couleur de marque. Le vendeur peut naviguer mais ne peut rien publier.
export function PendingVerificationBanner() {
  return (
    <div className="border-b border-amber-200 bg-amber-50 text-amber-900 px-4 sm:px-6 py-2.5 flex items-start gap-2 text-sm">
      <Clock className="w-4 h-4 shrink-0 mt-0.5" aria-hidden />
      <p className="min-w-0">
        <b>Compte en cours de validation.</b> Nous vérifions votre paiement — vous pourrez publier
        vos terrains dès qu&apos;il sera confirmé (sous 24&nbsp;h maximum).
      </p>
    </div>
  );
}
