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
// et à afficher un résultat enrichi (nom, logo, zone desservie).
const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Litug",
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  description: SITE_DESCRIPTION,
  areaServed: "SN",
  email: "contact@litug.com",
  knowsLanguage: ["fr"],
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
