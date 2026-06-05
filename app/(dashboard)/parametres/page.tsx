import { ShieldCheck, Bell, CreditCard } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { getDataProvider } from '@/lib/data/provider';
import { getAuthenticatedSellerId } from '@/lib/supabase-server';
import { formatDate } from '@/lib/utils';
import { ProfileForm } from './ProfileForm';
import { CancelSubscriptionButton } from './CancelSubscriptionButton';

const SUBSCRIPTION_LABELS = {
  trial:    { label: 'Essai gratuit',      color: 'text-amber-700', bg: 'bg-amber-50' },
  active:   { label: 'Abonnement actif',   color: 'text-accent',    bg: 'bg-accent-light' },
  past_due: { label: 'Paiement en retard', color: 'text-red-700',   bg: 'bg-red-50' },
};

export default async function ParametresPage() {
  const sellerId = await getAuthenticatedSellerId();
  const seller = await getDataProvider().getSeller(sellerId);
  const sub = seller ? SUBSCRIPTION_LABELS[seller.subscriptionStatus] : null;

  return (
    <div>
      <PageHeader title="Paramètres" />

      <div className="max-w-2xl space-y-6">
        {/* Profil éditable */}
        <section className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 space-y-5">
          <h2 className="font-serif text-lg font-semibold text-text">Profil vendeur</h2>
          {seller && <ProfileForm seller={seller} />}
        </section>

        {/* Abonnement */}
        <section className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2">
            <CreditCard size={18} className="text-muted" />
            <h2 className="font-serif text-lg font-semibold text-text">Abonnement</h2>
          </div>

          {sub && (
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${sub.bg} ${sub.color}`}>
              {sub.label}
            </div>
          )}

          <ul className="space-y-2 text-sm text-muted">
            <li className="flex items-start gap-2">
              <ShieldCheck size={14} className="text-accent mt-0.5 shrink-0" />
              Agent IA WhatsApp — filtre et qualifie vos prospects 24h/24
            </li>
            <li className="flex items-start gap-2">
              <ShieldCheck size={14} className="text-accent mt-0.5 shrink-0" />
              Tableau de bord vendeur — gestion terrains, leads, statuts
            </li>
            <li className="flex items-start gap-2">
              <ShieldCheck size={14} className="text-accent mt-0.5 shrink-0" />
              Badge <strong>Vérifié</strong> après contrôle notarial
            </li>
          </ul>

          <div className="pt-2 border-t border-stone-100">
            <CancelSubscriptionButton />
          </div>
        </section>

        {/* Notifications */}
        <section className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-muted" />
            <h2 className="font-serif text-lg font-semibold text-text">Notifications</h2>
          </div>
          <p className="text-sm text-muted">Les préférences de notifications seront disponibles prochainement.</p>
        </section>

        {seller && (
          <p className="text-xs text-muted text-center">Compte créé le {formatDate(seller.createdAt)}</p>
        )}
      </div>
    </div>
  );
}
