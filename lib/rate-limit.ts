import 'server-only';
import { NextRequest } from 'next/server';

/**
 * Limiteur de débit léger, en mémoire (fenêtre glissante par IP + clé).
 *
 * But : freiner l'abus des endpoints publics qui coûtent de l'argent ou spamment
 * (envoi d'email Resend, SMS Twilio). C'est une défense-en-profondeur, PAS une
 * protection absolue : en serverless multi-instances chaque instance a sa propre
 * mémoire, donc la limite réelle = limite × nb d'instances. Pour une protection
 * forte au bord, compléter par le Vercel WAF / rate limiting plateforme.
 */
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

/** Récupère l'IP cliente derrière le proxy Vercel (x-forwarded-for), avec repli. */
export function clientIp(req: NextRequest): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0]!.trim();
  return req.headers.get('x-real-ip') ?? 'unknown';
}

/**
 * Renvoie `true` si la requête est AUTORISÉE, `false` si la limite est dépassée.
 * @param key     identifiant logique de l'endpoint (ex. 'contact')
 * @param id      identifiant client (ex. IP)
 * @param limit   nombre de requêtes autorisées par fenêtre
 * @param windowMs durée de la fenêtre en millisecondes
 */
export function rateLimit(key: string, id: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucketKey = `${key}:${id}`;
  const bucket = buckets.get(bucketKey);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(bucketKey, { count: 1, resetAt: now + windowMs });
    // Purge opportuniste pour éviter une croissance non bornée de la Map.
    if (buckets.size > 5000) {
      for (const [k, b] of buckets) if (now > b.resetAt) buckets.delete(k);
    }
    return true;
  }

  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}
