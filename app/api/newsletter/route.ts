import { NextRequest, NextResponse } from 'next/server';
import { sendNewsletterSubscriber } from '@/lib/email/send';

/**
 * Inscription newsletter (pied de page de la landing) → email vers le fondateur.
 * Le destinataire est fixé côté serveur (lib/email/send.ts), jamais exposé au front.
 */
export async function POST(req: NextRequest) {
  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Requête invalide.' }, { status: 400 });
  }

  const email = (body.email ?? '').trim();

  // Validation minimale côté serveur (le front valide aussi).
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: 'Adresse email invalide.' }, { status: 400 });
  }

  const result = await sendNewsletterSubscriber({ email });

  if (result.ok) {
    return NextResponse.json({ ok: true });
  }

  console.error('[newsletter] Envoi échoué :', result);
  return NextResponse.json(
    { ok: false, error: "L'inscription a échoué. Réessayez plus tard." },
    { status: 502 },
  );
}
