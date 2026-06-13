import Link from 'next/link';
import { Users, BadgeCheck, MessageSquare, Clock, ArrowRight, AlertCircle } from 'lucide-react';
import { getDataProvider } from '@/lib/data/provider';
import { getAuthenticatedSellerId, getSellerAccount } from '@/lib/supabase-server';
import { formatFcfa, isUpcoming } from '@/lib/utils';
import type { Land, LeadStatus } from '@/lib/data/types';

/* --- Helpers d'affichage (sémantique foncière conservée) --- */

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#5fa37a,#2f6b4a)',
  'linear-gradient(135deg,#c86b9e,#8a4470)',
  'linear-gradient(135deg,#5B9DF9,#3a6fb0)',
  'linear-gradient(135deg,#d99a3f,#a9701f)',
  'linear-gradient(135deg,#7d6acb,#4c3f8a)',
];

function initials(name?: string) {
  if (!name) return '?';
  return name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('');
}

// Masque le numéro : préfixe + 2 derniers chiffres.
function maskPhone(phone?: string) {
  if (!phone) return '';
  const digits = phone.replace(/\s/g, '');
  if (digits.length < 6) return phone;
  return `${digits.slice(0, 4)} •• ••• ${digits.slice(-2)}`;
}

// Badge foncier — couleurs sémantiques (TF vert · Bail or · Délib rouge).
function foncierBadge(land: Land): { label: string; cls: string } {
  const base = { tf: 'TF', bail: 'Bail', deliberation: 'Délib.' }[land.documentType];
  const cls = { tf: 'tf', bail: 'bail', deliberation: 'delib' }[land.documentType];
  const label = land.verificationStatus === 'verifie' ? `${base} vérifié` : base;
  return { label, cls };
}

// Pipeline commercial → pill + score d'intérêt.
const PIPELINE: Record<LeadStatus, { pill: string; pillCls: string; score: string; scoreCls: string }> = {
  qualifie:   { pill: 'Prêt à visiter',  pillCls: 'visit', score: '🔥 Chaud', scoreCls: 'hot' },
  en_contact: { pill: 'En négociation',  pillCls: 'nego',  score: '🔥 Chaud', scoreCls: 'hot' },
  converti:   { pill: 'Converti',        pillCls: 'visit', score: '🔥 Chaud', scoreCls: 'hot' },
  nouveau:    { pill: 'À rappeler',      pillCls: 'call',  score: 'Tiède',    scoreCls: 'warm' },
  perdu:      { pill: 'Perdu',           pillCls: 'lost',  score: 'Froid',    scoreCls: 'cold' },
};

const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

export default async function DashboardPage() {
  const sellerId = await getAuthenticatedSellerId();
  const account = await getSellerAccount();
  const dp = getDataProvider();
  const [stats, recentLands, recentLeads, allVisits] = await Promise.all([
    dp.getStats(sellerId),
    dp.listLands(sellerId),
    dp.listLeads(sellerId),
    dp.listVisits(sellerId),
  ]);

  const topLands = recentLands.slice(0, 3);
  const topLeads = recentLeads.slice(0, 5);

  const upcomingVisits = allVisits.filter(v => isUpcoming(v.visitDate) && v.status !== 'annulee');
  const landsMap = Object.fromEntries(recentLands.map(l => [l.id, l] as const));

  // KPI — nouveaux prospects ce mois + delta vs mois dernier
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const leadsThisMonth = recentLeads.filter(l => new Date(l.createdAt) >= monthStart).length;
  const leadsPrevMonth = recentLeads.filter(l => {
    const d = new Date(l.createdAt);
    return d >= prevMonthStart && d < monthStart;
  }).length;
  const delta = leadsPrevMonth > 0 ? Math.round(((leadsThisMonth - leadsPrevMonth) / leadsPrevMonth) * 100) : null;

  // Graphe — prospects créés par jour, semaine en cours (lundi → dimanche)
  const dayMs = 86_400_000;
  const dow = (now.getDay() + 6) % 7; // 0 = lundi
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dow);
  const week = WEEKDAYS.map((_, i) => {
    const start = new Date(monday.getTime() + i * dayMs);
    const end = new Date(start.getTime() + dayMs);
    return recentLeads.filter(l => {
      const d = new Date(l.createdAt);
      return d >= start && d < end;
    }).length;
  });
  const weekMax = Math.max(...week, 1);
  const weekTotal = week.reduce((a, b) => a + b, 0);

  // Activité Sara (dérivée des vraies données)
  const transferred = recentLeads.filter(l => l.status === 'converti' || l.status === 'en_contact').length;
  const interestedCount = (landId: string) => recentLeads.filter(l => l.interestedLandId === landId).length;

  return (
    <div className="space-y-6">
      {/* Bandeau compte en attente de validation */}
      {account.pendingVerification && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500/15 shrink-0">
              <Clock size={18} className="text-amber-400" />
            </div>
            <div className="min-w-0">
              <h2 className="font-serif text-base font-semibold text-amber-200">
                Bienvenue, {account.displayName} 👋
              </h2>
              <p className="text-sm text-amber-200/80 mt-1.5 leading-relaxed">
                Ton compte est créé, mais notre équipe doit d&apos;abord <b>vérifier ton paiement</b>{' '}
                avant de l&apos;activer (24&nbsp;h max). Pour l&apos;instant tu ne peux rien publier.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* En-tête + toggle Sara */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight" style={{ color: 'var(--s-txt)' }}>
            Bonjour, {account.displayName ?? 'Vendeur'} 👋
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--s-mut)' }}>
            Sara a qualifié {stats.leadsQualified} prospect{stats.leadsQualified > 1 ? 's' : ''} pour vous.
          </p>
        </div>
        <div className="s-toggle"><span className="s-sw" />Sara répond automatiquement</div>
      </div>

      {/* KPIs */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="s-card">
          <div className="s-kpi-top">
            <span className="s-kpi-lbl">Nouveaux prospects (mois)</span>
            <span className="s-kpi-ic s-i-blue"><Users /></span>
          </div>
          <div className="s-kpi-val s-mono">{leadsThisMonth}</div>
          <div className="s-kpi-sub">
            {delta != null ? <><span className="s-up">{delta >= 0 ? '↑' : '↓'} {Math.abs(delta)}%</span> vs mois dernier</> : 'ce mois-ci'}
          </div>
        </div>
        <div className="s-card">
          <div className="s-kpi-top">
            <span className="s-kpi-lbl">Qualifiés par Sara</span>
            <span className="s-kpi-ic s-i-green"><BadgeCheck /></span>
          </div>
          <div className="s-kpi-val s-mono">{stats.leadsQualified}</div>
          <div className="s-kpi-sub">budget · zone · superficie</div>
        </div>
        <div className="s-card">
          <div className="s-kpi-top">
            <span className="s-kpi-lbl">Taux de réponse</span>
            <span className="s-kpi-ic s-i-green"><MessageSquare /></span>
          </div>
          <div className="s-kpi-val s-mono">100%</div>
          <div className="s-kpi-sub">aucun client sans réponse</div>
        </div>
        <div className="s-card">
          <div className="s-kpi-top">
            <span className="s-kpi-lbl">Temps de réponse moyen</span>
            <span className="s-kpi-ic s-i-gold"><Clock /></span>
          </div>
          <div className="s-kpi-val s-mono">&lt; 1 s</div>
          <div className="s-kpi-sub">jour &amp; nuit</div>
        </div>
      </section>

      {/* Alerte vérification */}
      {stats.landsToVerify > 0 && (
        <Link
          href="/terrains?verificationStatus=a_verifier"
          className="s-card flex items-start gap-3 hover:border-amber-500/40 transition-colors group"
          style={{ borderColor: 'rgba(226,165,63,.25)' }}
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0" style={{ color: 'var(--s-gold)' }} />
          <div className="flex-1">
            <p className="text-sm font-semibold" style={{ color: 'var(--s-txt)' }}>
              {stats.landsToVerify} terrain{stats.landsToVerify > 1 ? 's' : ''} en attente de vérification
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--s-mut)' }}>
              Notre notaire partenaire va procéder au contrôle à la Conservation Foncière.
            </p>
          </div>
          <ArrowRight size={15} className="mt-0.5 shrink-0 group-hover:translate-x-0.5 transition-transform" style={{ color: 'var(--s-gold)' }} />
        </Link>
      )}

      {/* Prospects + activité Sara */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Table prospects */}
        <div className="s-card lg:col-span-2 overflow-x-auto">
          <div className="s-sec-h">
            <div className="s-sec-t">Prospects qualifiés par Sara</div>
            <Link href="/clients" className="s-link">Tout voir <ArrowRight size={12} /></Link>
          </div>
          {topLeads.length > 0 ? (
            <table className="s-table">
              <thead>
                <tr>
                  <th>Prospect</th>
                  <th>Budget</th>
                  <th>Zone</th>
                  <th>Terrain proposé</th>
                  <th>Statut</th>
                  <th>Intérêt</th>
                </tr>
              </thead>
              <tbody>
                {topLeads.map((lead, i) => {
                  const p = PIPELINE[lead.status];
                  const land = lead.interestedLandId ? landsMap[lead.interestedLandId] : undefined;
                  const badge = land ? foncierBadge(land) : null;
                  return (
                    <tr key={lead.id}>
                      <td>
                        <Link href={`/clients/${lead.id}`} className="s-pr">
                          <div className="s-av" style={{ width: 30, height: 30, fontSize: 11, background: AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length] }}>
                            {initials(lead.name)}
                          </div>
                          <div>
                            <div className="s-nm">{lead.name ?? 'Inconnu'}</div>
                            {lead.phone && <div className="s-ph">{maskPhone(lead.phone)}</div>}
                          </div>
                        </Link>
                      </td>
                      <td className="s-mono">{lead.budgetFcfa ? formatFcfa(lead.budgetFcfa) : '—'}</td>
                      <td>{lead.desiredZone ?? '—'}</td>
                      <td>
                        {land ? (
                          <>
                            <div style={{ fontWeight: 500 }}>{land.zone}</div>
                            {badge && <span className={`s-stt ${badge.cls}`}>{badge.label}</span>}
                          </>
                        ) : <span style={{ color: 'var(--s-mut)' }}>—</span>}
                      </td>
                      <td><span className={`s-pill ${p.pillCls}`}>{p.pill}</span></td>
                      <td><span className={`s-score ${p.scoreCls}`}>{p.score}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p className="text-sm py-6 text-center" style={{ color: 'var(--s-mut)' }}>
              Aucun prospect pour l&apos;instant — Sara les ajoutera ici dès les premiers messages WhatsApp.
            </p>
          )}
        </div>

        {/* Activité Sara */}
        <div className="s-card">
          <div className="s-sara-head">
            <div className="s-av">S<span className="s-on" /></div>
            <div>
              <div className="s-nm">Sara</div>
              <div className="s-st">● En ligne · réponse &lt; 1 s</div>
            </div>
          </div>
          <div className="s-act"><div className="s-t">A qualifié <b>{stats.leadsQualified} prospects</b></div><div className="s-ti">budget · zone · m²</div></div>
          <div className="s-act"><div className="s-t">A présenté <b>{recentLands.length} fiches terrain</b></div><div className="s-ti">photos + statut foncier</div></div>
          <div className="s-act"><div className="s-t">A planifié <b>{upcomingVisits.length} visites</b></div><div className="s-ti">à venir</div></div>
          <div className="s-act"><div className="s-t">A transféré <b>{transferred} prospects</b> sérieux</div><div className="s-ti">vers vous · prêts à acheter</div></div>
          <div className="s-act"><div className="s-t">Répond <b>jour &amp; nuit</b></div><div className="s-ti">aucun client sans réponse</div></div>
        </div>
      </div>

      {/* Graphe semaine + terrains */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Graphe semaine */}
        <div className="s-card">
          <div className="s-sec-h">
            <div className="s-sec-t">Prospects qualifiés cette semaine</div>
            <div className="s-sec-s">{weekTotal} au total</div>
          </div>
          <div className="s-chart">
            {week.map((n, i) => (
              <div className="s-col" key={i}>
                <span className="s-n">{n}</span>
                <div className="s-bar" style={{ height: `${Math.round((n / weekMax) * 100)}%` }} />
                <span className="s-d">{WEEKDAYS[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Terrains */}
        <div className="s-card">
          <div className="s-sec-h">
            <div className="s-sec-t">Mes terrains</div>
            <Link href="/terrains" className="s-link">Gérer <ArrowRight size={12} /></Link>
          </div>
          {topLands.length > 0 ? topLands.map(land => {
            const badge = foncierBadge(land);
            const n = interestedCount(land.id);
            return (
              <Link key={land.id} href={`/terrains/${land.id}`} className="s-terr-row">
                <div className="s-terr-thumb" />
                <div className="min-w-0">
                  <div className="s-nm">
                    {land.zone}
                    <span className={`s-stt ${badge.cls}`} style={{ marginTop: 0 }}>{badge.label}</span>
                  </div>
                  <div className="s-meta">
                    {land.surface ? `${land.surface} m² · ` : ''}{n} prospect{n > 1 ? 's' : ''} intéressé{n > 1 ? 's' : ''}
                  </div>
                </div>
                <div className="s-price">
                  <div className="s-p s-mono">{land.priceFcfa.toLocaleString('fr-FR')}</div>
                  <div className="s-c">FCFA</div>
                </div>
              </Link>
            );
          }) : (
            <p className="text-sm py-6 text-center" style={{ color: 'var(--s-mut)' }}>
              Aucun terrain publié.{' '}
              <Link href="/terrains/nouveau" className="s-link" style={{ display: 'inline' }}>En ajouter un</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
