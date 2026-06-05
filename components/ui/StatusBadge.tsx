import type { SaleStatus, LeadStatus } from '@/lib/data/types';
import { cn } from '@/lib/utils';

const SALE_CONFIG: Record<SaleStatus, { label: string; bg: string; text: string }> = {
  disponible: { label: 'Disponible', bg: 'bg-sky-50', text: 'text-sky-700' },
  en_cours_de_vente: { label: 'En cours', bg: 'bg-orange-50', text: 'text-orange-700' },
  vendu: { label: 'Vendu', bg: 'bg-stone-100', text: 'text-stone-500' },
};

const LEAD_CONFIG: Record<LeadStatus, { label: string; bg: string; text: string }> = {
  nouveau: { label: 'Nouveau', bg: 'bg-blue-50', text: 'text-blue-700' },
  qualifie: { label: 'Qualifié', bg: 'bg-accent-light', text: 'text-accent' },
  en_contact: { label: 'En contact', bg: 'bg-amber-50', text: 'text-amber-700' },
  converti: { label: 'Converti', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  perdu: { label: 'Perdu', bg: 'bg-stone-100', text: 'text-stone-500' },
};

interface SaleProps { type: 'sale'; status: SaleStatus; className?: string }
interface LeadProps { type: 'lead'; status: LeadStatus; className?: string }
type Props = SaleProps | LeadProps;

export function StatusBadge(props: Props) {
  const config = props.type === 'sale' ? SALE_CONFIG[props.status] : LEAD_CONFIG[props.status];
  return (
    <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium', config.bg, config.text, props.className)}>
      {config.label}
    </span>
  );
}
