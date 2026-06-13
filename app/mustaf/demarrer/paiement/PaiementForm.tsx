'use client';

import { useActionState, useEffect, useState } from 'react';
import Link from 'next/link';
import { Lock, ExternalLink, ShieldCheck, Mail, Check } from 'lucide-react';
import { formatFcfa, formatEur } from '@/lib/utils';
import { PHASE_ZERO_FEE, type TierId } from '../../offers';
import { submitPhaseZero } from './actions';

type Method = 'card' | 'paypal' | 'mobile';

/* Logos de marque (public/pay/*.svg + Wave). */
function Logo({ src, alt, h = 22 }: { src: string; alt: string; h?: number }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img className="pay-logo" src={src} alt={alt} style={{ height: h }} />;
}

/**
 * Formulaire Phase 0 (forfait fixe, §8.1). Le client crée son accès (email + mot
 * de passe), choisit son moyen de paiement, puis reçoit un email d'activation.
 * Le paiement carte passe par la page sécurisée Stripe (mode test, EUR) : aucune
 * donnée bancaire ne transite par notre site.
 */
export default function PaiementForm({ canceled, tier }: { canceled?: boolean; tier?: TierId }) {
  const [state, action, isPending] = useActionState(submitPhaseZero, null);

  const [method, setMethod] = useState<Method>('card');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [captcha, setCaptcha] = useState(false);

  // Redirection vers la page de paiement hébergée Stripe dès réception de l'URL.
  useEffect(() => {
    if (state && 'checkoutUrl' in state && state.checkoutUrl) {
      window.location.href = state.checkoutUrl;
    }
  }, [state]);

  // En cas d'erreur, on fait recocher le captcha (les autres champs restent remplis).
  useEffect(() => {
    if (state?.error) setCaptcha(false);
  }, [state]);

  const pwMismatch = confirm.length > 0 && password !== confirm;
  const redirecting = !!(state && 'checkoutUrl' in state && state.checkoutUrl);
  const canSubmit =
    !isPending && !redirecting && captcha && password.length >= 8 && password === confirm;

  // --- Confirmation : « un email t'a été envoyé » ---
  if (state?.ok) {
    return (
      <div className="pay-card co-confirm">
        <span className="ic"><Mail size={30} /></span>
        <h2>Merci{state.name ? `, ${state.name.split(' ')[0]}` : ''} !</h2>
        <p>
          Votre forfait Phase 0 est enregistré. Nous vous avons envoyé un <b>email d&apos;activation</b>
          à&nbsp;:
        </p>
        <span className="email-pill">{state.email}</span>
        <p>
          Ouvrez cet email et cliquez sur <b>« Commencer »</b>. Vous serez dirigé vers la page de
          connexion : utilisez le <b>même email</b> et le <b>même mot de passe</b> pour entrer dans
          votre tableau de bord Mustaf.
        </p>
        <p className="co-confirm-note">
          <ShieldCheck size={15} />
          Notre équipe étudie votre dossier pour démarrer le plan, le permis et l&apos;étude de sol.
        </p>
        <Link href="/login" className="btn btn-primary btn-lg" style={{ marginTop: 18 }}>
          Aller à la connexion
        </Link>
      </div>
    );
  }

  const methods: { id: Method; label: string; logos: React.ReactNode }[] = [
    {
      id: 'card',
      label: 'Carte bancaire',
      logos: (
        <>
          <Logo src="/pay/visa.svg" alt="Visa" h={13} />
          <Logo src="/pay/mastercard.svg" alt="Mastercard" h={18} />
        </>
      ),
    },
    { id: 'paypal', label: 'PayPal', logos: <Logo src="/pay/paypal.svg" alt="PayPal" h={16} /> },
    {
      id: 'mobile',
      label: 'Mobile Money',
      logos: (
        <>
          <Logo src="/wave-icon.png" alt="Wave" h={18} />
          <Logo src="/pay/orange-money.svg" alt="Orange Money" h={18} />
        </>
      ),
    },
  ];

  return (
    <form action={action} className="pay-card">
      <div className="pay-head">
        <h2>Forfait Phase 0</h2>
        <span className="pay-secure-badge"><Lock size={13} /> Paiement sécurisé</span>
      </div>
      <p className="pay-sub">Créez votre accès, réglez le forfait Phase 0 et recevez votre email d&apos;activation.</p>

      {canceled && (
        <div className="co-error">
          Paiement annulé. Vous pouvez réessayer — rien n&apos;a été débité.
        </div>
      )}
      {state?.error && <div className="co-error">{state.error}</div>}

      <div className="pay-form" style={{ marginTop: 18 }}>
        {/* ── Vos identifiants ── */}
        <div className="two">
          <div className="field">
            <label htmlFor="name">Nom complet</label>
            <input id="name" name="name" required placeholder="Awa Diop" autoComplete="name" />
          </div>
          <div className="field">
            <label htmlFor="phone">Téléphone WhatsApp</label>
            <input id="phone" name="phone" type="tel" required placeholder="+221 77 000 00 00" autoComplete="tel" />
          </div>
        </div>

        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required placeholder="awa@exemple.com" autoComplete="email" />
        </div>

        <div className="two">
          <div className="field">
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password" name="password" type="password" required minLength={8}
              placeholder="Au moins 8 caractères" autoComplete="new-password"
              value={password} onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="confirm">Confirme le mot de passe</label>
            <input
              id="confirm" name="confirm" type="password" required
              placeholder="Retape le même" autoComplete="new-password"
              value={confirm} onChange={(e) => setConfirm(e.target.value)}
              aria-invalid={pwMismatch}
            />
            {pwMismatch && <p className="field-err">Les mots de passe ne correspondent pas.</p>}
          </div>
        </div>

        {/* ── Moyen de paiement ── */}
        <input type="hidden" name="method" value={method} />
        {tier && <input type="hidden" name="tier" value={tier} />}
        <div className="pay-methods" role="tablist" aria-label="Moyen de paiement">
          {methods.map(({ id, label, logos }) => (
            <button
              key={id} type="button" role="tab" aria-selected={method === id}
              className={`pay-method${method === id ? ' active' : ''}`}
              onClick={() => setMethod(id)}
            >
              <span className="pay-method-logos">{logos}</span>
              <span className="pay-method-label">{label}</span>
            </button>
          ))}
        </div>

        {method === 'card' && (
          <>
            <div className="pay-alt">
              <span className="pay-alt-logos">
                <Logo src="/pay/visa.svg" alt="Visa" h={13} />
                <Logo src="/pay/mastercard.svg" alt="Mastercard" h={18} />
                <Logo src="/pay/amex.svg" alt="American Express" h={18} />
                <Logo src="/pay/stripe.svg" alt="Stripe" h={14} />
              </span>
              <p>
                Vous serez redirigé vers la page de paiement <b>sécurisée Stripe</b> pour saisir
                votre carte, puis ramené ici.
              </p>
            </div>
            <p className="pay-sim">
              <ShieldCheck size={14} />
              <span>
                Mode test — carte de démonstration
                <b> 4242 4242 4242 4242</b>, date future, n&apos;importe quel CVC.
              </span>
            </p>
          </>
        )}

        {method === 'paypal' && (
          <div className="pay-alt">
            <Logo src="/pay/paypal.svg" alt="PayPal" h={26} />
            <p>Vous serez redirigé vers <b>PayPal</b> pour valider le paiement, puis ramené ici.</p>
          </div>
        )}

        {method === 'mobile' && (
          <div className="pay-alt">
            <span className="pay-alt-logos">
              <Logo src="/wave-icon.png" alt="Wave" h={28} />
              <Logo src="/pay/orange-money.svg" alt="Orange Money" h={24} />
            </span>
            <p>Payez avec <b>Wave</b> ou <b>Orange Money</b> sur le numéro WhatsApp indiqué ci-dessus.</p>
          </div>
        )}

        {/* ── Captcha + envoi ── */}
        <label className={`captcha ${captcha ? 'is-checked' : ''}`}>
          <input type="checkbox" name="captcha" checked={captcha} onChange={(e) => setCaptcha(e.target.checked)} />
          <span className="box">{captcha && <Check size={16} strokeWidth={3} />}</span>
          <span className="lbl">Je ne suis pas un robot</span>
        </label>

        <button type="submit" className="btn btn-primary btn-lg" disabled={!canSubmit}>
          {method === 'card' ? <ExternalLink size={16} /> : <Lock size={16} />}
          {redirecting
            ? 'Redirection vers Stripe…'
            : isPending
              ? 'Traitement…'
              : method === 'card'
                ? `Payer ${formatFcfa(PHASE_ZERO_FEE)} par carte`
                : `Payer ${formatFcfa(PHASE_ZERO_FEE)} et commencer`}
        </button>

        <p className="pay-secure" style={{ marginTop: 2 }}>
          <Lock size={13} /> Paiement chiffré · ≈ {formatEur(PHASE_ZERO_FEE)}
          <span className="pay-secure-eur"> · email d&apos;activation après l&apos;inscription</span>
        </p>
      </div>
    </form>
  );
}
