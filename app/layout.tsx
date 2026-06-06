import type { Metadata } from "next";
import { Space_Grotesk, Manrope } from "next/font/google";
import "./globals.css";

// Palette Sahel : Space Grotesk (titres) + Manrope (corps). Mobile-first,
// payload de fonts réduit (>80% des visiteurs sur téléphone).
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
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
      className={`${spaceGrotesk.variable} ${manrope.variable} h-full`}
    >
      <body className="min-h-full bg-bg text-text antialiased">{children}</body>
    </html>
  );
}
