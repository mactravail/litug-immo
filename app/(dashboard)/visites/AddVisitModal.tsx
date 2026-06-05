'use client';

import { useState, useTransition } from 'react';
import { X, CalendarPlus } from 'lucide-react';
import type { Land, Lead } from '@/lib/data/types';
import { createVisit } from '@/app/actions';

interface Props {
  lands: Land[];
  leads: Lead[];
}

export function AddVisitModal({ lands, leads }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const [landId, setLandId] = useState('');
  const [leadId, setLeadId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');

  function resetForm() {
    setLandId(''); setLeadId(''); setDate(''); setTime(''); setNotes('');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!landId || !date || !time) return;
    startTransition(async () => {
      await createVisit({
        landId,
        leadId: leadId || undefined,
        visitDate: `${date}T${time}:00`,
        notes: notes.trim() || undefined,
        status: 'planifiee',
      });
      setOpen(false);
      resetForm();
    });
  }

  const minDate = new Date().toISOString().slice(0, 10);
  const activeLands = lands.filter(l => l.saleStatus !== 'vendu');

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 bg-accent text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-accent/90 transition-colors"
      >
        <CalendarPlus size={16} />
        Planifier une visite
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-stone-900/30 backdrop-blur-sm"
            onClick={() => { setOpen(false); resetForm(); }}
          />
          <div className="relative bg-white rounded-t-3xl sm:rounded-2xl shadow-xl w-full sm:max-w-md p-6 space-y-5 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl font-semibold text-text">Planifier une visite</h2>
              <button
                onClick={() => { setOpen(false); resetForm(); }}
                className="p-1.5 rounded-lg hover:bg-stone-50 text-muted transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Terrain */}
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                  Terrain <span className="text-red-500">*</span>
                </label>
                <select
                  value={landId}
                  onChange={e => setLandId(e.target.value)}
                  required
                  className="w-full border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm text-text bg-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/10"
                >
                  <option value="">Sélectionner un terrain…</option>
                  {activeLands.map(l => (
                    <option key={l.id} value={l.id}>{l.title} — {l.zone}</option>
                  ))}
                </select>
              </div>

              {/* Client */}
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                  Client (optionnel)
                </label>
                <select
                  value={leadId}
                  onChange={e => setLeadId(e.target.value)}
                  className="w-full border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm text-text bg-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/10"
                >
                  <option value="">Aucun client lié</option>
                  {leads.map(l => (
                    <option key={l.id} value={l.id}>
                      {l.name ?? 'Client inconnu'}{l.phone ? ` — ${l.phone}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date + Heure */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    required
                    min={minDate}
                    className="w-full border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm text-text bg-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/10"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                    Heure <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    required
                    className="w-full border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm text-text bg-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/10"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                  Notes (optionnel)
                </label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Point de rendez-vous, instructions particulières…"
                  className="w-full border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm text-text bg-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={pending || !landId || !date || !time}
                className="w-full bg-accent text-white text-sm font-semibold px-4 py-3 rounded-xl hover:bg-accent/90 transition-colors disabled:opacity-50"
              >
                {pending ? 'Enregistrement…' : 'Planifier la visite'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
