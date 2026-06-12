import Link from 'next/link';
import { Lock } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { getSellerAccount } from '@/lib/supabase-server';
import { NewLandForm } from './NewLandForm';

export default async function NouveauTerrain() {
  const account = await getSellerAccount();

  return (
    <div>
      <PageHeader
        title="Ajouter un terrain"
        breadcrumbs={[{ label: 'Terrains', href: '/terrains' }, { label: 'Nouveau' }]}
      />
      <div className="max-w-2xl">
        {account.pendingVerification ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 sm:p-8 text-center">
            <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-amber-100 grid place-items-center">
              <Lock size={22} className="text-amber-700" />
            </div>
            <h2 className="font-serif text-lg font-semibold text-amber-900">
              Publication bloquée pour l&apos;instant
            </h2>
            <p className="text-sm text-amber-800 mt-2 leading-relaxed max-w-md mx-auto">
              Vous ne pouvez pas encore ajouter de terrain ni charger de photo : notre équipe doit
              d&apos;abord <b>valider votre paiement</b>. Cette vérification dure
              <b> 24&nbsp;h maximum</b>. Merci de votre patience.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center mt-5 text-sm font-semibold bg-accent text-white px-4 py-2.5 rounded-xl hover:bg-accent/90 transition-colors"
            >
              Retour au tableau de bord
            </Link>
          </div>
        ) : (
          <NewLandForm />
        )}
      </div>
    </div>
  );
}
