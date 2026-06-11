import { ClipboardList } from 'lucide-react';
import { getAdminProvider } from '@/lib/admin/provider';
import { getMustafProvider } from '@/lib/mustaf/provider';
import { TEAM_ROLE_LABEL } from '@/lib/admin/labels';
import { CreateTaskForm } from '@/components/admin/CreateTaskForm';
import { TaskBadge, PriorityBadge } from '@/components/admin/WorkforceBadges';
import { FormButton } from '@/components/admin/FormButton';
import { cancelTask } from '@/app/(admin)/admin/actions';
import { formatDateShort } from '@/lib/utils';

export default async function AdminTachesPage() {
  const ap = getAdminProvider();
  const [tasks, employees, project] = await Promise.all([
    ap.listTasks(), ap.listEmployees(), getMustafProvider().getProject(),
  ]);

  const employeeOptions = employees.map(e => ({ id: e.member.id, name: e.member.displayName, role: TEAM_ROLE_LABEL[e.member.role] }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-text">Tâches & avances</h1>
        <p className="text-muted text-sm mt-1">Assigner du travail et, si nécessaire, une avance d’argent à un employé.</p>
      </div>

      {/* Création */}
      <section className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
        <h2 className="font-display text-lg font-semibold text-text mb-4">Assigner une tâche</h2>
        <CreateTaskForm project={{ id: project.id, name: project.ownerName, landRef: project.landRef }} employees={employeeOptions} />
      </section>

      {/* Liste */}
      <section>
        <h2 className="font-display text-lg font-semibold text-text mb-3 flex items-center gap-2"><ClipboardList size={17} className="text-accent" /> Toutes les tâches ({tasks.length})</h2>
        <div className="space-y-2">
          {tasks.map(t => (
            <div key={t.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-text">{t.title}</p>
                <p className="text-[11px] text-muted">
                  {t.assignedToName} · {t.projectName} · <span className="font-mono text-accent">{t.landRef}</span>{t.dueDate ? ` · échéance ${formatDateShort(t.dueDate)}` : ''}
                </p>
                {t.description && <p className="text-[11px] text-muted mt-1 max-w-2xl">{t.description}</p>}
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <div className="flex items-center gap-1.5">
                  <PriorityBadge priority={t.priority} />
                  <TaskBadge status={t.status} />
                </div>
                {(t.status === 'assigned' || t.status === 'in_progress') && (
                  <FormButton
                    action={cancelTask}
                    fields={{ id: t.id }}
                    className="text-[11px] font-semibold text-red-600 border border-red-200 px-2.5 py-1 rounded-lg hover:bg-red-50 transition-colors"
                    confirm={`Annuler la tâche « ${t.title} » ? Elle reste dans l’historique.`}
                  >
                    Annuler
                  </FormButton>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
