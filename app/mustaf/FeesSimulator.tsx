'use client';

import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { formatFcfa, formatEur } from '@/lib/utils';
import { TIERS, SIM_MIN, SIM_MAX, SIM_STEP, SIM_DEFAULT } from './offers';

/**
 * Simulateur d'honoraires — calcul front pur (aucun paiement, §12).
 * Rend le pourcentage concret : pour un budget donné, montant par offre.
 */
export default function FeesSimulator() {
  const [budget, setBudget] = useState<number>(SIM_DEFAULT);

  return (
    <div className="mustaf-sim">
      <div className="mustaf-sim-head">
        <span className="mustaf-sim-eyebrow">
          <SlidersHorizontal size={15} /> Simulateur d’honoraires
        </span>
        <p className="mustaf-sim-budget">{formatFcfa(budget)}</p>
        <p className="mustaf-sim-budget-eur">≈ {formatEur(budget)}</p>
      </div>

      <label className="mustaf-sim-label" htmlFor="sim-budget">
        Budget de construction estimé
      </label>
      <input
        id="sim-budget"
        type="range"
        min={SIM_MIN}
        max={SIM_MAX}
        step={SIM_STEP}
        value={budget}
        onChange={(e) => setBudget(Number(e.target.value))}
        className="mustaf-sim-range"
      />
      <div className="mustaf-sim-bounds">
        <span>{formatFcfa(SIM_MIN)}</span>
        <span>{formatFcfa(SIM_MAX)}</span>
      </div>

      <div className="mustaf-sim-grid">
        {TIERS.map((tier) => {
          const fee = Math.round((budget * tier.pct) / 100);
          return (
            <div key={tier.id} className={`mustaf-sim-cell${tier.featured ? ' featured' : ''}`}>
              <p className="mustaf-sim-tier">{tier.name}</p>
              <p className="mustaf-sim-pct">{tier.pct} %</p>
              <p className="mustaf-sim-fee">{formatFcfa(fee)}</p>
              <p className="mustaf-sim-fee-eur">≈ {formatEur(fee)}</p>
            </div>
          );
        })}
      </div>

      <p className="mustaf-sim-foot">
        Estimation indicative. Les honoraires sont étalés sur les phases du chantier, jamais payés d’un seul coup.
      </p>
    </div>
  );
}
