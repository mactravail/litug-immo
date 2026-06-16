'use client';

import { useActionState, useEffect, useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, Mail, Check, ExternalLink, Sparkles, Star } from 'lucide-react';
import { formatFcfa, formatEur } from '@/lib/utils';
import { SETUP_FEE, PERIODS, PERIOD_IDS, getTotal, type PlanId, type PeriodId } from '../plans';
import { submitCheckout } from './actions';

type Method = 'wave' | 'mastercard' | 'paypal' | 'stripe';

function Logo({ src, alt, h = 22 }: { src: string; alt: string; h?: number }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img className="pay-logo" src={src} alt={alt} style={{ height: h }} />;
}

const METHODS: { id: Method; label: string; logos: React.ReactNode; soon?: boolean }[] = [
  {
    id: 'wave',
    label: 'Wave',
    logos: <Logo src="/wave-icon.png" alt="Wave" h={22} />,
  },
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
  {
    id: 'paypal',
    label: 'PayPal',
    soon: true,
    logos: <Logo src="/pay/paypal.svg" alt="PayPal" h={17} />,
  },
  {
    id: 'stripe',
    label: 'Stripe',
    soon: true,
    logos: <Logo src="/pay/stripe.svg" alt="Stripe" h={16} />,
  },
];

interface Props {
  hasQr: boolean;
  plan: PlanId;
  defaultPeriod: PeriodId;
  paidEmail?: string | null;
  canceled?: boolean;
}

export function Checkout({ hasQr, plan, defaultPeriod, paidEmail, canceled }: Props) {
  const [state, action, isPending] = useActionState(submitCheckout, null);

  const [method, setMethod] = useState<Method>('wave');
  const [period, setPeriod] = useState<PeriodId>(defaultPeriod);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [captcha, setCaptcha] = useState(false);

  useEffect(() => {
    if (state && 'checkoutUrl' in state && state.checkoutUrl) {
      window.location.href = state.checkoutUrl;
    }
  }, [state]);

  const isCard = method === 'mastercard' || method === 'stripe';
  const pwTooShort = password.length > 0 && password.length < 8;
  const pwMismatch = confirm.length > 0 && password !== confirm;
  const redirecting = !!(state && 'checkoutUrl' in state && state.checkoutUrl);
  const canSubmit =
    !isPending && !redirecting && captcha && password.length >= 8 && password === confirm;

  const total = getTotal(plan, period);
  const totalLabel = formatFcfa(total);
  const periodInfo = PERIODS[period];

  // --- Retour de Stripe : paiement confirmé ---
  if (paidEmail !== null && paidEmail !== undefined) {
    return (
      <div className="co-card co-confirm">
        <span className="ic"><Check size={30} /></span>
        <h2>Paiement reçu !</h2>
        <p>
          Merci, ton paiement a bien été confirmé. Ton inscription à <b>Sara</b> est enregistrée
          {paidEmail ? <> et un <b>email d&apos;activation</b> t&apos;a été envoyé à&nbsp;:</> : '.'}
        </p>
        {paidEmail && <span className="email-pill">{paidEmail}</span>}
        <p className="co-confirm-note">
          <ShieldCheck size={15} />
          Notre équipe vérifie ton inscription sous <b>24&nbsp;h</b> maximum.
        </p>
        <Link href="/login" className="btn btn-primary btn-lg" style={{ marginTop: 18 }}>
          Aller à la connexion
        </Link>
      </div>
    );
  }

  // --- Confirmation Wave / non-carte ---
  if (state?.ok) {
    return (
      <div className="co-card co-confirm">
        <span className="ic"><Mail size={30} /></span>
        <h2>Merci{state.name ? `, ${state.name.split(' ')[0]}` : ''} !</h2>
        <p>
          Ton inscription à <b>Sara</b> est bien enregistrée. Nous t&apos;avons envoyé un
          <b> email d&apos;activation</b> à&nbsp;:
        </p>
        <span className="email-pill">{state.email}</span>
        <p>
          Ouvre cet email et clique sur <b>« Activer mon compte »</b>. Tu seras dirigé vers la
          page de connexion : utilise le <b>même email</b> et le <b>même mot de passe</b> pour
          entrer dans ton tableau de bord Sara.
        </p>
        <p className="co-confirm-note">
          <ShieldCheck size={15} />
          Notre équipe vérifie ton paiement sous <b>24&nbsp;h</b> maximum. En attendant, tu pourras
          te connecter mais pas encore publier de terrain.
        </p>
        <Link href="/login" className="btn btn-primary btn-lg" style={{ marginTop: 18 }}>
          Aller à la connexion
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="checkout-grid">
      {/* Champs cachés transmis à l'action */}
      <input type="hidden" name="plan" value={plan} />
      <input type="hidden" name="period" value={period} />

      {/* ── Colonne gauche : compte + mot de passe ── */}
      <div className="checkout-form-col">
        <div className="co-card">
          <h2>Crée ton accès</h2>
          <p className="hint">Ces identifiants te serviront à te connecter au tableau de bord Sara.</p>

          {canceled && (
            <div className="co-error">
              Paiement annulé. Tu peux réessayer quand tu veux — rien n&apos;a été débité.
            </div>
          )}
          {state?.error && <div className="co-error">{state.error}</div>}

          <div className="co-form">
            <div className="two">
              <div className="field">
                <label htmlFor="name">Nom complet</label>
                <input id="name" name="name" required placeholder="Awa Diop" autoComplete="name" />
              </div>
              <div className="field">
                <label htmlFor="business">Nom de l&apos;activité</label>
                <input id="business" name="business" required placeholder="Diop Immobilier" />
              </div>
            </div>

            <div className="two">
              <div className="field">
                <label htmlFor="phone">Téléphone WhatsApp</label>
                <input id="phone" name="phone" type="tel" required placeholder="+221 77 000 00 00" autoComplete="tel" />
              </div>
              <div className="field">
                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="email" required placeholder="awa@exemple.com" autoComplete="email" />
              </div>
            </div>

            <div className="field">
              <label htmlFor="password">Mot de passe</label>
              <input
                id="password" name="password" type="password" required minLength={8}
                placeholder="Au moins 8 caractères" autoComplete="new-password"
                value={password} onChange={(e) => setPassword(e.target.value)}
                aria-invalid={pwTooShort}
              />
              {pwTooShort && <p className="field-err">Au moins 8 caractères.</p>}
            </div>

            <div className="field">
              <label htmlFor="confirm">Confirme le mot de passe</label>
              <input
                id="confirm" name="confirm" type="password" required
                placeholder="Retape le même mot de passe" autoComplete="new-password"
                value={confirm} onChange={(e) => setConfirm(e.target.value)}
                aria-invalid={pwMismatch}
              />
              {pwMismatch && <p className="field-err">Les deux mots de passe ne correspondent pas.</p>}
            </div>

            <label className={`captcha ${captcha ? 'is-checked' : ''}`}>
              <input
                type="checkbox" name="captcha"
                checked={captcha} onChange={(e) => setCaptcha(e.target.checked)}
              />
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
                    ? `Payer ${totalLabel} par carte`
                    : `J'ai payé — Activer mon abonnement`}
            </button>
            <p className="hint" style={{ textAlign: 'center', marginTop: 2 }}>
              Un email d&apos;activation te sera envoyé après l&apos;inscription.
            </p>
          </div>
        </div>
      </div>

      {/* ── Colonne droite : récap + moyen de paiement ── */}
      <div className="checkout-pay-col">

        {/* Récap tarifaire */}
        <div className="co-card">
          <h2>Ton abonnement</h2>

          {/* Badge du plan */}
          <p className="co-plan-badge">
            {plan === 'essai'
              ? <><Sparkles size={13} /> Essai — mise en service uniquement</>
              : <><Star size={13} /> Tout compris</>}
          </p>

          {/* Sélecteur de période (plan pro uniquement) */}
          {plan === 'pro' && (
            <div className="period-tabs" style={{ marginBottom: 16 }}>
              {PERIOD_IDS.map((pid) => {
                const p = PERIODS[pid];
                return (
                  <button
                    key={pid}
                    type="button"
                    className={`period-tab${period === pid ? ' active' : ''}`}
                    onClick={() => setPeriod(pid)}
                  >
                    <span>{p.label}</span>
                    {p.discount_pct > 0 && (
                      <span className="period-badge">-{p.discount_pct}%</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Lignes du récap */}
          <div className="co-line">
            <span className="desc">
              Mise en service<small>Frais d&apos;installation unique</small>
            </span>
            <span className="amt">{formatFcfa(SETUP_FEE)}</span>
          </div>

          {plan === 'pro' && (
            <div className="co-line">
              <span className="desc">
                Abonnement Sara
                <small>
                  {periodInfo.months === 1
                    ? 'Premier mois'
                    : `${periodInfo.months} mois · ${formatFcfa(periodInfo.monthly_fcfa)}/mois`}
                </small>
              </span>
              <span className="amt">{formatFcfa(periodInfo.total_fcfa)}</span>
            </div>
          )}

          {plan === 'essai' && (
            <div className="co-line">
              <span className="desc">
                Abonnement Sara<small>Inclus pendant la période d&apos;essai</small>
              </span>
              <span className="amt co-free">Offert</span>
            </div>
          )}

          <div className="co-total">
            <span className="lbl">À payer aujourd&apos;hui</span>
            <span className="val">
              <span className="big">{totalLabel}</span>
              <small>≈ {formatEur(total)}</small>
            </span>
          </div>

          {plan === 'pro' && period !== 'mensuel' && (
            <p className="price-save" style={{ marginTop: 8, marginBottom: 0 }}>
              Tu économises {formatFcfa(PERIODS.mensuel.monthly_fcfa - periodInfo.monthly_fcfa)}/mois
              vs mensuel (-{periodInfo.discount_pct}%)
            </p>
          )}

          {plan === 'pro' && period === 'mensuel' && (
            <p className="co-recurring">
              Puis {formatFcfa(periodInfo.monthly_fcfa)} / mois · sans engagement, résiliable à tout moment.
            </p>
          )}

          {plan === 'essai' && (
            <p className="co-recurring">
              Sans abonnement mensuel — tu accèdes à Sara et au tableau de bord dès la mise en service.
            </p>
          )}
        </div>

        {/* Moyen de paiement */}
        <div className="co-card">
          <div className="pay-head">
            <h2>Moyen de paiement</h2>
            <span className="pay-secure-badge">
              <Lock size={13} /> Paiement sécurisé
            </span>
          </div>
          <input type="hidden" name="method" value={method} />

          <div className="pay-notice">
            <ShieldCheck size={15} />
            <span>
              Pour l&apos;instant, seul le paiement par <b>Wave</b> est disponible. Les autres
              moyens de paiement arrivent bientôt.
            </span>
          </div>

          <div className="pay-methods">
            {METHODS.map((m) => (
              <button
                key={m.id}
                type="button"
                className={`pay-method ${method === m.id ? 'is-active' : ''} ${m.soon ? 'is-soon' : ''}`}
                onClick={() => { if (!m.soon) setMethod(m.id); }}
                aria-pressed={method === m.id}
                disabled={m.soon}
                aria-disabled={m.soon}
                title={m.soon ? 'Bientôt disponible' : undefined}
              >
                {m.soon && <span className="pm-soon">Bientôt</span>}
                <span className="pay-method-logos">{m.logos}</span>
                <span className="pm-name">{m.label}</span>
              </button>
            ))}
          </div>

          {method === 'wave' && (
            <div className="pay-panel">
              <div className="qr-box">
                {hasQr ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src="/wave-qr.png" alt="QR code Wave — Litug" />
                ) : (
                  <span className="qr-missing">QR Wave à ajouter</span>
                )}
              </div>
              <p className="qr-cap">Scanne avec l&apos;app Wave et envoie <b>{totalLabel}</b>.</p>
              <div className="co-tx field">
                <label htmlFor="tx">Numéro de transaction Wave</label>
                <input id="tx" name="tx" placeholder="Ex. TXN-AB12CD34" />
                <p className="hint" style={{ marginTop: 6 }}>
                  Après le paiement, copie ici le numéro de transaction reçu.
                </p>
              </div>
            </div>
          )}

          {isCard && (
            <div className="pay-panel">
              <div className="pay-alt">
                <span className="pay-alt-logos">
                  <Logo src="/pay/visa.svg" alt="Visa" h={13} />
                  <Logo src="/pay/mastercard.svg" alt="Mastercard" h={18} />
                  <Logo src="/pay/amex.svg" alt="American Express" h={18} />
                  <Logo src="/pay/stripe.svg" alt="Stripe" h={14} />
                </span>
                <p>
                  Tu seras redirigé vers la page de paiement <b>sécurisée Stripe</b> pour saisir
                  ta carte, puis ramené ici.
                </p>
              </div>
              <p className="pay-sim">
                <ShieldCheck size={14} /> Mode test — carte de démonstration
                <b> 4242 4242 4242 4242</b>, date future, n&apos;importe quel CVC.
              </p>
            </div>
          )}

          {method === 'paypal' && (
            <div className="pay-panel">
              <div className="paypal-mock">
                <Logo src="/pay/paypal.svg" alt="PayPal" h={26} />
                <p>Tu seras redirigé vers PayPal pour confirmer le paiement.</p>
              </div>
              <p className="pay-sim">
                <ShieldCheck size={14} /> Connexion PayPal de démonstration — paiement simulé pour
                l&apos;instant.
              </p>
            </div>
          )}
        </div>

        <p className="price-note" style={{ marginTop: 16 }}>
          <ShieldCheck size={15} />
          Pour l&apos;instant, le paiement se règle directement via Wave. Carte bancaire, PayPal et
          Stripe seront activés prochainement.
        </p>
      </div>
    </form>
  );
}
