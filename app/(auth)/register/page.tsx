import Link from 'next/link';
import { Store, HardHat, ArrowRight, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Créer un compte — Litug',
  description:
    'Vendeur de terrains avec Sara, ou propriétaire qui construit avec Mustaf : choisissez votre espace pour démarrer.',
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="flex items-center justify-center mb-8">
          <Link href="/" aria-label="Retour à l'accueil" className="inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Litug — accueil" className="h-20 w-auto" />
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-8">
          <h1 className="font-serif text-2xl font-semibold text-text mb-1 text-center">
            Créer un compte
          </h1>
          <p className="text-sm text-muted mb-7 text-center">
            Choisissez votre espace. La création de compte se finalise avec votre abonnement.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Sara — vendeur */}
            <Link
              href="/sara/paiement"
              className="group flex flex-col rounded-2xl border border-stone-200 p-5 hover:border-accent hover:shadow-md transition-all"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent mb-4">
                <Store size={22} />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                Je suis vendeur
              </span>
              <span className="font-serif text-lg font-semibold text-text mt-1">Sara</span>
              <span className="text-sm text-muted mt-1.5 flex-1">
                Publiez vos terrains vérifiés et laissez Sara, votre agent IA, qualifier vos
                acheteurs.
              </span>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent mt-4 group-hover:gap-2.5 transition-all">
                Choisir Sara <ArrowRight size={16} />
              </span>
            </Link>

            {/* Mustaf — propriétaire */}
            <Link
              href="/mustaf#offres"
              className="group flex flex-col rounded-2xl border border-stone-200 p-5 hover:border-accent hover:shadow-md transition-all"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent mb-4">
                <HardHat size={22} />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                Je suis propriétaire
              </span>
              <span className="font-serif text-lg font-semibold text-text mt-1">Mustaf</span>
              <span className="text-sm text-muted mt-1.5 flex-1">
                Pilotez votre chantier à distance, en toute confiance : argent séquestré, paiement
                par phase.
              </span>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent mt-4 group-hover:gap-2.5 transition-all">
                Choisir Mustaf <ArrowRight size={16} />
              </span>
            </Link>
          </div>

          <p className="flex items-center justify-center gap-1.5 text-xs text-muted mt-6">
            <ShieldCheck size={14} /> Paiement sécurisé · Tiers de confiance
          </p>

          <p className="text-center text-sm text-muted mt-5">
            Déjà un compte ?{' '}
            <Link href="/login" className="text-accent font-medium hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
