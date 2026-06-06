'use client';

import { useTransition } from 'react';
import type { VerificationStatus } from '@/lib/data/types';
import { requestVerification } from '@/app/actions';
import { ShieldCheck, Clock } from 'lucide-react';

interface Props {
  landId: string;
  currentStatus: VerificationStatus;
}

export function VerificationActions({ landId, currentStatus }: Props) {
  const [pending, startTransition] = useTransition();

  if (currentStatus === 'verifie') return null;

  if (currentStatus === 'a_verifier') {
    return (
      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 flex items-start gap-3">
        <Clock size={16} className="text-amber-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-amber-800">Vérification en cours</p>
          <p className="text-xs text-amber-700 mt-1">Notre notaire partenaire procède au contrôle à la Conservation Foncière.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
      <p className="text-xs text-muted font-semibold uppercase tracking-wider mb-3">Vérification</p>
      <p className="text-xs text-muted mb-3">
        Demandez la vérification par notre notaire partenaire à la Conservation Foncière. Ce terrain sera alors marqué <strong>Vérifié</strong>.
      </p>
      <button
        disabled={pending}
        onClick={() => startTransition(() => requestVerification(landId))}
        className="w-full text-sm font-semibold bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <ShieldCheck size={15} />
        {pending ? 'Demande en cours…' : 'Demander la vérification'}
      </button>
    </div>
  );
}
