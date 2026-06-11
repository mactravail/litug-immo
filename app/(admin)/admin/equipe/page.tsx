import { UsersRound, RotateCw } from 'lucide-react';
import { getAdminProvider } from '@/lib/admin/provider';
import { getMustafProvider } from '@/lib/mustaf/provider';
import { TEAM_ROLE_LABEL } from '@/lib/admin/labels';
import { AssignRoleForm } from '@/components/admin/AssignRoleForm';
import { FormButton } from '@/components/admin/FormButton';
import { rotateInspector } from '@/app/(admin)/admin/actions';

export default async function AdminEquipePage() {
  const ap = getAdminProvider();
  const [team, project] = await Promise.all([ap.listTeam(), getMustafProvider().getProject()]);

  const inspectors = team.filter(t => t.role === 'inspector');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-text">Équipe & rôles</h1>
        <p className="text-muted text-sm mt-1">Séparation des pouvoirs : personne ne dépense et ne certifie à la fois (§3.10).</p>
      </div>

      {/* Personnel */}
      <section>
        <h2 className="font-display text-lg font-semibold text-text mb-3 flex items-center gap-2"><UsersRound size={17} className="text-accent" /> Personnel</h2>
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm divide-y divide-stone-100">
          {team.map(m => (
            <div key={m.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-text">{m.displayName}</p>
                <p className="text-[11px] text-muted">{m.contact ?? '—'}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {m.role === 'inspector' && (
                  <span className="text-[11px] text-muted">{m.assignedProjectIds.length} chantier{m.assignedProjectIds.length > 1 ? 's' : ''}</span>
                )}
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-accent-light text-accent border border-accent/20">
                  {TEAM_ROLE_LABEL[m.role]}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Rotation des inspecteurs */}
      <section>
        <h2 className="font-display text-lg font-semibold text-text mb-1 flex items-center gap-2"><RotateCw size={17} className="text-accent" /> Rotation des inspecteurs</h2>
        <p className="text-xs text-muted mb-3">Faire tourner l’inspecteur affecté au chantier de {project.ownerName} évite toute relation de complaisance (§8.4).</p>
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm divide-y divide-stone-100">
          {inspectors.map(insp => {
            const assigned = insp.assignedProjectIds.includes(project.id);
            return (
              <div key={insp.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-text">{insp.displayName}</p>
                  <p className="text-[11px] text-muted">{assigned ? 'Affecté à ce chantier' : 'Disponible'}</p>
                </div>
                {assigned ? (
                  <span className="text-[11px] font-semibold text-emerald-700">Affecté</span>
                ) : (
                  <FormButton
                    action={rotateInspector}
                    fields={{ inspectorId: insp.id, projectId: project.id }}
                    className="text-xs font-semibold text-accent border border-accent/30 px-3 py-1.5 rounded-lg hover:bg-accent-light transition-colors"
                  >
                    Affecter à ce chantier
                  </FormButton>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Ajouter un membre */}
      <section>
        <h2 className="font-display text-lg font-semibold text-text mb-3">Ajouter un membre</h2>
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
          <AssignRoleForm />
        </div>
      </section>
    </div>
  );
}
