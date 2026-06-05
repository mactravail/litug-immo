'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn, isoDateOnly } from '@/lib/utils';

const JOURS = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];
const MOIS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

interface Props {
  visitDates: string[];
}

export function VisitCalendar({ visitDates }: Props) {
  const today = new Date();
  const [month, setMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const visitSet = new Set(visitDates.map(d => isoDateOnly(d)));

  const year = month.getFullYear();
  const mi = month.getMonth();
  const firstDayOfWeek = (new Date(year, mi, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, mi + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const todayStr = isoDateOnly(today.toISOString());

  function ds(day: number) {
    return `${year}-${String(mi + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setMonth(new Date(year, mi - 1, 1))}
          className="p-1.5 rounded-lg hover:bg-stone-50 text-muted hover:text-text transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <p className="font-serif text-base font-semibold text-text capitalize">
          {MOIS[mi]} {year}
        </p>
        <button
          onClick={() => setMonth(new Date(year, mi + 1, 1))}
          className="p-1.5 rounded-lg hover:bg-stone-50 text-muted hover:text-text transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {JOURS.map(j => (
          <div key={j} className="text-center text-[10px] font-semibold text-muted uppercase py-1">
            {j}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const d = ds(day);
          const isToday = d === todayStr;
          const hasVisit = visitSet.has(d);
          return (
            <div key={i} className="flex flex-col items-center py-0.5">
              <span className={cn(
                'w-7 h-7 flex items-center justify-center rounded-full text-sm transition-colors',
                isToday
                  ? 'bg-accent text-white font-semibold'
                  : 'text-text'
              )}>
                {day}
              </span>
              {hasVisit && (
                <span className={cn(
                  'w-1 h-1 rounded-full mt-0.5',
                  isToday ? 'bg-white' : 'bg-accent'
                )} />
              )}
            </div>
          );
        })}
      </div>

      {/* Légende */}
      <div className="flex items-center gap-3 mt-4 pt-3 border-t border-stone-100">
        <span className="flex items-center gap-1.5 text-xs text-muted">
          <span className="w-2 h-2 rounded-full bg-accent inline-block" />
          Visite planifiée
        </span>
        <span className="flex items-center gap-1.5 text-xs text-muted">
          <span className="w-2 h-2 rounded-full bg-accent inline-block ring-2 ring-accent/30" />
          Aujourd'hui
        </span>
      </div>
    </div>
  );
}
