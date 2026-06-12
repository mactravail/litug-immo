'use client';

import { useState } from 'react';
import {
  ShieldCheck, FileText, FileCheck2, Layers, LayoutDashboard, Check,
} from 'lucide-react';
import { formatFcfa, formatEur } from '@/lib/utils';
import { PHASE_ZERO_FEE } from '../../offers';
import PaiementForm from './PaiementForm';
import { SelfBuildForm } from './SelfBuildForm';

type Plan = 'phase0' | 'self';

// Accès au tableau de bord sans Phase 0 : ~10 € (FCFA ≈ 6 560 au taux fixe XOF).
const DASHBOARD_FEE = 6_560;

const PHASE_ZERO_ITEMS = [
  { icon: FileText, label: 'Plan d’architecte', note: 'Conçu selon votre terrain et votre budget' },
  { icon: FileCheck2, label: 'Dossier de permis de construire', note: 'Montage et dépôt du dossier' },
  { icon: Layers, label: 'Étude de sol', note: 'Fondations dimensionnées sans surprise' },
];

const SELF_ITEMS = [
  { label: 'Accès complet au tableau de bord', note: 'Suivez votre projet en temps réel' },
  { label: 'Accompagnement sur mesure', note: 'On reprend votre chantier là où il en est' },
  { label: 'Argent bloqué chez un tiers de confiance', note: 'Libéré par phase, après vérification' },
];

export function MustafCheckout({ canceled }: { canceled?: boolean }) {
  const [plan, setPlan] = useState<Plan>('phase0');

  return (
    <>
      {/* ── Choix du point de départ ── */}
      <div className="plan-choice" role="tablist" aria-label="Point de départ">
        <button
          type="button" role="tab" aria-selected={plan === 'phase0'}
          className={`plan-opt${plan === 'phase0' ? ' active' : ''}`}
          onClick={() => setPlan('phase0')}
        >
          <span className="plan-opt-head">
            <span className="plan-ic"><FileCheck2 size={18} /></span>
            <span className="plan-check">{plan === 'phase0' && <Check size={14} strokeWidth={3} />}</span>
          </span>
          <b>Je veux la Phase 0</b>
          <span>Plan d’architecte, permis et étude de sol — on prépare tout avant de construire.</span>
          <span className="plan-price">{formatFcfa(PHASE_ZERO_FEE)} <small>· forfait unique</small></span>
        </button>

        <button
          type="button" role="tab" aria-selected={plan === 'self'}
          className={`plan-opt${plan === 'self' ? ' active' : ''}`}
          onClick={() => setPlan('self')}
        >
          <span className="plan-opt-head">
            <span className="plan-ic"><LayoutDashboard size={18} /></span>
            <span className="plan-check">{plan === 'self' && <Check size={14} strokeWidth={3} />}</span>
          </span>
          <b>J’ai déjà mes plans / permis</b>
          <span>Vous avez déjà tout — peut-être même la fondation. Accédez directement au tableau de bord.</span>
          <span className="plan-price">10 € <small>· accès au dashboard</small></span>
        </button>
      </div>

      <div className="pay-grid">
        {/* Colonne formulaire */}
        <div className="pay-form-col">
          {plan === 'phase0' ? <PaiementForm canceled={canceled} /> : <SelfBuildForm canceled={canceled} />}
        </div>

        {/* Colonne récap */}
        <div className="pay-summary-col">
          {plan === 'phase0' ? (
            <div className="pay-card">
              <h2>Forfait Phase 0</h2>
              <ul className="pay-includes">
                {PHASE_ZERO_ITEMS.map(({ icon: Icon, label, note }) => (
                  <li key={label}>
                    <span className="pay-includes-ic"><Icon size={17} /></span>
                    <span><b>{label}</b><small>{note}</small></span>
                  </li>
                ))}
              </ul>
              <div className="pay-total">
                <span className="lbl">À payer aujourd’hui</span>
                <span className="val">
                  <span className="big">{formatFcfa(PHASE_ZERO_FEE)}</span>
                  <small>≈ {formatEur(PHASE_ZERO_FEE)}</small>
                </span>
              </div>
              <p className="pay-recurring">
                Frais fixe unique. Les honoraires de gestion (8 à 16 %) ne démarrent qu’au lancement
                du chantier, étalés phase par phase.
              </p>
            </div>
          ) : (
            <div className="pay-card">
              <h2>Accès tableau de bord</h2>
              <ul className="pay-includes">
                {SELF_ITEMS.map(({ label, note }) => (
                  <li key={label}>
                    <span className="pay-includes-ic"><Check size={17} /></span>
                    <span><b>{label}</b><small>{note}</small></span>
                  </li>
                ))}
              </ul>
              <div className="pay-total">
                <span className="lbl">À payer aujourd’hui</span>
                <span className="val">
                  <span className="big">10 €</span>
                  <small>≈ {formatFcfa(DASHBOARD_FEE)}</small>
                </span>
              </div>
              <p className="pay-recurring">
                Sans la Phase 0. Notre équipe étudie votre situation et reprend votre projet là où
                il en est, pour un accompagnement sur mesure.
              </p>
            </div>
          )}

          <div className="pay-trust">
            <p>
              <ShieldCheck size={15} />
              Paiement chiffré. Votre argent de construction reste bloqué chez un tiers de confiance
              et n’est libéré qu’après vérification sur le chantier.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
