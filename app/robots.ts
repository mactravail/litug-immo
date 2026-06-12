import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

// robots.txt — servi à /robots.txt. Google indexe les pages publiques ;
// les espaces privés (admin, équipe, dashboards) et les tunnels de paiement
// sont exclus du crawl. La vraie sécurité reste RLS + proxy, jamais robots.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin',
        '/equipe',
        '/dashboard',
        '/clients',
        '/visites',
        '/terrains', // dashboard vendeur (≠ /nos-terrains, public)
        '/parametres',
        '/aide',
        '/projet',
        '/api/',
        '/auth/',
        '/login',
        '/register',
        '/bienvenue',
        '/forgot-password',
        '/reset-password',
        '/sara/paiement',
        '/mustaf/demarrer',
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
