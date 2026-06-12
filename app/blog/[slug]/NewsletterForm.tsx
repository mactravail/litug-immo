'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';

/* Formulaire « être tenu à jour » pour les articles en cours d'écriture.
   Réutilise l'endpoint /api/newsletter (le même que le pied de page de la landing). */
export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error' | 'invalid'>('idle');
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (resetTimer.current) clearTimeout(resetTimer.current); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setStatus('invalid');
      return;
    }
    setStatus('sending');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: value }),
      });
      if (res.ok) {
        setStatus('done');
        setEmail('');
        if (resetTimer.current) clearTimeout(resetTimer.current);
        resetTimer.current = setTimeout(() => setStatus('idle'), 3000);
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  const msg =
    status === 'done' ? 'Merci ! Vous serez prévenu dès la publication.'
    : status === 'error' ? "L'inscription a échoué. Réessayez."
    : status === 'invalid' ? 'Entrez une adresse email valide.'
    : null;

  return (
    <form className="blog-soon-form" onSubmit={handleSubmit}>
      <div className="blog-soon-row">
        <input
          type="email"
          placeholder="votre@email.com"
          value={email}
          onChange={(e) => { setEmail(e.target.value); if (status !== 'idle' && status !== 'sending') setStatus('idle'); }}
          aria-label="Votre adresse email"
        />
        <button className="btn btn-gold btn-lg" type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? 'Envoi…' : 'Être à jour'} <ArrowRight size={16} className="arr" />
        </button>
      </div>
      {msg && (
        <p
          role="status"
          className="blog-soon-msg"
          style={{ color: status === 'done' ? 'var(--text-muted)' : '#b3261e' }}
        >
          {msg}
        </p>
      )}
    </form>
  );
}
