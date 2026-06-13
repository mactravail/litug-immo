'use client';

import { useEffect } from 'react';

/**
 * Enregistre le service worker (/sw.js) côté navigateur — condition de l'installation
 * PWA + du repli hors-ligne. Sans rendu : monté une fois dans le layout racine.
 * En dev, on n'enregistre pas (évite d'interférer avec le HMR de Next).
 */
export default function PWARegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    const onLoad = () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Échec silencieux : le site reste pleinement fonctionnel sans le SW.
      });
    };
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);

  return null;
}
