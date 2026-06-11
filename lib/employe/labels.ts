/* ============================================================
   Espace employé — codes → libellés français.
   Code/DB en anglais ; copy utilisateur en français.
   ============================================================ */

import type { PaymentMethod } from './types';

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  cash: 'Espèces',
  wave: 'Wave',
  om:   'Orange Money',
  bank: 'Virement',
};
