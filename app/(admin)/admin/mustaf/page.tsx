import Link from 'next/link';
import { MapPin, TriangleAlert, ArrowRight } from 'lucide-react';
import { getAdminProvider } from '@/lib/admin/provider';
import { SubscriptionBadge } from '@/components/admin/SubscriptionBadge';
import { TIER_LABEL } from '@/lib/mustaf/labels';

export default async function AdminMustafPage() {
  const projects = await getAdminProvider().listMustafProjects();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-text">Projets Mustaf</h1>
        <p className="text-muted text-sm mt-1">Clients propriétaires, abonnement de construction et avancement du chantier.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {projects.map(p => (
          <Link
            key={p.projectId}
            href={`/admin/mustaf/${p.projectId}`}
            className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 hover:border-accent/30 transition-colors block"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-text">{p.ownerName}</p>
                <p className="text-[11px] text-muted flex items-center gap-1"><MapPin size={11} /> {p.zone} · <span className="font-mono text-accent">{p.landRef}</span></p>
              </div>
              <SubscriptionBadge status={p.subscriptionStatus} />
            </div>

            <div className="mt-4 flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gold-light text-ink border border-gold/30 font-semibold">
                {TIER_LABEL[p.tier]}
              </span>
              <span className="text-muted">Phase : <span className="font-medium text-text">{p.currentPhaseLabel}</span></span>
            </div>

            <div className="mt-4 flex items-center justify-between">
              {p.openAnomalies > 0 ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600">
                  <TriangleAlert size={12} /> {p.openAnomalies} anomalie{p.openAnomalies > 1 ? 's' : ''}
                </span>
              ) : <span className="text-[11px] text-muted">Aucune anomalie</span>}
              <span className="text-xs font-semibold text-accent inline-flex items-center gap-1">Ouvrir <ArrowRight size={13} /></span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
