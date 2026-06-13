import type { MetadataRoute } from 'next';

// Manifeste PWA — servi à /manifest.webmanifest. Rend le site installable sur
// l'écran d'accueil (Android « Installer l'application », iOS « Ajouter à
// l'écran d'accueil ») et l'ouvre en plein écran, sans barre de navigateur.
// Palette monochrome (CLAUDE.md §9) : thème noir, fond blanc.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Litug — Terrains vérifiés & construction au Sénégal',
    short_name: 'Litug',
    description:
      'Achetez un terrain vérifié au Sénégal et construisez votre maison depuis ' +
      "l'étranger, sans arnaque.",
    lang: 'fr',
    dir: 'ltr',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#ffffff',
    theme_color: '#000000',
    categories: ['business', 'finance', 'lifestyle'],
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
