import 'server-only';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';

/**
 * Comptes en attente de validation (paiement à contrôler) — vendeurs Sara et
 * clients Mustaf confondus. Ce sont de VRAIS comptes auth Supabase portant le flag
 * `pending_verification` (posé à l'inscription depuis la page de paiement). On les
 * lit avec la clé service_role (serveur uniquement) car la clé anon ne peut pas
 * lister les utilisateurs.
 */
export interface PendingAccount {
  id: string;
  name: string;
  email: string;
  phone?: string;
  type: 'seller' | 'owner';
  paymentMethod?: string;
  createdAt: string;
  businessName?: string;
  // Spécifique au parcours Mustaf « sans Phase 0 »
  reason?: string;
  worksStarted?: boolean;
  worksStage?: string;
  worksStageDetail?: string;
}

export type PendingResult =
  | { ok: true; accounts: PendingAccount[] }
  | { ok: false; reason: 'not_configured' | 'error'; message: string };

function str(v: unknown): string | undefined {
  return typeof v === 'string' && v.trim() ? v : undefined;
}

export async function listPendingAccounts(): Promise<PendingResult> {
  let admin;
  try {
    admin = createSupabaseAdminClient();
  } catch (e) {
    return { ok: false, reason: 'not_configured', message: e instanceof Error ? e.message : 'Configuration manquante.' };
  }

  try {
    const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
    if (error) return { ok: false, reason: 'error', message: error.message };

    const accounts: PendingAccount[] = [];
    for (const u of data.users) {
      const m = (u.user_metadata ?? {}) as Record<string, unknown>;
      const am = (u.app_metadata ?? {}) as Record<string, unknown>;
      if (m.pending_verification !== true && am.pending_verification !== true) continue;

      accounts.push({
        id: u.id,
        name: str(m.full_name) ?? str(m.business_name) ?? u.email?.split('@')[0] ?? '—',
        email: u.email ?? '',
        phone: str(m.phone),
        type: m.account_type === 'owner' ? 'owner' : 'seller',
        paymentMethod: str(m.payment_method),
        createdAt: u.created_at,
        businessName: str(m.business_name),
        reason: str(m.no_phase_zero_reason),
        worksStarted: m.works_started === true,
        worksStage: str(m.works_stage),
        worksStageDetail: str(m.works_stage_detail),
      });
    }

    accounts.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return { ok: true, accounts };
  } catch (e) {
    return { ok: false, reason: 'error', message: e instanceof Error ? e.message : 'Erreur de lecture.' };
  }
}

/**
 * Nombre de demandes en attente — pour la pastille de navigation admin.
 * Tolérant : renvoie 0 si le service n'est pas configuré ou en cas d'erreur
 * (la pastille ne doit jamais casser le rendu de la sidebar).
 */
export async function countPendingAccounts(): Promise<number> {
  const result = await listPendingAccounts();
  return result.ok ? result.accounts.length : 0;
}
