import { Clock, AlertTriangle } from 'lucide-react';

// Bandeau d'état d'abonnement vendeur — affiché tant que l'abonnement n'est pas actif.
// Couleurs statut sémantiques (pas le bordeaux marque) : info pour l'attente,
// danger pour la suspension. L'accès au dashboard reste ouvert (pas de blocage).

const BANNERS = {
  trial: {
    icon: Clock,
    text: 'Abonnement en attente de validation — votre compte sera activé par l’équipe Litug.',
    className: 'bg-amber-50 border-amber-200 text-amber-900',
  },
  past_due: {
    icon: AlertTriangle,
    text: 'Abonnement suspendu — contactez l’équipe Litug pour réactiver votre compte.',
    className: 'bg-red-50 border-red-200 text-red-900',
  },
} as const;

export function SubscriptionBanner({ status }: { status: 'trial' | 'active' | 'past_due' }) {
  if (status === 'active') return null;
  const banner = BANNERS[status];
  const Icon = banner.icon;

  return (
    <div className={`border-b px-4 sm:px-6 py-2.5 flex items-center gap-2 text-sm ${banner.className}`}>
      <Icon className="w-4 h-4 shrink-0" aria-hidden />
      <p className="min-w-0">{banner.text}</p>
    </div>
  );
}
