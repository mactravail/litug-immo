import { Lock } from 'lucide-react';
import { MustafSidebar } from '@/components/mustaf/MustafSidebar';
import { MustafMobileNav } from '@/components/mustaf/MustafMobileNav';
import { MustafMobileMenu } from '@/components/mustaf/MustafMobileMenu';
import { getMustafProvider } from '@/lib/mustaf/provider';
import { TIER_LABEL } from '@/lib/mustaf/labels';

/**
 * Mustaf (construction) client space — isolated route group, separate from
 * the Sara seller dashboard. Mock-first: no auth gate yet.
 */
export default async function MustafLayout({ children }: { children: React.ReactNode }) {
  const mp = getMustafProvider();
  const project = await mp.getProject();

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <MustafSidebar ownerName={project.ownerName} tierLabel={TIER_LABEL[project.subscriptionTier]} />

      <div className="flex-1 min-w-0 flex flex-col overflow-y-auto pb-20 lg:pb-0">
        {/* Trust strip — funds custodied by the notaire, never by Litug */}
        <header className="sticky top-0 z-40 bg-ink text-on-ink px-4 sm:px-6 py-2.5">
          <div className="max-w-5xl mx-auto flex items-center gap-2 text-xs">
            {/* Mobile : menu hamburger (tous les menus + profil + déconnexion). */}
            <MustafMobileMenu
              ownerName={project.ownerName}
              tierLabel={TIER_LABEL[project.subscriptionTier]}
            />
            {/* Desktop : bandeau de confiance (la sidebar porte la navigation). */}
            <Lock size={13} className="text-gold shrink-0 hidden lg:block" />
            <span className="text-on-ink-muted hidden lg:inline">
              Tiers de confiance construction — chaque franc et chaque photo sont datés, tracés et vérifiés.
            </span>
          </div>
        </header>

        <main className="flex-1">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">{children}</div>
        </main>
      </div>

      <MustafMobileNav />
    </div>
  );
}
