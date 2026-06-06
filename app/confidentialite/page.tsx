import type { Metadata } from 'next';
import '../landing.css';
import '../legal.css';
import InfoShell from '@/components/layout/InfoShell';

export const metadata: Metadata = {
  title: 'Politique de confidentialité | Litug',
  description: 'Comment Litug collecte, utilise et protège vos données personnelles.',
};

export default function ConfidentialitePage() {
  return (
    <InfoShell>
      <header className="info-hero">
        <div className="wrap info-hero-inner">
          <span className="eyebrow">Légal</span>
          <h1>Politique de confidentialité</h1>
          <p className="info-meta">Dernière mise à jour : juin 2026</p>
        </div>
      </header>

      <main className="info-main">
        <div className="wrap info-prose">
          <p>
            La confiance est au cœur de Litug — y compris dans la manière dont nous
            traitons vos données. Cette politique explique quelles informations nous
            collectons, pourquoi, et quels sont vos droits.
          </p>

          <h2>1. Données que nous collectons</h2>
          <ul>
            <li><strong>Identité &amp; contact</strong> : nom, e-mail, numéro WhatsApp.</li>
            <li><strong>Projet immobilier</strong> : budget, zone recherchée, type de document souhaité.</li>
            <li><strong>Conversations</strong> : messages échangés avec notre agent IA Sara sur WhatsApp.</li>
            <li><strong>Données vendeur</strong> : terrains, photos et documents importés sur le tableau de bord.</li>
            <li><strong>Données techniques</strong> : informations de connexion et d&apos;usage du site.</li>
          </ul>

          <h2>2. Pourquoi nous les utilisons</h2>
          <ul>
            <li>Répondre à vos demandes et qualifier votre projet via Sara.</li>
            <li>Mettre en relation acheteurs, vendeurs et professionnels agréés.</li>
            <li>Organiser la vérification d&apos;un terrain auprès d&apos;un notaire / géomètre.</li>
            <li>Améliorer la plateforme et assurer sa sécurité.</li>
          </ul>

          <h2>3. Partage des données</h2>
          <p>
            Vos données ne sont jamais vendues. Elles peuvent être partagées uniquement
            avec les <strong>partenaires nécessaires à votre demande</strong> (notaire,
            géomètre, vendeur concerné) et avec nos prestataires techniques (hébergement,
            messagerie WhatsApp Business officielle), dans la stricte limite de leur
            finalité.
          </p>

          <h2>4. Conservation</h2>
          <p>
            Nous conservons vos données aussi longtemps que nécessaire à la fourniture du
            service, puis pendant les durées légales applicables. Vous pouvez demander leur
            suppression à tout moment.
          </p>

          <h2>5. Sécurité</h2>
          <p>
            Les documents et photos sensibles sont stockés dans des espaces privés à accès
            restreint. L&apos;accès aux données est protégé et limité aux personnes
            autorisées.
          </p>

          <h2>6. Vos droits</h2>
          <p>
            Vous disposez d&apos;un droit d&apos;accès, de rectification, de suppression et
            d&apos;opposition concernant vos données. Pour exercer ces droits, écrivez-nous à{' '}
            <a href="/#contact">[contact@litug.com]</a>.
          </p>

          <h2>7. Modifications</h2>
          <p>
            Cette politique peut évoluer. Toute mise à jour sera publiée sur cette page avec
            une nouvelle date de révision.
          </p>
        </div>
      </main>
    </InfoShell>
  );
}
