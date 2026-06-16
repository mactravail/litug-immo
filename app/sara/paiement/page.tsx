import type { Metadata } from 'next';
import Link from 'next/link';
import { existsSync } from 'fs';
import { join } from 'path';
import { ArrowLeft } from 'lucide-react';
import { Checkout } from './Checkout';
import { getStripe } from '@/lib/stripe';
import { isPlanId, isPeriodId, type PlanId, type PeriodId } from '../plans';
import '../../landing.css';
import './checkout.css';

export const metadata: Metadata = {
  title: 'Paiement — Abonnement Sara | Litug',
  description: 'Active ton abonnement à Sara : paiement par Wave (carte bancaire, PayPal et Stripe bientôt disponibles).',
};

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

export default async function PaiementPage({
  searchParams,
}: {
  searchParams: Promise<{ paid?: string; session_id?: string; canceled?: string; plan?: string; period?: string }>;
}) {
  const sp = await searchParams;
  const paidEmail = sp.paid === '1' ? await confirmStripeReturn(sp.session_id) : null;
  const canceled = sp.canceled === '1';

  const plan: PlanId   = isPlanId(sp.plan)     ? sp.plan   : 'essai';
  const period: PeriodId = isPeriodId(sp.period) ? sp.period : 'mensuel';

  const hasQr = existsSync(join(process.cwd(), 'public', 'wave-qr.png'));

  return (
    <div className="landing-root">
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
        <span className="eyebrow">Paiement sécurisé</span>
        <h1>Finalise ton abonnement <span className="accent">Sara</span></h1>
        <p>Choisis ton moyen de paiement, crée ton accès, et reçois ton email d&apos;activation.</p>
      </header>

      <section className="section wrap" style={{ paddingTop: 'clamp(24px,3vw,36px)' }}>
        <Checkout
          hasQr={hasQr}
          plan={plan}
          defaultPeriod={period}
          paidEmail={paidEmail}
          canceled={canceled}
        />
      </section>

      <footer className="offer-foot">
        <p><Link href="/sara">← Revenir à l&apos;offre Sara</Link></p>
      </footer>
    </div>
  );
}
