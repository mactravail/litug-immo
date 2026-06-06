import type { Metadata } from 'next';
import Link from 'next/link';
import { existsSync } from 'fs';
import { join } from 'path';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { CheckoutForm } from './CheckoutForm';
import '../../landing.css';
import './checkout.css';

export const metadata: Metadata = {
  title: 'Paiement — Abonnement Sara (Wave) | Litug',
  description: 'Active ton abonnement à Sara en payant via Wave.',
};

// Montants (FCFA)
const SETUP = '100 000';
const MONTHLY = '50 000';
const TODAY = '150 000';
const TODAY_EUR = '≈ 228 €';

export default function PaiementPage() {
  // QR Wave officiel de Litug, déposé dans public/wave-qr.png.
  const hasQr = existsSync(join(process.cwd(), 'public', 'wave-qr.png'));

  return (
    <div className="landing-root">
      {/* Nav simple */}
      <nav className="offer-nav">
        <Link className="brand" href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Litug" />
        </Link>
        <Link className="btn btn-ghost" href="/sara">
          <ArrowLeft size={16} /> Retour à l&apos;offre
        </Link>
      </nav>

      <header className="wrap offer-hero" style={{ paddingTop: 'clamp(32px,5vw,56px)' }}>
        <span className="eyebrow">Paiement sécurisé · Wave</span>
        <h1>Finalise ton abonnement <span className="accent">Sara</span></h1>
        <p>Paie par Wave en scannant le QR code, puis confirme avec ton numéro de transaction.</p>
      </header>

      <section className="section wrap" style={{ paddingTop: 'clamp(24px,3vw,36px)' }}>
        <div className="checkout-grid">
          {/* Colonne formulaire */}
          <div className="checkout-form-col">
            <CheckoutForm />
          </div>

          {/* Colonne récap + Wave */}
          <div className="checkout-pay-col">
            <div className="co-card">
              <h2>Ton abonnement</h2>
              <div className="co-line">
                <span className="desc">
                  Mise en service
                  <small>Frais d&apos;installation unique</small>
                </span>
                <span className="amt">{SETUP} FCFA</span>
              </div>
              <div className="co-line">
                <span className="desc">
                  Abonnement Sara
                  <small>Premier mois</small>
                </span>
                <span className="amt">{MONTHLY} FCFA</span>
              </div>
              <div className="co-total">
                <span className="lbl">À payer aujourd&apos;hui</span>
                <span className="val">
                  <span className="big">{TODAY} FCFA</span>
                  <small>{TODAY_EUR}</small>
                </span>
              </div>
              <p className="co-recurring">Puis {MONTHLY} FCFA / mois · sans engagement, résiliable à tout moment.</p>
            </div>

            <div className="co-card">
              <div className="wave-head">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="wave-logo" src="/wave-icon.png" alt="Wave" />
                <span>
                  <b>Payer avec Wave</b>
                  <span>Scanne le QR avec l&apos;application Wave</span>
                </span>
              </div>

              <div className="qr-box">
                {hasQr ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src="/wave-qr.png" alt="QR code Wave — Litug" />
                ) : (
                  <span className="qr-missing">QR Wave à ajouter</span>
                )}
              </div>
              <p className="qr-cap">Montant à envoyer : <b>{TODAY} FCFA</b></p>

              <ol className="wave-steps">
                <li><span className="n">1</span><span>Ouvre l&apos;application <b>Wave</b> sur ton téléphone.</span></li>
                <li><span className="n">2</span><span>Appuie sur <b>Scanner</b> et vise le QR code ci-dessus.</span></li>
                <li><span className="n">3</span><span>Envoie <b>{TODAY} FCFA</b> à Litug.</span></li>
                <li><span className="n">4</span><span>Copie le <b>numéro de transaction</b> et colle-le dans le formulaire.</span></li>
              </ol>
            </div>

            <p className="price-note" style={{ marginTop: 16 }}>
              <ShieldCheck size={15} />
              Paiement direct à Litug via Wave. Aucune donnée bancaire ne transite par le site.
            </p>
          </div>
        </div>
      </section>

      <footer className="offer-foot">
        <p><Link href="/sara">← Revenir à l&apos;offre Sara</Link></p>
      </footer>
    </div>
  );
}
