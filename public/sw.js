/*
 * Service worker Litug — minimal et PRUDENT.
 *
 * Objectif : rendre le site installable (PWA) + un repli hors-ligne propre,
 * SANS jamais mettre en cache de contenu dynamique ou authentifié (dashboards,
 * API, auth) — ce qui servirait des données périmées ou fuiterait entre comptes
 * sur un téléphone partagé. On ne cache que les ASSETS STATIQUES immuables.
 *
 * Bump CACHE_VERSION à chaque changement de stratégie pour purger l'ancien cache.
 */
const CACHE_VERSION = 'litug-v1';
const OFFLINE_URL = '/offline.html';

// Préfixes JAMAIS mis en cache (toujours réseau, repli hors-ligne si navigation).
const NEVER_CACHE = ['/api/', '/auth/', '/admin', '/equipe', '/dashboard', '/projet',
  '/login', '/register', '/bienvenue', '/forgot-password', '/reset-password'];

// Assets statiques sûrs à mettre en cache (immuables ou versionnés par Next).
function isStaticAsset(url) {
  return (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/pay/') ||
    /\.(?:png|jpg|jpeg|svg|webp|avif|ico|woff2?|css)$/.test(url.pathname)
  );
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll([OFFLINE_URL])),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))),
    ),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // jamais le cross-origin (Supabase, Stripe…)

  // 1) Assets statiques → cache d'abord, mise à jour en arrière-plan (stale-while-revalidate).
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.open(CACHE_VERSION).then(async (cache) => {
        const cached = await cache.match(request);
        const network = fetch(request)
          .then((res) => {
            if (res.ok) cache.put(request, res.clone());
            return res;
          })
          .catch(() => cached);
        return cached || network;
      }),
    );
    return;
  }

  // 2) Tout ce qui est dynamique/authentifié → réseau uniquement (jamais de cache).
  const isNeverCache = NEVER_CACHE.some((p) => url.pathname.startsWith(p));

  // 3) Navigations (pages) → réseau d'abord ; si hors-ligne, page de repli.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match(OFFLINE_URL)),
    );
    return;
  }

  if (isNeverCache) return; // laissé au réseau par défaut
});
