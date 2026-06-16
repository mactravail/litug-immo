'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { SENEGAL_PATHS } from './senegal-map';
import './landing.css';

/* ------------------------------------------------------------------ */
/* TYPES                                                               */
/* ------------------------------------------------------------------ */
type Lang = 'fr' | 'en';

/* ------------------------------------------------------------------ */
/* DATA                                                                */
/* ------------------------------------------------------------------ */
const I18N = {
  fr: {
    nav: { terrains: "Terrains", comment: "Comment ça marche", garanties: "Nos garanties", tarifs: "Tarifs", blog: "Blog", login: "Se connecter", cta: "Réserver un entretien" },
    hero: {
      badge: "Vol. Arnaque. Gaspillage · Plus jamais",
      title_1: "Vendez plus de terrains.",
      title_2: "Construisez sans stress.",
      sub: "Qui vous a dit qu'il fallait des millions pour commencer à construire votre maison ? Avec Litug, commencez votre projet dès 1 000 FCFA et gardez le contrôle total sur chaque dépense, où que vous soyez dans le monde.",
      cta_primary: "Je veux construire ma maison",
      cta_secondary: "Je vends des terrains",
      proof: "Déjà utilisé par des vendeurs, architectes et professionnels de l'immobilier",
      checks: [
        "Commencez à partir de 1 000 FCFA",
        "Chaque franc est tracé et justifié",
        "Suivi des travaux en temps réel",
        "Votre maison avance, même à distance",
      ],
    },
    reassure: [
      "Dépenses et factures accessibles à tout moment",
      "Budget sous contrôle du début à la fin",
      "Tableau de bord personnel et sécurisé",
      "Participation de toute la famille au projet",
    ],
    marquee: { label: "Des professionnels nous font déjà confiance" },
    probleme: {
      tag: "Sans Sara",
      title: "Combien de ventes perdez-vous sans même le savoir ?",
      head: [
        { t: "p", v: "Chaque jour, des acheteurs vous écrivent." },
        { t: "p", v: "Chaque jour, certains repartent sans réponse." },
        { t: "p", v: "Chaque jour, certains achètent ailleurs." },
        { t: "p", v: "Et vous ne le saurez jamais." },
        { t: "x", v: "Vous perdez des acheteurs parce qu'un concurrent a répondu avant vous." },
        { t: "x", v: "Vous manquez des appels pendant que vous travaillez." },
        { t: "x", v: "Des dizaines de messages chaque semaine — et certains restent sans réponse." },
      ],
      more: [
        { t: "h", v: "Les problèmes des vendeurs de terrains" },
        { t: "x", v: "Répondre toujours aux mêmes questions :" },
        { t: "p", v: "« Quel est le prix ? » · « Où se trouve le terrain ? » · « Quels papiers avez-vous ? » · « Peut-on payer par tranche ? » · « Quand puis-je visiter ? »" },
        { t: "p", v: "Encore. Et encore. Et encore." },
        { t: "x", v: "Recevoir des dizaines, voire des centaines de messages chaque semaine." },
        { t: "x", v: "Répondre tardivement." },
        { t: "x", v: "Oublier certains prospects." },
        { t: "x", v: "Répondre différemment selon votre humeur ou votre disponibilité." },
        { t: "x", v: "Passer des heures sur WhatsApp." },
        { t: "x", v: "Répondre à des personnes alors que le terrain est déjà vendu." },
        { t: "h", v: "Pendant que vous dormez…" },
        { t: "p", v: "Vos prospects continuent à chercher." },
        { t: "p", v: "Vos concurrents continuent à répondre." },
        { t: "p", v: "Vos concurrents continuent à vendre." },
        { t: "h", v: "Le coût caché" },
        { t: "p", v: "Chaque prospect perdu est une vente potentielle perdue." },
        { t: "p", v: "Et une seule vente perdue peut représenter des centaines de milliers, voire des millions de FCFA." },
        { t: "h", v: "Embaucher un commercial ?" },
        { t: "x", v: "Salaire mensuel." },
        { t: "x", v: "Charges." },
        { t: "x", v: "Horaires limités." },
        { t: "x", v: "Congés." },
        { t: "x", v: "Maladie." },
        { t: "x", v: "Seulement 8 heures par jour." },
        { t: "x", v: "Seulement 5 ou 6 jours par semaine." },
        { t: "p", v: "Et malgré cela, certains prospects restent sans réponse." },
        { t: "h", v: "La vérité" },
        { t: "p", v: "Aujourd'hui, ce ne sont pas toujours les meilleurs terrains qui se vendent. Ce sont souvent les vendeurs qui répondent le plus vite." },
        { t: "p", v: "Et dans l'immobilier, quelques minutes peuvent faire la différence entre une vente gagnée et une vente perdue." },
      ],
    },
    agitation: {
      tag: "Sans Mustaf",
      title: "Combien de Sénégalais de la diaspora ont envoyé de l'argent pendant des années…",
      head: [
        { t: "p", v: "…pour revenir au pays et découvrir que la maison n'existe pas ?" },
        { t: "p", v: "Ou qu'elle est à moitié construite. Ou que l'argent a disparu." },
        { t: "x", v: "Vous envoyez de l'argent." },
        { t: "x", v: "On vous dit que les travaux avancent." },
        { t: "x", v: "On vous envoie quelques photos." },
        { t: "x", v: "On vous rassure." },
        { t: "x", v: "Vous continuez à payer." },
        { t: "p", v: "Puis un jour vous revenez… et vous découvrez la vérité." },
      ],
      more: [
        { t: "h", v: "Les problèmes que vivent chaque jour des milliers de familles" },
        { t: "x", v: "Argent envoyé à des proches qui disparaît sans explication." },
        { t: "x", v: "Dépenses impossibles à vérifier." },
        { t: "x", v: "Factures inexistantes." },
        { t: "x", v: "Matériaux achetés à des prix gonflés." },
        { t: "x", v: "Ouvriers payés mais absents du chantier." },
        { t: "x", v: "Travaux qui durent des années." },
        { t: "x", v: "Entreprises qui promettent tout avant le paiement et deviennent injoignables après." },
        { t: "x", v: "Chantiers abandonnés." },
        { t: "x", v: "Budgets dépassés de plusieurs millions." },
        { t: "x", v: "Conflits familiaux à cause de l'argent." },
        { t: "x", v: "Impossible de savoir où est réellement passé votre argent." },
        { t: "h", v: "Et pendant ce temps…" },
        { t: "p", v: "Vous continuez à payer un loyer." },
        { t: "p", v: "Vous continuez à rêver de votre maison." },
        { t: "p", v: "Vous continuez à attendre." },
        { t: "p", v: "Chaque année passe. Et votre projet reste au même point." },
        { t: "h", v: "Le plus grand danger" },
        { t: "p", v: "Ce n'est pas de manquer d'argent. C'est de gaspiller l'argent que vous avez déjà." },
        { t: "p", v: "Combien de personnes gagnent suffisamment pour construire… mais dépensent leur argent dans des urgences, des dépenses inutiles ou des projets jamais terminés ?" },
        { t: "p", v: "Pendant que vous attendez « le bon moment », votre maison ne se construit pas." },
        { t: "h", v: "Votre maison ne devrait pas dépendre :" },
        { t: "x", v: "D'un cousin." },
        { t: "x", v: "D'un frère." },
        { t: "x", v: "D'un maçon." },
        { t: "x", v: "D'une promesse." },
        { t: "x", v: "D'une photo WhatsApp." },
        { t: "p", v: "Votre maison mérite mieux." },
      ],
    },
    parcours: {
      kicker: "La solution · Deux produits, une même promesse",
      title: "La confiance, du terrain à la maison finie",
      sub: "Que vous vendiez des terrains ou que vous bâtissiez votre maison, Litug place la confiance au cœur de chaque échange — pour vous comme pour vos clients.",
      card1_tag: "Vendre des terrains",
      card1_title: "Sara — votre commerciale IA",
      card1_desc: "Vous avez des terrains à vendre ? Sara répond à vos prospects sur WhatsApp 24h/24, les qualifie et ne vous transmet que les acheteurs sérieux. Vous vendez plus, sans jamais laisser un client sans réponse.",
      card1_cta: "Découvrir Sara",
      card2_tag: "Construire sa maison",
      card2_title: "Mustaf — construire en confiance",
      card2_desc: "Vous avez un terrain ? Construisez au pays sereinement : argent protégé à la banque, paiement par phase, suivi photo depuis votre tablette. Nous travaillons avec des architectes italiens qui peuvent donner un look différent à votre maison.",
      card2_cta: "Découvrir Mustaf",
    },
    sara: {
      kicker: "Vendre vos terrains",
      badge: "Disponible 24h/24",
      title: "Sara, votre commerciale qui ne dort jamais",
      desc: "Pendant que vous travaillez. Pendant que vous dormez. Pendant que vous êtes en déplacement. Sara continue de répondre à vos prospects — instantanément, avec les informations que vous avez validées.",
      features: [
        "Prix du terrain, localisation et superficie",
        "Documents disponibles et statut clair (TF, Bail, Délibération)",
        "Modalités de paiement — paiement par tranche si applicable",
        "Disponibilités pour les visites et toute info que vous choisissez",
        "Ne vous transfère que les prospects sérieux, prêts à acheter",
      ],
      cta: "Activer Sara",
    },
    mustaf: {
      kicker: "Construire sa maison",
      name: "Mustaf",
      badge: "La façon la plus sereine de construire",
      title: "Commencez dès 1 000 FCFA",
      desc: "Construire une maison ne devrait jamais être difficile. Avec Mustaf, que vous ayez déjà commencé votre chantier ou que vous ayez seulement le terrain, Mustaf s'adapte à votre projet phase par phase. C'est comme une tontine personnelle : déposez ce que vous pouvez, quand vous pouvez — 1 000 FCFA, 5 000 FCFA, 30 000 FCFA — jusqu'à financer la phase entière. Les travaux ne commencent que quand l'argent est là.",
      example: "Exemple : si la fondation vous coûte 500 000 FCFA (maçon et tout compris), vous verrez sur votre tableau de bord chaque montant que vous y mettez — 1 000 FCFA, 15 000 FCFA… — jusqu'à atteindre la somme. Ce n'est qu'à ce moment que les travaux commencent.",
      services: [
        "Seul ou en famille — une personne ou toute une famille peut financer le même projet",
        "Un architecte dédié à votre projet — sénégalais ou italien, vous choisissez",
        "Tableau de bord complet : factures, dépenses, travaux en cours et contributions visibles",
        "À la fin du projet, vous savez exactement combien vous avez investi — à la pièce près",
        "Une phase ne démarre que lorsqu'elle est financée",
        "Inspecteur indépendant avant chaque paiement",
      ],
      cta: "Voir les offres",
    },
    comment: {
      kicker: "Comment ça marche",
      title: "Deux produits, un processus clair",
      sara: {
        label: "Sara — Vendre vos terrains",
        tag: "Pour les vendeurs",
        trial: "1er mois offert — testez Sara gratuitement, sans engagement. Décidez ensuite de continuer.",
        steps: [
          { n: "1", title: "Installation & setup", items: ["Payez le setup pour activer Sara sur votre WhatsApp", "1 mois offert pour tester sans engagement", "Sara répond instantanément à vos prospects 24h/24"] },
          { n: "2", title: "Personnalisation", items: ["Configurez vos terrains, prix, conditions et modalités", "Sara adopte votre style et vos informations validées", "Ajustez à tout moment depuis votre espace vendeur"] },
          { n: "3", title: "Dashboard vendeur", items: ["Suivez votre trafic, leads et conversions en temps réel", "Mettez en vente uniquement vos terrains vérifiés (titre contrôlé, propriétaire confirmé)", "Continuez si ça vous convient — ou arrêtez librement"] },
        ],
      },
      mustaf: {
        label: "Mustaf — Construire en confiance",
        tag: "Pour les propriétaires",
        steps: [
          { n: "1", title: "Choisir votre offre", items: ["3 formules selon l'intensité de suivi souhaitée", "Phase 0 (plan, permis, étude du sol) — pour les projets qui démarrent", "Déjà en chantier ? On intègre votre projet là où il en est et on continue avec vous"] },
          { n: "2", title: "Tableau de bord dédié", items: ["Dépenses ligne par ligne avec factures jointes", "Photos géolocalisées et horodatées du chantier", "Toute la famille peut contribuer — chaque dépôt visible et attribué"] },
          { n: "3", title: "Procédure documentaire", items: ["Dépôt : plan architectural, étude du sol, devis par phase", "Paiement phase par phase — fondation → élévation → toiture → finitions", "Inspecteur indépendant avant chaque libération de fonds"] },
        ],
      },
    },
    dash: {
      kicker: "Le tableau de bord Mustaf",
      title: "Comme si vous étiez présent sur le chantier",
      sub: "Depuis votre tablette ou votre téléphone, vous suivez chaque euro investi en temps réel.",
      points: [
        "Budget total, utilisé et restant",
        "Factures et dépenses ligne par ligne",
        "Photos du chantier datées et géolocalisées",
        "Échéances et prochaines phases à financer",
        "Contributions de chaque membre de la famille",
        "Un bouton pour signaler une anomalie",
      ],
    },
    impact: {
      kicker: "Notre impact",
      title: "Des résultats qui parlent",
      stats: [
        { value: 80, prefix: "+", suffix: "%", label: "de temps économisé grâce à Sara" },
        { value: 70, prefix: "−", suffix: "%", label: "de faux prospects et d'arnaques évités" },
        { value: 100, prefix: "", suffix: "%", label: "des dépenses Mustaf tracées et justifiées" },
        { value: 1000, prefix: "", suffix: " FCFA", label: "suffisent pour démarrer votre maison avec Mustaf" },
      ],
    },
    preuves: {
      kicker: "Nos garanties",
      title: "Pourquoi les diasporas choisissent Litug",
      points: [
        "Transparence totale, du terrain à la maison",
        "Aucun paiement opaque",
        "Historique complet des dépenses",
        "Accompagnement humain",
        "Contrôle financier permanent",
        "Documents centralisés et sécurisés",
        "Tiers de confiance pour l'argent",
        "Inspecteur indépendant à chaque étape",
      ],
    },
    compare: {
      kicker: "Avant / Après",
      title: "Le changement est radical",
      before_label: "Sans Litug",
      after_label: "Avec Litug",
      before: ["Terrains au statut flou", "Appels incessants", "Informations contradictoires", "Factures manquantes", "Dépenses imprévues", "Stress permanent"],
      after: ["Terrains vérifiés", "Visibilité complète 24/7", "Une seule source de vérité", "Factures accessibles", "Budget maîtrisé", "Tranquillité d'esprit"],
    },
    listings: {
      kicker: "Terrains & projets",
      title: "Explore ce qui est déjà disponible",
      tab1: "Terrains disponibles",
      tab2: "Exemple de maison",
      cta: "Voir plus",
      before: "Avant",
      after: "Après",
    },
    faq: {
      kicker: "FAQ",
      title: "Les questions que vous vous posez",
      items: [
        { q: "Combien faut-il pour commencer avec Mustaf ?", a: "1 000 FCFA suffisent pour ouvrir votre projet et commencer à épargner. Mustaf fonctionne comme une tontine personnelle : vous déposez ce que vous pouvez, quand vous pouvez. Les travaux ne démarrent que lorsque la phase est entièrement financée — pas avant." },
        { q: "Sara est-elle payante dès le départ ?", a: "Non. Vous payez uniquement l'installation (le setup) pour activer Sara sur votre WhatsApp, et vous bénéficiez d'un mois entier gratuitement pour tester. À la fin du mois, vous décidez librement de continuer ou d'arrêter — sans engagement." },
        { q: "Puis-je rejoindre Mustaf si j'ai déjà mon terrain ou mes plans ?", a: "Oui. Si vous avez déjà le terrain, vous passez directement à la construction. Si vous avez déjà vos plans, permis ou une partie des documents, on s'adapte à votre avancement et vous ne payez pas ce que vous possédez déjà. Déjà en chantier ? On intègre votre projet là où il en est." },
        { q: "Ma famille peut-elle participer au financement ?", a: "Oui. Plusieurs membres peuvent contribuer au même projet depuis un tableau de bord partagé. Chaque versement est attribué et visible. Il s'agit d'un relevé de contributions — pas d'un titre de propriété." },
        { q: "Mon argent est-il en sécurité ?", a: "Oui. Il reste bloqué chez un tiers de confiance (notaire séquestre ou banque partenaire) et n'est libéré qu'après vérification indépendante des travaux. Jamais chez nous." },
        { q: "Comment savoir qu'un terrain n'est pas une arnaque ?", a: "Un terrain n'est marqué « Vérifié » qu'après un contrôle réel par notaire/géomètre à la Conservation Foncière. Le statut (TF, Bail, Délibération) est toujours affiché, jamais caché. Les terrains en vente sur notre plateforme ont fait l'objet d'une vérification des titres et de l'identité du propriétaire." },
      ],
    },
    ctaFinal: {
      title: "L'immobilier mérite plus qu'une promesse.",
      sub: "Vendre des terrains ou construire ne doit être ni compliqué ni inaccessible. Avec Sara et Mustaf, c'est transparent, rapide et à votre portée.",
      cta1: "Réserver mon entretien gratuit",
    },
    contact: {
      kicker: "Contact",
      title: "Parlons de votre projet",
      sub: "Remplissez le formulaire — Sara ou un membre de l'équipe vous répond sous 24h.",
      name: "Nom complet",
      email: "Email",
      whatsapp: "Numéro WhatsApp",
      message: "Votre message",
      send: "Envoyer",
      sending: "Envoi…",
      sent: "Message envoyé ✓",
      error: "Échec de l'envoi. Réessayez ou écrivez à mactravail23@gmail.com.",
      map_label: "Sénégal · Dakar & régions",
    },
    footer: {
      tagline: "Acheter et construire au Sénégal en toute confiance.",
      col1: "Produits",
      col1_links: [
        { label: "Sara — Agent IA", href: "/sara" },
        { label: "Mustaf — Construction", href: "/mustaf" },
        { label: "Terrains", href: "/nos-terrains" },
        { label: "Tarifs", href: "/produits" },
      ],
      col2: "Entreprise",
      col2_links: [
        { label: "À propos", href: "/a-propos" },
        { label: "Blog", href: "/blog" },
        { label: "Carrières", href: "/carrieres" },
        { label: "Contact", href: "/#contact" },
      ],
      col3: "Légal",
      col3_links: [
        { label: "Mentions légales", href: "/mentions-legales" },
        { label: "Confidentialité", href: "/confidentialite" },
        { label: "Conditions", href: "/conditions" },
      ],
      rights: "© 2026 Litug. Tous droits réservés.",
      newsletter_sub: "Nouveaux terrains et actualités, une fois par mois.",
      subscribe: "S'abonner",
      subscribing: "Envoi…",
      subscribed: "Merci ! Inscription bien reçue.",
      sub_error: "Échec de l'inscription. Réessayez.",
      sub_invalid: "Entrez une adresse email valide.",
    },
  },
  en: {
    nav: { terrains: "Land", comment: "How it works", garanties: "Our guarantees", tarifs: "Pricing", blog: "Blog", login: "Log in", cta: "Book a call" },
    hero: {
      badge: "Vol? arnaque? · Basta",
      title_1: "Sell more land.",
      title_2: "Build without the stress.",
      sub: "Who told you it takes millions to start building your home? With Litug, start your project from just 1,000 FCFA and keep full control over every expense, wherever you are in the world.",
      cta_primary: "I want to build my home",
      cta_secondary: "I sell land",
      proof: "Already used by sellers, architects and real-estate professionals",
      checks: [
        "Start from just 1,000 FCFA",
        "Every franc tracked and justified",
        "Real-time work tracking",
        "Your home moves forward, even from afar",
      ],
    },
    reassure: [
      "Expenses and invoices available anytime",
      "Budget under control from start to finish",
      "Your own secure dashboard",
      "The whole family can take part",
    ],
    marquee: { label: "Trusted by professionals across the country" },
    probleme: {
      tag: "Without Sara",
      title: "How many sales are you losing without even knowing?",
      head: [
        { t: "p", v: "Every day, buyers message you." },
        { t: "p", v: "Every day, some leave without a reply." },
        { t: "p", v: "Every day, some buy elsewhere." },
        { t: "p", v: "And you'll never know." },
        { t: "x", v: "You lose buyers because a competitor replied before you." },
        { t: "x", v: "You miss calls while you're at work." },
        { t: "x", v: "Dozens of messages every week — and some go unanswered." },
      ],
      more: [
        { t: "h", v: "The problems land sellers live with" },
        { t: "x", v: "Answering the same questions over and over:" },
        { t: "p", v: "'What\'s the price?' · 'Where is the land?' · 'What papers do you have?' · 'Can I pay in installments?' · 'When can I visit?'" },
        { t: "p", v: "Again. And again. And again." },
        { t: "x", v: "Getting dozens, even hundreds of messages every week." },
        { t: "x", v: "Replying late." },
        { t: "x", v: "Forgetting some prospects." },
        { t: "x", v: "Replying differently depending on your mood or availability." },
        { t: "x", v: "Spending hours on WhatsApp." },
        { t: "x", v: "Replying to people when the land is already sold." },
        { t: "h", v: "While you sleep…" },
        { t: "p", v: "Your prospects keep searching." },
        { t: "p", v: "Your competitors keep replying." },
        { t: "p", v: "Your competitors keep selling." },
        { t: "h", v: "The hidden cost" },
        { t: "p", v: "Every lost prospect is a potential sale lost." },
        { t: "p", v: "And a single lost sale can mean hundreds of thousands — even millions of FCFA." },
        { t: "h", v: "Hire a salesperson?" },
        { t: "x", v: "Monthly salary." },
        { t: "x", v: "Payroll costs." },
        { t: "x", v: "Limited hours." },
        { t: "x", v: "Holidays." },
        { t: "x", v: "Sick days." },
        { t: "x", v: "Only 8 hours a day." },
        { t: "x", v: "Only 5 or 6 days a week." },
        { t: "p", v: "And even then, some prospects still go unanswered." },
        { t: "h", v: "The truth" },
        { t: "p", v: "Today, it isn't always the best land that sells. It's often the sellers who reply the fastest." },
        { t: "p", v: "And in real estate, a few minutes can be the difference between a sale won and a sale lost." },
      ],
    },
    agitation: {
      tag: "Without Mustaf",
      title: "How many in the diaspora have sent money for years…",
      head: [
        { t: "p", v: "…only to come home and find the house doesn't exist?" },
        { t: "p", v: "Or that it's half-built. Or that the money is gone." },
        { t: "x", v: "You send money." },
        { t: "x", v: "You're told the work is progressing." },
        { t: "x", v: "You're sent a few photos." },
        { t: "x", v: "You're reassured." },
        { t: "x", v: "You keep paying." },
        { t: "p", v: "Then one day you come back… and you discover the truth." },
      ],
      more: [
        { t: "h", v: "The problems thousands of families live every day" },
        { t: "x", v: "Money sent to relatives that vanishes without explanation." },
        { t: "x", v: "Expenses impossible to verify." },
        { t: "x", v: "Invoices that don't exist." },
        { t: "x", v: "Materials bought at inflated prices." },
        { t: "x", v: "Workers paid but absent from the site." },
        { t: "x", v: "Work that drags on for years." },
        { t: "x", v: "Companies that promise everything before payment and vanish after." },
        { t: "x", v: "Abandoned sites." },
        { t: "x", v: "Budgets overrun by millions." },
        { t: "x", v: "Family conflicts over money." },
        { t: "x", v: "No way to know where your money really went." },
        { t: "h", v: "And meanwhile…" },
        { t: "p", v: "You keep paying rent." },
        { t: "p", v: "You keep dreaming of your house." },
        { t: "p", v: "You keep waiting." },
        { t: "p", v: "Year after year passes. And your project stays exactly where it was." },
        { t: "h", v: "The greatest danger" },
        { t: "p", v: "It's not running out of money. It's wasting the money you already have." },
        { t: "p", v: "How many people earn enough to build… but spend their money on emergencies, pointless expenses, or projects that are never finished?" },
        { t: "p", v: "While you wait for 'the right moment', your house isn't getting built." },
        { t: "h", v: "Your house shouldn't depend on:" },
        { t: "x", v: "A cousin." },
        { t: "x", v: "A brother." },
        { t: "x", v: "A mason." },
        { t: "x", v: "A promise." },
        { t: "x", v: "A WhatsApp photo." },
        { t: "p", v: "Your house deserves better." },
      ],
    },
    parcours: {
      kicker: "The solution · Two products, one promise",
      title: "Trust, from the land to the finished home",
      sub: "Whether you're selling land or building your home, Litug puts trust at the heart of every exchange — for you and your clients.",
      card1_tag: "Sell land",
      card1_title: "Sara — your AI sales agent",
      card1_desc: "Got land to sell? Sara answers your prospects on WhatsApp 24/7, qualifies them, and only hands you serious buyers. You sell more — and never leave a client waiting.",
      card1_cta: "Meet Sara",
      card2_tag: "Build a home",
      card2_title: "Mustaf — build with confidence",
      card2_desc: "Got land? Build back home with peace of mind: funds protected at the bank, pay-by-phase, photo tracking from your tablet. We work with Italian architects who can give your home a different look.",
      card2_cta: "Meet Mustaf",
    },
    sara: {
      kicker: "Sell your land",
      badge: "Available 24/7",
      title: "Sara, the salesperson that never sleeps",
      desc: "While you work. While you sleep. While you're on the move. Sara keeps answering your prospects — instantly, with the information you've validated.",
      features: [
        "Land price, location and area",
        "Available documents and clear status (TF, Bail, Délibération)",
        "Payment terms — including instalment plans if applicable",
        "Visit availability and any other info you choose to share",
        "Only forwards you serious, ready-to-buy leads",
      ],
      cta: "Activate Sara",
    },
    mustaf: {
      kicker: "Build a home",
      name: "Mustaf",
      badge: "The most serene way to build",
      title: "Start from just 1,000 FCFA",
      desc: "Building a home should never be difficult. With Mustaf, whether you've already started your build or you only have the land, Mustaf adapts to your project phase by phase. Think of it like a personal tontine: deposit what you can, when you can — 1,000 FCFA, 5,000 FCFA, 30,000 FCFA — until the phase is fully funded. Work only begins once the money is there.",
      example: "Example: if your foundation costs 500,000 FCFA (mason and everything included), you'll see every amount you put in on your dashboard — 1,000 FCFA, 15,000 FCFA… — until you reach the total. Only then do the works begin.",
      services: [
        "Alone or as a family — one person or a whole family can fund the same project",
        "A dedicated architect for your project — Senegalese or Italian, you choose",
        "Full dashboard: invoices, expenses, ongoing work and contributions, all visible",
        "At the end of the project, you know exactly how much you invested — down to the last franc",
        "A phase only starts once it's fully funded",
        "Independent inspector before every payment",
      ],
      cta: "See the plans",
    },
    comment: {
      kicker: "How it works",
      title: "Two products, one clear process",
      sara: {
        label: "Sara — Sell your land",
        tag: "For sellers",
        trial: "First month free — try Sara at no cost, no commitment. Then decide.",
        steps: [
          { n: "1", title: "Setup & install", items: ["Pay the setup fee to activate Sara on your WhatsApp", "First month free — test with no commitment", "Sara answers your prospects instantly, 24/7"] },
          { n: "2", title: "Personalisation", items: ["Configure your plots, prices, terms and conditions", "Sara adopts your style and the information you validate", "Adjust anytime from your seller dashboard"] },
          { n: "3", title: "Seller dashboard", items: ["Track your traffic, leads and conversions in real time", "List only verified plots for sale (title checked, owner confirmed)", "Continue if it works — or stop freely after the free month"] },
        ],
      },
      mustaf: {
        label: "Mustaf — Build with confidence",
        tag: "For owners",
        steps: [
          { n: "1", title: "Choose your plan", items: ["3 plans depending on the level of oversight you need", "Phase 0 (plan, permit, soil survey) — for projects starting from scratch", "Already building? We plug into your site where it stands and carry on with you"] },
          { n: "2", title: "Your dedicated dashboard", items: ["Expenses line by line with invoices attached", "Geolocated, timestamped site photos", "The whole family can contribute — every deposit visible and attributed"] },
          { n: "3", title: "Document procedure", items: ["Submit: architectural plan, soil survey, per-phase estimates", "Pay phase by phase — foundation → walls → roof → finishes", "Independent inspector before every fund release"] },
        ],
      },
    },
    dash: {
      kicker: "The Mustaf dashboard",
      title: "As if you were on site",
      sub: "From your tablet or phone, track every euro invested in real time.",
      points: [
        "Total, used and remaining budget",
        "Invoices and expenses line by line",
        "Dated, geolocated site photos",
        "Deadlines and next phases to fund",
        "Each family member's contributions",
        "One button to flag an anomaly",
      ],
    },
    impact: {
      kicker: "Our impact",
      title: "Results that speak",
      stats: [
        { value: 80, prefix: "+", suffix: "%", label: "time saved thanks to Sara" },
        { value: 70, prefix: "−", suffix: "%", label: "fewer fake leads and scams" },
        { value: 100, prefix: "", suffix: "%", label: "of Mustaf expenses tracked and justified" },
        { value: 1000, prefix: "", suffix: " FCFA", label: "is enough to start your home with Mustaf" },
      ],
    },
    preuves: {
      kicker: "Our guarantees",
      title: "Why the diaspora chooses Litug",
      points: [
        "Full transparency, from land to home",
        "No opaque payments",
        "Complete expense history",
        "Human support",
        "Permanent financial control",
        "Centralized, secure documents",
        "Trusted third party for the money",
        "Independent inspector at every step",
      ],
    },
    compare: {
      kicker: "Before / After",
      title: "The change is radical",
      before_label: "Without Litug",
      after_label: "With Litug",
      before: ["Land with unclear status", "Endless phone calls", "Contradictory information", "Missing invoices", "Unexpected expenses", "Constant stress"],
      after: ["Verified land", "Full visibility 24/7", "A single source of truth", "Invoices accessible", "Budget under control", "Peace of mind"],
    },
    listings: {
      kicker: "Land & projects",
      title: "Explore what's already available",
      tab1: "Available land",
      tab2: "House examples",
      cta: "See more",
      before: "Before",
      after: "After",
    },
    faq: {
      kicker: "FAQ",
      title: "The questions you're asking",
      items: [
        { q: "How much do I need to start with Mustaf?", a: "1,000 FCFA is enough to open your project and start saving. Mustaf works like a personal tontine: deposit what you can, when you can. Work only begins once the phase is fully funded — never before." },
        { q: "Is Sara free to start?", a: "No subscription on day one. You only pay the setup fee to activate Sara on your WhatsApp, and you get a full month free to test it. At the end of the month, you decide freely whether to continue or stop — no commitment." },
        { q: "Can I join Mustaf if I already have my land or plans?", a: "Yes. If you already own the land, you go straight to construction. If you already have plans, a permit, or part of the documents, we adapt to where you are and you don't pay for what you already have. Already mid-build? We integrate your project as it stands." },
        { q: "Can my family help finance the project?", a: "Yes. Multiple members can contribute to the same project from a shared dashboard. Every deposit is attributed and visible. It's a record of contributions — not a property title." },
        { q: "Is my money safe?", a: "Yes. It stays locked with a trusted third party (notary escrow / partner bank) and is only released after independent verification of the work. Never with us." },
        { q: "How do I know a plot isn't a scam?", a: "A plot is only marked \"Verified\" after a real check by a notary/surveyor at the Conservation Foncière. The status (TF, Bail, Délibération) is always shown, never hidden. Every plot listed on our platform has had its title and owner identity verified." },
      ],
    },
    ctaFinal: {
      title: "Real estate deserves more than a promise.",
      sub: "Selling land or building shouldn't be complicated or out of reach. With Sara and Mustaf, it's transparent, fast, and within your grasp.",
      cta1: "Book my free call",
    },
    contact: {
      kicker: "Contact",
      title: "Let's talk about your project",
      sub: "Fill in the form — Sara or a team member replies within 24h.",
      name: "Full name",
      email: "Email",
      whatsapp: "WhatsApp number",
      message: "Your message",
      send: "Send",
      sending: "Sending…",
      sent: "Message sent ✓",
      error: "Sending failed. Try again or email mactravail23@gmail.com.",
      map_label: "Senegal · Dakar & regions",
    },
    footer: {
      tagline: "Buy and build in Senegal with confidence.",
      col1: "Products",
      col1_links: [
        { label: "Sara — AI Agent", href: "/sara" },
        { label: "Mustaf — Construction", href: "/mustaf" },
        { label: "Land", href: "/nos-terrains" },
        { label: "Pricing", href: "/produits" },
      ],
      col2: "Company",
      col2_links: [
        { label: "About", href: "/a-propos" },
        { label: "Blog", href: "/blog" },
        { label: "Careers", href: "/carrieres" },
        { label: "Contact", href: "/#contact" },
      ],
      col3: "Legal",
      col3_links: [
        { label: "Legal notice", href: "/mentions-legales" },
        { label: "Privacy", href: "/confidentialite" },
        { label: "Terms", href: "/conditions" },
      ],
      rights: "© 2026 Litug. All rights reserved.",
      newsletter_sub: "New land and news, once a month.",
      subscribe: "Subscribe",
      subscribing: "Sending…",
      subscribed: "Thanks! You're subscribed.",
      sub_error: "Subscription failed. Try again.",
      sub_invalid: "Enter a valid email address.",
    },
  },
};

type T = typeof I18N.fr;

const LANDS = [
  { id: 1, place: { fr: "Diamniadio",   en: "Diamniadio"  }, area: "300 m²", price: "12 500 000", tag: { fr: "Titre foncier", en: "Land title"   }, hue: 150 },
  { id: 2, place: { fr: "Saly Portudal", en: "Saly Portudal"}, area: "500 m²", price: "28 000 000", tag: { fr: "Bord de mer",   en: "Seafront"    }, hue: 190 },
  { id: 3, place: { fr: "Thiès",         en: "Thiès"       }, area: "250 m²", price: "7 800 000",  tag: { fr: "Viabilisé",     en: "Serviced"    }, hue: 95  },
  { id: 4, place: { fr: "Lac Rose",      en: "Lake Retba"  }, area: "400 m²", price: "15 200 000", tag: { fr: "Résidentiel",   en: "Residential" }, hue: 40  },
];

const HOUSES = [
  { id: 1, name: { fr: "Villa Almadies", en: "Almadies Villa" }, area: "R+1 · 320 m²", hue: 150 },
  { id: 2, name: { fr: "Duplex Ngor",    en: "Ngor Duplex"    }, area: "R+2 · 280 m²", hue: 35  },
  { id: 3, name: { fr: "Maison Mbour",   en: "Mbour House"    }, area: "R+1 · 210 m²", hue: 190 },
];

const PARTNERS = ["ARCHIDAK", "TerraSén", "BTP Sahel", "NDOUR & Co", "Atlantique", "Baobab Build", "Casa Verde"];

const CHAT: Record<Lang, { from: 'them' | 'sara'; text: string; t: string }[]> = {
  fr: [
    { from: 'them', text: "Bonjour, je cherche un terrain à Saly 🌴", t: "09:41" },
    { from: 'sara', text: "Bonjour 👋 Je suis Sara. Quel est votre budget approximatif ?", t: "09:41" },
    { from: 'them', text: "Autour de 25 millions FCFA", t: "09:42" },
    { from: 'sara', text: "Parfait. Superficie souhaitée et type de terrain ?", t: "09:42" },
    { from: 'them', text: "500 m², bord de mer si possible", t: "09:43" },
    { from: 'sara', text: "J'ai 2 terrains qui correspondent. Je vous envoie les fiches 📍", t: "09:43" },
  ],
  en: [
    { from: 'them', text: "Hi, I'm looking for land in Saly 🌴", t: "09:41" },
    { from: 'sara', text: "Hello 👋 I'm Sara. What's your approximate budget?", t: "09:41" },
    { from: 'them', text: "Around 25 million FCFA", t: "09:42" },
    { from: 'sara', text: "Perfect. Desired area and land type?", t: "09:42" },
    { from: 'them', text: "500 m², seafront if possible", t: "09:43" },
    { from: 'sara', text: "I have 2 matching plots. Sending you the sheets 📍", t: "09:43" },
  ],
};

/* ------------------------------------------------------------------ */
/* ICONS                                                               */
/* ------------------------------------------------------------------ */
const ICONS: Record<string, string> = {
  arrow:   "M5 12h14M13 6l6 6-6 6",
  check:   "M20 6L9 17l-5-5",
  x:       "M18 6L6 18M6 6l12 12",
  bolt:    "M13 2L3 14h7l-1 8 10-12h-7l1-8z",
  clock:   "M12 7v5l3 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  shield:  "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  pin:     "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z M12 10a3 3 0 100-6 3 3 0 000 6z",
  home:    "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
  trending:"M23 6l-9.5 9.5-5-5L1 18M17 6h6v6",
  chat:    "M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z",
  send:    "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z",
  sparkle: "M12 2l1.8 5.6L19 9l-5.2 1.4L12 16l-1.8-5.6L5 9l5.2-1.4z",
  layers:  "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  users:   "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
  wallet:  "M21 12V7H5a2 2 0 010-4h14v4 M3 5v14a2 2 0 002 2h16v-5 M18 12a2 2 0 000 4h3v-4z",
  file:    "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M9 13h6 M9 17h6",
  camera:  "M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z M12 17a4 4 0 100-8 4 4 0 000 8z",
  alert:   "M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z M12 9v4 M12 17h.01",
  lock:    "M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2z M7 11V7a5 5 0 0110 0v4",
  tiktok:  "M9 12a4 4 0 104 4V4a5 5 0 005 5",
};

function Icon({ name, size = 18, stroke = 2, className }: { name: string; size?: number; stroke?: number; className?: string }) {
  const d = ICONS[name] || "";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      {d.split(" M").map((seg, i) => <path key={i} d={(i ? "M" : "") + seg} />)}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* PLACEHOLDER                                                         */
/* ------------------------------------------------------------------ */
function Placeholder({ label, hue }: { label: string; hue?: number }) {
  return (
    <div
      className={hue != null ? "ph hue" : "ph"}
      style={hue != null ? ({ "--h": hue } as React.CSSProperties) : undefined}
    >
      <span>{label}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* useReveal hook                                                      */
/* ------------------------------------------------------------------ */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function useReveal(): React.MutableRefObject<any> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ref = useRef<any>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const targets: HTMLElement[] = [...el.querySelectorAll(".reveal")];
    if (el.classList?.contains("reveal")) targets.push(el);

    const forceShow = (n: HTMLElement) => {
      n.classList.add("in");
      n.style.transition = "none";
      n.style.opacity = "1";
      n.style.transform = "none";
    };

    if (!("IntersectionObserver" in window)) { targets.forEach(forceShow); return; }

    let fired = false;
    const io = new IntersectionObserver((entries) => {
      fired = true;
      entries.forEach((e) => {
        if (e.isIntersecting) { (e.target as HTMLElement).classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    targets.forEach((n) => io.observe(n));

    const fallback = setTimeout(() => { if (!fired) targets.forEach(forceShow); }, 1000);
    return () => { io.disconnect(); clearTimeout(fallback); };
  }, []);
  return ref;
}

/* ------------------------------------------------------------------ */
/* CountUp                                                             */
/* ------------------------------------------------------------------ */
function CountUp({ end, prefix = "", suffix = "", duration = 1600 }: { end: number; prefix?: string; suffix?: string; duration?: number }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf: number;
    let started = false;
    let fired = false;

    const run = () => {
      if (started) return;
      started = true;
      const t0 = performance.now();
      const tick = (t: number) => {
        const p = Math.min((t - t0) / duration, 1);
        setVal(Math.round((1 - Math.pow(1 - p, 3)) * end));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    if (!("IntersectionObserver" in window)) { setVal(end); return; }

    const io = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) { fired = true; run(); } });
    }, { threshold: 0.5 });
    io.observe(el);

    const fallback = setTimeout(() => { if (!fired) setVal(end); }, 1000);
    return () => { io.disconnect(); cancelAnimationFrame(raf); clearTimeout(fallback); };
  }, [end, duration]);

  return <span ref={ref}>{prefix}{val}{suffix}</span>;
}

/* ------------------------------------------------------------------ */
/* WhatsAppChat                                                        */
/* ------------------------------------------------------------------ */
function WhatsAppChat({ lang, agentName = "Sara", status }: { lang: Lang; agentName?: string; status: string }) {
  const script = CHAT[lang];
  const [shown, setShown] = useState(0);
  const [typing, setTyping] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setShown(0); setTyping(false);
    const timers: ReturnType<typeof setTimeout>[] = [];
    let i = 0;

    const step = () => {
      if (i >= script.length) {
        timers.push(setTimeout(() => { setShown(0); i = 0; timers.push(setTimeout(step, 700)); }, 4200));
        return;
      }
      const msg = script[i];
      if (msg.from === "sara") {
        setTyping(true);
        timers.push(setTimeout(() => {
          setTyping(false); setShown((s) => s + 1); i++;
          timers.push(setTimeout(step, 1100));
        }, 1200));
      } else {
        setShown((s) => s + 1); i++;
        timers.push(setTimeout(step, 1000));
      }
    };
    timers.push(setTimeout(step, 700));
    return () => timers.forEach(clearTimeout);
  }, [lang]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [shown, typing]);

  return (
    <div className="phone">
      <div className="phone-screen">
        <div className="wa-head">
          <div className="av">{agentName[0]}</div>
          <div className="meta">
            <b>{agentName} · Litug</b>
            <small>{status}</small>
          </div>
        </div>
        <div className="wa-body" ref={bodyRef}>
          {script.slice(0, shown).map((m, idx) => (
            <div key={idx} className={`bubble ${m.from === "sara" ? "sara" : "them"}`}>
              {m.from === "sara" && <span className="sara-tag">{agentName} AI</span>}
              {m.text}
              <small>{m.t} {m.from === "sara" ? "✓✓" : ""}</small>
            </div>
          ))}
          {typing && <div className="typing"><i></i><i></i><i></i></div>}
        </div>
        <div className="wa-foot">
          <div className="inp">{lang === "fr" ? "Écrire un message" : "Type a message"}</div>
          <div className="snd"><Icon name="send" size={16} /></div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* iPad — Mustaf client dashboard mock                                 */
/* ------------------------------------------------------------------ */
function IpadDashboard({ lang }: { lang: Lang }) {
  const fr = lang === "fr";
  return (
    <div className="ipad">
      <div className="ipad-cam"></div>
      <div className="ipad-screen">
        <div className="dash">
          {/* topbar */}
          <div className="dash-top">
            <div className="dash-brand"><span className="logo-dot"></span>Mustaf</div>
            <div className="dash-tier"><Icon name="shield" size={12} />{fr ? "Formule Sérénité" : "Sérénité plan"}</div>
          </div>

          {/* header */}
          <div className="dash-head">
            <div>
              <h4>{fr ? "Mon projet" : "My project"}</h4>
              <p><Icon name="pin" size={12} />{fr ? "Cité Keur Gorgui, Dakar" : "Cité Keur Gorgui, Dakar"}</p>
            </div>
            <span className="dash-ref">TER-DKR-001</span>
          </div>

          {/* stat tiles */}
          <div className="dash-stats">
            <div className="dtile">
              <div className="dtile-ic blue"><Icon name="trending" size={14} /></div>
              <b>12 %</b>
              <small>{fr ? "Avancement" : "Progress"}</small>
            </div>
            <div className="dtile">
              <div className="dtile-ic green"><Icon name="wallet" size={14} /></div>
              <b>500 000 <i>FCFA</i></b>
              <small>{fr ? "Solde épargne" : "Savings"}</small>
            </div>
            <div className="dtile">
              <div className="dtile-ic gold"><Icon name="layers" size={14} /></div>
              <b>{fr ? "Murs" : "Walls"}</b>
              <small>{fr ? "Phase en cours" : "Current phase"}</small>
            </div>
          </div>

          {/* funding */}
          <div className="dcard">
            <div className="dcard-row">
              <span className="dcard-k">{fr ? "Prochaine phase — Murs (élévation)" : "Next phase — Walls"}</span>
              <span className="dcard-v">500k / 4,5M</span>
            </div>
            <div className="dbar"><div className="dbar-fill" style={{ width: "11%" }}></div></div>
            <div className="dcard-note"><Icon name="lock" size={11} />{fr ? "Démarre quand la phase est financée" : "Starts once the phase is funded"}</div>
          </div>

          {/* expenses + photo */}
          <div className="dash-cols">
            <div className="dcard sm">
              <div className="dcard-h"><Icon name="file" size={13} />{fr ? "Dépenses tracées" : "Tracked expenses"}</div>
              <ul className="dexp">
                <li><span>{fr ? "Ciment (120 sacs)" : "Cement (120 bags)"}</span><b>470k</b></li>
                <li><span>{fr ? "Fer à béton" : "Rebar"}</span><b>510k</b></li>
                <li><span>{fr ? "Main-d'œuvre" : "Labor"}</span><b>380k</b></li>
              </ul>
              <div className="dchip ok"><Icon name="check" size={11} />{fr ? "Factures jointes" : "Invoices attached"}</div>
            </div>
            <div className="dcard sm photo">
              <div className="dphoto">
                <Icon name="camera" size={20} />
                <span className="dgeo"><Icon name="pin" size={10} />14.69°N · 28 mai</span>
              </div>
              <div className="dcard-h tight"><Icon name="camera" size={13} />{fr ? "Photo datée & géolocalisée" : "Dated & geolocated photo"}</div>
            </div>
          </div>

          {/* trust note */}
          <div className="dnote"><Icon name="shield" size={13} />{fr ? "Argent chez le notaire séquestre — libéré après inspection." : "Money held in notary escrow — released after inspection."}</div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* NAV                                                                 */
/* ------------------------------------------------------------------ */
function Nav({ t, lang, setLang }: { t: T; lang: Lang; setLang: (l: Lang) => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12);
    on(); window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  // Lock body scroll + close on Escape when the mobile menu is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <nav className={`nav${scrolled ? " scrolled" : ""}${open ? " menu-open" : ""}`}>
      <div className="wrap nav-inner">
        <a className="brand" href="#top" onClick={close}><img src={scrolled || open ? "/logo.png" : "/logo-white.png"} alt="Litug" /></a>

        <div className="nav-links">
          <a className="nav-link" href="#comment">{t.nav.comment}</a>
          <a className="nav-link" href="#preuves">{t.nav.garanties}</a>
          <a className="nav-link" href="/nos-terrains">{t.nav.terrains}</a>
          <a className="nav-link" href="/produits">{t.nav.tarifs}</a>
          <a className="nav-link" href="/blog">{t.nav.blog}</a>
        </div>

        <div className="nav-right">
          <div className="lang-toggle" role="group" aria-label="Language">
            <button className={lang === "fr" ? "on" : ""} onClick={() => setLang("fr")}>FR</button>
            <button className={lang === "en" ? "on" : ""} onClick={() => setLang("en")}>EN</button>
          </div>
          <Link className="btn btn-ghost" href="/login">{t.nav.login}</Link>
          <a className="btn btn-primary" href="#contact">
            <span className="nav-cta-text">{t.nav.cta}</span>
            <Icon name="arrow" size={16} className="arr" />
          </a>
        </div>

        <button
          className="nav-burger"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span></span><span></span><span></span>
        </button>
      </div>

      {/* Mobile menu */}
      <div className={`nav-mobile${open ? " open" : ""}`} role="dialog" aria-modal="true">
        <div className="nav-mobile-links">
          <a href="#comment" onClick={close}>{t.nav.comment}</a>
          <a href="#preuves" onClick={close}>{t.nav.garanties}</a>
          <a href="/nos-terrains" onClick={close}>{t.nav.terrains}</a>
          <a href="/produits" onClick={close}>{t.nav.tarifs}</a>
          <a href="/blog" onClick={close}>{t.nav.blog}</a>
        </div>
        <div className="nav-mobile-actions">
          <Link className="btn btn-ghost btn-lg" href="/login" onClick={close}>{t.nav.login}</Link>
          <a className="btn btn-primary btn-lg" href="#contact" onClick={close}>
            {t.nav.cta}<Icon name="arrow" size={17} className="arr" />
          </a>
        </div>
        <div className="nav-mobile-lang">
          <div className="lang-toggle" role="group" aria-label="Language">
            <button className={lang === "fr" ? "on" : ""} onClick={() => setLang("fr")}>FR</button>
            <button className={lang === "en" ? "on" : ""} onClick={() => setLang("en")}>EN</button>
          </div>
        </div>
      </div>
      <div className={`nav-scrim${open ? " open" : ""}`} onClick={close}></div>
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/* HERO                                                                */
/* ------------------------------------------------------------------ */
function Hero({ t, lang }: { t: T; lang: Lang }) {
  const ref = useReveal();
  return (
    <header className="hero on-ink" id="top" ref={ref}>
      <div className="hero-bg">
        <div className="hero-grid-tex"></div>
        <div className="glow g1"></div>
        <div className="glow g2"></div>
      </div>
      <div className="wrap hero-inner">
        <div className="hero-text reveal">
          <span className="hero-badge"><span className="pulse"></span>{t.hero.badge}</span>
          <h1>
            <span className="accent">{t.hero.title_1}</span>{' '}
            {t.hero.title_2}
          </h1>
          <p className="hero-sub">{t.hero.sub}</p>
          <ul className="hero-checks">
            {t.hero.checks.map((c, i) => (
              <li key={i}><Icon name="check" size={14} stroke={2.5} />{c}</li>
            ))}
          </ul>
          <div className="hero-ctas">
            <a className="btn btn-gold btn-lg" href="/mustaf#offres">{t.hero.cta_primary}<Icon name="arrow" size={17} className="arr" /></a>
            <a className="btn btn-ghost btn-lg" href="/sara">{t.hero.cta_secondary}</a>
          </div>
          <div className="hero-proof">
            <div className="avatars">
              <img src="/avatars/avatar-homme-noir.jpg" alt="" width={32} height={32} loading="lazy" />
              <img src="/avatars/avatar-femme-noire.jpg" alt="" width={32} height={32} loading="lazy" />
              <img src="/avatars/avatar-homme-blanc.jpg" alt="" width={32} height={32} loading="lazy" />
            </div>
            <span>{t.hero.proof}</span>
          </div>
        </div>
        <div className="hero-visual reveal">
          <WhatsAppChat lang={lang} agentName="Sara" status={lang === "fr" ? "en ligne" : "online"} />
          <div className="hero-float f1">
            <span className="ic"><Icon name="bolt" size={17} /></span>
            <div>
              <b>{lang === "fr" ? "Réponse instantanée" : "Instant reply"}</b>
              <small>{lang === "fr" ? "moins de 1 sec" : "under 1 sec"}</small>
            </div>
          </div>
          <div className="hero-float f2">
            <span className="ic"><Icon name="check" size={17} /></span>
            <div>
              <b>{lang === "fr" ? "Prospect qualifié" : "Lead qualified"}</b>
              <small>{lang === "fr" ? "budget · zone · m²" : "budget · area · m²"}</small>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* REASSURE — bande de confiance sous le hero                          */
/* ------------------------------------------------------------------ */
function Reassure({ t }: { t: T }) {
  const ref = useReveal();
  return (
    <section className="reassure-sec" ref={ref}>
      <div className="wrap reassure-grid reveal">
        {t.reassure.map((r, i) => (
          <div className="reassure-item" key={i}>
            <span className="tick"><Icon name="check" size={14} stroke={2.5} /></span>{r}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* MARQUEE                                                             */
/* ------------------------------------------------------------------ */
function Marquee({ t }: { t: T }) {
  const items = [...PARTNERS, ...PARTNERS];
  return (
    <section className="marquee-sec">
      <div className="marquee-label">{t.marquee.label}</div>
      <div className="marquee">
        <div className="marquee-track">
          {items.map((p, i) => (
            <div className="marquee-item" key={i}><span className="md"></span>{p}</div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* PROBLEME + AGITATION                                                */
/* ------------------------------------------------------------------ */
type PainRow = { t: string; v: string };
type PainData = { tag: string; title: string; head: PainRow[]; more: PainRow[] };

function PainRows({ rows }: { rows: PainRow[] }) {
  return (
    <>
      {rows.map((r, i) => {
        if (r.t === "h") return <h3 className="pain-h" key={i}>{r.v}</h3>;
        if (r.t === "x") return (
          <div className="pain-x" key={i}>
            <span className="cross"><Icon name="x" size={13} stroke={2.5} /></span>
            <span>{r.v}</span>
          </div>
        );
        return <p className="pain-p" key={i}>{r.v}</p>;
      })}
    </>
  );
}

function PainBlock({ data, alt, moreLabel, lessLabel }: { data: PainData; alt?: boolean; moreLabel: string; lessLabel: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`pain-block reveal${alt ? " alt" : ""}`}>
      <span className="eyebrow">{data.tag}</span>
      <h2 className="section-title">{data.title}</h2>
      <div className="pain-rows">
        <PainRows rows={data.head} />
        <div className={`pain-extra${open ? " open" : ""}`} aria-hidden={!open}>
          <div className="pain-extra-inner"><PainRows rows={data.more} /></div>
        </div>
      </div>
      <button type="button" className="pain-more" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        {open ? lessLabel : moreLabel}
        <Icon name="arrow" size={15} className={`pain-more-ic${open ? " up" : ""}`} />
      </button>
    </div>
  );
}

function Probleme({ t, lang }: { t: T; lang: Lang }) {
  const ref = useReveal();
  const moreLabel = lang === "fr" ? "Voir plus" : "See more";
  const lessLabel = lang === "fr" ? "Voir moins" : "See less";
  return (
    <section className="section pain" id="probleme" ref={ref}>
      <div className="wrap pain-inner">
        <PainBlock data={t.probleme} moreLabel={moreLabel} lessLabel={lessLabel} />
        <PainBlock data={t.agitation} alt moreLabel={moreLabel} lessLabel={lessLabel} />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* PARCOURS (solution — two products)                                  */
/* ------------------------------------------------------------------ */
function Parcours({ t, lang }: { t: T; lang: Lang }) {
  const ref = useReveal();
  return (
    <section className="section parcours" id="produits" ref={ref}>
      <div className="wrap">
        <div className="parcours-head reveal">
          <span className="eyebrow">{t.parcours.kicker}</span>
          <h2 className="section-title">{t.parcours.title}</h2>
          <p className="section-sub" style={{ textAlign: "center" }}>{t.parcours.sub}</p>
        </div>
        <div className="parcours-grid">
          <article className="pcard reveal">
            <div className="pcard-media">
              <span className="pcard-tag">{t.parcours.card1_tag}</span>
              <img className="pcard-img" src="/parcours/terrain-vente.jpg" alt="" loading="lazy" />
              <span className="pcard-label">{lang === "fr" ? "terrain / vente" : "land / sale"}</span>
            </div>
            <div className="pcard-body">
              <h3>{t.parcours.card1_title}</h3>
              <p>{t.parcours.card1_desc}</p>
              <a className="btn btn-primary" href="#sara">{t.parcours.card1_cta}<Icon name="arrow" size={16} className="arr" /></a>
            </div>
          </article>
          <article className="pcard reveal">
            <div className="pcard-media">
              <span className="pcard-tag">{t.parcours.card2_tag}</span>
              <img className="pcard-img" src="/parcours/architecture-chantier.jpg" alt="" loading="lazy" />
              <span className="pcard-label">{lang === "fr" ? "architecture / chantier" : "architecture / build"}</span>
            </div>
            <div className="pcard-body">
              <h3>{t.parcours.card2_title}</h3>
              <p>{t.parcours.card2_desc}</p>
              <a className="btn btn-primary" href="#mustaf">{t.parcours.card2_cta}<Icon name="arrow" size={16} className="arr" /></a>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* SARA                                                                */
/* ------------------------------------------------------------------ */
function Sara({ t, lang }: { t: T; lang: Lang }) {
  const ref = useReveal();
  return (
    <section className="section agent" id="sara" ref={ref}>
      <div className="wrap agent-inner">
        <div className="agent-text reveal">
          <span className="eyebrow">{t.sara.kicker}</span>
          <span className="agent-badge"><span className="dot"></span>{t.sara.badge}</span>
          <h2>{t.sara.title}</h2>
          <p className="agent-desc">{t.sara.desc}</p>
          <ul className="agent-list">
            {t.sara.features.map((f, i) => (
              <li key={i}><span className="tick"><Icon name="check" size={14} stroke={2.5} /></span>{f}</li>
            ))}
          </ul>
          <Link className="btn btn-primary btn-lg" href="/sara">{t.sara.cta}<Icon name="arrow" size={17} className="arr" /></Link>
        </div>
        <div className="agent-visual reveal" style={{ position: "relative", justifySelf: "center", width: "100%", maxWidth: 380 }}>
          <WhatsAppChat lang={lang} agentName="Sara" status={lang === "fr" ? "en ligne" : "online"} />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* MUSTAF (iPad dashboard)                                             */
/* ------------------------------------------------------------------ */
function Mustaf({ t, lang }: { t: T; lang: Lang }) {
  const ref = useReveal();
  return (
    <section className="section agent alt reverse" id="mustaf" ref={ref}>
      <div className="wrap agent-inner">
        <div className="agent-text reveal">
          <span className="eyebrow">{t.mustaf.kicker}</span>
          <span className="agent-badge"><Icon name="home" size={14} />{t.mustaf.badge}</span>
          <h2><span className="nm">{t.mustaf.name}</span> — {t.mustaf.title}</h2>
          <p className="agent-desc">{t.mustaf.desc}</p>
          <p className="mustaf-example">{t.mustaf.example}</p>
          <ul className="agent-list">
            {t.mustaf.services.map((s, i) => (
              <li key={i}><span className="tick"><Icon name="check" size={14} stroke={2.5} /></span>{s}</li>
            ))}
          </ul>
          <a className="btn btn-primary btn-lg" href="/mustaf#offres">{t.mustaf.cta}<Icon name="arrow" size={17} className="arr" /></a>
        </div>
        <div className="agent-visual ipad-wrap reveal">
          <IpadDashboard lang={lang} />
          <div className="hero-float f1">
            <span className="ic"><Icon name="shield" size={17} /></span>
            <div>
              <b>{lang === "fr" ? "Argent protégé" : "Money protected"}</b>
              <small>{lang === "fr" ? "tiers de confiance" : "trusted third party"}</small>
            </div>
          </div>
          <div className="hero-float f2">
            <span className="ic"><Icon name="camera" size={17} /></span>
            <div>
              <b>{lang === "fr" ? "Photo géolocalisée" : "Geolocated photo"}</b>
              <small>{lang === "fr" ? "datée · horodatée" : "dated · timestamped"}</small>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* COMMENT ÇA MARCHE                                                   */
/* ------------------------------------------------------------------ */
function Comment({ t }: { t: T }) {
  const ref = useReveal();
  return (
    <section className="section steps" id="comment" ref={ref}>
      <div className="wrap">
        <div className="parcours-head reveal">
          <span className="eyebrow">{t.comment.kicker}</span>
          <h2 className="section-title">{t.comment.title}</h2>
        </div>
        <div className="comment-dual">
          {/* ── Sara panel ── */}
          <div className="comment-panel reveal">
            <div className="comment-panel-head">
              <span className="cpanel-tag">{t.comment.sara.tag}</span>
              <h3>{t.comment.sara.label}</h3>
              <p className="comment-trial">{t.comment.sara.trial}</p>
            </div>
            {t.comment.sara.steps.map((s, i) => (
              <article className="stepcard" key={i}>
                <div className="step-n">{s.n}</div>
                <h3>{s.title}</h3>
                <ul>
                  {s.items.map((it, j) => (
                    <li key={j}><Icon name="check" size={13} stroke={2.5} />{it}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          {/* ── Mustaf panel ── */}
          <div className="comment-panel reveal">
            <div className="comment-panel-head mustaf-head">
              <span className="cpanel-tag">{t.comment.mustaf.tag}</span>
              <h3>{t.comment.mustaf.label}</h3>
            </div>
            {t.comment.mustaf.steps.map((s, i) => (
              <article className="stepcard" key={i}>
                <div className="step-n">{s.n}</div>
                <h3>{s.title}</h3>
                <ul>
                  {s.items.map((it, j) => (
                    <li key={j}><Icon name="check" size={13} stroke={2.5} />{it}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* DASHBOARD (iPad showcase)                                           */
/* ------------------------------------------------------------------ */
function Dashboard({ t, lang }: { t: T; lang: Lang }) {
  const ref = useReveal();
  return (
    <section className="section dashsec on-ink" id="dashboard" ref={ref}>
      <div className="hero-bg">
        <div className="glow g1" style={{ opacity: 0.28 }}></div>
        <div className="glow g2"></div>
      </div>
      <div className="wrap dashsec-inner">
        <div className="reveal">
          <span className="eyebrow">{t.dash.kicker}</span>
          <h2 className="section-title">{t.dash.title}</h2>
          <p className="section-sub">{t.dash.sub}</p>
          <ul className="agent-list dash-points">
            {t.dash.points.map((p, i) => (
              <li key={i}><span className="tick"><Icon name="check" size={14} stroke={2.5} /></span>{p}</li>
            ))}
          </ul>
        </div>
        <div className="ipad-wrap big reveal">
          <IpadDashboard lang={lang} />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* IMPACT                                                              */
/* ------------------------------------------------------------------ */
function Impact({ t }: { t: T }) {
  const ref = useReveal();
  const icons = ["clock", "shield", "file", "wallet"] as const;
  return (
    <section className="section impact on-ink" id="impact" ref={ref}>
      <div className="hero-bg">
        <div className="glow g1" style={{ opacity: 0.3 }}></div>
        <div className="glow g2"></div>
      </div>
      <div className="wrap">
        <div className="impact-head reveal">
          <span className="eyebrow">{t.impact.kicker}</span>
          <h2 className="section-title" style={{ textAlign: "center" }}>{t.impact.title}</h2>
        </div>
        <div className="impact-grid">
          {t.impact.stats.map((s, i) => (
            <div className="istat reveal" key={i}>
              <div className="ic"><Icon name={icons[i]} size={20} /></div>
              <div className="num"><CountUp end={s.value} prefix={s.prefix} suffix={s.suffix} /></div>
              <div className="lbl">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* PREUVES + COMPARAISON                                               */
/* ------------------------------------------------------------------ */
function Preuves({ t }: { t: T }) {
  const ref = useReveal();
  return (
    <section className="section preuves" id="preuves" ref={ref}>
      <div className="wrap">
        <div className="parcours-head reveal">
          <span className="eyebrow">{t.preuves.kicker}</span>
          <h2 className="section-title">{t.preuves.title}</h2>
        </div>
        <div className="preuves-grid">
          {t.preuves.points.map((p, i) => (
            <div className="preuve reveal" key={i}>
              <span className="tick"><Icon name="check" size={14} stroke={2.5} /></span>{p}
            </div>
          ))}
        </div>

        <div className="compare reveal">
          <div className="compare-col before">
            <h4><Icon name="x" size={16} stroke={2.5} />{t.compare.before_label}</h4>
            <ul>
              {t.compare.before.map((b, i) => <li key={i}><Icon name="x" size={13} stroke={2.5} />{b}</li>)}
            </ul>
          </div>
          <div className="compare-col after">
            <h4><Icon name="check" size={16} stroke={2.5} />{t.compare.after_label}</h4>
            <ul>
              {t.compare.after.map((a, i) => <li key={i}><Icon name="check" size={13} stroke={2.5} />{a}</li>)}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* LISTINGS                                                            */
/* ------------------------------------------------------------------ */
type ApiTerrain = {
  id: string;
  title: string;
  zone: string;
  surface: number | null;
  priceFcfa: number;
  documentType: 'tf' | 'bail' | 'deliberation';
  verificationStatus: 'non_verifie' | 'a_verifier' | 'verifie';
  saleStatus: 'disponible' | 'en_cours_de_vente' | 'vendu';
  sellerName: string;
  photo: string | null;
};

type ApiHouse = {
  id: string;
  title: string | null;
  surface: string | null;
  photo: string;
};

const DOC_LABEL_FR: Record<ApiTerrain['documentType'], string> = {
  tf: 'Titre Foncier',
  bail: 'Bail',
  deliberation: 'Délibération',
};
const DOC_HUE: Record<ApiTerrain['documentType'], number> = { tf: 150, bail: 40, deliberation: 0 };

function Listings({ t, lang }: { t: T; lang: Lang }) {
  const ref = useReveal();
  const [tab, setTab] = useState<"lands" | "houses">("lands");
  const [terrains, setTerrains] = useState<ApiTerrain[] | null>(null);
  const [houses, setHouses] = useState<ApiHouse[] | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/public/terrains?limit=6")
      .then((r) => r.json())
      .then((d) => { if (active) setTerrains(Array.isArray(d.terrains) ? d.terrains : []); })
      .catch(() => { if (active) setTerrains([]); });
    fetch("/api/public/house-examples")
      .then((r) => r.json())
      .then((d) => { if (active) setHouses(Array.isArray(d.houses) ? d.houses : []); })
      .catch(() => { if (active) setHouses([]); });
    return () => { active = false; };
  }, []);

  return (
    <section className="section listings" id="listings" ref={ref}>
      <div className="wrap">
        <div className="listings-head reveal">
          <div>
            <span className="eyebrow">{t.listings.kicker}</span>
            <h2 className="section-title">{t.listings.title}</h2>
          </div>
          <div className="tabs">
            <button className={tab === "lands" ? "on" : ""} onClick={() => setTab("lands")}>{t.listings.tab1}</button>
            <button className={tab === "houses" ? "on" : ""} onClick={() => setTab("houses")}>{t.listings.tab2}</button>
          </div>
        </div>

        {tab === "lands" ? (
          (terrains && terrains.length > 0) ? (
            <div className="lgrid">
              {terrains.map((l) => (
                <Link className="lcard" key={l.id} href={`/nos-terrains/${l.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <div className="lcard-media">
                    <span className="lcard-tag">{DOC_LABEL_FR[l.documentType]}</span>
                    {l.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={l.photo} alt={l.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <Placeholder label={lang === "fr" ? "photo terrain" : "land photo"} hue={DOC_HUE[l.documentType]} />
                    )}
                    {l.saleStatus === "vendu" && <span className="lcard-sold">{lang === "fr" ? "Vendu" : "Sold"}</span>}
                  </div>
                  <div className="lcard-body">
                    <div className="place"><Icon name="pin" size={15} stroke={1.6} />{l.zone}</div>
                    <div className="area">{l.surface != null ? `${l.surface.toLocaleString("fr-FR")} m²` : l.title}</div>
                    <div className="price">{l.priceFcfa.toLocaleString("fr-FR")} <small>FCFA</small></div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="lgrid">
              {LANDS.map((l) => (
                <article className="lcard" key={l.id} style={terrains ? { opacity: 0.55 } : undefined}>
                  <div className="lcard-media">
                    <span className="lcard-tag">{l.tag[lang]}</span>
                    <Placeholder label={lang === "fr" ? "photo terrain" : "land photo"} hue={l.hue} />
                  </div>
                  <div className="lcard-body">
                    <div className="place"><Icon name="pin" size={15} stroke={1.6} />{l.place[lang]}</div>
                    <div className="area">{l.area}</div>
                    <div className="price">{l.price} <small>FCFA</small></div>
                  </div>
                </article>
              ))}
            </div>
          )
        ) : (
          (houses && houses.length > 0) ? (
            <div className="lgrid">
              {houses.map((h) => (
                <article className="lcard" key={h.id}>
                  <div className="lcard-media house-media">
                    <span className="lcard-tag"><Icon name="home" size={13} stroke={1.8} />{lang === "fr" ? "Réalisation" : "Build"}</span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={h.photo} alt={h.title ?? (lang === "fr" ? "Exemple de maison" : "House example")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div className="lcard-body">
                    <div className="place"><Icon name="home" size={15} stroke={1.8} />{h.title || (lang === "fr" ? "Maison" : "House")}</div>
                    {h.surface && <div className="area">{h.surface}</div>}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="lgrid">
              {HOUSES.map((h) => (
                <article className="lcard" key={h.id} style={houses ? { opacity: 0.55 } : undefined}>
                  <div className="hcard-media">
                    <div className="half"><Placeholder label="" hue={(h.hue + 30) % 360} /><span>{t.listings.before}</span></div>
                    <div className="half"><Placeholder label="" hue={h.hue} /><span>{t.listings.after}</span></div>
                  </div>
                  <div className="lcard-body">
                    <div className="place"><Icon name="home" size={15} stroke={1.8} />{h.name[lang]}</div>
                    <div className="area">{h.area}</div>
                    <div className="price" style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span className="chip" style={{ padding: "5px 11px" }}>
                        <Icon name="layers" size={13} />
                        {lang === "fr" ? "Plans + rendu 3D" : "Plans + 3D render"}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )
        )}

        <div style={{ textAlign: "center", marginTop: 40 }} className="reveal">
          <Link className="btn btn-ghost btn-lg" href="/nos-terrains">{t.listings.cta}<Icon name="arrow" size={16} className="arr" /></Link>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* FAQ                                                                 */
/* ------------------------------------------------------------------ */
function Faq({ t }: { t: T }) {
  const ref = useReveal();
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="section faq" id="faq" ref={ref}>
      <div className="wrap faq-inner">
        <div className="reveal">
          <span className="eyebrow">{t.faq.kicker}</span>
          <h2 className="section-title">{t.faq.title}</h2>
        </div>
        <div className="faq-list reveal">
          {t.faq.items.map((it, i) => (
            <div className={`faq-item${open === i ? " open" : ""}`} key={i}>
              <button className="faq-q" onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i}>
                <span>{it.q}</span>
                <span className="faq-plus"><i></i><i></i></span>
              </button>
              <div className="faq-a"><p>{it.a}</p></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* CTA FINAL                                                           */
/* ------------------------------------------------------------------ */
function CtaFinal({ t }: { t: T }) {
  const ref = useReveal();
  return (
    <section className="section cta-final on-ink" ref={ref}>
      <div className="hero-bg">
        <div className="hero-grid-tex"></div>
        <div className="glow g1"></div>
        <div className="glow g2"></div>
      </div>
      <div className="wrap cta-final-inner reveal">
        <h2 className="section-title">{t.ctaFinal.title}</h2>
        <p className="section-sub" style={{ marginInline: "auto" }}>{t.ctaFinal.sub}</p>
        <div className="cta-final-btns">
          <a className="btn btn-gold btn-lg" href="#contact">{t.ctaFinal.cta1}<Icon name="arrow" size={17} className="arr" /></a>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* CONTACT                                                             */
/* ------------------------------------------------------------------ */
function Contact({ t, lang }: { t: T; lang: Lang }) {
  const ref = useReveal();
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sending || sent) return;
    setError(false);
    setSending(true);

    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      whatsapp: String(data.get("whatsapp") ?? ""),
      message: String(data.get("message") ?? ""),
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (res.ok && json.ok) {
        setSent(true);
        form.reset();
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setSending(false);
    }
  }

  // Positions réelles (lon/lat → viewBox 1024, projection équirectangulaire sur la silhouette)
  const pins = [
    { c: "Saint-Louis", x: 172, y: 221 },
    { c: "Dakar",       x: 16,  y: 475 },
    { c: "Thiès",       x: 100, y: 456 },
    { c: "Saly",        x: 89,  y: 521 },
  ];

  return (
    <section className="section contact" id="contact" ref={ref}>
      <div className="wrap contact-inner">
        <div className="reveal">
          <span className="eyebrow">{t.contact.kicker}</span>
          <h2 className="section-title">{t.contact.title}</h2>
          <p className="section-sub">{t.contact.sub}</p>
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="field">
              <label>{t.contact.name}</label>
              <input type="text" name="name" required placeholder="Awa Ndiaye" />
            </div>
            <div className="two">
              <div className="field">
                <label>{t.contact.email}</label>
                <input type="email" name="email" required placeholder="awa@email.com" />
              </div>
              <div className="field">
                <label>{t.contact.whatsapp}</label>
                <input type="tel" name="whatsapp" required placeholder="+221 77 000 00 00" />
              </div>
            </div>
            <div className="field">
              <label>{t.contact.message}</label>
              <textarea name="message" required placeholder={lang === "fr" ? "Parlez-nous de votre projet…" : "Tell us about your project…"}></textarea>
            </div>
            <button className="btn btn-primary btn-lg" type="submit" disabled={sending || sent}>
              {sent ? t.contact.sent : sending ? t.contact.sending : t.contact.send}
              {!sent && !sending && <Icon name="send" size={16} />}
            </button>
            {error && (
              <p role="alert" style={{ marginTop: 10, color: "#b3261e", fontSize: 14 }}>
                {t.contact.error}
              </p>
            )}
          </form>
        </div>
        <div className="reveal">
          <div className="map-card">
            <div className="grid-lines"></div>
            <svg viewBox="0 90 1024 850" fill="none" aria-hidden="true">
              {/* Silhouette réelle du Sénégal (tracé géographique, enclave de la Gambie incluse) */}
              <g transform="translate(0,1024) scale(0.1,-0.1)"
                fill="rgba(201,162,74,0.12)" stroke="rgba(201,162,74,0.55)"
                strokeWidth="35" strokeLinejoin="round">
                {SENEGAL_PATHS.map((d, i) => (
                  <path key={i} d={d} />
                ))}
              </g>
              {/* Villes (coordonnées réelles projetées) */}
              {pins.map((p, i) => (
                <g key={i}>
                  <circle cx={p.x} cy={p.y} r="22" fill="var(--gold)" opacity="0.28" />
                  <circle cx={p.x} cy={p.y} r="11" fill="var(--gold)" />
                  <text x={p.x + 30} y={p.y + 11} fill="#fff" fontSize="30" fontWeight="600"
                    fontFamily="var(--font-body), sans-serif">{p.c}</text>
                </g>
              ))}
            </svg>
            <div className="map-label">
              {lang === "fr" ? "Sénégal" : "Senegal"}
              <small>{t.contact.map_label}</small>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* FOOTER                                                              */
/* ------------------------------------------------------------------ */
function Footer({ t }: { t: T }) {
  const socials = [
    { name: "tiktok", href: "https://www.tiktok.com/@litug_groupe", label: "TikTok" },
  ] as const;
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error" | "invalid">("idle");
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Nettoyage du minuteur si le composant est démonté avant la fin des 3 s.
  useEffect(() => () => { if (resetTimer.current) clearTimeout(resetTimer.current); }, []);

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setStatus("invalid");
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value }),
      });
      if (res.ok) {
        setStatus("done");
        setEmail("");
        // Le message de remerciement s'efface après 3 s ; le bouton redevient normal.
        if (resetTimer.current) clearTimeout(resetTimer.current);
        resetTimer.current = setTimeout(() => setStatus("idle"), 3000);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  const subMsg =
    status === "done" ? t.footer.subscribed
    : status === "error" ? t.footer.sub_error
    : status === "invalid" ? t.footer.sub_invalid
    : null;

  return (
    <footer className="footer on-ink" id="blog">
      <div className="wrap">
        <div className="footer-top">
          <div>
            <a className="brand" href="#top"><img src="/logo-white.png" alt="Litug" /></a>
            <p className="footer-tag">{t.footer.tagline}</p>
            <form className="footer-news" onSubmit={handleSubscribe}>
              <input
                type="email"
                placeholder={t.footer.newsletter_sub}
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (status !== "idle" && status !== "sending") setStatus("idle"); }}
                aria-label={t.footer.newsletter_sub}
              />
              <button className="btn btn-gold" type="submit" disabled={status === "sending"}>
                {status === "sending" ? t.footer.subscribing : t.footer.subscribe}
              </button>
            </form>
            {subMsg && (
              <p role="status" style={{ marginTop: 8, fontSize: 13, color: status === "done" ? "var(--text-on-ink-muted)" : "#ff8a80" }}>
                {subMsg}
              </p>
            )}
          </div>
          <div className="footer-col">
            <h5>{t.footer.col1}</h5>
            {t.footer.col1_links.map((l, i) => <Link key={i} href={l.href}>{l.label}</Link>)}
          </div>
          <div className="footer-col">
            <h5>{t.footer.col2}</h5>
            {t.footer.col2_links.map((l, i) => <Link key={i} href={l.href}>{l.label}</Link>)}
          </div>
          <div className="footer-col">
            <h5>{t.footer.col3}</h5>
            {t.footer.col3_links.map((l, i) => <Link key={i} href={l.href}>{l.label}</Link>)}
          </div>
        </div>
        <div className="footer-bottom">
          <span className="rights">{t.footer.rights}</span>
          <div className="socials">
            {socials.map((s, i) => (
              <a key={i} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}>
                <Icon name={s.name} size={16} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/* PAGE                                                                */
/* ------------------------------------------------------------------ */
export default function LandingPage() {
  const [lang, setLangState] = useState<Lang>("fr");

  useEffect(() => {
    const stored = localStorage.getItem("litug_lang") as Lang | null;
    if (stored === "fr" || stored === "en") setLangState(stored);
  }, []);

  const setLang = (l: Lang) => { setLangState(l); localStorage.setItem("litug_lang", l); };

  const t = I18N[lang];

  return (
    <div className="landing-root" data-palette="sahel" data-font="grotesk" data-hero="split">
      <Nav t={t} lang={lang} setLang={setLang} />
      <main>
        <Hero t={t} lang={lang} />
        <Reassure t={t} />
        <Marquee t={t} />
        <Probleme t={t} lang={lang} />
        <Parcours t={t} lang={lang} />
        <Sara t={t} lang={lang} />
        <Mustaf t={t} lang={lang} />
        <Comment t={t} />
        <Dashboard t={t} lang={lang} />
        <Impact t={t} />
        <Preuves t={t} />
        <Listings t={t} lang={lang} />
        <Faq t={t} />
        <CtaFinal t={t} />
        <Contact t={t} lang={lang} />
      </main>
      <Footer t={t} />
    </div>
  );
}
