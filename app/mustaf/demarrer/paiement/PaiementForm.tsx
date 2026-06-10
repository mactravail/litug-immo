'use client';

import { useState } from 'react';
import { Lock, CreditCard, Smartphone, CheckCircle2 } from 'lucide-react';
import { formatFcfa, formatEur } from '@/lib/utils';
import { PHASE_ZERO_FEE } from '../../offers';

type Method = 'card' | 'paypal' | 'mobile';
type Brand = 'visa' | 'mastercard' | 'amex' | null;

/* Logos de marque (public/pay/*.svg + Wave). */
function Logo({ src, alt, h = 22 }: { src: string; alt: string; h?: number }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img className="pay-logo" src={src} alt={alt} style={{ height: h }} />;
}

const CARD_LOGO: Record<NonNullable<Brand>, { src: string; alt: string }> = {
  visa: { src: '/pay/visa.svg', alt: 'Visa' },
  mastercard: { src: '/pay/mastercard.svg', alt: 'Mastercard' },
  amex: { src: '/pay/amex.svg', alt: 'American Express' },
};

/**
 * Formulaire de paiement Phase 0 (forfait fixe, §8.1).
 * UI de paiement complète (carte / PayPal / mobile money) — le débit
 * réel reste SIMULÉ tant que la structure séquestre/banque n'est pas
 * validée juridiquement (§12). Aucune donnée bancaire n'est envoyée.
 */
export default function PaiementForm() {
  const [method, setMethod] = useState<Method>('card');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [reference, setReference] = useState('');

  // Champs carte
  const [holder, setHolder] = useState('');
  const [number, setNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  // Champ mobile money
  const [phone, setPhone] = useState('');

  const brand = detectBrand(number);

  function onNumber(v: string) {
    const digits = v.replace(/\D/g, '').slice(0, 19);
    setNumber(digits.replace(/(.{4})/g, '$1 ').trim());
  }
  function onExpiry(v: string) {
    const d = v.replace(/\D/g, '').slice(0, 4);
    setExpiry(d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    // Paiement simulé : on imite la latence d'un PSP sans débit réel (§12).
    await new Promise((r) => setTimeout(r, 1400));
    setReference(`PH0-${Math.random().toString(36).slice(2, 8).toUpperCase()}`);
    setLoading(false);
    setDone(true);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (done) {
    return (
      <div className="pay-card">
        <div className="pay-success">
          <span className="ic"><CheckCircle2 size={32} /></span>
          <h2>Paiement confirmé{holder ? `, ${holder.split(' ')[0]}` : ''} !</h2>
          <p>
            Votre forfait Phase 0 est réglé. Un conseiller Mustaf vous contacte sous 48&nbsp;h pour
            démarrer le plan d’architecte, le dossier de permis et l’étude de sol.
          </p>
          <span className="ref">Référence&nbsp;: <b>{reference}</b></span>
        </div>
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
    <div className="pay-card">
      <h2>Moyen de paiement</h2>

      <div className="pay-methods" role="tablist" aria-label="Moyen de paiement">
        {methods.map(({ id, label, logos }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={method === id}
            className={`pay-method${method === id ? ' active' : ''}`}
            onClick={() => setMethod(id)}
          >
            <span className="pay-method-logos">{logos}</span>
            <span className="pay-method-label">{label}</span>
          </button>
        ))}
      </div>

      <form className="pay-form" onSubmit={handleSubmit}>
        {method === 'card' && (
          <>
            <div className="field">
              <label htmlFor="holder">Titulaire de la carte</label>
              <input
                id="holder" required placeholder="Awa Diop" autoComplete="cc-name"
                value={holder} onChange={(e) => setHolder(e.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="number">Numéro de carte</label>
              <div className="pay-card-input">
                <input
                  id="number" required inputMode="numeric" placeholder="1234 5678 9012 3456"
                  autoComplete="cc-number" value={number} onChange={(e) => onNumber(e.target.value)}
                />
                <span className="pay-brand">
                  {brand
                    ? <Logo src={CARD_LOGO[brand].src} alt={CARD_LOGO[brand].alt} h={20} />
                    : <CreditCard size={18} color="var(--text-muted)" />}
                </span>
              </div>
            </div>

            <div className="two">
              <div className="field">
                <label htmlFor="expiry">Expiration</label>
                <input
                  id="expiry" required inputMode="numeric" placeholder="MM/AA"
                  autoComplete="cc-exp" value={expiry} onChange={(e) => onExpiry(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="cvc">CVC</label>
                <input
                  id="cvc" required inputMode="numeric" placeholder="123" maxLength={4}
                  autoComplete="cc-csc" value={cvc}
                  onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                />
              </div>
            </div>

            <div className="pay-accepted">
              <span>Cartes acceptées</span>
              <Logo src="/pay/visa.svg" alt="Visa" h={13} />
              <Logo src="/pay/mastercard.svg" alt="Mastercard" h={18} />
              <Logo src="/pay/amex.svg" alt="American Express" h={18} />
            </div>
          </>
        )}

        {method === 'paypal' && (
          <div className="pay-alt">
            <Logo src="/pay/paypal.svg" alt="PayPal" h={26} />
            <p>Vous serez redirigé vers <b>PayPal</b> pour valider le paiement en toute sécurité, puis ramené ici.</p>
          </div>
        )}

        {method === 'mobile' && (
          <>
            <div className="pay-alt">
              <span className="pay-alt-logos">
                <Logo src="/wave-icon.png" alt="Wave" h={28} />
                <Logo src="/pay/orange-money.svg" alt="Orange Money" h={24} />
              </span>
              <p>Payez avec <b>Wave</b> ou <b>Orange Money</b>. Vous recevrez une demande de validation sur votre téléphone.</p>
            </div>
            <div className="field">
              <label htmlFor="phone">Numéro Mobile Money</label>
              <input
                id="phone" type="tel" required placeholder="+221 77 000 00 00"
                value={phone} onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </>
        )}

        <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
          <Lock size={16} />
          {loading
            ? 'Paiement en cours…'
            : method === 'paypal'
            ? `Payer ${formatFcfa(PHASE_ZERO_FEE)} avec PayPal`
            : `Payer ${formatFcfa(PHASE_ZERO_FEE)}`}
        </button>

        <p className="pay-secure">
          <Lock size={13} /> Paiement chiffré et sécurisé via
          <Logo src="/pay/stripe.svg" alt="Stripe" h={15} />
          <span className="pay-secure-eur">· ≈ {formatEur(PHASE_ZERO_FEE)}</span>
        </p>
      </form>
    </div>
  );
}

function detectBrand(formatted: string): Brand {
  const n = formatted.replace(/\s/g, '');
  if (/^4/.test(n)) return 'visa';
  if (/^(5[1-5]|2[2-7])/.test(n)) return 'mastercard';
  if (/^3[47]/.test(n)) return 'amex';
  return null;
}
