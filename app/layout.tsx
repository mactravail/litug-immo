import type { Metadata } from "next";
import { Bricolage_Grotesque, Archivo, Inter } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Litug — Sara, ton partenaire immobilier 24/7",
  description:
    "La plateforme sénégalaise propulsée par l'IA. Sara, l'agent WhatsApp qui vend tes terrains, et Mustaf, l'assistant qui construit ta maison.",
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
      <body className="min-h-full bg-bg text-text antialiased">{children}</body>
    </html>
  );
}
