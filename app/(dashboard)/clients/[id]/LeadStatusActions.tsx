'use client';

import { useTransition } from 'react';
import type { LeadStatus } from '@/lib/data/types';
import { updateLeadStatus } from '@/app/actions';

const STATUSES: { value: LeadStatus; label: string }[] = [
  { value: 'nouveau', label: 'Nouveau' },
  { value: 'qualifie', label: 'Qualifié' },
  { value: 'en_contact', label: 'En contact' },
  { value: 'converti', label: 'Converti' },
  { value: 'perdu', label: 'Perdu' },
];

interface Props {
  leadId: string;
  currentStatus: LeadStatus;
}

export function LeadStatusActions({ leadId, currentStatus }: Props) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      value={currentStatus}
      disabled={pending}
      onChange={e => startTransition(() => updateLeadStatus(leadId, e.target.value as LeadStatus))}
      className="w-full text-sm border border-stone-200 rounded-xl px-3 py-2.5 bg-white text-text appearance-none cursor-pointer hover:border-stone-300 transition-colors focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent disabled:opacity-50"
    >
      {STATUSES.map(s => (
        <option key={s.value} value={s.value}>{s.label}</option>
      ))}
    </select>
  );
}
