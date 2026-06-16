import { ShieldCheck } from 'lucide-react';
import { EmployeSidebar } from '@/components/employe/EmployeSidebar';
import { EmployeMobileNav } from '@/components/employe/EmployeMobileNav';
import { EmployeMobileMenu } from '@/components/employe/EmployeMobileMenu';
import { getCurrentWorker, getCurrentWorkerId, selectableWorkers, getRealProspectorId } from '@/lib/employe/current';
import { listMyProspects, countDraftProspects } from '@/lib/employe/provider';
import { dbCountDrafts } from '@/lib/employe/prospection-db';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { TEAM_ROLE_LABEL } from '@/lib/admin/labels';

/**
 * Espace employé (travailleurs terrain) — route group isolé, séparé de
 * l'admin et du client. Mock-first : l'employé courant vient d'un cookie
 * (sélecteur de démo) ; pas de garde d'auth pour l'instant.
 */
export default async function EmployeLayout({ children }: { children: React.ReactNode }) {
  const [worker, currentId] = await Promise.all([getCurrentWorker(), getCurrentWorkerId()]);
  const workers = selectableWorkers().map(w => ({ id: w.id, name: w.displayName, role: TEAM_ROLE_LABEL[w.role] }));

  // La sidebar du prospecteur affiche la liste de ses entreprises (recherche + classement).
  const prospects = worker.role === 'prospector'
    ? listMyProspects(worker.id).map(p => ({ id: p.id, companyName: p.companyName, followers: p.followers, outcome: p.outcome }))
    : undefined;

  // Badge nav : nombre de prospections non envoyées au superviseur.
  let draftCount = 0;
  if (worker.role === 'prospector') {
    const realId = await getRealProspectorId();
    if (realId) {
      const supabase = await createSupabaseServerClient();
      draftCount = await dbCountDrafts(supabase, realId);
    } else {
      draftCount = countDraftProspects(worker.id);
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <EmployeSidebar
        workerName={worker.displayName}
        role={worker.role}
        workers={workers}
        currentId={currentId}
        prospects={prospects}
      />

      <div className="flex-1 min-w-0 flex flex-col overflow-y-auto pb-20 lg:pb-0">
        {/* Bandeau confiance — l'employé ne voit que ce qui le concerne (prompt §2.1) */}
        <header className="sticky top-0 z-40 bg-ink text-on-ink px-4 sm:px-6 py-2.5">
          <div className="max-w-3xl mx-auto flex items-center gap-3 text-xs">
            {/* Mobile : menu hamburger (tous les menus + Sécurité + profil + déconnexion). */}
            <EmployeMobileMenu
              workerName={worker.displayName}
              role={worker.role}
              workers={workers}
              currentId={currentId}
            />
            {/* Desktop : bandeau de confiance (la sidebar porte la navigation). */}
            <ShieldCheck size={13} className="text-gold shrink-0 hidden lg:block" />
            <span className="text-on-ink-muted hidden lg:inline">
              Tu ne vois que <strong className="text-on-ink font-medium">tes</strong> tâches et <strong className="text-on-ink font-medium">ton</strong> argent. Chaque dépense se justifie par un reçu.
            </span>
          </div>
        </header>

        <main className="flex-1">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">{children}</div>
        </main>
      </div>

      <EmployeMobileNav role={worker.role} draftCount={draftCount} />
    </div>
  );
}
