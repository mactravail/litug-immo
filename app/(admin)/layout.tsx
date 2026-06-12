import { ShieldCheck, LogOut } from 'lucide-react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminMobileNav } from '@/components/admin/AdminMobileNav';
import { ADMIN_USER_NAME } from '@/lib/admin/provider';
import { countPendingAccounts } from '@/lib/admin/pending-accounts';
import { logout } from '@/app/(auth)/login/actions';

/**
 * Admin back-office — 3rd isolated route group (alongside the Sara seller
 * dashboard and the Mustaf client space). Desktop-first, responsive.
 * Access is reserved to role `admin` (proxy.ts + RLS once Supabase is wired;
 * open in mock mode for the demo, exactly like /projet).
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Pastille « Demandes » : nombre de comptes en attente de validation (tolérant à 0).
  const pendingCount = await countPendingAccounts();

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <AdminSidebar adminName={ADMIN_USER_NAME} pendingCount={pendingCount} />

      <div className="flex-1 flex flex-col overflow-y-auto pb-20 lg:pb-0">
        {/* Trust strip — every sensitive action is traced in the audit log. */}
        <header className="sticky top-0 z-40 bg-ink text-on-ink px-4 sm:px-6 py-2.5">
          <div className="max-w-6xl mx-auto flex items-center gap-3 text-xs">
            <ShieldCheck size={13} className="text-gold shrink-0" />
            <span className="text-on-ink-muted">
              Poste de commande Litug — chaque action sensible est tracée dans le journal d’audit.
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
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">{children}</div>
        </main>
      </div>

      <AdminMobileNav pendingCount={pendingCount} />
    </div>
  );
}
