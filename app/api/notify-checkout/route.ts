import { NextRequest, NextResponse } from 'next/server';

const NOTIFY_TO = '+393291114442';

export async function POST(req: NextRequest) {
  const { name, business, phone, email, tx } = await req.json();

  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM;

  if (!sid || !token || !from) {
    // Twilio non configuré — on log côté serveur et on retourne succès côté client
    console.warn('[notify-checkout] Variables Twilio manquantes — SMS non envoyé.');
    return NextResponse.json({ ok: true, warn: 'sms_skipped' });
  }

  const message =
    `🔔 Nouvel abonnement Sara\n` +
    `Nom : ${name}\n` +
    `Entreprise : ${business}\n` +
    `WhatsApp : ${phone}\n` +
    `Email : ${email}\n` +
    `Transaction Wave : ${tx}`;

  const body = new URLSearchParams({ To: NOTIFY_TO, From: from, Body: message });
  const auth = Buffer.from(`${sid}:${token}`).toString('base64');

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    },
  );

  if (!res.ok) {
    const err = await res.json();
    console.error('[notify-checkout] Twilio error:', err);
    // Ne pas bloquer le client sur une erreur SMS
    return NextResponse.json({ ok: true, warn: 'sms_failed', detail: err });
  }

  return NextResponse.json({ ok: true });
}
