'use client';

import { useActionState, useEffect, useState } from 'react';
import Link from 'next/link';
import { Lock, ExternalLink, ShieldCheck, Mail, Check } from 'lucide-react';
import { DASHBOARD_FEE_EUR, DASHBOARD_FEE, type TierId } from '../../offers';
import { formatFcfa } from '@/lib/utils';
import { submitSelfBuild } from './actions';

const PRICE_LABEL = `${DASHBOARD_FEE_EUR} € (${formatFcfa(DASHBOARD_FEE)})`;

type Method = 'wave' | 'mastercard' | 'paypal' | 'stripe';

function Logo({ src, alt, h = 22 }: { src: string; alt: string; h?: number }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img className="pay-logo" src={src} alt={alt} style={{ height: h }} />;
}

const METHODS: { id: Method; label: string; logos: React.ReactNode; soon?: boolean }[] = [
  { id: 'wave', label: 'Wave', logos: <Logo src="/wave-icon.png" alt="Wave" h={22} /> },
  {
    id: 'mastercard',
    label: 'Carte bancaire',
    soon: true,
    logos: (
      <>
        <Logo src="/pay/visa.svg" alt="Visa" h={13} />
        <Logo src="/pay/mastercard.svg" alt="Mastercard" h={20} />
      </>
    ),
  },
  { id: 'paypal', label: 'PayPal', soon: true, logos: <Logo src="/pay/paypal.svg" alt="PayPal" h={17} /> },
  { id: 'stripe', label: 'Stripe', soon: true, logos: <Logo src="/pay/stripe.svg" alt="Stripe" h={16} /> },
];

const STAGES = [
  { value: 'plans', label: 'J’ai les plans / le permis, pas encore commencé' },
  { value: 'permis', label: 'Permis de construire obtenu' },
  { value: 'fondation', label: 'Fondation déjà réalisée' },
  { value: 'elevation', label: 'Élévation des murs en cours' },
  { value: 'autre', label: 'Autre — je précise ci-dessous' },
];

export function SelfBuildForm({ canceled, tier }: { canceled?: boolean; tier?: TierId }) {
  const [state, action, isPending] = useActionState(submitSelfBuild, null);

  const [method, setMethod] = useState<Method>('wave');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [captcha, setCaptcha] = useState(false);
  const [started, setStarted] = useState(false);

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
  const isCard = method === 'mastercard' || method === 'stripe';
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
          Ta demande est bien enregistrée. Nous t&apos;avons envoyé un <b>email d&apos;activation</b>
          à&nbsp;:
        </p>
        <span className="email-pill">{state.email}</span>
        <p>
          Ouvre cet email et clique sur <b>« Commencer »</b>. Tu seras dirigé vers la page de
          connexion : utilise le <b>même email</b> et le <b>même mot de passe</b> pour entrer dans
          ton tableau de bord Mustaf.
        </p>
        <p className="co-confirm-note">
          <ShieldCheck size={15} />
          Notre équipe étudie ta situation pour te proposer un accompagnement sur mesure.
        </p>
        <Link href="/login" className="btn btn-primary btn-lg" style={{ marginTop: 18 }}>
          Aller à la connexion
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="pay-card">
      <div className="pay-head">
        <h2>Accès au tableau de bord</h2>
        <span className="pay-secure-badge"><Lock size={13} /> Paiement sécurisé</span>
      </div>
      <p className="pay-sub">
        Vous avez déjà vos plans, votre permis — peut-être même votre fondation. Réglez seulement
        l&apos;accès au tableau de bord et démarrez ; notre équipe vous accompagnera sur mesure.
      </p>

      {canceled && (
        <div className="co-error">
          Paiement annulé. Tu peux réessayer — rien n&apos;a été débité.
        </div>
      )}
      {state?.error && <div className="co-error">{state.error}</div>}

      <div className="pay-form" style={{ marginTop: 18 }}>
        {/* ── Tes informations ── */}
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

        {/* ── Pourquoi pas de Phase 0 + état des travaux ── */}
        <div className="field">
          <label htmlFor="reason">Pourquoi n&apos;avez-vous pas besoin de la Phase 0 ?</label>
          <textarea
            id="reason" name="reason" rows={3} required
            placeholder="Ex : j'ai déjà mes plans d'architecte et mon permis de construire validé…"
          />
        </div>

        <label className={`captcha ${started ? 'is-checked' : ''}`}>
          <input type="checkbox" name="started" checked={started} onChange={(e) => setStarted(e.target.checked)} />
          <span className="box">{started && <Check size={16} strokeWidth={3} />}</span>
          <span className="lbl">J&apos;ai déjà commencé les travaux</span>
        </label>

        {started && (
          <>
            <div className="field">
              <label htmlFor="stage">Où en êtes-vous ?</label>
              <select id="stage" name="stage" defaultValue="" required className="pay-select">
                <option value="" disabled>Choisissez une étape…</option>
                {STAGES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="stage_detail">Précisions (facultatif)</label>
              <textarea
                id="stage_detail" name="stage_detail" rows={2}
                placeholder="Ex : fondation coulée il y a 2 mois, on attaque l'élévation…"
              />
            </div>
          </>
        )}

        {/* ── Moyen de paiement (50 €) ── */}
        <input type="hidden" name="method" value={method} />
        {tier && <input type="hidden" name="tier" value={tier} />}
        <p className="pay-notice">
          <ShieldCheck size={15} />
          <span>
            Pour l&apos;instant, seul le paiement par <b>Wave</b> est disponible. Carte bancaire,
            PayPal et Stripe arrivent bientôt.
          </span>
        </p>
        <div className="pay-methods" role="tablist" aria-label="Moyen de paiement">
          {METHODS.map((m) => (
            <button
              key={m.id} type="button" role="tab" aria-selected={method === m.id}
              className={`pay-method${method === m.id ? ' active' : ''}${m.soon ? ' is-soon' : ''}`}
              onClick={() => { if (!m.soon) setMethod(m.id); }}
              disabled={m.soon}
              aria-disabled={m.soon}
              title={m.soon ? 'Bientôt disponible' : undefined}
            >
              {m.soon && <span className="pm-soon">En cours</span>}
              <span className="pay-method-logos">{m.logos}</span>
              <span className="pay-method-label">{m.label}</span>
            </button>
          ))}
        </div>

        {method === 'wave' && (
          <div className="pay-wave">
            <div className="qr-box">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/wave-qr.png" alt="QR code Wave — Litug" />
            </div>
            <p className="qr-cap">
              Scannez ce code avec l&apos;application <b>Wave</b> et envoyez <b>{PRICE_LABEL}</b>.
            </p>
            <p className="pay-sim">
              <ShieldCheck size={14} />
              <span>
                Après le paiement, cliquez sur le bouton ci-dessous ; notre équipe confirme la
                réception sous <b>24&nbsp;h</b>.
              </span>
            </p>
          </div>
        )}

        {isCard && (
          <>
            <div className="pay-alt">
              <span className="pay-alt-logos">
                <Logo src="/pay/visa.svg" alt="Visa" h={13} />
                <Logo src="/pay/mastercard.svg" alt="Mastercard" h={18} />
                <Logo src="/pay/amex.svg" alt="American Express" h={18} />
                <Logo src="/pay/stripe.svg" alt="Stripe" h={14} />
              </span>
              <p>
                Tu seras redirigé vers la page de paiement <b>sécurisée Stripe</b> pour saisir ta
                carte, puis ramené ici.
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
            <p>Vous serez redirigé vers <b>PayPal</b> pour confirmer l&apos;accès, puis ramené ici.</p>
          </div>
        )}

        {/* ── Captcha + envoi ── */}
        <label className={`captcha ${captcha ? 'is-checked' : ''}`}>
          <input type="checkbox" name="captcha" checked={captcha} onChange={(e) => setCaptcha(e.target.checked)} />
          <span className="box">{captcha && <Check size={16} strokeWidth={3} />}</span>
          <span className="lbl">Je ne suis pas un robot</span>
        </label>

        <button type="submit" className="btn btn-primary btn-lg" disabled={!canSubmit}>
          {isCard ? <ExternalLink size={16} /> : <Lock size={16} />}
          {redirecting
            ? 'Redirection vers Stripe…'
            : isPending
              ? 'Traitement…'
              : isCard
                ? `Payer ${PRICE_LABEL} par carte`
                : `Payer ${PRICE_LABEL} et commencer`}
        </button>
        <p className="pay-secure" style={{ marginTop: 2 }}>
          Un email d&apos;activation te sera envoyé après l&apos;inscription.
        </p>
      </div>
    </form>
  );
}
