import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// Content-Security-Policy pragmatique, compatible avec la stack :
//  - Next.js injecte des scripts inline (bootstrap, flight) + le JSON-LD inline → 'unsafe-inline'.
//    En dev, Turbopack/HMR a besoin de 'unsafe-eval' (relâché uniquement hors prod).
//  - Styles inline omniprésents (attributs style, next/font) → style-src 'unsafe-inline'.
//  - Polices auto-hébergées par next/font → font-src 'self'.
//  - Images base64 (terrains/maisons) + distantes → img-src data: blob: https:.
//  - Le client Supabase (navigateur) ouvre des connexions HTTPS/WSS vers *.supabase.co.
//  - Stripe Checkout est une REDIRECTION pleine page (pas d'iframe) → autorisé en form-action.
//  - frame-ancestors 'none' = anti-clickjacking ; object-src 'none' ; base-uri 'self'.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com",
  "form-action 'self' https://checkout.stripe.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // Force HTTPS pendant 2 ans, sous-domaines inclus (préchargeable).
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  // Coupe l'accès aux capteurs sensibles par défaut (aucune fonctionnalité ne les utilise).
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
];

const nextConfig: NextConfig = {
  // Masque l'indicateur de dev Next.js (le rond "N" en bas à gauche).
  devIndicators: false,

  // Cache d'erreur masqué : ne jamais divulguer la stack ni le header serveur.
  poweredByHeader: false,

  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
