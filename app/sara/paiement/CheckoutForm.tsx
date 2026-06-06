'use client';

import { useState } from 'react';
import { ShieldCheck, Lock } from 'lucide-react';

export function CheckoutForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [business, setBusiness] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [tx, setTx] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch('/api/notify-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, business, phone, email, tx }),
      });
    } catch {
      // Ne pas bloquer la confirmation si le SMS échoue
    }
    setLoading(false);
    setSubmitted(true);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (submitted) {
    return (
      <div className="co-card">
        <div className="co-success">
          <span className="ic"><ShieldCheck size={30} /></span>
          <h2>Merci{name ? `, ${name.split(' ')[0]}` : ''} !</h2>
          <p>
            Nous avons bien reçu ta demande d&apos;abonnement à Sara. Notre équipe vérifie ton
            paiement Wave et active Sara sur ton numéro WhatsApp sous 24&nbsp;h ouvrées.
          </p>
          {tx && (
            <span className="ref">
              Référence de transaction&nbsp;: <b>{tx}</b>
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="co-card">
      <h2>Tes informations</h2>
      <p className="hint">Pour rattacher l&apos;abonnement à ton compte vendeur.</p>

      <form className="co-form" onSubmit={handleSubmit}>
        <div className="two">
          <div className="field">
            <label htmlFor="name">Nom complet</label>
            <input
              id="name" name="name" required placeholder="Awa Diop"
              value={name} onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="business">Nom de l&apos;activité</label>
            <input
              id="business" name="business" required placeholder="Diop Immobilier"
              value={business} onChange={(e) => setBusiness(e.target.value)}
            />
          </div>
        </div>

        <div className="two">
          <div className="field">
            <label htmlFor="phone">Téléphone WhatsApp</label>
            <input
              id="phone" name="phone" type="tel" required placeholder="+221 77 000 00 00"
              value={phone} onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email" name="email" type="email" required placeholder="awa@exemple.com"
              value={email} onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="co-tx field">
          <label htmlFor="tx">Numéro de transaction Wave</label>
          <input
            id="tx" name="tx" required placeholder="Ex. TXN-AB12CD34"
            value={tx} onChange={(e) => setTx(e.target.value)}
          />
          <p className="hint" style={{ marginTop: 6 }}>
            Après avoir payé via le QR Wave, copie ici le numéro de transaction reçu.
          </p>
        </div>

        <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
          <Lock size={16} />
          {loading ? 'Envoi en cours…' : 'J\'ai payé — Confirmer mon abonnement'}
        </button>
      </form>
    </div>
  );
}
