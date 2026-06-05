'use client';

import { useState, useTransition } from 'react';
import { AlertTriangle } from 'lucide-react';
import { cancelSubscription } from '@/app/actions';

export function CancelSubscriptionButton() {
  const [step, setStep] = useState<'idle' | 'confirm' | 'done'>('idle');
  const [pending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      await cancelSubscription();
      setStep('done');
    });
  }

  if (step === 'done') {
    return (
      <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 text-sm text-muted">
        Votre demande de résiliation a été prise en compte. Vous recevrez un email de confirmation sous 24h.
      </div>
    );
  }

  if (step === 'confirm') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-5 space-y-4">
        <div className="flex items-start gap-3">
          <AlertTriangle size={18} className="text-red-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-800">Confirmer la résiliation</p>
            <p className="text-xs text-red-700 mt-1">
              Votre accès au dashboard et à l'agent WhatsApp sera désactivé à la fin de la période en cours.
              Cette action est irréversible.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleConfirm}
            disabled={pending}
            className="text-sm font-semibold bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {pending ? 'Traitement…' : 'Oui, résilier mon abonnement'}
          </button>
          <button
            onClick={() => setStep('idle')}
            disabled={pending}
            className="text-sm font-semibold text-muted px-4 py-2 rounded-xl border border-stone-200 hover:bg-stone-50 transition-colors"
          >
            Annuler
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setStep('confirm')}
      className="text-sm font-medium text-red-600 hover:text-red-700 hover:underline transition-colors"
    >
      Résilier mon abonnement
    </button>
  );
}
