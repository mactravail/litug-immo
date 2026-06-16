'use client';

import { useEffect } from 'react';
import { markProspectionSeen } from '@/app/(admin)/admin/prospection/actions';

export function ProspectionMarkRead() {
  useEffect(() => {
    markProspectionSeen();
  }, []);
  return null;
}
