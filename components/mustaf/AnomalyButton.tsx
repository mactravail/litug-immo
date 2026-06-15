'use client';

import { useEffect, useState } from 'react';
import { Flag, Check, TriangleAlert, Send, X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * One-click anomaly flag (mustaf.md §6, §8.4 — le client est un auditeur libre).
 *
 * Au clic, on n'envoie plus directement : on ouvre une modale où le client
 * choisit le TYPE d'anomalie (+ détail facultatif) avant de transmettre au
 * siège. Mock-first : pas de persistance, on confirme juste « Transmis au siège ».
 *
 * - `variant="topbar"` : bouton proéminent du thème sombre (`.m-btn-anom`).
 * - `variant="inline"` (défaut) : lien discret réutilisé sur chaque ligne.
 * - Sur mobile, le déclencheur n'affiche QUE l'icône ; le libellé apparaît à
 *   partir de `sm:` et dans la modale.
 */

type AnomalyTarget = 'expense' | 'media' | 'phase' | 'general';

const TYPES_BY_TARGET: Record<AnomalyTarget, string[]> = {
  expense: [
    'Montant qui me paraît trop élevé',
    'Facture manquante ou douteuse',
    'Dépense que je ne reconnais pas',
    'Autre',
  ],
  media: [
    'Photo sans date ni position GPS',
    'La photo ne correspond pas à mon chantier',
    'Avancement qui paraît douteux',
    'Autre',
  ],
  phase: [
    'Travaux non conformes au devis',
    'Retard non expliqué',
    'Problème de qualité (béton, ferraillage…)',
    'Autre',
  ],
  general: [
    'Montant ou facture suspect',
    'Travaux non conformes ou non réalisés',
    'Problème de qualité des matériaux',
    'Autre',
  ],
};

export function AnomalyButton({
  label = 'Signaler une anomalie',
  className,
  variant = 'inline',
  target = 'general',
}: {
  label?: string;
  className?: string;
  variant?: 'inline' | 'topbar';
  target?: AnomalyTarget;
}) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<string | null>(null);
  const [detail, setDetail] = useState('');
  const [sent, setSent] = useState(false);

  // Verrouille le scroll de la page + ferme à la touche Échap pendant l'ouverture.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const openModal = () => {
    setType(null);
    setDetail('');
    setOpen(true);
  };

  const submit = () => {
    if (!type) return;
    setOpen(false);
    setSent(true);
  };

  // ---- Déclencheur ----
  let trigger: React.ReactNode;
  if (variant === 'topbar') {
    trigger = sent ? (
      <span className={cn('m-pill m-ok inline-flex items-center gap-1.5', className)}>
        <Check size={13} />
        Transmis au siège
      </span>
    ) : (
      <button
        type="button"
        onClick={openModal}
        aria-label={label}
        title={label}
        className={cn('m-btn-anom', className)}
      >
        <TriangleAlert size={15} />
        <span className="hidden sm:inline">{label}</span>
      </button>
    );
  } else {
    trigger = sent ? (
      <span className={cn('inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600', className)}>
        <Check size={13} />
        Transmis au siège
      </span>
    ) : (
      <button
        type="button"
        onClick={openModal}
        aria-label={label}
        title={label}
        className={cn(
          'inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted hover:text-red-500 transition-colors cursor-pointer',
          className,
        )}
      >
        <Flag size={13} />
        <span className="hidden sm:inline">{label}</span>
      </button>
    );
  }

  return (
    <>
      {trigger}

      {open && (
        <div
          className="m-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Signaler une anomalie"
          onClick={() => setOpen(false)}
        >
          <div className="m-modal" onClick={(e) => e.stopPropagation()}>
            <div className="m-modal-grip" />

            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="m-modal-title">
                  <TriangleAlert size={18} />
                  Signaler une anomalie
                </p>
                <p className="m-modal-sub">Quel type de problème souhaitez-vous signaler&nbsp;?</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fermer"
                className="m-icon-btn shrink-0"
              >
                <X />
              </button>
            </div>

            <div className="mt-4 space-y-2">
              {TYPES_BY_TARGET[target].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={cn('m-opt', type === t && 'm-opt-sel')}
                >
                  <span className="m-opt-rd" />
                  {t}
                </button>
              ))}
            </div>

            <textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="Détails (facultatif) — décrivez ce que vous avez remarqué."
              className="m-ta mt-3"
            />

            <div className="mt-4 space-y-2">
              <button type="button" onClick={submit} disabled={!type} className="m-modal-send">
                <Send size={15} />
                Envoyer au siège
              </button>
              <button type="button" onClick={() => setOpen(false)} className="m-modal-cancel">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
