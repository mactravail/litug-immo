import { ShieldCheck, ScrollText } from 'lucide-react';

/**
 * Escrow trust note — funds are custodied by the notaire/partner bank,
 * never on Litug's accounts (mustaf.md §7.1).
 */
export function EscrowNote({ custodianName }: { custodianName: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-accent/15 bg-accent-light/60 px-4 py-3">
      <ShieldCheck size={18} className="text-accent mt-0.5 shrink-0" />
      <p className="text-xs text-text leading-relaxed">
        Fonds bloqués chez <span className="font-semibold">{custodianName}</span> — jamais sur les
        comptes de Litug. Ils ne sont débloqués qu’après vérification d’un inspecteur indépendant.
      </p>
    </div>
  );
}

/**
 * Legal disclaimer rendered on every contributions view (mustaf.md §2.6) —
 * participation %, never ownership shares.
 */
export function ContributionsDisclaimer() {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-line bg-paper-2/60 px-4 py-3">
      <ScrollText size={18} className="text-muted mt-0.5 shrink-0" />
      <p className="text-xs text-muted leading-relaxed">
        Ceci est un relevé des <span className="font-semibold text-text">contributions</span>, pas un
        titre de propriété. La propriété est établie par <span className="font-semibold text-text">acte notarié</span>.
      </p>
    </div>
  );
}
