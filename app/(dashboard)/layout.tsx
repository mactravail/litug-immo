import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { SubscriptionBanner } from '@/components/layout/SubscriptionBanner';
import { PendingVerificationBanner } from '@/components/layout/PendingVerificationBanner';
import { GlobalSearch } from '@/components/ui/GlobalSearch';
import { getDataProvider } from '@/lib/data/provider';
import { getAuthenticatedSellerId, getSellerAccount } from '@/lib/supabase-server';
import type { SearchItem } from '@/components/ui/GlobalSearch';
import { formatFcfa } from '@/lib/utils';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const sellerId = await getAuthenticatedSellerId();
  const account = await getSellerAccount();
  const dp = getDataProvider();
  const [seller, lands, leads] = await Promise.all([
    dp.getSeller(sellerId),
    dp.listLands(sellerId),
    dp.listLeads(sellerId),
  ]);

  const searchItems: SearchItem[] = [
    ...lands.map(l => ({
      id:       l.id,
      type:     'terrain' as const,
      title:    l.title,
      subtitle: `${l.zone} · ${formatFcfa(l.priceFcfa)}`,
      href:     `/terrains/${l.id}`,
    })),
    ...leads.map(l => ({
      id:       l.id,
      type:     'client' as const,
      title:    l.name ?? 'Client inconnu',
      subtitle: l.phone ? `${l.phone} · ${l.source}` : l.source,
      href:     `/clients/${l.id}`,
    })),
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <Sidebar
        businessName={seller?.businessName ?? 'Mon compte'}
        subscriptionStatus={seller?.subscriptionStatus ?? 'trial'}
      />
      <div className="flex-1 flex flex-col overflow-y-auto pb-20 lg:pb-0">
        {/* Top bar avec recherche */}
        <header className="sticky top-0 z-40 bg-bg/80 backdrop-blur-sm border-b border-stone-100 px-4 sm:px-6 py-3">
          <GlobalSearch items={searchItems} />
        </header>
        {account.pendingVerification
          ? <PendingVerificationBanner />
          : <SubscriptionBanner status={seller?.subscriptionStatus ?? 'trial'} />}
        <main className="flex-1">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
            {children}
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
