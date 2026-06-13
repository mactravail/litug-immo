import type { Metadata } from "next";
import { Bricolage_Grotesque, Archivo, Inter } from "next/font/google";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

// Identité grayscale : trio de polices, gratuites/libres de droits.
//  - Bricolage Grotesque → grands titres marketing (classe font-display)
//  - Archivo             → titres & libellés d'UI   (classe font-serif)
//  - Inter               → corps de texte partout    (font-sans, défaut)
// Mobile-first : poids restreints pour limiter le payload (>80% sur téléphone).
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  weight: ["500", "600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
});

const archivo = Archivo({
  variable: "--font-archivo",
  weight: ["600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const SITE_DESCRIPTION =
  "Achetez un terrain vérifié au Sénégal et construisez votre maison depuis l'étranger, sans arnaque. " +
  "Titres fonciers contrôlés chez le notaire, argent sécurisé par un tiers de confiance, chantier suivi étape par étape.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Litug — Terrains vérifiés & construction suivie au Sénégal",
  description: SITE_DESCRIPTION,
  applicationName: "Litug",
  keywords: [
    "terrain Sénégal",
    "acheter terrain Dakar",
    "titre foncier Sénégal",
    "construire maison Sénégal diaspora",
    "arnaque foncière Sénégal",
    "immobilier Sénégal diaspora",
  ],
  alternates: { canonical: "./" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "fr_SN",
    url: "./",
    siteName: "Litug",
    title: "Litug — Terrains vérifiés & construction suivie au Sénégal",
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/blog-hero.jpg",
        width: 1920,
        height: 1280,
        alt: "Litug — acheter un terrain vérifié et construire au Sénégal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Litug — Terrains vérifiés & construction suivie au Sénégal",
    description: SITE_DESCRIPTION,
    images: ["/blog-hero.jpg"],
  },
};

// Données structurées (schema.org) — aident Google à comprendre qui est Litug
// et à alimenter le panneau de marque (Knowledge Panel) : nom, logo, langue,
// zone desservie, contact. Graphe Organization + WebSite reliés par @id.
// NB : `sameAs` (profils sociaux officiels) renforce fortement le panneau de
// marque ; à compléter dès que les réseaux sociaux existent.
const ORG_ID = `${SITE_URL}/#organization`;
const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": ORG_ID,
      name: "Litug",
      legalName: "Litug",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.png`,
        caption: "Litug",
      },
      image: `${SITE_URL}/blog-hero.jpg`,
      description: SITE_DESCRIPTION,
      slogan: "Acheter un terrain et construire au Sénégal, sans arnaque.",
      areaServed: { "@type": "Country", name: "Sénégal" },
      knowsLanguage: ["fr"],
      email: "contact@litug.com",
      contactPoint: [
        {
          "@type": "ContactPoint",
          contactType: "customer support",
          email: "contact@litug.com",
          areaServed: "SN",
          availableLanguage: ["French"],
        },
      ],
      // sameAs: ["https://instagram.com/…", "https://facebook.com/…"],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Litug",
      description: SITE_DESCRIPTION,
      inLanguage: "fr",
      publisher: { "@id": ORG_ID },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${bricolage.variable} ${archivo.variable} ${inter.variable} h-full`}
    >
      <body className="min-h-full bg-bg text-text antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
        {children}
      </body>
    </html>
  );
}
