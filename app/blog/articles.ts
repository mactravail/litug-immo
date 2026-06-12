// Métadonnées des articles du blog — partagées entre la liste (/blog) et la page
// individuelle (/blog/[slug]). Les contenus complets ne sont pas encore rédigés :
// la page [slug] affiche un message « en cours d'écriture » + inscription.

export const CATEGORIES = ['Tous', 'Immobilier', 'Guides', 'Diaspora', 'Construction'];

export type CatColor = 'green' | 'gold' | 'blue' | 'sienna';

export type Article = {
  slug: string;
  category: string;
  catColor: CatColor;
  title: string;
  excerpt: string;
  date: string;
  readTime: number;
  gradient: string;
  featured?: boolean;
};

export const ARTICLES: Article[] = [
  {
    slug: 'eviter-arnaques-immobilieres-senegal',
    category: 'Immobilier',
    catColor: 'green',
    title: 'Comment éviter les arnaques immobilières au Sénégal',
    excerpt:
      "La fraude foncière touche des milliers de familles chaque année. Voici les 7 signaux d'alarme à ne jamais ignorer avant d'acheter un terrain.",
    date: '28 mai 2026',
    readTime: 8,
    gradient: 'linear-gradient(140deg, #200B11 0%, #7A2233 100%)',
    featured: true,
  },
  {
    slug: 'titre-foncier-bail-deliberation',
    category: 'Guides',
    catColor: 'gold',
    title: 'Titre Foncier, Bail, Délibération : quelles différences ?',
    excerpt:
      "Tout acheteur doit comprendre ces trois types de documents. Droits, risques et précautions pour chacun — expliqués clairement.",
    date: '20 mai 2026',
    readTime: 6,
    gradient: 'linear-gradient(140deg, #1a1208 0%, #8a6210 100%)',
  },
  {
    slug: 'construire-depuis-diaspora-guide-2026',
    category: 'Diaspora',
    catColor: 'blue',
    title: 'Construire depuis la diaspora : le guide complet 2026',
    excerpt:
      "Depuis l'Italie ou la France, acheter et construire au Sénégal est possible. Comment faire sans se faire piéger.",
    date: '14 mai 2026',
    readTime: 12,
    gradient: 'linear-gradient(140deg, #071428 0%, #0f3460 100%)',
  },
  {
    slug: 'mutation-fonciere-etapes',
    category: 'Guides',
    catColor: 'gold',
    title: 'La mutation foncière expliquée étape par étape',
    excerpt:
      "La mutation, c'est le transfert officiel du titre à votre nom. Un passage obligatoire que beaucoup négligent — et qui coûte cher.",
    date: '7 mai 2026',
    readTime: 5,
    gradient: 'linear-gradient(140deg, #1a0e00 0%, #6b3e00 100%)',
  },
  {
    slug: '5-questions-avant-acheter-terrain',
    category: 'Immobilier',
    catColor: 'green',
    title: "5 questions à poser avant d'acheter un terrain",
    excerpt:
      "Avant de signer, ces cinq questions simples peuvent vous épargner des mois de procédures et des pertes importantes.",
    date: '29 avril 2026',
    readTime: 4,
    gradient: 'linear-gradient(140deg, #1A070C 0%, #973047 100%)',
  },
  {
    slug: 'sequestre-notarial-senegal',
    category: 'Immobilier',
    catColor: 'green',
    title: 'Comment fonctionne le séquestre notarial au Sénégal',
    excerpt:
      "Le séquestre est la protection ultime de l'acheteur. Les fonds sont libérés uniquement à la mutation — jamais avant.",
    date: '22 avril 2026',
    readTime: 7,
    gradient: 'linear-gradient(140deg, #160609 0%, #7A2233 60%)',
  },
  {
    slug: 'choisir-architecte-senegalais',
    category: 'Construction',
    catColor: 'sienna',
    title: "Choisir un architecte au Sénégal : notre guide",
    excerpt:
      "Pas tous les architectes ne sont agréés, ni disponibles à distance. Le bon professionnel pour votre projet existe — voici comment le trouver.",
    date: '15 avril 2026',
    readTime: 6,
    gradient: 'linear-gradient(140deg, #170606 0%, #6b2020 100%)',
  },
  {
    slug: 'diaspora-immobilier-2026',
    category: 'Diaspora',
    catColor: 'blue',
    title: "La diaspora et l'immobilier sénégalais en 2026",
    excerpt:
      "Plus de 4 milliards de FCFA investis chaque année dans la pierre. Zones prisées, nouveaux risques et opportunités pour 2026.",
    date: '8 avril 2026',
    readTime: 9,
    gradient: 'linear-gradient(140deg, #050520 0%, #1a1a5e 100%)',
  },
  {
    slug: 'suivi-chantier-distance',
    category: 'Construction',
    catColor: 'sienna',
    title: 'Suivi de chantier à distance : nos conseils',
    excerpt:
      "Appels vidéo, rapports photos hebdomadaires, géomètre agréé — comment garder le contrôle sur votre chantier depuis l'Europe.",
    date: '1 avril 2026',
    readTime: 5,
    gradient: 'linear-gradient(140deg, #1a0808 0%, #8b3a3a 100%)',
  },
];
