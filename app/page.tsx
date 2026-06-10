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
    nav: { terrains: "Nos terrains", blog: "Blog", produits: "Produits", login: "Se connecter", cta: "Nous contacter" },
    hero: {
      badge: "Propulsé par l'IA · Sénégal",
      title_1: "Sara, ton partenaire immobilier",
      title_2: "disponible 24/7",
      sub: "L'agent IA WhatsApp qui répond automatiquement à tes clients, qualifie leurs besoins et transforme plus de conversations en ventes.",
      cta_primary: "Commencer maintenant",
      cta_secondary: "En savoir plus",
      proof: "Déjà utilisé par des vendeurs, architectes et professionnels de l'immobilier",
    },
    marquee: { label: "Des professionnels nous font déjà confiance" },
    parcours: {
      kicker: "Choisis ton parcours",
      title: "Une expérience construite selon tes besoins",
      card1_tag: "Vendeurs",
      card1_title: "Je vends des terrains",
      card1_desc: "Automatise tes messages WhatsApp, réponds instantanément et convertis plus de prospects.",
      card1_cta: "Découvrir Sara",
      card2_tag: "Propriétaires",
      card2_title: "Je veux construire",
      card2_desc: "Vous avez un terrain ? Construisez au pays en toute confiance : argent protégé, paiement par phase, suivi photo depuis votre téléphone.",
      card2_cta: "Découvrir Mustaf",
    },
    sara: {
      kicker: "Agent terrain IA",
      badge: "Disponible 24h/24",
      title: "Ton commercial qui ne dort jamais",
      desc: "Sara est un agent IA WhatsApp qui prend le relais sur chaque conversation entrante.",
      features: [
        "Répond automatiquement, 24/7",
        "Qualifie chaque client entrant",
        "Demande budget, localisation, superficie et type de terrain",
        "Envoie photos et fiches d'information",
        "Ne transfère que les prospects qualifiés",
      ],
      cta: "Activer Sara",
    },
    mustaf: {
      kicker: "Tiers de confiance · Construction",
      name: "Mustaf",
      badge: "Construire en toute confiance",
      title: "Construisez au pays, en toute sérénité",
      desc: "Pour ceux qui possèdent déjà un terrain, Mustaf gère le chantier de A à Z. Votre argent reste bloqué chez un tiers de confiance, les travaux n'avancent que phase par phase, et vous voyez chaque franc et chaque photo depuis votre téléphone.",
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
    impact: {
      kicker: "Notre impact",
      title: "Des résultats qui parlent",
      stats: [
        { value: 80, prefix: "+", suffix: "%", label: "de temps économisé grâce à Sara" },
        { value: 3,  prefix: "",  suffix: "x", label: "plus de prospects qualifiés" },
        { value: 24, prefix: "",  suffix: "/7", label: "de disponibilité permanente" },
        { value: 70, prefix: "−", suffix: "%", label: "de faux prospects et d'arnaques" },
      ],
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
      tagline: "Construire le futur immobilier du Sénégal.",
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
    nav: { terrains: "Our land", blog: "Blog", produits: "Products", login: "Log in", cta: "Contact us" },
    hero: {
      badge: "AI-powered · Senegal",
      title_1: "Sara, your real-estate partner",
      title_2: "available 24/7, all year round",
      sub: "The WhatsApp AI agent that automatically replies to your clients, qualifies their needs, and turns more conversations into sales.",
      cta_primary: "Start now",
      cta_secondary: "Learn more",
      proof: "Already used by sellers, architects and real-estate professionals",
    },
    marquee: { label: "Trusted by professionals across the country" },
    parcours: {
      kicker: "Choose your path",
      title: "An experience built around your needs",
      card1_tag: "Sellers",
      card1_title: "I sell land",
      card1_desc: "Automate your WhatsApp messages, reply instantly, and convert more leads.",
      card1_cta: "Meet Sara",
      card2_tag: "Owners",
      card2_title: "I want to build",
      card2_desc: "Got land? Build back home with confidence: protected funds, pay-by-phase, photo tracking from your phone.",
      card2_cta: "Meet Mustaf",
    },
    sara: {
      kicker: "AI land agent",
      badge: "Available 24/7",
      title: "A salesperson that never sleeps",
      desc: "Sara is a WhatsApp AI agent that takes over every incoming conversation.",
      features: [
        "Replies automatically, 24/7",
        "Qualifies every incoming client",
        "Asks for budget, location, area and land type",
        "Sends photos and info sheets",
        "Only forwards qualified leads",
      ],
      cta: "Activate Sara",
    },
    mustaf: {
      kicker: "Construction · Trusted third party",
      name: "Mustaf",
      badge: "Build with confidence",
      title: "Build back home, with peace of mind",
      desc: "For those who already own land, Mustaf manages the whole build. Your money stays locked with a trusted third party, work only advances phase by phase, and you see every franc and every photo from your phone.",
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
    impact: {
      kicker: "Our impact",
      title: "Results that speak",
      stats: [
        { value: 80, prefix: "+", suffix: "%", label: "time saved thanks to Sara" },
        { value: 3,  prefix: "",  suffix: "x", label: "more qualified leads" },
        { value: 24, prefix: "",  suffix: "/7", label: "permanent availability" },
        { value: 70, prefix: "−", suffix: "%", label: "fewer fake leads and scams" },
      ],
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
      tagline: "Building the future of Senegalese real estate.",
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
        <a className="brand" href="#top" onClick={close}><img src="/logo.png" alt="Litug" /></a>

        <div className="nav-links">
          <a className="nav-link" href="/nos-terrains">{t.nav.terrains}</a>
          <a className="nav-link" href="/blog">{t.nav.blog}</a>
          <a className="nav-link" href="/produits">{t.nav.produits}</a>
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
          <a href="/nos-terrains" onClick={close}>{t.nav.terrains}</a>
          <a href="/blog" onClick={close}>{t.nav.blog}</a>
          <a href="/produits" onClick={close}>{t.nav.produits}</a>
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
/* PARCOURS                                                            */
/* ------------------------------------------------------------------ */
function Parcours({ t, lang }: { t: T; lang: Lang }) {
  const ref = useReveal();
  return (
    <section className="section parcours" id="produits" ref={ref}>
      <div className="wrap">
        <div className="parcours-head reveal">
          <span className="eyebrow">{t.parcours.kicker}</span>
          <h2 className="section-title">{t.parcours.title}</h2>
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
              <a className="btn btn-primary" href="/mustaf">{t.parcours.card2_cta}<Icon name="arrow" size={16} className="arr" /></a>
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
/* MUSTAF                                                              */
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
        <div className="agent-visual reveal" style={{ justifySelf: "center", width: "100%", maxWidth: 380 }}>
          <div className="blueprint">
            <div className="grid-lines"></div>
            <div className="plan">
              <div className="room lbl" data-l={lang === "fr" ? "SÉJOUR"  : "LIVING"}  style={{ left: 0,   top: 0,    width: "58%", height: "52%" }}></div>
              <div className="room lbl" data-l={lang === "fr" ? "CUISINE" : "KITCHEN"} style={{ right: 0,  top: 0,    width: "38%", height: "30%" }}></div>
              <div className="room lbl" data-l={lang === "fr" ? "CH. 1"   : "BR 1"}    style={{ left: 0,   bottom: 0, width: "44%", height: "42%" }}></div>
              <div className="room lbl" data-l={lang === "fr" ? "CH. 2"   : "BR 2"}    style={{ right: 0,  bottom: 0, width: "52%", height: "62%" }}></div>
              <div className="dim" style={{ top: "-22px", left: "0" }}>12.4 m</div>
              <div className="dim" style={{ right: "-8px", top: "44%", transform: "rotate(90deg)" }}>9.8 m</div>
            </div>
            <div className="bp-badge">
              <div className="stp"><i></i><i></i><i></i><i className="off"></i></div>
              <span>{lang === "fr" ? "Financé → Construit → Vérifié → Débloqué" : "Funded → Built → Inspected → Released"}</span>
            </div>
          </div>
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
  const icons = ["clock", "trending", "bolt", "shield"] as const;
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
            <a className="brand" href="#top"><img src="/logo.png" alt="Litug" /></a>
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
        <Parcours t={t} lang={lang} />
        <Sara t={t} lang={lang} />
        <Mustaf t={t} lang={lang} />
        <Impact t={t} />
        <Listings t={t} lang={lang} />
        <Contact t={t} lang={lang} />
      </main>
      <Footer t={t} />
    </div>
  );
}
