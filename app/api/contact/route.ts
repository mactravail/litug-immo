import { NextRequest, NextResponse } from 'next/server';
import { sendContactMessage } from '@/lib/email/send';

/**
 * Formulaire de contact public (landing) → email vers contact@litug.com.
 * Le destinataire est fixé côté serveur (lib/email/send.ts), jamais exposé au front.
 */
export async function POST(req: NextRequest) {
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
