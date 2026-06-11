import { TriangleAlert, MapPin, CheckCircle2, ChevronsUp } from 'lucide-react';
import { getAdminProvider } from '@/lib/admin/provider';
import { IncidentBadge, PriorityBadge } from '@/components/admin/WorkforceBadges';
import { FormButton } from '@/components/admin/FormButton';
import { resolveIncident, escalateIncident } from '@/app/(admin)/admin/actions';
import { formatDateShort, formatTime } from '@/lib/utils';

export default async function AdminProblemesPage() {
  const incidents = await getAdminProvider().listIncidents();
  const open = incidents.filter(i => i.status === 'to_resolve').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-text">Problèmes du terrain</h1>
        <p className="text-muted text-sm mt-1">
          Remontés par les employés — {open} à résoudre. Triés par priorité : c’est où il faut intervenir aujourd’hui.
        </p>
      </div>

      {incidents.length === 0 ? (
        <p className="text-sm text-muted">Aucun problème signalé.</p>
      ) : (
        <div className="space-y-3">
          {incidents.map(inc => (
            <div key={inc.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm text-text flex items-start gap-2 min-w-0">
                  <TriangleAlert size={15} className={inc.status === 'to_resolve' ? 'text-red-500 mt-0.5 shrink-0' : 'text-muted mt-0.5 shrink-0'} />
                  {inc.description}
                </p>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <IncidentBadge status={inc.status} />
                  <PriorityBadge priority={inc.priority} />
                </div>
              </div>

              <p className="text-[11px] text-muted ml-7 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>{inc.projectName} · signalé par {inc.raisedByName}</span>
                {inc.location && (
                  <span className="inline-flex items-center gap-1"><MapPin size={11} className="text-accent" /> {inc.location}
                    {inc.geo && <span className="text-muted/70"> ({inc.geo.lat.toFixed(4)}, {inc.geo.lng.toFixed(4)})</span>}
                  </span>
                )}
                <span>{formatDateShort(inc.occurredAt)} à {formatTime(inc.occurredAt)}</span>
              </p>

              {inc.status === 'to_resolve' && (
                <div className="flex flex-wrap gap-2 ml-7">
                  <FormButton
                    action={resolveIncident}
                    fields={{ id: inc.id }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold bg-accent text-white px-3 py-1.5 rounded-lg hover:bg-accent-bright transition-colors"
                  >
                    <CheckCircle2 size={13} /> Marquer résolu
                  </FormButton>
                  {inc.priority !== 'high' && (
                    <FormButton
                      action={escalateIncident}
                      fields={{ id: inc.id }}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <ChevronsUp size={13} /> Escalader
                    </FormButton>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
