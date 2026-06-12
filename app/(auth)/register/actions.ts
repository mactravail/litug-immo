'use server';

import { redirect } from 'next/navigation';

/**
 * Inscription directe désactivée : on ne crée plus de compte sans abonnement
 * (CLAUDE.md §5/§12 — la création de compte passe obligatoirement par le paiement
 * d'un abonnement). Le choix Sara (vendeur) / Mustaf (propriétaire) se fait sur
 * /register, qui mène vers la page de paiement correspondante où le compte est créé.
 */
export async function register() {
  redirect('/register');
}
