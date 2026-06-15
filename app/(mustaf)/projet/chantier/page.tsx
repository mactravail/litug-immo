import { ShieldCheck, ClipboardCheck } from 'lucide-react';
import { getMustafProvider } from '@/lib/mustaf/provider';
import { PageHeader } from '@/components/ui/PageHeader';
import { PhaseBadge } from '@/components/mustaf/PhaseBadge';
import { MetadataBadge } from '@/components/mustaf/MetadataBadge';
import { MediaThumb } from '@/components/mustaf/MediaThumb';
import { AnomalyButton } from '@/components/mustaf/AnomalyButton';
import { formatDateShort } from '@/lib/utils';

export default async function ChantierPage() {
  const mp = getMustafProvider();
  const [phases, media, inspections] = await Promise.all([
    mp.getPhases(),
    mp.getMedia(),
    mp.getInspections(),
  ]);

  // Only show phases that already have media to display.
  const phasesWithMedia = phases.filter(p => media.some(m => m.phaseId === p.id));

  return (
    <div className="space-y-8">
      <PageHeader
        title="Suivi du chantier"
        breadcrumbs={[{ label: 'Mon projet', href: '/projet' }, { label: 'Suivi du chantier' }]}
      />

      <p className="text-sm text-muted -mt-2">
        Chaque photo est datée et géolocalisée. Une photo sans métadonnée est clairement signalée.
      </p>

      {phasesWithMedia.map(phase => {
        const phaseMedia = media.filter(m => m.phaseId === phase.id);
        const phaseInspections = inspections.filter(i => i.phaseId === phase.id && i.signedAt);

        return (
          <section key={phase.id} className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="font-serif text-lg font-semibold text-text">{phase.label}</h2>
              <PhaseBadge status={phase.status} />
            </div>

            {/* Galerie */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {phaseMedia.map(m => (
                <div key={m.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-3 space-y-2.5">
                  <MediaThumb media={m} />
                  <MetadataBadge media={m} />
                  <div className="pt-1 border-t border-stone-50">
                    <AnomalyButton target="media" label="Signaler cette photo" />
                  </div>
                </div>
              ))}
            </div>

            {/* Vérifications de la phase */}
            {phaseInspections.length > 0 && (
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 space-y-3">
                <h3 className="text-sm font-semibold text-text flex items-center gap-2">
                  <ClipboardCheck size={15} className="text-accent" />
                  Vérifications de l’inspecteur indépendant
                </h3>
                {phaseInspections.map(insp => (
                  <div key={insp.id} className="rounded-xl bg-accent-light/40 border border-accent/10 px-3 py-2.5">
                    <div className="flex items-center gap-2 text-xs">
                      <ShieldCheck size={14} className="text-accent shrink-0" />
                      <span className="font-semibold text-text">
                        {insp.prePour ? 'Vérification avant coulage' : 'Vérification finale'}
                      </span>
                      <span className="text-emerald-700 font-medium">· Validée</span>
                    </div>
                    <p className="text-[11px] text-muted mt-1">
                      {insp.signature} · {insp.signedAt ? formatDateShort(insp.signedAt) : ''}
                    </p>
                    <ul className="mt-2 space-y-0.5">
                      {insp.checklist.map((c, i) => (
                        <li key={i} className="text-[11px] text-muted flex items-start gap-1.5">
                          <span className="text-emerald-600 mt-px">✓</span> {c.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
