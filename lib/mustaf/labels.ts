/* ============================================================
   Mustaf — code → French display labels (mustaf.md §5.1, §4, §6).
   Keeps DB codes in English; all UI strings here are French.
   ============================================================ */

import type { PhaseStatus, ExpenseCategory, SubscriptionTier } from './types';

export const PHASE_STATUS_LABEL: Record<PhaseStatus, string> = {
  pending_funding:    'En attente de financement',
  funded:             'Financée',
  in_progress:        'En cours',
  pre_pour_verified:  'Vérifiée avant coulage',
  awaiting_inspection:'En attente d’inspection',
  inspected:          'Inspectée',
  awaiting_release:   'En attente de déblocage',
  paid:               'Payée',
  completed:          'Terminée',
};

export const EXPENSE_CATEGORY_LABEL: Record<ExpenseCategory, string> = {
  materials:      'Matériaux',
  labor:          'Main-d’œuvre',
  transport:      'Transport',
  management_fee: 'Commission Litug',
  phase_zero:     'Honoraires Phase 0',
};

export const TIER_LABEL: Record<SubscriptionTier, string> = {
  suivi:        'Suivi essentiel',
  serenite:     'Sérénité',
  tranquillite: 'Tranquillité totale',
};

/** Tailwind classes (Sahel palette) per phase status — used by PhaseBadge. */
export const PHASE_STATUS_STYLE: Record<PhaseStatus, string> = {
  pending_funding:    'bg-amber-50 text-amber-700 border-amber-200',
  funded:             'bg-accent-light text-accent border-accent/20',
  in_progress:        'bg-sky-50 text-sky-700 border-sky-200',
  pre_pour_verified:  'bg-gold-light text-ink border-gold/30',
  awaiting_inspection:'bg-amber-50 text-amber-700 border-amber-200',
  inspected:          'bg-accent-light text-accent border-accent/20',
  awaiting_release:   'bg-amber-50 text-amber-700 border-amber-200',
  paid:               'bg-emerald-50 text-emerald-700 border-emerald-200',
  completed:          'bg-emerald-50 text-emerald-700 border-emerald-200',
};
