import './mustaf-theme.css';
import { Bell } from 'lucide-react';
import { MustafSidebar } from '@/components/mustaf/MustafSidebar';
import { MustafMobileNav } from '@/components/mustaf/MustafMobileNav';
import { MustafMobileMenu } from '@/components/mustaf/MustafMobileMenu';
import { AnomalyButton } from '@/components/mustaf/AnomalyButton';
import { getMustafProvider } from '@/lib/mustaf/provider';
import { TIER_LABEL } from '@/lib/mustaf/labels';

function initials(name: string) {
  return name.split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('');
}

/**
 * Mustaf (construction) client space — THÈME SOMBRE (charte founder, scopé
 * `.mustaf-shell`, isolé du reste monochrome). Route group séparé du
 * dashboard vendeur Sara. Mock-first : pas encore de garde d'auth.
 */
export default async function MustafLayout({ children }: { children: React.ReactNode }) {
  const mp = getMustafProvider();
  const project = await mp.getProject();
  const tierLabel = TIER_LABEL[project.subscriptionTier];

  return (
    <div className="mustaf-shell min-h-screen lg:pl-64">
      <MustafSidebar
        ownerName={project.ownerName}
        tierLabel={tierLabel}
        projectName={project.landTitle.replace(/^Terrain TF\s*—\s*/, '')}
      />

      <div className="flex min-h-screen flex-col">
        {/* Topbar */}
        <header className="m-topbar sticky top-0 z-40 min-h-16 flex items-center justify-between px-4 sm:px-6 pt-3 pb-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <MustafMobileMenu ownerName={project.ownerName} tierLabel={tierLabel} />
            <span className="text-[15px] font-semibold truncate" style={{ color: 'var(--m-txt)' }}>
              {project.landTitle.replace(/^Terrain TF\s*—\s*/, '')}
            </span>
            <span className="m-chip hidden sm:inline-flex">{project.landRef}</span>
            <span className="m-badge-gold hidden md:inline-flex">Formule {tierLabel}</span>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <AnomalyButton variant="topbar" />
            <div className="m-icon-btn hidden sm:grid">
              <Bell />
            </div>
            <div
              className="m-av"
              style={{ width: 36, height: 36, fontSize: 13, background: 'linear-gradient(135deg,#E2A53F,#b07a1f)' }}
            >
              {initials(project.ownerName)}
            </div>
          </div>
        </header>

        <main className="flex-1">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10 pb-24 lg:pb-12">{children}</div>
        </main>
      </div>

      <MustafMobileNav />
    </div>
  );
}
