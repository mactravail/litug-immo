import { NextRequest, NextResponse } from 'next/server';
import { sendContactMessage } from '@/lib/email/send';
import { rateLimit, clientIp } from '@/lib/rate-limit';

/**
 * Formulaire de contact public (landing) → email vers contact@litug.com.
 * Le destinataire est fixé côté serveur (lib/email/send.ts), jamais exposé au front.
 */
export async function POST(req: NextRequest) {
  // Anti-spam : 5 messages / 10 min par IP.
  if (!rateLimit('contact', clientIp(req), 5, 10 * 60_000)) {
    return NextResponse.json(
      { ok: false, error: 'Trop de messages envoyés. Réessayez dans quelques minutes.' },
      { status: 429 },
    );
  }

  let body: { name?: string; email?: string; whatsapp?: string; message?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Requête invalide.' }, { status: 400 });
  }

  const name = (body.name ?? '').trim();
  const email = (body.email ?? '').trim();
  const whatsapp = (body.whatsapp ?? '').trim();
  const message = (body.message ?? '').trim();

  if (!name || !email || !message) {
    return NextResponse.json(
      { ok: false, error: 'Nom, email et message sont requis.' },
      { status: 400 },
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: 'Adresse email invalide.' }, { status: 400 });
  }

  // Bornes anti-abus (payloads géants) — le contenu est échappé à l'affichage email.
  if (name.length > 120 || email.length > 200 || whatsapp.length > 40 || message.length > 5000) {
    return NextResponse.json({ ok: false, error: 'Champs trop longs.' }, { status: 400 });
  }

  const result = await sendContactMessage({ name, email, whatsapp, message });

  if (result.ok) {
    return NextResponse.json({ ok: true });
  }

  // Resend non configuré (clé manquante) ou refus : on log, on signale l'échec au client.
  console.error('[contact] Envoi du message échoué :', result);
  return NextResponse.json(
    { ok: false, error: "L'envoi a échoué. Réessayez plus tard." },
    { status: 502 },
  );
}
