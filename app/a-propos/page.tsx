import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, Eye, HandCoins, Building2, ArrowRight } from 'lucide-react';
import '../landing.css';
import '../legal.css';
import InfoShell from '@/components/layout/InfoShell';

export const metadata: Metadata = {
  title: 'À propos — Notre mission | Litug',
  description:
    "Litug permet à la diaspora sénégalaise d'acheter terrains et maisons au Sénégal sans se faire arnaquer, du titre vérifié jusqu'à la maison livrée. Notre produit, c'est la confiance.",
};

const VALUES = [
  {
    Icon: ShieldCheck,
    title: 'La confiance avant tout',
    desc: "Notre produit n'est pas une liste d'annonces — c'est la confiance. Chaque fonctionnalité doit la renforcer, sinon elle n'a pas sa place.",
  },
  {
    Icon: Eye,
    title: 'Transparence radicale',
    desc: 'Chaque terrain affiche son type de document — Titre Foncier, Bail, Délibération ou Non vérifié. Jamais de statut caché ni adouci.',
  },
  {
    Icon: HandCoins,
    title: 'L’argent chez le notaire',
    desc: "Les fonds d'une transaction restent dans le séquestre du notaire, jamais chez nous. Ils ne sont libérés qu'une fois la mutation enregistrée.",
  },
  {
    Icon: Building2,
    title: 'Du terrain à la maison',
    desc: "Nous accompagnons l'acheteur au-delà de l'achat : rendu, plan d'architecte, puis construction payée étape par étape.",
  },
];

export default function AProposPage() {
  return (
    <InfoShell>
      <header className="info-hero">
        <div className="wrap info-hero-inner">
          <span className="eyebrow">À propos</span>
          <h1>Acheter au Sénégal, sans se faire arnaquer.</h1>
          <p className="info-hero-sub">
            La fraude foncière — faux titres, même parcelle vendue plusieurs fois,
            terrains fantômes — est la grande peur de la diaspora. Litug existe pour
            y mettre fin et accompagner chaque acheteur jusqu&apos;à sa maison livrée.
          </p>
        </div>
      </header>

      <main className="info-main">
        <div className="wrap info-prose">
          <h2>Notre mission</h2>
          <p>
            Litug est une plateforme <strong>bâtie sur la confiance</strong> qui permet
            à la diaspora sénégalaise (notamment en Italie et en France) d&apos;acheter
            des terrains et des maisons au Sénégal en toute sérénité — depuis la
            vérification du titre à la <strong>Conservation Foncière</strong> jusqu&apos;à
            la remise des clés.
          </p>
          <p>
            Nous ne remplaçons ni le notaire ni le géomètre : nous travaillons
            <strong> avec eux</strong>. La plateforme orchestre, les professionnels
            agréés vérifient et sécurisent. C&apos;est ce qui rend le mot
            «&nbsp;<strong>Vérifié</strong>&nbsp;» digne de confiance.
          </p>

          <h2>Nos valeurs</h2>
          <div className="info-cards">
            {VALUES.map(({ Icon, title, desc }) => (
              <div className="info-card" key={title}>
                <span className="info-card-icon"><Icon size={20} strokeWidth={2} /></span>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>

          <div className="info-cta">
            <h2>Un terrain en vue&nbsp;? Un projet de construction&nbsp;?</h2>
            <p>Parlons-en. Sara ou un membre de l&apos;équipe vous répond sous 24h.</p>
            <Link className="btn btn-gold btn-lg" href="/#contact">
              Nous contacter <ArrowRight size={17} className="arr" />
            </Link>
          </div>
        </div>
      </main>
    </InfoShell>
  );
}
