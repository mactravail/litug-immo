/* ============================================================
   Espace employé — données de démo propres à l'employé.
   ⚠️ Mock-first. Les PAIEMENTS de l'employé (salaire/primes) sont
   un concept nouveau, pas encore géré côté admin : le flux de
   versement par l'admin viendra plus tard (migration 006). Pour
   l'instant on les seed ici pour que le travailleur voie l'argent
   reçu en rémunération de son travail.
   Montants en FCFA entiers ; € calculé à l'affichage.
   ============================================================ */

import type { WorkerPayment } from './types';

const SEGA = { id: 'user-proc-sega', name: 'Séga Diop' };
const BABA = { id: 'user-site-baba', name: 'Baba Sarr' };

export const SEED_WORKER_PAYMENTS: WorkerPayment[] = [
  {
    id: 'pay-1', workerId: BABA.id, workerName: BABA.name, taskId: 'task-2',
    label: 'Salaire — semaine 23', amount: 60_000, paidAt: '2026-06-07T18:00:00Z', method: 'wave',
  },
  {
    id: 'pay-2', workerId: BABA.id, workerName: BABA.name, taskId: 'task-3',
    label: 'Prime coordination maçons', amount: 25_000, paidAt: '2026-06-10T18:00:00Z', method: 'om',
  },
  {
    id: 'pay-3', workerId: SEGA.id, workerName: SEGA.name, taskId: 'task-1',
    label: 'Salaire — semaine 23', amount: 55_000, paidAt: '2026-06-08T18:00:00Z', method: 'cash',
  },
];
