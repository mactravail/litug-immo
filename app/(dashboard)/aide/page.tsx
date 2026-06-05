import { LifeBuoy, MessageCircle, Mail, BookOpen, ChevronDown } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';

const FAQ = [
  {
    q: 'Comment faire vérifier mon terrain ?',
    a: "Sur la page de votre terrain, cliquez sur « Demander la vérification ». Notre notaire partenaire procédera au contrôle à la Conservation Foncière et au Cadastre sous 5 à 10 jours ouvrés.",
  },
  {
    q: 'Quelle est la différence entre Titre Foncier, Bail et Délibération ?',
    a: "Le Titre Foncier (🟢) est la forme la plus solide — propriété pleinement enregistrée. Le Bail (🟡) est un bail emphytéotique de l'État, solide mais sans pleine propriété. La Délibération (🔴) est une attribution municipale, plus précaire et où la plupart des fraudes surviennent.",
  },
  {
    q: "Comment fonctionne l'agent IA WhatsApp ?",
    a: "L'agent répond automatiquement à vos prospects 24h/24, filtre leur budget et leur zone, puis vous alerte quand un acheteur sérieux mérite votre attention directe. Vous n'intervenez qu'au bon moment.",
  },
  {
    q: "Où va l'argent lors d'une transaction ?",
    a: "Les fonds sont toujours déposés dans le séquestre du notaire — jamais sur nos comptes. Ils ne sont libérés au vendeur qu'après que la mutation (transfert de titre) est enregistrée au nom de l'acheteur.",
  },
  {
    q: 'Comment résilier mon abonnement ?',
    a: "Rendez-vous dans Paramètres → Abonnement → « Résilier mon abonnement ». Votre accès reste actif jusqu'à la fin de la période en cours.",
  },
];

export default function AidePage() {
  return (
    <div>
      <PageHeader title="Aide et support" />

      <div className="max-w-2xl space-y-6">

        {/* Contacter le support */}
        <section className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2">
            <LifeBuoy size={18} className="text-muted" />
            <h2 className="font-serif text-lg font-semibold text-text">Contacter le support</h2>
          </div>
          <p className="text-sm text-muted">
            Notre équipe est disponible du lundi au vendredi, 9h–18h (heure de Dakar).
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href="https://wa.me/221775008583?text=Bonjour%2C%20j%27ai%20besoin%20d%27aide%20avec%20TerreV%C3%A9rifi%C3%A9e."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-xl border border-stone-200 hover:border-accent hover:bg-accent-light transition-colors group"
            >
              <MessageCircle size={20} className="text-accent shrink-0" />
              <div>
                <p className="text-sm font-semibold text-text group-hover:text-accent transition-colors">WhatsApp</p>
                <p className="text-xs text-muted">Réponse rapide</p>
              </div>
            </a>
            <a
              href="mailto:mactravail23@gmail.com"
              className="flex items-center gap-3 p-4 rounded-xl border border-stone-200 hover:border-accent hover:bg-accent-light transition-colors group"
            >
              <Mail size={20} className="text-accent shrink-0" />
              <div>
                <p className="text-sm font-semibold text-text group-hover:text-accent transition-colors">Email</p>
                <p className="text-xs text-muted">mactravail23@gmail.com</p>
              </div>
            </a>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-muted" />
            <h2 className="font-serif text-lg font-semibold text-text">Questions fréquentes</h2>
          </div>
          <div className="divide-y divide-stone-100">
            {FAQ.map((item, i) => (
              <details key={i} className="group py-4 first:pt-0 last:pb-0">
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none">
                  <span className="text-sm font-medium text-text">{item.q}</span>
                  <ChevronDown
                    size={16}
                    className="text-muted shrink-0 transition-transform group-open:rotate-180"
                  />
                </summary>
                <p className="mt-3 text-sm text-muted leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <p className="text-xs text-muted text-center">TerreVérifiée — Votre partenaire de confiance pour l'immobilier au Sénégal</p>
      </div>
    </div>
  );
}
