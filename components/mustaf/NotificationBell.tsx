'use client';

import { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { Bell, Camera, FileText, Wallet, Check } from 'lucide-react';
import type { ProjectNotification, NotificationKind } from '@/lib/mustaf/types';
import { formatDateShort, cn } from '@/lib/utils';

/**
 * Cloche de notifications client (espace Mustaf, thème sombre).
 *
 * Le client suit son projet de loin : on l'avertit dès qu'un événement le
 * concerne — nouvelle photo géolocalisée du chantier, nouvelle facture
 * fournisseur, dépôt confirmé sur le séquestre. Les événements viennent du
 * provider (mock-first). L'état « lu » est gardé côté navigateur (localStorage),
 * en attendant un vrai store de notifications par utilisateur.
 */

const SEEN_KEY = 'litug:mustaf:notif-seen';
const SEEN_EVENT = 'litug:mustaf:notif-seen-change';

const ICON: Record<NotificationKind, typeof Bell> = {
  media: Camera,
  invoice: FileText,
  deposit: Wallet,
};

// --- « Lu jusqu'à » : un simple horodatage, lu/écrit dans localStorage et
//     partagé via useSyncExternalStore (évite tout mismatch d'hydratation). ---
function readSeen(): number {
  const raw = Number(window.localStorage.getItem(SEEN_KEY) ?? 0);
  return Number.isFinite(raw) ? raw : 0;
}
function writeSeen(value: number) {
  try {
    window.localStorage.setItem(SEEN_KEY, String(value));
  } catch {
    /* stockage indisponible (navigation privée) — la pastille reste affichée */
  }
  window.dispatchEvent(new Event(SEEN_EVENT));
}
function subscribeSeen(cb: () => void) {
  window.addEventListener(SEEN_EVENT, cb);
  window.addEventListener('storage', cb);
  return () => {
    window.removeEventListener(SEEN_EVENT, cb);
    window.removeEventListener('storage', cb);
  };
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `il y a ${d} j`;
  return formatDateShort(iso);
}

export function NotificationBell({ notifications }: { notifications: ProjectNotification[] }) {
  const [open, setOpen] = useState(false);

  // Avant l'hydratation (SSR + 1er rendu client) on renvoie +∞ : tout est
  // considéré « lu » → aucune pastille trompeuse. Une fois monté, on lit la
  // vraie valeur en localStorage et la pastille apparaît si besoin.
  const lastSeen = useSyncExternalStore(subscribeSeen, readSeen, () => Number.POSITIVE_INFINITY);

  const ts = (iso: string) => new Date(iso).getTime();
  const unread = notifications.filter(n => ts(n.createdAt) > lastSeen).length;

  const markRead = () => {
    const newest = notifications.reduce((max, n) => Math.max(max, ts(n.createdAt)), 0);
    writeSeen(newest);
  };

  const close = () => {
    setOpen(false);
    markRead();
  };

  return (
    <div className="m-notif">
      <button
        type="button"
        onClick={() => (open ? close() : setOpen(true))}
        aria-label={`Notifications${unread ? ` (${unread} non lues)` : ''}`}
        aria-expanded={open}
        className="m-icon-btn"
      >
        <Bell />
        {unread > 0 && <span className="m-notif-dot">{unread > 9 ? '9+' : unread}</span>}
      </button>

      {open && (
        <>
          {/* clic en dehors → ferme */}
          <div className="fixed inset-0 z-[55]" onClick={close} />

          <div className="m-notif-panel" role="dialog" aria-label="Notifications">
            <div className="m-notif-head">
              <span className="m-t">Notifications</span>
              <button type="button" onClick={markRead} disabled={unread === 0} className="m-notif-mark">
                Tout marquer comme lu
              </button>
            </div>

            {notifications.length === 0 ? (
              <p className="m-notif-empty">Aucune notification pour le moment.</p>
            ) : (
              <div className="m-notif-list">
                {notifications.map(n => {
                  const Icon = ICON[n.kind];
                  const isNew = ts(n.createdAt) > lastSeen;
                  return (
                    <Link
                      key={n.id}
                      href={n.href}
                      onClick={close}
                      className={cn('m-notif-item', isNew && 'm-new')}
                    >
                      <span className={cn('m-notif-ic', `m-${n.kind}`)}>
                        <Icon />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="m-notif-tt">
                          {isNew && <span className="m-notif-new-dot" aria-hidden />}
                          {n.title}
                        </span>
                        <span className="m-notif-bd block">{n.body}</span>
                        <span className="m-notif-tm block">{timeAgo(n.createdAt)}</span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}

            <Link href="/projet" onClick={close} className="m-notif-foot">
              <Check size={13} /> Voir mon projet
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
