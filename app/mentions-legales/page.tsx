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
          <h2>1. Éditeur du site</h2>
          <p>
            Le site <strong>litug.com</strong> est édité par Litug, immatriculée au
            registre du commerce sous le numéro <strong>SN MBR 2020 A 1863</strong> et
            identifiée par le NINEA <strong>008249436</strong>.
          </p>
          <ul>
            <li>Site : <strong>litug.com</strong></li>
            <li>Registre du commerce (RCCM) : <strong>SN MBR 2020 A 1863</strong></li>
            <li>NINEA : <strong>008249436</strong></li>
            <li>Siège social : Dakar, Sénégal</li>
            <li>E-mail : <a href="mailto:contact@litug.com">contact@litug.com</a></li>
            <li>Téléphone (Europe) : <a href="tel:+393291114442">+39 329 111 4442</a></li>
            <li>Téléphone (Sénégal) : <a href="tel:+221775008583">+221 77 500 85 83</a></li>
          </ul>

          <h2>2. Hébergement</h2>
          <p>
            Le site est hébergé par <strong>Vercel Inc.</strong>, 340 S Lemon Ave #4133,
            Walnut, CA 91789, États-Unis — <a href="https://vercel.com">vercel.com</a>.
          </p>

          <h2>3. Propriété intellectuelle</h2>
          <p>
            L&apos;ensemble des contenus présents sur le site (textes, logos, marques,
            graphismes, photographies, interface) est la propriété exclusive de
            <strong> Litug</strong> ou de ses partenaires, et est protégé par
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
            <a href="mailto:contact@litug.com">contact@litug.com</a> ou appelez-nous au{' '}
            <a href="tel:+393291114442">+39 329 111 4442</a> (Europe) ou au{' '}
            <a href="tel:+221775008583">+221 77 500 85 83</a> (Sénégal).
          </p>
        </div>
      </main>
    </InfoShell>
  );
}
