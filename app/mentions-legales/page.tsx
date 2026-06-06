import type { Metadata } from 'next';
import '../landing.css';
import '../legal.css';
import InfoShell from '@/components/layout/InfoShell';

export const metadata: Metadata = {
  title: 'Mentions légales | Litug',
  description: 'Informations légales relatives à l’éditeur et à l’hébergeur de la plateforme Litug.',
};

export default function MentionsLegalesPage() {
  return (
    <InfoShell>
      <header className="info-hero">
        <div className="wrap info-hero-inner">
          <span className="eyebrow">Légal</span>
          <h1>Mentions légales</h1>
          <p className="info-meta">Dernière mise à jour : juin 2026</p>
        </div>
      </header>

      <main className="info-main">
        <div className="wrap info-prose">
          <div className="info-note">
            Les informations entre crochets <strong>[…]</strong> sont à compléter avec
            les coordonnées officielles de la société avant la mise en ligne.
          </div>

          <h2>1. Éditeur du site</h2>
          <p>
            Le site <strong>litug.com</strong> est édité par <strong>[Raison sociale]</strong>,
            [forme juridique] au capital de [montant] FCFA, immatriculée au registre du
            commerce sous le numéro <strong>[RCCM / NINEA]</strong>.
          </p>
          <ul>
            <li>Siège social : [adresse complète], Dakar, Sénégal</li>
            <li>Directeur de la publication : [Nom du responsable]</li>
            <li>E-mail : [contact@litug.com]</li>
            <li>Téléphone : [+221 …]</li>
          </ul>

          <h2>2. Hébergement</h2>
          <p>
            Le site est hébergé par <strong>[Hébergeur]</strong> (par ex. Hostinger /
            Vercel), [adresse de l&apos;hébergeur].
          </p>

          <h2>3. Propriété intellectuelle</h2>
          <p>
            L&apos;ensemble des contenus présents sur le site (textes, logos, marques,
            graphismes, photographies, interface) est la propriété exclusive de
            <strong> [Raison sociale]</strong> ou de ses partenaires, et est protégé par
            les lois en vigueur sur la propriété intellectuelle. Toute reproduction ou
            utilisation sans autorisation écrite préalable est interdite.
          </p>

          <h2>4. Responsabilité</h2>
          <p>
            Litug met en relation acheteurs, vendeurs et professionnels agréés (notaires,
            géomètres). La mention «&nbsp;Vérifié&nbsp;» repose sur un contrôle réel effectué
            par nos partenaires à la Conservation Foncière. Litug ne saurait être tenu
            responsable des informations fournies par les vendeurs tant qu&apos;une
            vérification n&apos;a pas été réalisée et clairement signalée.
          </p>

          <h2>5. Données personnelles</h2>
          <p>
            Le traitement de vos données est décrit dans notre{' '}
            <a href="/confidentialite">politique de confidentialité</a>.
          </p>

          <h2>6. Contact</h2>
          <p>
            Pour toute question relative aux présentes mentions, écrivez-nous à{' '}
            <a href="/#contact">[contact@litug.com]</a>.
          </p>
        </div>
      </main>
    </InfoShell>
  );
}
