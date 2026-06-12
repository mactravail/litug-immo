/* ============================================================
   Employé connecté — résolution mock-first.
   En attendant l'auth Supabase, l'employé courant est lu d'un
   cookie (sélecteur de démo), avec un défaut sur le chef de
   chantier Baba Sarr (tâches assignées, avance signalée, incident
   ouvert → démo riche). En prod : remplacé par auth.uid().
   ============================================================ */

import { cookies } from 'next/headers';
import { SEED_TEAM } from '@/lib/admin/seed';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import type { TeamMember, TeamRole } from '@/lib/admin/types';

export const WORKER_COOKIE = 'litug_worker';
/** Défaut : chef de chantier (couvre pointage, rendu-compte, incident). */
export const DEFAULT_WORKER_ID = 'user-site-baba';

/** Les rôles qui ont accès à l'espace /equipe (jamais l'admin, jamais un vendeur/client). */
export const TEAM_ROLES = ['procurement', 'site_agent', 'inspector', 'controller', 'prospector'] as const;

/** Employés sélectionnables dans le switcher de démo (rôles d'équipe uniquement). */
export function selectableWorkers(): TeamMember[] {
  return SEED_TEAM.filter(t => (TEAM_ROLES as readonly string[]).includes(t.role));
}

/**
 * Rôle d'équipe du VRAI utilisateur connecté (app_metadata.user_role), s'il en a un.
 * C'est lui qui prime : un prospecteur connecté doit voir l'espace prospection, pas
 * le sélecteur de démo. Retourne null s'il n'y a pas d'utilisateur d'équipe connecté
 * (démo publique anonyme), auquel cas on retombe sur le cookie.
 */
async function authedTeamRole(): Promise<TeamRole | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    const role = (user?.app_metadata as Record<string, unknown> | undefined)?.user_role;
    return (TEAM_ROLES as readonly string[]).includes(role as string) ? (role as TeamRole) : null;
  } catch {
    return null;
  }
}

/**
 * Id de l'employé courant.
 * 1) Vrai utilisateur d'équipe connecté → membre seed de SON rôle (le bon dashboard).
 * 2) Sinon (démo anonyme) → cookie du sélecteur, défaut Baba.
 */
export async function getCurrentWorkerId(): Promise<string> {
  const role = await authedTeamRole();
  if (role) {
    const member = SEED_TEAM.find(t => t.role === role);
    if (member) return member.id;
  }
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

/**
 * Le PROSPECTEUR courant — métier réservé au rôle `prospector`.
 * 1) Vrai prospecteur connecté, ou employé courant déjà prospecteur → lui.
 * 2) Sinon (démo où l'employé sélectionné est un agent terrain) → on retombe
 *    sur le prospecteur seed, pour que la page /equipe/prospection fonctionne
 *    même quand on y arrive directement par l'URL. En prod, `proxy.ts` garantit
 *    déjà que seul un prospecteur atteint cette route.
 */
export async function getCurrentProspector(): Promise<TeamMember> {
  const current = await getCurrentWorker();
  if (current.role === 'prospector') return current;
  return SEED_TEAM.find(t => t.role === 'prospector') ?? current;
}

/** Id du prospecteur courant (voir {@link getCurrentProspector}). */
export async function getCurrentProspectorId(): Promise<string> {
  return (await getCurrentProspector()).id;
}
