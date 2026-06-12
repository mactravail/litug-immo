'use server';

import { headers } from 'next/headers';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { getAdminProvider } from '@/lib/admin/provider';
import { sendEmployeeCredentials } from '@/lib/email/send';
import { TEAM_ROLES } from '@/lib/auth/home-route';
import type { TeamRole } from '@/lib/admin/types';

export type CreateEmployeeState =
  | { error?: string; ok?: boolean; email?: string; password?: string }
  | null;

/** Rôles terrain attribuables à un employé — jamais `admin` (créé à part, §5). */
const EMPLOYEE_ROLES = TEAM_ROLES;

function isEmployeeRole(value: unknown): value is (typeof EMPLOYEE_ROLES)[number] {
  return EMPLOYEE_ROLES.includes(value as (typeof EMPLOYEE_ROLES)[number]);
}

/**
 * Crée directement le compte d'un employé (rôle terrain) — réservé à l'admin
 * (§5 : les rôles staff ne se créent QUE d'ici, jamais par inscription publique).
 *
 * Flux choisi par le fondateur : PAS d'email, PAS de WhatsApp. L'admin définit un
 * mot de passe provisoire, le communique de vive voix à l'employé. À sa PREMIÈRE
 * connexion, l'employé est obligé de le changer (flag must_change_password).
 *
 * Le rôle est écrit aux DEUX endroits (modèle migration 006) :
 *   - app_metadata.user_role  → lu par proxy.ts et le routage post-login (sans requête DB) ;
 *   - user_roles              → source de vérité pour les policies RLS.
 */
export async function createEmployee(
  _prev: CreateEmployeeState,
  formData: FormData,
): Promise<CreateEmployeeState> {
  const fullName = ((formData.get('full_name') as string) ?? '').trim();
  const email = ((formData.get('email') as string) ?? '').trim().toLowerCase();
  const phone = ((formData.get('phone') as string) ?? '').trim();
  const role = (formData.get('role') as string) ?? '';
  const password = (formData.get('password') as string) ?? '';

  // --- Validation ---
  if (!fullName) return { error: 'Le nom de l’employé est obligatoire.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Adresse email invalide.' };
  if (!isEmployeeRole(role)) return { error: 'Rôle terrain invalide.' };
  if (password.length < 8) return { error: 'Le mot de passe provisoire doit faire au moins 8 caractères.' };

  // --- Garde : seul un admin connecté peut créer un accès ---
  const supabase = await createSupabaseServerClient();
  const { data: { user: actor } } = await supabase.auth.getUser();
  const actorRole = (actor?.app_metadata as Record<string, unknown> | undefined)?.user_role;
  if (!actor || actorRole !== 'admin') {
    return { error: 'Action réservée à l’administrateur. Reconnectez-vous puis réessayez.' };
  }

  let admin;
  try {
    admin = createSupabaseAdminClient();
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Configuration serveur manquante.' };
  }

  // --- 1. Création du compte (email confirmé d'office, mot de passe provisoire) ---
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { user_role: role, must_change_password: true },
    user_metadata: { full_name: fullName, phone },
  });

  if (createError || !created?.user) {
    const msg = createError?.message ?? '';
    if (/already.*registered|exist|duplicate/i.test(msg)) {
      return { error: 'Un compte existe déjà pour cet email.' };
    }
    return { error: 'Création du compte impossible : ' + (msg || 'erreur inconnue') };
  }
  const newUserId = created.user.id;

  // --- 2. user_roles : source de vérité RLS (best-effort, n'annule pas la création) ---
  await admin.from('user_roles').upsert(
    { user_id: newUserId, role },
    { onConflict: 'user_id,role' },
  );

  // --- 3. Journal d'audit (insert-only) ---
  await admin.from('audit_log').insert({
    actor_id: actor.id,
    action: 'assign_role',
    target_type: 'user',
    target_id: newUserId,
    target_label: fullName,
    metadata: { role, email, channel: 'direct' },
  });

  // --- 4. Pont avec le dashboard mock : l'employé apparaît dans /admin/employes
  //        cette session (le compte auth, lui, est bien réel et persistant). ---
  try {
    await getAdminProvider().assignRole({
      displayName: fullName,
      role: role as TeamRole,
      contact: phone || email,
    });
  } catch {
    // Le pont mock est cosmétique : un échec ici n'invalide pas le compte créé.
  }

  // Envoi des identifiants par email (best-effort). L'admin les voit aussi à l'écran
  // une fois — l'email est un confort, pas une condition : un échec n'annule rien.
  try {
    const h = await headers();
    const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000';
    const proto = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https');
    await sendEmployeeCredentials({
      to: email,
      name: fullName,
      email,
      tempPassword: password,
      loginUrl: `${proto}://${host}/login`,
    });
  } catch {
    // L'email est secondaire : l'admin communique les identifiants de vive voix au besoin.
  }

  // On renvoie les identifiants pour que l'admin les communique (affichés une fois).
  return { ok: true, email, password };
}
