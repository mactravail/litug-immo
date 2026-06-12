import 'server-only';
import { createClient } from '@supabase/supabase-js';

/**
 * Client Supabase à privilèges élevés (clé `service_role`).
 *
 * ⚠️ SERVEUR UNIQUEMENT (CLAUDE.md §4). Le `import 'server-only'` ci-dessus fait
 * échouer le build si ce module est importé depuis un composant client. La clé
 * service_role contourne TOUTES les policies RLS : ne jamais l'exposer au front,
 * ne jamais la préfixer NEXT_PUBLIC_.
 *
 * Sert aux actions d'administration qui doivent agir sur l'auth Supabase
 * (créer/inviter un utilisateur, écrire user_roles) — ce que la clé anon ne peut pas.
 */
export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Configuration manquante : SUPABASE_SERVICE_ROLE_KEY (et NEXT_PUBLIC_SUPABASE_URL) " +
        "doivent être définis dans .env.local pour créer des accès employés.",
    );
  }

  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
