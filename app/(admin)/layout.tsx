import { ShieldCheck } from 'lucide-react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminMobileNav } from '@/components/admin/AdminMobileNav';
import { ADMIN_USER_NAME } from '@/lib/admin/provider';

/**
 * Admin back-office — 3rd isolated route group (alongside the Sara seller
 * dashboard and the Mustaf client space). Desktop-first, responsive.
 * Access is reserved to role `admin` (proxy.ts + RLS once Supabase is wired;
 * open in mock mode for the demo, exactly like /projet).
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-bg">
      <AdminSidebar adminName={ADMIN_USER_NAME} />

      <div className="flex-1 flex flex-col overflow-auto pb-20 lg:pb-0">
        {/* Trust strip — every sensitive action is traced in the audit log. */}
        <header className="sticky top-0 z-40 bg-ink text-on-ink px-4 sm:px-6 py-2.5">
          <div className="max-w-6xl mx-auto flex items-center gap-2 text-xs">
            <ShieldCheck size={13} className="text-gold shrink-0" />
            <span className="text-on-ink-muted">
              Poste de commande Litug — chaque action sensible est tracée dans le journal d’audit.
            </span>
          </div>
        </header>

        <main className="flex-1">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">{children}</div>
        </main>
      </div>

      <AdminMobileNav />
    </div>
  );
}
