'use client';

import { useState } from 'react';
import { MapPin, Loader2, Check } from 'lucide-react';

/**
 * Capture géoloc + horodatage du téléphone, posée dans des champs cachés
 * (lat/lng/capturedAt) pour conserver une preuve datée et localisée (§3.11,
 * prompt §2.3). Sans capture, le média/incident reste accepté mais marqué.
 */
export function GeoCapture() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [capturedAt, setCapturedAt] = useState('');

  function capture() {
    if (!navigator.geolocation) { setStatus('error'); return; }
    setStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setCapturedAt(new Date().toISOString());
        setStatus('ok');
      },
      () => setStatus('error'),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  return (
    <div className="space-y-1.5">
      <input type="hidden" name="lat" value={coords?.lat ?? ''} />
      <input type="hidden" name="lng" value={coords?.lng ?? ''} />
      <input type="hidden" name="capturedAt" value={capturedAt} />
      <button
        type="button"
        onClick={capture}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-accent border border-accent/30 bg-accent-light px-3 py-2 rounded-lg hover:bg-accent/10 transition-colors cursor-pointer"
      >
        {status === 'loading' ? <Loader2 size={13} className="animate-spin" /> : status === 'ok' ? <Check size={13} /> : <MapPin size={13} />}
        {status === 'ok' ? 'Position enregistrée' : 'Enregistrer ma position'}
      </button>
      {status === 'ok' && coords && (
        <p className="text-[11px] text-emerald-700">📍 {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)} · horodaté</p>
      )}
      {status === 'error' && (
        <p className="text-[11px] text-amber-600">Position indisponible — le signalement sera accepté mais marqué « sans géoloc ».</p>
      )}
    </div>
  );
}
