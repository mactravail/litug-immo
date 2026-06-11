import Link from 'next/link';
import { getAdminProvider } from '@/lib/admin/provider';
import { SubscriptionBadge } from '@/components/admin/SubscriptionBadge';
import { SubscriptionActions } from '@/components/admin/SubscriptionActions';
import { formatDateShort } from '@/lib/utils';

export default async function AdminVendeursPage() {
  const subs = await getAdminProvider().listSubscriptions('seller');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-text">Abonnements vendeurs</h1>
        <p className="text-muted text-sm mt-1">Vendeurs de terrain et leur abonnement à l’agent Sara.</p>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted border-b border-stone-100 bg-stone-50/50">
              <th className="px-5 py-3 font-medium">Vendeur</th>
              <th className="px-5 py-3 font-medium">Abonnement</th>
              <th className="px-5 py-3 font-medium">Statut</th>
              <th className="px-5 py-3 font-medium">Depuis</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {subs.map(sub => (
              <tr key={sub.id} className="hover:bg-stone-50/50">
                <td className="px-5 py-3">
                  <Link href={`/admin/vendeurs/${sub.id}`} className="font-medium text-text hover:text-accent transition-colors">
                    {sub.subjectName}
                  </Link>
                  <p className="text-[11px] text-muted">{sub.contact}</p>
                </td>
                <td className="px-5 py-3 text-muted">{sub.tier}</td>
                <td className="px-5 py-3"><SubscriptionBadge status={sub.status} /></td>
                <td className="px-5 py-3 text-muted">{formatDateShort(sub.createdAt)}</td>
                <td className="px-5 py-3">
                  <div className="flex justify-end">
                    <SubscriptionActions id={sub.id} status={sub.status} subjectName={sub.subjectName} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {subs.map(sub => (
          <div key={sub.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Link href={`/admin/vendeurs/${sub.id}`} className="font-medium text-text hover:text-accent">{sub.subjectName}</Link>
                <p className="text-[11px] text-muted">{sub.contact} · {sub.tier}</p>
              </div>
              <SubscriptionBadge status={sub.status} />
            </div>
            <SubscriptionActions id={sub.id} status={sub.status} subjectName={sub.subjectName} />
          </div>
        ))}
      </div>
    </div>
  );
}
