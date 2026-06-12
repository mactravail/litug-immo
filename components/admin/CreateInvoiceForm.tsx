'use client';

import { useActionState, useMemo, useState } from 'react';
import { Receipt, CheckCircle2, Copy, ExternalLink, FileText } from 'lucide-react';
import { createInvoiceAction } from '@/app/(admin)/admin/factures/actions';
import { INVOICE_RECIPIENT_LABEL } from '@/lib/admin/labels';
import type { BillableParty, InvoiceRecipientType } from '@/lib/admin/types';

const INPUT =
  'w-full border border-stone-200 rounded-xl px-3 py-2 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent';
const LABEL = 'block text-xs font-medium text-text mb-1';

const FCFA_PER_EUR = 655.957;

/** Type de destinataire → onglet du formulaire. `other` = saisie libre. */
const TYPES: InvoiceRecipientType[] = ['seller', 'mustaf', 'employee', 'other'];

/** Libellé de service pré-rempli selon le type (éditable ensuite). */
const DEFAULT_DESCRIPTION: Record<InvoiceRecipientType, string> = {
  seller: 'Abonnement Sara',
  mustaf: 'Prestation Mustaf',
  employee: '',
  other: '',
};

export function CreateInvoiceForm({ parties }: { parties: BillableParty[] }) {
  const [state, action, pending] = useActionState(createInvoiceAction, null);

  const [type, setType] = useState<InvoiceRecipientType>('seller');
  const [refId, setRefId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState(DEFAULT_DESCRIPTION.seller);
  const [copied, setCopied] = useState(false);

  // Parties facturables du type courant (vide en mode « Autre »).
  const options = useMemo(
    () => parties.filter(p => p.type === type),
    [parties, type],
  );

  const eur = useMemo(() => {
    const fcfa = Number.parseInt(amount.replace(/\s/g, ''), 10);
    if (!Number.isFinite(fcfa) || fcfa <= 0) return null;
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(fcfa / FCFA_PER_EUR);
  }, [amount]);

  function selectType(next: InvoiceRecipientType) {
    setType(next);
    setRefId('');
    setName('');
    setEmail('');
    setAmount('');
    setDescription(DEFAULT_DESCRIPTION[next]);
  }

  function selectParty(id: string) {
    setRefId(id);
    const party = parties.find(p => p.refId === id);
    if (!party) return;
    setName(party.name);
    setEmail(party.email ?? '');
    setAmount(party.suggestedAmount ? String(party.suggestedAmount) : '');
    setDescription(prev => prev || DEFAULT_DESCRIPTION[type]);
  }

  // --- Succès : on montre le lien à envoyer au client ---
  if (state?.ok) {
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-2.5 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800">
          <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
          <span>
            Facture {state.number ? <strong>{state.number}</strong> : 'créée'} émise pour <strong>{state.recipientName}</strong>.
            Envoyez-lui le lien de paiement.
          </span>
        </div>

        {state.hostedInvoiceUrl && (
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 space-y-3">
            <p className="text-xs text-muted">Lien de paiement (à régler par le client)</p>
            <p className="text-sm font-mono break-all text-text">{state.hostedInvoiceUrl}</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => { navigator.clipboard?.writeText(state.hostedInvoiceUrl!); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:underline cursor-pointer"
              >
                <Copy size={13} /> {copied ? 'Copié !' : 'Copier le lien'}
              </button>
              <a href={state.hostedInvoiceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:underline">
                <ExternalLink size={13} /> Ouvrir la facture
              </a>
              {state.invoicePdf && (
                <a href={state.invoicePdf} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:underline">
                  <FileText size={13} /> Télécharger le PDF
                </a>
              )}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 text-sm font-semibold border border-stone-200 text-text px-4 py-2.5 rounded-xl hover:bg-stone-50 transition-colors cursor-pointer"
        >
          <Receipt size={15} /> Émettre une autre facture
        </button>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      {/* Champs cachés portant la sélection à l'action serveur */}
      <input type="hidden" name="recipientType" value={type} />
      <input type="hidden" name="subjectId" value={type === 'other' ? '' : refId} />

      {/* Type de destinataire */}
      <div>
        <span className={LABEL}>Qui facturer&nbsp;?</span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {TYPES.map(t => (
            <button
              key={t}
              type="button"
              onClick={() => selectType(t)}
              className={`text-xs font-medium px-3 py-2 rounded-xl border transition-colors cursor-pointer ${
                type === t ? 'bg-accent text-white border-accent' : 'border-stone-200 text-muted hover:bg-stone-50'
              }`}
            >
              {INVOICE_RECIPIENT_LABEL[t]}
            </button>
          ))}
        </div>
      </div>

      {/* Sélection d'une partie connue (sauf en mode « Autre ») */}
      {type !== 'other' && (
        <div>
          <label className={LABEL} htmlFor="party">Destinataire</label>
          <select id="party" value={refId} onChange={e => selectParty(e.target.value)} className={INPUT}>
            <option value="">Choisir…</option>
            {options.map(p => (
              <option key={p.refId} value={p.refId}>{p.name} — {p.detail}</option>
            ))}
          </select>
          {options.length === 0 && (
            <p className="text-[11px] text-muted mt-1">Aucun destinataire de ce type. Utilisez « Autre destinataire ».</p>
          )}
        </div>
      )}

      {/* Nom + email (pré-remplis si la partie est connue, toujours éditables) */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={LABEL} htmlFor="recipientName">Nom du destinataire</label>
          <input id="recipientName" name="recipientName" type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="ex. Teranga Immobilier" className={INPUT} />
        </div>
        <div>
          <label className={LABEL} htmlFor="recipientEmail">Email (reçoit la facture)</label>
          <input id="recipientEmail" name="recipientEmail" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="client@exemple.com" className={INPUT} />
        </div>
      </div>

      {/* Service facturé */}
      <div>
        <label className={LABEL} htmlFor="description">Service facturé</label>
        <input id="description" name="description" type="text" required value={description} onChange={e => setDescription(e.target.value)} placeholder="ex. Abonnement Sara — juin 2026" className={INPUT} />
      </div>

      {/* Montant FCFA + équivalent € */}
      <div>
        <label className={LABEL} htmlFor="amount">Montant (FCFA)</label>
        <input id="amount" name="amount" type="text" inputMode="numeric" required value={amount} onChange={e => setAmount(e.target.value.replace(/[^\d\s]/g, ''))} placeholder="ex. 50000" className={INPUT} />
        <p className="text-[11px] text-muted mt-1">
          {eur ? <>Soit environ <strong>{eur}</strong> facturés (le débit se fait en EUR, mode test).</> : 'Le client est débité en EUR (le XOF n’est pas débitable). Mode test : aucun encaissement réel.'}
        </p>
      </div>

      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 text-sm font-semibold bg-accent text-white px-4 py-2.5 rounded-xl hover:bg-accent-bright transition-colors cursor-pointer disabled:opacity-60"
        >
          <Receipt size={15} />
          {pending ? 'Émission…' : 'Émettre la facture'}
        </button>
        {state?.error && <span className="text-xs text-red-600">{state.error}</span>}
      </div>
    </form>
  );
}
