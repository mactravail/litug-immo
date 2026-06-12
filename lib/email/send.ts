import 'server-only';
import { Resend } from 'resend';

/**
 * Envoi d'emails « métier » via Resend (CLAUDE.md §4 : secrets en env uniquement).
 *
 * Trois usages branchés dans l'app :
 *   - compte validé      → prévenir le vendeur/client que son tableau de bord est ouvert ;
 *   - identifiants employé → transmettre l'accès au nouvel employé ;
 *   - notif admin         → te prévenir d'une nouvelle demande à valider.
 *
 * Les emails « système » (réinitialisation de mot de passe, confirmation d'inscription)
 * NE passent PAS par ici : ils sont gérés par Supabase Auth, configuré pour envoyer via
 * le SMTP de Resend (Authentication → Emails → SMTP Settings).
 *
 * Dégradation gracieuse : sans RESEND_API_KEY, on log et on renvoie `skipped` sans
 * jamais casser l'action appelante (même logique que la notif SMS Twilio).
 */

/** Expéditeur — doit être un domaine VÉRIFIÉ dans Resend (sinon l'envoi échoue). */
const FROM = process.env.EMAIL_FROM || 'Litug <noreply@litug.com>';

/** Destinataire des notifications internes (toi, le fondateur). */
const ADMIN_EMAIL = process.env.EMAIL_ADMIN || 'fallmactar14@gmail.com';

/** Destinataire des messages du formulaire de contact public. */
const CONTACT_EMAIL = process.env.EMAIL_CONTACT || 'mactravail23@gmail.com';

export type SendResult =
  | { ok: true }
  | { ok: false; skipped: true }
  | { ok: false; skipped?: false; error: string };

let client: Resend | null = null;
function getClient(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  if (!client) client = new Resend(key);
  return client;
}

async function send(
  to: string | string[],
  subject: string,
  html: string,
  opts?: { replyTo?: string },
): Promise<SendResult> {
  const resend = getClient();
  if (!resend) {
    console.warn('[email] RESEND_API_KEY manquante — email non envoyé :', subject);
    return { ok: false, skipped: true };
  }
  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to,
      subject,
      html,
      ...(opts?.replyTo ? { replyTo: opts.replyTo } : {}),
    });
    if (error) {
      console.error('[email] Resend a refusé l’envoi :', error);
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (e) {
    console.error('[email] Échec inattendu de l’envoi :', e);
    return { ok: false, error: e instanceof Error ? e.message : 'Erreur inconnue.' };
  }
}

/* --------------------------------------------------------------------------
 * Gabarit commun — monochrome (CLAUDE.md §9), styles INLINE (requis en email).
 * ------------------------------------------------------------------------ */
function layout(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html><html lang="fr"><body style="margin:0;padding:0;background:#dfdfdf;font-family:Arial,Helvetica,sans-serif;color:#3a3a3a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#dfdfdf;padding:24px 0;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #d9d9d9;">
        <tr><td style="background:#000000;padding:20px 28px;">
          <span style="color:#ffffff;font-size:18px;font-weight:700;letter-spacing:0.5px;">Litug</span>
        </td></tr>
        <tr><td style="padding:28px;">
          <h1 style="margin:0 0 16px;font-size:20px;color:#000000;">${title}</h1>
          ${bodyHtml}
        </td></tr>
        <tr><td style="padding:18px 28px;border-top:1px solid #d9d9d9;">
          <p style="margin:0;font-size:12px;color:#737373;">Litug — acheter et construire au Sénégal, en confiance.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
  </body></html>`;
}

const P = 'margin:0 0 14px;font-size:15px;line-height:1.6;color:#3a3a3a;';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* --------------------------------------------------------------------------
 * 1. Compte validé — au vendeur (Sara) ou au client (Mustaf).
 * ------------------------------------------------------------------------ */
export function sendAccountApproved(opts: {
  to: string;
  name: string;
  type: 'seller' | 'owner';
  loginUrl: string;
}): Promise<SendResult> {
  const espace = opts.type === 'owner' ? 'votre espace Mustaf' : 'votre tableau de bord vendeur';
  const html = layout(
    'Votre compte est validé ✅',
    `<p style="${P}">Bonjour ${escapeHtml(opts.name)},</p>
     <p style="${P}">Bonne nouvelle : nous avons bien reçu et contrôlé votre paiement. <strong>${espace} est maintenant débloqué.</strong></p>
     <p style="${P}">Vous pouvez vous connecter dès maintenant :</p>
     <p style="margin:0 0 20px;">
       <a href="${opts.loginUrl}" style="display:inline-block;background:#000000;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:12px 24px;border-radius:10px;">Accéder à mon espace</a>
     </p>
     <p style="${P}">À très vite,<br>L'équipe Litug</p>`,
  );
  return send(opts.to, 'Votre compte Litug est validé', html);
}

/* --------------------------------------------------------------------------
 * 2. Identifiants employé — au nouvel employé (mot de passe provisoire).
 * ------------------------------------------------------------------------ */
export function sendEmployeeCredentials(opts: {
  to: string;
  name: string;
  email: string;
  tempPassword: string;
  loginUrl: string;
}): Promise<SendResult> {
  const html = layout(
    'Votre accès à l’espace équipe',
    `<p style="${P}">Bonjour ${escapeHtml(opts.name)},</p>
     <p style="${P}">Un accès à l'espace équipe Litug vient d'être créé pour vous. Voici vos identifiants de première connexion :</p>
     <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:#dfdfdf;border-radius:10px;margin:0 0 16px;">
       <tr><td style="padding:14px 18px;font-size:14px;color:#3a3a3a;">
         <strong>Email :</strong> ${escapeHtml(opts.email)}<br>
         <strong>Mot de passe provisoire :</strong> <span style="font-family:monospace;font-size:15px;">${escapeHtml(opts.tempPassword)}</span>
       </td></tr>
     </table>
     <p style="${P}">Pour votre sécurité, il vous sera demandé de <strong>changer ce mot de passe</strong> dès votre première connexion.</p>
     <p style="margin:0 0 20px;">
       <a href="${opts.loginUrl}" style="display:inline-block;background:#000000;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:12px 24px;border-radius:10px;">Me connecter</a>
     </p>
     <p style="${P}">L'équipe Litug</p>`,
  );
  return send(opts.to, 'Vos identifiants Litug — espace équipe', html);
}

/* --------------------------------------------------------------------------
 * 3. Notification admin — nouvelle demande à valider (vers le fondateur).
 * ------------------------------------------------------------------------ */
export function sendNewRequestNotice(opts: {
  name: string;
  business?: string;
  phone?: string;
  email: string;
  payment?: string;
  adminUrl: string;
}): Promise<SendResult> {
  const html = layout(
    'Nouvelle demande à valider 🔔',
    `<p style="${P}">Un nouveau compte vient de s'inscrire et attend la validation de son paiement.</p>
     <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:#dfdfdf;border-radius:10px;margin:0 0 16px;">
       <tr><td style="padding:14px 18px;font-size:14px;color:#3a3a3a;line-height:1.7;">
         <strong>Nom :</strong> ${escapeHtml(opts.name)}<br>
         ${opts.business ? `<strong>Activité :</strong> ${escapeHtml(opts.business)}<br>` : ''}
         <strong>Email :</strong> ${escapeHtml(opts.email)}<br>
         ${opts.phone ? `<strong>WhatsApp :</strong> ${escapeHtml(opts.phone)}<br>` : ''}
         ${opts.payment ? `<strong>Paiement :</strong> ${escapeHtml(opts.payment)}` : ''}
       </td></tr>
     </table>
     <p style="margin:0 0 20px;">
       <a href="${opts.adminUrl}" style="display:inline-block;background:#000000;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:12px 24px;border-radius:10px;">Ouvrir les demandes</a>
     </p>`,
  );
  return send(ADMIN_EMAIL, `Nouvelle demande Litug — ${opts.name}`, html);
}

/* --------------------------------------------------------------------------
 * 4. Formulaire de contact public — vers contact@litug.com.
 *    Reply-To = email du visiteur (répondre depuis sa boîte fonctionne).
 * ------------------------------------------------------------------------ */
export function sendContactMessage(opts: {
  name: string;
  email: string;
  whatsapp?: string;
  message: string;
}): Promise<SendResult> {
  const html = layout(
    'Nouveau message — formulaire de contact ✉️',
    `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:#dfdfdf;border-radius:10px;margin:0 0 16px;">
       <tr><td style="padding:14px 18px;font-size:14px;color:#3a3a3a;line-height:1.7;">
         <strong>Nom :</strong> ${escapeHtml(opts.name)}<br>
         <strong>Email :</strong> ${escapeHtml(opts.email)}<br>
         ${opts.whatsapp ? `<strong>WhatsApp :</strong> ${escapeHtml(opts.whatsapp)}` : ''}
       </td></tr>
     </table>
     <p style="${P}"><strong>Message :</strong></p>
     <p style="${P};white-space:pre-wrap;">${escapeHtml(opts.message)}</p>`,
  );
  return send(CONTACT_EMAIL, `Nouveau message Litug — ${opts.name}`, html, {
    replyTo: opts.email,
  });
}

/* --------------------------------------------------------------------------
 * 5. Inscription newsletter (footer) — prévient le fondateur du nouvel abonné.
 *    Reply-To = email de l'abonné (répondre directement fonctionne).
 * ------------------------------------------------------------------------ */
export function sendNewsletterSubscriber(opts: { email: string }): Promise<SendResult> {
  const html = layout(
    'Nouvel abonné newsletter 📨',
    `<p style="${P}">Une personne vient de s'inscrire à la newsletter depuis le pied de page du site :</p>
     <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:#dfdfdf;border-radius:10px;margin:0 0 16px;">
       <tr><td style="padding:14px 18px;font-size:15px;color:#3a3a3a;">
         <strong>Email :</strong> ${escapeHtml(opts.email)}
       </td></tr>
     </table>`,
  );
  return send(CONTACT_EMAIL, `Nouvel abonné Litug — ${opts.email}`, html, {
    replyTo: opts.email,
  });
}
