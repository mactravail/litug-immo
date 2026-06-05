import Link from 'next/link';
import { Users, MessageCircle } from 'lucide-react';
import { getDataProvider } from '@/lib/data/provider';
import { getAuthenticatedSellerId } from '@/lib/supabase-server';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { FilterBar } from '@/components/ui/FilterBar';
import { PageHeader } from '@/components/ui/PageHeader';
import { formatFcfa, formatDate } from '@/lib/utils';
import type { LeadStatus, LeadSource } from '@/lib/data/types';

const SOURCE_LABELS: Record<string, string> = {
  whatsapp: 'WhatsApp',
  site: 'Site web',
  autre: 'Autre',
};

const FILTER_GROUPS = [
  {
    key: 'status',
    label: 'Statut',
    options: [
      { value: 'nouveau', label: 'Nouveaux' },
      { value: 'qualifie', label: 'Qualifiés' },
      { value: 'en_contact', label: 'En contact' },
      { value: 'converti', label: 'Convertis' },
      { value: 'perdu', label: 'Perdus' },
    ],
  },
  {
    key: 'source',
    label: 'Source',
    options: [
      { value: 'whatsapp', label: 'WhatsApp' },
      { value: 'site', label: 'Site web' },
      { value: 'autre', label: 'Autre' },
    ],
  },
];

interface Props {
  searchParams: Promise<{ status?: string; source?: string }>;
}

export default async function ClientsPage({ searchParams }: Props) {
  const params = await searchParams;
  const sellerId = await getAuthenticatedSellerId();
  const dp = getDataProvider();
  const leads = await dp.listLeads(sellerId, {
    status: params.status as LeadStatus | undefined,
    source: params.source as LeadSource | undefined,
  });

  return (
    <div>
      <PageHeader title="Mes clients" />

      <div className="mb-6">
        <FilterBar groups={FILTER_GROUPS} />
      </div>

      {leads.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Aucun client trouvé"
          description="Les clients capturés par votre agent WhatsApp apparaîtront ici."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50/50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Client</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wider hidden md:table-cell">Budget</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wider hidden lg:table-cell">Zone souhaitée</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wider hidden sm:table-cell">Source</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Statut</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wider hidden lg:table-cell">Date</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {leads.map(lead => (
                <tr key={lead.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <Link href={`/clients/${lead.id}`} className="font-medium text-text hover:text-accent transition-colors">
                      {lead.name ?? 'Inconnu'}
                    </Link>
                    {lead.phone && <p className="text-xs text-muted mt-0.5">{lead.phone}</p>}
                  </td>
                  <td className="px-5 py-4 text-muted hidden md:table-cell">
                    {lead.budgetFcfa ? formatFcfa(lead.budgetFcfa) : '—'}
                  </td>
                  <td className="px-5 py-4 text-muted hidden lg:table-cell">
                    {lead.desiredZone ?? '—'}
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell">
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted">
                      {lead.source === 'whatsapp' && <MessageCircle size={11} className="text-green-600" />}
                      {SOURCE_LABELS[lead.source]}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge type="lead" status={lead.status} />
                  </td>
                  <td className="px-5 py-4 text-muted text-xs hidden lg:table-cell">
                    {formatDate(lead.createdAt)}
                  </td>
                  <td className="px-5 py-4">
                    <Link href={`/clients/${lead.id}`} className="text-xs text-accent font-medium hover:underline">
                      Voir →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
