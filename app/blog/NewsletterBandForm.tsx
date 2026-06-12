'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';

/* Inscription newsletter en ligne (bandeau bas du blog) — même comportement que le
   pied de page de la landing : l'email part vers /api/newsletter sans quitter la page,
   le message de remerciement s'efface après 3 s, le bouton revient à la normale. */
export default function NewsletterBandForm() {
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
    status === 'done' ? 'Merci ! Inscription bien reçue.'
    : status === 'error' ? "L'inscription a échoué. Réessayez."
    : status === 'invalid' ? 'Entrez une adresse email valide.'
    : null;

  return (
    <form className="blog-nl-form" onSubmit={handleSubmit}>
      <div className="blog-nl-row">
        <input
          type="email"
          placeholder="votre@email.com"
          value={email}
          onChange={(e) => { setEmail(e.target.value); if (status !== 'idle' && status !== 'sending') setStatus('idle'); }}
          aria-label="Votre adresse email"
        />
        <button className="btn btn-gold btn-lg" type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? 'Envoi…' : "S'abonner"} <ArrowRight size={16} className="arr" />
        </button>
      </div>
      {msg && (
        <p
          role="status"
          className="blog-nl-msg"
          style={{ color: status === 'done' ? 'var(--text-on-ink-muted)' : '#ff8a80' }}
        >
          {msg}
        </p>
      )}
    </form>
  );
}
