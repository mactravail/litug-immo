/* ============================================================
   Admin — configuration tarifaire (revenus de la plateforme).
   ⚠️ VALEURS DE DÉMO ÉDITABLES — à remplacer par les vrais tarifs.
   Tout est en FCFA (XOF, entier). L'équivalent € est calculé à
   l'affichage (formatEur) — ne jamais stocker d'€.
   ============================================================ */

/** Abonnement vendeur (agent Sara) — prix mensuel par palier, en FCFA. */
export const SELLER_PLAN_PRICE: Record<string, number> = {
  'Sara Standard': 25_000,
  'Sara Pro': 50_000,
};

/** Prix par défaut si le palier d'un abonnement vendeur n'est pas listé ci-dessus. */
export const DEFAULT_SELLER_PLAN_PRICE = 25_000;

/** Frais de vérification payés par l'acheteur (notaire/géomètre), en FCFA. */
export const VERIFICATION_FEE = 150_000;

/** Prix mensuel d'un abonnement vendeur, robuste aux paliers inconnus. */
export function sellerPlanPrice(tier: string): number {
  return SELLER_PLAN_PRICE[tier] ?? DEFAULT_SELLER_PLAN_PRICE;
}
