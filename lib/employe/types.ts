/* ============================================================
   Espace employé (travailleurs terrain) — view-models.
   Code/DB en anglais ; copy utilisateur en français.
   Réutilise les entités du Volet B admin (Task, CashAdvance,
   AdvanceReceipt, WorkSession, FieldReport, Incident) : une
   seule source de données, deux portes (prompt §3.4 CLAUDE.md).
   Montants en FCFA entiers ; € calculé à l'affichage.
   ============================================================ */

import type {
  Task, CashAdvance, AdvanceReceipt, WorkSession, FieldReport,
  AdvanceReconciliation,
} from '@/lib/admin/types';

/** Une ligne de l'écran « Mes tâches » — tâche + argent reçu + alerte délai. */
export interface MyTaskRow {
  task: Task;
  advance?: CashAdvance;        // l'argent confié pour cette tâche (s'il y en a)
  overdue: boolean;             // délai dépassé
  dueSoon: boolean;             // délai dans les 2 jours
}

/** Moyen de paiement d'un salaire/paiement employé. */
export type PaymentMethod = 'cash' | 'wave' | 'om' | 'bank';

/**
 * Paiement reçu par l'employé POUR SON TRAVAIL (salaire / prime).
 * À distinguer d'une avance (`CashAdvance`) : l'avance est de l'argent confié
 * pour ACHETER (à justifier par reçus et à réconcilier) ; le paiement est la
 * rémunération de l'employé, qui lui reste acquise.
 */
export interface WorkerPayment {
  id: string;
  workerId: string;
  workerName: string;
  taskId?: string;
  label: string;            // motif (ex. « Salaire semaine 23 », « Prime livraison »)
  amount: number;
  paidAt: string;
  method: PaymentMethod;
}

/** Synthèse argent de l'employé — les 3 flux que le travailleur doit voir. */
export interface WalletSummary {
  advancesReceived: number;    // argent confié POUR ACHETER (Σ avances reçues)
  advancesSpent: number;       // dépensé et justifié
  advancesReturned: number;    // argent rendu
  advancesOutstanding: number; // encore à régulariser (écart sur avances ouvertes)
  paymentsReceived: number;    // PAIEMENT de son travail (salaire/primes)
}

/** Détail d'une tâche, côté employé. */
export interface MyTaskDetail {
  task: Task;
  advance?: CashAdvance;
  receipts: AdvanceReceipt[];
  reconciliation?: AdvanceReconciliation;
  sessions: WorkSession[];
  activeSession?: WorkSession;  // pointage en cours (pas encore terminé)
  report?: FieldReport;         // rendu-compte déjà soumis (s'il existe)
  totalHours: number;
}
