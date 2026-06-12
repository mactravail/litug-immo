import Link from 'next/link';
import { LoginForm } from './LoginForm';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ inscrit?: string; reinitialise?: string; active?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center mb-8">
          <Link href="/" aria-label="Retour à l'accueil" className="inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Litug — accueil" className="h-20 w-auto" />
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-8">
          <h1 className="font-serif text-2xl font-semibold text-text mb-1">Connexion</h1>
          <p className="text-sm text-muted mb-6">Accédez à votre tableau de bord vendeur.</p>

          {params.active && (
            <div className="mb-4 rounded-xl bg-accent/10 border border-accent/20 px-4 py-3 text-sm text-accent">
              Compte activé ✓ Connecte-toi avec ton email et ton mot de passe pour accéder à Sara.
            </div>
          )}

          {params.inscrit && (
            <div className="mb-4 rounded-xl bg-accent/10 border border-accent/20 px-4 py-3 text-sm text-accent">
              Compte créé. Vérifiez votre email puis connectez-vous.
            </div>
          )}

          {params.reinitialise && (
            <div className="mb-4 rounded-xl bg-accent/10 border border-accent/20 px-4 py-3 text-sm text-accent">
              Mot de passe mis à jour. Vous pouvez vous connecter.
            </div>
          )}

          <LoginForm />

          <p className="text-center text-sm text-muted mt-5">
            Pas encore de compte ?{' '}
            <Link href="/register" className="text-accent font-medium hover:underline">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
