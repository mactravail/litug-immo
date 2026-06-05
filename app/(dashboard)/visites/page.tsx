import { CalendarDays, MapPin, User, Clock, CheckCheck, XCircle, ThumbsUp, History } from 'lucide-react';
import { getDataProvider } from '@/lib/data/provider';
import { getAuthenticatedSellerId } from '@/lib/supabase-server';
import { PageHeader } from '@/components/ui/PageHeader';
import { VisitCalendar } from './VisitCalendar';
import { AddVisitModal } from './AddVisitModal';
import { VisitActions } from './VisitActions';
import { formatVisitDate, formatTime, isUpcoming, isoDateOnly } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { Visit, Land, Lead } from '@/lib/data/types';

const STATUS_CONFIG = {
  planifiee: { label: 'À venir',     bg: 'bg-sky-50',      text: 'text-sky-700',    dot: 'bg-sky-400' },
  confirmee: { label: 'Confirmée',   bg: 'bg-accent-light', text: 'text-accent',    dot: 'bg-accent' },
  annulee:   { label: 'Annulée',     bg: 'bg-red-50',      text: 'text-red-600',    dot: 'bg-red-400' },
  effectuee: { label: 'Effectuée',   bg: 'bg-stone-100',   text: 'text-stone-500',  dot: 'bg-stone-400' },
};

function VisitCard({ visit, land, lead }: { visit: Visit; land?: Land; lead?: Lead }) {
  const cfg = STATUS_CONFIG[visit.status];
  const upcoming = isUpcoming(visit.visitDate);

  return (
    <div className={cn(
      'bg-white rounded-2xl border shadow-sm p-5 space-y-4',
      upcoming ? 'border-stone-100' : 'border-stone-50 opacity-75'
    )}>
      {/* En-tête : date + statut */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-text capitalize">
            {formatVisitDate(visit.visitDate)}
          </p>
          <p className="flex items-center gap-1.5 text-xs text-muted mt-0.5">
            <Clock size={11} />
            {formatTime(visit.visitDate)}
          </p>
        </div>
        <span className={cn('inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full shrink-0', cfg.bg, cfg.text)}>
          <span className={cn('w-1.5 h-1.5 rounded-full', cfg.dot)} />
          {cfg.label}
        </span>
      </div>

      {/* Terrain + client */}
      <div className="space-y-2">
        {land && (
          <div className="flex items-center gap-2 text-sm text-text">
            <MapPin size={13} className="text-muted shrink-0" />
            <span className="font-medium truncate">{land.title}</span>
            <span className="text-muted text-xs shrink-0">— {land.zone}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-muted">
          <User size={13} className="shrink-0" />
          <span>{lead?.name ?? 'Visite sans client'}</span>
          {lead?.phone && <span className="text-xs">· {lead.phone}</span>}
        </div>
      </div>

      {/* Notes */}
      {visit.notes && (
        <p className="text-xs text-muted bg-stone-50 rounded-xl px-3 py-2 leading-relaxed">
          {visit.notes}
        </p>
      )}

      {/* Actions */}
      <VisitActions visitId={visit.id} status={visit.status} />
    </div>
  );
}

export default async function VisitesPage() {
  const sellerId = await getAuthenticatedSellerId();
  const dp = getDataProvider();
  const [visits, lands, leads] = await Promise.all([
    dp.listVisits(sellerId),
    dp.listLands(sellerId),
    dp.listLeads(sellerId),
  ]);

  const landsMap = Object.fromEntries(lands.map(l => [l.id, l]));
  const leadsMap = Object.fromEntries(leads.map(l => [l.id, l]));

  const upcoming = visits.filter(v => isUpcoming(v.visitDate) && v.status !== 'annulee');
  const past     = visits.filter(v => !isUpcoming(v.visitDate) || v.status === 'annulee');

  const visitDates = upcoming.map(v => isoDateOnly(v.visitDate));

  return (
    <div>
      <PageHeader
        title="Visites"
        action={<AddVisitModal lands={lands} leads={leads} />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche : calendrier */}
        <div className="space-y-4">
          <VisitCalendar visitDates={visitDates} />

          {/* Compteurs rapides */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 grid grid-cols-2 gap-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-text">{upcoming.length}</p>
              <p className="text-xs text-muted mt-0.5">À venir</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-text">
                {visits.filter(v => v.status === 'confirmee').length}
              </p>
              <p className="text-xs text-muted mt-0.5">Confirmées</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-text">
                {visits.filter(v => v.status === 'effectuee').length}
              </p>
              <p className="text-xs text-muted mt-0.5">Effectuées</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-text">
                {visits.filter(v => v.status === 'annulee').length}
              </p>
              <p className="text-xs text-muted mt-0.5">Annulées</p>
            </div>
          </div>
        </div>

        {/* Colonne droite : listes */}
        <div className="lg:col-span-2 space-y-8">
          {/* Prochaines visites */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <CalendarDays size={16} className="text-accent" />
              <h2 className="font-serif text-lg font-semibold text-text">Prochaines visites</h2>
              {upcoming.length > 0 && (
                <span className="text-xs font-semibold bg-accent text-white px-2 py-0.5 rounded-full">
                  {upcoming.length}
                </span>
              )}
            </div>
            {upcoming.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-stone-200 p-8 text-center">
                <CalendarDays size={28} className="text-stone-300 mx-auto mb-2" />
                <p className="text-sm text-muted">Aucune visite planifiée</p>
                <p className="text-xs text-muted mt-1">Cliquez sur « Planifier une visite » pour commencer.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcoming.map(v => (
                  <VisitCard
                    key={v.id}
                    visit={v}
                    land={landsMap[v.landId]}
                    lead={v.leadId ? leadsMap[v.leadId] : undefined}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Visites passées / annulées */}
          {past.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <History size={16} className="text-muted" />
                <h2 className="font-serif text-lg font-semibold text-text">Historique</h2>
              </div>
              <div className="space-y-3">
                {past.map(v => (
                  <VisitCard
                    key={v.id}
                    visit={v}
                    land={landsMap[v.landId]}
                    lead={v.leadId ? leadsMap[v.leadId] : undefined}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
