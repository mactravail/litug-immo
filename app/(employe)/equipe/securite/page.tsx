import { ShieldCheck } from 'lucide-react';
import { ChangePasswordForm } from '@/components/account/ChangePasswordForm';

export default function EquipeSecuritePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-text">Sécurité du compte</h1>
        <p className="text-muted text-sm mt-1">Gérez le mot de passe de votre compte.</p>
      </div>

      <section>
        <h2 className="font-display text-lg font-semibold text-text mb-1 flex items-center gap-2">
          <ShieldCheck size={17} className="text-accent" /> Mot de passe
        </h2>
        <p className="text-xs text-muted mb-4">
          On vous demande votre mot de passe actuel avant tout changement. Choisissez un mot de passe d’au moins 8 caractères.
        </p>
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
          <ChangePasswordForm />
        </div>
      </section>
    </div>
  );
}
