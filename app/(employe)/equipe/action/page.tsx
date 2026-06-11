import { Lock, ShieldAlert } from 'lucide-react';
import { getCurrentWorker } from '@/lib/employe/current';
import { getMustafProvider } from '@/lib/mustaf/provider';
import { TEAM_ROLE_LABEL } from '@/lib/admin/labels';
import { PHASE_STATUS_LABEL } from '@/lib/mustaf/labels';
import { InvoiceForm } from '@/components/employe/InvoiceForm';
import { MediaForm } from '@/components/employe/MediaForm';
import { IncidentForm } from '@/components/employe/IncidentForm';
import { formatFcfa } from '@/lib/utils';

const RELEASABLE = ['inspected', 'awaiting_release'] as const;

export default async function RoleActionPage() {
  const worker = await getCurrentWorker();
  const phases = await getMustafProvider().getPhases();
  const phaseOpts = phases.map(p => ({ id: p.id, label: p.label }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-text">Action métier</h1>
        <p className="text-muted text-sm mt-1">Selon ton rôle : <strong className="text-text">{TEAM_ROLE_LABEL[worker.role]}</strong>.</p>
      </div>

      {/* procurement — facture */}
      {worker.role === 'procurement' && <InvoiceForm phases={phaseOpts} />}

      {/* site_agent / inspector — photo de chantier */}
      {(worker.role === 'site_agent' || worker.role === 'inspector') && <MediaForm phases={phaseOpts} />}

      {/* controller — file de déblocage en lecture seule (maker-checker §3.10) */}
      {worker.role === 'controller' && (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 space-y-3">
          <p className="flex items-center gap-2 text-sm font-semibold text-text">
            <Lock size={16} className="text-accent" /> Phases inspectées en attente de déblocage
          </p>
          {phases.filter(p => (RELEASABLE as readonly string[]).includes(p.status)).length === 0 ? (
            <p className="text-sm text-muted">Aucune phase en attente de déblocage.</p>
          ) : (
            phases.filter(p => (RELEASABLE as readonly string[]).includes(p.status)).map(p => (
              <div key={p.id} className="flex items-center justify-between gap-2 rounded-xl bg-paper-2/40 border border-line p-3">
                <div>
                  <p className="text-sm font-medium text-text">{p.label}</p>
                  <p className="text-[11px] text-muted">{PHASE_STATUS_LABEL[p.status]}</p>
                </div>
                <span className="text-sm font-semibold text-text">{formatFcfa(p.estimate)}</span>
              </div>
            ))
          )}
          <p className="flex items-start gap-2 text-[11px] text-muted">
            <ShieldAlert size={13} className="text-accent mt-0.5 shrink-0" />
            Le déblocage effectif se fait en double signature côté contrôle (séparation des pouvoirs) : celui qui certifie ne débloque jamais.
          </p>
        </div>
      )}

      {/* Toujours disponible : signaler un problème */}
      <section className="space-y-2">
        <p className="text-xs font-semibold text-muted uppercase tracking-wide">Signaler un problème</p>
        <IncidentForm />
      </section>
    </div>
  );
}
