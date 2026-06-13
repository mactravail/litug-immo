import type { Metadata } from 'next';
import '../landing.css';
import '../legal.css';
import InfoShell from '@/components/layout/InfoShell';

export const metadata: Metadata = {
  title: 'Conditions d’utilisation | Litug',
  description: 'Les conditions générales d’utilisation de la plateforme Litug.',
};

export default function ConditionsPage() {
  return (
    <InfoShell>
      <header className="info-hero">
        <div className="wrap info-hero-inner">
          <span className="eyebrow">Légal</span>
          <h1>Conditions d’utilisation</h1>
          <p className="info-meta">Dernière mise à jour : juin 2026</p>
        </div>
      </header>

      <main className="info-main">
        <div className="wrap info-prose">
          <p>
            En accédant à la plateforme Litug, vous acceptez les présentes conditions
            d&apos;utilisation. Merci de les lire attentivement.
          </p>

          <h2>1. Objet</h2>
          <p>
            Litug est une plateforme de mise en relation et de confiance pour l&apos;achat
            de terrains et de maisons au Sénégal. Elle propose un agent IA WhatsApp (Sara),
            un tableau de bord vendeur, et un accompagnement vers la vérification et la
            construction via des partenaires agréés.
          </p>

          <h2>2. Rôle de la plateforme</h2>
          <p>
            Litug <strong>orchestre</strong> la relation entre les parties. Nous ne sommes
            ni notaire, ni géomètre, ni agent immobilier&nbsp;: la vérification des titres
            et la sécurisation des fonds sont assurées par nos <strong>partenaires
            agréés</strong>. Litug ne détient jamais les fonds d&apos;une transaction —
            ceux-ci restent dans le séquestre du notaire.
          </p>

          <h2>3. La mention «&nbsp;Vérifié&nbsp;»</h2>
          <p>
            Un terrain n&apos;est marqué <strong>Vérifié</strong> qu&apos;après un contrôle
            réel à la Conservation Foncière par notre notaire / géomètre. Chaque badge
            indique le professionnel, la date et le registre consulté. Aucune garantie
            absolue n&apos;est donnée&nbsp;: nous communiquons uniquement des faits vérifiés.
          </p>

          <h2>4. Obligations des vendeurs</h2>
          <ul>
            <li>Fournir des informations exactes sur leurs terrains et documents.</li>
            <li>Ne pas publier de parcelle dont ils ne détiennent pas les droits.</li>
            <li>Maintenir à jour le statut des annonces (un terrain vendu reste visible, marqué <strong>Vendu</strong>).</li>
          </ul>

          <h2>5. Obligations des acheteurs</h2>
          <ul>
            <li>Fournir des informations sincères lors de la qualification de leur projet.</li>
            <li>Comprendre qu&apos;un terrain non vérifié comporte des risques tant qu&apos;une vérification n&apos;a pas été réalisée.</li>
          </ul>

          <h2>6. Abonnements et paiements</h2>
          <p>
            Les vendeurs souscrivent à un abonnement pour accéder à Sara et au tableau de
            bord. Les modalités tarifaires sont précisées sur les pages produits. Les frais
            de vérification et de transaction sont décrits au moment de la demande.
          </p>

          <h2>7. Responsabilité</h2>
          <p>
            Litug s&apos;efforce d&apos;assurer l&apos;exactitude des informations vérifiées
            mais ne peut être tenu responsable des données fournies par des tiers avant
            vérification, ni des décisions prises sur cette base.
          </p>

          <h2>8. Modification des conditions</h2>
          <p>
            Ces conditions peuvent être mises à jour. La version applicable est celle
            publiée sur cette page à la date de votre utilisation.
          </p>

          <h2>9. Contact</h2>
          <p>
            Pour toute question, écrivez-nous à{' '}
            <a href="mailto:contact@litug.com">contact@litug.com</a> ou appelez-nous au{' '}
            <a href="tel:+393291114442">+39 329 111 4442</a> (Europe) ou au{' '}
            <a href="tel:+221775008583">+221 77 500 85 83</a> (Sénégal).
          </p>
        </div>
      </main>
    </InfoShell>
  );
}
