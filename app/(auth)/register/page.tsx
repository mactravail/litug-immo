import Link from 'next/link';
import { register } from './actions';

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Litug" className="h-20 w-auto" />
        </div>

        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-8">
          <h1 className="font-serif text-2xl font-semibold text-text mb-1">Créer un compte</h1>
          <p className="text-sm text-muted mb-6">Commencez à vendre vos terrains en toute confiance.</p>

          {params.error && (
            <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
              Inscription échouée. Vérifiez vos informations ou essayez un autre email.
            </div>
          )}

          <form action={register} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1.5" htmlFor="businessName">
                Nom / Entreprise
              </label>
              <input
                id="businessName"
                name="businessName"
                type="text"
                required
                placeholder="Immo Sénégal Diallo"
                className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1.5" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="vous@exemple.com"
                className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1.5" htmlFor="phone">
                Téléphone WhatsApp
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+33 6 12 34 56 78"
                className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1.5" htmlFor="password">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              />
            </div>
            <button
              type="submit"
              className="block w-full text-center text-sm font-semibold bg-accent text-white px-4 py-3 rounded-xl hover:bg-accent/90 transition-colors mt-2 cursor-pointer"
            >
              Créer mon compte
            </button>
          </form>

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
