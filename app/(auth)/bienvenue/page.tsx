import { WelcomeForm } from './WelcomeForm';

export default function BienvenuePage() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Litug" className="h-20 w-auto" />
        </div>

        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-8">
          <h1 className="font-serif text-2xl font-semibold text-text mb-1">Bienvenue chez Litug</h1>
          <p className="text-sm text-muted mb-6">
            Votre accès a été créé par l’administrateur. Choisissez votre mot de passe pour entrer dans votre espace.
          </p>

          <WelcomeForm />
        </div>
      </div>
    </div>
  );
}
