import { Users } from 'lucide-react';
import { getMustafProvider } from '@/lib/mustaf/provider';
import { PageHeader } from '@/components/ui/PageHeader';
import { ContributionsDisclaimer } from '@/components/mustaf/Notices';
import { formatFcfa, formatEur } from '@/lib/utils';

function initials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('');
}

export default async function ContributionsPage() {
  const mp = getMustafProvider();
  const [participation, escrow] = await Promise.all([
    mp.getParticipation(),
    mp.getEscrowSummary(),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Contributions de la famille"
        breadcrumbs={[{ label: 'Mon projet', href: '/projet' }, { label: 'Contributions' }]}
      />

      <ContributionsDisclaimer />

      {/* Total versé */}
      <section className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-accent-light flex items-center justify-center shrink-0">
          <Users size={20} className="text-accent" />
        </div>
        <div>
          <p className="text-sm text-muted">Total versé par la famille</p>
          <p className="font-display text-2xl font-semibold text-text">{formatFcfa(escrow.totalDeposited)}</p>
          <p className="text-xs text-muted">{formatEur(escrow.totalDeposited)}</p>
        </div>
      </section>

      {/* Répartition des contributions */}
      <section className="space-y-3">
        {participation.map(({ member, total, pct }) => (
          <div key={member.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
            <div className="flex items-center gap-3 mb-2.5">
              <div className="w-9 h-9 rounded-full bg-accent-light flex items-center justify-center text-accent text-xs font-bold shrink-0">
                {initials(member.displayName)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-text truncate">{member.displayName}</p>
                <p className="text-xs text-muted">{formatFcfa(total)} · {formatEur(total)}</p>
              </div>
              <p className="text-lg font-display font-semibold text-accent shrink-0">{pct.toFixed(1)} %</p>
            </div>
            <div className="h-2 w-full rounded-full bg-stone-100 overflow-hidden">
              <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>
        ))}
      </section>

      <p className="text-xs text-muted">
        Le pourcentage de participation est recalculé à chaque versement. Il reflète la part de chacun dans le
        financement, et non un droit de propriété.
      </p>
    </div>
  );
}
