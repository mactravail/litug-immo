import { ShieldCheck, LogOut } from 'lucide-react';
import { EmployeSidebar } from '@/components/employe/EmployeSidebar';
import { EmployeMobileNav } from '@/components/employe/EmployeMobileNav';
import { getCurrentWorker, getCurrentWorkerId, selectableWorkers } from '@/lib/employe/current';
import { TEAM_ROLE_LABEL } from '@/lib/admin/labels';
import { logout } from '@/app/(auth)/login/actions';

/**
 * Espace employé (travailleurs terrain) — route group isolé, séparé de
 * l'admin et du client. Mock-first : l'employé courant vient d'un cookie
 * (sélecteur de démo) ; pas de garde d'auth pour l'instant.
 */
export default async function EmployeLayout({ children }: { children: React.ReactNode }) {
  const [worker, currentId] = await Promise.all([getCurrentWorker(), getCurrentWorkerId()]);
  const workers = selectableWorkers().map(w => ({ id: w.id, name: w.displayName, role: TEAM_ROLE_LABEL[w.role] }));

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <EmployeSidebar
        workerName={worker.displayName}
        role={worker.role}
        workers={workers}
        currentId={currentId}
      />

      <div className="flex-1 min-w-0 flex flex-col overflow-y-auto pb-20 lg:pb-0">
        {/* Bandeau confiance — l'employé ne voit que ce qui le concerne (prompt §2.1) */}
        <header className="sticky top-0 z-40 bg-ink text-on-ink px-4 sm:px-6 py-2.5">
          <div className="max-w-3xl mx-auto flex items-center gap-3 text-xs">
            <ShieldCheck size={13} className="text-gold shrink-0" />
            <span className="text-on-ink-muted">
              Tu ne vois que <strong className="text-on-ink font-medium">tes</strong> tâches et <strong className="text-on-ink font-medium">ton</strong> argent. Chaque dépense se justifie par un reçu.
            </span>
            {/* Déconnexion mobile : la sidebar (desktop) la porte déjà. */}
            <form action={logout} className="lg:hidden ml-auto shrink-0">
              <button type="submit" className="inline-flex items-center gap-1.5 text-on-ink-muted hover:text-white transition-colors cursor-pointer">
                <LogOut size={14} />
                Quitter
              </button>
            </form>
          </div>
        </header>

        <main className="flex-1">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">{children}</div>
        </main>
      </div>

      <EmployeMobileNav role={worker.role} />
    </div>
  );
}
