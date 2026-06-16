'use client';

import { useSyncExternalStore } from 'react';
import { Moon, Sun } from 'lucide-react';

const STORAGE_KEY = 'mustaf-theme';

/**
 * Bascule sombre / clair de l'espace Mustaf, posée dans le menu de gauche.
 * Le thème s'applique via la classe `mustaf-light` sur <html> (voir
 * mustaf-theme.css) ; un script inline dans le layout la pose AVANT le premier
 * rendu (pas de flash). On lit l'état réel depuis le DOM via
 * useSyncExternalStore — sûr côté SSR (snapshot serveur = sombre par défaut),
 * et toutes les instances (sidebar + menu mobile) restent synchronisées.
 */
const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function isLightSnapshot() {
  return document.documentElement.classList.contains('mustaf-light');
}

function setTheme(light: boolean) {
  document.documentElement.classList.toggle('mustaf-light', light);
  try {
    localStorage.setItem(STORAGE_KEY, light ? 'light' : 'dark');
  } catch {
    /* localStorage indisponible (navigation privée) — la bascule reste effective pour la session */
  }
  listeners.forEach((cb) => cb());
}

export function MustafThemeToggle() {
  // Snapshot serveur = false (sombre) → cohérent avec le rendu initial ; le
  // client se resynchronise tout de suite après l'hydratation.
  const light = useSyncExternalStore(subscribe, isLightSnapshot, () => false);

  return (
    <div className="m-theme" role="group" aria-label="Thème de l'affichage">
      <button
        type="button"
        onClick={() => setTheme(false)}
        className={!light ? 'm-theme-on' : undefined}
        aria-pressed={!light}
      >
        <Moon /> Sombre
      </button>
      <button
        type="button"
        onClick={() => setTheme(true)}
        className={light ? 'm-theme-on' : undefined}
        aria-pressed={light}
      >
        <Sun /> Clair
      </button>
    </div>
  );
}
