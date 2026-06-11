'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
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
    nav: { terrains: "Nos terrains", comment: "Comment ça marche", garanties: "Nos garanties", tarifs: "Tarifs", login: "Se connecter", cta: "Réserver un entretien" },
    hero: {
      badge: "Vol? arnaque? · Basta",
      title_1: "Achetez votre terrain et construisez votre maison au Sénégal",
      title_2: "sans perdre votre argent, votre temps ou votre tranquillité d'esprit.",
      sub: "De l'achat du terrain vérifié jusqu'à la remise des clés, Litug vous accompagne avec un suivi financier transparent et un contrôle total de votre projet — depuis l'étranger.",
      cta_primary: "Je veux acheter ou construire en sécurité",
      cta_secondary: "Voir une démonstration",
      proof: "Déjà utilisé par des vendeurs, architectes et professionnels de l'immobilier",
      checks: ["Budget maîtrisé", "Dépenses vérifiables", "Suivi en temps réel", "Tiers de confiance"],
    },
    marquee: { label: "Des professionnels nous font déjà confiance" },
    probleme: {
      kicker: "Le problème",
      title: "Vous avez peur que votre argent disparaisse avant que votre projet n'aboutisse ?",
      intro: "Vous n'êtes pas seul. Chaque année, des milliers de Sénégalais vivant à l'étranger :",
      points: [
        "Achètent un terrain qui se révèle déjà vendu, faux ou inexistant",
        "Envoient de l'argent sans savoir comment il est utilisé",
        "Découvrent des dépassements de budget imprévus",
        "Reçoivent peu ou pas d'informations sur l'avancement du chantier",
        "Perdent des années à cause d'une mauvaise gestion",
      ],
      outro: "Acheter et construire à distance ne devrait pas être une source de stress.",
    },
    agitation: {
      kicker: "Le vrai coût",
      title: "Le vrai coût d'une arnaque ou d'une mauvaise gestion ne se limite pas à l'argent.",
      intro: "C'est aussi :",
      points: [
        "Un titre foncier contesté des années plus tard",
        "Des retards de plusieurs mois sur le chantier",
        "Des conflits familiaux autour de l'argent envoyé",
        "Des matériaux de mauvaise qualité, des travaux à refaire",
        "Des rêves reportés, encore et encore",
      ],
      outro: "Pendant que vous travaillez dur à l'étranger, votre projet mérite un suivi professionnel.",
    },
    parcours: {
      kicker: "La solution · Deux produits, une même promesse",
      title: "La confiance, du terrain à la maison finie",
      sub: "Que vous achetiez un terrain ou que vous construisiez, Litug vous donne une visibilité totale sur votre argent, vos documents et l'avancement de votre projet.",
      card1_tag: "Acheter un terrain",
      card1_title: "Sara — votre agent terrain IA",
      card1_desc: "Trouvez et achetez un terrain vérifié sans intermédiaire douteux. Sara qualifie, informe et ne vous propose que des terrains au statut clair.",
      card1_cta: "Découvrir Sara",
      card2_tag: "Construire sa maison",
      card2_title: "Mustaf — construire en confiance",
      card2_desc: "Vous avez un terrain ? Construisez au pays sereinement : argent protégé chez un tiers, paiement par phase, suivi photo depuis votre tablette.",
      card2_cta: "Découvrir Mustaf",
    },
    sara: {
      kicker: "Produit 1 · Acheter un terrain",
      badge: "Disponible 24h/24",
      title: "Sara, votre commercial qui ne dort jamais",
      desc: "Sara est un agent IA WhatsApp qui répond instantanément, qualifie chaque acheteur et ne met en avant que des terrains au statut vérifié — fini les arnaques et les terrains fantômes.",
      features: [
        "Répond automatiquement, 24/7",
        "Qualifie chaque client : budget, zone, superficie",
        "N'envoie que des terrains au statut clair (TF, Bail, Délibération)",
        "Envoie photos et fiches d'information",
        "Ne transfère que les prospects sérieux à un humain",
      ],
      cta: "Activer Sara",
    },
    mustaf: {
      kicker: "Produit 2 · Construire sa maison",
      name: "Mustaf",
      badge: "Construire en toute confiance",
      title: "Gardez le contrôle de votre chantier, depuis n'importe où dans le monde",
      desc: "Pour ceux qui possèdent déjà un terrain, Mustaf gère le chantier de A à Z. Votre argent reste bloqué chez un tiers de confiance, les travaux n'avancent que phase par phase, et vous voyez chaque franc et chaque photo depuis votre tablette.",
      services: [
        "Argent bloqué chez un tiers de confiance, jamais chez nous",
        "Une phase ne démarre que lorsqu'elle est financée",
        "Zéro marge sur les matériaux, factures à l'appui",
        "Inspecteur indépendant avant chaque paiement",
        "Photos du chantier datées et géolocalisées",
        "Toute la famille peut cotiser, participation visible",
      ],
      cta: "Voir les offres",
    },
    comment: {
      kicker: "Comment ça marche",
      title: "Un processus simple et sécurisé",
      steps: [
        { n: "1", title: "Terrain vérifié", items: ["Vérification du titre à la Conservation Foncière", "Bornage et statut clair (TF, Bail…)", "Achat sécurisé via notaire séquestre"] },
        { n: "2", title: "Préparation du projet", items: ["Étude du terrain", "Plan architectural + permis de construire", "Budget prévisionnel détaillé"] },
        { n: "3", title: "Votre espace personnel", items: ["Accès à votre tableau de bord", "Toute la famille peut participer au financement"] },
        { n: "4", title: "Financement progressif", items: ["Les fonds sont collectés étape par étape", "Fondation · Élévation · Toiture · Finitions"] },
        { n: "5", title: "Exécution contrôlée", items: ["Inspecteur indépendant avant chaque paiement", "Chaque dépense enregistrée, chaque facture disponible"] },
        { n: "6", title: "Livraison", items: ["Une retenue de garantie reste bloquée jusqu'à la livraison", "Remise des clés en toute sérénité"] },
      ],
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
        { value: 0, prefix: "", suffix: "%", label: "de marge sur les matériaux, factures visibles" },
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
      tab2: "Maisons construites",
      cta: "Voir plus",
      before: "Avant",
      after: "Après",
    },
    faq: {
      kicker: "FAQ",
      title: "Les questions que vous vous posez",
      items: [
        { q: "Puis-je utiliser Litug si j'ai déjà mon terrain ?", a: "Oui. Vous passez directement à Mustaf pour la construction, sans repayer l'achat du terrain." },
        { q: "Puis-je utiliser Mustaf si j'ai déjà mes plans ?", a: "Oui. Vous ne paierez pas les prestations que vous possédez déjà." },
        { q: "Ma famille peut-elle participer au financement ?", a: "Oui. Chaque membre peut contribuer directement au projet, et chaque versement est attribué et visible. (Il s'agit d'un relevé de contributions, pas d'un titre de propriété.)" },
        { q: "Comment suivre les dépenses ?", a: "Toutes les dépenses sont visibles dans votre tableau de bord, facture à l'appui, en temps réel." },
        { q: "Mon argent est-il en sécurité ?", a: "Oui. Il reste bloqué chez un tiers de confiance (notaire séquestre / banque partenaire) et n'est libéré qu'après vérification indépendante des travaux. Jamais chez nous." },
        { q: "Comment savoir qu'un terrain n'est pas une arnaque ?", a: "Un terrain n'est marqué « Vérifié » qu'après un contrôle réel par notaire/géomètre à la Conservation Foncière. Le statut (TF, Bail, Délibération) est toujours affiché, jamais caché." },
      ],
    },
    ctaFinal: {
      title: "Votre maison mérite plus qu'une promesse.",
      sub: "Achetez et construisez au Sénégal avec une visibilité totale sur chaque euro investi.",
      cta1: "Réserver mon entretien gratuit",
      cta2: "Parler à un conseiller",
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
    },
  },
  en: {
    nav: { terrains: "Our land", comment: "How it works", garanties: "Our guarantees", tarifs: "Pricing", login: "Log in", cta: "Book a call" },
    hero: {
      badge: "Vol? arnaque? · Basta",
      title_1: "Buy your land and build your home in Senegal",
      title_2: "without losing your money, your time or your peace of mind.",
      sub: "From a verified plot to the handover of the keys, Litug supports you with transparent financial tracking and full control of your project — from abroad.",
      cta_primary: "I want to buy or build safely",
      cta_secondary: "See a demo",
      proof: "Already used by sellers, architects and real-estate professionals",
      checks: ["Budget under control", "Verifiable expenses", "Real-time tracking", "Trusted third party"],
    },
    marquee: { label: "Trusted by professionals across the country" },
    probleme: {
      kicker: "The problem",
      title: "Afraid your money will vanish before your project is finished?",
      intro: "You're not alone. Every year, thousands of Senegalese living abroad:",
      points: [
        "Buy land that turns out to be already sold, fake or non-existent",
        "Send money without knowing how it's used",
        "Discover unexpected budget overruns",
        "Get little or no information on the site's progress",
        "Lose years to poor management",
      ],
      outro: "Buying and building from afar shouldn't be a source of stress.",
    },
    agitation: {
      kicker: "The real cost",
      title: "The real cost of a scam or poor management isn't just money.",
      intro: "It's also:",
      points: [
        "A land title disputed years later",
        "Months of delays on the build",
        "Family conflicts over the money sent",
        "Poor-quality materials, work to redo",
        "Dreams postponed, again and again",
      ],
      outro: "While you work hard abroad, your project deserves professional oversight.",
    },
    parcours: {
      kicker: "The solution · Two products, one promise",
      title: "Trust, from the land to the finished home",
      sub: "Whether you're buying land or building, Litug gives you full visibility over your money, your documents and your project's progress.",
      card1_tag: "Buy land",
      card1_title: "Sara — your AI land agent",
      card1_desc: "Find and buy verified land with no shady middleman. Sara qualifies, informs, and only offers you plots with a clear status.",
      card1_cta: "Meet Sara",
      card2_tag: "Build a home",
      card2_title: "Mustaf — build with confidence",
      card2_desc: "Got land? Build back home with peace of mind: protected funds, pay-by-phase, photo tracking from your tablet.",
      card2_cta: "Meet Mustaf",
    },
    sara: {
      kicker: "Product 1 · Buy land",
      badge: "Available 24/7",
      title: "Sara, the salesperson that never sleeps",
      desc: "Sara is a WhatsApp AI agent that replies instantly, qualifies every buyer, and only surfaces verified plots — no more scams or phantom land.",
      features: [
        "Replies automatically, 24/7",
        "Qualifies every client: budget, area, size",
        "Only sends land with a clear status (TF, Bail, Délibération)",
        "Sends photos and info sheets",
        "Only forwards serious leads to a human",
      ],
      cta: "Activate Sara",
    },
    mustaf: {
      kicker: "Product 2 · Build a home",
      name: "Mustaf",
      badge: "Build with confidence",
      title: "Keep control of your build, from anywhere in the world",
      desc: "For those who already own land, Mustaf manages the whole build. Your money stays locked with a trusted third party, work only advances phase by phase, and you see every franc and every photo from your tablet.",
      services: [
        "Money locked with a trusted third party, never with us",
        "A phase only starts once it's funded",
        "Zero markup on materials, invoices included",
        "Independent inspector before every payment",
        "Dated, geolocated site photos",
        "The whole family can contribute — participation shown",
      ],
      cta: "See the plans",
    },
    comment: {
      kicker: "How it works",
      title: "A simple, secure process",
      steps: [
        { n: "1", title: "Verified land", items: ["Title check at the Conservation Foncière", "Boundaries and clear status (TF, Bail…)", "Secure purchase via notary escrow"] },
        { n: "2", title: "Project prep", items: ["Land survey", "Architectural plan + building permit", "Detailed budget forecast"] },
        { n: "3", title: "Your personal space", items: ["Access to your dashboard", "The whole family can join the financing"] },
        { n: "4", title: "Progressive funding", items: ["Funds collected step by step", "Foundation · Walls · Roof · Finishing"] },
        { n: "5", title: "Controlled execution", items: ["Independent inspector before every payment", "Every expense logged, every invoice available"] },
        { n: "6", title: "Handover", items: ["A retention stays locked until handover", "Keys handed over with peace of mind"] },
      ],
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
        { value: 0, prefix: "", suffix: "%", label: "markup on materials, invoices visible" },
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
      tab2: "Built homes",
      cta: "See more",
      before: "Before",
      after: "After",
    },
    faq: {
      kicker: "FAQ",
      title: "The questions you're asking",
      items: [
        { q: "Can I use Litug if I already own my land?", a: "Yes. You go straight to Mustaf for the build, without paying again for the land." },
        { q: "Can I use Mustaf if I already have my plans?", a: "Yes. You won't pay for services you already have." },
        { q: "Can my family help finance the project?", a: "Yes. Each member can contribute directly, and every deposit is attributed and visible. (It's a record of contributions, not a property title.)" },
        { q: "How do I track expenses?", a: "All expenses are visible in your dashboard, with invoices, in real time." },
        { q: "Is my money safe?", a: "Yes. It stays locked with a trusted third party (notary escrow / partner bank) and is only released after independent verification of the work. Never with us." },
        { q: "How do I know a plot isn't a scam?", a: "A plot is only marked “Verified” after a real check by a notary/surveyor at the Conservation Foncière. The status (TF, Bail, Délibération) is always shown, never hidden." },
      ],
    },
    ctaFinal: {
      title: "Your home deserves more than a promise.",
      sub: "Buy and build in Senegal with full visibility over every euro invested.",
      cta1: "Book my free call",
      cta2: "Talk to an advisor",
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
            <span className="accent">{t.hero.title_1}</span><br />
            {t.hero.title_2}
          </h1>
          <p className="hero-sub">{t.hero.sub}</p>
          <ul className="hero-checks">
            {t.hero.checks.map((c, i) => (
              <li key={i}><Icon name="check" size={14} stroke={2.5} />{c}</li>
            ))}
          </ul>
          <div className="hero-ctas">
            <a className="btn btn-gold btn-lg" href="#contact">{t.hero.cta_primary}<Icon name="arrow" size={17} className="arr" /></a>
            <a className="btn btn-ghost btn-lg" href="#sara">{t.hero.cta_secondary}</a>
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
function Probleme({ t }: { t: T }) {
  const ref = useReveal();
  return (
    <section className="section pain" id="probleme" ref={ref}>
      <div className="wrap pain-inner">
        <div className="pain-block reveal">
          <span className="eyebrow">{t.probleme.kicker}</span>
          <h2 className="section-title">{t.probleme.title}</h2>
          <p className="section-sub">{t.probleme.intro}</p>
          <ul className="pain-list">
            {t.probleme.points.map((p, i) => (
              <li key={i}><span className="cross"><Icon name="x" size={13} stroke={2.5} /></span>{p}</li>
            ))}
          </ul>
          <p className="pain-outro">{t.probleme.outro}</p>
        </div>
        <div className="pain-block alt reveal">
          <span className="eyebrow">{t.agitation.kicker}</span>
          <h2 className="section-title">{t.agitation.title}</h2>
          <p className="section-sub">{t.agitation.intro}</p>
          <ul className="pain-list">
            {t.agitation.points.map((p, i) => (
              <li key={i}><span className="cross"><Icon name="x" size={13} stroke={2.5} /></span>{p}</li>
            ))}
          </ul>
          <p className="pain-outro">{t.agitation.outro}</p>
        </div>
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
        <div className="steps-grid">
          {t.comment.steps.map((s, i) => (
            <article className="stepcard reveal" key={i}>
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

  useEffect(() => {
    let active = true;
    fetch("/api/public/terrains?limit=6")
      .then((r) => r.json())
      .then((d) => { if (active) setTerrains(Array.isArray(d.terrains) ? d.terrains : []); })
      .catch(() => { if (active) setTerrains([]); });
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
          <div className="lgrid">
            {HOUSES.map((h) => (
              <article className="lcard reveal" key={h.id}>
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
          <a className="btn btn-ghost btn-lg" href="#contact">{t.ctaFinal.cta2}</a>
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
    data.append("access_key", process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY ?? "");
    data.append("subject", "Nouveau message — formulaire de contact Litug");
    data.append("from_name", "Site Litug");

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: data,
      });
      const json = await res.json();
      if (json.success) {
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

  const pins = [
    { c: "Dakar",       x: "26%", y: "34%" },
    { c: "Thiès",       x: "40%", y: "42%" },
    { c: "Saly",        x: "33%", y: "56%" },
    { c: "Saint-Louis", x: "30%", y: "10%" },
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
            <svg viewBox="0 0 200 160" fill="none" aria-hidden="true">
              <path d="M28 40 L96 24 L150 30 L168 60 L150 86 L156 112 L120 132 L92 120 L70 132 L40 112 L34 78 Z"
                fill="rgba(201,162,74,0.10)" stroke="rgba(201,162,74,0.55)" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M96 96 L120 92 L120 108 L100 110 Z"
                fill="rgba(46,125,91,0.25)" stroke="rgba(46,125,91,0.5)" strokeWidth="1" />
            </svg>
            {pins.map((p, i) => (
              <div key={i} className="map-pin" data-c={p.c} style={{ left: p.x, top: p.y }}></div>
            ))}
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
  const socials = ["chat", "users", "send", "sparkle"] as const;
  return (
    <footer className="footer on-ink" id="blog">
      <div className="wrap">
        <div className="footer-top">
          <div>
            <a className="brand" href="#top"><img src="/logo-white.png" alt="Litug" /></a>
            <p className="footer-tag">{t.footer.tagline}</p>
            <div className="footer-news">
              <input type="email" placeholder={t.footer.newsletter_sub} />
              <button className="btn btn-gold">{t.footer.subscribe}</button>
            </div>
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
            {socials.map((s, i) => <a key={i} href="#top" aria-label="social"><Icon name={s} size={16} /></a>)}
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
        <Marquee t={t} />
        <Probleme t={t} />
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
