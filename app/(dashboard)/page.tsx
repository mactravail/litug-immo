import Link from 'next/link';
import { Map, Users, ShieldCheck, Clock, TrendingUp, AlertCircle, ArrowRight, CreditCard, CalendarDays } from 'lucide-react';
import { getDataProvider } from '@/lib/data/provider';
import { getAuthenticatedSellerId } from '@/lib/supabase-server';
import { StatCard } from '@/components/ui/StatCard';
import { LandCard } from '@/components/ui/LandCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatFcfa, formatDate, formatVisitDate, formatTime, isUpcoming } from '@/lib/utils';

const SUBSCRIPTION_CONFIG = {
  trial:    { label: 'Essai gratuit',       bg: 'bg-amber-50',      text: 'text-amber-700',  border: 'border-amber-200' },
  active:   { label: 'Abonnement actif',    bg: 'bg-accent-light',  text: 'text-accent',     border: 'border-accent/20' },
  past_due: { label: 'Paiement en retard',  bg: 'bg-red-50',        text: 'text-red-700',    border: 'border-red-200' },
};

export default async function DashboardPage() {
  const sellerId = await getAuthenticatedSellerId();
  const dp = getDataProvider();
  const [seller, stats, recentLands, recentLeads, allVisits] = await Promise.all([
    dp.getSeller(sellerId),
    dp.getStats(sellerId),
    dp.listLands(sellerId),
    dp.listLeads(sellerId),
    dp.listVisits(sellerId),
  ]);

  const topLands = recentLands.slice(0, 3);
  const topLeads = recentLeads.slice(0, 5);

  const upcomingVisits = allVisits
    .filter(v => isUpcoming(v.visitDate) && v.status !== 'annulee')
    .slice(0, 3);

  const landsMap = Object.fromEntries(recentLands.map(l => [l.id, l]));
  const leadsMap = Object.fromEntries(recentLeads.map(l => [l.id, l]));
  const sub = seller ? SUBSCRIPTION_CONFIG[seller.subscriptionStatus] : null;

  return (
    <div className="space-y-10">
      {/* En-tête + badge abonnement */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-text">
            Bonjour, {seller?.businessName ?? 'Vendeur'}
          </h1>
          <p className="text-muted text-sm mt-1">Voici un aperçu de votre activité.</p>
        </div>
        {sub && (
          <Link
            href="/parametres"
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-sm font-semibold transition-opacity hover:opacity-80 ${sub.bg} ${sub.text} ${sub.border}`}
          >
            <CreditCard size={14} />
            {sub.label}
          </Link>
        )}
      </div>

      {/* Stat cards avec couleurs distinctes */}
      <section className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="Terrains disponibles" value={stats.landsAvailable} icon={Map}        variant="blue" />
        <StatCard label="En cours de vente"    value={stats.landsInSale}    icon={TrendingUp} variant="violet" />
        <StatCard label="Terrains vendus"      value={stats.landsSold}      icon={Map}        variant="orange" />
        <StatCard label="Vérifiés"             value={stats.landsVerified}  icon={ShieldCheck} variant="success" />
        <StatCard label="À vérifier"           value={stats.landsToVerify}  icon={Clock}      variant="yellow" />
        <StatCard label="Leads qualifiés"      value={stats.leadsQualified} icon={Users}      variant="sky" sub={`sur ${stats.leadsTotal} total`} />
      </section>

      {stats.landsToVerify > 0 && (
        <Link
          href="/terrains?verificationStatus=a_verifier"
          className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-2xl p-4 hover:bg-amber-100/60 transition-colors group"
        >
          <AlertCircle size={18} className="text-amber-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">
              {stats.landsToVerify} terrain{stats.landsToVerify > 1 ? 's' : ''} en attente de vérification
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              Notre notaire partenaire va procéder au contrôle à la Conservation Foncière.
            </p>
          </div>
          <ArrowRight size={15} className="text-amber-600 mt-0.5 shrink-0 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      )}

      {/* Prochaines visites */}
      {upcomingVisits.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-xl font-semibold text-text">Prochaines visites</h2>
            <Link href="/visites" className="text-sm text-accent font-medium hover:underline flex items-center gap-1">
              Voir tout <ArrowRight size={13} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {upcomingVisits.map(v => {
              const land = landsMap[v.landId];
              const lead = v.leadId ? leadsMap[v.leadId] : undefined;
              const isConfirmed = v.status === 'confirmee';
              return (
                <Link
                  key={v.id}
                  href="/visites"
                  className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 hover:border-accent/30 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="p-2 rounded-xl bg-accent-light">
                      <CalendarDays size={14} className="text-accent" />
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${isConfirmed ? 'bg-accent-light text-accent' : 'bg-sky-50 text-sky-700'}`}>
                      {isConfirmed ? 'Confirmée' : 'À venir'}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-text capitalize mt-2">
                    {formatVisitDate(v.visitDate)}
                  </p>
                  <p className="text-xs text-muted">{formatTime(v.visitDate)}</p>
                  {land && <p className="text-xs text-text font-medium mt-1.5 truncate">{land.zone}</p>}
                  {lead && <p className="text-xs text-muted truncate">{lead.name}</p>}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Terrains récents */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl font-semibold text-text">Derniers terrains</h2>
          <Link href="/terrains" className="text-sm text-accent font-medium hover:underline flex items-center gap-1">
            Voir tout <ArrowRight size={13} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {topLands.map(land => <LandCard key={land.id} land={land} />)}
        </div>
      </section>

      {/* Derniers leads */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl font-semibold text-text">Derniers clients</h2>
          <Link href="/clients" className="text-sm text-accent font-medium hover:underline flex items-center gap-1">
            Voir tout <ArrowRight size={13} />
          </Link>
        </div>
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-50 bg-stone-50/50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Client</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wider hidden md:table-cell">Budget</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wider hidden sm:table-cell">Source</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Statut</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wider hidden lg:table-cell">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {topLeads.map(lead => (
                <tr key={lead.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <Link href={`/clients/${lead.id}`} className="font-medium text-text hover:text-accent transition-colors">
                      {lead.name ?? 'Inconnu'}
                    </Link>
                    {lead.phone && <p className="text-xs text-muted">{lead.phone}</p>}
                  </td>
                  <td className="px-5 py-3.5 text-muted hidden md:table-cell">
                    {lead.budgetFcfa ? formatFcfa(lead.budgetFcfa) : '—'}
                  </td>
                  <td className="px-5 py-3.5 hidden sm:table-cell">
                    <span className="capitalize text-muted text-xs">{lead.source}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge type="lead" status={lead.status} />
                  </td>
                  <td className="px-5 py-3.5 text-muted text-xs hidden lg:table-cell">
                    {formatDate(lead.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
