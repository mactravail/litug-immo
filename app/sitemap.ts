import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';
import { ARTICLES } from './blog/articles';
import { getDataProvider } from '@/lib/data/provider';

// sitemap.xml — servi à /sitemap.xml. Pages publiques + articles de blog
// + fiches terrains (depuis Supabase, avec repli silencieux si indisponible).

const STATIC_PAGES: { path: string; priority: number }[] = [
  { path: '', priority: 1 },
  { path: '/nos-terrains', priority: 0.9 },
  { path: '/sara', priority: 0.8 },
  { path: '/mustaf', priority: 0.8 },
  { path: '/produits', priority: 0.7 },
  { path: '/blog', priority: 0.7 },
  { path: '/a-propos', priority: 0.5 },
  { path: '/carrieres', priority: 0.4 },
  { path: '/mentions-legales', priority: 0.2 },
  { path: '/confidentialite', priority: 0.2 },
  { path: '/conditions', priority: 0.2 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages: MetadataRoute.Sitemap = STATIC_PAGES.map(({ path, priority }) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: path === '/nos-terrains' ? 'daily' : 'weekly',
    priority,
  }));

  const blog: MetadataRoute.Sitemap = ARTICLES.map((a) => ({
    url: `${SITE_URL}/blog/${a.slug}`,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  // Fiches terrains — le sitemap ne doit jamais tomber si la base est injoignable.
  let lands: MetadataRoute.Sitemap = [];
  try {
    const terrains = await getDataProvider().listPublicLands();
    lands = terrains.map((t) => ({
      url: `${SITE_URL}/nos-terrains/${t.id}`,
      lastModified: t.createdAt ? new Date(t.createdAt) : undefined,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch {
    // Base indisponible : on sert quand même les pages statiques + blog.
  }

  return [...pages, ...blog, ...lands];
}
