import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, MapPin, Users } from 'lucide-react';
import { getAdminProvider } from '@/lib/admin/provider';
import { getDataProvider } from '@/lib/data/provider';
import { SELLER_ID } from '@/lib/data/seed';
import { SubscriptionBadge } from '@/components/admin/SubscriptionBadge';
import { SubscriptionActions } from '@/components/admin/SubscriptionActions';
import { DocumentTypeBadge } from '@/components/ui/DocumentTypeBadge';
import { VerificationBadge } from '@/components/ui/VerificationBadge';
import { SUBJECT_TYPE_LABEL } from '@/lib/admin/labels';
import { formatFcfa, formatDateShort } from '@/lib/utils';

export default async function AdminVendeurDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sub = await getAdminProvider().getSubscription(id);
  if (!sub || sub.subjectType !== 'seller') notFound();

  // Real seed seller has a full profile; demo subscriptions are list-only.
  const isRealSeller = sub.subjectId === SELLER_ID;
  const dp = getDataProvider();
  const [lands, leads] = isRealSeller
    ? await Promise.all([dp.listLands(sub.subjectId), dp.listLeads(sub.subjectId)])
    : [[], []];

  return (
    <div className="space-y-6">
      <Link href="/admin/vendeurs" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-text transition-colors">
        <ArrowLeft size={15} /> Retour aux vendeurs
      </Link>

      {/* En-tête + abonnement */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-semibold text-text">{sub.subjectName}</h1>
            <SubscriptionBadge status={sub.status} />
          </div>
          <p className="text-sm text-muted mt-1">{SUBJECT_TYPE_LABEL[sub.subjectType]} · {sub.contact}</p>
          <p className="text-xs text-muted mt-2">
            Abonnement <span className="font-medium text-text">{sub.tier}</span> · client depuis {formatDateShort(sub.createdAt)}
            {sub.validatedAt && <> · validé le {formatDateShort(sub.validatedAt)}</>}
          </p>
        </div>
        <SubscriptionActions id={sub.id} status={sub.status} subjectName={sub.subjectName} />
      </div>

      {!isRealSeller && (
        <p className="text-sm text-muted bg-paper-2/60 border border-line rounded-2xl px-4 py-3">
          Profil détaillé (terrains, leads, témoignages) disponible une fois le compte vendeur activé et synchronisé.
        </p>
      )}

      {isRealSeller && (
        <>
          {/* Listings */}
          <section>
            <h2 className="font-display text-lg font-semibold text-text mb-3">Terrains ({lands.length})</h2>
            <div className="space-y-3">
              {lands.map(land => (
                <div key={land.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text">{land.title}</p>
                    <p className="text-[11px] text-muted flex items-center gap-1"><MapPin size={11} /> {land.zone} · {formatFcfa(land.priceFcfa)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <DocumentTypeBadge type={land.documentType} />
                    <VerificationBadge status={land.verificationStatus} />
                    {land.saleStatus === 'vendu' && (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">Vendu</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Leads */}
          <section>
            <h2 className="font-display text-lg font-semibold text-text mb-3 flex items-center gap-2">
              <Users size={17} className="text-accent" /> Leads captés ({leads.length})
            </h2>
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm divide-y divide-stone-100">
              {leads.map(lead => (
                <div key={lead.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text truncate">{lead.name ?? 'Client inconnu'}</p>
                    <p className="text-[11px] text-muted">{lead.phone} · {lead.source}</p>
                  </div>
                  <span className="text-[11px] text-muted shrink-0">{formatDateShort(lead.createdAt)}</span>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
