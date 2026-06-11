import Link from 'next/link';
import { Wallet, TrendingUp, Layers, ArrowRight, MapPin, BadgeCheck } from 'lucide-react';
import { getMustafProvider } from '@/lib/mustaf/provider';
import { TIER_LABEL } from '@/lib/mustaf/labels';
import { StatCard } from '@/components/ui/StatCard';
import { PhaseBadge } from '@/components/mustaf/PhaseBadge';
import { FundingBar } from '@/components/mustaf/FundingBar';
import { MetadataBadge } from '@/components/mustaf/MetadataBadge';
import { MediaThumb } from '@/components/mustaf/MediaThumb';
import { EscrowNote } from '@/components/mustaf/Notices';
import { formatFcfa, formatEur } from '@/lib/utils';

export default async function MonProjetPage() {
  const mp = getMustafProvider();
  const [project, escrow, progress, media, company] = await Promise.all([
    mp.getProject(),
    mp.getEscrowSummary(),
    mp.getProgress(),
    mp.getMedia(),
    mp.getCompany(),
  ]);

  const latestMedia = media[0];
  const current = progress.currentPhase;

  return (
    <div className="space-y-8">
      {/* En-tête projet */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-text break-words">Mon projet</h1>
          <p className="text-muted text-sm mt-1 flex items-center gap-1.5">
            <MapPin size={14} className="text-accent" />
            {project.landTitle}
          </p>
          <p className="text-xs text-muted mt-1">
            Identifiant du terrain : <span className="font-mono font-semibold text-accent">{project.landRef}</span>
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gold-light text-ink text-xs font-semibold border border-gold/30">
          <BadgeCheck size={14} className="text-gold" />
          Formule {TIER_LABEL[project.subscriptionTier]}
        </span>
      </div>

      {/* Stats clés */}
      <section className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Avancement" value={`${Math.round(progress.pctComplete)} %`} icon={TrendingUp} variant="blue" sub={`${progress.phasesPaid}/${progress.phasesTotal} phases payées`} />
        <StatCard label="Solde épargne" value={formatFcfa(escrow.balance)} icon={Wallet} variant="success" sub={formatEur(escrow.balance)} />
        <StatCard label="Phase en cours" value={current?.label ?? 'Terminé'} icon={Layers} variant="orange" />
      </section>

      {/* Avancement global */}
      <section className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-serif text-lg font-semibold text-text">Avancement global</h2>
          <span className="text-sm font-semibold text-accent">{Math.round(progress.pctComplete)} %</span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-stone-100 overflow-hidden">
          <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${progress.pctComplete}%` }} />
        </div>
        <p className="text-xs text-muted mt-2">
          Budget total estimé : <span className="font-medium text-text">{formatFcfa(project.totalEstimate)}</span> · {formatEur(project.totalEstimate)}
        </p>
      </section>

      {/* Phase en cours + financement */}
      {current && (
        <section className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <p className="text-xs text-muted uppercase tracking-wider font-semibold">Prochaine phase à financer</p>
              <h2 className="font-serif text-lg font-semibold text-text mt-0.5">{current.label}</h2>
            </div>
            <PhaseBadge status={current.status} />
          </div>
          <FundingBar current={escrow.balance} target={current.estimate} phaseLabel={current.label} />
          <Link href="/projet/epargne" className="inline-flex items-center gap-1 text-sm text-accent font-medium hover:underline">
            Alimenter le compte épargne <ArrowRight size={14} />
          </Link>
        </section>
      )}

      {/* Dernière photo du chantier */}
      {latestMedia && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-lg font-semibold text-text">Dernière photo du chantier</h2>
            <Link href="/projet/chantier" className="text-sm text-accent font-medium hover:underline flex items-center gap-1">
              Tout voir <ArrowRight size={13} />
            </Link>
          </div>
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 grid sm:grid-cols-[200px_1fr] gap-4 items-center">
            <MediaThumb media={latestMedia} className="max-w-[260px]" />
            <div className="space-y-2">
              <p className="text-sm font-semibold text-text">{latestMedia.caption}</p>
              <MetadataBadge media={latestMedia} />
            </div>
          </div>
        </section>
      )}

      {/* Confiance : séquestre + entreprise */}
      <section className="space-y-3">
        <EscrowNote custodianName={escrow.custodianName} />
        <div className="flex items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3">
          <BadgeCheck size={18} className="text-accent shrink-0" />
          <p className="text-xs text-text leading-relaxed">
            Entreprise vérifiée : <span className="font-semibold">{company.name}</span> (note {company.rating}/5) —
            retenue de garantie de <span className="font-semibold">{company.retentionPct}%</span> libérée seulement après vérification finale.
          </p>
        </div>
      </section>
    </div>
  );
}
