import type { Metadata } from 'next';
import Link from 'next/link';
import { Rocket, Heart, Globe2, ArrowRight } from 'lucide-react';
import '../landing.css';
import '../legal.css';
import InfoShell from '@/components/layout/InfoShell';

export const metadata: Metadata = {
  title: 'Carrières — Rejoindre l’équipe | Litug',
  description:
    "Aidez-nous à bâtir la plateforme de confiance pour l'immobilier au Sénégal. Découvrez nos postes ouverts et envoyez une candidature spontanée.",
};

const REASONS = [
  {
    Icon: Heart,
    title: 'Une mission qui compte',
    desc: 'Mettre fin à la fraude foncière et redonner confiance à la diaspora dans un achat parmi les plus importants de leur vie.',
  },
  {
    Icon: Rocket,
    title: 'Tôt dans l’aventure',
    desc: 'Une petite équipe, un impact direct sur le produit, et la liberté de construire les fondations de la plateforme.',
  },
  {
    Icon: Globe2,
    title: 'Entre deux rives',
    desc: 'Sénégal et Europe, terrain et tech, notaires et IA : un travail concret au croisement de plusieurs mondes.',
  },
];

const JOBS = [
  {
    title: 'Géomètre / Vérificateur foncier',
    location: 'Dakar · Terrain',
    type: 'Temps plein',
    desc: 'Vérifier les titres à la Conservation Foncière et les limites au Cadastre.',
  },
  {
    title: 'Commercial vendeurs (diaspora)',
    location: 'Remote · FR/IT',
    type: 'Temps plein',
    desc: 'Accompagner les vendeurs et promoteurs dans l’adoption de Sara.',
  },
  {
    title: 'Prospecteur réseaux sociaux (terrains)',
    location: 'Sénégal · Terrain',
    type: 'Temps plein',
    desc: 'Repérer les vendeurs de terrain sur les réseaux sociaux et leur proposer Sara.',
  },
  {
    title: 'Entreprise de construction partenaire',
    location: 'Sénégal · Partenariat',
    type: 'Collaboration',
    desc: 'Entreprise de construction professionnelle pour collaborer sur les chantiers Mustaf.',
  },
];

export default function CarrieresPage() {
  return (
    <InfoShell>
      <header className="info-hero">
        <div className="wrap info-hero-inner">
          <span className="eyebrow">Carrières</span>
          <h1>Construisez la confiance avec nous.</h1>
          <p className="info-hero-sub">
            Nous bâtissons la plateforme qui permet à la diaspora sénégalaise
            d&apos;acheter et de construire sans crainte. Si cette mission vous parle,
            nous voulons vous rencontrer.
          </p>
        </div>
      </header>

      <main className="info-main">
        <div className="wrap info-prose">
          <h2>Pourquoi nous rejoindre</h2>
          <div className="info-cards">
            {REASONS.map(({ Icon, title, desc }) => (
              <div className="info-card" key={title}>
                <span className="info-card-icon"><Icon size={20} strokeWidth={2} /></span>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>

          <h2>Postes ouverts</h2>
          {JOBS.map((job) => (
            <div className="info-job" key={job.title}>
              <div>
                <h3>{job.title}</h3>
                <p>{job.desc}</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                <span className="info-job-tags">{job.location} · {job.type}</span>
                <Link className="btn btn-ghost" href="/#contact">Postuler</Link>
              </div>
            </div>
          ))}

          <div className="info-cta">
            <h2>Aucun poste ne correspond&nbsp;?</h2>
            <p>Envoyez-nous une candidature spontanée — les bons profils trouvent toujours leur place.</p>
            <Link className="btn btn-gold btn-lg" href="/#contact">
              Candidature spontanée <ArrowRight size={17} className="arr" />
            </Link>
          </div>
        </div>
      </main>
    </InfoShell>
  );
}
