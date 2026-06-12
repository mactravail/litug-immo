// URL canonique du site — utilisée par les métadonnées SEO (metadataBase,
// sitemap.xml, robots.txt, JSON-LD). Surchargable par env pour la préprod.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://litug.com';
