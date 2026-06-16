/* ============================================================
   Sara — plans et tarification (source unique).
   Partagé par la page de pricing et la page de paiement.
   ============================================================ */

export const SETUP_FEE = 100_000; // FCFA, unique

export type PlanId = 'essai' | 'pro';
export type PeriodId = 'mensuel' | '6mois' | 'annuel';

export interface PeriodInfo {
  label: string;      // affiché sur les boutons
  months: number;
  monthly_fcfa: number;
  total_fcfa: number; // monthly_fcfa × months
  discount_pct: number;
}

export const PERIODS: Record<PeriodId, PeriodInfo> = {
  mensuel: { label: '1 mois',  months: 1,  monthly_fcfa: 50_000, total_fcfa:  50_000, discount_pct: 0  },
  '6mois': { label: '6 mois',  months: 6,  monthly_fcfa: 45_000, total_fcfa: 270_000, discount_pct: 10 },
  annuel:  { label: '1 an',    months: 12, monthly_fcfa: 40_000, total_fcfa: 480_000, discount_pct: 20 },
};

export const PERIOD_IDS: PeriodId[] = ['mensuel', '6mois', 'annuel'];

/** Total FCFA à payer aujourd'hui selon le plan et la période. */
export function getTotal(plan: PlanId, period: PeriodId): number {
  if (plan === 'essai') return SETUP_FEE;
  return SETUP_FEE + PERIODS[period].total_fcfa;
}

export function isPlanId(s: unknown): s is PlanId {
  return s === 'essai' || s === 'pro';
}

export function isPeriodId(s: unknown): s is PeriodId {
  return s === 'mensuel' || s === '6mois' || s === 'annuel';
}
