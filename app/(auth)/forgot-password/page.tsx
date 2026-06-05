import { ForgotPasswordForm } from './ForgotPasswordForm';

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Litug" className="h-20 w-auto" />
        </div>

        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-8">
          <h1 className="font-serif text-2xl font-semibold text-text mb-1">Mot de passe oublié</h1>
          <p className="text-sm text-muted mb-6">
            Saisissez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
          </p>

          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
}
