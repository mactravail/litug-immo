import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft, ShieldCheck, Check } from 'lucide-react';
import { MustafCheckout } from './MustafCheckout';
import { getStripe } from '@/lib/stripe';
import { TIERS, type TierId } from '../../offers';
import '../../../landing.css';
import './paiement.css';

export const metadata: Metadata = {
  title: 'Commencer — Mustaf | Litug',
  description:
    'Lancez votre projet Mustaf : la Phase 0 complète (plan, permis, étude de sol) ou un accès direct au tableau de bord si vous avez déjà vos plans.',
};

/** Au retour de Stripe (?paid=1&session_id=…), confirme que la session est payée. */
async function confirmStripeReturn(sessionId?: string): Promise<string | null> {
  if (!sessionId) return null;
  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    if (session.payment_status === 'paid') {
      return session.customer_details?.email ?? session.customer_email ?? '';
    }
  } catch {
    // session introuvable / clé absente
  }
  return null;
}

export default async function PaiementPhaseZeroPage({
  searchParams,
}: {
  searchParams: Promise<{ paid?: string; session_id?: string; canceled?: string; tier?: string }>;
}) {
  const sp = await searchParams;
  const paidEmail = sp.paid === '1' ? await confirmStripeReturn(sp.session_id) : null;
  const canceled = sp.canceled === '1';
  const tier = TIERS.find((t) => t.id === sp.tier)?.id as TierId | undefined;

  // On n'accède au paiement qu'après avoir choisi un abonnement Mustaf — sauf
  // pour le retour Stripe (succès/annulation), qui ne porte pas le tier.
  if (!tier && sp.paid !== '1' && sp.canceled !== '1') {
    redirect('/mustaf#offres');
  }

  return (
    <div className="landing-root">
      {/* Nav simple */}
      <nav className="offer-nav">
        <Link className="brand" href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Litug" />
        </Link>
        <Link className="btn btn-ghost" href="/mustaf">
          <ArrowLeft size={16} /> Retour
        </Link>
      </nav>

      <section className="section wrap" style={{ paddingTop: 'clamp(32px,5vw,56px)' }}>
        {paidEmail !== null ? (
          <div className="pay-card co-confirm" style={{ maxWidth: 560, margin: '0 auto' }}>
            <span className="ic"><Check size={30} /></span>
            <h2>Paiement reçu !</h2>
            <p>
              Merci, votre paiement a bien été confirmé. Votre inscription <b>Mustaf</b> est
              enregistrée
              {paidEmail ? <> et un <b>email d&apos;activation</b> vous a été envoyé à&nbsp;:</> : '.'}
            </p>
            {paidEmail && <span className="email-pill">{paidEmail}</span>}
            <p className="co-confirm-note">
              <ShieldCheck size={15} />
              Notre équipe étudie votre dossier pour démarrer votre accompagnement.
            </p>
            <Link href="/login" className="btn btn-primary btn-lg" style={{ marginTop: 18 }}>
              Aller à la connexion
            </Link>
          </div>
        ) : (
          <MustafCheckout canceled={canceled} tier={tier} />
        )}
      </section>

      <footer className="offer-foot">
        <p>
          <ShieldCheck size={15} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 6, color: 'var(--green)' }} />
          Tiers de confiance · Inspecteur indépendant · Paiement par phase
        </p>
        <p style={{ marginTop: 10 }}>
          <Link href="/mustaf">← Retour aux offres Mustaf</Link>
        </p>
      </footer>
    </div>
  );
}
