/* ============================================================
   Employé connecté — résolution mock-first.
   En attendant l'auth Supabase, l'employé courant est lu d'un
   cookie (sélecteur de démo), avec un défaut sur le chef de
   chantier Baba Sarr (tâches assignées, avance signalée, incident
   ouvert → démo riche). En prod : remplacé par auth.uid().
   ============================================================ */

import { cookies } from 'next/headers';
import { SEED_TEAM } from '@/lib/admin/seed';
import type { TeamMember } from '@/lib/admin/types';

export const WORKER_COOKIE = 'litug_worker';
/** Défaut : chef de chantier (couvre pointage, rendu-compte, incident). */
export const DEFAULT_WORKER_ID = 'user-site-baba';

/** Les rôles qui ont accès à l'espace /equipe (jamais l'admin, jamais un vendeur/client). */
export const TEAM_ROLES = ['procurement', 'site_agent', 'inspector', 'controller'] as const;

/** Employés sélectionnables dans le switcher de démo (rôles d'équipe uniquement). */
export function selectableWorkers(): TeamMember[] {
  return SEED_TEAM.filter(t => (TEAM_ROLES as readonly string[]).includes(t.role));
}

/** Id de l'employé courant (cookie de démo → défaut Baba). */
export async function getCurrentWorkerId(): Promise<string> {
  const store = await cookies();
  const id = store.get(WORKER_COOKIE)?.value;
  if (id && SEED_TEAM.some(t => t.id === id && (TEAM_ROLES as readonly string[]).includes(t.role))) {
    return id;
  }
  return DEFAULT_WORKER_ID;
}

/** L'employé courant (TeamMember). */
export async function getCurrentWorker(): Promise<TeamMember> {
  const id = await getCurrentWorkerId();
  return SEED_TEAM.find(t => t.id === id) ?? SEED_TEAM.find(t => t.id === DEFAULT_WORKER_ID)!;
}
