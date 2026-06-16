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
 * 1) Vrai utilisateur d'équipe connecté → son UUID Supabase réel.
 * 2) Sinon (démo anonyme) → cookie du sélecteur, défaut Baba.
 */
export async function getCurrentWorkerId(): Promise<string> {
  const realId = await getRealEmployeeId();
  if (realId) return realId;
  const store = await cookies();
  const id = store.get(WORKER_COOKIE)?.value;
  if (id && SEED_TEAM.some(t => t.id === id && (TEAM_ROLES as readonly string[]).includes(t.role))) {
    return id;
  }
  return DEFAULT_WORKER_ID;
}

/**
 * UUID Supabase du vrai employé d'équipe connecté, ou `null` en mode démo.
 * Fonctionne pour tous les rôles terrain (prospector, site_agent, etc.).
 */
export async function getRealEmployeeId(): Promise<string | null> {
  const role = await authedTeamRole();
  if (!role) return null;
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id ?? null;
  } catch {
    return null;
  }
}

/** L'employé courant (TeamMember). Utilise le vrai profil Supabase si connecté. */
export async function getCurrentWorker(): Promise<TeamMember> {
  const realId = await getRealEmployeeId();
  if (realId) {
    const role = await authedTeamRole();
    try {
      const supabase = await createSupabaseServerClient();
      const { data: { user } } = await supabase.auth.getUser();
      const meta = (user?.user_metadata ?? {}) as Record<string, unknown>;
      return {
        id: realId,
        displayName: (meta.full_name as string) || user?.email?.split('@')[0] || 'Employé',
        role: role!,
        contact: (meta.phone as string) || user?.email || undefined,
        assignedProjectIds: [],
        status: 'active',
        createdAt: user?.created_at ?? new Date().toISOString(),
      };
    } catch { /* repli sur seed */ }
  }
  const id = await getCurrentWorkerId();
  return SEED_TEAM.find(t => t.id === id) ?? SEED_TEAM.find(t => t.id === DEFAULT_WORKER_ID)!;
}

/**
 * Le PROSPECTEUR courant — métier réservé au rôle `prospector`.
 * 1) Vrai prospecteur connecté → son profil Supabase réel.
 * 2) Sinon (démo) → prospecteur seed Fatou.
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

/**
 * UUID Supabase du vrai prospecteur connecté, ou `null` en mode démo anonyme.
 * Quand cette fonction retourne un UUID, toutes les opérations de prospection
 * doivent passer par le vrai Supabase (prospection-db.ts) au lieu du seed.
 */
export async function getRealProspectorId(): Promise<string | null> {
  const role = await authedTeamRole();
  if (role !== 'prospector') return null;
  return getRealEmployeeId();
}
