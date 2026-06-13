import Link from 'next/link';
import { Landmark, TrendingUp, Clock, PiggyBank, Check, MapPin, ArrowRight, ShieldCheck, Search, Receipt } from 'lucide-react';
import { getMustafProvider } from '@/lib/mustaf/provider';
import { getAccountOptional } from '@/lib/supabase-server';
import { formatFcfa } from '@/lib/utils';
import type { ExpenseCategory } from '@/lib/mustaf/types';

const fmt = (n: number) => new Intl.NumberFormat('fr-FR').format(n);

const CAT_ICON: Record<ExpenseCategory, string> = {
  materials: '🧱',
  labor: '👷🏿',
  transport: '🚚',
  phase_zero: '📐',
  management_fee: '🏷️',
};

const FAM_GRADIENTS = [
  'linear-gradient(135deg,#E2A53F,#b07a1f)',
  'linear-gradient(135deg,#c86b9e,#8a4470)',
  'linear-gradient(135deg,#5fa37a,#2f6b4a)',
  'linear-gradient(135deg,#5B9DF9,#3a6fb0)',
];

function initials(name: string) {
  return name.split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('');
}

function shortDate(iso?: string) {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short' }).format(new Date(iso));
}

export default async function MonProjetPage() {
  const mp = getMustafProvider();
  const [account, project, escrow, progress, phases, expenses, media, participation] = await Promise.all([
    getAccountOptional(),
    mp.getProject(),
    mp.getEscrowSummary(),
    mp.getProgress(),
    mp.getPhases(),
    mp.getExpenses(),
    mp.getMedia(),
    mp.getParticipation(),
  ]);

  const current = progress.currentPhase;
  const latest = media[0];
  const usedPct = project.totalEstimate ? Math.round((escrow.totalReleased / project.totalEstimate) * 100) : 0;
  const remaining = project.totalEstimate - escrow.totalReleased;
  const settledIds = new Set(phases.filter((p) => p.status === 'paid' || p.status === 'completed').map((p) => p.id));

  // Dépenses de construction tracées (hors honoraires/commission) de la dernière phase réglée.
  const lastSettled = phases.find((p) => settledIds.has(p.id));
  const tracked = expenses.filter(
    (e) => e.phaseId === lastSettled?.id && e.category !== 'phase_zero' && e.category !== 'management_fee',
  );
  const trackedTotal = tracked.reduce((s, e) => s + e.amount, 0);

  const fundPct = current && current.estimate > 0 ? Math.min(100, Math.round((escrow.balance / current.estimate) * 100)) : 0;
  const pendingOwner = account?.accountType === 'owner' && account.pendingVerification;

  return (
    <div className="space-y-4">
      {pendingOwner && (
        <div className="m-card" style={{ borderColor: 'rgba(226,165,63,.28)', background: 'var(--m-gold-soft)' }}>
          <p className="text-sm" style={{ color: 'var(--m-txt)' }}>
            Bienvenue, <b>{account!.displayName}</b> 👋 — notre équipe prépare votre accompagnement sur mesure.
            Voici un aperçu de votre futur espace de suivi.
          </p>
        </div>
      )}

      {/* Localisation */}
      <p className="text-[12.5px] flex items-center gap-1.5" style={{ color: 'var(--m-mut)' }}>
        <MapPin size={14} style={{ color: 'var(--m-gold)' }} />
        {project.landTitle}
      </p>

      {/* KPIs */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="m-card">
          <div className="m-kpi-top">
            <span className="m-kpi-lbl">Budget total</span>
            <span className="m-kpi-ic" style={{ background: 'var(--m-gold-soft)' }}><Landmark color="#E2A53F" /></span>
          </div>
          <div className="m-kpi-val m-mono">{fmt(project.totalEstimate)}<span className="m-cur">FCFA</span></div>
          <div className="m-kpi-sub">Plafond validé au devis</div>
        </div>

        <div className="m-card">
          <div className="m-kpi-top">
            <span className="m-kpi-lbl">Utilisé</span>
            <span className="m-kpi-ic" style={{ background: 'var(--m-blue-soft)' }}><TrendingUp color="#5B9DF9" /></span>
          </div>
          <div className="m-kpi-val m-mono">{fmt(escrow.totalReleased)}<span className="m-cur">FCFA</span></div>
          <div className="m-kpi-sub"><span className="m-up">{usedPct}%</span> du budget · factures à l&apos;appui</div>
        </div>

        <div className="m-card">
          <div className="m-kpi-top">
            <span className="m-kpi-lbl">Restant</span>
            <span className="m-kpi-ic" style={{ background: 'var(--m-green-soft)' }}><Clock color="#34C77B" /></span>
          </div>
          <div className="m-kpi-val m-mono">{fmt(remaining)}<span className="m-cur">FCFA</span></div>
          <div className="m-kpi-sub">Libéré phase par phase</div>
        </div>

        <div className="m-card">
          <div className="m-kpi-top">
            <span className="m-kpi-lbl">Solde épargne</span>
            <span className="m-kpi-ic" style={{ background: 'var(--m-gold-soft)' }}><PiggyBank color="#E2A53F" /></span>
          </div>
          <div className="m-kpi-val m-mono">{fmt(escrow.balance)}<span className="m-cur">FCFA</span></div>
          <div className="m-kpi-sub">{current ? `Prêt à financer : ${current.label}` : 'Projet terminé'}</div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        {/* Avancement du chantier */}
        <div className="m-card">
          <div className="m-sec-h">
            <div className="m-sec-t">Avancement du chantier</div>
            <div className="m-sec-s">{Math.round(progress.pctComplete)} % · {progress.phasesPaid}/{progress.phasesTotal} phases</div>
          </div>
          <div className="m-bar"><i style={{ width: `${progress.pctComplete}%` }} /></div>
          <div className="m-timeline" style={{ marginTop: 20 }}>
            {phases.map((p, i) => {
              const done = settledIds.has(p.id);
              const cur = current?.id === p.id;
              return (
                <div key={p.id} className={`m-ph ${done ? 'm-done' : ''} ${cur ? 'm-cur' : ''}`}>
                  {i < phases.length - 1 && <span className="m-ln" />}
                  <div className="m-dot">
                    {done && <Check className="text-[#06210f]" />}
                    {cur && <span className="m-pulse" />}
                  </div>
                  <div className="m-ph-nm">{p.label}</div>
                  <div className="m-ph-st">{done ? 'Terminée' : cur ? 'En cours' : 'À venir'}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Phase en cours — financement */}
        {current && (
          <div className="m-card">
            <div className="m-sec-h">
              <div className="m-sec-t">Phase en cours — {current.label}</div>
              <span className="m-pill m-warn">À financer</span>
            </div>
            <div className="text-[12px] mb-1.5" style={{ color: 'var(--m-mut)' }}>Financement de la phase</div>
            <div className="m-bar m-bar-g"><i style={{ width: `${fundPct}%` }} /></div>
            <div className="m-fin-row">
              <span className="m-a">Collecté</span>
              <span className="m-b m-mono">{fmt(escrow.balance)} / {fmt(current.estimate)} FCFA</span>
            </div>
            <div className="m-fin-row" style={{ marginTop: 8, paddingTop: 10, borderTop: '1px solid var(--m-line)' }}>
              <span className="m-a">↳ Démarre quand la phase est financée</span>
              <span className="m-pill m-ok">Inspecteur prêt</span>
            </div>
            <Link href="/projet/epargne" className="inline-flex items-center gap-1 text-[12.5px] font-semibold mt-3" style={{ color: 'var(--m-gold)' }}>
              Alimenter le compte épargne <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {/* Dépenses tracées */}
        <div className="m-card">
          <div className="m-sec-h">
            <div className="m-sec-t">Dépenses tracées</div>
            <div className="m-sec-s">Phase {lastSettled?.label ?? '—'} · zéro marge matériaux</div>
          </div>
          {tracked.map((e) => (
            <div key={e.id} className="m-exp">
              <div className="m-l">
                <div className="m-ico">{CAT_ICON[e.category]}</div>
                <div className="min-w-0">
                  <div className="m-nm">{e.label}</div>
                  <div className="m-meta">
                    {e.invoiceUrl && <span className="m-fac">✓ Facture</span>}
                    Vérifié par l&apos;inspecteur
                  </div>
                </div>
              </div>
              <div className="m-amt m-mono">{fmt(e.amount)}</div>
            </div>
          ))}
          <div className="m-exp-foot">
            <span>Total {lastSettled?.label ?? ''}</span>
            <span className="m-mono" style={{ fontWeight: 700, color: 'var(--m-txt)' }}>{formatFcfa(trackedTotal)}</span>
          </div>
          <Link href="/projet/depenses" className="inline-flex items-center gap-1 text-[12.5px] font-semibold mt-3" style={{ color: 'var(--m-gold)' }}>
            Toutes les dépenses <ArrowRight size={14} />
          </Link>
        </div>

        {/* Dernière photo du chantier */}
        {latest && (
          <div className="m-card">
            <div className="m-sec-h">
              <div className="m-sec-t">Dernière photo du chantier</div>
              <div className="m-sec-s">Datée &amp; géolocalisée</div>
            </div>
            <div className="m-photo">
              <div className="m-sky" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {latest.url && latest.url !== '#' && <img src={latest.url} alt={latest.caption ?? ''} />}
              {latest.geo && (
                <div className="m-geo">
                  <svg viewBox="0 0 24 24"><path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>
                  <span>
                    {latest.geo.lat.toFixed(4)}°N · {Math.abs(latest.geo.lng).toFixed(4)}°O · {shortDate(latest.capturedAt)}
                  </span>
                </div>
              )}
              {latest.metadataStatus === 'verified' && (
                <div className="m-geo-badge"><span className="m-d" />Authentique</div>
              )}
            </div>
            <p className="text-[12.5px] font-medium mt-3" style={{ color: 'var(--m-txt)' }}>{latest.caption}</p>
          </div>
        )}

        {/* Famille & financement */}
        <div className="m-card">
          <div className="m-sec-h">
            <div className="m-sec-t">Famille &amp; financement</div>
            <div className="m-sec-s">Participation visible</div>
          </div>
          {participation.map((p, i) => (
            <div key={p.member.id} className="m-fam">
              <div className="m-l">
                <div className="m-av" style={{ width: 30, height: 30, fontSize: 11, background: FAM_GRADIENTS[i % FAM_GRADIENTS.length] }}>
                  {initials(p.member.displayName)}
                </div>
                <div className="min-w-0">
                  <div className="m-nm">
                    {p.member.displayName}
                    {p.member.userId === project.ownerId && <span style={{ color: 'var(--m-mut2)', fontWeight: 400 }}> (vous)</span>}
                  </div>
                  <div className="m-rl">Participation {p.pct.toFixed(0)} % · {shortDate(p.member.joinedAt)}</div>
                </div>
              </div>
              <div className="m-amt m-mono">+{fmt(p.total)}</div>
            </div>
          ))}
          <p className="text-[10.5px] leading-snug mt-3" style={{ color: 'var(--m-mut2)' }}>
            Ceci est un relevé des contributions, pas un titre de propriété. La propriété est établie par acte notarié.
          </p>
        </div>
      </div>

      {/* Trust strip */}
      <div className="m-card m-tstrip">
        <div className="m-tcell">
          <div className="m-ic" style={{ background: 'var(--m-green-soft)' }}><ShieldCheck color="#34C77B" /></div>
          <div><div className="m-t">Notaire séquestre</div><div className="m-s">Fonds libérés après inspection</div></div>
        </div>
        <div className="m-tcell">
          <div className="m-ic" style={{ background: 'var(--m-blue-soft)' }}><Search color="#5B9DF9" /></div>
          <div><div className="m-t">Inspecteur indépendant</div><div className="m-s">Contrôle avant chaque paiement</div></div>
        </div>
        <div className="m-tcell">
          <div className="m-ic" style={{ background: 'var(--m-gold-soft)' }}><Receipt color="#E2A53F" /></div>
          <div><div className="m-t">Zéro marge matériaux</div><div className="m-s">Factures réelles à l&apos;appui</div></div>
        </div>
      </div>

      <p className="text-[11px] text-center" style={{ color: 'var(--m-mut2)' }}>
        Tiers de confiance construction — chaque franc et chaque photo sont datés, tracés et vérifiés. Données de démonstration.
      </p>
    </div>
  );
}
