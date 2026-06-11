import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft, MapPin, FileText, Wallet, ReceiptText, Camera, Users,
  Banknote, ShieldCheck, BadgeCheck,
} from 'lucide-react';
import { getMustafProvider } from '@/lib/mustaf/provider';
import { getAdminProvider } from '@/lib/admin/provider';
import { TIER_LABEL, EXPENSE_CATEGORY_LABEL } from '@/lib/mustaf/labels';
import { PhaseBadge } from '@/components/mustaf/PhaseBadge';
import { MetadataBadge } from '@/components/mustaf/MetadataBadge';
import { EscrowNote, ContributionsDisclaimer } from '@/components/mustaf/Notices';
import { SubscriptionBadge } from '@/components/admin/SubscriptionBadge';
import { SubscriptionActions } from '@/components/admin/SubscriptionActions';
import { PhaseStatusForm } from '@/components/admin/PhaseStatusForm';
import { FormButton } from '@/components/admin/FormButton';
import { AddInvoiceForm } from '@/components/admin/AddInvoiceForm';
import { AddMediaForm } from '@/components/admin/AddMediaForm';
import { releaseFunds } from '@/app/(admin)/admin/actions';
import { formatFcfa, formatEur, formatDateShort } from '@/lib/utils';

const RELEASABLE = ['inspected', 'awaiting_release'];

export default async function AdminMustafProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const mp = getMustafProvider();
  const ap = getAdminProvider();

  const project = await mp.getProject();
  if (project.id !== id) notFound();

  const [escrow, phases, expenses, media, participation, deposits, documents, inspections, sub] =
    await Promise.all([
      mp.getEscrowSummary(), mp.getPhases(), mp.getExpenses(), mp.getMedia(),
      mp.getParticipation(), mp.getDeposits(), mp.getDocuments(), mp.getInspections(),
      ap.getSubscriptionBySubject(project.id),
    ]);

  const phaseOptions = phases.map(p => ({ id: p.id, label: p.label }));
  const phaseLabel = (phaseId: string) => phases.find(p => p.id === phaseId)?.label ?? '—';

  return (
    <div className="space-y-8">
      <Link href="/admin/mustaf" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-text transition-colors">
        <ArrowLeft size={15} /> Retour aux projets
      </Link>

      {/* Header + abonnement */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-display text-2xl font-semibold text-text">{project.ownerName}</h1>
            {sub && <SubscriptionBadge status={sub.status} />}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gold-light text-ink border border-gold/30 text-xs font-semibold">
              <BadgeCheck size={13} className="text-gold" /> {TIER_LABEL[project.subscriptionTier]}
            </span>
          </div>
          <p className="text-sm text-muted mt-1 flex items-center gap-1.5"><MapPin size={14} className="text-accent" /> {project.landTitle}</p>
          <p className="text-xs text-muted mt-1">Identifiant du terrain : <span className="font-mono font-semibold text-accent">{project.landRef}</span></p>
        </div>
        {sub && <SubscriptionActions id={sub.id} status={sub.status} subjectName={project.ownerName} />}
      </div>

      {/* Client & terrain + abonnement chiffres */}
      <section className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
          <p className="text-xs text-muted">Budget total estimé</p>
          <p className="font-display text-2xl font-semibold text-text mt-1">{formatFcfa(project.totalEstimate)}</p>
          <p className="text-xs text-muted">{formatEur(project.totalEstimate)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
          <p className="text-xs text-muted">Forfait Phase 0</p>
          <p className="font-display text-2xl font-semibold text-text mt-1">{formatFcfa(project.phaseZeroFee)}</p>
          <p className="text-xs text-muted">plan + permis + étude de sol</p>
        </div>
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
          <p className="text-xs text-muted">Zone</p>
          <p className="font-display text-2xl font-semibold text-text mt-1">{project.zone}</p>
          <p className="text-xs text-muted">Palier {TIER_LABEL[project.subscriptionTier]}</p>
        </div>
      </section>

      {/* Dossier Phase 0 */}
      <section>
        <h2 className="font-display text-lg font-semibold text-text mb-3 flex items-center gap-2"><FileText size={17} className="text-accent" /> Dossier</h2>
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm divide-y divide-stone-100">
          {documents.map(doc => (
            <div key={doc.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-text">{doc.label}{doc.phaseLabel ? <span className="text-muted"> · {doc.phaseLabel}</span> : null}</p>
                <p className="text-[11px] text-muted uppercase tracking-wide">{doc.category}</p>
              </div>
              <a href={doc.url ?? '#'} className="text-xs font-semibold text-accent hover:underline shrink-0">Consulter</a>
            </div>
          ))}
        </div>
      </section>

      {/* Phases + déblocage (maker-checker) */}
      <section>
        <h2 className="font-display text-lg font-semibold text-text mb-3">Phases</h2>
        <div className="space-y-3">
          {phases.map(phase => {
            const releasable = RELEASABLE.includes(phase.status);
            const insp = inspections.find(i => i.phaseId === phase.id && i.result === 'pass' && !i.prePour);
            return (
              <div key={phase.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 space-y-3">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <p className="text-sm font-semibold text-text">{phase.order}. {phase.label}</p>
                    <p className="text-[11px] text-muted">Devis {formatFcfa(phase.estimate)} · {formatEur(phase.estimate)} · validité {formatDateShort(phase.validityUntil)}</p>
                  </div>
                  <PhaseBadge status={phase.status} />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-stone-100">
                  <PhaseStatusForm projectId={project.id} phaseId={phase.id} current={phase.status} />

                  {releasable && (
                    <div className="flex flex-col items-end gap-1">
                      <FormButton
                        action={releaseFunds}
                        fields={{ projectId: project.id, phaseId: phase.id }}
                        className="text-xs font-semibold bg-accent text-white px-3 py-1.5 rounded-lg hover:bg-accent-bright transition-colors inline-flex items-center gap-1.5"
                        confirm={`Débloquer ${formatFcfa(phase.estimate)} pour la phase « ${phase.label} » ?`}
                        pendingLabel="Déblocage…"
                      >
                        <Banknote size={13} /> Débloquer les fonds
                      </FormButton>
                      <span className="text-[10px] text-muted max-w-[16rem] text-right">
                        Maker-checker : l’inspecteur {insp?.inspectorName ?? '—'} a certifié ; un contrôleur distinct débloque.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Séquestre */}
      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-text flex items-center gap-2"><Wallet size={17} className="text-accent" /> Compte séquestre</h2>
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 grid sm:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-muted">Solde</p>
            <p className="font-display text-2xl font-semibold text-text mt-1">{formatFcfa(escrow.balance)}</p>
            <p className="text-xs text-muted">{formatEur(escrow.balance)}</p>
          </div>
          <div>
            <p className="text-xs text-muted">Total versé</p>
            <p className="font-display text-2xl font-semibold text-text mt-1">{formatFcfa(escrow.totalDeposited)}</p>
          </div>
          <div>
            <p className="text-xs text-muted">{escrow.nextPhase ? `Manque pour « ${escrow.nextPhase.label} »` : 'Prochaine phase'}</p>
            <p className="font-display text-2xl font-semibold text-text mt-1">{escrow.nextPhase ? formatFcfa(escrow.shortfall) : '—'}</p>
          </div>
        </div>
        <EscrowNote custodianName={escrow.custodianName} />
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm divide-y divide-stone-100">
          {deposits.map(dep => (
            <div key={dep.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
              <span className="text-text">{dep.contributorName} {dep.note ? <span className="text-muted">· {dep.note}</span> : null}</span>
              <span className="text-muted">+{formatFcfa(dep.amount)} · {formatDateShort(dep.depositedAt)}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Preuves : dépenses + médias */}
      <section>
        <h2 className="font-display text-lg font-semibold text-text mb-3 flex items-center gap-2"><ReceiptText size={17} className="text-accent" /> Dépenses (ligne par ligne)</h2>
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm divide-y divide-stone-100">
          {expenses.map(exp => (
            <div key={exp.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-text truncate">{exp.label}</p>
                <p className="text-[11px] text-muted">{EXPENSE_CATEGORY_LABEL[exp.category]} · {phaseLabel(exp.phaseId)}{exp.supplierName ? ` · ${exp.supplierName}` : ''}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-text">{formatFcfa(exp.amount)}</p>
                {exp.invoiceUrl && <a href={exp.invoiceUrl} className="text-[11px] text-accent hover:underline">Facture</a>}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-text mb-3 flex items-center gap-2"><Camera size={17} className="text-accent" /> Photos & vidéos géolocalisées</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {media.map(m => (
            <div key={m.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 space-y-2">
              <p className="text-sm font-medium text-text">{m.caption ?? 'Média de chantier'}</p>
              <p className="text-[11px] text-muted">{phaseLabel(m.phaseId)}</p>
              <MetadataBadge media={m} />
            </div>
          ))}
        </div>
      </section>

      {/* Contributions familiales */}
      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-text flex items-center gap-2"><Users size={17} className="text-accent" /> Contributions familiales</h2>
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm divide-y divide-stone-100">
          {participation.map(p => (
            <div key={p.member.id} className="px-4 py-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-text">{p.member.displayName}</span>
                <span className="text-muted">{formatFcfa(p.total)} · <span className="font-semibold text-accent">{Math.round(p.pct)} %</span></span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-stone-100 overflow-hidden mt-2">
                <div className="h-full rounded-full bg-accent" style={{ width: `${p.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
        <ContributionsDisclaimer />
      </section>

      {/* Actions terrain */}
      <section className="space-y-4">
        <h2 className="font-display text-lg font-semibold text-text">Actions sur le chantier</h2>

        <details className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
          <summary className="px-5 py-3 text-sm font-semibold text-text cursor-pointer flex items-center gap-2 hover:bg-stone-50">
            <ReceiptText size={16} className="text-accent" /> Ajouter une facture
          </summary>
          <div className="px-5 pb-5 pt-1 border-t border-stone-100"><AddInvoiceForm projectId={project.id} phases={phaseOptions} /></div>
        </details>

        <details className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
          <summary className="px-5 py-3 text-sm font-semibold text-text cursor-pointer flex items-center gap-2 hover:bg-stone-50">
            <Camera size={16} className="text-accent" /> Ajouter une photo / vidéo
          </summary>
          <div className="px-5 pb-5 pt-1 border-t border-stone-100"><AddMediaForm projectId={project.id} phases={phaseOptions} /></div>
        </details>
      </section>

      <p className="flex items-start gap-2 text-[11px] text-muted">
        <ShieldCheck size={14} className="text-accent mt-0.5 shrink-0" />
        Tout ce qui est ajouté ici apparaît automatiquement dans l’espace de lecture du client — mêmes données, portes différentes. Séquestre simulé (aucun vrai paiement).
      </p>
    </div>
  );
}
